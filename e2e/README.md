# E2E Tests with Playwright

This directory contains end-to-end tests for the Customer Support AI Agent Dashboard.

## Test Files

- **dashboard.spec.ts** - Tests for dashboard display, filtering, and modal functionality
- **ticket-actions.spec.ts** - Tests for approve/reject actions
- **drag-and-drop.spec.ts** - Tests for drag and drop functionality

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run specific test file
```bash
npx playwright test e2e/dashboard.spec.ts
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

## Test Coverage

### Dashboard Tests
- ✅ Display dashboard title
- ✅ Display three status columns
- ✅ Display tickets in columns
- ✅ Filter tickets by customer name
- ✅ Filter tickets by ticket ID
- ✅ Open ticket details modal on click
- ✅ Display ticket details in modal
- ✅ Close modal (button and Escape key)

### Ticket Actions Tests
- ✅ Show Approve/Reject buttons for pending tickets
- ✅ Hide action buttons for resolved/escalated tickets
- ✅ Approve pending ticket
- ✅ Reject pending ticket

### Drag and Drop Tests
- ✅ Allow dragging pending approval tickets
- ✅ Prevent dragging resolved tickets
- ✅ Prevent dragging escalated tickets
- ✅ Move pending ticket to resolved via drag and drop
- ✅ Move pending ticket to escalated via drag and drop

## Configuration

Tests are configured in `playwright.config.ts`. The configuration includes:
- Automatic dev server startup
- Base URL: `http://localhost:5173`
- Browser: Chromium
- Screenshots on failure
- HTML report generation

## Test Data

Tests use the mock API with localStorage. Test data is initialized automatically when the app loads.


