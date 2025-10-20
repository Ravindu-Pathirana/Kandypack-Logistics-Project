import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ChevronsUpDown,Trash2 } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Customer = {
  customer_id: number
  customer_name: string
}

type Product = {
  product_id: number
  product_name: string
  unit_price: number
}

type OrderItem = {
  product_id: number
  quantity: number
  unit_price: number
}

type Order = {
  order_id: number
  customer_id: number
  order_date: string
  required_date: string
  status: string
  total_quantity: number
  total_price: number
  items: OrderItem[]
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)

  const [newOrder, setNewOrder] = useState<{
    customer_id: number | null
    order_date: string
    required_date: string
    status: string
    items: OrderItem[]
  }>({
    customer_id: null,
    order_date: "",
    required_date: "",
    status: "Pending",
    items: [],
  })

  // customer dropdown state
  const [openCustomer, setOpenCustomer] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState("")

  // Fetch data
  const fetchOrders = async () => {
    const res = await fetch("http://localhost:8000/orders")
    if (!res.ok) return
    const data = await res.json()
    setOrders(data)
  }

  const fetchCustomers = async () => {
    const res = await fetch("http://localhost:8000/customers/")
    if (!res.ok) return
    const data = await res.json()
    console.log("Fetched customers:", data)
    setCustomers(data)
  }

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:8000/products/")
    if (!res.ok) return
    const data = await res.json()
    setProducts(data)
  }

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
    fetchProducts()
  }, [])

  const addItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { product_id: 0, quantity: 1, unit_price: 0 }],
    })
  }

  const updateItem = (index: number, field: string, value: any) => {
    const items = [...newOrder.items]
    ;(items[index] as any)[field] = value
    setNewOrder({ ...newOrder, items })
  }

  const handleSubmitOrder = async () => {
    const total_quantity = newOrder.items.reduce((sum, i) => sum + i.quantity, 0)
    const total_price = newOrder.items.reduce(
      (sum, i) => sum + i.quantity * i.unit_price,
      0
    )

    const orderData = {
      ...newOrder,
      total_quantity,
      total_price,
    }

    const res = await fetch("http://localhost:8000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })

    if (res.ok) {
      setIsNewOrderOpen(false)
      fetchOrders()
      setNewOrder({
        customer_id: null,
        order_date: "",
        required_date: "",
        status: "Pending",
        items: [],
      })
      setSelectedCustomer("")
    } else {
      console.error(await res.text())
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Orders</h1>
        <Button onClick={() => setIsNewOrderOpen(true)}>
          <Plus className="h-4 w-4" /> New Order
        </Button>
      </div>

      {/* Orders List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.map((o) => {
        const customer = customers.find((c) => c.customer_id === o.customer_id)
        return (
          <Card key={o.order_id} className="shadow-md border rounded-xl">
            <CardContent className="p-6 space-y-3">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">ORD-{o.order_id.toString().padStart(3, "0")}</h2>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    o.status === "Delivered"
                      ? "bg-green-100 text-green-700"
                      : o.status === "In Transit"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {o.status}
                </span>
              </div>

              {/* Customer */}
              <p className="text-gray-700 font-medium">
                {customer ? customer.customer_name : "Unknown Customer"}
              </p>

              {/* Destination, Value, Items */}
              <div className="text-sm space-y-1">
                <p className="flex items-center gap-2">
                  📍 {customer ? customer.customer_name : "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  📦 {o.total_quantity} items
                </p>
                <p className="flex items-center gap-2">
                  💰 Value: <span className="font-semibold">Rs. {o.total_price.toLocaleString()}</span>
                </p>
                <p className="flex items-center gap-2">
                  📅 {new Date(o.order_date).toLocaleDateString()}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between pt-3">
                <Button variant="outline">View Details</Button>
                <Button>Update Status</Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>

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
                <Button variant="outline" role="combobox" className="w-full justify-between text-lg py-6">
                  {selectedCustomer
                    ? customers.find((c) => String(c.customer_id) === selectedCustomer)?.customer_name
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
                          setSelectedCustomer(val)
                          setNewOrder({ ...newOrder, customer_id: parseInt(val) })
                          setOpenCustomer(false)
                        }}
                      >
                        {c.customer_id} - {c.customer_name}
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
                onChange={(e) => setNewOrder({ ...newOrder, required_date: e.target.value })}
              />
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
            <div className="grid grid-cols-5 font-semibold border-b pb-2 mb-2">
              <span>Product</span>
              <span>Quantity</span>
              <span>Unit Price</span>
              <span>Line Total</span>
              <span>Action</span>
            </div>

            {newOrder.items.map((item, idx) => {
              const product = products.find((p) => p.product_id === item.product_id)
              const lineTotal = item.quantity * item.unit_price

              return (
                <div key={idx} className="grid grid-cols-5 gap-2 items-center mb-2">
                  <select
                    className="border p-2 rounded"
                    value={item.product_id}
                    onChange={(e) => {
                      const selectedId = parseInt(e.target.value)
                      const prod = products.find((p) => p.product_id === selectedId)
                      updateItem(idx, "product_id", selectedId)
                      if (prod) updateItem(idx, "unit_price", prod.unit_price)
                    }}
                  >
                    <option value={0}>Select Product</option>
                    {products.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.product_name}
                      </option>
                    ))}
                  </select>

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

                  <span className="text-right font-medium">Rs. {lineTotal.toFixed(2)}</span>

                  <Button
                    variant="destructive"
                    onClick={() => {
                      const items = [...newOrder.items]
                      items.splice(idx, 1)
                      setNewOrder({ ...newOrder, items })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}

            <Button onClick={addItem} className="mt-2 w-full">
              + Add Product
            </Button>
          </div>

          {/* Order Summary */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-lg">
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

    </div>
  )
}
