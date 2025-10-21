import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Package, Train, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type Customer = {
  customer_id: number;
  customer_name: string;
  city: string;
  address_line_1?: string;
  address_line_2?: string;
  district?: string;
};

type Product = {
  product_id: number;
  product_name: string;
  unit_price: number;
  unit_space: number;
};

type OrderItem = {
  product_id: number;
  quantity: number;
  unit_price: number;
  remaining_qty?: number;
};

type Order = {
  order_id: number;
  customer_id: number;
  order_date: string;
  required_date: string;
  status: string;
  total_quantity: number;
  total_price: number;
  total_space: number;
  items: OrderItem[];
};

type TrainTrip = {
  train_id: number;
  id: string; // e.g. TR-001
  route: string; // e.g. Kandy → Colombo
  departure: string; // HH:MM:SS
  arrival: string; // HH:MM:SS
  capacity: number;
  utilized: number;
  status: string;
};

export default function TrainAllocation() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [trains, setTrains] = useState<TrainTrip[]>([]);
  const [stores, setStores] = useState<{ store_id: number; store_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [allocationLoading, setAllocationLoading] = useState(false);
  
  // Product-wise allocation state
  const [remainingQtyByProduct, setRemainingQtyByProduct] = useState<Record<number, number>>({});
  const [selectedTrainByProduct, setSelectedTrainByProduct] = useState<Record<number, number | null>>({});
  const [allocQtyByProduct, setAllocQtyByProduct] = useState<Record<number, number>>({});
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [totalRemainingSpace, setTotalRemainingSpace] = useState(0);

  // Fetch order details
  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    try {
      const token = localStorage.getItem("access_token");
      
      // Fetch order summary
      const orderRes = await fetch(`${API_BASE}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const orderData = await orderRes.json();
      
      // Fetch order items
      const itemsRes = await fetch(`${API_BASE}/orders/${orderId}/items`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const items = itemsRes.ok ? await itemsRes.json() : [];
      
      const fullOrder = { ...orderData, items };
      setOrder(fullOrder);
      
      // Fetch customer details
      if (fullOrder.customer_id) {
        const customerRes = await fetch(`${API_BASE}/customers/${fullOrder.customer_id}`);
        if (customerRes.ok) {
          const customerData = await customerRes.json();
          setCustomer(customerData);
        }
      } else {
        console.error("Missing customer_id in order data:", fullOrder);
      }      
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/products`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch stores
  const fetchStores = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/stores`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (res.ok) {
        const data = await res.json();
        const opts = (Array.isArray(data) ? data : []).map((s: any) => ({
          store_id: s.store_id,
          store_name: s.store_name ?? `Store ${s.store_id}`,
        }));
        setStores(opts);
        if (opts.length && selectedStoreId == null) setSelectedStoreId(opts[0].store_id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch available trains filtered by customer destination
  const fetchAvailableTrains = async () => {
    try {
      const res = await fetch(`${API_BASE}/trains/`);
      if (res.ok) {
        const data = await res.json();
        let filteredTrains = Array.isArray(data) ? data : [];
        
        // Filter trains by customer destination if customer data is available
        if (customer?.city) {
          filteredTrains = filteredTrains.filter((train: TrainTrip) => 
            train.route.toLowerCase().includes(customer.city.toLowerCase())
          );
        }
        
        setTrains(filteredTrains);
      } else {
        console.error("Failed to fetch trains:", res.status, res.statusText);
      }
    } catch (error) {
      console.error("Error fetching trains:", error);
    }
  };

  // Initialize product allocation state
  const initializeAllocationState = () => {
    if (!order) return;
    
    const qtyMap: Record<number, number> = {};
    const trainSel: Record<number, number | null> = {};
    const allocQty: Record<number, number> = {};
    
    order.items.forEach((item) => {
      const initialRemaining = (item as any).remaining_qty ?? item.quantity;
      qtyMap[item.product_id] = (qtyMap[item.product_id] || 0) + initialRemaining;
      trainSel[item.product_id] = null;
      allocQty[item.product_id] = 1;
    });
    
    setRemainingQtyByProduct(qtyMap);
    setSelectedTrainByProduct(trainSel);
    setAllocQtyByProduct(allocQty);
    
    // Calculate total remaining space dynamically
    updateTotalRemainingSpace();
  };

  // Update total remaining space dynamically
  const updateTotalRemainingSpace = () => {
    if (!order) return;
    
    const totalSpace = order.items.reduce((sum, item) => {
      const product = products.find((p) => p.product_id === item.product_id);
      const remainingQty = remainingQtyByProduct[item.product_id] || item.quantity;
      return sum + (product ? product.unit_space * remainingQty : 0);
    }, 0);
    setTotalRemainingSpace(totalSpace);
  };

  // Calculate current total remaining space (real-time)
  const getCurrentTotalRemainingSpace = () => {
    if (!order) return 0;
    
    return order.items.reduce((sum, item) => {
      const product = products.find((p) => p.product_id === item.product_id);
      const remainingQty = remainingQtyByProduct[item.product_id] || item.quantity;
      return sum + (product ? product.unit_space * remainingQty : 0);
    }, 0);
  };

  // Allocate product to train
  // Allocate product to train (TOP-LEVEL function, not nested)
const allocateProductToTrain = async (
    trainId: number,
    productId: number,
    allocatedQty: number,
    storeId: number
  ) => {
    if (!orderId) {
      alert("Order ID missing from URL, cannot allocate");
      return false;
    }

    const token = localStorage.getItem("access_token");
    const product = products.find((p) => p.product_id === productId);

    try {
      const requestBody = {
        train_id: trainId,
        product_id: productId,
        allocated_qty: allocatedQty,
        store_id: storeId,
        unit_space: product?.unit_space,
      };

      console.log("Sending allocation request:", requestBody);

      const res = await fetch(`${API_BASE}/orders/${orderId}/allocate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Allocation failed:", res.status, errorText);
        
        // Parse error response for better user feedback
        let errorMessage = "Allocation failed";
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
              errorMessage = errorData.detail[0].msg || errorMessage;
            }
          }
        } catch {
          errorMessage = errorText || `Server error (${res.status})`;
        }
        
        toast({
          title: "Allocation Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }

      const result = await res.json();
      console.log("Allocation successful:", result);
      return true;
    } catch (error) {
      console.error("Error allocating product:", error);
      toast({
        title: "Network Error",
        description: "Failed to connect to server. Please check your connection and try again.",
        variant: "destructive",
      });
      return false;
    }
  };


  // Handle product allocation
  // Handle product allocation
  const handleAllocateProduct = async (productId: number) => {
    if (!order || allocationLoading) return;

    const remainingQty = remainingQtyByProduct[productId] || 0;
    const selectedTrainId = selectedTrainByProduct[productId] ?? null;
    const qty = allocQtyByProduct[productId] || 0;
    const storeId = selectedStoreId ?? 0;

    // Validation with toast notifications
    if (!selectedTrainId || selectedTrainId === 0) {
      toast({
        title: "Train Selection Required",
        description: "Please select a train for this product before allocating.",
        variant: "destructive",
      });
      return;
    }
    if (qty <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity to allocate.",
        variant: "destructive",
      });
      return;
    }
    if (qty > remainingQty) {
      toast({
        title: "Insufficient Quantity",
        description: `Cannot allocate ${qty} units. Only ${remainingQty} units remaining for this product.`,
        variant: "destructive",
      });
      return;
    }
    if (!storeId) {
      toast({
        title: "Store Selection Required",
        description: "Please select a destination store before allocating.",
        variant: "destructive",
      });
      return;
    }
    if (remainingQty <= 0) {
      toast({
        title: "No Remaining Quantity",
        description: "No remaining quantity to allocate for this product.",
        variant: "destructive",
      });
      return;
    }

    // Check available space on selected train
    const train = trains.find((t) => t.train_id === selectedTrainId);
    if (!train) return;

    const availableSpace = (train.capacity || 0) - (train.utilized || 0);
    const product = products.find((p) => p.product_id === productId);
    const neededSpace = (product?.unit_space || 0) * qty;

    if (neededSpace > availableSpace + 1e-9) {
      toast({
        title: "Insufficient Train Capacity",
        description: `Not enough space on selected train. Available: ${availableSpace.toFixed(2)} units, Needed: ${neededSpace.toFixed(2)} units.`,
        variant: "destructive",
      });
      return;
    }

    setAllocationLoading(true);
    try {
      const success = await allocateProductToTrain(selectedTrainId, productId, qty, storeId);

      if (success) {
        // Update remaining quantities (frontend view)
        const next = { ...remainingQtyByProduct, [productId]: Math.max(0, remainingQty - qty) };
        setRemainingQtyByProduct(next);

        // Update total remaining space by subtracting the allocated space
        const allocatedSpace = (product?.unit_space || 0) * qty;
        const newTotalSpace = getCurrentTotalRemainingSpace() - allocatedSpace;
        setTotalRemainingSpace(Math.max(0, newTotalSpace));

        // Refresh trains (utilization) and order (if you want to reflect backend state)
        await fetchAvailableTrains();
        await fetchOrderDetails();

        // Check if all products are fully allocated
        const anyLeft = Object.values(next).some((v) => v > 0);
        if (!anyLeft) {
          // All products allocated - update status to Shipped
          await updateOrderStatus("Shipped");
          toast({
            title: "Allocation Complete!",
            description: "All products have been allocated successfully. Order status updated to Shipped.",
            variant: "default",
          });
          setTimeout(() => navigate("/orders"), 2000);
        } else {
          // Show success message with updated remaining space
          toast({
            title: "Allocation Successful",
            description: `Successfully allocated ${qty} units to train. Remaining space: ${newTotalSpace.toFixed(2)} units`,
            variant: "default",
          });
        }
      }
    } finally {
      setAllocationLoading(false);
    }
  };


  // Update order status
  const updateOrderStatus = async (status: string) => {
    if (!order) return;
    
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE}/orders/${order.order_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        console.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOrderDetails(),
        fetchProducts(),
        fetchStores(),
      ]);
      setLoading(false);
    };
    
    loadData();
  }, [orderId]);

  useEffect(() => {
    if (order && customer) {
      fetchAvailableTrains();
    }
  }, [order, customer]);

  useEffect(() => {
    if (order && products.length > 0) {
      initializeAllocationState();
    }
  }, [order, products]);

  // Update total remaining space when quantities change
  useEffect(() => {
    updateTotalRemainingSpace();
  }, [remainingQtyByProduct, products]);

  // Real-time space calculation effect
  useEffect(() => {
    const currentSpace = getCurrentTotalRemainingSpace();
    setTotalRemainingSpace(currentSpace);
  }, [remainingQtyByProduct, products, order]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading allocation details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Order not found</p>
        <Button onClick={() => navigate("/orders")} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Train Allocation</h1>
            <p className="text-gray-600">
              Order ORD-{String(order.order_id).padStart(3, "0")} - {customer?.customer_name}
            </p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-semibold">{customer?.customer_name || 'Loading...'}</p>
              <p className="text-sm text-gray-500">{customer?.city || 'Loading...'}</p>
              {customer?.address_line_1 && (
                <p className="text-xs text-gray-400">
                  {customer.address_line_1}
                  {customer.address_line_2 && `, ${customer.address_line_2}`}
                  {customer.district && `, ${customer.district}`}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold">{order.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Space</p>
              <p className="font-semibold">{order.total_space?.toFixed(2) || 0} units</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining Space</p>
              <p className="font-semibold text-blue-600">{getCurrentTotalRemainingSpace().toFixed(2)} units</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Store Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Destination Store:</span>
            <select
              className="border rounded p-2 min-w-[200px]"
              value={selectedStoreId ?? 0}
              onChange={(e) => setSelectedStoreId(parseInt(e.target.value) || null)}
            >
              {stores.map((store) => (
                <option key={store.store_id} value={store.store_id}>
                  {store.store_name} (ID {store.store_id})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Product Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Product Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-4 font-semibold border-b pb-2">
              <span>Product (ID)</span>
              <span>Remaining Qty</span>
              <span>Unit Space</span>
              <span>Allocating Space</span>
              <span>Train</span>
              <span>Qty to Allocate</span>
              <span>Action</span>
            </div>
            
            {order.items.map((item, idx) => {
              const product = products.find((p) => p.product_id === item.product_id);
              const initialRemaining = (item as any).remaining_qty ?? item.quantity;
              const remainingQty = remainingQtyByProduct[item.product_id] ?? initialRemaining;
              const selectedTrainId = selectedTrainByProduct[item.product_id] ?? 0;
              const qty = allocQtyByProduct[item.product_id] ?? 1;
              const allocatingSpace = (product?.unit_space || 0) * qty;
              
              return (
                <div key={`${item.product_id}-${idx}`} className="grid grid-cols-7 gap-4 items-center py-2 border-b">
                  <div>
                    <span className="font-medium">{product?.product_name || 'Loading...'}</span>
                    <span className="text-sm text-gray-500 ml-1">(ID: {item.product_id})</span>
                  </div>
                  <span className="text-center">{remainingQty}</span>
                  <span className="text-center">{product?.unit_space?.toFixed(2) || '0.00'}</span>
                  <span className="text-center font-semibold text-blue-600">{allocatingSpace.toFixed(2)}</span>
                  
                  <select
                    className="border rounded p-2"
                    value={selectedTrainId || 0}
                    onChange={(e) =>
                      setSelectedTrainByProduct((m) => ({ 
                        ...m, 
                        [item.product_id]: parseInt(e.target.value) || null 
                      }))
                    }
                  >
                    <option value={0}>Select Train</option>
                    {trains.map((train) => {
                      const available = (train.capacity || 0) - (train.utilized || 0);
                      return (
                        <option key={train.train_id} value={train.train_id}>
                          {train.id} — {train.route} — {train.departure} — Avl {available.toFixed(2)}
                        </option>
                      );
                    })}
                  </select>
                  
                  <Input
                    type="number"
                    min={1}
                    max={remainingQty}
                    value={qty}
                    onChange={(e) =>
                      setAllocQtyByProduct((m) => ({ 
                        ...m, 
                        [item.product_id]: Math.max(1, Math.min(remainingQty, parseInt(e.target.value) || 1)) 
                      }))
                    }
                    className="text-center"
                  />
                  
                  <Button
                    variant="outline"
                    disabled={remainingQty <= 0 || !selectedTrainByProduct[item.product_id] || !selectedStoreId || allocationLoading}
                    onClick={() => handleAllocateProduct(item.product_id)}
                    className="w-full"
                  >
                    {allocationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Allocate"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>


      {/* Available Trains */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Train className="h-5 w-5" />
              Available Trains {customer?.city && `(Filtered by ${customer.city})`}
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAvailableTrains}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Train</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilized</TableHead>
                <TableHead>Available Space</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trains.map((train) => {
                const available = (train.capacity || 0) - (train.utilized || 0);
                return (
                  <TableRow key={train.train_id}>
                    <TableCell className="font-medium">{train.id}</TableCell>
                    <TableCell>{train.route}</TableCell>
                    <TableCell>{train.departure}</TableCell>
                    <TableCell>{train.arrival}</TableCell>
                    <TableCell>{train.capacity?.toFixed(2)}</TableCell>
                    <TableCell>{train.utilized?.toFixed(2)}</TableCell>
                    <TableCell className={available > 0 ? "text-green-600 font-semibold" : "text-red-600"}>
                      {available.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        train.status === 'on-time' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {train.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {trains.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>
                {customer?.city 
                  ? `No trains available to ${customer.city}`
                  : "No trains available"
                }
              </p>
              <p className="text-sm mt-2">
                Try refreshing the trains or check if trains are scheduled for the next 14 days.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

