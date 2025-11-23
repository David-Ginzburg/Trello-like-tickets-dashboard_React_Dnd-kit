import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TicketCard } from "../../entities/ticket/ui/TicketCard";
import type { Ticket, TicketStatus } from "../../entities/ticket/model/types";
import { TICKET_STATUSES } from "../../entities/ticket/model/const/constants";
import "./TicketColumn.css";

export interface TicketColumnProps {
	status: TicketStatus;
	tickets: Ticket[];
	onTicketClick?: (ticket: Ticket) => void;
	activeId?: string | null;
	activeTicket?: Ticket | null;
	isDragDisabled?: boolean;
}

export const TicketColumn = ({ status, tickets, onTicketClick, activeId, isDragDisabled }: TicketColumnProps) => {
	const statusConfig = TICKET_STATUSES[status];
	const { setNodeRef, isOver } = useDroppable({
		id: status,
	});

	const safeTickets = tickets || [];
	const ticketIds = safeTickets.map((ticket) => ticket.id);

	return (
		<div
			className={`ticket-column ${isOver ? "ticket-column--over" : ""}`}
			ref={setNodeRef}
			data-status={status}
			data-testid={`ticket-column-${status}`}
		>
			<div
				className={`ticket-column__header ${isOver ? "ticket-column__header--over" : ""}`}
				style={{
					borderTopColor: statusConfig.color,
				}}
			>
				<h2 className="ticket-column__title">{statusConfig.label}</h2>
				<span className="ticket-column__count">{safeTickets.length}</span>
			</div>
			<div className="ticket-column__content">
				<SortableContext items={ticketIds} strategy={verticalListSortingStrategy}>
					{safeTickets.length === 0 ? (
						<div className="ticket-column__empty">{isOver ? "Drop here" : "No tickets"}</div>
					) : (
						safeTickets.map((ticket) => {
							// Hide dragged card, it's shown in DragOverlay
							if (ticket.id === activeId) {
								return (
									<div
										key={ticket.id}
										style={{
											opacity: 0,
											pointerEvents: "none",
										}}
									>
										<TicketCard ticket={ticket} isDragDisabled={true} />
									</div>
								);
							}
							return (
								<TicketCard
									key={ticket.id}
									ticket={ticket}
									onClick={() => onTicketClick?.(ticket)}
									isDragDisabled={isDragDisabled}
								/>
							);
						})
					)}
				</SortableContext>
			</div>
		</div>
	);
};
