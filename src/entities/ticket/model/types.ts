export type TicketStatus = "ai_resolved" | "pending_approval" | "escalated";

export interface Ticket {
	id: string;
	customerName: string;
	issue: string;
	aiResponse: string;
	status: TicketStatus;
	createdAt: string;
}

