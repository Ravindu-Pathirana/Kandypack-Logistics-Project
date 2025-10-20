import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Route, MapPin, Clock, Truck, Plus, Users, Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast"; // ✅ import Shadcn toast hook
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";



const Routes = () => {
  const [routes, setRoutes] = useState([]);
  const [open, setOpen] = useState(false);
  const { toast } = useToast(); // ✅ toast hook
  const [newRoute, setNewRoute] = useState({
    route_id: "",
    route_name: "",
    area: "",
    coverage: "",
    max_delivery_time: "",
    active_orders: "",
    assigned_trucks: "",
    assigned_drivers: "",
    status: "Active",
    last_delivery: "",
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await axios.get("http://localhost:8000/routes");
      setRoutes(res.data);
    } catch (err) {
      console.error("Error fetching routes:", err);
      toast({
        title: "Error",
        description: "Failed to load routes from backend.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoute({ ...newRoute, [name]: value });
  };

  const handleAddRoute = async () => {
    try {
      const payload = {
        ...newRoute,
        max_delivery_time: parseInt(newRoute.max_delivery_time),
        active_orders: parseInt(newRoute.active_orders || 0),
        assigned_trucks: parseInt(newRoute.assigned_trucks || 0),
        assigned_drivers: parseInt(newRoute.assigned_drivers || 0),
      };

      await axios.post("http://localhost:8000/routes", payload);
      await fetchRoutes();
      setOpen(false);
      toast({
        title: "✅ Route added successfully!",
        description: `${newRoute.route_name} has been saved to the system.`,
      });
      setNewRoute({
        route_id: "",
        route_name: "",
        area: "",
        coverage: "",
        max_delivery_time: "",
        active_orders: "",
        assigned_trucks: "",
        assigned_drivers: "",
        status: "Active",
        last_delivery: "",
      });
    } catch (err) {
      console.error("Error adding route:", err);
      toast({
        title: "❌ Failed to add route",
        description: "Check your input or backend connection.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "default";
      case "Maintenance": return "destructive";
      case "Suspended": return "outline";
      default: return "secondary";
    }
  };

  const activeRoutes = routes.filter(r => r.status === "Active").length;
  const totalActiveOrders = routes.reduce((sum, r) => sum + (r.active_orders || 0), 0);
  const totalTrucks = routes.reduce((sum, r) => sum + (r.assigned_trucks || 0), 0);
  const totalDrivers = routes.reduce((sum, r) => sum + (r.assigned_drivers || 0), 0);

const [manageOpen, setManageOpen] = useState(false);
const [selectedRoute, setSelectedRoute] = useState(null);

const [mapOpen, setMapOpen] = useState(false);
const [mapRoute, setMapRoute] = useState(null);
const [markers, setMarkers] = useState([]);
const [selectedMarker, setSelectedMarker] = useState(null);



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Delivery Routes</h1>
          <p className="text-muted-foreground">Manage delivery routes and last-mile distribution</p>
        </div>

        {/* Add Route Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add a New Route</DialogTitle>
            </DialogHeader>

            <div className="grid gap-3 mt-4">
              <div>
                <Label htmlFor="route_id">Route ID</Label>
                <Input id="route_id" name="route_id" value={newRoute.route_id} onChange={handleInputChange} />
              </div>

              <div>
                <Label htmlFor="route_name">Route Name</Label>
                <Input id="route_name" name="route_name" value={newRoute.route_name} onChange={handleInputChange} />
              </div>

              <div>
                <Label htmlFor="area">Area</Label>
                <Input id="area" name="area" value={newRoute.area} onChange={handleInputChange} />
              </div>

              <div>
                <Label htmlFor="coverage">Coverage</Label>
                <Input id="coverage" name="coverage" value={newRoute.coverage} onChange={handleInputChange} />
              </div>

              <div>
                <Label htmlFor="max_delivery_time">Max Delivery Time (hours)</Label>
                <Input
                  id="max_delivery_time"
                  name="max_delivery_time"
                  type="number"
                  value={newRoute.max_delivery_time}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="active_orders">Orders</Label>
                  <Input id="active_orders" name="active_orders" type="number" value={newRoute.active_orders} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="assigned_trucks">Trucks</Label>
                  <Input id="assigned_trucks" name="assigned_trucks" type="number" value={newRoute.assigned_trucks} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="assigned_drivers">Drivers</Label>
                  <Input id="assigned_drivers" name="assigned_drivers" type="number" value={newRoute.assigned_drivers} onChange={handleInputChange} />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="w-full border rounded-md p-2"
                  value={newRoute.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <Label htmlFor="last_delivery">Last Delivery (YYYY-MM-DD HH:mm)</Label>
                <Input
                  id="last_delivery"
                  name="last_delivery"
                  type="text"
                  placeholder="2024-08-07 14:30"
                  value={newRoute.last_delivery}
                  onChange={handleInputChange}
                />
              </div>

              <Button className="mt-4 w-full" onClick={handleAddRoute}>
                Save Route
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRoutes}</div>
            <p className="text-xs text-muted-foreground">Out of {routes.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveOrders}</div>
            <p className="text-xs text-muted-foreground">Pending deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deployed Trucks</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrucks}</div>
            <p className="text-xs text-muted-foreground">Fleet vehicles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDrivers}</div>
            <p className="text-xs text-muted-foreground">On duty today</p>
          </CardContent>
        </Card>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {routes.map((route) => (
          <Card key={route.route_id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    {route.route_id} — {route.route_name}
                  </CardTitle>
                  <CardDescription>{route.area}</CardDescription>
                </div>
                <Badge variant={getStatusColor(route.status)}>
                  {route.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Coverage</p>
                  <p className="text-xs text-muted-foreground">{route.coverage || "No coverage data"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Max delivery: {route.max_delivery_time} hours</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-primary">{route.active_orders}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600">{route.assigned_trucks}</p>
                  <p className="text-xs text-muted-foreground">Trucks</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{route.assigned_drivers}</p>
                  <p className="text-xs text-muted-foreground">Drivers</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground">Last delivery:</p>
                <p className="text-sm font-medium">{route.last_delivery || "No data"}</p>
              </div>

              <div className="flex gap-2">
              <Button
  variant="outline"
  size="sm"
  className="flex-1"
  onClick={() => {
    setMapRoute(route);
    setMapOpen(true);
  }}
>
  View Map
</Button>

                <Button
    size="sm"
    className="flex-1"
    onClick={() => {
      setSelectedRoute(route);
      setManageOpen(true);
    }}
  >
    Manage
  </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Manage Route</DialogTitle>
    </DialogHeader>

    {selectedRoute && (
      <div className="grid gap-3 mt-4">
        <div>
          <Label>Route ID</Label>
          <Input value={selectedRoute.route_id} disabled />
        </div>

        <div>
          <Label>Route Name</Label>
          <Input
            value={selectedRoute.route_name}
            onChange={(e) =>
              setSelectedRoute({ ...selectedRoute, route_name: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Area</Label>
          <Input
            value={selectedRoute.area}
            onChange={(e) =>
              setSelectedRoute({ ...selectedRoute, area: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Coverage</Label>
          <Input
            value={selectedRoute.coverage}
            onChange={(e) =>
              setSelectedRoute({ ...selectedRoute, coverage: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Orders</Label>
            <Input
              type="number"
              value={selectedRoute.active_orders}
              onChange={(e) =>
                setSelectedRoute({ ...selectedRoute, active_orders: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Trucks</Label>
            <Input
              type="number"
              value={selectedRoute.assigned_trucks}
              onChange={(e) =>
                setSelectedRoute({ ...selectedRoute, assigned_trucks: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Drivers</Label>
            <Input
              type="number"
              value={selectedRoute.assigned_drivers}
              onChange={(e) =>
                setSelectedRoute({ ...selectedRoute, assigned_drivers: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <Label>Status</Label>
          <select
            className="w-full border rounded-md p-2"
            value={selectedRoute.status}
            onChange={(e) =>
              setSelectedRoute({ ...selectedRoute, status: e.target.value })
            }
          >
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <div>
          <Label>Last Delivery</Label>
          <Input
            value={selectedRoute.last_delivery || ""}
            onChange={(e) =>
              setSelectedRoute({ ...selectedRoute, last_delivery: e.target.value })
            }
          />
        </div>

        <div className="flex justify-between mt-4">
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                await axios.delete(`http://localhost:8000/routes/${selectedRoute.route_id}`);
                toast({
                  title: "🗑️ Route deleted",
                  description: `${selectedRoute.route_name} removed successfully.`,
                });
                setManageOpen(false);
                fetchRoutes();
              } catch (err) {
                toast({
                  title: "Error deleting route",
                  description: "Could not delete route from backend.",
                  variant: "destructive",
                });
              }
            }}
          >
            Delete
          </Button>

          <Button
            onClick={async () => {
              try {
                await axios.put(
                  `http://localhost:8000/routes/${selectedRoute.route_id}`,
                  selectedRoute
                );
                toast({
                  title: "✅ Route updated",
                  description: `${selectedRoute.route_name} saved successfully.`,
                });
                setManageOpen(false);
                fetchRoutes();
              } catch (err) {
                toast({
                  title: "Error updating route",
                  description: "Could not save changes.",
                  variant: "destructive",
                });
              }
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
{/* 🗺️ View Map Modal */}
<Dialog open={mapOpen} onOpenChange={setMapOpen}>
  <DialogContent className="max-w-3xl">
    <DialogHeader>
      <DialogTitle>Route Map — {mapRoute?.route_name}</DialogTitle>
      <p className="text-sm text-muted-foreground">
        Showing coverage for: {mapRoute?.coverage}
      </p>
    </DialogHeader>

    {mapRoute && (
      <div className="mt-4 h-[450px] rounded-lg overflow-hidden">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            zoom={8}
            center={{ lat: 7.8731, lng: 80.7718 }} // Default Sri Lanka
            onLoad={async (map) => {
              try {
                const coverageAreas = mapRoute.coverage
                  ? mapRoute.coverage.split(",").map((loc) => loc.trim())
                  : [];

                if (coverageAreas.length === 0) return;

                const newMarkers = [];
                const bounds = new google.maps.LatLngBounds();

                for (const area of coverageAreas) {
                  const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                      area
                    )}&region=lk&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
                  );
                  const data = await response.json();

                  if (data.results && data.results[0]) {
                    const { lat, lng } = data.results[0].geometry.location;
                    bounds.extend({ lat, lng });
                    newMarkers.push({
                      position: { lat, lng },
                      label: area,
                    });
                  }
                }

                setMarkers(newMarkers);

                // 🧠 Delay the fitBounds until the map tiles are ready
                google.maps.event.addListenerOnce(map, "tilesloaded", () => {
                  map.fitBounds(bounds);
                });
              } catch (err) {
                console.error("Error loading map markers:", err);
              }
            }}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                position={marker.position}
                title={marker.label}
                onClick={() => setSelectedMarker(marker)}
              />
            ))}

            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div>
                  <h4 className="font-semibold">{selectedMarker.label}</h4>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    )}
  </DialogContent>
</Dialog>


    </div>
  );


  
};

export default Routes;
