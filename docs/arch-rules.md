# Architectural Rules and Patterns

## 1. Introduction

This document defines architectural rules and patterns that must be followed during project development. The goal is to ensure codebase cleanliness, scalability, and maintainability.

## 2. Code Language Standards

**All code must be written in English:**

- Variable names, function names, class names
- Comments and documentation
- Error messages and logs
- API responses and user-facing text
- File and folder names
- Git commit messages

**Exceptions:**

- User-facing UI text can be in the target language (Russian in this case)
- Database content can be in any language
- Configuration files can use language-appropriate values

This ensures international collaboration and code maintainability.

---

## 3. Backend Architecture (Express.js)

For the backend, **Layered Architecture** is applied. This approach ensures strict separation of concerns (Separation of Concerns), which simplifies testing, refactoring, and code understanding.

**Request Flow:** `Request -> Routes -> Controllers -> Services -> Data Access Layer (Prisma)`

### 3.1. Layer Description

#### 1. Routing Layer (Routes)

- **Location:** `/server/src/routes`
- **Responsibilities:**
  - Define HTTP endpoints (e.g., `/api/login`)
  - Bind endpoints to HTTP methods (`GET`, `POST`, etc.)
  - (Optional) Validate incoming data (request body, parameters)
  - Delegate control to the appropriate Controller method
- **Rules:** No business logic. Only routing.

#### 2. Controllers Layer

- **Location:** `/server/src/controllers`
- **Responsibilities:**
  - "Orchestrate" request processing
  - Extract data from `request` and `response` objects
  - Call one or more Service layer methods
  - Form and send HTTP responses (JSON, status codes)
- **Rules:** No business logic or direct database queries. Acts as thin "glue" between HTTP world and application logic.

#### 3. Services Layer

- **Location:** `/server/src/services`
- **Responsibilities:**
  - **Implement all application business logic**
  - Coordinate operations, work with data, perform calculations
  - Call Data Access Layer methods for database interaction
- **Rules:** Completely independent of HTTP. Doesn't know about `request` and `response`. Can be reused in other parts of the application (e.g., console scripts).

#### 4. Data Access Layer (DAL)

- **Implementation:** Prisma Client
- **Location:** `/server/src/lib/prisma.ts` (singleton instance)
- **Responsibilities:**
  - Single point of database interaction
  - Execute all CRUD operations (Create, Read, Update, Delete)

---

## 4. Frontend Architecture (Vite + React & Feature-Sliced Design)

For the frontend, **Feature-Sliced Design (FSD)** methodology is applied, adapted for **Vite + React** application with React Router for routing.

### 4.1. Key Adaptation Principles

- **React Router for routing:** Routing is handled by React Router (`react-router-dom`). Pages are defined in the `pages` layer and composed from widgets, features, and entities.
- **Client Components by default:** All React components are client-side components. Components use React hooks (`useState`, `useEffect`, etc.) for state management and interactivity.

### 4.2. Layer Structure (from top to bottom)

#### 1. `app`

- **Location:** `/src/app`
- **Responsibilities:** Application initialization, routing configuration, root layout. Contains router setup and main App component that composes pages from widgets and features.

#### 2. `widgets`

- **Location:** `/src/widgets`
- **Responsibilities:** Compositional, self-contained UI blocks. Combine features and entities into a single meaningful block.
- **Examples:** `<TicketBoard />`, `<Dashboard />`, `<ProfileCard />`
- **Type:** React components that compose features and entities, often containing business logic hooks.

#### 3. `features`

- **Location:** `/src/features`
- **Responsibilities:** Implementation of business scenarios and user actions. This layer brings business value.
- **Examples:** `<TicketFilter />`, `<TicketActions />`, `<TicketDetailsModal />`
- **Type:** React components with state management and event handlers using hooks.

#### 4. `entities`

- **Location:** `/src/entities`
- **Responsibilities:** Representation of business entities. Application framework.
- **Examples:** `<TicketCard ticket={...} />`, `<UserAvatar user={...} />`
- **Type:** React components that display business entity data, often with minimal state.

#### 5. `shared`

- **Location:** `/src/shared`
- **Responsibilities:** Reusable code unrelated to business logic.
- **Subdirectories:**
  - `ui/`: UI kit (e.g., `<Button />`, `<Input />`, `<Card />`, `<Modal />`). Reusable React components.
  - `lib/`: Helper functions and utilities (e.g., `formatDate`, `utils.ts`)
  - `api/`: Functions for API interaction (e.g., `ticketApi.ts`)
  - `mock/`: Mock API implementation for development (e.g., `mockData.ts`, `mockApiPlugin.ts`)
  - `styles/`: Global styles, design tokens, CSS files
- **Rules:** This layer should not depend on any of the upper layers.
