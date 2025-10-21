
import React, { useEffect, useState, useMemo } from "react";
import { Loader2, Search } from "lucide-react";
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

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

type Order = {
  order_id: number;
  customer_name: string;
  status: string;
  order_date: string;
  required_date: string;
  total_quantity: number;
  total_price: number;
};

const PAGE_SIZE = 50;

export default function OrdersAtStore() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrdersAtStore = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("You must be logged in to view store orders.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/orders/at-store`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("access_token");
        setError("Unauthorized. Please log in again.");
        setOrders([]);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch store orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders at store:", err);
      setError("Failed to load orders. Try again.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAtStore();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(query) ||
        o.status.toLowerCase().includes(query) ||
        o.order_id.toString().includes(query)
    );
  }, [orders, searchQuery]);

  const pagedOrders = useMemo(() => {
    const sorted = [...filteredOrders].sort((a, b) => b.order_id - a.order_id);
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading store orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Orders at Your Store</h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by order ID, customer, or status..."
          className="w-full pl-10 pr-4 py-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedOrders.length > 0 ? (
            pagedOrders.map((order) => (
              <TableRow key={order.order_id}>
                <TableCell>ORD-{String(order.order_id).padStart(3, "0")}</TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(order.required_date).toLocaleDateString()}</TableCell>
                <TableCell>{order.total_quantity}</TableCell>
                <TableCell>Rs. {order.total_price.toLocaleString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No orders found for this store.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {filteredOrders.length > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <span className="text-sm">
            Page <strong>{page}</strong> / {totalPages} ({filteredOrders.length} total)
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
    </div>
  );
}
