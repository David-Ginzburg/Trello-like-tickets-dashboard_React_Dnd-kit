import { Card } from "../../../shared/ui/Card/Card";
import type { Ticket } from "../model/types";
import "./TicketCard.css";

export interface TicketCardProps {
	ticket: Ticket;
	onClick?: () => void;
}

export const TicketCard = ({ ticket, onClick }: TicketCardProps) => {
	const truncateText = (text: string, maxLength: number) => {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + "...";
	};

	return (
		<Card
			variant={onClick ? "interactive" : "default"}
			className="ticket-card"
			onClick={onClick}
		>
			<div className="ticket-card__header">
				<span className="ticket-card__id">{ticket.id}</span>
			</div>
			<div className="ticket-card__body">
				<h3 className="ticket-card__customer">{ticket.customerName}</h3>
				<p className="ticket-card__issue">
					{truncateText(ticket.issue, 100)}
				</p>
			</div>
			<div className="ticket-card__footer">
				<span className="ticket-card__date">
					{new Date(ticket.createdAt).toLocaleDateString()}
				</span>
			</div>
		</Card>
	);
};

