/* eslint-disable no-unused-vars */
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
  Eye,
  Check,
  X as XIcon,
  Calendar,
  FileText,
  Building,
  Clock,
} from "lucide-react";
import ManagerSidebar from "../../components/sidebar/ManagerSidebar";
import api from "../../api/axios";
import Swal from "sweetalert2";

const ReceiptApproval = () => {
  const [receipts, setReceipts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Pending");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedReceiptDetails, setSelectedReceiptDetails] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);

  const searchRef = useRef(null);
  let debounceTimer = useRef(null);

  // =====================
  // FETCH GOODS RECEIPTS
  // =====================
  const getGoodsReceipts = async () => {
    try {
      setLoading(true);
      setAnimateCards(false);

      const token = localStorage.getItem("token");

      const params = {
        page: page,
        limit: 5,
        search: search,
        status: status,
      };

      const response = await api.get("/goods-receipts", {
        params: params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setReceipts(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.total_pages || 0);
        setTimeout(() => setAnimateCards(true), 100);
      }
    } catch (error) {
      console.error("Error fetching goods receipts:", error);
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
  };

  // =====================
  // FETCH RECEIPT DETAILS
  // =====================
  const getReceiptDetails = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/goods-receipts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        return {
          header: response.data.header,
          details: response.data.details || [],
        };
      }
      return { header: null, details: [] };
    } catch (error) {
      console.error("Error fetching receipt details:", error);
      return { header: null, details: [] };
    }
  };

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      getGoodsReceipts();
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    getGoodsReceipts();
  }, [page, status]);

  // =====================
  // HANDLE VIEW DETAILS
  // =====================
  const handleViewDetails = async (receipt) => {
    try {
      setSelectedReceipt(receipt);
      const result = await getReceiptDetails(receipt.id);
      setSelectedReceiptDetails(result.details);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error in handleViewDetails:", error);
      Swal.fire("Error!", "Failed to load receipt details", "error");
    }
  };

  // =====================
  // HANDLE APPROVE
  // =====================
  const handleApprove = async (id, code) => {
    const result = await Swal.fire({
      title: "Approve Receipt?",
      text: `Are you sure you want to approve receipt "${code}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Approve!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await api.put(
          `/goods-receipts/approve/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        Swal.fire("Approved!", "Goods receipt has been approved.", "success");
        getGoodsReceipts();
      } catch (error) {
        Swal.fire(
          "Error!",
          error.response?.data?.message || "Failed to approve receipt",
          "error",
        );
      }
    }
  };

  // =====================
  // HANDLE REJECT
  // =====================
  const handleReject = async (id, code) => {
    const result = await Swal.fire({
      title: "Reject Receipt?",
      text: `Are you sure you want to reject receipt "${code}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Reject!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await api.put(
          `/goods-receipts/reject/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        Swal.fire("Rejected!", "Goods receipt has been rejected.", "success");
        getGoodsReceipts();
      } catch (error) {
        Swal.fire(
          "Error!",
          error.response?.data?.message || "Failed to reject receipt",
          "error",
        );
      }
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setStatus("Pending");
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
        return <Clock size={12} />;
      case "Rejected":
        return <XCircle size={12} />;
      default:
        return null;
    }
  };

  // Stats data
  const stats = [
    {
      title: "Pending Approvals",
      value: receipts.filter((r) => r.status === "Pending").length,
      icon: Clock,
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

  const fadeInUpClass = animateCards ? "animate-fadeInUp" : "opacity-0";

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

  return (
    <div className="flex min-h-screen bg-slate-100">
      <ManagerSidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">
            Goods Receipt Approval
          </h1>
          <p className="text-slate-500 mt-2">
            Review and approve incoming goods receipts
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
                placeholder="Search by receipt code or supplier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="">All Status</option>
            </select>
            <button
              onClick={resetFilters}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-2 transition"
            >
              <X size={18} />
              Reset
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : receipts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Package size={48} className="mb-3" />
              <p className="text-lg">No receipts found</p>
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
                    <tr
                      key={item.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-all duration-200 ${fadeInUpClass}`}
                      style={{ animationDelay: `${index * 50}ms` }}
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
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(item.receipt_date).toLocaleDateString()}
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {item.status === "Pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApprove(item.id, item.receipt_code)
                                }
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200"
                                title="Approve"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleReject(item.id, item.receipt_code)
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                                title="Reject"
                              >
                                <XIcon size={18} />
                              </button>
                            </>
                          )}
                        </div>
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
              Showing {receipts.length} of {total} receipts
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
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
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                      page === pageNum
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
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
      {showDetailsModal && selectedReceipt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Eye size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Receipt Details
                </h2>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-500">Receipt Code</p>
                  <p className="font-medium text-slate-800">
                    {selectedReceipt.receipt_code}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Supplier</p>
                  <p className="font-medium text-slate-800">
                    {selectedReceipt.supplier_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Receipt Date</p>
                  <p className="font-medium text-slate-800">
                    {new Date(
                      selectedReceipt.receipt_date,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedReceipt.status)}`}
                  >
                    {getStatusIcon(selectedReceipt.status)}
                    {selectedReceipt.status}
                  </span>
                </div>
              </div>

              {/* Products Section */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-700 mb-3">
                  Products
                </p>
                {selectedReceiptDetails && selectedReceiptDetails.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4 pb-2 border-b border-slate-200 text-xs font-semibold text-slate-500">
                      <div>Product Name</div>
                      <div>Quantity</div>
                      <div>Unit</div>
                    </div>
                    {selectedReceiptDetails.map((detail, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-3 gap-4 py-2 border-b border-slate-100"
                      >
                        <span className="text-slate-700">
                          {detail.product_name}
                        </span>
                        <span className="font-medium text-slate-800">
                          {detail.quantity}
                        </span>
                        <span className="text-slate-500">
                          {detail.unit || "pcs"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-4">
                    No products found
                  </p>
                )}
              </div>

              {selectedReceipt.notes && (
                <div className="border-t border-slate-100 pt-4 mt-4">
                  <p className="text-sm text-slate-500">Notes</p>
                  <p className="text-slate-700">{selectedReceipt.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

export default ReceiptApproval;
