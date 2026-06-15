/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertCircle,
  Layers,
  Filter,
} from "lucide-react";
import AdminSidebar from "../../components/sidebar/AdminSidebar";
import api from "../../api/axios";
import Swal from "sweetalert2";

// Lazy Loading Modal
const ProductModal = lazy(() => import("./ProductModal"));

// ==================== MEMOIZED COMPONENTS ====================

const StatCard = React.memo(({ stat, index, animateCards }) => {
  const Icon = stat.icon;
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${
        animateCards ? "animate-fadeInUp" : "opacity-0"
      }`}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: "forwards",
      }}
    >
      <div className="flex items-center justify-between">
        <div className={`${stat.bg} p-3 rounded-xl`}>
          <Icon className={`w-8 h-8 ${stat.color}`} />
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-slate-800 tracking-tight">
            {stat.value?.toLocaleString() || "0"}
          </p>
        </div>
      </div>
      <h3 className="mt-6 text-slate-600 font-medium">{stat.title}</h3>
    </div>
  );
});

const ProductRow = React.memo(
  ({ item, handleEditProduct, handleDeleteProduct, animateItems, index }) => (
    <tr
      className={`border-b border-slate-100 hover:bg-slate-50 transition-all duration-200 ${
        animateItems ? "animate-fadeInUp" : "opacity-0"
      }`}
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "forwards",
      }}
    >
      <td className="p-4 text-slate-600">{item.id}</td>
      <td className="p-4">
        <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-600">
          {item.product_code}
        </span>
      </td>
      <td className="p-4 font-medium text-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {item.product_name?.charAt(0).toUpperCase()}
          </div>
          {item.product_name}
        </div>
      </td>
      <td className="p-4 text-slate-600">{item.category_name}</td>
      <td className="p-4 text-slate-600">{item.supplier_name}</td>
      <td className="p-4 text-slate-600">{item.location_name}</td>
      <td className="p-4">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            item.stock <= item.minimum_stock
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {item.stock} {item.unit}
        </span>
      </td>
      <td className="p-4 text-slate-600">
        {item.minimum_stock} {item.unit}
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleEditProduct(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleDeleteProduct(item.id, item.product_name)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  ),
);

// ==================== SKELETON LOADER ====================
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="border-b border-slate-100 p-4">
        <div className="flex gap-4">
          <div className="h-4 bg-slate-200 rounded w-12"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-4 bg-slate-200 rounded w-28"></div>
          <div className="h-4 bg-slate-200 rounded w-28"></div>
          <div className="h-4 bg-slate-200 rounded w-28"></div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
        </div>
      </div>
    ))}
  </div>
);

// ==================== MAIN COMPONENT ====================

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category_id: "",
    supplier_id: "",
    location_id: "",
    low_stock: "",
  });

  // Dropdown data
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);

  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  const [formData, setFormData] = useState({
    product_code: "",
    product_name: "",
    category_id: "",
    supplier_id: "",
    location_id: "",
    stock: 0,
    minimum_stock: 0,
    unit: "pcs",
    description: "",
  });

  // =====================
  // FETCH DROPDOWN DATA
  // =====================
  const fetchDropdownData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch categories (semua, karena tidak punya status)
      const categoriesRes = await api.get("/api/categories", {
        params: { limit: 100 },
        headers,
      });

      // Fetch ACTIVE suppliers only
      const suppliersRes = await api.get("/suppliers/active", {
        headers,
      });

      // Fetch ACTIVE locations only
      const locationsRes = await api.get("/locations/active", {
        headers,
      });

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data || []);
      }
      if (suppliersRes.data.success) {
        setSuppliers(suppliersRes.data.data || []);
      }
      if (locationsRes.data.success) {
        setLocations(locationsRes.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  }, []);

  // =====================
  // FETCH PRODUCTS
  // =====================
  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      setAnimateCards(false);
      setAnimateItems(false);

      const token = localStorage.getItem("token");

      const params = {
        page,
        limit: 5,
        search,
        category_id: filters.category_id,
        supplier_id: filters.supplier_id,
        location_id: filters.location_id,
        low_stock: filters.low_stock,
      };

      const response = await api.get("/products", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setProducts(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.total_pages || 0);
        setTimeout(() => {
          setAnimateCards(true);
          setAnimateItems(true);
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to fetch products",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      getProducts();
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    getProducts();
  }, [page, filters]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
      } else if (page >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = page - 2; i <= page + 2; i++) {
          pages.push(i);
        }
      }
    }
    return pages;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // =====================
  // STATS
  // =====================
  const stats = useMemo(
    () => [
      {
        title: "Total Products",
        value: total,
        icon: Package,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        title: "Low Stock",
        value: products.filter((p) => p.stock <= p.minimum_stock).length,
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-50",
      },
      {
        title: "Categories",
        value: categories.length,
        icon: Layers,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
    ],
    [total, products, categories],
  );

  // =====================
  // HANDLERS
  // =====================
  const generateCode = useCallback(() => {
    const prefix = "PRD";
    const randomNum = Math.floor(Math.random() * 10000);
    const code = `${prefix}${randomNum.toString().padStart(4, "0")}`;
    setFormData((prev) => ({ ...prev, product_code: code }));
  }, []);

  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setFormData({
      product_code: "",
      product_name: "",
      category_id: "",
      supplier_id: "",
      location_id: "",
      stock: 0,
      minimum_stock: 0,
      unit: "pcs",
      description: "",
    });
    setShowModal(true);
  }, []);

  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setFormData({
      product_code: product.product_code,
      product_name: product.product_name,
      category_id: product.category_id,
      supplier_id: product.supplier_id,
      location_id: product.location_id,
      stock: product.stock,
      minimum_stock: product.minimum_stock,
      unit: product.unit || "pcs",
      description: product.description || "",
    });
    setShowModal(true);
  }, []);

  const handleDeleteProduct = useCallback(
    async (id, name) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Product "${name}" will be permanently deleted!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await api.delete(`/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "Product has been deleted.", "success");
          getProducts();
        } catch (error) {
          Swal.fire(
            "Error!",
            error.response?.data?.message || "Failed to delete product",
            "error",
          );
        }
      }
    },
    [getProducts],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!formData.product_name.trim()) {
        Swal.fire("Warning", "Product name is required", "warning");
        return;
      }
      if (
        !formData.category_id ||
        !formData.supplier_id ||
        !formData.location_id
      ) {
        Swal.fire(
          "Warning",
          "Category, Supplier, and Location are required",
          "warning",
        );
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const payload = {
          product_name: formData.product_name,
          category_id: parseInt(formData.category_id),
          supplier_id: parseInt(formData.supplier_id),
          location_id: parseInt(formData.location_id),
          stock: parseInt(formData.stock),
          minimum_stock: parseInt(formData.minimum_stock),
          unit: formData.unit,
          description: formData.description,
        };

        if (editingProduct) {
          await api.put(`/products/${editingProduct.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Success!", "Product has been updated", "success");
        } else {
          if (!formData.product_code) {
            Swal.fire("Warning", "Product code is required", "warning");
            return;
          }
          await api.post(
            "/products",
            { ...payload, product_code: formData.product_code },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          Swal.fire("Success!", "Product has been added", "success");
        }

        setShowModal(false);
        getProducts();
      } catch (error) {
        console.error("Error saving product:", error);
        Swal.fire(
          "Error!",
          error.response?.data?.message || "An error occurred",
          "error",
        );
      }
    },
    [formData, editingProduct, getProducts],
  );

  const resetFilters = useCallback(() => {
    setFilters({
      category_id: "",
      supplier_id: "",
      location_id: "",
      low_stock: "",
    });
    setPage(1);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">Products</h1>
          <p className="text-slate-500 mt-2">
            Manage products in your inventory system
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              stat={stat}
              index={index}
              animateCards={animateCards}
            />
          ))}
        </div>

        {/* Search, Filter and Add Button */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200"
            >
              <Filter size={20} /> Filter
            </button>
            <button
              onClick={handleAddProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Plus size={20} /> Add Product
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={filters.category_id}
                  onChange={(e) =>
                    setFilters({ ...filters, category_id: e.target.value })
                  }
                  className="border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.supplier_id}
                  onChange={(e) =>
                    setFilters({ ...filters, supplier_id: e.target.value })
                  }
                  className="border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.supplier_name}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.location_id}
                  onChange={(e) =>
                    setFilters({ ...filters, location_id: e.target.value })
                  }
                  className="border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.location_name}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.low_stock}
                  onChange={(e) =>
                    setFilters({ ...filters, low_stock: e.target.value })
                  }
                  className="border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Stock</option>
                  <option value="true">Low Stock</option>
                </select>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 transition"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
          {loading ? (
            <TableSkeleton />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Package size={48} className="mb-3 opacity-50" />
              <p className="text-lg">No product data available</p>
              <p className="text-sm mt-1">
                Click "Add Product" button to create one
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      ID
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Code
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Product Name
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Category
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Supplier
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Location
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Stock
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Min Stock
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item, index) => (
                    <ProductRow
                      key={item.id}
                      item={item}
                      index={index}
                      handleEditProduct={handleEditProduct}
                      handleDeleteProduct={handleDeleteProduct}
                      animateItems={animateItems}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-slate-500">
              Showing {products.length} of {total} products
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                  page === 1
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Prev
              </button>
              <div className="flex gap-1">
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                      page === pageNum
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                  page === totalPages
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Lazy Modal */}
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        }
      >
        {showModal && (
          <ProductModal
            showModal={showModal}
            setShowModal={setShowModal}
            editingProduct={editingProduct}
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            suppliers={suppliers}
            locations={locations}
            handleSubmit={handleSubmit}
            generateCode={generateCode}
            existingProductNames={products.map(p => p.product_name)} 
          />
        )}
      </Suspense>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Products;
