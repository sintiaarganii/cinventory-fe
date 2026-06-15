/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import api from "../../api/axios";
import Swal from "sweetalert2";

import {
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  TrendingUp,
  History,
} from "lucide-react";

import StaffSidebar from "../../components/sidebar/StaffSidebar";

const DashboardStaff = () => {
  const [staffData, setStaffData] = useState({
    today_receipts: 0,
    today_issues: 0,
    my_pending_tasks: 0,
    total_movements: 0,
  });

  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffDashboard();
  }, []);

  const fetchStaffDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [dashboardRes, movementsRes] = await Promise.all([
        api.get("/dashboard/staff", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/dashboard/staff/recent-movements", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (dashboardRes.data.success) {
        setStaffData(dashboardRes.data);
      }

      if (movementsRes.data.success) {
        setRecentMovements(movementsRes.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching staff dashboard:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to load dashboard",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Today's Receipts",
      value: staffData.today_receipts,
      icon: ArrowDownCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Today's Issues",
      value: staffData.today_issues,
      icon: ArrowUpCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Pending Tasks",
      value: staffData.my_pending_tasks,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Total Movements",
      value: staffData.total_movements,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <StaffSidebar />
        <main className="flex-1 ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <StaffSidebar />

      <main className="flex-1 ml-64 p-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">Staff Dashboard</h1>
          <p className="text-slate-500 mt-2">Daily Operations Overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`${stat.bg} p-3 rounded-xl transition-transform group-hover:scale-110`}
                  >
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">
                  {Number(stat.value).toLocaleString()}
                </p>
                <h3 className="text-slate-600 font-medium mt-2">
                  {stat.title}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Recent Movements */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <History size={22} className="text-blue-500" />
            Recent Stock Movements
          </h2>
          <div className="space-y-3 max-h-105 overflow-y-auto pr-2">
            {recentMovements.length > 0 ? (
              recentMovements.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    {item.transaction_type === "IN" ? (
                      <ArrowDownCircle className="text-emerald-500" size={20} />
                    ) : (
                      <ArrowUpCircle className="text-red-500" size={20} />
                    )}
                    <div>
                      <p className="font-medium text-slate-800">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.reference_code}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${item.transaction_type === "IN" ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {item.transaction_type === "IN" ? "+" : ""}
                      {item.quantity}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400">
                <Package size={48} className="mx-auto mb-3 opacity-50" />
                <p>No stock movements found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardStaff;
