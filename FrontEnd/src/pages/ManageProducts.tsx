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
  Package,
  Plus,
  Search,
  Trash2,
  Loader2,
  X,
  Filter,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const ManageProducts = ({ isOpen, onClose }) => {
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("");
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    unit_space: "",
    unit_price: "",
    product_type: "",
  });
  const [newType, setNewType] = useState("");

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  // Fetch products and product types
  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      const [productsRes, typesRes] = await Promise.all([
        fetch(`${API_BASE}/products`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_BASE}/product-types`, {
          headers,
          cache: "no-store",
        }),
      ]);

      if (productsRes.status === 401 || typesRes.status === 401) {
        localStorage.removeItem("access_token");
        return;
      }

      if (!productsRes.ok) throw new Error("Failed to fetch products");
      if (!typesRes.ok) throw new Error("Failed to fetch product types");

      const productsData = await productsRes.json();
      const typesData = await typesRes.json();

      setProducts(Array.isArray(productsData) ? productsData : []);
      setProductTypes(Array.isArray(typesData) ? typesData : []);
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

  // Add new product
  const handleAddProduct = async () => {
    if (
      !newProduct.product_name.trim() ||
      !newProduct.unit_space ||
      !newProduct.unit_price ||
      !newProduct.product_type
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          product_name: newProduct.product_name,
          unit_space: parseFloat(newProduct.unit_space),
          unit_price: parseFloat(newProduct.unit_price),
          product_type: newProduct.product_type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add product");
      }

      const result = await response.json();
      setProducts([...products, result]);
      setNewProduct({
        product_name: "",
        unit_space: "",
        unit_price: "",
        product_type: "",
      });
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      console.error("Error adding product:", err);
      setError(err.message || "Error adding product");
    } finally {
      setLoading(false);
    }
  };

  // Add new product type
  const handleAddType = async () => {
    if (!newType.trim()) {
      alert("Please enter a product type");
      return;
    }

    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/product-types`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          type_name: newType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add product type");
      }

      const result = await response.json();
      setProductTypes([...productTypes, result]);
      setNewType("");
      setShowAddTypeModal(false);
      setError(null);
    } catch (err) {
      console.error("Error adding product type:", err);
      setError(err.message || "Error adding product type");
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete product");
      }

      setProducts(products.filter((p) => p.product_id !== productId));
      setError(null);
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err.message || "Error deleting product");
    } finally {
      setLoading(false);
    }
  };

  // Filter and search products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.product_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.product_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      !selectedTypeFilter || product.product_type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Manage Products
            </CardTitle>
            <CardDescription>Add and manage inventory products</CardDescription>
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

          {/* Product Types Section */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-900">Product Types</h3>
              <Button
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setShowAddTypeModal(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Type
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {productTypes.length === 0 ? (
                <p className="text-sm text-blue-700">
                  No product types added yet
                </p>
              ) : (
                productTypes.map((type) => (
                  <Badge key={type.id} variant="outline" className="bg-white">
                    {type.type_name || type.name}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 bg-background text-sm"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {productTypes.map((type) => (
                <option key={type.id} value={type.type_name || type.name}>
                  {type.type_name || type.name}
                </option>
              ))}
            </select>
            <Button
              className="flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>

          {/* Products Table */}
          {loading && !showAddModal ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {products.length === 0
                ? "No products added yet"
                : "No products match your search"}
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">
                      Product Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Unit Space
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.product_id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">
                        {product.product_name}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {product.product_type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {parseFloat(product.unit_space).toFixed(2)} m³
                      </td>
                      <td className="px-4 py-3 text-right">
                        Rs. {parseFloat(product.unit_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() =>
                              handleDeleteProduct(product.product_id)
                            }
                            className="p-2 hover:bg-red-100 rounded-md text-red-600 transition-colors"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {/* Add Product Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  placeholder="e.g., Rice"
                  value={newProduct.product_name}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      product_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit Space (m³) *</label>
                <Input
                  type="number"
                  placeholder="e.g., 0.5"
                  step="0.01"
                  value={newProduct.unit_space}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, unit_space: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit Price (Rs.) *</label>
                <Input
                  type="number"
                  placeholder="e.g., 150.00"
                  step="0.01"
                  value={newProduct.unit_price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, unit_price: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Type *</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={newProduct.product_type}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      product_type: e.target.value,
                    })
                  }
                >
                  <option value="">Select a type</option>
                  {productTypes.map((type) => (
                    <option key={type.id} value={type.type_name || type.name}>
                      {type.type_name || type.name}
                    </option>
                  ))}
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
              <Button onClick={handleAddProduct} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Product Type Modal */}
        <Dialog open={showAddTypeModal} onOpenChange={setShowAddTypeModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type Name *</label>
                <Input
                  placeholder="e.g., Grains"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddTypeModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleAddType} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  "Add Type"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};

export default ManageProducts;