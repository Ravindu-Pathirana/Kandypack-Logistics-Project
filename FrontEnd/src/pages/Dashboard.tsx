import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Train, 
  Truck, 
  Users, 
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Active Orders",
      value: "142",
      change: "+12%",
      icon: Package,
      trend: "up"
    },
    {
      title: "Train Trips Today",
      value: "8",
      change: "2 delayed",
      icon: Train,
      trend: "warning"
    },
    {
      title: "Active Drivers",
      value: "24",
      change: "6 available",
      icon: Users,
      trend: "neutral"
    },
    {
      title: "Delivery Routes",
      value: "15",
      change: "All covered",
      icon: Truck,
      trend: "up"
    }
  ];

  const recentOrders = [
    { id: "ORD-001", customer: "Super Market Colombo", destination: "Colombo", status: "In Transit", value: "Rs. 45,000" },
    { id: "ORD-002", customer: "Retail Store Galle", destination: "Galle", status: "Scheduled", value: "Rs. 32,000" },
    { id: "ORD-003", customer: "Wholesale Matara", destination: "Matara", status: "Delivered", value: "Rs. 67,500" },
    { id: "ORD-004", customer: "Distributor Jaffna", destination: "Jaffna", status: "Loading", value: "Rs. 89,200" }
  ];

  const trainSchedule = [
    { route: "Kandy → Colombo", departure: "08:30", capacity: "85%", status: "On Time" },
    { route: "Kandy → Galle", departure: "10:15", capacity: "92%", status: "Delayed" },
    { route: "Kandy → Matara", departure: "14:00", capacity: "67%", status: "On Time" },
    { route: "Kandy → Jaffna", departure: "16:45", capacity: "78%", status: "On Time" }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of Kandypack logistics operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'warning' ? 'text-orange-600' : 
                  'text-muted-foreground'
                }`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest customer orders and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {order.destination}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={
                      order.status === 'Delivered' ? 'default' :
                      order.status === 'In Transit' ? 'secondary' :
                      order.status === 'Loading' ? 'destructive' : 'outline'
                    }>
                      {order.status}
                    </Badge>
                    <p className="text-sm font-medium">{order.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Train Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Train className="h-5 w-5" />
              Today's Train Schedule
            </CardTitle>
            <CardDescription>Railway transport schedule and capacity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trainSchedule.map((train, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{train.route}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Departure: {train.departure}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={train.status === 'On Time' ? 'default' : 'destructive'}>
                      {train.status}
                    </Badge>
                    <p className="text-sm">Capacity: {train.capacity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-orange-800">
            <p className="text-sm">• Train to Galle delayed by 30 minutes due to signal issues</p>
            <p className="text-sm">• Driver shortage expected next week - 3 drivers on leave</p>
            <p className="text-sm">• Route R-08 (Negombo area) experiencing high traffic delays</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;