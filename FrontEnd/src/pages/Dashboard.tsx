import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Train, 
  Truck, 
  Users, 
  TrendingUp,
  MapPin,
  Clock as ClockIcon,
  AlertTriangle,
  Store,
  Package as ProductIcon,
  Building2,
  ChevronLeft,
  ChevronRight,
  Check
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const Dashboard = () => {
  const navigate = useNavigate();

  // API STATES
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  // TRUCK TABLE STATES
  const [trucksSearch, setTrucksSearch] = useState("");
  const [trucksPage, setTrucksPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // WORKING FETCH
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
  });

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/active-deliveries`, {
      headers: getAuthHeaders(),
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          navigate('/login');
          return;
        }
        return res.json();
      })
      .then(data => {
  // TRANSFORM TO FULL TRUCK DATA WITH REAL TIME PROGRESS
  const transformed = (Array.isArray(data) ? data : []).map(delivery => {
    let progress = 20;
    let distance = "Loading...";

    if (delivery.actual_departure) {
      const now = new Date();
      const departureTime = new Date(delivery.actual_departure);
      const timePassed = (now - departureTime) / (1000 * 60 * 60); // Hours
      const maxRouteHours = delivery.max_route_hours || 4;
      
      progress = Math.min(100, Math.max(0, (timePassed / maxRouteHours) * 100));
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
      progress: progress,
      distance: distance,
      actual_departure: delivery.actual_departure,
      max_delivery_time: delivery.max_delivery_time,
      max_route_hours: delivery.max_route_hours || 4
    };
  });
  setActiveDeliveries(transformed);
})
      .catch(err => console.log("ERROR:", err))
      .finally(() => setLoading(false));
  }, []);

  // STATS
  const pendingDeliveries = activeDeliveries.filter(d => d.actual_departure).length;
  const loadingDeliveries = activeDeliveries.length - pendingDeliveries;

  const stats = [
    { title: "Active Orders", value: activeDeliveries.length.toString(), change: `+${loadingDeliveries} loading`, icon: Package, trend: "up" },
    { title: "Train Trips Today", vralue: "8", change: "2 delayed", icon: Train, trend: "warning" },
    { title: "Active Drivers", value: "24", change: `${pendingDeliveries} en route`, icon: Users, trend: "neutral" },
    { title: "Delivery Routes", value: new Set(activeDeliveries.map(d => d.route_id)).size.toString(), change: "All covered", icon: Truck, trend: "up" }
  ];

  // FILTER & PAGINATION
  const filterTrucks = (items, search) => items.filter(item =>
    item.id.toString().includes(search) ||
    item.driver.toLowerCase().includes(search.toLowerCase()) ||
    item.origin.toLowerCase().includes(search.toLowerCase()) ||
    item.route_id.toString().includes(search)
  );

  const handleMarkArrived = async (deliveryId) => {
  if (!window.confirm(`Mark delivery #${deliveryId} as arrived?`)) return;

  try {
    const res = await fetch(`${API_BASE}/deliveries/${deliveryId}/finish`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errData = await res.json();
      alert(`Error: ${errData.detail || res.statusText}`);
      return;
    }

    const data = await res.json();
    console.log("Finish delivery response:", data);

    // Update local state to show arrival
    setActiveDeliveries(prev =>
      prev.map(t =>
        t.id === deliveryId ? { ...t, arrived: true, status: "Delivered", progress: 100, distance: "Arrived" } : t
      )
    );

  } catch (err) {
    console.error("Finish delivery error:", err);
    alert("Something went wrong while marking the delivery as arrived.");
  }
};


  const paginate = (items, page) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const filteredTrucks = filterTrucks(activeDeliveries.filter(t => !t.arrived), trucksSearch);
  const paginatedTrucks = paginate(filteredTrucks, trucksPage);
  const totalTruckPages = Math.ceil(filteredTrucks.length / ITEMS_PER_PAGE);

  // PAGINATION CONTROLS
  const PaginationControls = ({ page, totalPages, onChange }) => totalPages > 1 && (
    <div className="flex items-center justify-between mt-4 px-1">
      <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} className="h-7 w-7 p-0">
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="h-7 w-7 p-0">
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Truck className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen gap-0">
      {/* SIDEBAR - SAME */}
      <div className="w-72 bg-gradient-to-b from-blue-600 to-blue-800 text-white p-6 space-y-6 overflow-y-auto">
        <div><h2 className="text-2xl font-bold mb-2">Management</h2><p className="text-blue-100 text-sm">Configure system entities</p></div>
        <div className="space-y-3"><h3 className="text-xs font-semibold uppercase text-blue-200 px-1">Locations</h3><Button className="w-full justify-start gap-3 bg-white/20 hover:bg-white/30 text-white border border-white/30" onClick={() => navigate('/manage/cities')}><MapPin className="h-4 w-4" /> Manage Cities</Button></div>
        <div className="space-y-3"><h3 className="text-xs font-semibold uppercase text-blue-200 px-1">Stores</h3><Button className="w-full justify-start gap-3 bg-white/20 hover:bg-white/30 text-white border border-white/30" onClick={() => navigate('/manage/stores')}><Building2 className="h-4 w-4" /> Manage Stores</Button></div>
        <div className="space-y-3"><h3 className="text-xs font-semibold uppercase text-blue-200 px-1">Inventory</h3><Button className="w-full justify-start gap-3 bg-white/20 hover:bg-white/30 text-white border border-white/30" onClick={() => navigate('/manage/products')}><ProductIcon className="h-4 w-4" /> Manage Products</Button></div>
        <div className="space-y-3"><h3 className="text-xs font-semibold uppercase text-blue-200 px-1">Fleet</h3><Button className="w-full justify-start gap-3 bg-white/20 hover:bg-white/30 text-white border border-white/30" onClick={() => navigate('/manage/trucks')}><Truck className="h-4 w-4" /> Manage Trucks</Button></div>
        <div className="space-y-3"><h3 className="text-xs font-semibold uppercase text-blue-200 px-1">Customers</h3><Button className="w-full justify-start gap-3 bg-white/20 hover:bg-white/30 text-white border border-white/30" onClick={() => navigate('/manage/customers')}><Users className="h-4 w-4" /> Manage Customers</Button></div>
        
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div><h1 className="text-3xl font-bold text-foreground mb-2">Store Arrivals Dashboard</h1><p className="text-muted-foreground">Trucks expecting arrival with live progress</p></div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'warning' ? 'text-orange-600' : 'text-muted-foreground'}`}>{stat.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* TRUCKS EXPECTED - WITH PROGRESS BARS! 🚚 */}
        <Card className="max-w-md">
  <CardHeader>
    <CardTitle className="flex items-center gap-1 text-orange-600"><Truck className="h-4 w-4" /> Truck Deliveries</CardTitle>
    <CardDescription>Trucks en route</CardDescription>
    <Input 
      placeholder="Search trucks..." 
      value={trucksSearch} 
      onChange={(e) => {setTrucksSearch(e.target.value); setTrucksPage(1);}} 
      className="mt-1" 
    />
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      {paginatedTrucks.map((truck) => (
        <div key={truck.id} className="flex flex-col p-2 border rounded-md bg-orange-50 gap-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">#{truck.id}</p>
            <Badge variant={truck.status === "En Route" ? "secondary" : truck.status === "Loading" ? "outline" : "default"} className="text-xs">
              {truck.status}
            </Badge>
          </div>
          
          {/* PROGRESS BAR */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{truck.progress}%</span>
            </div>
            <Progress value={truck.progress} className="h-1.5" />
            <p className="text-xs">{truck.distance}</p>
          </div>

          <div className="space-y-0.5 text-xs text-muted-foreground">
            <p className="truncate"><strong>Route:</strong> {truck.route_id}</p>
            <p className="truncate">{truck.driver}</p>
            <div className="flex items-center gap-1 truncate">
              <MapPin className="h-2.5 w-2.5" /> {truck.origin}
            </div>
            
            {truck.actual_departure && <p className="truncate">Departed: {truck.actual_departure}</p>}
          </div>
          
          <Button
  size="sm"
  className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1"
  disabled={truck.arrived}
  onClick={() => handleMarkArrived(truck.id)}
>
  <Check className="h-3 w-3 mr-1" /> {truck.arrived ? "Arrived" : "Mark Arrived"}
</Button>

        </div>
      ))}
      {filteredTrucks.length === 0 && <p className="text-center text-muted-foreground py-6">No trucks found</p>}
    </div>
    <PaginationControls page={trucksPage} totalPages={totalTruckPages} onChange={setTrucksPage} />
  </CardContent>
</Card>

        {/* ALERTS */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-orange-800"><AlertTriangle className="h-5 w-5" /> Delivery Alerts</CardTitle></CardHeader>
          <CardContent className="text-orange-800 space-y-2">
            <p className="text-sm">• {pendingDeliveries} trucks currently en route</p>
            <p className="text-sm">• {loadingDeliveries} deliveries in loading stage</p>
            {activeDeliveries.length > 0 && <p className="text-sm">• Next delivery: #{activeDeliveries[0].id} (Route {activeDeliveries[0].route_id})</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;