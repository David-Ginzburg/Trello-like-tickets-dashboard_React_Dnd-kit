import { useState, useRef, useEffect, useCallback } from "react";
import {
	PointerSensor,
	useSensor,
	useSensors,
	pointerWithin,
	rectIntersection,
	getFirstCollision,
	type CollisionDetection,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent, DragOverEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ticketApi } from "../../../../shared/api/ticketApi";
import type { Ticket, TicketStatus } from "../../../../entities/ticket/model/types";

interface UseDragAndDropProps {
	tickets: Ticket[];
	selectedTicket: Ticket | null;
	onTicketUpdate: (ticket: Ticket) => void;
	onSelectedTicketUpdate: (ticket: Ticket) => void;
	onTicketsReorder: (ticketIds: string[], updatedTickets?: Ticket[]) => void;
	filter: string;
	isMobile: boolean;
}

export const useDragAndDrop = ({
	tickets,
	selectedTicket,
	onTicketUpdate,
	onSelectedTicketUpdate,
	onTicketsReorder,
	filter,
	isMobile,
}: UseDragAndDropProps) => {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [clonedTickets, setClonedTickets] = useState<Ticket[] | null>(null);
	const recentlyMovedToNewContainer = useRef(false);
	const lastOverId = useRef<string | null>(null);
	const lastReorderedIds = useRef<string[] | null>(null);
	const lastTargetIndex = useRef<number | null>(null);
	const lastTargetContainer = useRef<TicketStatus | null>(null);

	// Disable drag-and-drop when filter has any characters or on mobile devices
	const isDragDisabled = filter.trim().length > 0 || isMobile;

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 10,
			},
			// Disable sensor when filter is active
			disabled: isDragDisabled,
		})
	);

	// Custom collision detection strategy optimized for multiple containers
	const collisionDetectionStrategy: CollisionDetection = useCallback(
		(args) => {
			if (activeId) {
				// Use clonedTickets to get the original ticket status
				// This is important because tickets may contain temporarily modified status
				const originalTicket = clonedTickets?.find((t) => t.id === activeId);
				if (originalTicket) {
					// Start by finding any intersecting droppable
					const pointerIntersections = pointerWithin(args);
					const intersections =
						pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args);
					const overId = getFirstCollision(intersections, "id") as string | null;

					if (overId != null) {
						// Check if it's a column status
						if (
							overId === "ai_resolved" ||
							overId === "pending_approval" ||
							overId === "escalated"
						) {
							// For non-pending_approval tickets, only allow their own column
							// Use originalTicket.status instead of activeTicket.status
							if (
								originalTicket.status !== "pending_approval" &&
								overId !== originalTicket.status
							) {
								// Don't allow moving to another column
								return lastOverId.current ? [{ id: lastOverId.current }] : [];
							}
							lastOverId.current = overId;
							return [{ id: overId }];
						}

						// Check if it's a ticket - return it directly
						// Use clonedTickets to determine the status of the card we're hovering over
						const overTicket =
							clonedTickets?.find((t) => t.id === overId) || tickets.find((t) => t.id === overId);
						if (overTicket) {
							// For non-pending_approval tickets, only allow their own column
							// Use originalTicket.status instead of activeTicket.status
							if (
								originalTicket.status !== "pending_approval" &&
								overTicket.status !== originalTicket.status
							) {
								// Don't allow moving to another column
								return lastOverId.current ? [{ id: lastOverId.current }] : [];
							}
							lastOverId.current = overId;
							return [{ id: overId }];
						}

						lastOverId.current = overId;
						return [{ id: overId }];
					}
				}
			}

			// When a draggable item moves to a new container, the layout may shift
			if (recentlyMovedToNewContainer.current) {
				lastOverId.current = activeId;
			}

			// If no droppable is matched, return the last match
			return lastOverId.current ? [{ id: lastOverId.current }] : [];
		},
		[activeId, tickets, clonedTickets]
	);

	const handleDragStart = (event: DragStartEvent) => {
		// Block drag start if filter is active
		if (isDragDisabled) {
			return;
		}

		const ticketId = event.active.id as string;
		setActiveId(ticketId);
		// Save original state for rollback on cancel
		setClonedTickets([...tickets]);
		recentlyMovedToNewContainer.current = false;
		lastOverId.current = null;
		lastReorderedIds.current = null;
		lastTargetIndex.current = null;
		lastTargetContainer.current = null;
	};

	useEffect(() => {
		requestAnimationFrame(() => {
			recentlyMovedToNewContainer.current = false;
		});
	}, [tickets]);

	const handleDragOver = (event: DragOverEvent) => {
		// Block drag over if filter is active
		if (isDragDisabled) {
			return;
		}

		const { active, over } = event;

		const overId = over?.id as string | null;
		if (overId == null || active.id == null) {
			return;
		}

		const activeId = active.id as string;

		// Ignore case when dragging card over itself
		if (overId === activeId) {
			return;
		}

		// ALWAYS use clonedTickets to get the original status
		// This is critical because tickets may contain temporarily modified status
		// If clonedTickets is not set, dragging hasn't started yet or has already ended
		if (!clonedTickets) {
			return;
		}

		const originalTicket = clonedTickets.find((t) => t.id === activeId);
		if (!originalTicket) {
			return;
		}

		// Save original ticket status (before temporary changes)
		const originalStatus = originalTicket.status;

		// Determine target container
		let overContainer: TicketStatus | null = null;
		if (overId === "ai_resolved" || overId === "pending_approval" || overId === "escalated") {
			overContainer = overId as TicketStatus;
		} else {
			// If dragging over a card, find parent column via DOM
			const overCardElement = document.querySelector(`[data-testid="ticket-card-${overId}"]`);

			if (overCardElement) {
				// Find closest parent element with data-status (column)
				const columnElement = overCardElement.closest("[data-status]");
				if (columnElement) {
					const status = columnElement.getAttribute("data-status") as TicketStatus;
					if (status === "ai_resolved" || status === "pending_approval" || status === "escalated") {
						overContainer = status;
					}
				}
			}

			// If not found via DOM, use clonedTickets to determine status
			// This is important because tickets may contain temporarily modified cards
			if (!overContainer) {
				const overTicket = clonedTickets.find((t) => t.id === overId);
				if (overTicket) {
					overContainer = overTicket.status;
				}
			}
		}

		if (!overContainer) {
			// If we can't determine the column, reset saved values
			// This happens when we drag the card out of the column area
			lastTargetIndex.current = null;
			lastTargetContainer.current = null;
			return;
		}

		// If card is not from pending_approval, only allow reordering within its own column
		if (originalStatus !== "pending_approval") {
			// Check that we're dragging within the same column
			if (overContainer !== originalStatus) {
				return;
			}
		}

		// If dragging between columns (for pending_approval) or within column
		// Use originalStatus instead of activeContainer, as activeContainer may change after state update
		if (originalStatus !== overContainer) {
			// Only allow moving between columns for pending_approval
			if (originalStatus !== "pending_approval") {
				return;
			}

			// ALWAYS use clonedTickets to get the original state
			// This guarantees we work with original state, not temporarily modified one
			const sourceTickets = clonedTickets;

			// Update state directly, as in MultipleContainers example
			// Use originalStatus to filter the source column
			const activeItems = sourceTickets.filter(
				(t) => t.status === originalStatus && t.id !== activeId
			);
			const overItems = sourceTickets.filter(
				(t) => t.status === overContainer && t.id !== activeId
			);

			// Determine insert index
			let newIndex: number;

			if (
				overId === overContainer ||
				overId === "ai_resolved" ||
				overId === "pending_approval" ||
				overId === "escalated"
			) {
				// If dragging over column, insert at the end
				newIndex = overItems.length;
			} else {
				// If dragging over a card, determine position
				const overIndex = overItems.findIndex((t) => t.id === overId);

				if (overIndex >= 0) {
					// Determine if cursor is below or above the card
					const isBelowOverItem =
						over &&
						active.rect.current.translated &&
						active.rect.current.translated.top > over.rect.top + over.rect.height;

					const modifier = isBelowOverItem ? 1 : 0;
					newIndex = overIndex + modifier;
				} else {
					newIndex = overItems.length;
				}
			}

			recentlyMovedToNewContainer.current = true;

			// Check if target column changed BEFORE updating lastTargetContainer
			// This is important for correct containerChanged determination
			const previousContainer = lastTargetContainer.current;
			const containerChanged = previousContainer !== overContainer;

			// ALWAYS form new order for visual effect
			const statusOrder: TicketStatus[] = ["ai_resolved", "pending_approval", "escalated"];
			const reorderedTickets: Ticket[] = [];

			for (const status of statusOrder) {
				if (status === originalStatus) {
					// Remove active card from source column
					reorderedTickets.push(...activeItems);
				} else if (status === overContainer) {
					// Temporarily add active card to target column with new status
					const tempTicket: Ticket = {
						...originalTicket,
						status: overContainer,
					};
					const newOverItems = [
						...overItems.slice(0, newIndex),
						tempTicket,
						...overItems.slice(newIndex),
					];
					reorderedTickets.push(...newOverItems);
				} else {
					// Use sourceTickets to get original state of other columns
					const columnTickets = sourceTickets.filter((t) => t.status === status);
					reorderedTickets.push(...columnTickets);
				}
			}

			const reorderedTicketIds = reorderedTickets.map((t) => t.id);

			// Update state if target column changed
			// This is critical for enabling dragging between different columns
			if (containerChanged) {
				// Update saved values AFTER checking containerChanged
				lastTargetIndex.current = newIndex;
				lastTargetContainer.current = overContainer;
				lastReorderedIds.current = reorderedTicketIds;
				onTicketsReorder(reorderedTicketIds, reorderedTickets);
			} else {
				// If column didn't change, check if index changed
				// Update state only if index actually changed
				const indexChanged = lastTargetIndex.current !== newIndex;

				if (indexChanged) {
					lastTargetIndex.current = newIndex;
					lastTargetContainer.current = overContainer;
					lastReorderedIds.current = reorderedTicketIds;
					onTicketsReorder(reorderedTicketIds, reorderedTickets);
				} else {
					// Index didn't change, just update position tracking
					lastTargetIndex.current = newIndex;
					lastTargetContainer.current = overContainer;
				}
			}
		}
		// For reordering within the same column, useSortable handles visual movement
		// via transform, so we don't need to update state in handleDragOver
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		// Block drag end if filter is active
		if (isDragDisabled) {
			setActiveId(null);
			setClonedTickets(null);
			return;
		}

		const { active, over } = event;

		const activeId = active.id as string;
		const overId = over?.id as string | null;

		if (overId == null) {
			// If drag was cancelled, restore original state
			if (clonedTickets) {
				const clonedTicketIds = clonedTickets.map((t) => t.id);
				// Pass original tickets to restore original state without API call
				onTicketsReorder(clonedTicketIds, clonedTickets);
			}
			setActiveId(null);
			setClonedTickets(null);
			lastReorderedIds.current = null;
			lastTargetIndex.current = null;
			lastTargetContainer.current = null;
			return;
		}

		// Use original ticket status from clonedTickets if available
		// This is important because handleDragOver may have temporarily changed status for visual effect
		const originalTicket =
			clonedTickets?.find((t) => t.id === activeId) || tickets.find((t) => t.id === activeId);
		if (!originalTicket) {
			console.error("Ticket not found:", activeId);
			setActiveId(null);
			setClonedTickets(null);
			return;
		}

		// Use original status to determine source column
		const activeContainer = originalTicket.status;

		// Determine target container
		let overContainer: TicketStatus | null = null;

		if (overId === "ai_resolved" || overId === "pending_approval" || overId === "escalated") {
			// If dragging over column directly
			overContainer = overId as TicketStatus;
		} else {
			// If dragging over a card, need to find parent column
			// Use event.over to get collision information
			// Find card element via data-testid or by ID
			const overCardElement = document.querySelector(`[data-testid="ticket-card-${overId}"]`);

			if (overCardElement) {
				// Find closest parent element with data-status (column)
				const columnElement = overCardElement.closest("[data-status]");
				if (columnElement) {
					const status = columnElement.getAttribute("data-status") as TicketStatus;
					if (status === "ai_resolved" || status === "pending_approval" || status === "escalated") {
						overContainer = status;
					}
				}
			}

			// If not found via DOM, use original tickets as fallback
			// But this may be incorrect if card was temporarily moved
			if (!overContainer) {
				const overTicket = clonedTickets?.find((t) => t.id === overId);
				if (overTicket) {
					// Use original ticket status from clonedTickets
					overContainer = overTicket.status;
				} else {
					// If not found in clonedTickets, search in current tickets
					const currentOverTicket = tickets.find((t) => t.id === overId);
					if (currentOverTicket) {
						overContainer = currentOverTicket.status;
					}
				}
			}
		}

		if (!overContainer) {
			// If we can't determine the column, return card to source column
			if (clonedTickets) {
				const clonedTicketIds = clonedTickets.map((t) => t.id);
				// Pass original tickets to restore original state without API call
				onTicketsReorder(clonedTicketIds, clonedTickets);
			}
			setActiveId(null);
			setClonedTickets(null);
			lastReorderedIds.current = null;
			lastTargetIndex.current = null;
			lastTargetContainer.current = null;
			return;
		}

		// If we drop card in source column after hovering over another column
		// Just restore original state without API call
		if (overContainer === activeContainer) {
			// If we hovered over another column but returned to source, just restore state
			if (lastTargetContainer.current !== null && lastTargetContainer.current !== activeContainer) {
				if (clonedTickets) {
					const clonedTicketIds = clonedTickets.map((t) => t.id);
					// Pass original tickets to restore original state without API call
					onTicketsReorder(clonedTicketIds, clonedTickets);
				}
				setActiveId(null);
				setClonedTickets(null);
				lastReorderedIds.current = null;
				lastTargetIndex.current = null;
				lastTargetContainer.current = null;
				return;
			}
			// Card stays in source column, reset saved values
			lastReorderedIds.current = null;
			lastTargetIndex.current = null;
			lastTargetContainer.current = null;
		}

		// If card is not from pending_approval, only allow reordering within its own column
		if (originalTicket.status !== "pending_approval") {
			// Check that we're dragging within the same column
			if (overContainer !== activeContainer) {
				setActiveId(null);
				setClonedTickets(null);
				return;
			}
		}

		// Get column cards from original state (before temporary changes in handleDragOver)
		const sourceTickets = clonedTickets || tickets;
		const activeItems = sourceTickets.filter((t) => t.status === activeContainer);

		const activeIndex = activeItems.findIndex((t) => t.id === activeId);

		// If moving within the same column
		if (activeContainer === overContainer) {
			// Determine target position index
			let overIndex = -1;

			if (overId === overContainer) {
				// If dragging over column, insert at the end
				overIndex = activeItems.length;
			} else {
				// If dragging over a card, determine its index
				// Use activeItems since we're within the same column
				overIndex = activeItems.findIndex((t) => t.id === overId);

				// If found card, determine position considering cursor
				if (overIndex !== -1) {
					const isBelowOverItem =
						over &&
						active.rect.current.translated &&
						active.rect.current.translated.top > over.rect.top + over.rect.height;

					const modifier = isBelowOverItem ? 1 : 0;
					overIndex = overIndex + modifier;
				} else {
					// If not found, insert at the end
					overIndex = activeItems.length;
				}
			}

			// Check that indices are valid and different
			if (overIndex !== -1 && activeIndex !== overIndex && overIndex >= 0 && activeIndex >= 0) {
				// Reorder cards in column using arrayMove
				// overIndex may be greater than array length (if dragging to end)
				// arrayMove works with array indices, so limit to maximum index
				const targetIndex = Math.min(overIndex, activeItems.length - 1);
				const reorderedSourceTickets = arrayMove(activeItems, activeIndex, targetIndex);

				// Update order of all tickets, preserving order within each column
				const statusOrder: TicketStatus[] = ["ai_resolved", "pending_approval", "escalated"];
				const reorderedTickets: Ticket[] = [];

				for (const status of statusOrder) {
					if (status === activeContainer) {
						reorderedTickets.push(...reorderedSourceTickets);
					} else {
						const columnTickets = sourceTickets.filter((t) => t.status === status);
						reorderedTickets.push(...columnTickets);
					}
				}

				const reorderedTicketIds = reorderedTickets.map((t) => t.id);
				onTicketsReorder(reorderedTicketIds);

				// Save order to backend
				try {
					await ticketApi.reorderTickets(reorderedTicketIds);
				} catch (error) {
					console.error("Failed to save ticket order:", error);
				}
			}
			setActiveId(null);
			setClonedTickets(null);
			return;
		}

		// If moving to another column (only for pending_approval)
		if (originalTicket.status === "pending_approval" && activeContainer !== overContainer) {
			// Check that we're really over target column
			// If lastTargetContainer is not set or doesn't match overContainer, return to source column
			// This means we left column area or weren't over it
			if (lastTargetContainer.current === null || lastTargetContainer.current !== overContainer) {
				if (clonedTickets) {
					const clonedTicketIds = clonedTickets.map((t) => t.id);
					// Pass original tickets to restore original state without API call
					onTicketsReorder(clonedTicketIds, clonedTickets);
				}
				setActiveId(null);
				setClonedTickets(null);
				lastReorderedIds.current = null;
				lastTargetIndex.current = null;
				lastTargetContainer.current = null;
				return;
			}

			// Use index from handleDragOver if available and matches current target column
			let finalInsertIndex: number;

			if (lastTargetIndex.current !== null && lastTargetContainer.current === overContainer) {
				// Use saved index from handleDragOver
				finalInsertIndex = lastTargetIndex.current;
			} else {
				// If index not saved, calculate it again
				// Get target column cards from original state
				const overItems = sourceTickets.filter(
					(t) => t.status === overContainer && t.id !== activeId
				);

				finalInsertIndex = overItems.length;

				if (overId !== overContainer) {
					const overIndexInTarget = overItems.findIndex((t) => t.id === overId);
					if (overIndexInTarget !== -1) {
						const isBelowOverItem =
							over &&
							active.rect.current.translated &&
							active.rect.current.translated.top > over.rect.top + over.rect.height;

						const modifier = isBelowOverItem ? 1 : 0;
						finalInsertIndex = overIndexInTarget + modifier;
					}
				}
			}

			// Optimistic UI update
			const optimisticTicket: Ticket = {
				...originalTicket,
				status: overContainer,
			};

			onTicketUpdate(optimisticTicket);

			if (selectedTicket?.id === activeId) {
				onSelectedTicketUpdate(optimisticTicket);
			}

			try {
				// Use unified handler to move card to another column
				// It will update status and insert card at correct position
				const updatedTickets = await ticketApi.moveTicketToColumn(
					activeId,
					overContainer,
					finalInsertIndex
				);

				// Update local state with server result
				const reorderedTicketIds = updatedTickets.map((t) => t.id);
				onTicketsReorder(reorderedTicketIds, updatedTickets);

				// Update moved ticket
				const movedTicket = updatedTickets.find((t) => t.id === activeId);
				if (movedTicket) {
					onTicketUpdate(movedTicket);
					if (selectedTicket?.id === activeId) {
						onSelectedTicketUpdate(movedTicket);
					}
				}
			} catch (error) {
				console.error("Failed to move ticket:", error);
				// Rollback changes on error
				onTicketUpdate(originalTicket);
				if (selectedTicket?.id === activeId) {
					onSelectedTicketUpdate(originalTicket);
				}
			}
		}

		setActiveId(null);
		setClonedTickets(null);
		lastReorderedIds.current = null;
		lastTargetIndex.current = null;
		lastTargetContainer.current = null;
	};

	const handleDragCancel = () => {
		// Restore original state on drag cancel
		if (clonedTickets) {
			const clonedTicketIds = clonedTickets.map((t) => t.id);
			// Pass original tickets to restore original state without API call
			onTicketsReorder(clonedTicketIds, clonedTickets);
		}
		setActiveId(null);
		setClonedTickets(null);
		lastReorderedIds.current = null;
		lastTargetIndex.current = null;
		lastTargetContainer.current = null;
	};

	const activeTicket = activeId ? tickets.find((ticket) => ticket.id === activeId) : null;

	return {
		sensors,
		activeTicket,
		activeId,
		collisionDetectionStrategy,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	};
};
