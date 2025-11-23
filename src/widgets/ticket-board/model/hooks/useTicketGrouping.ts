import { useMemo } from "react";
import type { Ticket, TicketStatus } from "../../../../entities/ticket/model/types";

export const useTicketGrouping = (tickets: Ticket[]) => {
	const ticketsByStatus = useMemo(() => {
		const grouped: Record<TicketStatus, Ticket[]> = {
			ai_resolved: [],
			pending_approval: [],
			escalated: [],
		};

		tickets.forEach((ticket) => {
			const status = ticket.status as TicketStatus;
			if (grouped[status]) {
				grouped[status].push(ticket);
			}
		});

		return grouped;
	}, [tickets]);

	return ticketsByStatus;
};

