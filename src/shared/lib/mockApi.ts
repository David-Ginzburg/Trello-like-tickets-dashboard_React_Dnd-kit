import type { Ticket, TicketStatus } from "../../entities/ticket/model/types";
import { STORAGE_KEY } from "../config/constants";

const generateMockTickets = (): Ticket[] => {
	const now = new Date();
	return [
		{
			id: "TKT-001",
			customerName: "John Smith",
			issue: "I'm having trouble logging into my account. The password reset link isn't working.",
			aiResponse:
				"I've verified your account status and reset your password. Please check your email for the new temporary password. You'll be prompted to create a new password on your next login.",
			status: "ai_resolved",
			createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "TKT-002",
			customerName: "Sarah Johnson",
			issue: "My order #12345 hasn't arrived yet. It was supposed to be delivered yesterday.",
			aiResponse:
				"I've checked your order status. There was a delay in shipping due to weather conditions. Your order is now in transit and should arrive within 2 business days. I've also applied a 10% discount to your next order as compensation.",
			status: "pending_approval",
			createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "TKT-003",
			customerName: "Michael Chen",
			issue: "I want to cancel my subscription immediately and get a full refund.",
			aiResponse:
				"I understand you'd like to cancel. However, according to our policy, refunds are only available within 30 days of purchase. Your subscription started 45 days ago. Would you like me to process the cancellation, or would you prefer to discuss alternative options?",
			status: "pending_approval",
			createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "TKT-004",
			customerName: "Emily Davis",
			issue: "There's a bug in the mobile app - it crashes every time I try to upload a photo.",
			aiResponse:
				"I've identified the issue. This is a known bug affecting iOS version 15.0-15.2. Our development team is working on a fix. In the meantime, please try updating to the latest app version or use the web interface.",
			status: "escalated",
			createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "TKT-005",
			customerName: "Robert Wilson",
			issue: "I need help setting up two-factor authentication for my account.",
			aiResponse:
				"I'll guide you through setting up 2FA. First, go to Settings > Security > Two-Factor Authentication. Click 'Enable' and scan the QR code with your authenticator app. Enter the 6-digit code to complete setup.",
			status: "ai_resolved",
			createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "TKT-006",
			customerName: "Lisa Anderson",
			issue: "I was charged twice for the same purchase. Transaction IDs: TXN-789 and TXN-790.",
			aiResponse:
				"I've reviewed both transactions and confirmed the duplicate charge. I've processed a full refund for the second transaction (TXN-790). The refund should appear in your account within 3-5 business days.",
			status: "pending_approval",
			createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: "TKT-007",
			customerName: "David Martinez",
			issue: "The website is extremely slow and keeps timing out. This is affecting my work.",
			aiResponse:
				"I apologize for the inconvenience. Our servers are experiencing higher than usual traffic. I've escalated this to our infrastructure team for immediate investigation. We're working to resolve this as quickly as possible.",
			status: "escalated",
			createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
		},
		{
			id: "TKT-008",
			customerName: "Jennifer Brown",
			issue: "Can you help me change my email address associated with my account?",
			aiResponse:
				"To change your email address, please go to Account Settings > Profile > Email. Enter your new email address and verify it using the confirmation link we'll send. Your old email will remain active until verification is complete.",
			status: "ai_resolved",
			createdAt: new Date(now.getTime() - 7 * 60 * 60 * 1000).toISOString(),
		},
	];
};

const getStoredTickets = (): Ticket[] | null => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored) as Ticket[];
		}
	} catch (error) {
		console.error("Error reading tickets from localStorage:", error);
	}
	return null;
};

const saveTickets = (tickets: Ticket[]): void => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
	} catch (error) {
		console.error("Error saving tickets to localStorage:", error);
	}
};

export const getTickets = async (): Promise<Ticket[]> => {
	const stored = getStoredTickets();
	if (stored && stored.length > 0) {
		return stored;
	}

	const mockTickets = generateMockTickets();
	saveTickets(mockTickets);
	return mockTickets;
};

export const updateTicketStatus = async (
	id: string,
	status: TicketStatus,
): Promise<Ticket> => {
	const tickets = await getTickets();
	const ticketIndex = tickets.findIndex((ticket) => ticket.id === id);

	if (ticketIndex === -1) {
		throw new Error(`Ticket with id ${id} not found`);
	}

	const updatedTicket: Ticket = {
		...tickets[ticketIndex],
		status,
	};

	tickets[ticketIndex] = updatedTicket;
	saveTickets(tickets);

	return updatedTicket;
};

