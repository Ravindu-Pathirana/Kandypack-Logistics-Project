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

  // Modal state
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showViewEmployee, setShowViewEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Build query params for drivers
      const driverParams = new URLSearchParams();
      if (driverFilters.status) {
        driverParams.append("status", driverFilters.status);
      }
      
      // Build query params for assistants
      const assistantParams = new URLSearchParams();
      if (assistantFilters.status) {
        assistantParams.append("status", assistantFilters.status);
      }

      const [sumRes, drvRes, assRes] = await Promise.all([
        fetch(`${API_BASE}/summary`, { cache: "no-store" }),
        fetch(`${API_BASE}/drivers?${driverParams.toString()}`, { cache: "no-store" }),
        fetch(`${API_BASE}/assistants?${assistantParams.toString()}`, { cache: "no-store" }),
      ]);

      if (!sumRes.ok) throw new Error("Summary API failed");
      if (!drvRes.ok) throw new Error("Drivers API failed");
      if (!assRes.ok) throw new Error("Assistants API failed");

      const sumData = await sumRes.json();
      const drvData = await drvRes.json();
      const assData = await assRes.json();

      setSummary(sumData);

      const mappedDrivers = Array.isArray(drvData)
        ? drvData.map((d) => ({
            id: d.employee_id || d.id,
            storeId: d.store_id,
            phone: d.official_contact_number || d.phone || "N/A",
            status: d.status || "Available",
            weeklyHours:
              d.total_hours_week || d.weekly_hours || d.weeklyHours || 0,
            maxWeeklyHours: sumData.drivers_weekly_limit || 40,
            completedDeliveries:
              d.consecutive_deliveries ||
              d.completed_deliveries ||
              d.completedDeliveries ||
              0,
            nextAvailableTime: d.next_available_time || d.nextAvailableTime || "N/A",
            name: d.employee_name || d.name || `Driver ${d.employee_id || d.id}`,
          }))
        : [];

      const mappedAssistants = Array.isArray(assData)
        ? assData.map((a) => ({
            id: a.employee_id || a.id,
            storeId: a.store_id,
            phone: a.official_contact_number || a.phone || "N/A",
            status: a.status || "Available",
            weeklyHours:
              a.total_hours_week || a.weekly_hours || a.weeklyHours || 0,
            maxWeeklyHours: sumData.assistants_weekly_limit || 60,
            completedDeliveries:
              a.consecutive_deliveries ||
              a.completed_deliveries ||
              a.completedDeliveries ||
              0,
            nextAvailableTime: a.next_available_time || a.nextAvailableTime || "N/A",
            name: a.employee_name || a.name || `Assistant ${a.employee_id || a.id}`,
          }))
        : [];

      setDriversData(mappedDrivers);
      setAssistantsData(mappedAssistants);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [driverFilters.status, assistantFilters.status]);

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

  const handleAddStaff = async () => {
    try {
      const response = await fetch(`${API_BASE}/employees/create`, {
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
          store_id: parseInt(newStaff.store_id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create employee");
      }

      const result = await response.json();
      console.log("Employee created successfully:", result);
      
      // Close modal and reset form
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
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error("Error creating employee:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleViewEmployee = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  const filterDataBySearch = (data, searchTerm) => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((item) => 
      item.name.toLowerCase().includes(lowerSearch) ||
      item.id.toString().toLowerCase().includes(lowerSearch) ||
      item.phone.toLowerCase().includes(lowerSearch) ||
      item.storeId.toString().toLowerCase().includes(lowerSearch)
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">Error loading data: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Drivers & Staff</h1>
          <p className="text-muted-foreground">
            Manage drivers, assistants, and workforce scheduling
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowAddStaff(true)}>
          <Plus className="h-4 w-4" />
          Add Staff Member
        </Button>
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
                <option value={2}>Driver (role_id: 2)</option>
                <option value={3}>Assistant (role_id: 3)</option>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStaff(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for Viewing Employee Details */}
      <Dialog open={showViewEmployee} onOpenChange={setShowViewEmployee}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="grid gap-6 py-4">
              {/* Header Section */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">ID: {selectedEmployee.id}</p>
                </div>
                <Badge className={getStatusColor(selectedEmployee.status)}>
                  {selectedEmployee.status}
                </Badge>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{selectedEmployee.role}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Store ID</p>
                  <p className="font-medium">{selectedEmployee.storeId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Contact Number</p>
                  <p className="font-medium">{selectedEmployee.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Next Available</p>
                  <p className="font-medium">
                    {selectedEmployee.nextAvailableTime !== "N/A"
                      ? new Date(selectedEmployee.nextAvailableTime).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Performance Section */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Work Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Weekly Hours</p>
                        <div className="flex items-center justify-center gap-2">
                          <div className="text-2xl font-bold">{selectedEmployee.weeklyHours}</div>
                          <span className="text-muted-foreground">/ {selectedEmployee.maxWeeklyHours}h</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full ${
                              getHoursStatus(selectedEmployee.weeklyHours, selectedEmployee.maxWeeklyHours).bgColor
                            }`}
                            style={{
                              width: `${Math.min(
                                (selectedEmployee.weeklyHours / selectedEmployee.maxWeeklyHours) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Completed Deliveries</p>
                        <div className="text-2xl font-bold">{selectedEmployee.completedDeliveries}</div>
                        <p className="text-xs text-muted-foreground mt-1">consecutive deliveries</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewEmployee(false)}>
              Close
            </Button>
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
      {[
        { 
          title: "Drivers", 
          data: driversData, 
          maxHours: summary.drivers_weekly_limit,
          filters: driverFilters,
          setFilters: setDriverFilters
        }, 
        { 
          title: "Assistants", 
          data: assistantsData, 
          maxHours: summary.assistants_weekly_limit,
          filters: assistantFilters,
          setFilters: setAssistantFilters
        }
      ].map(({ title, data, maxHours, filters, setFilters }) => {
        const filteredData = filterDataBySearch(data, filters.search);
        
        return (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Manage and monitor all {title.toLowerCase()}</CardDescription>
              
              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID, phone, or store..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <select
                  className="border rounded-md px-3 py-2 bg-background"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
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
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-4 py-8 text-center text-muted-foreground">
                          No {title.toLowerCase()} found matching your filters
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((d) => {
                        const hoursStatus = getHoursStatus(d.weeklyHours, maxHours);
                        const nextAvailableDate =
                          d.nextAvailableTime !== "N/A"
                            ? new Date(d.nextAvailableTime).toLocaleString()
                            : "N/A";
                        return (
                          <tr key={d.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-3 font-medium">{d.id}</td>
                            <td className="px-4 py-3">{d.name}</td>
                            <td className="px-4 py-3">
                              <Badge className={getStatusColor(d.status)}>{d.status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{d.phone}</td>
                            <td className="px-4 py-3">{d.storeId}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-muted rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${hoursStatus.bgColor}`}
                                    style={{
                                      width: `${Math.min((d.weeklyHours / maxHours) * 100, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className={`text-xs font-medium ${hoursStatus.color}`}>
                                  {d.weeklyHours}/{maxHours}h
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{d.completedDeliveries}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{nextAvailableDate}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 justify-center">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewEmployee(d.id)}
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
        );
      })}
    </div>
  );
};

export default Drivers;