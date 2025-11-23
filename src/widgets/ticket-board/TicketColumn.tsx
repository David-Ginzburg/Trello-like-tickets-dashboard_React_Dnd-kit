import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TicketCard } from "../../entities/ticket/ui/TicketCard";
import type { Ticket, TicketStatus } from "../../entities/ticket/model/types";
import { TICKET_STATUSES } from "../../shared/config/constants";
import "./TicketColumn.css";

export interface TicketColumnProps {
	status: TicketStatus;
	tickets: Ticket[];
	onTicketClick?: (ticket: Ticket) => void;
}

export const TicketColumn = ({
	status,
	tickets,
	onTicketClick,
}: TicketColumnProps) => {
	const statusConfig = TICKET_STATUSES[status];
	const { setNodeRef, isOver } = useDroppable({
		id: status,
	});

	return (
		<div className="ticket-column" ref={setNodeRef}>
			<div
				className={`ticket-column__header ${isOver ? "ticket-column__header--over" : ""}`}
				style={{
					borderTopColor: statusConfig.color,
				}}
			>
				<h2 className="ticket-column__title">{statusConfig.label}</h2>
				<span className="ticket-column__count">{tickets.length}</span>
			</div>
			<SortableContext
				items={tickets.map((ticket) => ticket.id)}
				strategy={verticalListSortingStrategy}
			>
				<div
					className={`ticket-column__content ${isOver ? "ticket-column__content--over" : ""}`}
				>
					{tickets.length === 0 ? (
						<div className="ticket-column__empty">
							{isOver ? "Drop here" : "No tickets"}
						</div>
					) : (
						tickets.map((ticket) => (
							<TicketCard
								key={ticket.id}
								ticket={ticket}
								onClick={() => onTicketClick?.(ticket)}
							/>
						))
					)}
				</div>
			</SortableContext>
		</div>
	);
};
