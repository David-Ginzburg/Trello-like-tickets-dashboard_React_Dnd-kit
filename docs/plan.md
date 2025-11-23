# Implementation Plan: Customer Support AI Agent Dashboard

## Task Description

Build a Customer Support AI Agent Dashboard with the following requirements:

1. Display tickets from GET /api/tickets (mock this endpoint)
2. Three status columns:
   - AI Resolved (green)
   - Pending Approval (yellow)
   - Escalated (red)
3. Approve pending tickets → move to resolved
4. Reject pending tickets → move to escalated
5. View ticket details (customer name, issue, AI response)
6. Filter/search by customer name or ticket ID

## Architectural Approach

The project uses Vite + React + TypeScript + React Router. We apply an adapted Feature-Sliced Design (FSD) for a regular React application (not Next.js).

## Project Structure

```
src/
├── app/                    # App layer (routing, main page)
│   ├── pages/
│   │   └── DashboardPage.tsx
│   └── router.tsx          # Update routing
├── widgets/                # Widgets layer (compositional blocks)
│   └── ticket-board/
│       └── TicketBoard.tsx
├── features/               # Features layer (business logic)
│   ├── ticket-approval/    # Approve/reject tickets
│   │   └── ui/
│   │       └── TicketActions.tsx
│   ├── ticket-details/     # View ticket details
│   │   └── ui/
│   │       └── TicketDetailsModal.tsx
│   └── ticket-filter/      # Filtering and search
│       └── ui/
│           └── TicketFilter.tsx
├── entities/               # Entities layer (business entities)
│   └── ticket/
│       ├── api/
│       │   └── ticketApi.ts    # API for working with tickets
│       ├── model/
│       │   └── types.ts        # TypeScript types
│       └── ui/
│           └── TicketCard.tsx  # Ticket card component
└── shared/                 # Shared layer (reusable code)
    ├── ui/
    │   ├── Button/
    │   │   └── Button.tsx
    │   ├── Modal/
    │   │   └── Modal.tsx
    │   ├── Input/
    │   │   └── Input.tsx
    │   └── Card/
    │       └── Card.tsx
    ├── lib/
    │   └── mockApi.ts      # Mock API for /api/tickets
    ├── config/
    │   └── constants.ts    # Constants (statuses, colors)
    └── styles/
        ├── globals.css     # Global styles and CSS variables
        ├── reset.css       # CSS reset
        └── tokens.css      # Design tokens (colors, spacing, typography)
```

## Implementation Stages

### Stage 0: UI System and Global Styles Setup

1. **Set up design tokens** (`shared/styles/tokens.css`)

   - Color palette (primary, secondary, status colors)
   - Spacing scale (margins, paddings)
   - Typography scale (font sizes, line heights, font weights)
   - Border radius values
   - Shadow definitions
   - CSS custom properties (variables)

2. **Create CSS reset** (`shared/styles/reset.css`)

   - Normalize browser defaults
   - Remove default margins/paddings
   - Set box-sizing to border-box globally

3. **Set up global styles** (`shared/styles/globals.css`)

   - Import reset.css and tokens.css
   - Base typography styles
   - Body and root element styles
   - Utility classes (if needed)
   - Dark/light theme support (optional)

4. **Update main entry point** (`src/index.css` or `src/main.tsx`)

   - Import global styles
   - Ensure styles are loaded before app renders

5. **Create UI system foundation**
   - Define component variants structure
   - Create base component props interfaces
   - Set up consistent spacing and sizing system

### Stage 1: Basic Structure and Types Setup

1. **Create ticket types** (`entities/ticket/model/types.ts`)

   - `TicketStatus`: "ai_resolved" | "pending_approval" | "escalated"
   - `Ticket`: id, customerName, issue, aiResponse, status, createdAt

2. **Create constants** (`shared/config/constants.ts`)

   - Ticket statuses
   - Column colors (green, yellow, red)
   - Column names

3. **Create mock API** (`shared/lib/mockApi.ts`)
   - Function `getTickets()` - returns array of tickets
   - Function `updateTicketStatus(id, status)` - updates ticket status
   - Use localStorage for data persistence between reloads

### Stage 2: Basic UI Components

1. **Input component** (`shared/ui/Input/Input.tsx`)

   - Reusable input field with variants
   - Support for search, text, etc.
   - Consistent styling using design tokens

2. **Button component** (`shared/ui/Button/Button.tsx`)

   - Reusable button with style variants (primary, secondary, danger, etc.)
   - Size variants (small, medium, large)
   - Disabled and loading states
   - Uses design tokens for colors and spacing

3. **Card component** (`shared/ui/Card/Card.tsx`)

   - Base card component for ticket cards
   - Consistent padding and shadow
   - Hover effects

4. **Modal component** (`shared/ui/Modal/Modal.tsx`)
   - Basic modal component for displaying ticket details
   - Overlay and backdrop
   - Close button and click-outside-to-close functionality
   - Uses design tokens for styling

### Stage 3: Ticket Components

1. **TicketCard** (`entities/ticket/ui/TicketCard.tsx`)

   - Display ticket card
   - Shows: customerName, issue (brief), status
   - Click on card opens details

2. **TicketColumn** (inside `widgets/ticket-board/`)
   - Column component with tickets of a specific status
   - Accepts status and list of tickets
   - Displays column header with color

### Stage 4: Filtering and Search

1. **TicketFilter** (`features/ticket-filter/ui/TicketFilter.tsx`)
   - Search field for customer name or ticket ID
   - Client Component with useState for filter management

### Stage 5: Ticket Actions

1. **TicketActions** (`features/ticket-approval/ui/TicketActions.tsx`)

   - "Approve" and "Reject" buttons for pending tickets
   - Client Component with event handlers
   - Calls API to update status

2. **TicketDetailsModal** (`features/ticket-details/ui/TicketDetailsModal.tsx`)
   - Modal window with full ticket information
   - Displays: customerName, issue (full text), aiResponse
   - Client Component

### Stage 6: Ticket Board Widget Composition

1. **TicketBoard** (`widgets/ticket-board/TicketBoard.tsx`)
   - Main board component with three columns
   - Filters tickets by status
   - Integrates TicketFilter, TicketColumn, TicketCard
   - Client Component (needs useState for state management)

### Stage 7: Dashboard Page

1. **DashboardPage** (`app/pages/DashboardPage.tsx`)
   - Main application page
   - Uses TicketBoard
   - Can be Server Component (if no interactivity needed at page level)

### Stage 8: Routing Update

1. **Update routes.tsx**
   - Add route `/dashboard` or `/` for main page
   - Connect DashboardPage

### Stage 9: Component Styling and Polish

1. **Apply UI system to components**

   - Use design tokens consistently across all components
   - Ensure proper spacing and typography
   - Apply color scheme (green for resolved, yellow for pending, red for escalated)

2. **Responsive design**

   - Mobile-first approach
   - Breakpoints for tablet and desktop
   - Flexible column layout

3. **Polish and animations**
   - Smooth transitions for state changes
   - Hover effects on interactive elements
   - Loading states and feedback
   - Modern and beautiful UI following design system

### Stage 10: Testing and Finalization

1. **Check functionality**

   - Ticket loading
   - Filtering works
   - Approve/reject tickets
   - View details
   - Data persistence (localStorage)

2. **Update documentation**
   - Update `docs/architecture.md` according to project rules

## Technical Details

### UI System Architecture

#### Design Tokens Structure

```css
/* shared/styles/tokens.css */
:root {
	/* Colors */
	--color-primary: #646cff;
	--color-secondary: #535bf2;
	--color-success: #10b981; /* Green for AI Resolved */
	--color-warning: #f59e0b; /* Yellow for Pending Approval */
	--color-danger: #ef4444; /* Red for Escalated */

	/* Status colors */
	--color-ai-resolved: var(--color-success);
	--color-pending-approval: var(--color-warning);
	--color-escalated: var(--color-danger);

	/* Spacing */
	--spacing-xs: 0.25rem;
	--spacing-sm: 0.5rem;
	--spacing-md: 1rem;
	--spacing-lg: 1.5rem;
	--spacing-xl: 2rem;

	/* Typography */
	--font-size-xs: 0.75rem;
	--font-size-sm: 0.875rem;
	--font-size-base: 1rem;
	--font-size-lg: 1.125rem;
	--font-size-xl: 1.25rem;

	/* Border radius */
	--radius-sm: 0.25rem;
	--radius-md: 0.5rem;
	--radius-lg: 0.75rem;

	/* Shadows */
	--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
	--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
	--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

#### Global Styles Approach

- **CSS Custom Properties**: Use CSS variables for theming and consistency
- **Component-scoped styles**: Each component can have its own CSS module or styled component
- **Utility classes**: Minimal utility classes for common patterns
- **Responsive**: Mobile-first breakpoints

### Mock API

```typescript
// shared/lib/mockApi.ts
- getTickets(): Promise<Ticket[]>
- updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket>
```

Use localStorage for data storage:

- Key: `tickets_data`
- Initialize with test data on first run
- Save to localStorage when updating status

### State Management

- Use React useState for local component state
- No global state management (Redux/Zustand) required for this task

### Data Types

```typescript
type TicketStatus = "ai_resolved" | "pending_approval" | "escalated";

interface Ticket {
	id: string;
	customerName: string;
	issue: string;
	aiResponse: string;
	status: TicketStatus;
	createdAt: string; // ISO date string
}
```

## Implementation Order

1. ✅ Stage 0: UI System and Global Styles
2. ✅ Stage 1: Types and constants
3. ✅ Stage 2: Basic UI components
4. ✅ Stage 3: TicketCard and TicketColumn
5. ✅ Stage 4: Filtering
6. ✅ Stage 5: Actions and modal
7. ✅ Stage 6: TicketBoard
8. ✅ Stage 7: DashboardPage
9. ✅ Stage 8: Routing
10. ✅ Stage 9: Component Styling and Polish
11. ✅ Stage 10: Testing and documentation

## Notes

- All components must be typed with TypeScript
- Code must follow project architectural rules
- UI must be modern and user-friendly
- Use design tokens consistently - never hardcode colors or spacing values
- Follow the established UI system patterns for all new components
- Update `docs/architecture.md` after completion
