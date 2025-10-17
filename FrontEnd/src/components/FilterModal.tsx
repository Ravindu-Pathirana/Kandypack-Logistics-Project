import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const FilterModal = ({
  open,
  onOpenChange,
  selectedFilter,
  onFilterChange,
}: any) => {
  const handleApply = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Orders</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Filter by Status</p>
            <Select
              value={selectedFilter.status}
              onValueChange={(val) =>
                onFilterChange({ ...selectedFilter, status: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="In Transit">In Transit</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Filter by Destination</p>
            <Select
              value={selectedFilter.destination}
              onValueChange={(val) =>
                onFilterChange({ ...selectedFilter, destination: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Colombo">Colombo</SelectItem>
                <SelectItem value="Galle">Galle</SelectItem>
                <SelectItem value="Matara">Matara</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
