import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Truck,
  Plus,
  Search,
  Trash2,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Circle,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const ManageTrucks = ({ onBack }) => {
  const [trucks, setTrucks] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [newTruck, setNewTruck] = useState({
    store_id: "",
    plate_number: "",
    is_available: 1,
  });

  // ✅ Auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // ✅ Fetch trucks + stores
  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      const [trucksRes, storesRes] = await Promise.all([
        fetch(`${API_BASE}/trucks`, { headers, cache: "no-store" }),
        fetch(`${API_BASE}/stores`, { headers, cache: "no-store" }),
      ]);

      if (trucksRes.status === 401 || storesRes.status === 401) {
        localStorage.removeItem("access_token");
        return;
      }

      if (!trucksRes.ok) throw new Error("Failed to fetch trucks");
      if (!storesRes.ok) throw new Error("Failed to fetch stores");

      const trucksData = await trucksRes.json();
      const storesData = await storesRes.json();

      setTrucks(Array.isArray(trucksData) ? trucksData : []);
      setStores(Array.isArray(storesData) ? storesData : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Add truck
  const handleAddTruck = async () => {
    if (!newTruck.store_id || !newTruck.plate_number.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/trucks`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          store_id: parseInt(newTruck.store_id),
          plate_number: newTruck.plate_number.toUpperCase(),
          is_available: newTruck.is_available,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add truck");
      }

      const result = await response.json();
      setTrucks([...trucks, result]);
      setNewTruck({ store_id: "", plate_number: "", is_available: 1 });
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      console.error("Error adding truck:", err);
      setError(err.message || "Error adding truck");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete truck
  const handleDeleteTruck = async (truckId) => {
    if (!window.confirm("Are you sure you want to delete this truck?")) return;

    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/trucks/${truckId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete truck");
      }

      setTrucks(trucks.filter((t) => t.truck_id !== truckId));
      setError(null);
    } catch (err) {
      console.error("Error deleting truck:", err);
      setError(err.message || "Error deleting truck");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get store name safely
  const getStoreName = (storeId) => {
    const store = stores.find((s) => s.store_id === storeId || s.id === storeId);
    return store ? store.store_name : `Store #${storeId}`;
  };

  // ✅ Filtered trucks
  const filteredTrucks = trucks.filter((truck) => {
    const matchesSearch =
      truck.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getStoreName(truck.store_id).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAvailability =
      availabilityFilter === ""
        ? true
        : availabilityFilter === "available"
        ? truck.is_available === 1
        : truck.is_available === 0;

    return matchesSearch && matchesAvailability;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header with Back and centered title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Truck className="h-8 w-8" />
            Manage Trucks
          </h1>
          <p className="text-muted-foreground">Add and manage fleet vehicles</p>
        </div>
        <div className="w-[72px]" />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle>Fleet Management</CardTitle>
          <CardDescription>View and manage all vehicles in your fleet</CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by plate or store..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="">All Trucks</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>

            <Button
              className="flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              Add Truck
            </Button>
          </div>

          {/* Table */}
          {loading && !showAddModal ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTrucks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {trucks.length === 0
                ? "No trucks added yet"
                : "No trucks match your filters"}
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Plate</th>
                    <th className="px-4 py-3 text-left font-medium">Store</th>
                    <th className="px-4 py-3 text-left font-medium">Availability</th>
                    <th className="px-4 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrucks.map((truck) => (
                    <tr
                      key={truck.truck_id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-medium">
                        {truck.plate_number}
                      </td>
                      <td className="px-4 py-3">{getStoreName(truck.store_id)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {truck.is_available === 1 ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                Available
                              </Badge>
                            </>
                          ) : (
                            <>
                              <Circle className="h-4 w-4 text-red-600" />
                              <Badge variant="outline" className="text-red-700 border-red-200">
                                Unavailable
                              </Badge>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteTruck(truck.truck_id)}
                          className="p-2 hover:bg-red-100 rounded-md text-red-600 transition-colors"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Truck Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Truck</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Store *</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={newTruck.store_id}
                onChange={(e) =>
                  setNewTruck({ ...newTruck, store_id: e.target.value })
                }
              >
                <option value="">Select a store</option>
                {stores.map((store) => (
                  <option key={store.store_id || store.id} value={store.store_id || store.id}>
                    {store.store_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plate Number *</label>
              <Input
                placeholder="e.g., ABC-1234"
                value={newTruck.plate_number}
                onChange={(e) =>
                  setNewTruck({
                    ...newTruck,
                    plate_number: e.target.value.toUpperCase(),
                  })
                }
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Availability</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={newTruck.is_available}
                onChange={(e) =>
                  setNewTruck({
                    ...newTruck,
                    is_available: parseInt(e.target.value),
                  })
                }
              >
                <option value={1}>Available</option>
                <option value={0}>Unavailable</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTruck} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Adding...
                </>
              ) : (
                "Add Truck"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageTrucks;
