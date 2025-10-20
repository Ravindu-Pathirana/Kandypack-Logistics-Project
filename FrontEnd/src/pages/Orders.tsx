import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, ChevronsUpDown, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Customer = {
  customer_id: number;
  customer_name: string;
  city: string;
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

type OrderDetails = Order; // Simplified, as Order already includes items

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

const PAGE_SIZE = 50;

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dateError, setDateError] = useState("");
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewOrder, setViewOrder] = useState<OrderDetails | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  const [newOrder, setNewOrder] = useState<{
    customer_id: number | null;
    order_date: string;
    required_date: string;
    status: string;
    items: OrderItem[];
  }>({
    customer_id: null,
    order_date: "",
    required_date: "",
    status: "Pending",
    items: [],
  });
  
  // customer dropdown state
  const [openCustomer, setOpenCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  // Fetch data
  const fetchOrders = async () => {
    const res = await fetch("http://localhost:8000/orders");
    if (!res.ok) return;
    const data = await res.json();
    setOrders(data);
  };

  const fetchCustomers = async () => {
    const res = await fetch("http://localhost:8000/customers/");
    if (!res.ok) return;
    const data = await res.json();
    console.log("Fetched customers:", data);
    setCustomers(data);
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/products", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (res.status === 401) {
        localStorage.removeItem("access_token");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  const fetchCustomer = async (customerId: number) => {
    const res = await fetch(`http://localhost:8000/customers/${customerId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  };

  const openViewDetails = async (orderId: number) => {
    try {
      setViewOpen(true);
      setViewLoading(true);
      const token = localStorage.getItem("access_token");

      // Fetch order summary
      const res = await fetch(`http://localhost:8000/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const data = await res.json();

      const order = data?.order_id
        ? data
        : {
            ...(orders.find((o) => o.order_id === orderId) as Order),
            items: [],
          };

      // Fetch customer
      const customer = await fetchCustomer(order.customer_id);
      setViewCustomer(customer);

      // 🔹 Fetch order items
      const itemsRes = await fetch(`http://localhost:8000/orders/${orderId}/items`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const items = itemsRes.ok ? await itemsRes.json() : [];

      // Attach items into order
      setViewOrder({ ...order, items });
    } catch (e) {
      console.error(e);
    } finally {
      setViewLoading(false);
    }
  };



  const updateOrderStatus = async (status: string) => {
    if (!viewOrder) return;
    const token = localStorage.getItem("access_token");
    const res = await fetch(`http://localhost:8000/orders/${viewOrder.order_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      console.error(await res.text());
    }
  };


  // DESC by order_id and slice current page
  const pagedOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => b.order_id - a.order_id);
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [orders, page]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);


  const addItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { product_id: 0, quantity: 1, unit_price: 0 }],
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const items = [...newOrder.items];
    (items[index] as any)[field] = value;
    setNewOrder({ ...newOrder, items });
  };

  const handleSubmitOrder = async () => {
    if (dateError || !newOrder.customer_id) {
      alert("Please fix errors and select a customer before submitting the order.");
      return;
    }
    const total_quantity = newOrder.items.reduce((sum, i) => sum + i.quantity, 0);
    const total_price = newOrder.items.reduce(
      (sum, i) => sum + i.quantity * i.unit_price,
      0
    );
    const total_space = newOrder.items.reduce((sum, i) => {
      const prod = products.find((p) => p.product_id === i.product_id);
      return sum + (prod ? prod.unit_space * i.quantity : 0);
    }, 0);
    
    const orderData = {
      ...newOrder,
      total_quantity,
      total_price,
      total_space
    };

    const res = await fetch("http://localhost:8000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (res.ok) {
      setIsNewOrderOpen(false);
      fetchOrders();
      setNewOrder({
        customer_id: null,
        order_date: "",
        required_date: "",
        status: "Pending",
        items: [],
      });
      setSelectedCustomer("");
    } else {
      console.error(await res.text());
    }
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Orders</h1>
        <Button onClick={() => setIsNewOrderOpen(true)}>
          <Plus className="h-4 w-4" /> New Order
        </Button>
      </div>

      {/* Orders Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Required Date</TableHead>
            <TableHead>Total Qty</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedOrders.map((order) => {
            const customer = customers.find((c) => c.customer_id === order.customer_id);
            return (
              <TableRow key={order.order_id}>
                <TableCell>ORD-{String(order.order_id).padStart(3, "0")}</TableCell>
                <TableCell>{customer?.customer_name}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(order.required_date).toLocaleDateString()}</TableCell>
                <TableCell>{order.total_quantity}</TableCell>
                <TableCell>Rs. {order.total_price.toLocaleString()}</TableCell>
                <TableCell>
                  <Button variant="outline" onClick={() => openViewDetails(order.order_id)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      {orders.length > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <span className="text-sm">
            Page <strong>{page}</strong> / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* New Order Dialog */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">🛒 New Order</DialogTitle>
          </DialogHeader>

          {/* Customer Selection */}
          <div className="mb-4">
            <label className="text-sm font-medium">Select Customer</label>
            <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-lg py-6"
                >
                  {selectedCustomer
                    ? customers.find((c) => String(c.customer_id) === selectedCustomer)
                        ?.customer_name
                    : "🔍 Search customer..."}
                  <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search customer..." />
                  <CommandEmpty>No customer found.</CommandEmpty>
                  <CommandGroup>
                    {customers.map((c) => (
                      <CommandItem
                        key={c.customer_id}
                        value={String(c.customer_id)}
                        onSelect={(val) => {
                          setSelectedCustomer(val);
                          setNewOrder({ ...newOrder, customer_id: parseInt(val) });
                          setOpenCustomer(false);
                        }}
                      >
                        {c.customer_id} - {c.customer_name} ({c.city})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium">Order Date</label>
              <Input
                type="date"
                value={newOrder.order_date}
                onChange={(e) => setNewOrder({ ...newOrder, order_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Required Date</label>
              <Input
                type="date"
                value={newOrder.required_date}
                onChange={(e) => {
                  const requiredDate = e.target.value;
                  const orderDate = newOrder.order_date;

                  if (orderDate) {
                    const order = new Date(orderDate);
                    const required = new Date(requiredDate);

                    const diffTime = required.getTime() - order.getTime();
                    const diffDays = diffTime / (1000 * 60 * 60 * 24);

                    if (diffDays < 7) {
                      setDateError("⚠️ Required date must be at least 7 days after order date.");
                    } else {
                      setDateError("");
                      setNewOrder({ ...newOrder, required_date: requiredDate });
                    }
                  } else {
                    setNewOrder({ ...newOrder, required_date: requiredDate });
                  }
                }}
              />
              {dateError && <p className="text-red-500 text-sm mt-1">{dateError}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Input
                type="text"
                value={newOrder.status}
                onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-6 font-semibold border-b pb-2 mb-2 text-center">
              <span>Product</span>
              <span>Unit Space (m<sup>3</sup>)</span>
              <span>Quantity</span>
              <span>Unit Price</span>
              <span>Line Total</span>
              <span>Action</span>
            </div>

            {newOrder.items.map((item, idx) => {
              const product = products.find((p) => p.product_id === item.product_id);
              const lineTotal = item.quantity * item.unit_price;

              return (
                <div key={idx} className="grid grid-cols-6 gap-2 items-center mb-2">
                  <select
                    className="border p-2 rounded"
                    value={item.product_id}
                    onChange={(e) => {
                      const selectedId = parseInt(e.target.value);
                      const prod = products.find((p) => p.product_id === selectedId);
                      updateItem(idx, "product_id", selectedId);
                      if (prod) updateItem(idx, "unit_price", prod.unit_price);
                    }}
                  >
                    <option value={0}>Select Product</option>
                    {products.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.product_name}
                      </option>
                    ))}
                  </select>

                  <span className="text-center">{product ? product.unit_space : "-"}</span>

                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value))}
                  />

                  <Input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(idx, "unit_price", parseFloat(e.target.value))}
                  />

                  <span className="text-center">Rs. {lineTotal.toFixed(2)}</span>

                  <Button
                    variant="destructive"
                    onClick={() => {
                      const items = [...newOrder.items];
                      items.splice(idx, 1);
                      setNewOrder({ ...newOrder, items });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            <Button onClick={addItem} className="mt-2 w-full">
              + Add Product
            </Button>
          </div>

          {/* Order Summary */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-lg">
              <p>
                Total Space:{" "}
                <span className="font-bold text-blue-600">
                  {newOrder.items.reduce((sum, i) => {
                    const prod = products.find((p) => p.product_id === i.product_id);
                    return sum + (prod ? prod.unit_space * i.quantity : 0);
                  }, 0)}{" "}
                  units
                </span>
              </p>

              <p>
                Total Quantity:{" "}
                <span className="font-bold">
                  {newOrder.items.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              </p>
              <p>
                Total Price:{" "}
                <span className="font-bold text-green-600">
                  Rs.{" "}
                  {newOrder.items
                    .reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
                    .toFixed(2)}
                </span>
              </p>
            </div>
            <Button size="lg" onClick={handleSubmitOrder}>
              ✅ Submit Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* View Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {viewLoading ? (
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : viewOrder ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Order:</span> ORD-
                  {String(viewOrder.order_id).padStart(3, "0")}
                </div>
                <div>
                  <span className="font-semibold">Status:</span> {viewOrder.status}
                </div>
                <div>
                  <span className="font-semibold">Customer:</span>{" "}
                  {viewCustomer ? `${viewCustomer.customer_name} (${viewCustomer.city})` : `ID ${viewOrder.customer_id}`}
                </div>
                <div>
                  <span className="font-semibold">Order Date:</span>{" "}
                  {new Date(viewOrder.order_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Required Date:</span>{" "}
                  {new Date(viewOrder.required_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Total Qty:</span> {viewOrder.total_quantity}
                </div>
                <div>
                  <span className="font-semibold">Total Price:</span> Rs.{" "}
                  {viewOrder.total_price?.toLocaleString()}
                </div>
                
                <div>
                  <span className="font-semibold">Total Space:</span>{" "}
                  {viewOrder.total_space !== undefined && viewOrder.total_space !== null
                    ? viewOrder.total_space.toLocaleString()
                    : "N/A"}
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <div className="grid grid-cols-5 font-semibold border-b pb-2 mb-2">
                  <span>Product</span>
                  <span>Qty</span>
                  <span>Unit Space</span>
                  <span>Unit Price</span>
                  <span>Subtotal</span>
                </div>
                {(viewOrder.items ?? []).map((it, i) => {
                  const p = products.find((pr) => pr.product_id === it.product_id);
                  const subtotal = it.quantity * it.unit_price;
                  return (
                    <div key={i} className="grid grid-cols-5 items-center py-1">
                      <span>{p?.product_name ?? it.product_id}</span>
                      <span>{it.quantity}</span>
                      <span>{p?.unit_space ?? "-"}</span>
                      <span>Rs. {it.unit_price.toFixed(2)}</span>
                      <span>Rs. {subtotal.toFixed(2)}</span>
                    </div>
                  );
                })}
                {(viewOrder.items ?? []).length === 0 && (
                  <div className="text-sm text-gray-500">No line items available.</div>
                )}
              </div>

              {viewOrder.status === "Pending" && (
                <Button
                  onClick={() => {
                    if (!viewOrder?.order_id) {
                      alert("Order ID missing, cannot navigate to allocation");
                      return;
                    }
                    navigate(`/orders/${viewOrder.order_id}/allocate`);
                  }}
                >
                  Allocate to Train
                </Button>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-600">No data.</div>
          )}
        
        </DialogContent>
      </Dialog>

    </div>
  );

}