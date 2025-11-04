# Farm MRL Portal

## Overview

Farm MRL Portal is a comprehensive web application for managing antimicrobial residue levels (MRL) in livestock operations. The system enables farmers and inspectors to track animal treatments, maintain farm records, monitor compliance with withdrawal periods, and generate reports. The platform provides role-based access control with distinct workflows for farmers, inspectors, and administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack

**Frontend Framework**: React with TypeScript
- Component library: Radix UI primitives with custom shadcn/ui styling
- Routing: Wouter (lightweight client-side router)
- State management: TanStack Query (React Query) for server state
- Forms: React Hook Form with Zod validation
- Styling: Tailwind CSS with custom design system
- Charts: Recharts for data visualization

**Backend Framework**: Express.js with TypeScript
- Runtime: Node.js with ESM modules
- Development: Vite for HMR and build tooling
- Process: tsx for TypeScript execution

**Database**: PostgreSQL (via Neon serverless or standard PostgreSQL)
- ORM: Drizzle ORM
- Schema validation: Zod (shared between client and server)
- File storage: Supabase for uploaded documents

### Project Structure

The codebase uses a **modular folder organization** with bridge files for build compatibility:

**Core Modules**:
- `frontend/` - Complete React application (components, pages, hooks)
- `backend/` - Express server setup and Vite integration
- `database/` - Data layer split into schema definitions and storage operations
- `api/` - REST endpoints and authentication middleware

**Bridge Files** (for tooling compatibility):
- `client/` → Points to frontend
- `server/` → Re-exports backend + API
- `shared/` → Re-exports database schemas

### Authentication & Authorization

**Strategy**: JWT-based authentication with bcrypt password hashing

**Implementation**:
- Tokens stored in localStorage with 7-day expiration
- Authorization header: `Bearer <token>`
- Middleware validates tokens on protected routes
- Context provider maintains auth state across app

**User Roles**:
- **Farmer**: Manages own farm, animals, and treatment records
- **Inspector**: Read-only access to all farms and compliance data
- **Admin**: Full system access including user management

### Data Model

**Core Entities**:

1. **Users** - Authentication and role management
   - Fields: username, password (hashed), fullName, role, email, farmId
   - Unique constraints on username and email

2. **Farms** - Farm registration and ownership
   - Fields: name, location, ownerName, registrationNumber, contact info
   - Tracks total animal count (denormalized for performance)

3. **Animals** - Livestock inventory
   - Fields: farmId, tagNumber, name, species, breed, DOB, weight, status
   - Status values: active, quarantine, sold, deceased
   - Species: cattle, sheep, goat, pig, poultry

4. **Treatment Records** - Antimicrobial administration tracking
   - Fields: animalId, farmId, medicine details, dosage, withdrawal period
   - Compliance status: compliant, warning, violation, pending
   - Automatic calculation of withdrawal end dates and MRL compliance

5. **Farm Reports** - Document uploads
   - Fields: farmId, reportType, description, fileUrl, uploadedBy
   - Types: compliance, inspection, veterinary, other
   - File size limit: 10MB (PDF, XLS, XLSX, CSV)

### API Architecture

**RESTful Design Pattern**:
- Consistent endpoint naming: `/api/[resource]`
- HTTP methods: GET (read), POST (create), PATCH (update)
- JSON request/response format
- Error responses include descriptive messages

**Key Endpoints**:
- `/api/auth/*` - Registration and login
- `/api/farms` - Farm CRUD operations
- `/api/animals` - Animal inventory management
- `/api/treatments` - Treatment record tracking
- `/api/reports` - Report listing
- `/api/upload` - Multipart file uploads
- `/api/dashboard/*` - Analytics and statistics
- `/api/admin/*` - Admin-only system management

**Middleware Stack**:
1. JSON body parser with raw buffer capture
2. URL-encoded form parser
3. Request logging with duration tracking
4. Authentication middleware (protected routes)
5. Vite dev server middleware (development only)

### State Management Strategy

**Server State**: TanStack Query
- Query keys follow REST endpoint pattern: `["/api/endpoint"]`
- Automatic refetching on window focus
- Optimistic updates for mutations
- Cache invalidation after writes

**Client State**: React Context
- AuthContext: User session and token management
- ThemeContext: Light/dark mode toggle with localStorage persistence

**Form State**: React Hook Form
- Zod resolver for schema validation
- Shared validation schemas between client and server
- Field-level error messages

### Design System

**Theming Approach**: CSS variables with HSL color system
- Light and dark mode support via `.dark` class
- Design tokens defined in `:root` and `.dark` selectors
- Border treatments use subtle outlines and shadows

**Typography**:
- Primary: Inter (400, 500, 600, 700 weights)
- Monospace: JetBrains Mono for data fields and IDs
- Hierarchical text sizing from 3xl (titles) to xs (metadata)

**Component Philosophy**:
- shadcn/ui pattern: Copy components into project for full control
- Radix UI primitives for accessible interactions
- Tailwind utility classes with `cn()` helper for conditional styles
- Consistent spacing using Tailwind's scale (2, 4, 6, 8 units)

**Responsive Strategy**:
- Mobile-first with md: and lg: breakpoints
- Sidebar collapses on mobile
- Tables scroll horizontally on small screens
- Forms use single-column layout with max-width constraints

### Build & Deployment

**Development Mode**:
- Vite dev server with HMR
- Express backend proxies frontend requests
- Single port for both client and API
- Source maps enabled

**Production Build**:
- Frontend: Vite builds to `dist/public`
- Backend: esbuild bundles server to `dist/index.js`
- Platform: node, format: ESM, external packages
- Static file serving from Express

**Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection string (required)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SESSION_SECRET` - JWT signing key (defaults provided)
- `NODE_ENV` - development/production flag

## External Dependencies

### Database Services

**Primary Database**: Neon Serverless PostgreSQL
- Purpose: Main data storage (users, farms, animals, treatments)
- Integration: Drizzle ORM with `@neondatabase/serverless` driver
- Connection: Via `DATABASE_URL` environment variable
- Migrations: Drizzle Kit manages schema changes in `/migrations` directory

**File Storage**: Supabase Storage
- Purpose: Uploaded farm reports and documents
- Integration: `@supabase/supabase-js` client library
- Authentication: Anonymous key for server-side operations
- File handling: Server receives multipart uploads, forwards to Supabase

### UI Component Libraries

**Radix UI**: Accessible component primitives
- Components: Dialog, Dropdown, Select, Toast, Accordion, Tabs, etc.
- Purpose: ARIA-compliant interactions without prescriptive styling
- Pattern: Compose with Tailwind classes for visual design

**shadcn/ui**: Component patterns built on Radix
- Installation: `components.json` configuration file
- Pattern: Components copied into `client/src/components/ui/`
- Customization: Full control via local modifications

### Data Handling

**React Hook Form**: Form state management
- Validation: `@hookform/resolvers` with Zod schemas
- Performance: Uncontrolled inputs with minimal re-renders
- Integration: Shared schemas from `database/schema/index.ts`

**Recharts**: Chart visualization library
- Chart types: Line charts (trends), bar charts, pie charts (compliance distribution)
- Responsive: `ResponsiveContainer` wrapper for fluid sizing
- Theming: Uses CSS variables from design system

### Development Tools

**TypeScript**: Type safety across client and server
- Shared types: Database schemas exported from Drizzle
- Path aliases: `@/` (client src), `@shared/` (schemas)
- Strict mode enabled

**Vite**: Build tool and dev server
- Plugins: React, runtime error overlay, Replit integrations
- Configuration: Custom resolve aliases, client root directory
- HMR: Fast refresh for React components

**Drizzle Kit**: Database schema management
- Config: `drizzle.config.ts` points to schema and connection
- Output: Migration files in `/migrations` directory
- Dialect: PostgreSQL

### Security & Authentication

**bcryptjs**: Password hashing
- Rounds: 10 (default)
- Usage: Hash on registration, compare on login

**jsonwebtoken**: JWT token generation and verification
- Expiration: 7 days
- Payload: userId, username, role
- Secret: Environment variable or fallback

### Utility Libraries

**Tailwind Merge & clsx**: Class name management
- `clsx`: Conditional class construction
- `tailwind-merge`: Deduplicates conflicting Tailwind utilities
- Pattern: `cn()` helper combines both

**Wouter**: Lightweight React routing
- Pattern: File-based route components in `client/src/pages/`
- Navigation: `<Link>` component and `useLocation()` hook
- Guards: `ProtectedRoute` and `PublicRoute` wrappers

**Multer**: Multipart form data handling
- Storage: Memory storage (files buffered before Supabase upload)
- Limits: 10MB file size enforced
- Integration: Express middleware for `/api/upload`