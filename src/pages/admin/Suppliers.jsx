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
  Truck,
  Phone,
  Mail,
  MapPin,
  User,
  Hash,
  CheckCircle,
  XCircle,
} from "lucide-react";
import AdminSidebar from "../../components/sidebar/AdminSidebar";
import api from "../../api/axios";
import Swal from "sweetalert2";

// Lazy load Modal
const SupplierModal = lazy(() => import("./SupplierModal"));

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

const SupplierRow = React.memo(
  ({ item, handleEditSupplier, handleDeleteSupplier, animateItems, index }) => (
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
          {item.supplier_code}
        </span>
      </td>
      <td className="p-4 font-medium text-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {item.supplier_name?.charAt(0).toUpperCase()}
          </div>
          {item.supplier_name}
        </div>
      </td>
      <td className="p-4 text-slate-600">{item.contact_person || "-"}</td>
      <td className="p-4 text-slate-600">{item.phone || "-"}</td>
      <td className="p-4">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            item.status === "active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.status === "active" ? (
            <CheckCircle size={12} />
          ) : (
            <XCircle size={12} />
          )}
          {item.status === "active" ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleEditSupplier(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleDeleteSupplier(item.id, item.supplier_name)}
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
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
        </div>
      </div>
    ))}
  </div>
);

// ==================== MAIN COMPONENT ====================

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);

  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  const [formData, setFormData] = useState({
    supplier_code: "",
    supplier_name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    status: "active",
  });

  // =====================
  // FETCH SUPPLIERS
  // =====================
  const getSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAnimateCards(false);
      setAnimateItems(false);

      const token = localStorage.getItem("token");
      const response = await api.get("/suppliers", {
        params: { page, limit: 5, search },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSuppliers(response.data.data || response.data.suppliers || []);
        setTotal(response.data.total || 0);
        setTotalPages(
          response.data.total_pages ||
            Math.ceil((response.data.total || 0) / 5),
        );
        setTimeout(() => {
          setAnimateCards(true);
          setAnimateItems(true);
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError("Failed to load supplier data");
      setSuppliers([]);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to fetch suppliers",
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
      getSuppliers();
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    getSuppliers();
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
  // HANDLERS
  // =====================
  const generateCode = useCallback(() => {
    const prefix = "SUP";
    const randomNum = Math.floor(Math.random() * 10000);
    const code = `${prefix}${randomNum.toString().padStart(4, "0")}`;
    setFormData((prev) => ({ ...prev, supplier_code: code }));
  }, []);

  const handleAddSupplier = useCallback(() => {
    setEditingSupplier(null);
    setFormData({
      supplier_code: "",
      supplier_name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      status: "active",
    });
    setShowModal(true);
  }, []);

  const handleEditSupplier = useCallback((supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      supplier_code: supplier.supplier_code,
      supplier_name: supplier.supplier_name,
      contact_person: supplier.contact_person || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      status: supplier.status || "active",
    });
    setShowModal(true);
  }, []);

  // =====================
  // HANDLE DELETE
  // =====================
  const handleDeleteSupplier = useCallback(
    async (id, name) => {
      // Check if supplier is used in products first
      try {
        const token = localStorage.getItem("token");

        const result = await Swal.fire({
          title: "Are you sure?",
          text: `Supplier "${name}" will be permanently deleted!`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#ef4444",
          cancelButtonColor: "#64748b",
          confirmButtonText: "Yes, Delete!",
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          try {
            await api.delete(`/suppliers/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Swal.fire("Deleted!", "Supplier has been deleted.", "success");
            getSuppliers();
          } catch (error) {
            const errorMessage =
              error.response?.data?.message || "Failed to delete supplier";
            Swal.fire("Cannot Delete!", errorMessage, "error");
          }
        }
      } catch (error) {
        console.error("Error checking supplier usage:", error);
        Swal.fire("Error!", "Failed to check supplier status", "error");
      }
    },
    [getSuppliers],
  );

  // ==================== VALIDATION ====================
  const validateForm = () => {
    if (!formData.supplier_name.trim()) {
      Swal.fire("Warning", "Supplier name is required", "warning");
      return false;
    }
    if (formData.supplier_name.trim().length < 2) {
      Swal.fire(
        "Warning",
        "Supplier name must be at least 2 characters",
        "warning",
      );
      return false;
    }

    if (!editingSupplier && !formData.supplier_code.trim()) {
      Swal.fire("Warning", "Supplier code is required", "warning");
      return false;
    }
    if (!editingSupplier && formData.supplier_code.trim().length < 3) {
      Swal.fire(
        "Warning",
        "Supplier code must be at least 3 characters",
        "warning",
      );
      return false;
    }

    if (!formData.contact_person.trim()) {
      Swal.fire("Warning", "Contact person is required", "warning");
      return false;
    }
    if (formData.contact_person.trim().length < 2) {
      Swal.fire(
        "Warning",
        "Contact person must be at least 2 characters",
        "warning",
      );
      return false;
    }

    if (!formData.phone.trim()) {
      Swal.fire("Warning", "Phone number is required", "warning");
      return false;
    }
    if (formData.phone.trim().length < 8) {
      Swal.fire(
        "Warning",
        "Phone number must be at least 8 characters",
        "warning",
      );
      return false;
    }

    if (!formData.email.trim()) {
      Swal.fire("Warning", "Email is required", "warning");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire("Warning", "Please enter a valid email address", "warning");
      return false;
    }

    if (!formData.address.trim()) {
      Swal.fire("Warning", "Address is required", "warning");
      return false;
    }
    if (formData.address.trim().length < 5) {
      Swal.fire("Warning", "Address must be at least 5 characters", "warning");
      return false;
    }

    return true;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const payload = {
          supplier_name: formData.supplier_name.trim(),
          contact_person: formData.contact_person.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          status: formData.status,
        };

        if (editingSupplier) {
          const response = await api.put(
            `/suppliers/${editingSupplier.id}`,
            payload,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (response.data.success) {
            Swal.fire("Success!", "Supplier has been updated", "success");
            setShowModal(false);
            getSuppliers();
          }
        } else {
          await api.post(
            "/suppliers",
            { ...payload, supplier_code: formData.supplier_code },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          Swal.fire("Success!", "Supplier has been added", "success");
          setShowModal(false);
          getSuppliers();
        }
      } catch (error) {
        console.error("Error saving supplier:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to save supplier";
        Swal.fire("Error!", errorMessage, "error");
      }
    },
    [formData, editingSupplier, getSuppliers],
  );

  // Stats
  const stats = useMemo(
    () => [
      {
        title: "Total Suppliers",
        value: total,
        icon: Truck,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        title: "Active Suppliers",
        value: suppliers.filter((s) => s.status === "active").length,
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        title: "Inactive Suppliers",
        value: suppliers.filter((s) => s.status === "inactive").length,
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
      },
    ],
    [total, suppliers],
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">Suppliers</h1>
          <p className="text-slate-500 mt-2">
            Manage supplier data in your inventory system
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
              placeholder="Search suppliers by name, contact person, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            />
          </div>
          <button
            onClick={handleAddSupplier}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
          >
            <Plus size={20} /> Add Supplier
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
          {loading ? (
            <TableSkeleton />
          ) : suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Truck size={48} className="mb-3 opacity-50" />
              <p className="text-lg">No supplier data available</p>
              <p className="text-sm mt-1">
                Click "Add Supplier" button to create one
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
                      Supplier Name
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Contact Person
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Phone
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Status
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((item, index) => (
                    <SupplierRow
                      key={item.id}
                      item={item}
                      index={index}
                      handleEditSupplier={handleEditSupplier}
                      handleDeleteSupplier={handleDeleteSupplier}
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
              Showing {suppliers.length} of {total} suppliers
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
          <SupplierModal
            showModal={showModal}
            setShowModal={setShowModal}
            editingSupplier={editingSupplier}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            generateCode={generateCode}
            existingSupplierNames={suppliers.map((s) => s.supplier_name)} 
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

export default Suppliers;
