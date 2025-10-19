// ...imports and Orders component only below...
import { useEffect } from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const STORAGE_KEY = "kandypack_orders";

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
  X,
} from "lucide-react";
import { ViewOrderModal } from "@/components/ViewOrderModal";
import { UpdateStatusModal } from "@/components/UpdateStatusModal";
import { FilterModal } from "@/components/FilterModal";
import { NewOrderModal } from "@/components/NewOrderModal";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  // Filter criteria
  const [selectedFilter, setSelectedFilter] = useState<any>({
    status: "",
    destination: "",
  });

  const initialOrders = [
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
      driver: "Kamal Perera",
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
      driver: "Pending",
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
      driver: "Sunil Fernando",
    },
  ];

  const loadOrders = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialOrders;
  };

  const [orders, setOrders] = useState<any[]>(loadOrders());

  // Reload orders from localStorage on mount and when page becomes visible
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        setOrders(loadOrders());
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // --- Status color function ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "default";
      case "In Transit":
        return "secondary";
      case "Loading":
        return "destructive";
      case "Scheduled":
        return "outline";
      case "Pending":
        return "outline";
      default:
        return "outline";
    }
  };

  // --- Search + Filter Logic ---
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = selectedFilter.status
      ? order.status === selectedFilter.status
      : true;

    const matchDestination = selectedFilter.destination
      ? order.destination === selectedFilter.destination
      : true;

    return matchSearch && matchStatus && matchDestination;
  });

  // --- Modal Handlers ---
  const handleView = (order: any) => {
    setSelectedOrder(order);
    setViewOpen(true);
  };

  const handleUpdateStatus = (order: any) => {
    setSelectedOrder(order);
    setStatusOpen(true);
  };

  const saveOrders = (orders: any[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  };
  const handleStatusChange = (id: string, newStatus: string) => {
    const updatedOrders = orders.map((o) =>
      o.id === id ? { ...o, status: newStatus } : o
    );
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
  };

  const handleAddNewOrder = (newOrder: any) => {
    const updated = [...loadOrders(), newOrder];
    saveOrders(updated);
    setOrders(updated);
  };

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Orders Management
          </h1>
          <p className="text-muted-foreground">
            Manage customer orders and deliveries
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setNewOrderOpen(true)}
        >
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
              {searchTerm && (
                <X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
                  onClick={clearSearch}
                />
              )}
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setFilterOpen(true)}
            >
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

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleView(order)}
                >
                  View Details
                </Button>
                {order.status !== "Delivered" && (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleUpdateStatus(order)}
                  >
                    Update Status
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- MODALS --- */}
      <ViewOrderModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        order={selectedOrder}
      />
      <UpdateStatusModal
        open={statusOpen}
        onOpenChange={setStatusOpen}
        order={selectedOrder}
        onUpdate={handleStatusChange}
      />
      <FilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />
      <NewOrderModal
        open={newOrderOpen}
        onOpenChange={setNewOrderOpen}
        onAddOrder={handleAddNewOrder}
      />
    </div>
  );
};

export default Orders;
