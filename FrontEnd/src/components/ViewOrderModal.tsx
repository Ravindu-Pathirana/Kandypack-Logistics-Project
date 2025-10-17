import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ViewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export const ViewOrderModal = ({ open, onOpenChange, order }: ViewOrderModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order Details - {order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <p><b>Customer:</b> {order.customer}</p>
          <p><b>Destination:</b> {order.destination}</p>
          <p><b>Items:</b> {order.items}</p>
          <p><b>Value:</b> {order.totalValue}</p>
          <p><b>Weight:</b> {order.weight}</p>
          <p><b>Status:</b> {order.status}</p>
          <p><b>Driver:</b> {order.driver}</p>
          <p><b>Route:</b> {order.route}</p>
          <p><b>Train Trip:</b> {order.trainTrip}</p>
          <p><b>Delivery Date:</b> {order.deliveryDate}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
