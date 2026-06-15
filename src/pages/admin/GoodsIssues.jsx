/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef } from "react";
import {
  Search,
  X,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  Calendar,
  FileText,
  MapPin,
} from "lucide-react";
import AdminSidebar from "../../components/sidebar/AdminSidebar";
import api from "../../api/axios";
import Swal from "sweetalert2";

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

const GoodsIssues = () => {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedIssueDetails, setSelectedIssueDetails] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const searchRef = useRef(null);
  let debounceTimer = useRef(null);

  // =====================
  // FETCH GOODS ISSUES
  // =====================
  const getGoodsIssues = async () => {
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
      };

      const response = await api.get("/goods-issues", {
        params: params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setIssues(response.data.data || []);
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
      console.error("Error fetching goods issues:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to fetch goods issues",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // FETCH ISSUE DETAILS
  // =====================
  const getIssueDetails = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/goods-issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching issue details:", error);
      return null;
    }
  };

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      getGoodsIssues();
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    getGoodsIssues();
  }, [page, status]);

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
  // HANDLE VIEW DETAILS
  // =====================
  const handleViewDetails = async (issue) => {
    setSelectedIssue(issue);
    const details = await getIssueDetails(issue.id);
    setSelectedIssueDetails(details);
    setShowDetailsModal(true);
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

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

  // Stats data
  const stats = [
    {
      title: "Total Issues",
      value: total,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Approved",
      value: issues.filter((i) => i.status === "Approved").length,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Pending",
      value: issues.filter((i) => i.status === "Pending").length,
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const fadeInUpClass = animateCards ? "animate-fadeInUp" : "opacity-0";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">Goods Issues</h1>
          <p className="text-slate-500 mt-2">
            View all outgoing goods issues from your inventory system
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${fadeInUpClass}`}
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
                <h3 className="mt-6 text-slate-600 font-medium">
                  {stat.title}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Search and Filter */}
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
                placeholder="Search by issue code or destination..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200"
            >
              <Filter size={20} />
              Filter
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
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
          ) : issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Package size={48} className="mb-3 opacity-50" />
              <p className="text-lg">No goods issue data available</p>
              <p className="text-sm mt-1">Try changing your filters</p>
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
                      Issue Code
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Destination
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
                  {issues.map((item, index) => (
                    <tr
                      key={item.id}
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
                      <td className="p-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400" />
                          {item.destination}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(item.issue_date).toLocaleDateString()}
                        </div>
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
                          onClick={() => handleViewDetails(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
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
              Showing {issues.length} of {total} issues
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

      {/* Modal View Details */}
      {showDetailsModal && selectedIssue && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideInUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Eye size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Issue Details
                </h2>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-all duration-200 hover:rotate-90"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-500">Issue Code</p>
                  <p className="font-medium text-slate-800">
                    {selectedIssue.issue_code}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Destination</p>
                  <p className="font-medium text-slate-800">
                    {selectedIssue.destination}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Issue Date</p>
                  <p className="font-medium text-slate-800">
                    {new Date(selectedIssue.issue_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedIssue.status)}`}
                  >
                    {getStatusIcon(selectedIssue.status)}
                    {selectedIssue.status}
                  </span>
                </div>
              </div>

              {selectedIssueDetails?.details &&
                selectedIssueDetails.details.length > 0 && (
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-sm font-medium text-slate-700 mb-3">
                      Products
                    </p>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-200 text-xs font-semibold text-slate-500">
                        <div>Product Name</div>
                        <div>Quantity</div>
                      </div>
                      {selectedIssueDetails.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-2 gap-4 py-2 border-b border-slate-100"
                        >
                          <span className="text-slate-700">
                            {detail.product_name}
                          </span>
                          <span className="font-medium text-slate-800">
                            {detail.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="border-t border-slate-100 pt-4 mt-4">
                <p className="text-sm text-slate-500">Notes</p>
                <p className="text-slate-700">{selectedIssue.notes || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
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

export default GoodsIssues;
