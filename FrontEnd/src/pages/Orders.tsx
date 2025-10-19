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
  Truck,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Add the getStatusVariant function here
const getStatusVariant = (status: string) => {
  if (!status) return 'outline';
  
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'default';
    case 'in transit':
    case 'intransit':
      return 'secondary';
    case 'scheduled':
      return 'outline';
    case 'pending':
      return 'destructive';
    case 'completed':
      return 'default';
    case 'processing':
      return 'secondary';
    default:
      return 'outline';
  }
};

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New order form state
  const [newOrder, setNewOrder] = useState({
    customer_id: "",
    order_date: new Date().toISOString().split('T')[0],
    required_date: "",
    status: "Pending",
    total_quantity: 0,
    total_price: 0.00
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:8000/orders/");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch("http://localhost:8000/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const createdOrder = await response.json();
      
      // Refresh orders list
      await fetchOrders();
      
      // Close modal and reset form
      setIsNewOrderOpen(false);
      setNewOrder({
        customer_id: "",
        order_date: new Date().toISOString().split('T')[0],
        required_date: "",
        status: "Pending",
        total_quantity: 0,
        total_price: 0.00
      });
      
      // Show success message (you can use a toast notification here)
      alert("Order created successfully!");
      
    } catch (err) {
      setError(err.message);
      alert("Error creating order: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setNewOrder(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate minimum required date (7 days from order date)
  const getMinRequiredDate = () => {
    const orderDate = new Date(newOrder.order_date);
    orderDate.setDate(orderDate.getDate() + 7);
    return orderDate.toISOString().split('T')[0];
  };

  // Improved search function with better field coverage
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    return (
      (order.id && order.id.toLowerCase().includes(searchLower)) ||
      (order.customer && order.customer.toLowerCase().includes(searchLower)) ||
      (order.destination && order.destination.toLowerCase().includes(searchLower)) ||
      (order.route && order.route.toLowerCase().includes(searchLower)) ||
      (order.status && order.status.toLowerCase().includes(searchLower)) ||
      (order.trainTrip && order.trainTrip.toLowerCase().includes(searchLower)) ||
      (order.driver && order.driver.toLowerCase().includes(searchLower)) ||
      (order.totalValue && order.totalValue.toLowerCase().includes(searchLower))
    );
  });

  // Clear search function
  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-muted-foreground">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-destructive">Error: {error}</div>
        <Button onClick={() => window.location.reload()} className="ml-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
          <p className="text-muted-foreground">Manage customer orders and deliveries</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsNewOrderOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders by ID, customer, destination, route, status, train trip, driver, or value..."
            className="pl-10 pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {filteredOrders.length} of {orders.length} orders
            {searchTerm && (
              <> matching "<span className="font-medium">{searchTerm}</span>"</>
            )}
          </div>
          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={clearSearch}>
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Order Cards */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? "No orders found" : "No orders available"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? "No orders match your search criteria. Try different keywords."
              : "There are no orders in the system yet."
            }
          </p>
          {searchTerm ? (
            <Button variant="outline" onClick={clearSearch}>
              Clear search
            </Button>
          ) : (
            <Button onClick={() => setIsNewOrderOpen(true)}>
              Create Your First Order
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">{order.id}</CardTitle>
                    <Badge variant={getStatusVariant(order.status)} className="text-xs">
                      {order.status}
                    </Badge>
                  </div>
                  <CardDescription>{order.customer}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Destination */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{order.destination}</span>
                  </div>

                  {/* Items and Value */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Items</p>
                      <p className="font-medium">{order.items}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Value</p>
                      <p className="font-medium">{order.totalValue}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Weight</p>
                      <p className="font-medium">{order.weight}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Order Date</p>
                      <p className="font-medium">{order.orderDate}</p>
                    </div>
                  </div>

                  {/* Route and Train */}
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">Route: {order.route}</p>
                    <p className="text-muted-foreground">Train Trip: {order.trainTrip}</p>
                    <p className="text-muted-foreground">Driver: {order.driver}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1">
                      Update Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              {searchTerm && (
                <CardDescription>
                  Filtered results: {filteredOrders.length} orders
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{filteredOrders.length}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredOrders.filter(o => o.status === 'Delivered').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredOrders.filter(o => o.status === 'In Transit').length}
                  </p>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {filteredOrders.filter(o => o.status === 'Scheduled').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredOrders.filter(o => o.status === 'Pending').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* New Order Dialog */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Order
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_id">Customer ID</Label>
                <Input
                  id="customer_id"
                  type="number"
                  placeholder="Enter customer ID"
                  value={newOrder.customer_id}
                  onChange={(e) => handleInputChange('customer_id', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newOrder.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Transit">In Transit</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order_date">Order Date</Label>
                <Input
                  id="order_date"
                  type="date"
                  value={newOrder.order_date}
                  onChange={(e) => handleInputChange('order_date', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="required_date">Required Date</Label>
                <Input
                  id="required_date"
                  type="date"
                  min={getMinRequiredDate()}
                  value={newOrder.required_date}
                  onChange={(e) => handleInputChange('required_date', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 7 days after order date
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_quantity">Total Quantity</Label>
                <Input
                  id="total_quantity"
                  type="number"
                  min="0"
                  placeholder="Enter quantity"
                  value={newOrder.total_quantity}
                  onChange={(e) => handleInputChange('total_quantity', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="total_price">Total Price ($)</Label>
                <Input
                  id="total_price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newOrder.total_price}
                  onChange={(e) => handleInputChange('total_price', parseFloat(e.target.value) || 0.00)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsNewOrderOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;