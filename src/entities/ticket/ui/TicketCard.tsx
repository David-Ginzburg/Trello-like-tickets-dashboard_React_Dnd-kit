import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "../../../shared/ui/Card/Card";
import type { Ticket } from "../model/types";
import "./TicketCard.css";

export interface TicketCardProps {
	ticket: Ticket;
	onClick?: () => void;
}

export const TicketCard = ({ ticket, onClick }: TicketCardProps) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: ticket.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const truncateText = (text: string, maxLength: number) => {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + "...";
	};

	const handleClick = (e: React.MouseEvent) => {
		if (!isDragging && onClick) {
			e.stopPropagation();
			onClick();
		}
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes}>
			<div {...listeners}>
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
			</div>
		</div>
	);
};
