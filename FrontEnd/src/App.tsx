import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import TrainSchedule from "./pages/TrainSchedule";
import RoutesPage from "./pages/Routes";
import Drivers from "./pages/Drivers";
import Reports from "./pages/Reports";
import EmployeeDetails from "./pages/EmployeeDetails";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login"; // your login page
import ManageCitiesPage from "./pages/ManageCitiesPage";
import ManageStoresPage from "./pages/ManageStoresPage";
import ManageProductsPage from "./pages/ManageProductsPage";
import ManageTrucksPage from "./pages/ManageTrucksPage";
import RouteLoader from "./components/RouteLoader";

const queryClient = new QueryClient();

// Simple auth check; replace with your real auth logic (e.g., JWT in localStorage)
const isAuthenticated = () => !!localStorage.getItem("access_token");

// Wrapper for private routes
const PrivateRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteLoader />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="trains" element={<TrainSchedule />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="reports" element={<Reports />} />
              {/* Management pages */}
              <Route path="manage/cities" element={<ManageCitiesPage />} />
              <Route path="manage/stores" element={<ManageStoresPage />} />
              <Route path="manage/products" element={<ManageProductsPage />} />
              <Route path="manage/trucks" element={<ManageTrucksPage />} />
              <Route path="employees/:id" element={<EmployeeDetails />} />
            </Route>
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

