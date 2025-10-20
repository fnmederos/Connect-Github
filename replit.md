# Sistema de Gestión Logística

## Overview

This is a logistics management application for planning operations and resource allocation. It manages employees, vehicles, and daily assignments, including tracking employee absences and availability. The system aims for efficiency and usability for operational teams.

**Core Functionality:**
- Employee management with role-based assignments
- Vehicle fleet management, including dynamic selection and reordering
- Daily assignment planning, scheduling, and historical tracking
- Employee absence tracking
- Role/function CRUD management (create, edit, delete employee roles)
- Depot/warehouse personnel scheduling with supervisor (Encargado) designation
- Comments per vehicle in daily assignments
- Excel export of historical daily assignments

**Business Vision:** To streamline logistics operations, improve resource allocation, and provide clear oversight for operational teams.
**Market Potential:** Applicable to any business requiring dynamic management of mobile assets and personnel.
**Project Ambitions:** To be a comprehensive, user-friendly tool that significantly reduces manual planning efforts and enhances operational efficiency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Structure:** Page-based routing using Wouter, reusable UI components from shadcn/ui (Radix primitives), and custom domain components.
**State Management:** TanStack Query for server state and caching, with React hooks for local UI state. Integrated with backend API for optimistic updates and invalidation.
**Design System:** Material Design + Linear-inspired minimalism, utility-focused with a custom HSL-based color palette, Inter font, and Tailwind CSS for responsive, mobile-first design. Emphasizes productivity and data clarity.

### Backend Architecture

**API Structure:** RESTful Express.js server with route handlers, an abstraction layer for storage (currently in-memory with a plan for database migration).
**Data Layer:** Drizzle ORM for type-safe operations, Zod for validation, and PostgreSQL via Neon serverless. Schemas are shared between client and server for type consistency.
**API Endpoints:** Comprehensive CRUD operations for employees, vehicles, absences, daily assignments, and roles.

### Database Schema

**Tables:**
- `employees`: Employee records with multi-role support.
- `vehicles`: Vehicle fleet management.
- `employeeAbsences`: Absence tracking for employees.
- `dailyAssignments`: Historical daily assignments with a denormalized structure including vehicle snapshots, complete employee details, vehicle-specific comments, and JSON for depot assignments.
- `roles`: Available employee roles/functions.

**Key Design Decisions:**
- UUID primary keys for distributed systems compatibility.
- Array types for roles and assignmentRows, text dates (ISO format strings).
- **Denormalized structure in `dailyAssignments`**: Stores vehicle and employee details as snapshots and JSON for depot assignments to simplify Excel export, ensure historical accuracy, and improve query performance.
- Shared types between frontend and backend via Drizzle inference.

### Build & Deployment

**Development:** Vite dev server with HMR for frontend, `tsx` for backend TypeScript execution.
**Production:** Vite builds frontend to `dist/public`, esbuild bundles backend to `dist/index.js`.
**Configuration:** Path aliases for client and shared code, Tailwind with custom design tokens, PostCSS, and TypeScript strict mode.

### Feature Specifications

- **Dashboard Workflow:** Manual vehicle selection with an "Ingresar Vehículos" button, multi-select dialog for vehicles, and manual row creation for assignments. The Dashboard is a blank form by default and does not auto-load previously saved assignments. When saving, the system **replaces** any existing assignments for that date with the current form content (delete-then-create pattern).
- **History Feature:** Dedicated page (`/history`) for viewing and managing saved daily assignments, including detailed views and deletion functionality with confirmation dialogs.
- **Roles Management:** Dedicated page (`/roles`) for CRUD operations on employee roles/functions. Supports creating, editing, and deleting roles with uniqueness validation and proper error handling (409 Conflict for duplicates).
- **Comments and Depot Features:** Each vehicle card has a dedicated comments textarea. A separate DEPOSITO section allows scheduling warehouse personnel with multiple time slots, employee assignments, and a special toggleable ENCARGADO (Supervisor) position.
- **Excel Export:** Functionality to export historical daily assignments within a selected date range to an .xlsx file, including vehicle, driver, and assistant details. User feedback provided when no data matches the selected range.
- **Image Export:** Dashboard includes "Exportar como Imagen" button that generates a PNG file of the current daily planning using html2canvas. The exported image uses a compact, horizontal layout with light gray background and black text for optimal readability. Each vehicle's information (name, license plate, and all assignments) is displayed in a single line to maximize the number of vehicles that fit without zooming. Format: "Vehicle Name (License) | Time [CH/AC Badge] Employee | Time [CH/AC Badge] Employee". Color-coded badges (green for CHOFER, amber for ACOMPAÑANTE) provide visual distinction. Filename includes the selected date (e.g., planificacion-2025-10-20.png). Button is disabled when no vehicles or depot slots are present.
- **Vehicle Reordering:** Dashboard vehicle cards can be reordered using up/down arrow buttons with persistent order preservation.
- **Role-Based Filtering:** Assignment dropdowns filter employees by their assigned roles, showing only employees who have the specific role required for each position. Implemented with intelligent filtering that respects employee absence status and role assignments.
- **Duplicate Prevention System:** Multi-layered protection against duplicate employee assignments across vehicles AND depot:
  - **UI Prevention:** Dropdown filters automatically exclude employees already assigned to other vehicles/roles/depot slots, except for the current row's employee. Works consistently across both vehicle assignments and depot (DEPOSITO) assignments.
  - **Automatic Reconciliation:** Background process detects and clears invalid assignments when employees become unavailable or lose required roles for both vehicle and depot assignments.
  - **Template Sanitization:** When loading templates, duplicates are automatically detected and removed, with user notification via toast messages.
  - **Continuous Validation:** System monitors availability changes and automatically reconciles assignments in real-time.
  - **Implementation Details:** Dashboard.tsx calculates `allAssignedEmployeeIds` Set that aggregates both vehicle rows and depot slot employees, passing it to both AssignmentCard and DepositoSection components. Each component filters available employees against this shared Set while allowing the currently selected employee to remain visible for editing.

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

## Recent Changes (October 20, 2025)

- **Fixed Excel export to include depot information:** Modified ExportExcelDialog.tsx to export depot (DEPOSITO) assignments in addition to vehicle assignments. Added "SECCION" column to distinguish between VEHICULO and DEPOSITO rows. Depot rows include time slot, assigned employees, and encargado designation. Excel now provides complete daily planning data.
- **Fixed clock icon alignment in image export:** Corrected vertical alignment of Clock icon in depot section of PlanningExportView.tsx by changing to `inline-flex` and adding `flex-shrink-0` to prevent icon distortion.
- **Added repeatable employees feature:** Implemented support for employees (e.g., third-party contractors, outsourced companies) who can be assigned multiple times across different vehicles or even within the same vehicle. This feature bypasses the duplicate prevention system for specific employees while maintaining normal duplicate prevention for all others.
  - **Database Schema:** Added `allowDuplicates` boolean field (default: false) to the `employees` table via migration.
  - **Employee Form:** Added "Permitir duplicados" checkbox in employee creation/edit dialog with clear explanation: "Permite asignar este empleado múltiples veces (ej: personal de empresas tercerizadas)".
  - **Dashboard Logic - Three Key Updates:**
    1. **Available Employees Panel (`unassignedEmployees`)**: Modified to exclude only non-repeatable employees from the assigned set, keeping repeatable employees visible in the panel even after assignment.
    2. **Dropdown Filtering (`allAssignedEmployeeIds`)**: Updated to skip employees with `allowDuplicates=true` when building the exclusion Set, allowing them to appear in assignment dropdowns even when already assigned.
    3. **Automatic Cleanup (`removeDuplicateAssignments`)**: Enhanced to check `employee?.allowDuplicates` before removing duplicates, preserving repeatable employee assignments during reconciliation.
  - **How It Works:** Employees with `allowDuplicates=false` (default) have normal duplicate prevention. Employees with `allowDuplicates=true` can be assigned multiple times, stay visible in the Available Employees panel, and survive automatic reconciliation. Feature works for both vehicle and depot assignments.
- **Added color-coded role badges:** Implemented visual distinction for employee roles with color-coded badges throughout the application. CHOFER roles display with green/emerald badges (CH), ACOMPAÑANTE roles with amber/orange badges (AC). This minimal, elegant design improves at-a-glance role identification in both the Dashboard and exported images.
- **Fixed ENCARGADO badge alignment:** Corrected the alignment of the ENCARGADO badge in the depot section by implementing a fixed-width grid layout. The badge now maintains consistent alignment whether present or not, improving visual consistency.
- **Redesigned image export for maximum density:** Modified the image export layout to use a compact, horizontal format where each vehicle's complete information (name, license plate, and all assignments) appears in a single line. Uses light gray background with black text for optimal contrast and readability. This design allows many more vehicles to fit in the exported image without requiring zoom, making it ideal for sharing planning information with staff.
- **Added image export functionality:** Implemented "Exportar como Imagen" button in Dashboard that captures the current daily planning (vehicles and depot assignments) as a PNG file using html2canvas. The exported image shows a clean, read-only view optimized for sharing with staff, with filenames including the selected date (e.g., planificacion-2025-10-20.png).
- **Fixed duplicate prevention for depot assignments:** Extended the duplicate prevention system to include depot (DEPOSITO) employee assignments. Employees assigned to any vehicle or depot slot now properly disappear from all other dropdowns.
- **Removed redundant "Funciones" navigation tab:** Eliminated the standalone "Funciones" tab from the main navigation menu. Role management is now exclusively accessed through the "Gestionar Funciones" button within the Empleados page, reducing UI clutter and redundancy.
- **Fixed ENCARGADO text visibility:** Added explicit text color (`text-gray-900 dark:text-gray-900`) to the ENCARGADO employee selector to ensure the employee name remains visible against the blue background highlight in both light and dark modes.
- **Implemented time input auto-formatting:** Added automatic HH:MM formatting to depot time slot inputs. When typing, the system automatically inserts ":" after 2 digits (e.g., typing "0800" produces "08:00"). Uses a ref-based approach to detect typing vs. deleting. Works best for entering new times from the beginning; mid-string edits may require clearing and retyping for best results.