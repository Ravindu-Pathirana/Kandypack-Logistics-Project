import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import TrainSchedule from "./pages/TrainSchedule";   // ✅ Only one import for TrainSchedule
import TrainDetails from "./pages/TrainDetails";     // ✅ Added train details page
import RoutesPage from "./pages/Routes";
import Drivers from "./pages/Drivers";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import AddStaffMember from "./pages/AddStaffMember";

// ✅ Route management pages
import AddRoute from "./pages/AddRoute";
import RouteMap from "./pages/RouteMap";
import ManageRoute from "./pages/ManageRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Layout wrapper for main app pages */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />

            {/* ✅ Train routes */}
            <Route path="trains" element={<TrainSchedule />} />
            <Route path="train/:id" element={<TrainDetails />} /> {/* New train details route */}

            {/* ✅ Routes management */}
            <Route path="routes" element={<RoutesPage />} />
            <Route path="routes/add" element={<AddRoute />} />
            <Route path="routes/:id/map" element={<RouteMap />} />
            <Route path="routes/:id/manage" element={<ManageRoute />} />

            {/* ✅ Other modules */}
            <Route path="drivers" element={<Drivers />} />
            <Route path="drivers/add" element={<AddStaffMember />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Catch-all for invalid URLs */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
