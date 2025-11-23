import { useState } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { updateTicketStatus } from "../../../shared/lib/mockApi";
import type { Ticket, TicketStatus } from "../../../entities/ticket/model/types";
import "./TicketActions.css";

export interface TicketActionsProps {
	ticket: Ticket;
	onStatusChange: (ticket: Ticket) => void;
}

export const TicketActions = ({
	ticket,
	onStatusChange,
}: TicketActionsProps) => {
	const [isLoading, setIsLoading] = useState(false);

	if (ticket.status !== "pending_approval") {
		return null;
	}

	const handleAction = async (newStatus: TicketStatus) => {
		setIsLoading(true);
		try {
			const updatedTicket = await updateTicketStatus(ticket.id, newStatus);
			onStatusChange(updatedTicket);
		} catch (error) {
			console.error("Failed to update ticket status:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="ticket-actions">
			<Button
				variant="primary"
				size="sm"
				onClick={() => handleAction("ai_resolved")}
				isLoading={isLoading}
			>
				Approve
			</Button>
			<Button
				variant="danger"
				size="sm"
				onClick={() => handleAction("escalated")}
				isLoading={isLoading}
			>
				Reject
			</Button>
		</div>
	);
};

