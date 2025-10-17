import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AddRoute = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">Add New Delivery Route</h1>
      <div className="space-y-4">
        <div>
          <Label>Route Name</Label>
          <Input placeholder="e.g. Colombo Central" />
        </div>
        <div>
          <Label>Area / Province</Label>
          <Input placeholder="e.g. Western Province" />
        </div>
        <div>
          <Label>Max Delivery Time</Label>
          <Input placeholder="e.g. 4 hours" />
        </div>
        <div>
          <Label>Coverage Areas</Label>
          <Input placeholder="e.g. Fort, Pettah, Kollupitiya" />
        </div>
        <Button className="w-full">Save Route</Button>
      </div>
    </div>
  );
};

export default AddRoute;
