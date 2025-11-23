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
}

export const useDragAndDrop = ({
	tickets,
	selectedTicket,
	onTicketUpdate,
	onSelectedTicketUpdate,
	onTicketsReorder,
}: UseDragAndDropProps) => {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [clonedTickets, setClonedTickets] = useState<Ticket[] | null>(null);
	const recentlyMovedToNewContainer = useRef(false);
	const lastOverId = useRef<string | null>(null);
	const lastReorderedIds = useRef<string[] | null>(null);
	const lastTargetIndex = useRef<number | null>(null);
	const lastTargetContainer = useRef<TicketStatus | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 10,
			},
		})
	);

	// Custom collision detection strategy optimized for multiple containers
	const collisionDetectionStrategy: CollisionDetection = useCallback(
		(args) => {
			if (activeId) {
				// Используем clonedTickets для получения исходного статуса карточки
				// Это важно, так как tickets может содержать временно измененный статус
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
							// Для карточек не из pending_approval разрешаем только свою колонку
							// Используем originalTicket.status вместо activeTicket.status
							if (
								originalTicket.status !== "pending_approval" &&
								overId !== originalTicket.status
							) {
								// Не разрешаем перемещение в другую колонку
								return lastOverId.current ? [{ id: lastOverId.current }] : [];
							}
							lastOverId.current = overId;
							return [{ id: overId }];
						}

						// Check if it's a ticket - return it directly
						// Используем clonedTickets для определения статуса карточки, над которой наводим
						const overTicket =
							clonedTickets?.find((t) => t.id === overId) || tickets.find((t) => t.id === overId);
						if (overTicket) {
							// Для карточек не из pending_approval разрешаем только свою колонку
							// Используем originalTicket.status вместо activeTicket.status
							if (
								originalTicket.status !== "pending_approval" &&
								overTicket.status !== originalTicket.status
							) {
								// Не разрешаем перемещение в другую колонку
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
		const ticketId = event.active.id as string;
		setActiveId(ticketId);
		// Сохраняем исходное состояние для отката при отмене
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
		const { active, over } = event;

		const overId = over?.id as string | null;
		if (overId == null || active.id == null) {
			return;
		}

		const activeId = active.id as string;

		// Игнорируем случай, когда перетаскиваем карточку над собой
		if (overId === activeId) {
			return;
		}

		// ВСЕГДА используем clonedTickets для получения исходного статуса
		// Это критически важно, так как tickets может содержать временно измененный статус
		// Если clonedTickets не установлен, значит перетаскивание еще не началось или уже закончилось
		if (!clonedTickets) {
			return;
		}

		const originalTicket = clonedTickets.find((t) => t.id === activeId);
		if (!originalTicket) {
			return;
		}

		// Сохраняем исходный статус карточки (до временных изменений)
		const originalStatus = originalTicket.status;

		// Определяем целевой контейнер
		let overContainer: TicketStatus | null = null;
		console.log("handleDragOver - overId:", overId, "originalStatus:", originalStatus);
		if (overId === "ai_resolved" || overId === "pending_approval" || overId === "escalated") {
			overContainer = overId as TicketStatus;
			console.log("handleDragOver - overContainer from column ID:", overContainer);
		} else {
			// Если перетаскиваем над карточкой, находим родительскую колонку через DOM
			const overCardElement = document.querySelector(`[data-testid="ticket-card-${overId}"]`);

			if (overCardElement) {
				// Ищем ближайший родительский элемент с data-status (колонка)
				const columnElement = overCardElement.closest("[data-status]");
				if (columnElement) {
					const status = columnElement.getAttribute("data-status") as TicketStatus;
					if (status === "ai_resolved" || status === "pending_approval" || status === "escalated") {
						overContainer = status;
						console.log("handleDragOver - overContainer from DOM:", overContainer);
					}
				}
			}

			// Если не нашли через DOM, используем clonedTickets для определения статуса
			// Это важно, так как tickets может содержать временно измененные карточки
			if (!overContainer) {
				const overTicket = clonedTickets.find((t) => t.id === overId);
				if (overTicket) {
					overContainer = overTicket.status;
					console.log("handleDragOver - overContainer from clonedTickets:", overContainer);
				}
			}
		}

		if (!overContainer) {
			console.log("handleDragOver - overContainer not found, resetting target");
			// Если не можем определить колонку, сбрасываем сохраненные значения
			// Это происходит когда выводим карточку из области колонки
			lastTargetIndex.current = null;
			lastTargetContainer.current = null;
			return;
		}

		console.log(
			"handleDragOver - overContainer:",
			overContainer,
			"originalStatus:",
			originalStatus
		);

		// Если карточка не из pending_approval, разрешаем только пересортировку внутри своей колонки
		if (originalStatus !== "pending_approval") {
			// Проверяем, что перетаскиваем внутри той же колонки
			if (overContainer !== originalStatus) {
				console.log("handleDragOver - not pending_approval and different container, returning");
				return;
			}
		}

		// Если перетаскиваем между колонками (для pending_approval) или внутри колонки
		// Используем originalStatus вместо activeContainer, так как activeContainer может измениться после обновления состояния
		if (originalStatus !== overContainer) {
			// Разрешаем перемещение между колонками только для pending_approval
			if (originalStatus !== "pending_approval") {
				console.log("handleDragOver - not pending_approval, returning");
				return;
			}
			console.log("handleDragOver - moving between columns:", originalStatus, "->", overContainer);

			// ВСЕГДА используем clonedTickets для получения исходного состояния
			// Это гарантирует, что мы работаем с исходным состоянием, а не с временно измененным
			const sourceTickets = clonedTickets;

			// Обновляем состояние напрямую, как в примере MultipleContainers
			// Используем originalStatus для фильтрации исходной колонки
			const activeItems = sourceTickets.filter(
				(t) => t.status === originalStatus && t.id !== activeId
			);
			const overItems = sourceTickets.filter(
				(t) => t.status === overContainer && t.id !== activeId
			);

			// Определяем индекс вставки
			let newIndex: number;

			if (
				overId === overContainer ||
				overId === "ai_resolved" ||
				overId === "pending_approval" ||
				overId === "escalated"
			) {
				// Если перетаскиваем над колонкой, вставляем в конец
				newIndex = overItems.length;
				console.log("handleDragOver - dragging over column, newIndex:", newIndex);
			} else {
				// Если перетаскиваем над карточкой, определяем позицию
				const overIndex = overItems.findIndex((t) => t.id === overId);

				if (overIndex >= 0) {
					// Определяем, ниже или выше курсор относительно карточки
					const isBelowOverItem =
						over &&
						active.rect.current.translated &&
						active.rect.current.translated.top > over.rect.top + over.rect.height;

					const modifier = isBelowOverItem ? 1 : 0;
					newIndex = overIndex + modifier;
					console.log("handleDragOver - dragging over card:", {
						overId,
						overIndex,
						isBelowOverItem,
						modifier,
						newIndex,
						overItemsLength: overItems.length,
					});
				} else {
					newIndex = overItems.length;
					console.log("handleDragOver - card not found in overItems, using end:", newIndex);
				}
			}

			recentlyMovedToNewContainer.current = true;

			// Проверяем, изменилась ли целевая колонка ДО обновления lastTargetContainer
			// Это важно для правильного определения containerChanged
			const previousContainer = lastTargetContainer.current;
			const containerChanged = previousContainer !== overContainer;

			console.log("handleDragOver - container check:", {
				previousContainer,
				overContainer,
				containerChanged,
				originalStatus,
			});

			// ВСЕГДА формируем новый порядок для визуального эффекта
			const statusOrder: TicketStatus[] = ["ai_resolved", "pending_approval", "escalated"];
			const reorderedTickets: Ticket[] = [];

			for (const status of statusOrder) {
				if (status === originalStatus) {
					// Удаляем активную карточку из исходной колонки
					reorderedTickets.push(...activeItems);
				} else if (status === overContainer) {
					// Временно добавляем активную карточку в целевую колонку с новым статусом
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
					// Используем sourceTickets для получения исходного состояния других колонок
					const columnTickets = sourceTickets.filter((t) => t.status === status);
					reorderedTickets.push(...columnTickets);
				}
			}

			const reorderedTicketIds = reorderedTickets.map((t) => t.id);

			// Обновляем состояние если изменилась целевая колонка
			// Это критически важно для возможности перетаскивания между разными колонками
			if (containerChanged) {
				console.log("handleDragOver - UPDATING STATE (container changed):", {
					previousContainer,
					newContainer: overContainer,
					reorderedTicketIds: reorderedTicketIds.slice(0, 5) + "...",
				});
				// Обновляем сохраненные значения ПОСЛЕ проверки containerChanged
				lastTargetIndex.current = newIndex;
				lastTargetContainer.current = overContainer;
				lastReorderedIds.current = reorderedTicketIds;
				onTicketsReorder(reorderedTicketIds, reorderedTickets);
			} else {
				// Если колонка не изменилась, проверяем изменился ли индекс
				// Обновляем состояние только если индекс действительно изменился
				const indexChanged = lastTargetIndex.current !== newIndex;

				if (indexChanged) {
					console.log("handleDragOver - updating state (index changed within same container):", {
						overContainer,
						previousIndex: lastTargetIndex.current,
						newIndex,
					});
					lastTargetIndex.current = newIndex;
					lastTargetContainer.current = overContainer;
					lastReorderedIds.current = reorderedTicketIds;
					onTicketsReorder(reorderedTicketIds, reorderedTickets);
				} else {
					// Индекс не изменился, просто обновляем отслеживание позиции
					lastTargetIndex.current = newIndex;
					lastTargetContainer.current = overContainer;
				}
			}
		}
		// Для пересортировки внутри той же колонки useSortable сам обрабатывает визуальное перемещение
		// через transform, поэтому не нужно обновлять состояние в handleDragOver
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		const activeId = active.id as string;
		const overId = over?.id as string | null;

		if (overId == null) {
			// Если отменили перетаскивание, восстанавливаем исходное состояние
			if (clonedTickets) {
				const clonedTicketIds = clonedTickets.map((t) => t.id);
				// Передаем исходные тикеты для восстановления исходного состояния без вызова API
				onTicketsReorder(clonedTicketIds, clonedTickets);
			}
			setActiveId(null);
			setClonedTickets(null);
			lastReorderedIds.current = null;
			lastTargetIndex.current = null;
			lastTargetContainer.current = null;
			return;
		}

		// Используем исходный статус карточки из clonedTickets, если он есть
		// Это важно, так как handleDragOver мог временно изменить статус для визуального эффекта
		const originalTicket =
			clonedTickets?.find((t) => t.id === activeId) || tickets.find((t) => t.id === activeId);
		if (!originalTicket) {
			console.error("Ticket not found:", activeId);
			setActiveId(null);
			setClonedTickets(null);
			return;
		}

		// Используем исходный статус для определения исходной колонки
		const activeContainer = originalTicket.status;

		// Определяем целевой контейнер
		let overContainer: TicketStatus | null = null;

		if (overId === "ai_resolved" || overId === "pending_approval" || overId === "escalated") {
			// Если перетаскиваем над колонкой напрямую
			overContainer = overId as TicketStatus;
		} else {
			// Если перетаскиваем над карточкой, нужно найти родительскую колонку
			// Используем event.over для получения информации о коллизии
			// Ищем элемент карточки через data-testid или по ID
			const overCardElement = document.querySelector(`[data-testid="ticket-card-${overId}"]`);

			if (overCardElement) {
				// Ищем ближайший родительский элемент с data-status (колонка)
				const columnElement = overCardElement.closest("[data-status]");
				if (columnElement) {
					const status = columnElement.getAttribute("data-status") as TicketStatus;
					if (status === "ai_resolved" || status === "pending_approval" || status === "escalated") {
						overContainer = status;
					}
				}
			}

			// Если не нашли через DOM, используем исходные тикеты как fallback
			// Но это может быть неправильно, если карточка была временно перемещена
			if (!overContainer) {
				const overTicket = clonedTickets?.find((t) => t.id === overId);
				if (overTicket) {
					// Используем исходный статус карточки из clonedTickets
					overContainer = overTicket.status;
				} else {
					// Если не нашли в clonedTickets, ищем в текущих тикетах
					const currentOverTicket = tickets.find((t) => t.id === overId);
					if (currentOverTicket) {
						overContainer = currentOverTicket.status;
					}
				}
			}
		}

		console.log(
			"handleDragEnd - overContainer:",
			overContainer,
			"activeContainer:",
			activeContainer,
			"originalTicket.status:",
			originalTicket.status
		);

		if (!overContainer) {
			// Если не можем определить колонку, возвращаем карточку в исходную колонку
			console.log("handleDragEnd - overContainer not found, returning to original container");
			if (clonedTickets) {
				const clonedTicketIds = clonedTickets.map((t) => t.id);
				// Передаем исходные тикеты для восстановления исходного состояния без вызова API
				onTicketsReorder(clonedTicketIds, clonedTickets);
			}
			setActiveId(null);
			setClonedTickets(null);
			lastReorderedIds.current = null;
			lastTargetIndex.current = null;
			lastTargetContainer.current = null;
			return;
		}

		// Если отпускаем карточку в исходной колонке после того, как наводили на другую колонку
		// Нужно просто восстановить исходное состояние без вызова API
		if (overContainer === activeContainer) {
			// Если мы наводили на другую колонку, но вернулись в исходную, просто восстанавливаем состояние
			if (lastTargetContainer.current !== null && lastTargetContainer.current !== activeContainer) {
				console.log(
					"handleDragEnd - returned to original container after hovering over another, restoring state"
				);
				if (clonedTickets) {
					const clonedTicketIds = clonedTickets.map((t) => t.id);
					// Передаем исходные тикеты для восстановления исходного состояния без вызова API
					onTicketsReorder(clonedTicketIds, clonedTickets);
				}
				setActiveId(null);
				setClonedTickets(null);
				lastReorderedIds.current = null;
				lastTargetIndex.current = null;
				lastTargetContainer.current = null;
				return;
			}
			// Карточка остается в исходной колонке, сбрасываем сохраненные значения
			lastReorderedIds.current = null;
			lastTargetIndex.current = null;
			lastTargetContainer.current = null;
		}

		// Если карточка не из pending_approval, разрешаем только пересортировку внутри своей колонки
		if (originalTicket.status !== "pending_approval") {
			// Проверяем, что перетаскиваем внутри той же колонки
			if (overContainer !== activeContainer) {
				setActiveId(null);
				setClonedTickets(null);
				return;
			}
		}

		// Получаем карточки колонок из исходного состояния (до временных изменений в handleDragOver)
		const sourceTickets = clonedTickets || tickets;
		const activeItems = sourceTickets.filter((t) => t.status === activeContainer);

		const activeIndex = activeItems.findIndex((t) => t.id === activeId);

		// Если перемещаем внутри той же колонки
		if (activeContainer === overContainer) {
			// Определяем индекс целевой позиции
			let overIndex = -1;

			if (overId === overContainer) {
				// Если перетаскиваем над колонкой, вставляем в конец
				overIndex = activeItems.length;
			} else {
				// Если перетаскиваем над карточкой, определяем её индекс
				// Используем activeItems, так как мы внутри той же колонки
				overIndex = activeItems.findIndex((t) => t.id === overId);

				// Если нашли карточку, определяем позицию с учетом курсора
				if (overIndex !== -1) {
					const isBelowOverItem =
						over &&
						active.rect.current.translated &&
						active.rect.current.translated.top > over.rect.top + over.rect.height;

					const modifier = isBelowOverItem ? 1 : 0;
					overIndex = overIndex + modifier;
				} else {
					// Если не нашли, вставляем в конец
					overIndex = activeItems.length;
				}
			}

			// Проверяем, что индексы валидны и разные
			if (overIndex !== -1 && activeIndex !== overIndex && overIndex >= 0 && activeIndex >= 0) {
				// Переупорядочиваем карточки в колонке используя arrayMove
				// overIndex может быть больше длины массива (если перетаскиваем в конец)
				// arrayMove работает с индексами в массиве, поэтому ограничиваем максимальным индексом
				const targetIndex = Math.min(overIndex, activeItems.length - 1);
				const reorderedSourceTickets = arrayMove(activeItems, activeIndex, targetIndex);

				// Обновляем порядок всех тикетов, сохраняя порядок внутри каждой колонки
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

				// Сохраняем порядок на бэкенде
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

		// Если перемещаем в другую колонку (только для pending_approval)
		if (originalTicket.status === "pending_approval" && activeContainer !== overContainer) {
			// Проверяем, что мы действительно над целевой колонкой
			// Если lastTargetContainer не установлен или не соответствует overContainer, возвращаем в исходную колонку
			// Это означает, что мы вышли из области колонки или не были над ней
			if (lastTargetContainer.current === null || lastTargetContainer.current !== overContainer) {
				console.log(
					"handleDragEnd - not over target container (lastTargetContainer:",
					lastTargetContainer.current,
					", overContainer:",
					overContainer,
					"), returning to original"
				);
				if (clonedTickets) {
					const clonedTicketIds = clonedTickets.map((t) => t.id);
					// Передаем исходные тикеты для восстановления исходного состояния без вызова API
					onTicketsReorder(clonedTicketIds, clonedTickets);
				}
				setActiveId(null);
				setClonedTickets(null);
				lastReorderedIds.current = null;
				lastTargetIndex.current = null;
				lastTargetContainer.current = null;
				return;
			}

			console.log("Moving ticket between columns:", {
				activeId,
				activeContainer,
				overContainer,
				overId,
			});

			// Используем индекс из handleDragOver, если он есть и соответствует текущей целевой колонке
			let finalInsertIndex: number;

			if (lastTargetIndex.current !== null && lastTargetContainer.current === overContainer) {
				// Используем сохраненный индекс из handleDragOver
				finalInsertIndex = lastTargetIndex.current;
				console.log("Using saved index from handleDragOver:", finalInsertIndex);
			} else {
				// Если индекс не сохранен, вычисляем его заново
				// Получаем карточки целевой колонки из исходного состояния
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
				console.log("Calculated index:", finalInsertIndex);
			}

			// Оптимистичное обновление UI
			const optimisticTicket: Ticket = {
				...originalTicket,
				status: overContainer,
			};

			onTicketUpdate(optimisticTicket);

			if (selectedTicket?.id === activeId) {
				onSelectedTicketUpdate(optimisticTicket);
			}

			try {
				// Используем единую ручку для перемещения карточки в другую колонку
				// Она обновит статус и вставит карточку в правильную позицию
				const updatedTickets = await ticketApi.moveTicketToColumn(
					activeId,
					overContainer,
					finalInsertIndex
				);

				// Обновляем локальное состояние с результатом от сервера
				const reorderedTicketIds = updatedTickets.map((t) => t.id);
				onTicketsReorder(reorderedTicketIds, updatedTickets);

				// Обновляем перемещенную карточку
				const movedTicket = updatedTickets.find((t) => t.id === activeId);
				if (movedTicket) {
					onTicketUpdate(movedTicket);
					if (selectedTicket?.id === activeId) {
						onSelectedTicketUpdate(movedTicket);
					}
				}
			} catch (error) {
				console.error("Failed to move ticket:", error);
				// Откатываем изменения при ошибке
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
		// Восстанавливаем исходное состояние при отмене перетаскивания
		if (clonedTickets) {
			const clonedTicketIds = clonedTickets.map((t) => t.id);
			// Передаем исходные тикеты для восстановления исходного состояния без вызова API
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
