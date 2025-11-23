import type { TicketStatus } from "../../entities/ticket/model/types";

export const TICKET_STATUSES: Record<
	TicketStatus,
	{ label: string; color: string; bgColor: string }
> = {
	ai_resolved: {
		label: "AI Resolved",
		color: "var(--color-ai-resolved)",
		bgColor: "var(--color-ai-resolved-bg)",
	},
	pending_approval: {
		label: "Pending Approval",
		color: "var(--color-pending-approval)",
		bgColor: "var(--color-pending-approval-bg)",
	},
	escalated: {
		label: "Escalated",
		color: "var(--color-escalated)",
		bgColor: "var(--color-escalated-bg)",
	},
};

export const TICKET_STATUS_ORDER: TicketStatus[] = [
	"ai_resolved",
	"pending_approval",
	"escalated",
];

export const STORAGE_KEY = "tickets_data";

