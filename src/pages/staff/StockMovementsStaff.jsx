/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Search,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Calendar,
  FileText,
  Box,
  Eye,
  ArrowDownToLine,
  ArrowUpFromLine,
  MoveRight,
  Building,
  Info,
} from "lucide-react";
import StaffSidebar from "../../components/sidebar/StaffSidebar";
import api from "../../api/axios";
import Swal from "sweetalert2";

// ==================== FORMAT DATE TIME WIB (UTC+7) ====================
const formatDateTimeWIB = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  const wibDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(wibDate);
};

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
          {stat.subtitle && (
            <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
          )}
        </div>
      </div>
      <h3 className="mt-6 text-slate-600 font-medium">{stat.title}</h3>
    </div>
  );
});

// ==================== MOVEMENT ITEM ====================
const MovementItem = React.memo(
  ({ movement, index, onViewDetails, animateItems }) => {
    const isInbound = movement.transaction_type === "IN";
    const isOutbound = movement.transaction_type === "OUT";
    const isTransfer = movement.transaction_type === "TRANSFER";

    const getTypeIcon = () => {
      if (isInbound) return <ArrowDownToLine size={12} />;
      if (isOutbound) return <ArrowUpFromLine size={12} />;
      return <MoveRight size={12} />;
    };

    const getTypeColor = () => {
      if (isInbound) return "bg-emerald-100 text-emerald-700";
      if (isOutbound) return "bg-red-100 text-red-700";
      return "bg-blue-100 text-blue-700";
    };

    const getTypeText = () => {
      if (isInbound) return "Stock In";
      if (isOutbound) return "Stock Out";
      return "Transfer";
    };

    const getQuantityColor = () => {
      if (isInbound) return "text-emerald-600";
      if (isOutbound) return "text-red-600";
      return "text-blue-600";
    };

    const getQuantitySign = () => {
      if (isInbound) return "+";
      if (isOutbound) return "-";
      return "→";
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
        onClick={() => onViewDetails(movement)}
      >
        <td className="p-4 text-slate-600">{movement.id}</td>
        <td className="p-4 font-medium text-slate-800">
          <div className="flex items-center gap-2">
            <Box size={16} className="text-slate-400" />
            {movement.product_name}
          </div>
        </td>
        <td className="p-4">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor()}`}
          >
            {getTypeIcon()}
            {getTypeText()}
          </span>
        </td>
        <td className="p-4 text-slate-600">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-slate-400" />
            {movement.reference_code || "-"}
          </div>
        </td>
        <td className="p-4">
          <span className={`font-semibold ${getQuantityColor()}`}>
            {getQuantitySign()}
            {movement.quantity}
          </span>
        </td>
        <td className="p-4 text-slate-600">{movement.from_location || "-"}</td>
        <td className="p-4 text-slate-600">{movement.to_location || "-"}</td>
        <td className="p-4 text-slate-600">
          {formatDateTimeWIB(movement.created_at)}
        </td>
        <td className="p-4">
          <button            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(movement);
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

// ==================== DETAIL MODAL ====================
const DetailModal = React.memo(({ show, onClose, movement }) => {
  if (!show || !movement) return null;

  const isInbound = movement.transaction_type === "IN";
  const isOutbound = movement.transaction_type === "OUT";
  const isTransfer = movement.transaction_type === "TRANSFER";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideInUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Info size={20} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Movement Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition duration-200 hover:rotate-90"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500">Movement ID</p>
              <p className="font-medium text-slate-800">{movement.id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Transaction Type</p>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  isInbound
                    ? "bg-emerald-100 text-emerald-700"
                    : isOutbound
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {isInbound ? "Stock In" : isOutbound ? "Stock Out" : "Transfer"}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Product</p>
              <p className="font-medium text-slate-800">
                {movement.product_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Reference Code</p>
              <p className="font-medium text-slate-800">
                {movement.reference_code || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Quantity</p>
              <p
                className={`font-semibold text-lg ${
                  isInbound
                    ? "text-emerald-600"
                    : isOutbound
                      ? "text-red-600"
                      : "text-blue-600"
                }`}
              >
                {isInbound ? "+" : isOutbound ? "-" : "→"} {movement.quantity}
              </p>
            </div>
            {isTransfer && (
              <>
                <div>
                  <p className="text-sm text-slate-500">From Location</p>
                  <p className="font-medium text-slate-800">
                    {movement.from_location || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">To Location</p>
                  <p className="font-medium text-slate-800">
                    {movement.to_location || "-"}
                  </p>
                </div>
              </>
            )}
            <div>
              <p className="text-sm text-slate-500">Date & Time</p>
              <p className="font-medium text-slate-800">
                {formatDateTimeWIB(movement.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Created By</p>
              <p className="font-medium text-slate-800">
                {movement.created_by || "System"}
              </p>
            </div>
          </div>

          {movement.notes && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">Notes</p>
              <p className="text-slate-700 mt-1">{movement.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ==================== SKELETON LOADER ====================
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="border-b border-slate-100 p-4">
        <div className="flex gap-4">
          <div className="h-4 bg-slate-200 rounded w-12"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-4 bg-slate-200 rounded w-12"></div>
        </div>
      </div>
    ))}
  </div>
);

// ==================== MAIN COMPONENT ====================
const StockMovementsStaff = () => {
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);
  const [summary, setSummary] = useState(null);

  const searchRef = useRef(null);
  let debounceTimer = useRef(null);

  // =====================
  // FETCH SUMMARY
  // =====================
  const fetchSummary = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/stock-movements/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  }, []);

  // =====================
  // FETCH STOCK MOVEMENTS
  // =====================
  const fetchStockMovements = useCallback(async () => {
    try {
      setLoading(true);
      setAnimateCards(false);
      setAnimateItems(false);

      const token = localStorage.getItem("token");

      const params = {
        page: page,
        limit: 5,
        search: search,
        transaction_type: transactionType,
        start_date: dateRange.start,
        end_date: dateRange.end,
      };

      const response = await api.get("/stock-movements", {
        params: params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMovements(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.total_pages || 0);
        setTimeout(() => {
          setAnimateCards(true);
          setAnimateItems(true);
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      if (error.response?.status !== 404) {
        Swal.fire(
          "Error!",
          error.response?.data?.message || "Failed to fetch stock movements",
          "error",
        );
      }
      setMovements([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, transactionType, dateRange]);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchStockMovements();
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    fetchStockMovements();
    fetchSummary();
  }, [page, transactionType, dateRange]);

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setTransactionType("");
    setDateRange({ start: "", end: "" });
    setPage(1);
  };

  // Handle view details
  const handleViewDetails = (movement) => {
    setSelectedMovement(movement);
    setShowDetailModal(true);
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

  // Stats data from summary
  const stats = useMemo(() => {
    if (!summary) {
      return [
        {
          title: "Total Movements",
          value: 0,
          icon: Package,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          title: "Stock In",
          value: 0,
          icon: ArrowDownToLine,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          title: "Stock Out",
          value: 0,
          icon: ArrowUpFromLine,
          color: "text-red-600",
          bg: "bg-red-50",
        },
        {
          title: "Transfers",
          value: 0,
          icon: MoveRight,
          color: "text-purple-600",
          bg: "bg-purple-50",
        },
      ];
    }
    return [
      {
        title: "Total Movements",
        value: summary.total_movements || 0,
        icon: Package,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        title: "Stock In",
        value: summary.total_in || 0,
        subtitle: `${(summary.total_quantity_in || 0).toLocaleString()} units`,
        icon: ArrowDownToLine,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        title: "Stock Out",
        value: summary.total_out || 0,
        subtitle: `${(summary.total_quantity_out || 0).toLocaleString()} units`,
        icon: ArrowUpFromLine,
        color: "text-red-600",
        bg: "bg-red-50",
      },
      {
        title: "Transfers",
        value: summary.total_transfer || 0,
        icon: MoveRight,
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
    ];
  }, [summary]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <StaffSidebar />

      <main className="flex-1 ml-72 p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">Stock Movements</h1>
          <p className="text-slate-500 mt-2">
            Track every activity of goods entering, leaving, or moving within
            your warehouse
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Package size={20} />
            Movement Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                stat={stat}
                animateCards={animateCards}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-50">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by product or reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200"
            />
          </div>

          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="">All Types</option>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
            <option value="TRANSFER">Transfer</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200"
          >
            <Calendar size={18} />
            Date Range
          </button>

          <button
            onClick={resetFilters}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200"
          >
            <X size={18} />
            Reset
          </button>
        </div>

        {/* Date Range Filter */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
          {loading ? (
            <TableSkeleton />
          ) : movements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Package size={48} className="mb-3 opacity-50" />
              <p className="text-lg">No stock movements found</p>
              <p className="text-sm mt-1">
                Try changing your search or filters
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
                      Product
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Type
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Reference
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Qty
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      From
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      To
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Date
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement, index) => (
                    <MovementItem
                      key={movement.id}
                      movement={movement}
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
              Showing {movements.length} of {total} movements
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

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700">
            <Info size={18} />
            <p className="text-sm">
              <span className="font-semibold">Note:</span> Stock movements are
              automatically recorded when goods receipts are approved (Stock In)
              and goods issues are approved (Stock Out).
            </p>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <DetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        movement={selectedMovement}
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default React.memo(StockMovementsStaff);