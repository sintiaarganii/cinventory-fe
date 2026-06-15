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
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Calendar,
  FileText,
  ArrowDownToLine,
  ArrowUpFromLine,
  Box,
  Filter,
} from "lucide-react";
import ManagerSidebar from "../../components/sidebar/ManagerSidebar";
import api from "../../api/axios";
import Swal from "sweetalert2";

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
const ReceiptRow = React.memo(({ item, index, animateItems }) => {
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
          <FileText size={16} className="text-slate-400" />
          {item.receipt_code}
        </div>
      </td>
      <td className="p-4 text-slate-600">{item.supplier_name}</td>
      <td className="p-4">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}
        >
          {getStatusIcon(item.status)}
          {item.status}
        </span>
      </td>
      <td className="p-4 text-slate-600">
        {new Date(item.created_at).toLocaleDateString("en-GB")}
      </td>
    </tr>
  );
});

// ==================== ISSUE ROW ====================
const IssueRow = React.memo(({ item, index, animateItems }) => {
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
          <FileText size={16} className="text-slate-400" />
          {item.issue_code}
        </div>
      </td>
      <td className="p-4 text-slate-600">{item.destination}</td>
      <td className="p-4">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}
        >
          {getStatusIcon(item.status)}
          {item.status}
        </span>
      </td>
      <td className="p-4 text-slate-600">
        {new Date(item.created_at).toLocaleDateString("en-GB")}
      </td>
    </tr>
  );
});

// ==================== STOCK ROW ====================
const StockRow = React.memo(({ item, index, animateItems }) => {
  const isLowStock = item.stock <= item.minimum_stock;

  return (
    <tr
      className={`border-b border-slate-100 hover:bg-slate-50 transition-all duration-200 ${
        animateItems ? "animate-fadeInUp" : "opacity-0"
      }`}
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "forwards",
      }}
    >
      <td className="p-4 text-slate-600">{index + 1}</td>
      <td className="p-4 font-mono text-slate-600">{item.product_code}</td>
      <td className="p-4 font-medium text-slate-800">{item.product_name}</td>
      <td className="p-4">
        <span
          className={`font-semibold ${isLowStock ? "text-red-600" : "text-emerald-600"}`}
        >
          {item.stock}
        </span>
      </td>
      <td className="p-4 text-slate-600">{item.minimum_stock}</td>
      <td className="p-4">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            isLowStock
              ? "bg-red-100 text-red-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {isLowStock ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
          {isLowStock ? "Low Stock" : "OK"}
        </span>
      </td>
    </tr>
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
          <div className="h-4 bg-slate-200 rounded w-40"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
        </div>
      </div>
    ))}
  </div>
);

// ==================== MAIN COMPONENT ====================
const ReportsManager = () => {
  const [activeTab, setActiveTab] = useState("receipts");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lowStock, setLowStock] = useState(false);

  const searchRef = useRef(null);
  let debounceTimer = useRef(null);

  // =====================
  // FETCH REPORT DATA
  // =====================
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setAnimateCards(false);
      setAnimateItems(false);

      const token = localStorage.getItem("token");
      let endpoint = "";
      let params = {
        page: page,
        limit: 5,
      };

      switch (activeTab) {
        case "receipts":
          endpoint = "/reports/goods-receipts";
          params.search = search;
          params.status = status;
          params.start_date = startDate;
          params.end_date = endDate;
          break;
        case "issues":
          endpoint = "/reports/goods-issues";
          params.search = search;
          params.status = status;
          params.start_date = startDate;
          params.end_date = endDate;
          break;
        case "stock":
          endpoint = "/reports/stock";
          params.search = search;
          params.low_stock = lowStock;
          break;
      }

      const response = await api.get(endpoint, {
        params: params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setData(response.data.data || []);
        setTotal(response.data.total_data || 0);
        setTotalPages(response.data.total_pages || 0);
        setTimeout(() => {
          setAnimateCards(true);
          setAnimateItems(true);
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      if (error.response?.status !== 404) {
        Swal.fire(
          "Error!",
          error.response?.data?.message || "Failed to fetch report data",
          "error",
        );
      }
      setData([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, startDate, endDate, lowStock, activeTab]);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchReportData();
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    fetchReportData();
  }, [page, status, startDate, endDate, lowStock, activeTab]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearch("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setLowStock(false);
    setPage(1);
  }, []);

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

  // Tab configuration
  const tabs = [
    { id: "receipts", label: "Goods Receipts", icon: ArrowDownToLine },
    { id: "issues", label: "Goods Issues", icon: ArrowUpFromLine },
    { id: "stock", label: "Stock Report", icon: Package },
  ];

  // Stats data
  const stats = useMemo(() => {
    if (activeTab === "stock") {
      const lowStockCount = data.filter(
        (item) => item.stock <= item.minimum_stock,
      ).length;
      const okStockCount = data.filter(
        (item) => item.stock > item.minimum_stock,
      ).length;

      return [
        {
          title: "Total Products",
          value: total,
          icon: Package,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          title: "Low Stock",
          value: lowStockCount,
          icon: AlertCircle,
          color: "text-red-600",
          bg: "bg-red-50",
        },
        {
          title: "OK Stock",
          value: okStockCount,
          icon: CheckCircle,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
      ];
    }

    const approved = data.filter((item) => item.status === "Approved").length;
    const pending = data.filter((item) => item.status === "Pending").length;
    const rejected = data.filter((item) => item.status === "Rejected").length;

    return [
      {
        title: "Total",
        value: total,
        icon: FileText,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        title: "Approved",
        value: approved,
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        title: "Pending",
        value: pending,
        icon: AlertCircle,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        title: "Rejected",
        value: rejected,
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
      },
    ];
  }, [data, total, activeTab]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <ManagerSidebar />

      <main className="flex-1 ml-72 p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">Reports</h1>
          <p className="text-slate-500 mt-2">
            View inventory reports and transaction history
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

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                    resetFilters();
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 border-t border-l border-r border-slate-200 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                ref={searchRef}
                type="text"
                placeholder={
                  activeTab === "stock"
                    ? "Search by product code or name..."
                    : "Search by code or name..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200"
              />
            </div>

            {activeTab !== "stock" && (
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
            )}

            {activeTab === "stock" && (
              <label className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all duration-200">
                <input
                  type="checkbox"
                  checked={lowStock}
                  onChange={(e) => setLowStock(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-slate-700 text-sm">Low Stock Only</span>
              </label>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200"
            >
              <Calendar size={18} />
              Date Filter
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
          {showFilters && activeTab !== "stock" && (
            <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
          {loading ? (
            <TableSkeleton />
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FileText size={48} className="mb-3 opacity-50" />
              <p className="text-lg">No report data available</p>
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
                    {activeTab === "receipts" && (
                      <>
                        <th className="text-left p-4 text-slate-700 font-semibold">
                          Receipt Code
                        </th>
                        <th className="text-left p-4 text-slate-700 font-semibold">
                          Supplier
                        </th>
                        <th className="text-left p-4 text-slate-700 font-semibold">
                          Status
                        </th>
                        <th className="text-left p-4 text-slate-700 font-semibold">
                          Date
                        </th>
                      </>
                    )}
                    {activeTab === "issues" && (
                      <>
                        <th className="text-left p-4 text-slate-700 font-semibold">
                          Issue Code
                        </th>
                        <th className="text-left p-4 text-slate-700 font-semibold">
                          Destination
                        </th>
                        <th className="text-left p-4 text-slate-700 font-semibold">
                          Status
                        </th>
                        <th className="text-left p-4 text-slate-700 font-semibold">
                          Date
                        </th>
                      </>
                    )}
                    {activeTab === "stock" && (
                      <>
                        <th className="text-left p-4 text-slate-700 font-semibold">
                          Product Code
                        </th>
                        <th className="text-left p-4 text-slate-700 font-semibold">
                          Product Name
                        </th>
                        <th className="text-left p-4 text-slate-700 font-semibold">
                          Stock
                        </th>
                        <th className="text-left p-4 text-slate-700 font-semibold">
                          Min Stock
                        </th>
                        <th className="text-left p-4 text-slate-700 font-semibold">
                          Status
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {activeTab === "receipts" &&
                    data.map((item, index) => (
                      <ReceiptRow
                        key={item.id}
                        item={item}
                        index={index}
                        animateItems={animateItems}
                      />
                    ))}
                  {activeTab === "issues" &&
                    data.map((item, index) => (
                      <IssueRow
                        key={item.id}
                        item={item}
                        index={index}
                        animateItems={animateItems}
                      />
                    ))}
                  {activeTab === "stock" &&
                    data.map((item, index) => (
                      <StockRow
                        key={index}
                        item={item}
                        index={index}
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
              Showing {data.length} of {total} entries
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

export default ReportsManager;
