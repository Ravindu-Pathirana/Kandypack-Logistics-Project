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
  MapPin,
  Plus,
  Search,
  Trash2,
  Edit2,
  Loader2,
  X,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const ManageCities = ({ isOpen, onClose }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCity, setNewCity] = useState({
    city_name: "",
    state: "",
    country: "Sri Lanka",
  });

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  // Fetch cities
  const fetchCities = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/cities`, {
        headers,
        cache: "no-store",
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch cities");

      const data = await response.json();
      setCities(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching cities:", err);
      setError(err.message || "Error fetching cities");
    } finally {
      setLoading(false);
    }
  };

  // Load cities on component mount
  useEffect(() => {
    if (isOpen) {
      fetchCities();
    }
  }, [isOpen]);

  // Add new city
  const handleAddCity = async () => {
    if (!newCity.city_name.trim() || !newCity.state.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/cities`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          city_name: newCity.city_name,
          state: newCity.state,
          country: newCity.country,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add city");
      }

      const result = await response.json();
      setCities([...cities, result]);
      setNewCity({ city_name: "", state: "", country: "Sri Lanka" });
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      console.error("Error adding city:", err);
      setError(err.message || "Error adding city");
    } finally {
      setLoading(false);
    }
  };

  // Delete city
  const handleDeleteCity = async (cityId) => {
    if (!window.confirm("Are you sure you want to delete this city?")) return;

    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/cities/${cityId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete city");
      }

      setCities(cities.filter((c) => c.id !== cityId));
      setError(null);
    } catch (err) {
      console.error("Error deleting city:", err);
      setError(err.message || "Error deleting city");
    } finally {
      setLoading(false);
    }
  };

  // Filter cities based on search
  const filteredCities = cities.filter((city) =>
    city.city_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Manage Cities
            </CardTitle>
            <CardDescription>Add and manage delivery cities</CardDescription>
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
                placeholder="Search cities..."
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
              Add City
            </Button>
          </div>

          {/* Cities List */}
          {loading && !showAddModal ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {cities.length === 0 ? "No cities added yet" : "No cities match your search"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCities.map((city) => (
                <div
                  key={city.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">{city.city_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {city.state}, {city.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteCity(city.id)}
                      className="p-2 hover:bg-red-100 rounded-md text-red-600 transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Add City Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New City</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">City Name *</label>
                <Input
                  placeholder="e.g., Colombo"
                  value={newCity.city_name}
                  onChange={(e) =>
                    setNewCity({ ...newCity, city_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State/Province *</label>
                <Input
                  placeholder="e.g., Western"
                  value={newCity.state}
                  onChange={(e) =>
                    setNewCity({ ...newCity, state: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input
                  placeholder="e.g., Sri Lanka"
                  value={newCity.country}
                  onChange={(e) =>
                    setNewCity({ ...newCity, country: e.target.value })
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
              <Button onClick={handleAddCity} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  "Add City"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};

export default ManageCities;
