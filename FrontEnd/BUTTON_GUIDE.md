# 🎯 Frontend Button Wiring Guide

## Visual Reference for All Interactive Elements

### 📦 Orders Page (`/orders`)

```
┌─────────────────────────────────────────────────────┐
│  Orders Management                    [+ New Order] │ ← ✅ onClick={() => setNewOrderOpen(true)}
├─────────────────────────────────────────────────────┤
│  🔍 Search: [________________]  [🔽 Filter]         │ ← ✅ onClick={() => setFilterOpen(true)}
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ ORD-001      │  │ ORD-002      │  │ ORD-003  │ │
│  │ Status: ✓    │  │ Status: ⏱    │  │ Status:✓ │ │
│  │              │  │              │  │          │ │
│  │ [View] [📝]  │  │ [View] [📝]  │  │ [View]   │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│       ↑    ↑              ↑    ↑                   │
│       │    │              │    └── Update Status   │
│       │    └── Update     │                        │
│       └── View Details    └── View Details         │
└─────────────────────────────────────────────────────┘

✅ View Details    → handleView(order) → setSelectedOrder + setViewOpen(true)
✅ Update Status   → handleUpdateStatus(order) → setSelectedOrder + setStatusOpen(true)
✅ New Order       → setNewOrderOpen(true)
✅ Filter          → setFilterOpen(true)
```

### 🚂 Train Schedule Page (`/trains`)

```
┌─────────────────────────────────────────────────────┐
│  Train Schedule              [+ Add Train Trip]     │ ← ✅ onClick={() => setOpen(true)}
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │ TR-001              │  │ TR-002              │ │
│  │ Kandy → Colombo     │  │ Colombo → Galle     │ │
│  │ 08:30 | Capacity 85%│  │ 09:15 | Capacity 92%│ │
│  └─────────────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────┘

✅ Add Train Trip → setOpen(true) → Opens AddTrainTripModal
                  → trainService.createTrainTrip() via React Query mutation
```

### 🗺️ Routes Page (`/routes`)

```
┌─────────────────────────────────────────────────────┐
│  Delivery Routes              [+ Add New Route]     │ ← ✅ onClick={() => navigate("/routes/add")}
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │ R-01             │  │ R-02             │       │
│  │ Colombo Central  │  │ Negombo Coast    │       │
│  │ Active | 15 📦   │  │ Active | 8 📦    │       │
│  │                  │  │                  │       │
│  │ [🗺️ View Map]    │  │ [🗺️ View Map]    │       │
│  │ [⚙️ Manage]      │  │ [⚙️ Manage]      │       │
│  └──────────────────┘  └──────────────────┘       │
│         ↑    ↑                                     │
└─────────┼────┼─────────────────────────────────────┘
          │    │
          │    └── navigate(`/routes/${route.id}/manage`)
          └── navigate(`/routes/${route.id}/map`)

✅ Add New Route  → navigate("/routes/add")
✅ View Map       → navigate(`/routes/${route.id}/map`)
✅ Manage         → navigate(`/routes/${route.id}/manage`)
```

### 👥 Drivers Page (`/drivers`)

```
┌─────────────────────────────────────────────────────┐
│  Drivers & Staff           [+ Add Staff Member]     │ ← ✅ onClick={() => navigate("/drivers/add")}
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │ 👤 Kamal Perera  │  │ 👤 Sunil Fernando│       │
│  │ Driver | On Duty │  │ Driver | Off Duty│       │
│  │ 35/40h ████░░░   │  │ 38/40h █████░░   │       │
│  │                  │  │                  │       │
│  │ [📅 View Schedule]│ │ [📅 View Schedule]│       │ ← 🟡 Placeholder
│  │ [🚚 Assign Route]│  │ [🚚 Assign Route]│       │ ← 🟡 Placeholder
│  └──────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────┘

✅ Add Staff Member → navigate("/drivers/add")
🟡 View Schedule    → Placeholder (no handler yet)
🟡 Assign Route     → Placeholder (no handler yet)
```

---

## 🎭 Modal Components

### NewOrderModal

```typescript
<NewOrderModal
  open={newOrderOpen}
  onOpenChange={setNewOrderOpen}
  onAddOrder={handleAddNewOrder}
/>
```

✅ **Functionality:** Form submission → Adds order to local state → Shows toast

### FilterModal

```typescript
<FilterModal
  open={filterOpen}
  onOpenChange={setFilterOpen}
  selectedFilter={selectedFilter}
  onFilterChange={setSelectedFilter}
/>
```

✅ **Functionality:** Select dropdowns → Updates filter state → Auto-filters orders

### ViewOrderModal

```typescript
<ViewOrderModal
  open={viewOpen}
  onOpenChange={setViewOpen}
  order={selectedOrder}
/>
```

✅ **Functionality:** Display order details (read-only)

### UpdateStatusModal

```typescript
<UpdateStatusModal
  open={statusOpen}
  onOpenChange={setStatusOpen}
  order={selectedOrder}
  onUpdate={handleStatusChange}
/>
```

✅ **Functionality:** Select new status → Updates order in state → Shows toast

### AddTrainTripModal

```typescript
<AddTrainTripModal open={open} onOpenChange={setOpen} />
```

✅ **Functionality:** Form submission → trainService.createTrainTrip() → React Query invalidation → List refreshes

---

## 🛣️ Navigation Routes

| Path                 | Component          | Button That Navigates Here |
| -------------------- | ------------------ | -------------------------- |
| `/orders`            | Orders.tsx         | Sidebar "Orders"           |
| `/trains`            | TrainSchedule.tsx  | Sidebar "Train Schedule"   |
| `/routes`            | Routes.tsx         | Sidebar "Routes"           |
| `/routes/add`        | AddRoute.tsx       | "Add New Route" button     |
| `/routes/:id/map`    | RouteMap.tsx       | "View Map" button          |
| `/routes/:id/manage` | ManageRoute.tsx    | "Manage" button            |
| `/drivers`           | Drivers.tsx        | Sidebar "Drivers"          |
| `/drivers/add`       | AddStaffMember.tsx | "Add Staff Member" button  |

---

## 📊 Service Integration Map

```
┌──────────────┐
│   Orders     │
│   Page       │
└───────┬──────┘
        │ New Order → NewOrderModal → handleAddNewOrder() → Local State
        │ Update Status → UpdateStatusModal → handleStatusChange() → Local State
        └─ (Ready for: orderService.createOrder(), orderService.updateStatus())

┌──────────────┐
│  Trains      │
│  Page        │
└───────┬──────┘
        │ Add Train Trip → AddTrainTripModal
        └─ ✅ trainService.createTrainTrip() via React Query

┌──────────────┐
│  Routes      │
│  Page        │
└───────┬──────┘
        │ Add New Route → Navigate → AddRoute.tsx
        └─ ✅ routeService.createRoute() + navigate back

┌──────────────┐
│  Drivers     │
│  Page        │
└───────┬──────┘
        │ Add Staff → Navigate → AddStaffMember.tsx
        └─ ✅ driverService.createDriver() + navigate back
```

---

## 🎨 Button Styling Reference

All buttons use shadcn/ui `<Button>` component with variants:

- **Primary Action:** `<Button>` (default variant)
- **Secondary Action:** `<Button variant="outline">`
- **Danger Action:** `<Button variant="destructive">`
- **Small Button:** `<Button size="sm">`

Icons from `lucide-react`:

- Plus (+) for "Add/New" actions
- Filter (🔽) for filtering
- Search (🔍) for search
- MapPin (📍) for location/map

---

## ✅ Testing Checklist

Copy this checklist when testing the app:

```
□ Orders Page
  □ Click "New Order" → Modal opens
  □ Fill form → Submit → Toast appears → Modal closes
  □ Click "Filter" → Modal opens → Select filters → Apply → Orders filter
  □ Click "View Details" on order → Details modal shows all info
  □ Click "Update Status" → Select new status → Update → Toast appears

□ Train Schedule Page
  □ Click "Add Train Trip" → Modal opens
  □ Fill train form → Submit → Loading → Toast → List refreshes

□ Routes Page
  □ Click "Add New Route" → Navigate to /routes/add
  □ Fill form → Submit → Toast → Navigate to /routes
  □ Click "View Map" → Navigate to map page with Google Maps
  □ Click "Manage" → Navigate to manage page with route details

□ Drivers Page
  □ Click "Add Staff Member" → Navigate to /drivers/add
  □ Fill form → Submit → Toast → Navigate to /drivers
  □ Check drivers list loads from driverService.getAllDrivers()
```

---

Built with care for Kandypack Logistics! 🚚📦
