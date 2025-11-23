import localforage from "localforage";
import type { Ticket, TicketStatus } from "../../entities/ticket/model/types";
import { generateMockTickets } from "../mock/mockData";

const TICKETS_STORAGE_KEY = "tickets_data";

// Initialize localforage instance
const ticketsStore = localforage.createInstance({
	name: "ticket-dashboard",
	storeName: "tickets",
	description: "Tickets storage for Customer Support Dashboard",
});

// Initialize with mock data if empty
const initializeTickets = async (): Promise<Ticket[]> => {
	const existingTickets = await ticketsStore.getItem<Ticket[]>(TICKETS_STORAGE_KEY);
	if (!existingTickets || existingTickets.length === 0) {
		const initialTickets = generateMockTickets();
		await ticketsStore.setItem(TICKETS_STORAGE_KEY, initialTickets);
		return initialTickets;
	}
	return existingTickets;
};

export const indexedDbAdapter = {
	async getTickets(): Promise<Ticket[]> {
		const tickets = await ticketsStore.getItem<Ticket[]>(TICKETS_STORAGE_KEY);
		if (!tickets || tickets.length === 0) {
			return initializeTickets();
		}
		return tickets;
	},

	async updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
		const tickets = await this.getTickets();
		const ticketIndex = tickets.findIndex((ticket) => ticket.id === id);

		if (ticketIndex === -1) {
			throw new Error(`Ticket with id ${id} not found`);
		}

		const updatedTicket: Ticket = {
			...tickets[ticketIndex],
			status,
		};

		tickets[ticketIndex] = updatedTicket;
		await ticketsStore.setItem(TICKETS_STORAGE_KEY, tickets);

		return updatedTicket;
	},

	async refreshTickets(): Promise<Ticket[]> {
		const initialTickets = generateMockTickets();
		await ticketsStore.setItem(TICKETS_STORAGE_KEY, initialTickets);
		return initialTickets;
	},

	async reorderTickets(ticketIds: string[]): Promise<Ticket[]> {
		const allTickets = await this.getTickets();
		const ticketMap = new Map(allTickets.map((ticket) => [ticket.id, ticket]));
		const reorderedTickets = ticketIds.map((id) => ticketMap.get(id)).filter(Boolean) as Ticket[];

		await ticketsStore.setItem(TICKETS_STORAGE_KEY, reorderedTickets);
		return reorderedTickets;
	},

	async moveTicketToColumn(
		ticketId: string,
		newStatus: TicketStatus,
		targetIndex: number
	): Promise<Ticket[]> {
		const allTickets = await this.getTickets();
		const ticketIndex = allTickets.findIndex((t) => t.id === ticketId);

		if (ticketIndex === -1) {
			throw new Error(`Ticket with id ${ticketId} not found`);
		}

		const ticket = allTickets[ticketIndex];
		const oldStatus = ticket.status;

		// Update ticket status
		const updatedTicket: Ticket = {
			...ticket,
			status: newStatus,
		};

		// Remove ticket from old column
		const ticketsWithoutMoved = allTickets.filter((t) => t.id !== ticketId);

		// Get target column tickets (without moved ticket)
		const targetColumnTickets = ticketsWithoutMoved.filter((t) => t.status === newStatus);

		// Insert ticket at correct position
		const newTargetColumnTickets = [
			...targetColumnTickets.slice(0, targetIndex),
			updatedTicket,
			...targetColumnTickets.slice(targetIndex),
		];

		// Build final order of all tickets
		const statusOrder: Ticket["status"][] = ["ai_resolved", "pending_approval", "escalated"];
		const reorderedTickets: Ticket[] = [];

		for (const status of statusOrder) {
			if (status === oldStatus) {
				// Old column without moved ticket
				const oldColumnTickets = ticketsWithoutMoved.filter((t) => t.status === status);
				reorderedTickets.push(...oldColumnTickets);
			} else if (status === newStatus) {
				// New column with moved ticket at correct position
				reorderedTickets.push(...newTargetColumnTickets);
			} else {
				// Other columns unchanged
				const columnTickets = ticketsWithoutMoved.filter((t) => t.status === status);
				reorderedTickets.push(...columnTickets);
			}
		}

		await ticketsStore.setItem(TICKETS_STORAGE_KEY, reorderedTickets);
		return reorderedTickets;
	},
};
