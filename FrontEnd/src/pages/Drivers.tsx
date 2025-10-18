import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Truck,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const Drivers = () => {
  const [summary, setSummary] = useState({
    on_duty_drivers: 0,
    drivers_weekly_limit: 40,
    on_duty_assistants: 0,
    assistants_weekly_limit: 60,
    available_to_schedule: 0,
    compliance: "Loading..."
  });
  const [driversData, setDriversData] = useState([]);
  const [assistantsData, setAssistantsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drivers filters
  const [driverSearch, setDriverSearch] = useState("");
  const [driverStatusFilter, setDriverStatusFilter] = useState("");
  const [driverCurrentPage, setDriverCurrentPage] = useState(1);

  // Assistants filters
  const [assistantSearch, setAssistantSearch] = useState("");
  const [assistantStatusFilter, setAssistantStatusFilter] = useState("");
  const [assistantCurrentPage, setAssistantCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, drvRes, assRes] = await Promise.all([
          fetch(`${API_BASE}/summary`, { cache: 'no-store' }),
          fetch(`${API_BASE}/drivers`, { cache: 'no-store' }),
          fetch(`${API_BASE}/assistants`, { cache: 'no-store' })
        ]);
        
        if (!sumRes.ok) {
          const text = await sumRes.text();
          console.error('Summary endpoint error:', sumRes.status, text);
          throw new Error(`Summary API failed (${sumRes.status}). Check console and verify endpoint.`);
        }
        if (!drvRes.ok) {
          const text = await drvRes.text();
          console.error('Drivers endpoint error:', drvRes.status, text);
          throw new Error(`Drivers API failed (${drvRes.status}). Check console and verify endpoint.`);
        }
        if (!assRes.ok) {
          const text = await assRes.text();
          console.error('Assistants endpoint error:', assRes.status, text);
          throw new Error(`Assistants API failed (${assRes.status}). Check console and verify endpoint.`);
        }
        
        const sumData = await sumRes.json();
        const drvData = await drvRes.json();
        const assData = await assRes.json();
        
        setSummary(sumData);
        setDriversData(Array.isArray(drvData) ? drvData : []);
        setAssistantsData(Array.isArray(assData) ? assData : []);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const overtimeAlerts = [...driversData, ...assistantsData].filter(
    d => (d.total_hours_week || 0) / (d.role === 'Driver' ? summary.drivers_weekly_limit : summary.assistants_weekly_limit) >= 0.9
  ).length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Duty': return 'bg-blue-100 text-blue-800';
      case 'Available': return 'bg-green-100 text-green-800';
      case 'On Leave': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHoursStatus = (hours, maxHours) => {
    const percentage = (hours / maxHours) * 100;
    if (percentage >= 90) return { color: 'text-red-600', status: 'Critical', bgColor: 'bg-red-600' };
    if (percentage >= 70) return { color: 'text-orange-600', status: 'High', bgColor: 'bg-orange-600' };
    return { color: 'text-green-600', status: 'Normal', bgColor: 'bg-green-600' };
  };

  const getComplianceStatus = () => {
    const isMet = summary.compliance === 'Compliance met';
    return {
      color: isMet ? 'text-green-600' : 'text-red-600',
      icon: <CheckCircle className="h-5 w-5" />,
      text: summary.compliance
    };
  };

  const filterData = (data, search, statusFilter) => {
    return data.filter(item => {
      const matchesSearch = 
        item.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.employee_id?.toString().includes(search) ||
        item.official_contact_number?.includes(search);
      
      const matchesStatus = !statusFilter || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const paginateData = (data, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const filteredDrivers = filterData(driversData, driverSearch, driverStatusFilter);
  const paginatedDrivers = paginateData(filteredDrivers, driverCurrentPage);
  const driverTotalPages = Math.ceil(filteredDrivers.length / ITEMS_PER_PAGE);

  const filteredAssistants = filterData(assistantsData, assistantSearch, assistantStatusFilter);
  const paginatedAssistants = paginateData(filteredAssistants, assistantCurrentPage);
  const assistantTotalPages = Math.ceil(filteredAssistants.length / ITEMS_PER_PAGE);

  const uniqueStatuses = [...new Set([...driversData, ...assistantsData].map(d => d.status))];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Drivers & Staff</h1>
            <p className="text-muted-foreground">Manage drivers, assistants, and workforce scheduling</p>
          </div>
        </div>
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
          <p className="text-muted-foreground">Manage drivers, assistants, and workforce scheduling</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.on_duty_drivers}</div>
            <p className="text-xs text-muted-foreground">out of {driversData.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assistants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.on_duty_assistants}</div>
            <p className="text-xs text-muted-foreground">out of {assistantsData.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available to Schedule</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.available_to_schedule}</div>
            <p className="text-xs text-muted-foreground">staff ready for assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overtimeAlerts}
            </div>
            <p className="text-xs text-muted-foreground">Near limit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <div className={getComplianceStatus().color}>
              {getComplianceStatus().icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${getComplianceStatus().color}`}>
              {getComplianceStatus().text}
            </div>
            <p className="text-xs text-muted-foreground">regulatory compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Drivers</CardTitle>
          <CardDescription>Manage and monitor all drivers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or phone..."
                  value={driverSearch}
                  onChange={(e) => {
                    setDriverSearch(e.target.value);
                    setDriverCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <select
                value={driverStatusFilter}
                onChange={(e) => {
                  setDriverStatusFilter(e.target.value);
                  setDriverCurrentPage(1);
                }}
                className="border rounded px-3 py-2 bg-white"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Employee ID</th>
                    <th className="px-4 py-3 text-left font-medium">Employee Name</th>
                    <th className="px-4 py-3 text-left font-medium">Phone</th>
                    <th className="px-4 py-3 text-left font-medium">Store ID</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Weekly Hours</th>
                    <th className="px-4 py-3 text-left font-medium">Consecutive Deliveries</th>
                    <th className="px-4 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDrivers.map((driver) => {
                    const maxHours = summary.drivers_weekly_limit;
                    const hoursStatus = getHoursStatus(driver.total_hours_week || 0, maxHours);
                    
                    return (
                      <tr key={driver.employee_id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{driver.employee_id}</td>
                        <td className="px-4 py-3">{driver.employee_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{driver.official_contact_number}</td>
                        <td className="px-4 py-3">{driver.store_id}</td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(driver.status)}>
                            {driver.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${hoursStatus.bgColor}`}
                                style={{ width: `${Math.min(((driver.total_hours_week || 0) / maxHours) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-medium ${hoursStatus.color}`}>
                              {driver.total_hours_week || 0}/{maxHours}h
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{driver.consecutive_deliveries}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-center">
                            <Button variant="outline" size="sm">Schedule</Button>
                            <Button size="sm">Assign</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Showing {paginatedDrivers.length > 0 ? (driverCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(driverCurrentPage * ITEMS_PER_PAGE, filteredDrivers.length)} of {filteredDrivers.length}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDriverCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={driverCurrentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm">{driverCurrentPage} / {driverTotalPages || 1}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDriverCurrentPage(prev => Math.min(driverTotalPages, prev + 1))}
                  disabled={driverCurrentPage >= driverTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assistants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assistants</CardTitle>
          <CardDescription>Manage and monitor all assistants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or phone..."
                  value={assistantSearch}
                  onChange={(e) => {
                    setAssistantSearch(e.target.value);
                    setAssistantCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <select
                value={assistantStatusFilter}
                onChange={(e) => {
                  setAssistantStatusFilter(e.target.value);
                  setAssistantCurrentPage(1);
                }}
                className="border rounded px-3 py-2 bg-white"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Employee ID</th>
                    <th className="px-4 py-3 text-left font-medium">Employee Name</th>
                    <th className="px-4 py-3 text-left font-medium">Phone</th>
                    <th className="px-4 py-3 text-left font-medium">Store ID</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Weekly Hours</th>
                    <th className="px-4 py-3 text-left font-medium">Consecutive Deliveries</th>
                    <th className="px-4 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssistants.map((assistant) => {
                    const maxHours = summary.assistants_weekly_limit;
                    const hoursStatus = getHoursStatus(assistant.total_hours_week || 0, maxHours);
                    
                    return (
                      <tr key={assistant.employee_id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{assistant.employee_id}</td>
                        <td className="px-4 py-3">{assistant.employee_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{assistant.official_contact_number}</td>
                        <td className="px-4 py-3">{assistant.store_id}</td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(assistant.status)}>
                            {assistant.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${hoursStatus.bgColor}`}
                                style={{ width: `${Math.min(((assistant.total_hours_week || 0) / maxHours) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-medium ${hoursStatus.color}`}>
                              {assistant.total_hours_week || 0}/{maxHours}h
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{assistant.consecutive_deliveries}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-center">
                            <Button variant="outline" size="sm">Schedule</Button>
                            <Button size="sm">Assign</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Showing {paginatedAssistants.length > 0 ? (assistantCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(assistantCurrentPage * ITEMS_PER_PAGE, filteredAssistants.length)} of {filteredAssistants.length}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAssistantCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={assistantCurrentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm">{assistantCurrentPage} / {assistantTotalPages || 1}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAssistantCurrentPage(prev => Math.min(assistantTotalPages, prev + 1))}
                  disabled={assistantCurrentPage >= assistantTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Drivers;