import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const NewOrderModal = ({ open, onOpenChange, onAddOrder }: any) => {
  const [form, setForm] = useState({
    id: "",
    customer: "",
    destination: "",
    items: "",
    totalValue: "",
    weight: "",
    status: "Pending",
  });

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.id || !form.customer) return alert("Please fill all fields");

    const newOrder = {
      ...form,
      orderDate: new Date().toISOString().split("T")[0],
      deliveryDate: "2024-08-20",
      route: "R-10",
      trainTrip: "TR-010",
      driver: "Pending",
    };

    onAddOrder(newOrder);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Order ID"
            name="id"
            value={form.id}
            onChange={handleChange}
          />
          <Input
            placeholder="Customer Name"
            name="customer"
            value={form.customer}
            onChange={handleChange}
          />
          <Input
            placeholder="Destination"
            name="destination"
            value={form.destination}
            onChange={handleChange}
          />
          <Input
            placeholder="Items"
            name="items"
            value={form.items}
            onChange={handleChange}
          />
          <Input
            placeholder="Total Value"
            name="totalValue"
            value={form.totalValue}
            onChange={handleChange}
          />
          <Input
            placeholder="Weight"
            name="weight"
            value={form.weight}
            onChange={handleChange}
          />
          <Button className="w-full" onClick={handleSubmit}>
            Add Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
