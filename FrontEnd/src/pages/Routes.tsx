import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Route, 
  MapPin, 
  Clock, 
  Truck,
  Plus,
  Users,
  Package
} from "lucide-react";

const Routes = () => {
  const routes = [
    {
      id: "R-01",
      name: "Colombo Central",
      area: "Colombo District",
      maxDeliveryTime: "4 hours",
      coverage: "Fort, Pettah, Kollupitiya, Bambalapitiya",
      activeOrders: 15,
      assignedTrucks: 3,
      assignedDrivers: 6,
      status: "Active",
      lastDelivery: "2024-08-07 14:30"
    },
    {
      id: "R-02", 
      name: "Negombo Coast",
      area: "Gampaha District",
      maxDeliveryTime: "3 hours",
      coverage: "Negombo, Katunayake, Seeduwa, Ja-Ela",
      activeOrders: 8,
      assignedTrucks: 2,
      assignedDrivers: 4,
      status: "Active",
      lastDelivery: "2024-08-07 16:15"
    },
    {
      id: "R-03",
      name: "Galle Southern",
      area: "Southern Province",
      maxDeliveryTime: "5 hours",
      coverage: "Galle, Unawatuna, Hikkaduwa, Ambalangoda",
      activeOrders: 12,
      assignedTrucks: 2,
      assignedDrivers: 4,
      status: "Active",
      lastDelivery: "2024-08-07 11:45"
    },
    {
      id: "R-04",
      name: "Kandy Hills",
      area: "Central Province",
      maxDeliveryTime: "2 hours",
      coverage: "Kandy City, Peradeniya, Gampola, Nawalapitiya",
      activeOrders: 6,
      assignedTrucks: 1,
      assignedDrivers: 2,
      status: "Active",
      lastDelivery: "2024-08-07 15:20"
    },
    {
      id: "R-05",
      name: "Matara Deep South",
      area: "Southern Province",
      maxDeliveryTime: "6 hours",
      coverage: "Matara, Weligama, Mirissa, Tangalle",
      activeOrders: 9,
      assignedTrucks: 2,
      assignedDrivers: 4,
      status: "Active",
      lastDelivery: "2024-08-07 13:10"
    },
    {
      id: "R-06",
      name: "Kurunegala Central",
      area: "North Western Province",
      maxDeliveryTime: "4 hours",
      coverage: "Kurunegala, Puttalam, Chilaw, Wariyapola",
      activeOrders: 4,
      assignedTrucks: 1,
      assignedDrivers: 2,
      status: "Maintenance",
      lastDelivery: "2024-08-06 17:45"
    },
    {
      id: "R-07",
      name: "Jaffna Northern",
      area: "Northern Province",
      maxDeliveryTime: "8 hours",
      coverage: "Jaffna, Kilinochchi, Vavuniya, Mannar",
      activeOrders: 11,
      assignedTrucks: 2,
      assignedDrivers: 4,
      status: "Active",
      lastDelivery: "2024-08-07 12:30"
    },
    {
      id: "R-08",
      name: "Trincomalee East",
      area: "Eastern Province",
      maxDeliveryTime: "7 hours",
      coverage: "Trincomalee, Batticaloa, Ampara, Kalmunai",
      activeOrders: 7,
      assignedTrucks: 2,
      assignedDrivers: 4,
      status: "Active",
      lastDelivery: "2024-08-07 10:15"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Maintenance': return 'destructive';
      case 'Suspended': return 'outline';
      default: return 'secondary';
    }
  };

  const totalActiveOrders = routes.reduce((sum, route) => sum + route.activeOrders, 0);
  const totalTrucks = routes.reduce((sum, route) => sum + route.assignedTrucks, 0);
  const totalDrivers = routes.reduce((sum, route) => sum + route.assignedDrivers, 0);
  const activeRoutes = routes.filter(route => route.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Delivery Routes</h1>
          <p className="text-muted-foreground">Manage delivery routes and last-mile distribution</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Route
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRoutes}</div>
            <p className="text-xs text-muted-foreground">out of {routes.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveOrders}</div>
            <p className="text-xs text-muted-foreground">Pending deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed Trucks</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrucks}</div>
            <p className="text-xs text-muted-foreground">Fleet vehicles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
          <Card key={route.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    {route.id}
                  </CardTitle>
                  <CardDescription>{route.name}</CardDescription>
                </div>
                <Badge variant={getStatusColor(route.status)}>
                  {route.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Route Information */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{route.area}</p>
                    <p className="text-xs text-muted-foreground">{route.coverage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Max delivery: {route.maxDeliveryTime}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="space-y-1">
                  <p className="text-lg font-bold text-primary">{route.activeOrders}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-blue-600">{route.assignedTrucks}</p>
                  <p className="text-xs text-muted-foreground">Trucks</p>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-green-600">{route.assignedDrivers}</p>
                  <p className="text-xs text-muted-foreground">Drivers</p>
                </div>
              </div>

              {/* Last Activity */}
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground">Last delivery:</p>
                <p className="text-sm font-medium">{route.lastDelivery}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Map
                </Button>
                <Button size="sm" className="flex-1">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Route Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Route Performance Overview</CardTitle>
          <CardDescription>Key metrics for all delivery routes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routes.slice(0, 5).map((route) => (
              <div key={route.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Route className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{route.id} - {route.name}</p>
                    <p className="text-sm text-muted-foreground">{route.area}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{route.activeOrders} orders</p>
                  <p className="text-sm text-muted-foreground">{route.maxDeliveryTime} max</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Routes;