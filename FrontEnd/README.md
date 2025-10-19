# Kandypack Logistics Frontend

A modern logistics management dashboard built with React, TypeScript, Vite, and shadcn/ui.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 📦 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🎯 Features & Button Functionality

### ✅ Orders Management (`/orders`)

- **New Order** button → Opens `NewOrderModal` to create orders
- **Filter** button → Opens `FilterModal` to filter by status/destination
- **View Details** button → Opens `ViewOrderModal` with full order info
- **Update Status** button → Opens `UpdateStatusModal` to change order status

**Services:** `orderService.createOrder()`, `orderService.updateStatus()`

### ✅ Train Schedule (`/trains`)

- **Add Train Trip** button → Opens `AddTrainTripModal`
- Modal calls `trainService.createTrainTrip()` and uses React Query to refresh list

**Services:** `trainService.getAllTrains()`, `trainService.createTrainTrip()`

### ✅ Routes Management (`/routes`)

- **Add New Route** button → Navigates to `/routes/add`
- **View Map** button → Navigates to `/routes/{id}/map` (shows Google Maps iframe)
- **Manage** button → Navigates to `/routes/{id}/manage`

**Pages:** `AddRoute.tsx`, `RouteMap.tsx`, `ManageRoute.tsx`  
**Services:** `routeService.createRoute()`, `routeService.getRouteById()`

### ✅ Drivers & Staff (`/drivers`)

- **Add Staff Member** button → Navigates to `/drivers/add`
- **View Schedule** button → Placeholder (ready for implementation)
- **Assign Route** button → Placeholder (ready for implementation)

**Pages:** `AddStaffMember.tsx`, `Drivers.tsx`  
**Services:** `driverService.createDriver()`, `driverService.getAllDrivers()`

### ✅ Dashboard (`/`)

- Real-time statistics cards
- Recent orders overview
- Train schedule summary
- Alerts & notifications

## 📁 Project Structure

```
FrontEnd/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Layout.tsx       # Main navigation layout
│   │   ├── AddTrainTripModal.tsx
│   │   ├── NewOrderModal.tsx
│   │   ├── FilterModal.tsx
│   │   ├── ViewOrderModal.tsx
│   │   ├── UpdateStatusModal.tsx
│   │   └── ManageCargoModal.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Orders.tsx       # ✅ All buttons wired
│   │   ├── TrainSchedule.tsx # ✅ Add Train Trip wired
│   │   ├── Routes.tsx       # ✅ Navigation buttons wired
│   │   ├── Drivers.tsx      # ✅ Add Staff wired
│   │   ├── AddRoute.tsx     # ✅ Form submission wired
│   │   ├── AddStaffMember.tsx # ✅ Form submission wired
│   │   ├── ManageRoute.tsx
│   │   ├── RouteMap.tsx
│   │   ├── TrainDetails.tsx
│   │   └── Reports.tsx
│   ├── services/
│   │   ├── driverService.ts  # Driver CRUD operations
│   │   ├── orderService.ts   # Order CRUD operations
│   │   ├── routeServise.ts   # Route mock service
│   │   ├── trainService.ts   # Train mock service
│   │   └── index.ts          # Barrel export
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── use-mobile.tsx
│   ├── lib/
│   │   └── utils.ts          # cn() utility
│   ├── App.tsx               # React Router setup
│   └── main.tsx
├── vite.config.ts            # ✅ '@' alias configured
├── tsconfig.json             # ✅ Path mapping configured
└── package.json
```

## 🔧 Configuration

### Path Alias (`@`)

All imports use the `@/` alias to reference the `src/` directory:

```typescript
import { Button } from "@/components/ui/button";
import { driverService } from "@/services/driverService";
```

Configured in:

- `vite.config.ts` → `resolve.alias`
- `tsconfig.json` → `paths`

### Environment Variables

Create a `.env` file (see `.env.example`):

```env
VITE_API_URL=http://localhost:8888
VITE_ENV=development
```

## 🛠️ Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 4
- **Routing:** React Router v6
- **State Management:** React Query (TanStack Query)
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios

## 🧪 Implementation Status

### ✅ Completed

- All button click handlers wired
- Modal open/close logic implemented
- Navigation between pages working
- Service layer with TypeScript interfaces
- Toast notifications integrated
- Form submissions connected to services

### 🚧 Mock Services

The following services use **in-memory mock data** (no backend connection yet):

- `trainService` → Simulates train CRUD with delays
- `routeService` → In-memory route management

### 🔌 Backend-Ready Services

These services expect a REST API at `VITE_API_URL`:

- `driverService` → `/drivers` endpoints
- `orderService` → `/orders` endpoints

## 📝 Notes

- The app is fully functional in **standalone mode** with mock services
- Forms validate input and show toast notifications
- TypeScript strict mode enabled for type safety
- All shadcn/ui components customizable via Tailwind

## 🐛 Known Issues

- `routeServise.ts` has a typo in the filename (should be `routeService.ts`) but imports work via index barrel export
- Some placeholder buttons (View Schedule, Assign Route in Drivers page) need handler implementation

---

Built with ❤️ for Kandypack Logistics
