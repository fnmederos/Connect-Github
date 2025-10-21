# Sistema de Gestión Logística

## Overview
This logistics management application plans operations and allocates resources by managing employees, vehicles, and daily assignments, including tracking employee absences and availability. The system aims for efficiency and usability for operational teams. Its core functionalities include employee management with role-based assignments, vehicle fleet management, daily assignment planning, absence tracking, role/function CRUD management, depot/warehouse personnel scheduling with supervisor designation, vehicle-specific comments in daily assignments, and Excel export of historical daily assignments. The business vision is to streamline logistics operations, improve resource allocation, and provide clear oversight, positioning it as a comprehensive, user-friendly tool to reduce manual planning and enhance efficiency for businesses managing mobile assets and personnel.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend uses Wouter for page-based routing, shadcn/ui (Radix primitives) for reusable UI components, and custom domain components. State management relies on TanStack Query for server state and caching, integrated with the backend API for optimistic updates and invalidation, alongside React hooks for local UI state. The design system combines Material Design and Linear-inspired minimalism, featuring a utility-focused, custom HSL-based color palette, Inter font, and Tailwind CSS for a responsive, mobile-first design emphasizing productivity and data clarity.

### Backend Architecture
The backend is a RESTful Express.js server with route handlers and an abstraction layer for storage (currently in-memory, planned for database migration). It uses Drizzle ORM for type-safe operations, Zod for validation, and PostgreSQL via Neon serverless, with schemas shared between client and server for type consistency. API endpoints provide comprehensive CRUD operations for employees, vehicles, absences, daily assignments, and roles.

### Database Schema
Key tables include `users` (with Replit Auth integration and approval workflow), `sessions`, `employees` (with multi-role support and `allowDuplicates` flag), `vehicles`, `employeeAbsences`, `dailyAssignments` (denormalized for historical accuracy and Excel export), and `roles`. UUIDs are used for primary keys, array types for roles and assignmentRows, and ISO format strings for dates. The `dailyAssignments` table stores vehicle and employee details as snapshots and JSON for depot assignments to simplify Excel export, ensure historical accuracy, and improve query performance.

### Build & Deployment
Development uses Vite for the frontend (HMR) and `tsx` for backend TypeScript. Production involves Vite building the frontend to `dist/public` and esbuild bundling the backend to `dist/index.js`. Configuration includes path aliases, Tailwind with custom design tokens, PostCSS, and TypeScript strict mode.

### Authentication & Authorization
Authentication is integrated with Replit Auth (OpenID Connect), managing user sessions via Passport.js and PostgreSQL. New users undergo an approval workflow, with the first user automatically becoming an approved admin. Role-Based Access Control (RBAC) is enforced through `isAuthenticated`, `isApproved`, and `isAdmin` middleware, protecting API routes and providing an admin panel (`/admin`) for user management.

### Feature Specifications
- **Dashboard Workflow:** Manual vehicle selection, multi-select dialog for vehicles, manual row creation for assignments. Saving replaces existing assignments for the selected date.
- **History Feature:** Dedicated page (`/history`) for viewing, deleting, and managing saved daily assignments.
- **Roles Management:** Dedicated page (`/roles`) for CRUD operations on employee roles with uniqueness validation.
- **Comments and Depot Features:** Vehicle cards include comment textareas. A DEPOSITO section handles warehouse personnel scheduling with time slots, employee assignments, and a toggleable ENCARGADO (Supervisor) position.
- **Excel Export:** Exports historical daily assignments for a selected date range to an .xlsx file, including vehicle, driver, and assistant details, and depot information.
- **Image Export:** "Exportar como Imagen" button generates a PNG of the current daily planning using html2canvas. The exported image uses a compact, horizontal layout with light gray background and black text, displaying vehicle info and assignments in a single line. Color-coded badges (green for CHOFER, amber for ACOMPAÑANTE) are used. Filename includes the selected date.
- **Vehicle Reordering:** Dashboard vehicle cards can be reordered with persistent order preservation.
- **Role-Based Filtering:** Assignment dropdowns filter employees by their roles, considering availability and absence status.
- **Duplicate Prevention System:** Multi-layered prevention for employee assignments across vehicles and depot via UI filtering, automatic reconciliation, template sanitization, and continuous validation. Employees with `allowDuplicates=true` can be assigned multiple times.
- **Color-coded Badges:** Visual distinction for employee roles (CHOFER, ACOMPAÑANTE) using color-coded badges in the Dashboard and exported images.

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database.
- **Drizzle ORM**: Type-safe ORM for database interactions.
- **@neondatabase/serverless**: For connecting to Neon PostgreSQL.

### UI Libraries
- **Radix UI**: Headless component primitives.
- **shadcn/ui**: Pre-styled component implementations based on Radix UI.
- **Tailwind CSS**: Utility-first styling framework.
- **Lucide React**: Icon library.

### Frontend Libraries
- **TanStack Query**: Server state management and caching.
- **Wouter**: Lightweight routing.
- **date-fns**: Date manipulation and formatting.
- **React Hook Form**: Form state management with Zod resolvers.
- **React Day Picker**: Calendar component.
- **xlsx**: For Excel file generation.
- **html2canvas**: For capturing HTML elements as PNG images.

### Development Tools
- **Vite**: Frontend build tool and dev server.
- **esbuild**: Backend bundler.
- **tsx**: TypeScript execution for development.
- **Drizzle Kit**: Database migration tool.

### Validation & Type Safety
- **Zod**: Runtime type validation.
- **drizzle-zod**: Generates Zod schemas from Drizzle schemas.
- **TypeScript**: Static typing.