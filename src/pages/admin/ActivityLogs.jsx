/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminSidebar from "../../components/sidebar/AdminSidebar";

import {
  Activity,
  User,
  Package,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  MoreVertical,
  Download,
  Printer,
} from "lucide-react";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterType, setFilterType] = useState("all");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/activity-logs");

      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getBadgeColor = (type) => {
    switch (type?.toUpperCase()) {
      case "CREATE":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "UPDATE":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "DELETE":
        return "bg-red-50 text-red-700 border border-red-200";
      case "APPROVE":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "REJECT":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      case "LOGIN":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200";
      case "LOGOUT":
        return "bg-gray-50 text-gray-700 border border-gray-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const getActivityIcon = (type) => {
    switch (type?.toUpperCase()) {
      case "CREATE":
        return "✨";
      case "UPDATE":
        return "📝";
      case "DELETE":
        return "🗑️";
      case "APPROVE":
        return "✅";
      case "REJECT":
        return "❌";
      case "LOGIN":
        return "🔐";
      case "LOGOUT":
        return "🚪";
      default:
        return "📌";
    }
  };

  // Filter logs based on search and type
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || log.activity_type?.toUpperCase() === filterType;

    return matchesSearch && matchesType;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const activityTypes = [
    { value: "all", label: "All Activities" },
    { value: "CREATE", label: "Create" },
    { value: "UPDATE", label: "Update" },
    { value: "DELETE", label: "Delete" },
    { value: "APPROVE", label: "Approve" },
    { value: "REJECT", label: "Reject" },
    { value: "LOGIN", label: "Login" },
    { value: "LOGOUT", label: "Logout" },
  ];

  return (
    <div className="flex min-h-screen bg-linear-to-br from-slate-100 to-slate-200">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header with actions */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Activity Logs
              </h1>
            </div>
            <p className="text-slate-500 ml-1">
              Monitor and track all user activities across the system
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              title="Refresh data"
            >
              <RefreshCw size={18} className="text-slate-500" />
              <span className="text-slate-600 font-medium">Refresh</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <Download size={18} className="text-slate-500" />
              <span className="text-slate-600 font-medium">Export</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <Printer size={18} className="text-slate-500" />
              <span className="text-slate-600 font-medium">Print</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by user, activity, module, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white min-w-37.5"
              >
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-emerald-500">
            <p className="text-slate-500 text-sm">Total Activities</p>
            <p className="text-2xl font-bold text-slate-800">{logs.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
            <p className="text-slate-500 text-sm">Create/Update</p>
            <p className="text-2xl font-bold text-slate-800">
              {
                logs.filter(
                  (l) =>
                    l.activity_type?.toUpperCase() === "CREATE" ||
                    l.activity_type?.toUpperCase() === "UPDATE",
                ).length
              }
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
            <p className="text-slate-500 text-sm">Deletions</p>
            <p className="text-2xl font-bold text-slate-800">
              {
                logs.filter((l) => l.activity_type?.toUpperCase() === "DELETE")
                  .length
              }
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
            <p className="text-slate-500 text-sm">Approvals</p>
            <p className="text-2xl font-bold text-slate-800">
              {
                logs.filter(
                  (l) =>
                    l.activity_type?.toUpperCase() === "APPROVE" ||
                    l.activity_type?.toUpperCase() === "REJECT",
                ).length
              }
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileText size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-slate-800">
                    User Activity History
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Showing {currentItems.length} of {filteredLogs.length}{" "}
                    entries
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-400">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center">
              <div className="relative inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity
                    size={20}
                    className="text-emerald-600 animate-pulse"
                  />
                </div>
              </div>
              <p className="mt-4 text-slate-500">Loading activity logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">
                No activity logs found
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Try adjusting your search or filter
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left p-4 text-slate-600 font-semibold text-sm">
                        User
                      </th>
                      <th className="text-left p-4 text-slate-600 font-semibold text-sm">
                        Activity
                      </th>
                      <th className="text-left p-4 text-slate-600 font-semibold text-sm">
                        Module
                      </th>
                      <th className="text-left p-4 text-slate-600 font-semibold text-sm">
                        Description
                      </th>
                      <th className="text-left p-4 text-slate-600 font-semibold text-sm">
                        Date & Time
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentItems.map((log, idx) => (
                      <tr
                        key={log.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-200 group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                              <User size={14} className="text-emerald-600" />
                            </div>
                            <span className="font-medium text-slate-700">
                              {log.user_name || "Unknown User"}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getBadgeColor(
                              log.activity_type,
                            )}`}
                          >
                            <span>{getActivityIcon(log.activity_type)}</span>
                            {log.activity_type || "Unknown"}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Package size={14} className="text-slate-400" />
                            <span className="text-slate-600">
                              {log.module_name || "General"}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <p className="text-slate-600 max-w-md truncate">
                            {log.description || "-"}
                          </p>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="text-sm">
                              {(() => {
                                const date = new Date(log.created_at);
                                // Tambah 7 jam untuk WIB
                                date.setHours(date.getHours() + 7);
                                return date.toLocaleString("id-ID", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                              })()}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Activity Retention
                </p>
                <p className="text-xs text-slate-500">
                  Logs are stored for audit and compliance purposes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-slate-500">Real-time updates</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityLogs;
