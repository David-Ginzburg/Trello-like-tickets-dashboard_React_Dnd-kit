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

	return (
		<div className="ticket-column">
			<div
				className="ticket-column__header"
				style={{
					borderTopColor: statusConfig.color,
				}}
			>
				<h2 className="ticket-column__title">{statusConfig.label}</h2>
				<span className="ticket-column__count">{tickets.length}</span>
			</div>
			<div className="ticket-column__content">
				{tickets.length === 0 ? (
					<div className="ticket-column__empty">No tickets</div>
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
		</div>
	);
};

