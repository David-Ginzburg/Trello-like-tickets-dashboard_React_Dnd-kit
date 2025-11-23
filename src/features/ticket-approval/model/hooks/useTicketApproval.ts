import { useState } from "react";
import { ticketApi } from "../../../../shared/api/ticketApi";
import type { Ticket, TicketStatus } from "../../../../entities/ticket/model/types";

interface UseTicketApprovalProps {
	ticket: Ticket;
	onStatusChange: (ticket: Ticket) => void;
	onClose?: () => void;
}

export const useTicketApproval = ({ ticket, onStatusChange, onClose }: UseTicketApprovalProps) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleAction = async (newStatus: TicketStatus) => {
		setIsLoading(true);
		try {
			const updatedTicket = await ticketApi.updateTicketStatus(ticket.id, newStatus);
			onStatusChange(updatedTicket);
			onClose?.();
		} catch (error) {
			console.error("Failed to update ticket status:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isLoading,
		handleAction,
	};
};
