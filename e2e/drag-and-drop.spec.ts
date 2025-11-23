import { test, expect } from "@playwright/test";

test.describe("Drag and Drop", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
	});

	test("should allow dragging pending approval tickets", async ({ page }) => {
		const pendingColumn = page.getByTestId("ticket-column-pending_approval");

		const pendingTickets = pendingColumn.locator('[data-ticket-status="pending_approval"]');
		const ticketCount = await pendingTickets.count();

		if (ticketCount > 0) {
			const firstTicket = pendingTickets.first();
			const ticketId = await firstTicket
				.locator(".ticket-card__id")
				.textContent();

			const resolvedColumn = page.getByTestId("ticket-column-ai_resolved");

			const ticketBox = await firstTicket.boundingBox();
			const resolvedBox = await resolvedColumn.boundingBox();

			if (ticketBox && resolvedBox) {
				await page.mouse.move(
					ticketBox.x + ticketBox.width / 2,
					ticketBox.y + ticketBox.height / 2,
				);
				await page.mouse.down();
				await page.mouse.move(
					resolvedBox.x + resolvedBox.width / 2,
					resolvedBox.y + resolvedBox.height / 2,
					{ steps: 10 },
				);
				await page.mouse.up();

				await page.waitForTimeout(1500);

				if (ticketId) {
					const ticketInResolved = resolvedColumn.getByTestId(`ticket-card-${ticketId}`);
					await expect(ticketInResolved).toBeVisible();
				}
			}
		}
	});

	test("should not allow dragging resolved tickets", async ({ page }) => {
		const resolvedColumn = page.getByTestId("ticket-column-ai_resolved");

		const resolvedTickets = resolvedColumn.locator('[data-ticket-status="ai_resolved"]');
		const ticketCount = await resolvedTickets.count();

		if (ticketCount > 0) {
			const firstTicket = resolvedTickets.first();

			const cursor = await firstTicket.evaluate((el) => {
				return window.getComputedStyle(el).cursor;
			});

			expect(cursor).not.toBe("grab");
		}
	});

	test("should not allow dragging escalated tickets", async ({ page }) => {
		const escalatedColumn = page.getByTestId("ticket-column-escalated");

		const escalatedTickets = escalatedColumn.locator('[data-ticket-status="escalated"]');
		const ticketCount = await escalatedTickets.count();

		if (ticketCount > 0) {
			const firstTicket = escalatedTickets.first();

			const cursor = await firstTicket.evaluate((el) => {
				return window.getComputedStyle(el).cursor;
			});

			expect(cursor).not.toBe("grab");
		}
	});

	test("should move pending ticket to resolved via drag and drop", async ({
		page,
	}) => {
		const pendingColumn = page.getByTestId("ticket-column-pending_approval");
		const resolvedColumn = page.getByTestId("ticket-column-ai_resolved");

		const pendingTickets = pendingColumn.locator('[data-ticket-status="pending_approval"]');
		const resolvedTicketsBefore = resolvedColumn.locator('[data-ticket-status="ai_resolved"]');
		const resolvedCountBefore = await resolvedTicketsBefore.count();

		const ticketCountBefore = await pendingTickets.count();

		if (ticketCountBefore > 0) {
			const firstTicket = pendingTickets.first();
			const ticketId = await firstTicket
				.locator(".ticket-card__id")
				.textContent();

			const ticketBox = await firstTicket.boundingBox();
			const resolvedBox = await resolvedColumn.boundingBox();

			if (ticketBox && resolvedBox) {
				await page.mouse.move(
					ticketBox.x + ticketBox.width / 2,
					ticketBox.y + ticketBox.height / 2,
				);
				await page.mouse.down();
				await page.mouse.move(
					resolvedBox.x + resolvedBox.width / 2,
					resolvedBox.y + resolvedBox.height / 2,
					{ steps: 10 },
				);
				await page.mouse.up();

				await page.waitForTimeout(1500);

				const pendingTicketsAfter = pendingColumn.locator('[data-ticket-status="pending_approval"]');
				const ticketCountAfter = await pendingTicketsAfter.count();

				const resolvedTicketsAfter = resolvedColumn.locator('[data-ticket-status="ai_resolved"]');
				const resolvedCountAfter = await resolvedTicketsAfter.count();

				expect(ticketCountAfter).toBe(ticketCountBefore - 1);
				expect(resolvedCountAfter).toBe(resolvedCountBefore + 1);

				if (ticketId) {
					const ticketInResolved = resolvedColumn.getByTestId(`ticket-card-${ticketId}`);
					await expect(ticketInResolved).toBeVisible();
				}
			}
		}
	});

	test("should move pending ticket to escalated via drag and drop", async ({
		page,
	}) => {
		const pendingColumn = page.getByTestId("ticket-column-pending_approval");
		const escalatedColumn = page.getByTestId("ticket-column-escalated");

		const pendingTickets = pendingColumn.locator('[data-ticket-status="pending_approval"]');
		const escalatedTicketsBefore = escalatedColumn.locator('[data-ticket-status="escalated"]');
		const escalatedCountBefore = await escalatedTicketsBefore.count();

		const ticketCountBefore = await pendingTickets.count();

		if (ticketCountBefore > 0) {
			const firstTicket = pendingTickets.first();
			const ticketId = await firstTicket
				.locator(".ticket-card__id")
				.textContent();

			const ticketBox = await firstTicket.boundingBox();
			const escalatedBox = await escalatedColumn.boundingBox();

			if (ticketBox && escalatedBox) {
				await page.mouse.move(
					ticketBox.x + ticketBox.width / 2,
					ticketBox.y + ticketBox.height / 2,
				);
				await page.mouse.down();
				await page.mouse.move(
					escalatedBox.x + escalatedBox.width / 2,
					escalatedBox.y + escalatedBox.height / 2,
					{ steps: 10 },
				);
				await page.mouse.up();

				await page.waitForTimeout(1500);

				const pendingTicketsAfter = pendingColumn.locator('[data-ticket-status="pending_approval"]');
				const ticketCountAfter = await pendingTicketsAfter.count();

				const escalatedTicketsAfter = escalatedColumn.locator('[data-ticket-status="escalated"]');
				const escalatedCountAfter = await escalatedTicketsAfter.count();

				expect(ticketCountAfter).toBe(ticketCountBefore - 1);
				expect(escalatedCountAfter).toBe(escalatedCountBefore + 1);

				if (ticketId) {
					const ticketInEscalated = escalatedColumn.getByTestId(`ticket-card-${ticketId}`);
					await expect(ticketInEscalated).toBeVisible();
				}
			}
		}
	});
});

