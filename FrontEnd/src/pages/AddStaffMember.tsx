import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { driverService } from "@/services/driverService";

// ✅ Add this interface at the top (around line 10)
export interface StaffForm {
  employee_name: string;
  role: string;
  official_contact_number: string;
  current_route: string;
  status: string;
}

const AddStaffMember = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ Use the interface type
  const [form, setForm] = useState<StaffForm>({
    employee_name: "",
    role: "Driver",
    official_contact_number: "",
    current_route: "",
    status: "On Duty",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await driverService.createDriver(form);
      toast({
        title: "Success",
        description: `${form.role} "${form.employee_name}" added successfully.`,
      });
      navigate("/drivers");
    } catch (error) {
      console.error("Error adding staff member:", error);
      toast({
        title: "Error",
        description: "Failed to add staff member.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Add Staff Member</h1>

      {/* ✅ Red underline was here due to missing type on e */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="employee_name">Name</Label>
          <Input
            id="employee_name"
            name="employee_name"
            value={form.employee_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Driver / Assistant"
          />
        </div>

        <div>
          <Label htmlFor="official_contact_number">Phone Number</Label>
          <Input
            id="official_contact_number"
            name="official_contact_number"
            value={form.official_contact_number}
            onChange={handleChange}
            placeholder="+94XXXXXXXXX"
          />
        </div>

        <div>
          <Label htmlFor="current_route">Current Route</Label>
          <Input
            id="current_route"
            name="current_route"
            value={form.current_route}
            onChange={handleChange}
          />
        </div>

        <Button type="submit" className="w-full">
          Save
        </Button>
      </form>
    </div>
  );
};

export default AddStaffMember;
