import type { Plugin } from "vite";
import type { Ticket } from "../../entities/ticket/model/types";
import { getMockTickets, resetMockTickets, updateMockTicketStatus } from "./mockData";

// Mock API middleware plugin
export function mockApiPlugin(): Plugin {
	return {
		name: "mock-api",
		configureServer(server) {
			server.middlewares.use("/api", (req, res, next) => {
				// Handle GET /api/tickets
				if (req.method === "GET" && req.url === "/tickets") {
					const mockTickets = getMockTickets();
					res.setHeader("Content-Type", "application/json");
					res.statusCode = 200;
					res.end(JSON.stringify(mockTickets));
					return;
				}

				// Handle POST /api/tickets/refresh - Reset all mock data
				if (req.method === "POST" && req.url === "/tickets/refresh") {
					resetMockTickets();
					const mockTickets = getMockTickets();
					res.setHeader("Content-Type", "application/json");
					res.statusCode = 200;
					res.end(JSON.stringify({ message: "Mock data refreshed", tickets: mockTickets }));
					return;
				}

				// Handle POST /api/tickets/reorder - Reorder tickets
				if (req.method === "POST" && req.url === "/tickets/reorder") {
					let body = "";

					req.on("data", (chunk) => {
						body += chunk.toString();
					});

					req.on("end", () => {
						try {
							const { ticketIds } = JSON.parse(body);
							if (!Array.isArray(ticketIds)) {
								res.statusCode = 400;
								res.end(JSON.stringify({ error: "ticketIds must be an array" }));
								return;
							}

							const allTickets = getMockTickets();
							const ticketMap = new Map(allTickets.map((ticket) => [ticket.id, ticket]));
							const reorderedTickets = ticketIds
								.map((id) => ticketMap.get(id))
								.filter(Boolean) as Ticket[];

							if (typeof global !== "undefined") {
								(global as any).mockTickets = reorderedTickets;
							}

							res.setHeader("Content-Type", "application/json");
							res.statusCode = 200;
							res.end(JSON.stringify(reorderedTickets));
						} catch (error) {
							console.error("Error reordering tickets:", error);
							res.statusCode = 400;
							res.end(JSON.stringify({ error: "Invalid request body" }));
						}
					});
					return;
				}

				// Handle POST /api/tickets/:id/move - Move ticket to another column with specific index
				if (req.method === "POST" && req.url?.includes("/move")) {
					const urlParts = req.url.split("/");
					const ticketId = urlParts[urlParts.length - 2]; // Second to last element (before "move")
					let body = "";

					req.on("data", (chunk) => {
						body += chunk.toString();
					});

					req.on("end", () => {
						try {
							const { status: newStatus, targetIndex } = JSON.parse(body);

							if (!newStatus || typeof targetIndex !== "number") {
								res.statusCode = 400;
								res.end(JSON.stringify({ error: "status and targetIndex are required" }));
								return;
							}

							const allTickets = getMockTickets();
							const ticketIndex = allTickets.findIndex((t) => t.id === ticketId);

							if (ticketIndex === -1) {
								res.statusCode = 404;
								res.end(JSON.stringify({ error: "Ticket not found" }));
								return;
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
							const targetColumnTickets = ticketsWithoutMoved.filter(
								(t) => t.status === newStatus
							);

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

							if (typeof global !== "undefined") {
								(global as any).mockTickets = reorderedTickets;
							}

							res.setHeader("Content-Type", "application/json");
							res.statusCode = 200;
							res.end(JSON.stringify(reorderedTickets));
						} catch (error) {
							console.error("Error moving ticket:", error);
							res.statusCode = 400;
							res.end(JSON.stringify({ error: "Invalid request body" }));
						}
					});
					return;
				}

				// Handle PATCH /api/tickets/:id
				if (req.method === "PATCH" && req.url?.startsWith("/tickets/")) {
					const ticketId = req.url.split("/")[2];

					// Skip refresh and reorder endpoints
					if (ticketId === "refresh" || ticketId === "reorder") {
						next();
						return;
					}

					let body = "";

					req.on("data", (chunk) => {
						body += chunk.toString();
					});

					req.on("end", () => {
						try {
							const { status } = JSON.parse(body);
							const updatedTicket = updateMockTicketStatus(ticketId, status);

							if (!updatedTicket) {
								res.statusCode = 404;
								res.end(JSON.stringify({ error: "Ticket not found" }));
								return;
							}

							res.setHeader("Content-Type", "application/json");
							res.statusCode = 200;
							res.end(JSON.stringify(updatedTicket));
						} catch (error) {
							console.error("Error updating ticket status:", error);
							res.statusCode = 400;
							res.end(JSON.stringify({ error: "Invalid request body" }));
						}
					});
					return;
				}

				next();
			});
		},
	};
}

