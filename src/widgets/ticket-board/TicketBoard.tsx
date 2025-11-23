import { useState, useEffect, useMemo } from "react";
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { TicketColumn } from "./TicketColumn";
import { TicketFilter } from "../../features/ticket-filter/ui/TicketFilter";
import { TicketDetailsModal } from "../../features/ticket-details/ui/TicketDetailsModal";
import { TicketCard } from "../../entities/ticket/ui/TicketCard";
import { getTickets, updateTicketStatus } from "../../shared/lib/mockApi";
import type { Ticket, TicketStatus } from "../../entities/ticket/model/types";
import { TICKET_STATUS_ORDER } from "../../shared/config/constants";
import "./TicketBoard.css";

export const TicketBoard = () => {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [filter, setFilter] = useState("");
	const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [activeId, setActiveId] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 10,
			},
		}),
	);

	useEffect(() => {
		const loadTickets = async () => {
			try {
				setIsLoading(true);
				const loadedTickets = await getTickets();
				setTickets(loadedTickets);
			} catch (error) {
				console.error("Failed to load tickets:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadTickets();
	}, []);

	const filteredTickets = useMemo(() => {
		if (!filter.trim()) {
			return tickets;
		}

		const filterLower = filter.toLowerCase();
		return tickets.filter(
			(ticket) =>
				ticket.customerName.toLowerCase().includes(filterLower) ||
				ticket.id.toLowerCase().includes(filterLower),
		);
	}, [tickets, filter]);

	const ticketsByStatus = useMemo(() => {
		const grouped: Record<string, Ticket[]> = {
			ai_resolved: [],
			pending_approval: [],
			escalated: [],
		};

		filteredTickets.forEach((ticket) => {
			grouped[ticket.status].push(ticket);
		});

		return grouped;
	}, [filteredTickets]);

	const handleTicketClick = (ticket: Ticket) => {
		setSelectedTicket(ticket);
		setIsModalOpen(true);
	};

	const handleStatusChange = async (updatedTicket: Ticket) => {
		setTickets((prevTickets) =>
			prevTickets.map((ticket) =>
				ticket.id === updatedTicket.id ? updatedTicket : ticket,
			),
		);
		setSelectedTicket(updatedTicket);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedTicket(null);
	};

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (!over) return;

		const ticketId = active.id as string;
		const newStatus = over.id as TicketStatus;

		const ticket = tickets.find((t) => t.id === ticketId);
		if (!ticket) return;

		if (ticket.status === newStatus) return;

		try {
			const updatedTicket = await updateTicketStatus(ticketId, newStatus);
			setTickets((prevTickets) =>
				prevTickets.map((t) =>
					t.id === updatedTicket.id ? updatedTicket : t,
				),
			);

			if (selectedTicket?.id === ticketId) {
				setSelectedTicket(updatedTicket);
			}
		} catch (error) {
			console.error("Failed to update ticket status:", error);
		}
	};

	const activeTicket = activeId
		? tickets.find((ticket) => ticket.id === activeId)
		: null;

	if (isLoading) {
		return (
			<div className="ticket-board ticket-board--loading">
				<div className="ticket-board__spinner">Loading tickets...</div>
			</div>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="ticket-board">
				<div className="ticket-board__header">
					<h1 className="ticket-board__title">
						Customer Support AI Agent Dashboard
					</h1>
					<TicketFilter onFilterChange={setFilter} />
				</div>

				<div className="ticket-board__columns">
					{TICKET_STATUS_ORDER.map((status) => (
						<TicketColumn
							key={status}
							status={status}
							tickets={ticketsByStatus[status]}
							onTicketClick={handleTicketClick}
						/>
					))}
				</div>

				<DragOverlay>
					{activeTicket ? (
						<div style={{ opacity: 0.8 }}>
							<TicketCard ticket={activeTicket} />
						</div>
					) : null}
				</DragOverlay>

				<TicketDetailsModal
					ticket={selectedTicket}
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					onStatusChange={handleStatusChange}
				/>
			</div>
		</DndContext>
	);
};
