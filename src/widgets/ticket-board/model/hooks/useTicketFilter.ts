import { useMemo } from "react";
import type { Ticket } from "../../../../entities/ticket/model/types";

export const useTicketFilter = (tickets: Ticket[], filter: string) => {
	const filteredTickets = useMemo(() => {
		if (!filter.trim()) {
			return tickets;
		}

		const filterLower = filter.toLowerCase();
		return tickets.filter(
			(ticket) =>
				ticket.customerName.toLowerCase().includes(filterLower) ||
				ticket.id.toLowerCase().includes(filterLower)
		);
	}, [tickets, filter]);

	return filteredTickets;
};

