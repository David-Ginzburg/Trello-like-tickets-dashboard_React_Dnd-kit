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
			// Show notification based on status
			const newStatusLabel = TICKET_STATUSES[newStatus].label;
			if (newStatus === "escalated") {
				// Reject - show error notification (red)
				toast.error(`Ticket status changed to "${newStatusLabel}"`);
			} else {
				// Approve or other status - show success notification (green)
				toast.success(`Ticket status changed to "${newStatusLabel}"`);
			}
		} catch (error) {
			console.error("Failed to update ticket status:", error);
			// Show error notification
			toast.error("Failed to change ticket status");
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isLoading,
		handleAction,
	};
};
