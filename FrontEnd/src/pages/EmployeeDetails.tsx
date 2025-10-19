import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Phone,
  Mail,
  User,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get auth headers
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
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        const response = await authenticatedFetch(`${API_BASE}/employees/${id}`, { cache: "no-store" });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Employee not found");
          }
          if (response.status === 403) {
            throw new Error("Access denied");
          }
          throw new Error("Failed to fetch employee data");
        }

        const data = await response.json();

        const roleMap = {
          1: { name: "Manager", maxHours: 40 },
          2: { name: "Driver", maxHours: 40 },
          3: { name: "Assistant", maxHours: 60 },
          4: { name: "Assistant", maxHours: 60 },
        };

        const mappedEmployee = {
          id: data.employee_id,
          name: data.employee_name,
          username: data.username,
          email: data.email,
          phone: data.official_contact_number || "N/A",
          nic: data.employee_nic,
          registeredDate: data.registrated_date,
          roleId: data.role_id,
          role: roleMap[data.role_id]?.name || "Unknown",
          storeId: data.store_id,
          status: data.status || "Available",
          weeklyHours: data.total_hours_week || 0,
          maxWeeklyHours: roleMap[data.role_id]?.maxHours || 40,
          consecutiveDeliveries: data.consecutive_deliveries || 0,
          nextAvailableTime: data.next_available_time || "N/A",
          lastDeliveryTime: data.last_delivery_time || "N/A",
        };

        setEmployee(mappedEmployee);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error fetching employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Loading employee details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error || "Employee not found"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hoursStatus = getHoursStatus(employee.weeklyHours, employee.maxWeeklyHours);
  const hoursPercentage = (employee.weeklyHours / employee.maxWeeklyHours) * 100;
  const isDeliveryRole = employee.role === "Driver" || employee.role === "Assistant";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Drivers & Staff
        </Button>

        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{employee.name}</h1>
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-lg">
                  {employee.role} • Employee ID: {employee.id}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Edit</Button>
                <Button>Assign Task</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal & Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{employee.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">NIC</p>
                  <p className="font-medium">{employee.nic}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Registered Date</p>
                  <p className="font-medium">{employee.registeredDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Store ID</p>
                  <p className="font-medium">{employee.storeId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <p className="font-medium">{employee.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Next Available</p>
                <p className="font-medium">
                  {employee.nextAvailableTime !== "N/A"
                    ? new Date(employee.nextAvailableTime).toLocaleString()
                    : "Currently Available"}
                </p>
              </div>
            </div>
            {isDeliveryRole && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Delivery</p>
                  <p className="font-medium">
                    {employee.lastDeliveryTime !== "N/A"
                      ? new Date(employee.lastDeliveryTime).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weekly Hours */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Weekly Hours</h3>
                  </div>
                  <Badge variant="outline" className={hoursStatus.color}>
                    {hoursStatus.status}
                  </Badge>
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold">{employee.weeklyHours}</span>
                    <span className="text-muted-foreground">/ {employee.maxWeeklyHours} hours</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${hoursStatus.bgColor} transition-all`}
                      style={{ width: `${Math.min(hoursPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {Math.round(hoursPercentage)}% of weekly limit
                  </p>
                </div>
              </div>

              {/* Completed Deliveries */}
              {isDeliveryRole && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Completed Deliveries</h3>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2">{employee.consecutiveDeliveries}</div>
                    <p className="text-sm text-muted-foreground">
                      Consecutive deliveries completed this period
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Work Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isDeliveryRole && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{employee.consecutiveDeliveries}</p>
                  <p className="text-sm text-muted-foreground">Total Deliveries</p>
                </div>
              )}
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{employee.weeklyHours}h</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{employee.role}</p>
                <p className="text-sm text-muted-foreground">Role</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{employee.status}</p>
                <p className="text-sm text-muted-foreground">Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDetails;