"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Map, Truck, User, Calendar } from "lucide-react";

interface Order {
  order_id: number;
  customer_name: string;
  total_quantity: number;
  total_price: number;
  required_date: string;
}

interface Route {
  route_id: string;
  origin: string;
  destination: string;
  distance_km: number;
}

interface Employee {
  employee_id: number;
  employee_name: string;
  role: string;
}

interface TruckItem {
  truck_id: number;
  store_id: number;
  plate_number: string;
  is_available: number;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export default function AssignDelivery() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Employee[]>([]);
  const [assistants, setAssistants] = useState<Employee[]>([]);
  const [trucks, setTrucks] = useState<TruckItem[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [selectedAssistant, setSelectedAssistant] = useState<string>("");
  const [selectedTruck, setSelectedTruck] = useState<string>("");
  const [scheduledDeparture, setScheduledDeparture] = useState<string>("");

  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  });

  // === Fetch Orders ===
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/orders/at-store`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // === Fetch Routes ===
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch(`${API_BASE}/routes/`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        setRoutes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching routes:", err);
      }
    };
    fetchRoutes();
  }, []);

  // === Fetch Eligible Employees when Route selected ===
  useEffect(() => {
    if (!selectedRoute) return;

    const fetchEligibleEmployees = async () => {
      try {
        setLoadingEmployees(true);
        setDrivers([]);
        setAssistants([]);
        const res = await fetch(
          `${API_BASE}/employees-eligible?route_id=${selectedRoute}`,
          { headers: getAuthHeaders() }
        );
        const data = await res.json();

        const normalized = Array.isArray(data)
          ? data.map((emp: any) => ({
              ...emp,
              role: String(emp.role || "").toLowerCase(),
            }))
          : [];

        setDrivers(normalized.filter((e) => e.role === "driver"));
        setAssistants(normalized.filter((e) => e.role === "assistant"));
      } catch (err) {
        console.error("Error fetching eligible employees:", err);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEligibleEmployees();
  }, [selectedRoute]);

  // === Fetch Trucks ===
  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const res = await fetch(`${API_BASE}/trucks`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        setTrucks(
          Array.isArray(data) ? data.filter((t) => t.is_available === 1) : []
        );
      } catch (err) {
        console.error("Error fetching trucks:", err);
      }
    };
    fetchTrucks();
  }, []);

  // === Filter Orders by Search ===
  const filteredOrders = orders.filter(
    (o) =>
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.order_id?.toString().includes(search)
  );

  // === Submit ===
  const handleSubmit = async () => {
    if (
      !selectedOrder ||
      !selectedRoute ||
      !selectedDriver ||
      !selectedTruck ||
      !scheduledDeparture
    ) {
      alert("Please fill all required fields including scheduled departure.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const body = {
        order_id: Number(selectedOrder),
        route_id: selectedRoute,
        truck_id: Number(selectedTruck),
        driver_id: Number(selectedDriver),
        assistant_id: selectedAssistant ? Number(selectedAssistant) : null,
        scheduled_departure,
      };

      const res = await fetch(`${API_BASE}/deliveries/assign`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to assign delivery");
      const data = await res.json();
      setMessage(`✅ ${data[0]?.message || "Delivery assigned successfully!"}`);

      // reset
      setSelectedOrder("");
      setSelectedRoute("");
      setSelectedDriver("");
      setSelectedAssistant("");
      setSelectedTruck("");
      setScheduledDeparture("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error creating assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Assign Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Order */}
          <div>
            <Label>Order</Label>
            <Input
              placeholder="Search order by customer or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2"
            />
            <Select
              value={selectedOrder}
              onValueChange={setSelectedOrder}
              disabled={loading || filteredOrders.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an order" />
              </SelectTrigger>
              <SelectContent>
                {filteredOrders.map((o) => (
                  <SelectItem key={o.order_id} value={o.order_id.toString()}>
                    #{o.order_id} — {o.customer_name} ({o.total_quantity} items)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Route */}
          <div>
            <Label className="flex items-center gap-2">
              <Map className="h-4 w-4" /> Route
            </Label>
            <Select
              value={selectedRoute}
              onValueChange={setSelectedRoute}
              disabled={routes.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((r) => (
                  <SelectItem key={r.route_id} value={r.route_id}>
                    {r.origin} → {r.destination} ({r.distance_km} km)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Driver */}
          <div>
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" /> Driver
            </Label>
            {loadingEmployees ? (
              <p className="text-xs text-muted-foreground px-1 mb-1">
                Loading eligible employees...
              </p>
            ) : null}
            <Select
              value={selectedDriver}
              onValueChange={setSelectedDriver}
              disabled={loadingEmployees}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select eligible driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.length > 0 ? (
                  drivers.map((d) => (
                    <SelectItem
                      key={d.employee_id}
                      value={d.employee_id.toString()}
                    >
                      {d.employee_name}
                    </SelectItem>
                  ))
                ) : (
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    No eligible drivers
                  </p>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Assistant */}
          <div>
            <Label>Assistant (optional)</Label>
            <Select
              value={selectedAssistant}
              onValueChange={setSelectedAssistant}
              disabled={loadingEmployees}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select eligible assistant" />
              </SelectTrigger>
              <SelectContent>
                {assistants.length > 0 ? (
                  assistants.map((a) => (
                    <SelectItem
                      key={a.employee_id}
                      value={a.employee_id.toString()}
                    >
                      {a.employee_name}
                    </SelectItem>
                  ))
                ) : (
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    No eligible assistants
                  </p>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Truck */}
          <div>
            <Label className="flex items-center gap-2">
              <Truck className="h-4 w-4" /> Truck
            </Label>
            <Select
              value={selectedTruck}
              onValueChange={setSelectedTruck}
              disabled={trucks.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select available truck" />
              </SelectTrigger>
              <SelectContent>
                {trucks.map((t) => (
                  <SelectItem key={t.truck_id} value={t.truck_id.toString()}>
                    {t.plate_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Departure */}
          <div>
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Scheduled Departure
            </Label>
            <Input
              type="datetime-local"
              value={scheduledDeparture}
              onChange={(e) => setScheduledDeparture(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Assign Delivery"
              )}
            </Button>
            {message && (
              <p className="text-center mt-2 text-sm text-muted-foreground">
                {message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
