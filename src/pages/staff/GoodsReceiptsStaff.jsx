/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Search,
  Plus,
  X,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  FileText,
  Building,
  ArrowDownToLine,
  Trash2,
  Hash,
  Box,
} from "lucide-react";
import StaffSidebar from "../../components/sidebar/StaffSidebar";
import api from "../../api/axios";
import Swal from "sweetalert2";
import GoodsReceiptsStaffModal from "./GoodsReceiptsStaffModal";

// ==================== STAT CARD COMPONENT ====================
const StatCard = React.memo(({ stat, animateCards, index }) => {
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

// ==================== RECEIPT ROW ====================
const ReceiptRow = React.memo(
  ({ item, index, onViewDetails, animateItems }) => {
    const getStatusBadge = (status) => {
      switch (status) {
        case "Approved":
          return "bg-emerald-100 text-emerald-700";
        case "Pending":
          return "bg-amber-100 text-amber-700";
        case "Rejected":
          return "bg-red-100 text-red-700";
        default:
          return "bg-slate-100 text-slate-700";
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case "Approved":
          return <CheckCircle size={12} />;
        case "Pending":
          return <AlertCircle size={12} />;
        case "Rejected":
          return <XCircle size={12} />;
        default:
          return null;
      }
    };

    return (
      <tr
        className={`border-b border-slate-100 hover:bg-slate-50 transition-all duration-200 cursor-pointer ${
          animateItems ? "animate-fadeInUp" : "opacity-0"
        }`}
        style={{
          animationDelay: `${index * 50}ms`,
          animationFillMode: "forwards",
        }}
        onClick={() => onViewDetails(item)}
      >
        <td className="p-4 text-slate-600">{item.id}</td>
        <td className="p-4 font-medium text-slate-800">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-400" />
            {item.receipt_code}
          </div>
        </td>
        <td className="p-4 text-slate-600">
          <div className="flex items-center gap-2">
            <Building size={14} className="text-slate-400" />
            {item.supplier_name}
          </div>
        </td>
        <td className="p-4 text-slate-600">
          {new Date(item.receipt_date).toLocaleDateString("en-GB")}
        </td>
        <td className="p-4">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}
          >
            {getStatusIcon(item.status)}
            {item.status}
          </span>
        </td>
        <td className="p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(item);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition duration-200 hover:scale-110"
            title="View Details"
          >
            <Eye size={18} />
          </button>
        </td>
      </tr>
    );
  },
);

// ==================== SKELETON LOADER ====================
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="border-b border-slate-100 p-4">
        <div className="flex gap-4">
          <div className="h-4 bg-slate-200 rounded w-12"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-4 bg-slate-200 rounded w-40"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-4 bg-slate-200 rounded w-12"></div>
        </div>
      </div>
    ))}
  </div>
);

// ==================== MAIN COMPONENT ====================
const GoodsReceiptsStaff = () => {
  const [receipts, setReceipts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);

  // Dropdown data
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [existingCodes, setExistingCodes] = useState([]);

  const searchRef = useRef(null);
  let debounceTimer = useRef(null);

  // =====================
  // FETCH DROPDOWN DATA
  // =====================
  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem("token");

      const suppliersRes = await api.get("/suppliers", {
        params: { limit: 100 },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (suppliersRes.data.success) {
        setSuppliers(
          suppliersRes.data.data || suppliersRes.data.suppliers || [],
        );
      }

      const productsRes = await api.get("/products", {
        params: { limit: 100 },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (productsRes.data.success) {
        setProducts(productsRes.data.data || []);
      }

      const receiptsRes = await api.get("/goods-receipts", {
        params: { limit: 1000 },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (receiptsRes.data.success) {
        const codes = receiptsRes.data.data.map((r) => r.receipt_code);
        setExistingCodes(codes);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  // =====================
  // FETCH RECEIPTS
  // =====================
  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      setAnimateCards(false);
      setAnimateItems(false);

      const token = localStorage.getItem("token");

      const params = {
        page: page,
        limit: 5,
        search: search,
        status: status,
        supplier_id: supplierId,
      };

      const response = await api.get("/goods-receipts", {
        params: params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setReceipts(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.total_pages || 0);
        setTimeout(() => {
          setAnimateCards(true);
          setAnimateItems(true);
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching receipts:", error);
      if (error.response?.status !== 404) {
        Swal.fire(
          "Error!",
          error.response?.data?.message || "Failed to fetch receipts",
          "error",
        );
      }
      setReceipts([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, supplierId]);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchReceipts();
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    fetchReceipts();
  }, [page, status, supplierId]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // =====================
  // HANDLE VIEW DETAILS
  // =====================
  const handleViewDetails = (receipt) => {
    setSelectedReceipt(receipt);
    setModalMode("detail");
    setShowModal(true);
  };

  // =====================
  // HANDLE CREATE
  // =====================
  const handleCreate = () => {
    setSelectedReceipt(null);
    setModalMode("create");
    setShowModal(true);
  };

  // =====================
  // REFRESH DATA AFTER MODAL CLOSE
  // =====================
  const handleModalClose = () => {
    setShowModal(false);
    fetchReceipts();
    fetchDropdownData();
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setSupplierId("");
    setPage(1);
  };

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

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Stats data
  const stats = [
    {
      title: "Total Receipts",
      value: total,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Pending",
      value: receipts.filter((r) => r.status === "Pending").length,
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Approved",
      value: receipts.filter((r) => r.status === "Approved").length,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Rejected",
      value: receipts.filter((r) => r.status === "Rejected").length,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <StaffSidebar />

      <main className="flex-1 ml-72 p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">Goods Receipts</h1>
          <p className="text-slate-500 mt-2">
            View and manage incoming goods receipts
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              stat={stat}
              animateCards={animateCards}
              index={index}
            />
          ))}
        </div>

        {/* Search, Filter and Add Button */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by receipt code or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.supplier_name}
              </option>
            ))}
          </select>
          <button
            onClick={resetFilters}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200"
          >
            <X size={18} />
            Reset
          </button>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105"
          >
            <Plus size={20} />
            Create Receipt
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
          {loading ? (
            <TableSkeleton />
          ) : receipts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Package size={48} className="mb-3 opacity-50" />
              <p className="text-lg">No goods receipts found</p>
              <p className="text-sm mt-1">Click "Create Receipt" to add one</p>
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
                      Receipt Code
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Supplier
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Date
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
                  {receipts.map((item, index) => (
                    <ReceiptRow
                      key={item.id}
                      item={item}
                      index={index}
                      onViewDetails={handleViewDetails}
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
              Showing {receipts.length} of {total} receipts
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

      {/* Modal */}
      <GoodsReceiptsStaffModal
        show={showModal}
        onClose={handleModalClose}
        mode={modalMode}
        receipt={selectedReceipt}
        suppliers={suppliers}
        products={products}
        existingCodes={existingCodes}
      />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default React.memo(GoodsReceiptsStaff);
