import { test, expect } from "@playwright/test";

test.describe("Customer Support AI Agent Dashboard", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
	});

	test("should display dashboard title", async ({ page }) => {
		await expect(
			page.getByRole("heading", { name: "Customer Support AI Agent Dashboard" }),
		).toBeVisible();
	});

	test("should display three status columns", async ({ page }) => {
		await expect(page.getByText("AI Resolved")).toBeVisible();
		await expect(page.getByText("Pending Approval")).toBeVisible();
		await expect(page.getByText("Escalated")).toBeVisible();
	});

	test("should display tickets in columns", async ({ page }) => {
		await expect(page.getByTestId("ticket-column-ai_resolved")).toBeVisible();
		await expect(page.getByTestId("ticket-column-pending_approval")).toBeVisible();
		await expect(page.getByTestId("ticket-column-escalated")).toBeVisible();
	});

	test("should filter tickets by customer name", async ({ page }) => {
		const searchInput = page.getByTestId("ticket-search-input");
		await searchInput.fill("John");

		await page.waitForTimeout(500);

		const tickets = page.locator('[data-testid^="ticket-card-"]');
		const count = await tickets.count();

		for (let i = 0; i < count; i++) {
			const ticket = tickets.nth(i);
			const customerName = await ticket
				.locator(".ticket-card__customer")
				.textContent();
			expect(customerName?.toLowerCase()).toContain("john");
		}
	});

	test("should filter tickets by ticket ID", async ({ page }) => {
		const searchInput = page.getByTestId("ticket-search-input");
		await searchInput.fill("TKT-001");

		await page.waitForTimeout(500);

		await expect(page.getByTestId("ticket-card-TKT-001")).toBeVisible();
	});

	test("should open ticket details modal on click", async ({ page }) => {
		const firstTicket = page.locator('[data-testid^="ticket-card-"]').first();
		const card = firstTicket.locator(".ticket-card");
		await card.click();

		await expect(page.getByTestId("modal")).toBeVisible();
		await expect(page.getByText(/Ticket TKT-/)).toBeVisible();
	});

	test("should display ticket details in modal", async ({ page }) => {
		const firstTicket = page.locator('[data-testid^="ticket-card-"]').first();
		const card = firstTicket.locator(".ticket-card");
		await card.click();

		await page.waitForSelector('[data-testid="modal"]');

		await expect(page.getByText("Customer Name")).toBeVisible();
		await expect(page.getByText("Issue")).toBeVisible();
		await expect(page.getByText("AI Response")).toBeVisible();
	});

	test("should close modal when clicking close button", async ({ page }) => {
		const firstTicket = page.locator('[data-testid^="ticket-card-"]').first();
		const card = firstTicket.locator(".ticket-card");
		await card.click();

		await page.waitForSelector('[data-testid="modal"]');

		const closeButton = page.getByTestId("modal-close-button");
		await closeButton.click();

		await expect(page.getByTestId("modal")).not.toBeVisible();
	});

	test("should close modal when pressing Escape", async ({ page }) => {
		const firstTicket = page.locator('[data-testid^="ticket-card-"]').first();
		const card = firstTicket.locator(".ticket-card");
		await card.click();

		await page.waitForSelector('[data-testid="modal"]');

		await page.keyboard.press("Escape");

		await expect(page.getByTestId("modal")).not.toBeVisible();
	});
});

