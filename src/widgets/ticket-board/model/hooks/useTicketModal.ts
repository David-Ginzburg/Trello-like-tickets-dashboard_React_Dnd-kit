import { useState } from "react";
import type { Ticket } from "../../../../entities/ticket/model/types";

export const useTicketModal = () => {
	const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [filter, setFilter] = useState("");

	const openModal = (ticket: Ticket) => {
		setSelectedTicket(ticket);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedTicket(null);
	};

	const updateSelectedTicket = (updatedTicket: Ticket) => {
		setSelectedTicket(updatedTicket);
	};

	return {
		selectedTicket,
		isModalOpen,
		filter,
		setFilter,
		openModal,
		closeModal,
		updateSelectedTicket,
	};
};

