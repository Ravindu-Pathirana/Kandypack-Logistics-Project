import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Calendar,
  User,
  Truck
} from "lucide-react";
import { useState } from "react";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const orders = [
    {
      id: "ORD-001",
      customer: "Super Market Colombo",
      customerType: "Retail",
      destination: "Colombo",
      route: "R-01",
      orderDate: "2024-08-01",
      deliveryDate: "2024-08-08",
      items: 3,
      totalValue: "Rs. 45,000",
      weight: "150 kg",
      status: "In Transit",
      trainTrip: "TR-001",
      driver: "Kamal Perera"
    },
    {
      id: "ORD-002",
      customer: "Retail Store Galle",
      customerType: "Retail",
      destination: "Galle",
      route: "R-03",
      orderDate: "2024-08-02",
      deliveryDate: "2024-08-09",
      items: 2,
      totalValue: "Rs. 32,000",
      weight: "95 kg",
      status: "Scheduled",
      trainTrip: "TR-003",
      driver: "Pending"
    },
    {
      id: "ORD-003",
      customer: "Wholesale Matara",
      customerType: "Wholesale",
      destination: "Matara",
      route: "R-05",
      orderDate: "2024-07-28",
      deliveryDate: "2024-08-05",
      items: 5,
      totalValue: "Rs. 67,500",
      weight: "230 kg",
      status: "Delivered",
      trainTrip: "TR-005",
      driver: "Sunil Fernando"
    },
    {
      id: "ORD-004",
      customer: "Distributor Jaffna",
      customerType: "Wholesale",
      destination: "Jaffna",
      route: "R-07",
      orderDate: "2024-08-03",
      deliveryDate: "2024-08-10",
      items: 4,
      totalValue: "Rs. 89,200",
      weight: "180 kg",
      status: "Loading",
      trainTrip: "TR-007",
      driver: "Ravi Silva"
    },
    {
      id: "ORD-005",
      customer: "City Mart Negombo",
      customerType: "Retail",
      destination: "Negombo",
      route: "R-02",
      orderDate: "2024-08-04",
      deliveryDate: "2024-08-11",
      items: 2,
      totalValue: "Rs. 28,500",
      weight: "80 kg",
      status: "Pending",
      trainTrip: "TR-002",
      driver: "Pending"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'In Transit': return 'secondary';
      case 'Loading': return 'destructive';
      case 'Scheduled': return 'outline';
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
          <p className="text-muted-foreground">Manage customer orders and deliveries</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders by ID, customer, or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.id}</CardTitle>
                  <CardDescription>{order.customer}</CardDescription>
                </div>
                <Badge variant={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{order.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{order.items} items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{order.deliveryDate}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-muted-foreground">Value</p>
                    <p className="font-medium">{order.totalValue}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weight</p>
                    <p>{order.weight}</p>
                  </div>
                </div>
              </div>

              {/* Transport Details */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route:</span>
                  <span>{order.route}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Train Trip:</span>
                  <span>{order.trainTrip}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Driver:</span>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{order.driver}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                {order.status !== 'Delivered' && (
                  <Button size="sm" className="flex-1">
                    Update Status
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">142</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">89</p>
              <p className="text-sm text-muted-foreground">Delivered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">28</p>
              <p className="text-sm text-muted-foreground">In Transit</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">18</p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">7</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;