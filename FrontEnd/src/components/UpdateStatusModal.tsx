import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface UpdateStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onUpdate: (id: string, newStatus: string) => void;
}

export const UpdateStatusModal = ({
  open,
  onOpenChange,
  order,
  onUpdate,
}: UpdateStatusModalProps) => {
  // 🧩 initialize safely
  const [status, setStatus] = useState(order?.status || "");

  // 🧠 update state when modal opens for a different order
  useEffect(() => {
    if (order) setStatus(order.status);
  }, [order]);

  // 🧰 if no order selected, render nothing
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status - {order.id}</DialogTitle>
        </DialogHeader>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select new status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Loading">Loading</SelectItem>
            <SelectItem value="In Transit">In Transit</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="mt-4 w-full"
          onClick={() => {
            onUpdate(order.id, status);
            onOpenChange(false);
          }}
        >
          Update
        </Button>
      </DialogContent>
    </Dialog>
  );
};
