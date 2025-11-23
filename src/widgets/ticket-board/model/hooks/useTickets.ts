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
			// Если переданы обновленные тикеты, используем их напрямую
			// Это позволяет временно изменять статусы карточек для визуального эффекта
			if (updatedTickets && updatedTickets.length > 0) {
				// Создаем карту из обновленных тикетов
				const updatedMap = new Map(updatedTickets.map((ticket) => [ticket.id, ticket]));
				// Используем обновленные тикеты в правильном порядке
				return ticketIds.map((id) => updatedMap.get(id)).filter(Boolean) as Ticket[];
			}
			
			// Иначе просто переупорядочиваем существующие тикеты
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
