import { useState, useEffect, useMemo } from "react";
import { TicketColumn } from "./TicketColumn";
import { TicketFilter } from "../../features/ticket-filter/ui/TicketFilter";
import { TicketDetailsModal } from "../../features/ticket-details/ui/TicketDetailsModal";
import { getTickets } from "../../shared/lib/mockApi";
import type { Ticket } from "../../entities/ticket/model/types";
import { TICKET_STATUS_ORDER } from "../../shared/config/constants";
import "./TicketBoard.css";

export const TicketBoard = () => {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [filter, setFilter] = useState("");
	const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

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

	const handleStatusChange = (updatedTicket: Ticket) => {
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

	if (isLoading) {
		return (
			<div className="ticket-board ticket-board--loading">
				<div className="ticket-board__spinner">Loading tickets...</div>
			</div>
		);
	}

	return (
		<div className="ticket-board">
			<div className="ticket-board__header">
				<h1 className="ticket-board__title">Customer Support AI Agent Dashboard</h1>
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

			<TicketDetailsModal
				ticket={selectedTicket}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onStatusChange={handleStatusChange}
			/>
		</div>
	);
};

