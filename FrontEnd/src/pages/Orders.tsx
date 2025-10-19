import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Package, Truck, CalendarDays, AlertTriangle, CheckCircle } from "lucide-react";

interface Order {
  id: string;
  customer: string;
  customerType: string;
  destination: string;
  route: string;
  orderDate: string;
  deliveryDate: string;
  items: number;
  totalValue: string;
  weight: string;
  status: string;
  trainTrip: string;
  driver: string;
}

interface OrderDetail {
  id: string;
  customer: string;
  customerType: string;
  destination: string;
  route: string;
  orderDate: string;
  deliveryDate: string;
  status: string;
  trainTrip: string;
  driver: string;
  items: {
    product_name: string;
    quantity: number;
    unitPrice: string;
    weight: string;
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer_id: "",
    destination: "",
    route_code: "",
    order_date: "",
    delivery_date: "",
    status: "Pending",
  });

  // Fetch orders
  useEffect(() => {
    fetch("http://127.0.0.1:8000/orders/")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error fetching orders:", err));
  }, []);

  // Fetch order details
  const fetchOrderDetails = async (id: string) => {
    const numericId = parseInt(id.replace("ORD-", ""));
    const res = await fetch(`http://127.0.0.1:8000/orders/${numericId}`);
    const data = await res.json();
    setSelectedOrder(data);
  };

  // Handle create new order
  const handleCreateOrder = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (res.ok) {
        setOpenDialog(false);
        setNewOrder({
          customer_id: "",
          destination: "",
          route_code: "",
          order_date: "",
          delivery_date: "",
          status: "Pending",
        });
        // Refresh orders
        const updated = await fetch("http://127.0.0.1:8000/orders/");
        setOrders(await updated.json());
      }
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Orders</h1>
          <p className="text-muted-foreground">Manage and track all logistics orders</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>Enter the order details below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Customer ID</Label>
                <Input
                  placeholder="Enter customer ID"
                  value={newOrder.customer_id}
                  onChange={(e) => setNewOrder({ ...newOrder, customer_id: e.target.value })}
                />
              </div>
              <div>
                <Label>Destination</Label>
                <Input
                  placeholder="Enter destination"
                  value={newOrder.destination}
                  onChange={(e) => setNewOrder({ ...newOrder, destination: e.target.value })}
                />
              </div>
              <div>
                <Label>Route Code</Label>
                <Input
                  placeholder="R-01"
                  value={newOrder.route_code}
                  onChange={(e) => setNewOrder({ ...newOrder, route_code: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Order Date</Label>
                  <Input
                    type="date"
                    value={newOrder.order_date}
                    onChange={(e) => setNewOrder({ ...newOrder, order_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Delivery Date</Label>
                  <Input
                    type="date"
                    value={newOrder.delivery_date}
                    onChange={(e) => setNewOrder({ ...newOrder, delivery_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateOrder}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Card
            key={order.id}
            onClick={() => fetchOrderDetails(order.id)}
            className="hover:shadow-lg cursor-pointer transition-all"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{order.id}</span>
                <Badge
                  variant={
                    order.status === "Delivered"
                      ? "default"
                      : order.status === "Pending"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {order.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                {order.customer} ({order.customerType})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" /> {order.items} items
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" /> {order.destination}
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> {order.orderDate} → {order.deliveryDate}
              </div>
              <div>Total: {order.totalValue}</div>
              <div>Weight: {order.weight}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.id}</DialogTitle>
              <DialogDescription>
                {selectedOrder.customer} ({selectedOrder.customerType})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <p>
                <strong>Destination:</strong> {selectedOrder.destination}
              </p>
              <p>
                <strong>Route:</strong> {selectedOrder.route}
              </p>
              <p>
                <strong>Train Trip:</strong> {selectedOrder.trainTrip}
              </p>
              <p>
                <strong>Driver:</strong> {selectedOrder.driver}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge
                  variant={
                    selectedOrder.status === "Delivered"
                      ? "default"
                      : selectedOrder.status === "Pending"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {selectedOrder.status}
                </Badge>
              </p>

              <div>
                <h3 className="font-semibold mt-4">Items</h3>
                <div className="border rounded-md p-2 space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.product_name}</span>
                      <span>
                        {item.quantity} × {item.unitPrice} ({item.weight})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
