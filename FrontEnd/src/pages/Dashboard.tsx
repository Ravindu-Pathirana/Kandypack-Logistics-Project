import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Train,
  Truck,
  Users,
  MapPin,
  AlertTriangle,
  Store,
  Package as ProductIcon,
  Building2,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const Dashboard = () => {
  const navigate = useNavigate();

  // === STATES ===
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTrains, setActiveTrains] = useState<any[]>([]);
  const [loadingTrains, setLoadingTrains] = useState(false);
  const [trainsSearch, setTrainsSearch] = useState("");
  const [trainsPage, setTrainsPage] = useState(1);
  const [trucksSearch, setTrucksSearch] = useState("");
  const [trucksPage, setTrucksPage] = useState(1);
  const [storeOrders, setStoreOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersPage, setOrdersPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  });

  // === FETCH TRAINS ===
  useEffect(() => {
    setLoadingTrains(true);
    fetch(`${API_BASE}/trains/pending`, { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => {
        const transformed = (Array.isArray(data) ? data : []).map((train) => {
          let progress = 0;
          let eta = "Calculating...";
          if (train.start_date_time) {
            const now = new Date();
            const startTime = new Date(train.start_date_time);
            const hoursPassed =
              (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            const maxRouteHours = 4;
            progress = Math.min(
              100,
              Math.max(0, (hoursPassed / maxRouteHours) * 100)
            );
            const remaining = Math.max(
              0,
              Math.round(100 * (1 - progress / 100))
            );
            eta = `${remaining}% remaining`;
          }
          return {
            id: train.trip_id,
            train_id: train.train_id,
            product_id: train.product_id,
            allocated_qty: train.allocated_qty,
            start_date_time: train.start_date_time,
            reached_date_time: train.reached_date_time,
            status: train.status || "Pending",
            progress,
            eta,
          };
        });
        setActiveTrains(transformed);
      })
      .catch((err) => console.error("ERROR fetching trains:", err))
      .finally(() => setLoadingTrains(false));
  }, []);

  // === MARK TRAIN ARRIVED ===
  const handleTrainArrived = async (trainId: number) => {
    if (!window.confirm(`Mark train #${trainId} as arrived?`)) return;
    try {
      const res = await fetch(`${API_BASE}/trains/${trainId}/arrived`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(`Error: ${errData.detail || res.statusText}`);
        return;
      }
      setActiveTrains((prev) =>
        prev.map((t) =>
          t.id === trainId
            ? { ...t, status: "Arrived", reached_date_time: new Date().toISOString() }
            : t
        )
      );
    } catch (err) {
      console.error("Train Arrived error:", err);
      alert("Something went wrong while marking the train as arrived.");
    }
  };

  // === FETCH DELIVERIES ===
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/active-deliveries`, { headers: getAuthHeaders() })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }
        return res.json();
      })
      .then((data) => {
        const transformed = (Array.isArray(data) ? data : []).map((delivery) => {
          let progress = 20;
          let distance = "Loading...";
          if (delivery.actual_departure) {
            const now = new Date();
            const departureTime = new Date(delivery.actual_departure);
            const timePassed =
              (now.getTime() - departureTime.getTime()) / (1000 * 60 * 60);
            const maxRouteHours = delivery.max_route_hours || 4;
            progress = Math.min(
              100,
              Math.max(0, (timePassed / maxRouteHours) * 100)
            );
            const kmLeft = Math.round(150 * (1 - progress / 100));
            distance = `${kmLeft} km left`;
          }
          return {
            id: delivery.delivery_id,
            route_id: delivery.route_id,
            driver: `Driver-${delivery.route_id}`,
            origin: `Store-${delivery.route_id}`,
            eta: delivery.max_delivery_time,
            load: `${delivery.route_id} pallets`,
            status: delivery.actual_departure ? "En Route" : "Loading",
            arrived: false,
            progress,
            distance,
            actual_departure: delivery.actual_departure,
          };
        });
        setActiveDeliveries(transformed);
      })
      .catch((err) => console.error("ERROR:", err))
      .finally(() => setLoading(false));
  }, []);

  // === FETCH ORDERS ===
  useEffect(() => {
    setLoadingOrders(true);
    fetch(`${API_BASE}/orders/at-store`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => setStoreOrders(Array.isArray(data) ? data : []))
      .catch((err) => console.error("ERROR fetching store orders:", err))
      .finally(() => setLoadingOrders(false));
  }, []);

  // === HELPERS ===
  const filterItems = (items: any[], search: string) =>
    items.filter(
      (item) =>
        item.id?.toString().includes(search) ||
        item.driver?.toLowerCase().includes(search.toLowerCase()) ||
        item.origin?.toLowerCase().includes(search.toLowerCase())
    );

  const paginate = (items: any[], page: number) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const filteredTrains = filterItems(activeTrains, trainsSearch);
  const paginatedTrains = paginate(filteredTrains, trainsPage);
  const totalTrainPages = Math.ceil(filteredTrains.length / ITEMS_PER_PAGE);

  const filteredTrucks = filterItems(
    activeDeliveries.filter((t) => !t.arrived),
    trucksSearch
  );
  const paginatedTrucks = paginate(filteredTrucks, trucksPage);
  const totalTruckPages = Math.ceil(filteredTrucks.length / ITEMS_PER_PAGE);

  const filteredOrders = storeOrders.filter(
    (order) =>
      order.customer_name?.toLowerCase().includes(ordersSearch.toLowerCase()) ||
      order.status?.toLowerCase().includes(ordersSearch.toLowerCase())
  );
  const paginatedOrders = paginate(filteredOrders, ordersPage);
  const totalOrderPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  // === PAGINATION ===
  const PaginationControls = ({
    page,
    totalPages,
    onChange,
  }: {
    page: number;
    totalPages: number;
    onChange: (p: number) => void;
  }) =>
    totalPages > 1 && (
      <div className="flex items-center justify-between mt-4 px-1">
        <span className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );

  // === MAIN ===
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Truck className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );

  return (
    <div className="flex min-h-screen gap-0">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-blue-600 to-blue-800 text-white p-6 space-y-6 overflow-y-auto">
        <div>
          <h2 className="text-2xl font-bold mb-2">Management</h2>
          <p className="text-blue-100 text-sm">Configure system entities</p>
        </div>
        <Button
          className="w-full justify-start gap-3 bg-white/20 hover:bg-white/30 text-white"
          onClick={() => navigate("/manage/trucks")}
        >
          <Truck className="h-4 w-4" /> Manage Trucks
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Store Arrivals Dashboard</h1>
            <p className="text-muted-foreground">
              Trucks, trains, and store orders overview
            </p>
          </div>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
            onClick={() => navigate("/deliveries/assign")}
          >
            <Package className="h-4 w-4" /> Assign Delivery
          </Button>
        </div>

        {/* === TRAIN CARD === */}
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-1 text-blue-600">
              <Train className="h-4 w-4" /> Pending Trains
            </CardTitle>
            <CardDescription>Trains yet to reach the store</CardDescription>
            <Input
              placeholder="Search trains..."
              value={trainsSearch}
              onChange={(e) => {
                setTrainsSearch(e.target.value);
                setTrainsPage(1);
              }}
              className="mt-1"
            />
          </CardHeader>
          <CardContent>
            {paginatedTrains.map((train) => (
              <div
                key={train.id}
                className="flex flex-col p-2 border rounded-md bg-blue-50 gap-1"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">Trip #{train.id}</p>
                  <Badge variant="outline" className="text-xs">
                    {train.status}
                  </Badge>
                </div>
                <Progress value={train.progress} className="h-1.5 my-1" />
                <p className="text-xs text-muted-foreground">{train.eta}</p>
                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1"
                  disabled={train.status === "Arrived"}
                  onClick={() => handleTrainArrived(train.id)}
                >
                  <Check className="h-3 w-3 mr-1" />
                  {train.status === "Arrived" ? "Arrived" : "Mark Arrived"}
                </Button>
              </div>
            ))}
            <PaginationControls
              page={trainsPage}
              totalPages={totalTrainPages}
              onChange={setTrainsPage}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
