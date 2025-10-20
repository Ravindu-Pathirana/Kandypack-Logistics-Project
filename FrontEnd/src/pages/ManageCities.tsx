import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { MapPin, Plus, Search, Loader2, ArrowLeft } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const ManageCities = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCityName, setNewCityName] = useState("");

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
    if (!newCityName.trim()) {
      alert("Please enter a city name");
      return;
    }

    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/cities`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          city_name: newCityName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add city");
      }

      const result = await response.json();
      setCities([...cities, result]);
      setNewCityName("");
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      console.error("Error adding city:", err);
      setError(err.message || "Error adding city");
    } finally {
      setLoading(false);
    }
  };

  // Delete action removed per request

  // Filter cities based on search
  const filteredCities = cities.filter((city) =>
    city.city_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="h-8 px-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="text-center flex-1">
              <CardTitle className="flex items-center justify-center gap-2">
                <MapPin className="h-5 w-5" />
                Manage Cities
              </CardTitle>
              <CardDescription>Add and manage cities</CardDescription>
            </div>
            <div className="w-[72px]" />
          </div>
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

          {/* Cities List */
          }
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
                  key={city.city_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">{city.city_name}</p>
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
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
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
