import { Card } from "../../../shared/ui/Card/Card";
import { useTicketCardDrag } from "../model/hooks/useTicketCardDrag";
import { useTicketCardClick } from "../model/hooks/useTicketCardClick";
import { truncateText } from "../../../shared/lib/utils";
import { formatDate } from "../../../shared/lib/utils";
import type { Ticket } from "../model/types";
import "./TicketCard.css";

export interface TicketCardProps {
	ticket: Ticket;
	onClick?: () => void;
	isDragDisabled?: boolean;
}

export const TicketCard = ({ ticket, onClick, isDragDisabled = false }: TicketCardProps) => {
	const { isDraggable, attributes, listeners, setNodeRef, style, isDragging } =
		useTicketCardDrag(ticket, isDragDisabled);

	const handleClick = useTicketCardClick(onClick, isDragging);

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			data-testid={`ticket-card-${ticket.id}`}
			data-ticket-status={ticket.status}
		>
			<div {...(isDraggable ? listeners : {})}>
				<Card
					variant={onClick ? "interactive" : "default"}
					className={`ticket-card ${isDragging ? "ticket-card--dragging" : ""}`}
					onClick={handleClick}
				>
					<div className="ticket-card__header">
						<span className="ticket-card__id">{ticket.id}</span>
					</div>
					<div className="ticket-card__body">
						<h3 className="ticket-card__customer">{ticket.customerName}</h3>
						<p className="ticket-card__issue">{truncateText(ticket.issue, 100)}</p>
					</div>
					<div className="ticket-card__footer">
						<span className="ticket-card__date">{formatDate(ticket.createdAt)}</span>
					</div>
				</Card>
			</div>
		</div>
	);
};
