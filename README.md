# Customer Support AI Agent Dashboard

A modern, responsive dashboard for managing customer support tickets with AI-powered resolution tracking.

🌐 **Live Demo**: [https://trello-like-tickets-dashboard-react.vercel.app/](https://trello-like-tickets-dashboard-react.vercel.app/)

## Features

- 📋 **Ticket Management**: Three-column Kanban board displaying tickets by status
- 🖱️ **Drag & Drop**: Drag tickets between columns to change status (duplicates Approve/Reject functionality)
- 🔍 **Search & Filter**: Search tickets by customer name or ticket ID
- ✅ **Approval Workflow**: Approve or reject pending tickets (buttons or drag & drop)
- 📊 **Status Tracking**:
  - AI Resolved (green) - Tickets resolved by AI
  - Pending Approval (yellow) - Tickets awaiting human approval
  - Escalated (red) - Tickets requiring human intervention
- 💾 **Data Persistence**: LocalStorage-based mock API for data persistence
- 🎨 **Modern UI**: Built with a comprehensive design system using CSS custom properties

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **@dnd-kit** - Drag and drop functionality
- **Playwright** - E2E testing
- **Feature-Sliced Design** - Architecture methodology

## Project Structure

```
src/
├── app/                    # App layer (routing, pages)
├── widgets/                # Widgets layer (compositional blocks)
├── features/               # Features layer (business logic)
├── entities/               # Entities layer (business entities)
└── shared/                 # Shared layer (reusable code)
    ├── ui/                 # UI components
    ├── lib/                # Utilities
    ├── config/             # Configuration
    └── styles/             # Global styles and design tokens
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

**Note**: In production mode, the application uses IndexedDB via localforage for data persistence instead of the mock API server.

### Testing

Run end-to-end tests with Playwright:

```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed
```

See [e2e/README.md](./e2e/README.md) for more details about testing.

## Architecture

This project follows **Feature-Sliced Design (FSD)** methodology, adapted for Vite + React:

- **App Layer**: Pages and routing
- **Widgets Layer**: Compositional UI blocks
- **Features Layer**: Business scenarios and user actions
- **Entities Layer**: Business entities and data models
- **Shared Layer**: Reusable utilities and components

For detailed architecture documentation, see [docs/architecture.md](./docs/architecture.md)

## Mock API

The application uses a localStorage-based mock API:

- **Storage Key**: `tickets_data`
- **Functions**:
  - `getTickets()` - Returns all tickets
  - `updateTicketStatus(id, status)` - Updates ticket status

Data persists across page reloads using browser localStorage.

## Design System

The application uses a comprehensive design system with CSS custom properties:

- **Colors**: Status colors, primary/secondary, neutral grays
- **Spacing**: Consistent spacing scale
- **Typography**: Font sizes, line heights, weights
- **Components**: Reusable UI components (Button, Input, Card, Modal)

All components use design tokens for consistent styling and easy theming.

## License

MIT
