import type { Ticket, TicketStatus } from "../../entities/ticket/model/types";
import { indexedDbAdapter } from "./indexedDbAdapter";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Determine if we're in development mode (with mock server) or production mode (with IndexedDB)
const isDevMode = import.meta.env.DEV;

// Use mock server API in dev mode, IndexedDB adapter in production
const apiAdapter = isDevMode
	? {
			async getTickets(): Promise<Ticket[]> {
				const response = await fetch(`${API_BASE_URL}/tickets`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) {
					throw new Error(`Failed to fetch tickets: ${response.statusText}`);
				}

				return response.json();
			},

			async updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
				const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ status }),
				});

				if (!response.ok) {
					throw new Error(`Failed to update ticket: ${response.statusText}`);
				}

				return response.json();
			},

			async refreshTickets(): Promise<Ticket[]> {
				const response = await fetch(`${API_BASE_URL}/tickets/refresh`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) {
					throw new Error(`Failed to refresh tickets: ${response.statusText}`);
				}

				const data = await response.json();
				return data.tickets;
			},

			async reorderTickets(ticketIds: string[]): Promise<Ticket[]> {
				const response = await fetch(`${API_BASE_URL}/tickets/reorder`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ ticketIds }),
				});

				if (!response.ok) {
					throw new Error(`Failed to reorder tickets: ${response.statusText}`);
				}

				return response.json();
			},

			async moveTicketToColumn(
				ticketId: string,
				newStatus: TicketStatus,
				targetIndex: number
			): Promise<Ticket[]> {
				const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/move`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ status: newStatus, targetIndex }),
				});

				if (!response.ok) {
					throw new Error(`Failed to move ticket: ${response.statusText}`);
				}

				return response.json();
			},
	  }
	: indexedDbAdapter;

export const ticketApi = {
	async getTickets(): Promise<Ticket[]> {
		return apiAdapter.getTickets();
	},

	async updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
		return apiAdapter.updateTicketStatus(id, status);
	},

	async refreshTickets(): Promise<Ticket[]> {
		return apiAdapter.refreshTickets();
	},

	async reorderTickets(ticketIds: string[]): Promise<Ticket[]> {
		return apiAdapter.reorderTickets(ticketIds);
	},

	async moveTicketToColumn(
		ticketId: string,
		newStatus: TicketStatus,
		targetIndex: number
	): Promise<Ticket[]> {
		return apiAdapter.moveTicketToColumn(ticketId, newStatus, targetIndex);
	},
};
