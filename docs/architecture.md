# Full-Stack Application Architecture with Feature Flags

## Architecture Overview

This application implements a full-stack solution with server-side feature flag rendering, following clean architecture principles and separation of concerns.

## Code Language Standards

**All code must be written in English:**

- Variable names, function names, class names
- Comments and documentation
- Error messages and logs
- API responses
- File and folder names
- Git commit messages

**Exceptions:**

- User-facing UI text can be in the target language (Russian in this case)
- Database content can be in any language
- Configuration files can use language-appropriate values

This ensures international collaboration and code maintainability.

## Recent Changes (2024)

### Search Functionality Refactoring

- **Separated search logic**: Extracted search functionality from `useTicketModal` into dedicated `useTicketSearch` hook
- **Better separation of concerns**: Search state management is now isolated from modal state management
- **Hook location**: `src/widgets/ticket-board/model/hooks/useTicketSearch.ts`
- **Benefits**: Improved code organization, easier to test and maintain search functionality independently

### Toast Notifications

- **react-toastify integration**: Added toast notifications for user feedback
- **Status change notifications**: Notifications appear when ticket status is changed via drag-and-drop or approve/reject buttons
- **Notification types**:
  - Success (green) for approved tickets (ai_resolved) and other status changes
  - Error (red) for rejected/escalated tickets (escalated)
  - Error (red) for failed status change operations
- **Messages**: All notifications are in English
- **Mobile-friendly**: Toast notifications are optimized for mobile devices with responsive styling
- **Position**: Notifications appear in the top-right corner on desktop, full-width with margins on mobile

### Documentation Updates

- **Architecture documentation**: Updated to reflect Vite + React architecture instead of Next.js
- **Removed Next.js references**: All mentions of Next.js, Server Components, and App Router replaced with Vite + React + React Router
- **Updated FSD structure**: Documentation now accurately describes React-based Feature-Sliced Design implementation
- **Component types**: Updated to reflect React client components instead of Next.js Server/Client components

### Production Storage with IndexedDB

- **Dual storage architecture**: Development uses mock API server, production uses IndexedDB
- **localforage integration**: Added IndexedDB storage via localforage library for production builds
- **Automatic adapter switching**: `ticketApi` automatically detects environment and uses appropriate storage
- **Data persistence**: Production builds now persist data across browser sessions using IndexedDB
- **Initial data seeding**: IndexedDB automatically initializes with mock data if empty
- **API compatibility**: Same API interface works in both dev and production modes

### UI Layout Improvements

- **Controls layout**: Moved "Refresh Data" button to the right of search input
- **Visual alignment**: Button and search input now have matching height and are properly aligned
- **Styling consistency**: Updated button size from "sm" to "md" to match input height
- **Flex layout**: Improved flex container with `align-items: stretch` for consistent element heights

### Mock API Refactoring

- **Code organization**: Moved all mock API logic from `vite.config.ts` to `src/shared/mock/` directory
- **Separation of concerns**: Split mock data management (`mockData.ts`) and Vite plugin (`mockApiPlugin.ts`)
- **Better maintainability**: Mock API code is now organized in dedicated shared module
- **Type safety**: Uses shared Ticket types from entities layer

### Enhanced Drag-and-Drop Functionality

- **Standard dnd-kit implementation**: Uses standard dnd-kit hooks (`useDroppable`, `useSortable`) with custom collision detection
- **Multi-container sorting**: Cards can be sorted within columns and moved between columns with automatic position detection
- **Real-time updates**: `onDragOver` handler updates card positions in real-time as user drags between columns
- **Backend persistence**: Order changes are saved to backend via `/api/tickets/reorder` endpoint
- **Visual feedback**: Cards automatically shift to make space when dragging (standard dnd-kit behavior via `transform`)

### Customer Support AI Agent Dashboard Implementation

- **New application**: Customer Support AI Agent Dashboard built with Vite + React + TypeScript
- **UI System**: Complete design system with CSS custom properties (design tokens)
- **Feature-Sliced Design**: Applied FSD architecture adapted for Vite React application
- **Mock API**: LocalStorage-based mock API for ticket management
- **Components**: Full set of reusable UI components (Button, Input, Card, Modal)
- **Ticket Management**: Three-column board with status-based organization (AI Resolved, Pending Approval, Escalated)
- **Features**: Ticket filtering, approval/rejection workflow, detailed view modal
- **Drag-and-Drop**: Status change via drag-and-drop with visual feedback

### Migration to Feature-Sliced Design (FSD)

- **Complete client reorganization**: Transition from traditional structure to FSD architecture
- **Layered structure**: app → widgets → features → entities → shared
- **Separation of concerns**: Clear separation of components by business logic
- **Code reusability**: Improved modularity and component reusability

### New Client Structure

- **Shared layer**: Common UI components (Button, Spinner), utilities and API
- **Entities layer**: Data models (User, FeatureFlags) and API for working with them
- **Features layer**: Business functions (authentication, admin)
- **Widgets layer**: Compositional UI blocks (dashboard, admin panel)
- **Pages layer**: Pages and common components (Header)

### Security and Configuration

- **Improved cookie security**: Added conditional `secure` and `sameSite` flag configuration based on environment
- **Migration to ES Modules**: Transition from CommonJS to ES Modules for server using `tsx` instead of `ts-node-dev`
- **TypeScript configuration**: Updated configuration to support ES Modules with `verbatimModuleSyntax`

### User Interface

- **Loading system**: Added loading states for async operations
- **Navigation**: Uses React Router for client-side navigation
- **Component composition**: UI built from reusable components following FSD principles

### Caching and Performance

- **API call optimization**: Implemented custom caching for `/api/flags` with 60-second revalidation
- **REST API improvements**: Transition from query parameters to Authorization header for token passing
- **Logging**: Added detailed logging for API call monitoring

### Internationalization

- **Interface translation**: All user messages translated from Russian to English
- **Code cleanup**: Removed all comments from codebase for improved readability

## Architectural Principles

### 1. Layered Architecture

- **Separation of concerns**: Each layer has a clearly defined role
- **Independence**: Layers are loosely coupled
- **Testability**: Each layer can be tested in isolation

### 2. Feature-Sliced Design (FSD)

- **Layered structure**: app → widgets → features → entities → shared
- **React components**: All components are client-side React components
- **Reusability**: Components organized by business logic

## Backend Architecture

### Layers and Data Flow

```
HTTP Request → Routes → Controllers → Services → Data Access Layer (Prisma)
```

#### 1. Routes Layer (`/server/src/routes/`)

- **Responsibility**: HTTP routing
- **Files**: `auth.routes.ts`
- **Rules**: Only endpoint definition, no business logic

#### 2. Controllers Layer (`/server/src/controllers/`)

- **Responsibility**: HTTP request/response handling
- **Files**: `auth.controller.ts`
- **Rules**: Thin layer between HTTP and business logic

#### 3. Services Layer (`/server/src/services/`)

- **Responsibility**: All application business logic
- **Files**: `auth.service.ts`
- **Rules**: Independent of HTTP, reusable

#### 4. Data Access Layer (`/server/src/lib/`)

- **Responsibility**: Database interaction
- **Files**: `prisma.ts`
- **Rules**: Single point of database access

### API Endpoints

| Endpoint        | Method | Description        | Authentication      | Caching |
| --------------- | ------ | ------------------ | ------------------- | ------- |
| `/api/register` | POST   | User registration  | No                  | No      |
| `/api/login`    | POST   | Authentication     | No                  | No      |
| `/api/logout`   | POST   | Logout             | No                  | No      |
| `/api/me`       | GET    | Current user data  | Yes (Cookie/Header) | No      |
| `/api/flags`    | GET    | User feature flags | Yes (Cookie/Header) | 60 sec  |

### Authentication

#### Supported Methods

- **Cookie-based**: `auth_token` in httpOnly cookie
- **Header-based**: `Authorization: Bearer <token>` header
- **Priority**: Header takes priority over cookie

#### Cookie Settings

```typescript
// Development
{
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/"
}

// Production
{
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/"
}
```

### Feature Flags System

#### Role-Based Access Control

| Role   | canViewAnalytics | canEditContent | showAdminDashboard | canAccessSettings |
| ------ | ---------------- | -------------- | ------------------ | ----------------- |
| VIEWER | ❌               | ❌             | ❌                 | ❌                |
| EDITOR | ✅               | ✅             | ❌                 | ✅                |
| ADMIN  | ✅               | ✅             | ✅                 | ✅                |

#### Implementation

- **Server-side rendering**: Flags fetched on server
- **Caching**: 60-second cache with ETag support
- **Security**: Role-based access control
- **Fallback**: Default flags for unauthenticated users

## Frontend Architecture

### Customer Support AI Agent Dashboard (Vite + React)

This section describes the Customer Support AI Agent Dashboard application built with Vite, React, and TypeScript.

#### Project Structure

```
src/
├── app/                    # App layer (routing, pages)
│   └── pages/
│       └── DashboardPage.tsx
├── widgets/                # Widgets layer (compositional blocks)
│   └── ticket-board/
│       ├── TicketBoard.tsx
│       ├── TicketColumn.tsx
│       └── *.css
├── features/               # Features layer (business logic)
│   ├── ticket-approval/
│   │   └── ui/
│   │       └── TicketActions.tsx
│   ├── ticket-details/
│   │   └── ui/
│   │       └── TicketDetailsModal.tsx
│   └── ticket-filter/
│       └── ui/
│           └── TicketFilter.tsx
├── entities/               # Entities layer (business entities)
│   └── ticket/
│       ├── model/
│       │   ├── types.ts
│       │   └── const/
│       │       └── constants.ts
│       └── ui/
│           └── TicketCard.tsx
└── shared/                 # Shared layer (reusable code)
    ├── ui/                 # UI components
    │   ├── Button/
    │   ├── Input/
    │   ├── Card/
    │   └── Modal/
    ├── api/                # API clients
    │   ├── ticketApi.ts    # Unified ticket API (switches between dev/prod adapters)
    │   └── indexedDbAdapter.ts # IndexedDB adapter for production mode
    ├── mock/               # Mock API implementation
    │   ├── mockData.ts     # Mock data generation and management
    │   └── mockApiPlugin.ts # Vite plugin for mock API middleware
    ├── lib/
    │   └── utils.ts        # Utility functions
    └── styles/             # Global styles
        ├── tokens.css      # Design tokens (CSS variables)
        ├── reset.css       # CSS reset
        └── globals.css     # Global styles
```

#### UI System and Design Tokens

The application uses a comprehensive design system based on CSS custom properties:

- **Colors**: Primary, secondary, status colors (success, warning, danger), neutral grays
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
- **Typography**: Font sizes, line heights, font weights
- **Border radius**: Consistent border radius values
- **Shadows**: Elevation system with multiple shadow levels
- **Transitions**: Standardized transition timings

All components use design tokens for consistent styling and easy theming.

#### Data Storage Architecture

The application uses different storage mechanisms depending on the environment:

**Development Mode (DEV):**

- **Mock API Server**: Vite middleware plugin provides HTTP API endpoints
- **Location**: `src/shared/mock/`
- **Files**:
  - `mockData.ts`: Mock data generation and in-memory storage management
  - `mockApiPlugin.ts`: Vite plugin that provides API middleware for development
- **Storage**: In-memory storage using Node.js `global` object (persists during dev server lifetime)
- **Endpoints**:
  - `GET /api/tickets`: Get all tickets
  - `POST /api/tickets/refresh`: Reset mock data to initial state
  - `POST /api/tickets/reorder`: Reorder tickets by IDs array
  - `POST /api/tickets/:id/move`: Move ticket to another column with specific index
  - `PATCH /api/tickets/:id`: Update ticket status
- **Configuration**: Plugin is registered in `vite.config.ts` and only active in development mode

**Production Mode (BUILD):**

- **IndexedDB Storage**: Client-side storage using localforage library
- **Location**: `src/shared/api/`
- **Files**:
  - `indexedDbAdapter.ts`: IndexedDB adapter using localforage for persistent storage
  - `ticketApi.ts`: Unified API interface that switches between dev/production adapters
- **Storage**: IndexedDB via localforage (persists across browser sessions)
- **Library**: `localforage` - provides async key-value storage with IndexedDB backend
- **Initialization**: Automatically initializes with mock data if storage is empty
- **Persistence**: All changes persist across page reloads and browser sessions

**API Adapter Pattern:**

- `ticketApi.ts` automatically detects environment (`import.meta.env.DEV`)
- Uses mock server adapter in development mode
- Uses IndexedDB adapter in production mode
- Same API interface for both modes, transparent to application code

#### Ticket Statuses

- **AI Resolved** (green): Tickets resolved by AI
- **Pending Approval** (yellow): Tickets awaiting human approval
- **Escalated** (red): Tickets that need human intervention

#### Key Features

1. **Ticket Board**: Three-column Kanban-style board displaying tickets by status
2. **Filtering**: Search by customer name or ticket ID
3. **Ticket Details**: Modal view with full ticket information
4. **Approval Workflow**: Approve pending tickets (moves to resolved) or reject (moves to escalated)
5. **Responsive Design**: Mobile-first responsive layout

### Feature-Sliced Design (FSD) Structure

```
src/
├── app/                    # App layer (routing, initialization)
│   ├── App.tsx            # Root App component
│   └── router.tsx         # React Router configuration
├── pages/                  # Pages layer
│   └── DashboardPage.tsx  # Dashboard page
├── widgets/                # Widgets layer
│   └── ticket-board/      # Ticket board widget
│       ├── TicketBoard.tsx
│       ├── TicketColumn.tsx
│       └── model/
│           └── hooks/     # Widget-specific hooks
├── features/               # Features layer
│   ├── ticket-filter/      # Ticket filtering feature
│   ├── ticket-approval/    # Ticket approval feature
│   └── ticket-details/    # Ticket details feature
├── entities/               # Entities layer
│   └── ticket/            # Ticket entity
│       ├── model/
│       │   ├── types.ts
│       │   └── hooks/
│       └── ui/
│           └── TicketCard.tsx
└── shared/                 # Shared layer
    ├── ui/                 # UI components
    │   ├── Button/
    │   ├── Input/
    │   ├── Card/
    │   └── Modal/
    ├── api/                # API clients
    │   ├── ticketApi.ts
    │   └── indexedDbAdapter.ts
    ├── mock/               # Mock API
    │   ├── mockData.ts
    │   └── mockApiPlugin.ts
    ├── lib/                # Utilities
    │   └── utils.ts
    └── styles/             # Global styles
        ├── tokens.css
        ├── reset.css
        └── globals.css
```

### FSD Layers

#### 1. App Layer (`/src/app/`)

- **Responsibility**: Application initialization and routing configuration
- **Files**: `App.tsx`, `router.tsx`
- **Type**: React components
- **Rules**: Sets up routing and composes pages from widgets and features
- **Features**:
  - React Router configuration
  - Root App component that wraps the application
  - Route definitions
  - Toast notifications container (react-toastify) for user feedback

#### 2. Pages Layer (`/src/pages/`)

- **Responsibility**: Page components that compose widgets and features
- **Files**: `DashboardPage.tsx`
- **Type**: React components
- **Rules**: Pages compose widgets and features, minimal logic

#### 3. Widgets Layer (`/src/widgets/`)

- **Responsibility**: Compositional UI blocks that combine features and entities
- **Files**: `ticket-board/` - Ticket board widget
- **Type**: React components with business logic hooks
- **Rules**: Can use features, entities, and shared layers

**Ticket Board Widget Hooks** (`widgets/ticket-board/model/hooks/`):

- `useTickets()` - Manages ticket data fetching, updates, and reordering
- `useTicketSearch()` - Manages search filter state (filter string and setter)
- `useTicketFilter(tickets, filter)` - Filters tickets by customer name or ID
- `useTicketGrouping(tickets)` - Groups tickets by status
- `useTicketModal()` - Manages modal state (selected ticket, open/close)
- `useDragAndDrop()` - Handles drag-and-drop functionality for ticket cards

#### 4. Features Layer (`/src/features/`)

- **Responsibility**: Business functions and scenarios
- **Files**:
  - `ticket-filter/` - Ticket filtering feature
  - `ticket-approval/` - Ticket approval workflow
  - `ticket-details/` - Ticket details display
- **Type**: React components with hooks
- **Rules**: Business logic implementation, can use entities and shared

#### 5. Entities Layer (`/src/entities/`)

- **Responsibility**: Business entities and data models
- **Files**:
  - `ticket/` - Ticket entity (types, hooks, UI components)
- **Type**: React components and TypeScript types
- **Rules**: Data models and entity UI, can use shared

#### 6. Shared Layer (`/src/shared/`)

- **Responsibility**: Reusable utilities and components
- **Files**:
  - `ui/` - UI components (Button, Input, Card, Modal)
  - `lib/` - Utilities (utils.ts)
  - `api/` - API clients (ticketApi.ts, indexedDbAdapter.ts)
  - `mock/` - Mock API implementation (mockData.ts, mockApiPlugin.ts)
  - `styles/` - Global styles and design tokens
- **Type**: React components, utilities, and configuration
- **Rules**: No dependencies on other layers

### Component Types

#### React Components

- **Usage**: All components are React client components
- **State Management**: Uses React hooks (`useState`, `useEffect`, `useCallback`, etc.)
- **Examples**: `TicketBoard`, `TicketCard`, `TicketFilter`
- **Benefits**: Interactive UI, client-side state management, browser APIs access

### Import Rules

#### Allowed Imports

- **App layer**: Can import from features, entities, shared
- **Features layer**: Can import from entities, shared
- **Entities layer**: Can import from shared
- **Shared layer**: Cannot import from other layers

#### Forbidden Imports

- **Cross-layer imports**: Features cannot import from app
- **Circular dependencies**: Any circular imports are forbidden
- **Direct file imports**: Use index.ts files for clean imports

## Caching Strategy

### Server-Side Caching

- **Feature flags**: 60-second cache with ETag
- **User data**: No caching (always fresh)
- **Static assets**: Browser caching

### Client-Side Caching

- **Vite build**: Optimized production builds with code splitting
- **API responses**: IndexedDB persistence for production mode
- **Component state**: React state management with hooks

## Security

### Authentication

- **JWT tokens**: Secure token-based authentication
- **HttpOnly cookies**: XSS protection
- **CSRF protection**: SameSite cookie attribute
- **Secure headers**: Production security settings

### Authorization

- **Role-based access**: ADMIN, EDITOR, VIEWER roles
- **Feature flags**: Server-side access control
- **API protection**: Authentication required for sensitive endpoints

## Performance

### Optimization

- **Vite build**: Fast development server and optimized production builds
- **Code splitting**: Automatic code splitting via Vite
- **Tree shaking**: Unused code elimination in production builds
- **Caching**: IndexedDB for data persistence, browser caching for assets

### Monitoring

- **API logging**: Detailed request/response logging
- **Error tracking**: Comprehensive error handling
- **Performance metrics**: Browser DevTools Performance API, React DevTools Profiler

## Development Guidelines

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **English only**: All code in English

### Testing

- **Unit tests**: Component and function testing
- **Integration tests**: API endpoint testing
- **E2E tests**: Full application testing

### Deployment

- **Build process**: Vite production build with TypeScript compilation
- **Build output**: `dist/` directory with optimized assets
- **Environment variables**: Secure configuration
- **Docker**: Containerized deployment (if needed)
- **Database migrations**: Prisma migration system (if backend is added)

## Troubleshooting

### Common Issues

- **Authentication errors**: Check cookie settings and CORS
- **Feature flag issues**: Verify role permissions and caching
- **Build errors**: Check TypeScript and import paths
- **Performance issues**: Monitor caching and component rendering

### Debug Tools

- **Vite dev server**: Fast HMR (Hot Module Replacement) for development
- **Browser dev tools**: Client-side debugging, React DevTools
- **IndexedDB inspection**: Browser DevTools → Application → IndexedDB
- **Performance profiling**: React DevTools Profiler, Chrome DevTools Performance

## Customer Support Dashboard API

### Ticket API Endpoints

The application provides a unified API interface that works differently in dev and production:

| Endpoint                                | Method | Description            | Dev Implementation                             | Production Implementation      |
| --------------------------------------- | ------ | ---------------------- | ---------------------------------------------- | ------------------------------ |
| `getTickets()`                          | -      | Get all tickets        | `GET /api/tickets` - Vite middleware           | IndexedDB via localforage      |
| `refreshTickets()`                      | -      | Reset to initial data  | `POST /api/tickets/refresh` - Vite middleware  | IndexedDB reset with mock data |
| `reorderTickets(ticketIds)`             | -      | Reorder tickets by IDs | `POST /api/tickets/reorder` - Vite middleware  | IndexedDB reorder operation    |
| `moveTicketToColumn(id, status, index)` | -      | Move ticket to column  | `POST /api/tickets/:id/move` - Vite middleware | IndexedDB move operation       |
| `updateTicketStatus(id, status)`        | -      | Update ticket status   | `PATCH /api/tickets/:id` - Vite middleware     | IndexedDB update operation     |

**Note**: In development mode, endpoints are HTTP requests to Vite middleware. In production mode, all operations are direct IndexedDB operations via localforage, providing the same API interface transparently.

### Ticket Status Flow

```
Pending Approval
    ↓
Approve → AI Resolved (green)
    ↓
Reject → Escalated (red)
```

### Component Hierarchy

```
DashboardPage
  └── TicketBoard
      ├── TicketFilter
      └── TicketColumn[] (3 columns)
          └── TicketCard[]
              ├── (onDrag) → Status change via drag-and-drop
              └── (onClick) → TicketDetailsModal
                  └── TicketActions (if pending)
```

### Drag-and-Drop Implementation

- **Library**: `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop functionality
- **Standard hooks**: Uses `useDroppable` and `useSortable` from dnd-kit
- **Sorting**: Uses `arrayMove` from `@dnd-kit/sortable` for reordering cards within columns
- **Visual feedback**:
  - Cards automatically shift to make space when dragging (standard dnd-kit behavior via `transform`)
  - Column highlights when dragging over it using `isOver` from `useDroppable`
  - Dragged card is shown in `DragOverlay` while original becomes transparent
- **Position tracking**: Uses standard `transform` from `useSortable` - cards automatically move to make space
- **Status update**: Dropping card in different column updates ticket status via API
- **Reordering**: Cards can be reordered within the same column or inserted at specific positions in other columns
- **Restrictions**: Only "pending_approval" tickets can be dragged (disabled in `useSortable`)
