# 🔄 Data Persistence Guide - How to See Added Routes & Trains

## ✅ Problem Solved!

Your data now **persists across page refreshes** using `localStorage`. Previously, the data was only stored in memory and disappeared when you refreshed the page.

---

## 📍 Where to See Added Routes

### Step 1: Add a New Route

1. Navigate to the **Routes** page: `http://localhost:8080/routes`
2. Click the **"+ Add New Route"** button (top right)
3. You'll be taken to the **Add Route Form** (`/routes/add`)
4. Fill in the form:
   - **Route Name**: e.g., "Colombo Express"
   - **Area/Province**: e.g., "Western Province"
   - **Max Delivery Time**: e.g., "2 hours"
   - **Coverage Areas**: e.g., "Colombo, Dehiwala, Maharagama"
5. Click **"Save Route"**
6. You'll see a success toast notification
7. You'll be redirected back to the `/routes` page

### Step 2: View Your New Route

**Your route will appear immediately** in the Routes grid on the `/routes` page!

```
┌─────────────────────────────────────────────────────┐
│  Delivery Routes              [+ Add New Route]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │ R-01             │  │ R-04             │  ← YOUR NEW ROUTE!
│  │ Colombo Central  │  │ Colombo Express  │       │
│  │ Active | 15 📦   │  │ Active | 0 📦    │       │
│  │ [View Map]       │  │ [View Map]       │       │
│  │ [Manage]         │  │ [Manage]         │       │
│  └──────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────┘
```

### Step 3: Test Persistence

1. **Refresh the page** (F5 or Cmd+R)
2. ✅ Your route is **still there**!
3. Close the browser tab completely
4. Open `http://localhost:8080/routes` again
5. ✅ Your route is **still there**!

---

## 🚂 Where to See Added Train Trips

### Step 1: Add a New Train Trip

1. Navigate to **Train Schedule**: `http://localhost:8080/trains`
2. Click **"+ Add Train Trip"** button (top right)
3. A modal will appear
4. Fill in the form:
   - **Train ID**: e.g., "TR-010"
   - **Route**: e.g., "Kandy → Jaffna"
   - **Departure Time**: e.g., "07:30"
   - **Arrival Time**: e.g., "13:00"
   - **Capacity**: e.g., "150"
5. Click **"Save Train Trip"**
6. Modal closes, success toast appears

### Step 2: View Your New Train

**Your train will appear immediately** in the Train Schedule grid!

```
┌─────────────────────────────────────────────────────┐
│  Train Schedule              [+ Add Train Trip]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │ TR-001              │  │ TR-010              │  ← YOUR NEW TRAIN!
│  │ Kandy → Colombo     │  │ Kandy → Jaffna      │ │
│  │ 08:30 | Capacity 200│  │ 07:30 | Capacity 150│ │
│  └─────────────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Step 3: Test Persistence

1. **Refresh the page** (F5 or Cmd+R)
2. ✅ Your train is **still there**!
3. Close the browser and reopen
4. ✅ Your train is **still there**!

---

## 🔍 How to View Stored Data (Developer Tools)

Want to see the raw data? Open your browser's Developer Console:

### View Routes Data

1. Press **F12** (or Cmd+Option+I on Mac)
2. Go to the **Console** tab
3. Type: `localStorage.getItem('kandypack_routes')`
4. Press Enter
5. You'll see all routes in JSON format

### View Trains Data

1. In the Console, type: `localStorage.getItem('kandypack_trains')`
2. Press Enter
3. You'll see all trains in JSON format

### Clear All Data (Reset)

If you want to start fresh:

```javascript
localStorage.removeItem("kandypack_routes");
localStorage.removeItem("kandypack_trains");
location.reload(); // Refresh page
```

---

## 📊 Summary of Pages & Navigation

| Page               | URL                   | What You See                                        |
| ------------------ | --------------------- | --------------------------------------------------- |
| **Routes List**    | `/routes`             | Grid of all routes (initial + your added ones)      |
| **Add Route Form** | `/routes/add`         | Form to create new route                            |
| **Route Map**      | `/routes/R-01/map`    | Google Maps iframe for specific route               |
| **Manage Route**   | `/routes/R-01/manage` | Details & stats for specific route                  |
| **Train Schedule** | `/trains`             | Grid of all train trips (initial + your added ones) |
| **Orders**         | `/orders`             | List of all orders with filters                     |
| **Drivers**        | `/drivers`            | List of all drivers/staff                           |

---

## 🎯 Quick Test Script

Run this complete test:

```bash
# 1. Start the app
cd FrontEnd
npm run dev

# 2. Open http://localhost:8080/routes

# 3. Click "+ Add New Route"

# 4. Fill form:
#    Name: Test Route 123
#    Area: Test Province
#    Max Time: 1 hour
#    Coverage: Test Area 1, Test Area 2

# 5. Click "Save Route"

# 6. You should see:
#    ✅ Toast notification "Route added successfully"
#    ✅ Redirect to /routes
#    ✅ Your route appears in the grid

# 7. Press F5 to refresh

# 8. Check:
#    ✅ Your route is STILL THERE!

# 9. Close browser completely

# 10. Reopen http://localhost:8080/routes

# 11. Final check:
#     ✅ Your route is STILL THERE!
```

---

## 🛠️ Technical Details

### localStorage Keys

- **Routes**: `kandypack_routes`
- **Trains**: `kandypack_trains`

### Data Structure

Routes are stored as JSON arrays:

```json
[
  {
    "id": "R-01",
    "name": "Colombo Central",
    "area": "Colombo District",
    "coverage": "Fort, Pettah...",
    "activeOrders": 15,
    "assignedTrucks": 3,
    "assignedDrivers": 6,
    "status": "Active",
    "maxDeliveryTime": "4 hours",
    "lastDelivery": "2024-08-07 14:30"
  },
  {
    "id": "R-04",
    "name": "Your New Route",
    ...
  }
]
```

### Initial Data

On first load, the app initializes localStorage with 3 default routes. All routes you add will be appended to this list.

---

## 🎉 Success!

Your routes and trains now **persist forever** (until you clear browser data)! No more losing your work on refresh! 🚀

---

## 📝 Notes

- Data is stored **per browser** (Chrome data ≠ Firefox data)
- Data is stored **per domain** (localhost:8080 ≠ localhost:3000)
- Clearing browser cache will **delete all data**
- To export data, copy from Console and save as JSON
- For production, consider using a real backend database

---

Built with persistence! 💾✨
