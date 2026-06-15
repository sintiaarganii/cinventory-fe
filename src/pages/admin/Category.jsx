/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
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
  Box,
} from "lucide-react";
import AdminSidebar from "../../components/sidebar/AdminSidebar";
import api from "../../api/axios";
import Swal from "sweetalert2";

// Lazy load Modal
const CategoryModal = lazy(() => import("./CategoryModal"));

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

const CategoryRow = React.memo(
  ({ item, handleEditCategory, handleDeleteCategory, animateItems, index }) => (
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
      <td className="p-4 font-medium text-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {item.category_name?.charAt(0).toUpperCase()}
          </div>
          {item.category_name}
        </div>
      </td>
      <td className="p-4 text-slate-600 max-w-md truncate">
        {item.description || "-"}
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleEditCategory(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleDeleteCategory(item.id, item.category_name)}
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
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-4 bg-slate-200 rounded w-48"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
        </div>
      </div>
    ))}
  </div>
);

// ==================== MAIN COMPONENT ====================

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);

  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  const [formData, setFormData] = useState({
    category_name: "",
    description: "",
  });

  // =====================
  // FETCH DATA
  // =====================
  const getCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      setAnimateCards(false);
      setAnimateItems(false);

      const response = await api.get("/api/categories", {
        params: { page, limit: 5, search },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCategories(response.data.data || []);
        setTotal(response.data.pagination?.total_items || 0);
        setTotalPages(response.data.pagination?.total_pages || 0);
        setTimeout(() => {
          setAnimateCards(true);
          setAnimateItems(true);
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
      setTotal(0);
      setTotalPages(0);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to fetch categories",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      getCategories();
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    getCategories();
  }, [page]);

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
  // HANDLERS + VALIDATION
  // =====================
  const handleAddCategory = useCallback(() => {
    setEditingCategory(null);
    setFormData({ category_name: "", description: "" });
    setShowModal(true);
  }, []);

  const handleEditCategory = useCallback((category) => {
    setEditingCategory(category);
    setFormData({
      category_name: category.category_name,
      description: category.description || "",
    });
    setShowModal(true);
  }, []);

  const handleDeleteCategory = useCallback(
    async (id, name) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Category "${name}" will be permanently deleted!`,
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
          await api.delete(`/api/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "Category has been deleted.", "success");
          getCategories();
        } catch (error) {
          Swal.fire(
            "Error!",
            error.response?.data?.message || "Failed to delete category",
            "error",
          );
        }
      }
    },
    [getCategories],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        const token = localStorage.getItem("token");

        if (editingCategory) {
          await api.put(
            `/api/categories/${editingCategory.id}`,
            {
              category_name: formData.category_name.trim(),
              description: formData.description.trim(),
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          Swal.fire("Success!", "Category has been updated", "success");
        } else {
          await api.post(
            "/api/categories",
            {
              category_name: formData.category_name.trim(),
              description: formData.description.trim(),
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          Swal.fire("Success!", "Category has been added", "success");
        }

        setShowModal(false);
        getCategories();
      } catch (error) {
        console.error("Error saving category:", error);
        Swal.fire(
          "Error!",
          error.response?.data?.message || "An error occurred",
          "error",
        );
      }
    },
    [formData, editingCategory, getCategories],
  );

  // Stats
  const stats = useMemo(
    () => [
      {
        title: "Total Categories",
        value: total,
        icon: Package,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        title: "Categories",
        value: categories.length,
        icon: Layers,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        title: "Total Products",
        value: 0,
        icon: Box,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
    ],
    [total, categories],
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">Categories</h1>
          <p className="text-slate-500 mt-2">
            Manage product categories in your inventory system
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

        {/* Search and Add Button */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search categories by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            />
          </div>
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
          >
            <Plus size={20} /> Add Category
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
          {loading ? (
            <TableSkeleton />
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Package size={48} className="mb-3 opacity-50" />
              <p className="text-lg">No category data available</p>
              <p className="text-sm mt-1">
                Click "Add Category" button to create one
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
                      Category Name
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Description
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((item, index) => (
                    <CategoryRow
                      key={item.id}
                      item={item}
                      index={index}
                      handleEditCategory={handleEditCategory}
                      handleDeleteCategory={handleDeleteCategory}
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
              Showing {categories.length} of {total} categories
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
          <CategoryModal
            showModal={showModal}
            setShowModal={setShowModal}
            editingCategory={editingCategory}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
              existingCategoryNames={categories.map(cat => cat.category_name)} 
          />
        )}
      </Suspense>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Category;
