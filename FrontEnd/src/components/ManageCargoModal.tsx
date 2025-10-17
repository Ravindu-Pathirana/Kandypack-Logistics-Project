import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const ManageCargoModal = ({ open, onOpenChange, trainId }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Cargo - {trainId}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-3">
          Here you can assign or remove cargo orders for train {trainId}.
        </p>

        <div className="space-y-2">
          <Button className="w-full">Add Cargo</Button>
          <Button variant="outline" className="w-full">Remove Cargo</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
