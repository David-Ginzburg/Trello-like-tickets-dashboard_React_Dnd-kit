import { Button } from "../../../shared/ui/Button/Button";
import { useTicketApproval } from "../model/hooks/useTicketApproval";
import type { Ticket } from "../../../entities/ticket/model/types";
import "./TicketActions.css";

export interface TicketActionsProps {
	ticket: Ticket;
	onStatusChange: (ticket: Ticket) => void;
	onClose?: () => void;
}

export const TicketActions = ({ ticket, onStatusChange, onClose }: TicketActionsProps) => {
	const { isLoading, handleAction } = useTicketApproval({
		ticket,
		onStatusChange,
		onClose,
	});

	if (ticket.status !== "pending_approval") {
		return null;
	}

	return (
		<div className="ticket-actions" data-testid="ticket-actions">
			<Button
				variant="primary"
				size="sm"
				onClick={() => handleAction("ai_resolved")}
				isLoading={isLoading}
				data-testid="approve-button"
			>
				Approve
			</Button>
			<Button
				variant="danger"
				size="sm"
				onClick={() => handleAction("escalated")}
				isLoading={isLoading}
				data-testid="reject-button"
			>
				Reject
			</Button>
		</div>
	);
};
