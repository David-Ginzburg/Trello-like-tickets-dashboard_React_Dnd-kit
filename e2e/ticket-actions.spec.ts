import { test, expect } from "@playwright/test";

test.describe("Ticket Actions", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
	});

	test("should show Approve and Reject buttons for pending tickets", async ({
		page,
	}) => {
		const pendingColumn = page.getByTestId("ticket-column-pending_approval");

		const pendingTickets = pendingColumn.locator('[data-ticket-status="pending_approval"]');
		const firstPendingTicket = pendingTickets.first();

		if ((await firstPendingTicket.count()) > 0) {
			const card = firstPendingTicket.locator(".ticket-card");
			await card.click();

			await page.waitForSelector('[data-testid="modal"]');

			await expect(page.getByTestId("approve-button")).toBeVisible();
			await expect(page.getByTestId("reject-button")).toBeVisible();
		}
	});

	test("should not show action buttons for resolved tickets", async ({
		page,
	}) => {
		const resolvedColumn = page.getByTestId("ticket-column-ai_resolved");

		const resolvedTickets = resolvedColumn.locator('[data-ticket-status="ai_resolved"]');
		const firstResolvedTicket = resolvedTickets.first();

		if ((await firstResolvedTicket.count()) > 0) {
			const card = firstResolvedTicket.locator(".ticket-card");
			await card.click();

			await page.waitForSelector('[data-testid="modal"]');

			await expect(page.getByTestId("approve-button")).not.toBeVisible();
			await expect(page.getByTestId("reject-button")).not.toBeVisible();
		}
	});

	test("should approve pending ticket", async ({ page }) => {
		const pendingColumn = page.getByTestId("ticket-column-pending_approval");

		const pendingTickets = pendingColumn.locator('[data-ticket-status="pending_approval"]');
		const ticketCountBefore = await pendingTickets.count();

		if (ticketCountBefore > 0) {
			const firstPendingTicket = pendingTickets.first();
			const card = firstPendingTicket.locator(".ticket-card");
			await card.click();

			await page.waitForSelector('[data-testid="modal"]');

			const approveButton = page.getByTestId("approve-button");
			await approveButton.click();

			await page.waitForTimeout(1000);

			await expect(page.getByTestId("modal")).not.toBeVisible();

			const pendingTicketsAfter = pendingColumn.locator('[data-ticket-status="pending_approval"]');
			const ticketCountAfter = await pendingTicketsAfter.count();

			expect(ticketCountAfter).toBe(ticketCountBefore - 1);
		}
	});

	test("should reject pending ticket", async ({ page }) => {
		const pendingColumn = page.getByTestId("ticket-column-pending_approval");
		const escalatedColumn = page.getByTestId("ticket-column-escalated");

		const pendingTickets = pendingColumn.locator('[data-ticket-status="pending_approval"]');
		const escalatedTicketsBefore = escalatedColumn.locator('[data-ticket-status="escalated"]');
		const escalatedCountBefore = await escalatedTicketsBefore.count();

		const ticketCountBefore = await pendingTickets.count();

		if (ticketCountBefore > 0) {
			const firstPendingTicket = pendingTickets.first();
			const card = firstPendingTicket.locator(".ticket-card");
			await card.click();

			await page.waitForSelector('[data-testid="modal"]');

			const rejectButton = page.getByTestId("reject-button");
			await rejectButton.click();

			await page.waitForTimeout(1000);

			await expect(page.getByTestId("modal")).not.toBeVisible();

			const pendingTicketsAfter = pendingColumn.locator('[data-ticket-status="pending_approval"]');
			const ticketCountAfter = await pendingTicketsAfter.count();

			const escalatedTicketsAfter = escalatedColumn.locator('[data-ticket-status="escalated"]');
			const escalatedCountAfter = await escalatedTicketsAfter.count();

			expect(ticketCountAfter).toBe(ticketCountBefore - 1);
			expect(escalatedCountAfter).toBe(escalatedCountBefore + 1);
		}
	});
});

