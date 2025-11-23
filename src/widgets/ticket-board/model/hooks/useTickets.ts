import { useState, useEffect, useRef } from "react";
import { ticketApi } from "../../../../shared/api/ticketApi";
import type { Ticket } from "../../../../entities/ticket/model/types";

export const useTickets = () => {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const hasLoadedRef = useRef(false);

	useEffect(() => {
		if (hasLoadedRef.current) return;
		hasLoadedRef.current = true;

		const loadTickets = async () => {
			try {
				setIsLoading(true);
				const loadedTickets = await ticketApi.getTickets();
				setTickets(loadedTickets);
			} catch (error) {
				console.error("Failed to load tickets:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadTickets();
	}, []);

	const updateTicket = (updatedTicket: Ticket) => {
		setTickets((prevTickets) =>
			prevTickets.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket))
		);
	};

	const reorderTickets = (ticketIds: string[], updatedTickets?: Ticket[]) => {
		setTickets((prevTickets) => {
			// If updated tickets are provided, use them directly
			// This allows temporarily changing ticket statuses for visual effect
			if (updatedTickets && updatedTickets.length > 0) {
				// Create map from updated tickets
				const updatedMap = new Map(updatedTickets.map((ticket) => [ticket.id, ticket]));
				// Use updated tickets in correct order
				return ticketIds.map((id) => updatedMap.get(id)).filter(Boolean) as Ticket[];
			}
			
			// Otherwise just reorder existing tickets
			const ticketMap = new Map(prevTickets.map((ticket) => [ticket.id, ticket]));
			return ticketIds.map((id) => ticketMap.get(id)).filter(Boolean) as Ticket[];
		});
	};

	const refreshTickets = async () => {
		try {
			setIsLoading(true);
			const refreshedTickets = await ticketApi.refreshTickets();
			setTickets(refreshedTickets);
		} catch (error) {
			console.error("Failed to refresh tickets:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		tickets,
		setTickets,
		updateTicket,
		reorderTickets,
		refreshTickets,
		isLoading,
	};
};
