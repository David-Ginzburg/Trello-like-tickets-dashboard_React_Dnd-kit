import { Modal } from "../../../shared/ui/Modal/Modal";
import { TicketActions } from "../../ticket-approval/ui/TicketActions";
import type { Ticket } from "../../../entities/ticket/model/types";
import { TICKET_STATUSES } from "../../../shared/config/constants";
import "./TicketDetailsModal.css";

export interface TicketDetailsModalProps {
	ticket: Ticket | null;
	isOpen: boolean;
	onClose: () => void;
	onStatusChange: (ticket: Ticket) => void;
}

export const TicketDetailsModal = ({
	ticket,
	isOpen,
	onClose,
	onStatusChange,
}: TicketDetailsModalProps) => {
	if (!ticket) return null;

	const statusConfig = TICKET_STATUSES[ticket.status];

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={`Ticket ${ticket.id}`}>
			<div className="ticket-details">
				<div className="ticket-details__section">
					<label className="ticket-details__label">Customer Name</label>
					<p className="ticket-details__value">{ticket.customerName}</p>
				</div>

				<div className="ticket-details__section">
					<label className="ticket-details__label">Status</label>
					<span
						className="ticket-details__status"
						style={{
							color: statusConfig.color,
							backgroundColor: statusConfig.bgColor,
						}}
					>
						{statusConfig.label}
					</span>
				</div>

				<div className="ticket-details__section">
					<label className="ticket-details__label">Issue</label>
					<p className="ticket-details__value ticket-details__issue">
						{ticket.issue}
					</p>
				</div>

				<div className="ticket-details__section">
					<label className="ticket-details__label">AI Response</label>
					<p className="ticket-details__value ticket-details__response">
						{ticket.aiResponse}
					</p>
				</div>

				<div className="ticket-details__section">
					<label className="ticket-details__label">Created At</label>
					<p className="ticket-details__value">
						{new Date(ticket.createdAt).toLocaleString()}
					</p>
				</div>

				<TicketActions ticket={ticket} onStatusChange={onStatusChange} />
			</div>
		</Modal>
	);
};

