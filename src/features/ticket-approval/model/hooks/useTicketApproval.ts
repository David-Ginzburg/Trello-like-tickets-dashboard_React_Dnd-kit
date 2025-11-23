import { useState } from "react";
import { toast } from "react-toastify";
import { ticketApi } from "../../../../shared/api/ticketApi";
import type { Ticket, TicketStatus } from "../../../../entities/ticket/model/types";
import { TICKET_STATUSES } from "../../../../entities/ticket/model/const/constants";

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
			// Show success notification
			const newStatusLabel = TICKET_STATUSES[newStatus].label;
			toast.success(`Статус изменен на "${newStatusLabel}"`);
		} catch (error) {
			console.error("Failed to update ticket status:", error);
			// Show error notification
			toast.error("Не удалось изменить статус карточки");
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isLoading,
		handleAction,
	};
};
