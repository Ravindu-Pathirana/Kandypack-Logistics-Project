import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Truck,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Search,
  Eye,
  UserCog,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const Drivers = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [summary, setSummary] = useState({
    on_duty_drivers: 0,
    drivers_weekly_limit: 40,
    on_duty_assistants: 0,
    assistants_weekly_limit: 60,
    available_to_schedule: 0,
    compliance: "Loading...",
  });
  const [driversData, setDriversData] = useState([]);
  const [assistantsData, setAssistantsData] = useState([]);
  const [managersData, setManagersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [driverFilters, setDriverFilters] = useState({
    status: "",
    search: "",
  });
  const [assistantFilters, setAssistantFilters] = useState({
    status: "",
    search: "",
  });
  const [managerFilters, setManagerFilters] = useState({
    status: "",
    search: "",
  });

  // Modal state
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    username: "",
    email: "",
    password: "",
    employee_name: "",
    employee_nic: "",
    official_contact_number: "",
    registrated_date: new Date().toISOString().split('T')[0],
    role_id: 2,
    store_id: "",
  });

  // Helper function to get auth headers and user info
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      throw new Error("No authentication token found");
    }
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  // Helper function to decode JWT and get user info
  const getUserFromToken = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        role: payload.role,
        store_id: payload.store_id,
        user_id: payload.sub,
      };
    } catch (err) {
      console.error("Error decoding token:", err);
      return null;
    }
  };

  // Helper function for authenticated fetch
  const authenticatedFetch = async (url, options = {}) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        throw new Error("Authentication expired. Please login again.");
      }

      return response;
    } catch (err) {
      if (err.message === "No authentication token found") {
        throw err;
      }
      throw err;
    }
  };

  useEffect(() => {
    const user = getUserFromToken();
    setCurrentUser(user);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const driverParams = new URLSearchParams();
      if (driverFilters.status) {
        driverParams.append("status", driverFilters.status);
      }
      
      const assistantParams = new URLSearchParams();
      if (assistantFilters.status) {
        assistantParams.append("status", assistantFilters.status);
      }

      const managerParams = new URLSearchParams();
      if (managerFilters.status) {
        managerParams.append("status", managerFilters.status);
      }

      const requests = [
        authenticatedFetch(`${API_BASE}/summary`, { cache: "no-store" }),
        authenticatedFetch(`${API_BASE}/drivers?${driverParams.toString()}`, { cache: "no-store" }),
        authenticatedFetch(`${API_BASE}/assistants?${assistantParams.toString()}`, { cache: "no-store" }),
      ];

      // Only fetch managers if user is admin
      if (currentUser?.role === "admin") {
        requests.push(
          authenticatedFetch(`${API_BASE}/managers?${managerParams.toString()}`, { cache: "no-store" })
        );
      }

      const responses = await Promise.all(requests);
      const [sumRes, drvRes, assRes, mgrRes] = responses;

      if (!sumRes.ok) throw new Error("Summary API failed");
      if (!drvRes.ok) throw new Error("Drivers API failed");
      if (!assRes.ok) throw new Error("Assistants API failed");
      if (mgrRes && !mgrRes.ok) throw new Error("Managers API failed");

      const sumData = await sumRes.json();
      const drvData = await drvRes.json();
      const assData = await assRes.json();
      const mgrData = mgrRes ? await mgrRes.json() : [];

      setSummary(sumData);

// Map drivers - align to API: employee_id, employee_name, total_hours_week, official_contact_number, next_available_time
const mappedDrivers = Array.isArray(drvData)
  ? drvData.map((d) => ({
      id: d.employee_id,
      name: d.employee_name,
      weeklyHours: d.total_hours_week || 0,
      phone: d.official_contact_number || "N/A",
      nextAvailableTime: d.next_available_time || "N/A",
      maxWeeklyHours: sumData.drivers_weekly_limit || 40,
    }))
  : [];

// Map assistants - has full employee details
const mappedAssistants = Array.isArray(assData)
  ? assData.map((a) => ({
      id: a.employee_id,
      name: a.employee_name || `Assistant ${a.employee_id}`,
      phone: a.official_contact_number || "N/A",
      status: a.status || "Available",
      weeklyHours: a.total_hours_week || 0,
      maxWeeklyHours: sumData.assistants_weekly_limit || 60,
      consecutiveDeliveries: a.consecutive_deliveries || 0,
      nextAvailableTime: a.next_available_time || "N/A",
      storeId: a.store_id,
    }))
  : [];

// Map managers - has full employee details
const mappedManagers = Array.isArray(mgrData)
  ? mgrData.map((m) => ({
      id: m.employee_id,
      name: m.employee_name || `Manager ${m.employee_id}`,
      username: m.username,
      phone: m.official_contact_number || "N/A",
      nic: m.employee_nic,
      registeredDate: m.registrated_date,
      status: m.employee_status || "Active",
      weeklyHours: m.total_hours_week || 0,
      storeId: m.store_id,
    }))
  : [];

      setDriversData(mappedDrivers);
      setAssistantsData(mappedAssistants);
      setManagersData(mappedManagers);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, driverFilters.status, assistantFilters.status, managerFilters.status]);

  const allStaff = [
    ...driversData.map((d) => ({ ...d, role: "Driver" })),
    ...assistantsData.map((a) => ({ ...a, role: "Assistant" })),
  ];

  const overtimeAlerts = allStaff.filter(
    (d) => (d.weeklyHours || 0) / (d.maxWeeklyHours || 40) >= 0.9
  ).length;

  const getStatusColor = (status) => {
    switch (status) {
      case "On Duty":
      case "on_duty":
        return "bg-blue-100 text-blue-800";
      case "Available":
      case "available":
      case "Active":
        return "bg-green-100 text-green-800";
      case "On Leave":
      case "on_leave":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getHoursStatus = (hours, maxHours) => {
    const percentage = (hours / maxHours) * 100;
    if (percentage >= 90)
      return { color: "text-red-600", status: "Critical", bgColor: "bg-red-600" };
    if (percentage >= 70)
      return { color: "text-orange-600", status: "High", bgColor: "bg-orange-600" };
    return { color: "text-green-600", status: "Normal", bgColor: "bg-green-600" };
  };

  const getComplianceStatus = () => {
    const isMet = summary.compliance === "Compliance met";
    return {
      color: isMet ? "text-green-600" : "text-red-600",
      icon: <CheckCircle className="h-5 w-5" />,
      text: summary.compliance,
    };
  };

  const getAvailableRoles = () => {
    if (currentUser?.role === "admin") {
      return [
        { value: 1, label: "Manager" },
        { value: 2, label: "Driver" },
        { value: 4, label: "Assistant" },
      ];
    } else if (currentUser?.role === "manager") {
      return [
        { value: 2, label: "Driver (role_id: 2)" },
        { value: 3, label: "Assistant (role_id: 3)" },
      ];
    }
    return [];
  };

  const handleAddStaff = async () => {
    try {
      // If manager, force store_id to their own store
      const storeId = currentUser?.role === "manager" 
        ? currentUser.store_id 
        : parseInt(newStaff.store_id);

      const response = await authenticatedFetch(`${API_BASE}/employees/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newStaff.username,
          email: newStaff.email,
          password: newStaff.password,
          employee_name: newStaff.employee_name,
          employee_nic: newStaff.employee_nic,
          official_contact_number: newStaff.official_contact_number,
          registrated_date: newStaff.registrated_date,
          role_id: newStaff.role_id,
          store_id: storeId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create employee");
      }

      const result = await response.json();
      console.log("Employee created successfully:", result);
      
      setShowAddStaff(false);
      setNewStaff({
        username: "",
        email: "",
        password: "",
        employee_name: "",
        employee_nic: "",
        official_contact_number: "",
        registrated_date: new Date().toISOString().split('T')[0],
        role_id: 2,
        store_id: "",
      });
      
      fetchData();
    } catch (err) {
      console.error("Error creating employee:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const filterDataBySearch = (data, searchTerm) => {
  if (!searchTerm) return data;
  const lowerSearch = searchTerm.toLowerCase();
  return data.filter((item) => 
    (item.name && item.name.toLowerCase().includes(lowerSearch)) ||
    item.id.toString().toLowerCase().includes(lowerSearch) ||
    (item.phone && item.phone.toLowerCase().includes(lowerSearch)) ||
    (item.username && item.username.toLowerCase().includes(lowerSearch)) ||
    (item.storeId && item.storeId.toString().toLowerCase().includes(lowerSearch))
  );
};

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Loading user information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Error loading data: {error}</p>
            {error.includes("Authentication") && (
              <Button 
                className="mt-4" 
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
       {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Drivers & Staff</h1>
          <p className="text-muted-foreground">
            Manage drivers, assistants, and workforce scheduling
          </p>
          {currentUser.role === "manager" && (
            <p className="text-sm text-muted-foreground mt-1">
              Store ID: {currentUser.store_id}
            </p>
          )}
        </div>
        {currentUser.role === "admin" && (
          <Button className="flex items-center gap-2" onClick={() => setShowAddStaff(true)}>
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
        )}
      </div>

      {/* Modal for Adding Staff */}
      <Dialog open={showAddStaff} onOpenChange={setShowAddStaff}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <label>
              <span className="text-sm font-medium">Role *</span>
              <select
                className="w-full border rounded-md px-3 py-2 mt-1"
                value={newStaff.role_id}
                onChange={(e) =>
                  setNewStaff((prev) => ({ ...prev, role_id: parseInt(e.target.value) }))
                }
              >
                {getAvailableRoles().map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
            
            <label>
              <span className="text-sm font-medium">Username *</span>
              <Input
                placeholder="Username"
                value={newStaff.username}
                onChange={(e) =>
                  setNewStaff((prev) => ({ ...prev, username: e.target.value }))
                }
                className="mt-1"
              />
            </label>
            
            <label>
              <span className="text-sm font-medium">Email *</span>
              <Input
                type="email"
                placeholder="email@example.com"
                value={newStaff.email}
                onChange={(e) =>
                  setNewStaff((prev) => ({ ...prev, email: e.target.value }))
                }
                className="mt-1"
              />
            </label>
            
            <label>
              <span className="text-sm font-medium">Password *</span>
              <Input
                type="password"
                placeholder="Password"
                value={newStaff.password}
                onChange={(e) =>
                  setNewStaff((prev) => ({ ...prev, password: e.target.value }))
                }
                className="mt-1"
              />
            </label>
            
            <label>
              <span className="text-sm font-medium">Employee Name *</span>
              <Input
                placeholder="Full Name"
                value={newStaff.employee_name}
                onChange={(e) =>
                  setNewStaff((prev) => ({ ...prev, employee_name: e.target.value }))
                }
                className="mt-1"
              />
            </label>
            
            <label>
              <span className="text-sm font-medium">NIC *</span>
              <Input
                placeholder="NIC Number"
                value={newStaff.employee_nic}
                onChange={(e) =>
                  setNewStaff((prev) => ({ ...prev, employee_nic: e.target.value }))
                }
                className="mt-1"
              />
            </label>
            
            <label>
              <span className="text-sm font-medium">Contact Number *</span>
              <Input
                placeholder="Phone Number"
                value={newStaff.official_contact_number}
                onChange={(e) =>
                  setNewStaff((prev) => ({ ...prev, official_contact_number: e.target.value }))
                }
                className="mt-1"
              />
            </label>
            
            <label>
              <span className="text-sm font-medium">Registration Date *</span>
              <Input
                type="date"
                value={newStaff.registrated_date}
                onChange={(e) =>
                  setNewStaff((prev) => ({ ...prev, registrated_date: e.target.value }))
                }
                className="mt-1"
              />
            </label>
            
            {currentUser.role === "admin" && (
              <label>
                <span className="text-sm font-medium">Store ID *</span>
                <Input
                  type="number"
                  placeholder="Store ID"
                  value={newStaff.store_id}
                  onChange={(e) =>
                    setNewStaff((prev) => ({ ...prev, store_id: e.target.value }))
                  }
                  className="mt-1"
                />
              </label>
            )}
            
            {currentUser.role === "manager" && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Staff will be added to your store (Store ID: {currentUser.store_id})
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStaff(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.on_duty_drivers}</div>
            <p className="text-xs text-muted-foreground">out of {driversData.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Assistants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.on_duty_assistants}</div>
            <p className="text-xs text-muted-foreground">out of {assistantsData.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available to Schedule</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.available_to_schedule}</div>
            <p className="text-xs text-muted-foreground">staff ready for assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overtime Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overtimeAlerts}</div>
            <p className="text-xs text-muted-foreground">Near limit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <div className={getComplianceStatus().color}>{getComplianceStatus().icon}</div>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${getComplianceStatus().color}`}>
              {getComplianceStatus().text}
            </div>
            <p className="text-xs text-muted-foreground">regulatory compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Tables with Filters */}
      {currentUser.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Managers</CardTitle>
            <CardDescription>Manage and monitor all store managers</CardDescription>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, email, or store..."
                  value={managerFilters.search}
                  onChange={(e) => setManagerFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
              <select
                className="border rounded-md px-3 py-2 bg-background"
                value={managerFilters.status}
                onChange={(e) => setManagerFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
  <tr className="border-b bg-muted/50">
    <th className="px-4 py-3 text-left font-medium">Employee ID</th>
    <th className="px-4 py-3 text-left font-medium">Name</th>
    <th className="px-4 py-3 text-left font-medium">Status</th>
    <th className="px-4 py-3 text-left font-medium">Username</th>
    <th className="px-4 py-3 text-left font-medium">Phone</th>
    <th className="px-4 py-3 text-left font-medium">Store ID</th>
    <th className="px-4 py-3 text-left font-medium">Weekly Hours</th>
    <th className="px-4 py-3 text-center font-medium">Actions</th>
  </tr>
</thead>
                <tbody>
  {filterDataBySearch(managersData, managerFilters.search).length === 0 ? (
    <tr>
      <td colSpan="8" className="px-4 py-8 text-center text-muted-foreground">
        No managers found matching your filters
      </td>
    </tr>
  ) : (
    filterDataBySearch(managersData, managerFilters.search).map((m) => (
      <tr key={m.id} className="border-b hover:bg-muted/50 transition-colors">
        <td className="px-4 py-3 font-medium">{m.id}</td>
        <td className="px-4 py-3">{m.name}</td>
        <td className="px-4 py-3">
          <Badge className={getStatusColor(m.status)}>{m.status}</Badge>
        </td>
        <td className="px-4 py-3 text-muted-foreground">{m.username}</td>
        <td className="px-4 py-3 text-muted-foreground">{m.phone}</td>
        <td className="px-4 py-3">{m.storeId}</td>
        <td className="px-4 py-3">{m.weeklyHours}h</td>
        <td className="px-4 py-3">
          <div className="flex gap-1 justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/employees/${m.id}`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

{/* Drivers Table */}
<Card>
  <CardHeader>
    <CardTitle>Drivers</CardTitle>
    <CardDescription>Manage and monitor all drivers</CardDescription>
    
    <div className="flex flex-col sm:flex-row gap-3 mt-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by ID..."
          value={driverFilters.search}
          onChange={(e) => setDriverFilters(prev => ({ ...prev, search: e.target.value }))}
          className="pl-10"
        />
      </div>
      <select
        className="border rounded-md px-3 py-2 bg-background"
        value={driverFilters.status}
        onChange={(e) => setDriverFilters(prev => ({ ...prev, status: e.target.value }))}
      >
        <option value="">All Statuses</option>
        <option value="available">Available</option>
        <option value="on_duty">On Duty</option>
        <option value="on_leave">On Leave</option>
      </select>
    </div>
  </CardHeader>
  <CardContent>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Employee ID</th>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Weekly Hours</th>
            <th className="px-4 py-3 text-left font-medium">Phone</th>
            <th className="px-4 py-3 text-left font-medium">Next Available</th>
            <th className="px-4 py-3 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {driversData.filter(d => {
            if (!driverFilters.search) return true;
            const search = driverFilters.search.toLowerCase();
            return d.id.toString().toLowerCase().includes(search) || (d.name || "").toLowerCase().includes(search);
          }).length === 0 ? (
            <tr>
              <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                No drivers found matching your filters
              </td>
            </tr>
          ) : (
            driversData.filter(d => {
              if (!driverFilters.search) return true;
              const search = driverFilters.search.toLowerCase();
              return d.id.toString().toLowerCase().includes(search) || (d.name || "").toLowerCase().includes(search);
            }).map((d) => {
              const nextAvailableDate = d.nextAvailableTime !== "N/A"
                ? new Date(d.nextAvailableTime).toLocaleString()
                : "N/A";
              return (
                <tr key={d.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{d.id}</td>
                  <td className="px-4 py-3">{d.name}</td>
                  <td className="px-4 py-3">{d.weeklyHours}h</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{nextAvailableDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/employees/${d.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>

{/* Assistants Table */}
<Card>
  <CardHeader>
    <CardTitle>Assistants</CardTitle>
    <CardDescription>Manage and monitor all assistants</CardDescription>
    
    <div className="flex flex-col sm:flex-row gap-3 mt-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, ID, phone, or store..."
          value={assistantFilters.search}
          onChange={(e) => setAssistantFilters(prev => ({ ...prev, search: e.target.value }))}
          className="pl-10"
        />
      </div>
      <select
        className="border rounded-md px-3 py-2 bg-background"
        value={assistantFilters.status}
        onChange={(e) => setAssistantFilters(prev => ({ ...prev, status: e.target.value }))}
      >
        <option value="">All Statuses</option>
        <option value="available">Available</option>
        <option value="on_duty">On Duty</option>
        <option value="on_leave">On Leave</option>
      </select>
    </div>
  </CardHeader>
  <CardContent>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Employee ID</th>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Phone</th>
            <th className="px-4 py-3 text-left font-medium">Store ID</th>
            <th className="px-4 py-3 text-left font-medium">Weekly Hours</th>
            <th className="px-4 py-3 text-left font-medium">Consecutive Deliveries</th>
            <th className="px-4 py-3 text-left font-medium">Next Available</th>
            <th className="px-4 py-3 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filterDataBySearch(assistantsData, assistantFilters.search).length === 0 ? (
            <tr>
              <td colSpan="9" className="px-4 py-8 text-center text-muted-foreground">
                No assistants found matching your filters
              </td>
            </tr>
          ) : (
            filterDataBySearch(assistantsData, assistantFilters.search).map((a) => {
              const hoursStatus = getHoursStatus(a.weeklyHours, a.maxWeeklyHours);
              const nextAvailableDate = a.nextAvailableTime !== "N/A"
                ? new Date(a.nextAvailableTime).toLocaleString()
                : "N/A";
              return (
                <tr key={a.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{a.id}</td>
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3">
                    <Badge className={getStatusColor(a.status)}>{a.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.phone}</td>
                  <td className="px-4 py-3">{a.storeId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${hoursStatus.bgColor}`}
                          style={{
                            width: `${Math.min((a.weeklyHours / a.maxWeeklyHours) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${hoursStatus.color}`}>
                        {a.weeklyHours}/{a.maxWeeklyHours}h
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{a.consecutiveDeliveries}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{nextAvailableDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/employees/${a.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>
    </div>
  );
};

export default Drivers;