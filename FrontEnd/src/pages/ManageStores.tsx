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
  Building2,
  Plus,
  Search,
  Trash2,
  Loader2,
  X,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const ManageStores = ({ isOpen, onClose }) => {
  const [stores, setStores] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newStore, setNewStore] = useState({
    store_name: "",
    address: "",
    city_id: "",
    contact_number: "",
    email: "",
  });

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  // Fetch stores and cities
  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      const [storesRes, citiesRes] = await Promise.all([
        fetch(`${API_BASE}/stores`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_BASE}/cities`, {
          headers,
          cache: "no-store",
        }),
      ]);

      if (storesRes.status === 401 || citiesRes.status === 401) {
        localStorage.removeItem("access_token");
        return;
      }

      if (!storesRes.ok) throw new Error("Failed to fetch stores");
      if (!citiesRes.ok) throw new Error("Failed to fetch cities");

      const storesData = await storesRes.json();
      const citiesData = await citiesRes.json();

      setStores(Array.isArray(storesData) ? storesData : []);
      setCities(Array.isArray(citiesData) ? citiesData : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Add new store
  const handleAddStore = async () => {
    if (
      !newStore.store_name.trim() ||
      !newStore.address.trim() ||
      !newStore.city_id ||
      !newStore.contact_number.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/stores`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          store_name: newStore.store_name,
          address: newStore.address,
          city_id: parseInt(newStore.city_id),
          contact_number: newStore.contact_number,
          email: newStore.email || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add store");
      }

      const result = await response.json();
      setStores([...stores, result]);
      setNewStore({
        store_name: "",
        address: "",
        city_id: "",
        contact_number: "",
        email: "",
      });
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      console.error("Error adding store:", err);
      setError(err.message || "Error adding store");
    } finally {
      setLoading(false);
    }
  };

  // Delete store
  const handleDeleteStore = async (storeId) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;

    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/stores/${storeId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete store");
      }

      setStores(stores.filter((s) => s.id !== storeId));
      setError(null);
    } catch (err) {
      console.error("Error deleting store:", err);
      setError(err.message || "Error deleting store");
    } finally {
      setLoading(false);
    }
  };

  // Get city name by ID
  const getCityName = (cityId) => {
    const city = cities.find((c) => c.id === cityId);
    return city ? city.city_name : "Unknown City";
  };

  // Filter stores based on search
  const filteredStores = stores.filter((store) =>
    store.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.contact_number?.includes(searchTerm)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Manage Stores
            </CardTitle>
            <CardDescription>Add and manage delivery stores</CardDescription>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              className="flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              Add Store
            </Button>
          </div>

          {/* Stores List */}
          {loading && !showAddModal ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {stores.length === 0 ? "No stores added yet" : "No stores match your search"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-medium">{store.store_name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {store.address}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                      <Badge variant="outline">
                        {getCityName(store.city_id)}
                      </Badge>
                      <span>{store.contact_number}</span>
                      {store.email && <span>{store.email}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteStore(store.id)}
                    className="p-2 hover:bg-red-100 rounded-md text-red-600 transition-colors flex-shrink-0"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Add Store Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Store</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Store Name *</label>
                <Input
                  placeholder="e.g., Colombo Main Store"
                  value={newStore.store_name}
                  onChange={(e) =>
                    setNewStore({ ...newStore, store_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address *</label>
                <Input
                  placeholder="e.g., 123 Main Street"
                  value={newStore.address}
                  onChange={(e) =>
                    setNewStore({ ...newStore, address: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">City *</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={newStore.city_id}
                  onChange={(e) =>
                    setNewStore({ ...newStore, city_id: e.target.value })
                  }
                >
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.city_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Number *</label>
                <Input
                  placeholder="e.g., +94701234567"
                  value={newStore.contact_number}
                  onChange={(e) =>
                    setNewStore({ ...newStore, contact_number: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="e.g., store@example.com"
                  value={newStore.email}
                  onChange={(e) =>
                    setNewStore({ ...newStore, email: e.target.value })
                  }
                />
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
              <Button onClick={handleAddStore} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  "Add Store"
                )}
              </Button>
            </DialogFooter>
          </Dialog>
        </Dialog>
      </Card>
    </div>
  );
};

export default ManageStores;