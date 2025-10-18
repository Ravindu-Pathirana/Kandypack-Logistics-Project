import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { routeService } from "@/services/routeServise";
 // ✅ fixed import path

const AddRoute = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    route_name: "",
    area: "",
    max_delivery_time: "",
    coverage_areas: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ✅ Map form fields to routeService property names
      await routeService.createRoute({
        name: form.route_name,
        area: form.area,
        max_delivery_time: form.max_delivery_time,
        coverage: form.coverage_areas,
      });

      toast({
        title: "Success",
        description: `Route "${form.route_name}" added successfully.`,
      });

      // ✅ Redirect to Routes list
      navigate("/routes");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add route. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add New Delivery Route</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block mb-1 font-medium">Route Name</label>
          <Input
            name="route_name"
            placeholder="Ex: Colombo Central"
            value={form.route_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Area / Province</label>
          <Input
            name="area"
            placeholder="Ex: Western Province"
            value={form.area}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Max Delivery Time</label>
          <Input
            name="max_delivery_time"
            placeholder="Ex: 4 hours"
            value={form.max_delivery_time}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Coverage Areas</label>
          <Input
            name="coverage_areas"
            placeholder="Ex: Fort, Pettah, Kollupitiya"
            value={form.coverage_areas}
            onChange={handleChange}
          />
        </div>

        <Button type="submit" className="w-full mt-4">
          Save Route
        </Button>
      </form>
    </div>
  );
};

// ✅ Default export so App.tsx import works
export default AddRoute;
