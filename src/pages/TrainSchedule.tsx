import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Train, 
  Clock, 
  MapPin, 
  Package,
  Plus,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const TrainSchedule = () => {
  const trainRoutes = [
    {
      id: "TR-001",
      route: "Kandy → Colombo",
      departure: "08:30",
      arrival: "11:15",
      capacity: 200,
      utilized: 170,
      status: "On Time",
      orders: 12,
      nextDeparture: "2024-08-08"
    },
    {
      id: "TR-002",
      route: "Kandy → Negombo",
      departure: "09:45",
      arrival: "12:30",
      capacity: 150,
      utilized: 120,
      status: "On Time",
      orders: 8,
      nextDeparture: "2024-08-08"
    },
    {
      id: "TR-003",
      route: "Kandy → Galle",
      departure: "10:15",
      arrival: "14:45",
      capacity: 180,
      utilized: 166,
      status: "Delayed",
      orders: 15,
      nextDeparture: "2024-08-08"
    },
    {
      id: "TR-005",
      route: "Kandy → Matara",
      departure: "14:00",
      arrival: "18:30",
      capacity: 160,
      utilized: 107,
      status: "On Time",
      orders: 9,
      nextDeparture: "2024-08-08"
    },
    {
      id: "TR-007",
      route: "Kandy → Jaffna",
      departure: "16:45",
      arrival: "22:15",
      capacity: 140,
      utilized: 109,
      status: "On Time",
      orders: 11,
      nextDeparture: "2024-08-08"
    },
    {
      id: "TR-009",
      route: "Kandy → Trincomalee",
      departure: "18:30",
      arrival: "23:00",
      capacity: 120,
      utilized: 85,
      status: "Scheduled",
      orders: 7,
      nextDeparture: "2024-08-08"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time': return 'default';
      case 'Delayed': return 'destructive';
      case 'Scheduled': return 'secondary';
      case 'Cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'On Time': return <CheckCircle className="h-4 w-4" />;
      case 'Delayed': return <AlertTriangle className="h-4 w-4" />;
      case 'Scheduled': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const totalCapacity = trainRoutes.reduce((sum, train) => sum + train.capacity, 0);
  const totalUtilized = trainRoutes.reduce((sum, train) => sum + train.utilized, 0);
  const overallUtilization = (totalUtilized / totalCapacity) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Train Schedule</h1>
          <p className="text-muted-foreground">Railway transport schedule and capacity management</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Train Trip
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trains</CardTitle>
            <Train className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainRoutes.length}</div>
            <p className="text-xs text-muted-foreground">Active routes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Capacity</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{totalUtilized}/{totalCapacity} units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Time</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {trainRoutes.filter(t => t.status === 'On Time').length}
            </div>
            <p className="text-xs text-muted-foreground">Trains on schedule</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {trainRoutes.filter(t => t.status === 'Delayed').length}
            </div>
            <p className="text-xs text-muted-foreground">Trains delayed</p>
          </CardContent>
        </Card>
      </div>

      {/* Train Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trainRoutes.map((train) => {
          const utilizationPercentage = (train.utilized / train.capacity) * 100;
          
          return (
            <Card key={train.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Train className="h-5 w-5" />
                      {train.id}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {train.route}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(train.status)} className="flex items-center gap-1">
                    {getStatusIcon(train.status)}
                    {train.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Schedule Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Departure</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {train.departure}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Arrival</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {train.arrival}
                    </p>
                  </div>
                </div>

                {/* Capacity Information */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Capacity Utilization</span>
                    <span className="font-medium">
                      {train.utilized}/{train.capacity} units ({utilizationPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={utilizationPercentage} className="h-2" />
                  <div className={`text-xs ${
                    utilizationPercentage > 90 ? 'text-red-600' : 
                    utilizationPercentage > 70 ? 'text-orange-600' : 
                    'text-green-600'
                  }`}>
                    {utilizationPercentage > 90 ? 'Near capacity' : 
                     utilizationPercentage > 70 ? 'Good utilization' : 
                     'Available space'}
                  </div>
                </div>

                {/* Order Information */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{train.orders} orders scheduled</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Next: {train.nextDeparture}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Manage Cargo
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule Overview</CardTitle>
          <CardDescription>Upcoming train departures for the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium">
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-xs text-center p-2 bg-muted rounded">
                    {6 + Math.floor(Math.random() * 3)} trips
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainSchedule;