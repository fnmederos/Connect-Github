# Design Guidelines: Logistics Management Application

## Design Approach
**Selected Approach:** Design System (Utility-Focused)  
**Reference Systems:** Material Design + Linear-inspired minimalism  
**Justification:** This is a productivity/management tool where efficiency, clarity, and usability are paramount. The application handles structured data (employees, vehicles, assignments) requiring clean information architecture and intuitive workflows.

## Core Design Principles
1. **Clarity First:** Every element serves a functional purpose
2. **Efficient Workflows:** Minimize clicks, maximize productivity
3. **Data Hierarchy:** Clear visual distinction between primary and secondary information
4. **Scalability:** Consistent patterns that accommodate future features

## Color Palette

### Light Mode
- **Background:** 0 0% 98% (off-white)
- **Surface:** 0 0% 100% (white cards/panels)
- **Primary:** 217 91% 60% (professional blue)
- **Text Primary:** 220 13% 18%
- **Text Secondary:** 220 9% 46%
- **Border:** 220 13% 91%
- **Success:** 142 76% 36% (for active/assigned states)
- **Warning:** 38 92% 50% (for alerts)

### Dark Mode
- **Background:** 222 47% 11%
- **Surface:** 217 33% 17%
- **Primary:** 217 91% 60%
- **Text Primary:** 210 40% 98%
- **Text Secondary:** 215 20% 65%
- **Border:** 217 33% 24%
- **Success:** 142 76% 36%
- **Warning:** 38 92% 50%

## Typography
- **Primary Font:** Inter (via Google Fonts CDN)
- **Headings:** 
  - H1: text-2xl font-semibold (Dashboard titles)
  - H2: text-xl font-semibold (Section headers)
  - H3: text-lg font-medium (Card titles)
- **Body:** text-sm font-normal (Default text)
- **Labels:** text-xs font-medium uppercase tracking-wide (Form labels)
- **Data Display:** text-sm font-mono (License plates, IDs)

## Layout System
**Spacing Units:** Use Tailwind primitives: 2, 4, 6, 8, 12, 16  
- **Micro spacing:** gap-2, p-2 (between related elements)
- **Standard spacing:** gap-4, p-4, p-6 (cards, sections)
- **Section spacing:** gap-8, py-8, py-12 (major sections)
- **Page margins:** px-4 sm:px-6 lg:px-8

**Grid Structure:**
- Main container: max-w-7xl mx-auto
- Two-column layout for management pages (employees/vehicles): grid-cols-1 lg:grid-cols-2 gap-6
- Dashboard: Single column with organized sections

## Component Library

### Navigation
- **Top Bar:** Sticky header with logo, navigation links, user menu
- **Height:** h-16
- **Layout:** Horizontal flex with space-between
- **Active State:** Border-b-2 with primary color

### Cards & Panels
- **Employee/Vehicle Cards:** Rounded-lg border with p-4
- **Hover State:** Subtle scale transform (hover:scale-[1.01])
- **Shadow:** shadow-sm with hover:shadow-md transition
- **Action Buttons:** Right-aligned icon buttons (edit, delete)

### Forms & Inputs
- **Text Inputs:** 
  - Height: h-10
  - Padding: px-3
  - Border: border rounded-md
  - Focus: ring-2 ring-primary
- **Select Dropdowns:** Same styling as text inputs
- **Date Picker:** Inline calendar component with clear current date highlight
- **Checkboxes:** Larger touch targets (h-5 w-5) with rounded borders

### Dashboard Assignment Interface
- **Vehicle Cards:** Large cards (p-6) with vehicle info header
- **Employee Selection:** 
  - Multi-select chips showing 1-3 assigned employees
  - Quick-add dropdown below existing selections
  - Clear visual count indicator (e.g., "2/3 assigned")
- **Notes Field:** Textarea with min-h-20, subtle background
- **Status Indicators:** Colored badges (assigned/unassigned)

### Data Tables (for employee/vehicle lists)
- **Header:** Sticky with subtle background
- **Rows:** Hover state with background change
- **Cell Padding:** py-3 px-4
- **Alternating Rows:** Optional subtle stripe pattern

### Buttons
- **Primary:** Solid primary color, px-4 py-2, rounded-md, font-medium
- **Secondary:** Border with transparent background, same padding
- **Icon Buttons:** p-2, rounded-md, hover:bg-surface
- **Danger:** Red variant for delete actions

### Modals & Overlays
- **Background:** Semi-transparent dark overlay (bg-black/50)
- **Modal:** Centered, max-w-md, rounded-lg, shadow-xl
- **Close Button:** Top-right X icon
- **Actions:** Right-aligned button group at bottom

### Icons
- **Library:** Heroicons (via CDN)
- **Size:** w-5 h-5 (standard), w-4 h-4 (small/inline)
- **Usage:** Edit (pencil), Delete (trash), Add (plus), Assign (user-plus)

## Animations
**Minimal, Purposeful Only:**
- Smooth transitions on hover states (transition-all duration-200)
- Modal fade-in/out (opacity + scale)
- No page transitions or scroll animations

## Accessibility
- Consistent dark mode across all inputs and forms
- Clear focus indicators (ring-2) on all interactive elements
- Sufficient color contrast ratios (WCAG AA)
- Keyboard navigation for all workflows
- ARIA labels for icon-only buttons

## Responsive Breakpoints
- Mobile: Default (single column stacks)
- Tablet: md: (768px) - Two-column where appropriate
- Desktop: lg: (1024px) - Full multi-column layouts

## Key UX Patterns
1. **Inline Editing:** Click to edit employee functions/vehicle data directly in lists
2. **Drag Assignment (Future):** Visual drag-drop for assigning employees to vehicles
3. **Smart Defaults:** Today's date pre-selected, most recent assignments visible
4. **Confirmation Dialogs:** Before destructive actions (delete employee/vehicle)
5. **Toast Notifications:** Success/error feedback in top-right corner