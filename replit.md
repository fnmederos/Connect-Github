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
Key tables include `users` (with username/password authentication and approval workflow), `sessions`, `employees` (with multi-role support, `allowDuplicates` flag, and `userId` scoping), `vehicles` (with `userId` scoping), `employeeAbsences` (with `userId` scoping), `dailyAssignments` (denormalized for historical accuracy, Excel export, and `userId` scoping), and `roles` (with `userId` scoping).

**User Table:**
- `username`: Unique username for login
- `email`: User's email address
- `passwordHash`: Bcrypt-hashed password
- `role`: Either "admin" or "user"
- `isApproved`: Approval status flag
- `requestedAt`, `approvedAt`: Timestamps for approval workflow

**Multi-Tenant Tables:**
All data tables (employees, vehicles, roles, templates, dailyAssignments, employeeAbsences) include a `userId` column that references the owning user, ensuring complete data isolation.

UUIDs are used for primary keys, array types for roles and assignmentRows, and ISO format strings for dates. The `dailyAssignments` table stores vehicle and employee details as snapshots and JSON for depot assignments to simplify Excel export, ensure historical accuracy, and improve query performance.

### Build & Deployment
Development uses Vite for the frontend (HMR) and `tsx` for backend TypeScript. Production involves Vite building the frontend to `dist/public` and esbuild bundling the backend to `dist/index.js`. Configuration includes path aliases, Tailwind with custom design tokens, PostCSS, and TypeScript strict mode.

**Recent Deployment Fixes (October 30, 2025):**
- Database schema synchronized: Added `companies` table, `loading_status`, `loading_status_data`, and `selected_company_id` columns
- Session management reconfigured to use shared Neon connection pool (fixes "ENOTFOUND base" error)
- SSL configuration automated for production via `NODE_ENV=production`
- Build tools moved from devDependencies to dependencies for Render compatibility:
  - `drizzle-kit` - For database migrations
  - `vite`, `esbuild` - For building frontend/backend
  - `typescript` - TypeScript compiler
  - `tailwindcss`, `postcss`, `autoprefixer` - CSS processing
  - `@tailwindcss/typography` - Tailwind plugin (required by tailwind.config.ts)
  - `@vitejs/plugin-react`, `@tailwindcss/vite` - Build plugins
- Vite config updated to load Replit plugins conditionally (development only)
- Comprehensive deployment guide created in `RENDER_DEPLOYMENT.md`

**Deployment to Render:**
- Database migrations automated via `npm run db:push -- --force` in build command
- Requires Neon Pooled Connection String with `-pooler` and `?sslmode=require`
- Environment variables: `DATABASE_URL`, `NODE_ENV=production`, `SESSION_SECRET`

### Authentication & Authorization
The system uses traditional username/password authentication with bcrypt for password hashing. User sessions are managed via express-session with PostgreSQL storage. Each user has an isolated workspace with complete data separation - all employees, vehicles, roles, templates, and assignments are scoped to the user's account.

**Authentication Flow:**
- Registration: Users create accounts with username, email, and password
- First User: Automatically promoted to admin and approved
- Subsequent Users: Require admin approval before accessing the application
- Login: Standard username/password authentication
- Session: Managed via express-session with PostgreSQL store

**Multi-Tenancy & Data Isolation:**
All domain tables (employees, vehicles, roles, templates, dailyAssignments, employeeAbsences) include a `userId` foreign key. Every CRUD operation is scoped to the authenticated user's ID, ensuring complete data isolation between accounts. This allows multiple companies to use the same system independently.

**Authorization Middleware:**
- `isAuthenticated`: Verifies user is logged in
- `isApproved`: Ensures user has been approved by admin
- `isAdmin`: Restricts access to admin-only features

**Admin Panel:**
Located at `/admin`, accessible only to admin users, allows:
- Viewing all registered users
- Approving/rejecting user registration requests
- Monitoring user approval status

### Feature Specifications
- **Dashboard Workflow:** Manual vehicle selection, multi-select dialog for vehicles, manual row creation for assignments. Saving replaces existing assignments for the selected date.
- **Dashboard State Persistence:** Automatic localStorage-based state persistence ensures work is not lost when navigating away from the dashboard. The system saves date selection, selected vehicles, assignments, comments, loading statuses, and depot assignments continuously. State is automatically restored when returning to the dashboard and is cleared when saving to the database or loading a template, ensuring intentional actions (save/load) take priority over temporary state.
- **History Feature:** Dedicated page (`/history`) for viewing, deleting, editing, and managing saved daily assignments. Each assignment can be individually edited to reflect what actually happened in operations (e.g., personnel absences, last-minute changes). The edit dialog provides full CRUD capabilities for assignment rows with validation to ensure data integrity. All edits are validated both client-side (visual feedback, required field validation) and server-side (JSON structure validation, required field presence). Changes are immediately reflected in Excel and PNG exports through automatic cache invalidation.
- **Roles Management:** Dedicated page (`/roles`) for CRUD operations on employee roles with uniqueness validation.
- **Comments and Depot Features:** Vehicle cards include comment textareas. A DEPOSITO section handles warehouse personnel scheduling with time slots, employee assignments, and a toggleable ENCARGADO (Supervisor) position.
- **Loading Status Feature:** Each vehicle card includes a dropdown to assign loading priority status with 16 options always available: CARGADO (loaded) plus 1° EN CARGAR through 15° EN CARGAR. Status is color-coded with badges using a 10-color palette that cycles for larger fleets (green for CARGADO, then red, orange, yellow, blue, purple, pink, indigo, cyan, teal, lime for positions 1°-10°, cycling for 11°-15°). Status is persisted in daily assignments and templates, and included in both Excel and PNG exports. Loading status dropdown appears horizontally next to "Agregar línea" button for easy access.
- **Excel Export:** Exports historical daily assignments for a selected date range to an .xlsx file, including vehicle, driver, assistant details, loading status, and depot information.
- **Image Export:** "Exportar como Imagen" button generates a PNG of the current daily planning using html2canvas. The exported image uses a compact, horizontal layout with light gray background and black text, displaying vehicle info, loading status badges, and assignments in a single line. Vehicles are automatically sorted by loading status (CARGADO first, then ordered by position 1°, 2°, 3°, etc.). Color-coded badges (green for CHOFER, amber for ACOMPAÑANTE) are used for roles. Loading status badges are perfectly centered both horizontally and vertically within their colored boxes. Filename includes the selected date.
- **Vehicle Reordering:** Dashboard vehicle cards can be reordered with persistent order preservation.
- **Role-Based Filtering:** Assignment dropdowns filter employees by their roles, considering availability and absence status.
- **Duplicate Prevention System:** Multi-layered prevention for employee assignments across vehicles and depot via UI filtering, automatic reconciliation, template sanitization, and continuous validation. Employees with `allowDuplicates=true` can be assigned multiple times.
- **Color-coded Badges:** Visual distinction for employee roles (CHOFER, ACOMPAÑANTE) and loading status using color-coded badges in the Dashboard and exported images.

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

### Security
- **bcrypt**: Password hashing with salt rounds for secure credential storage.
- **express-session**: Secure session management with PostgreSQL store.
- **Data Isolation**: Complete multi-tenancy ensures users can only access their own data.