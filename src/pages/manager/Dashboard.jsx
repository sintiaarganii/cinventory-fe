import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../api/axios";
import Swal from "sweetalert2";

import {
  ArrowDownToLine,
  CheckCircle,
  AlertTriangle,
  Package,
  ArrowUpFromLine,
} from "lucide-react";

import ManagerSidebar from "../../components/sidebar/ManagerSidebar";

// ==================== MEMOIZED COMPONENTS ====================

const StatCard = React.memo(({ stat }) => {
  const Icon = stat.icon;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-slate-100 group">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`${stat.bg} p-3 rounded-xl transition-transform group-hover:scale-110 duration-300`}
        >
          <Icon className={`w-8 h-8 ${stat.color}`} />
        </div>
      </div>
      <p className="text-4xl font-bold text-slate-800 tracking-tight">
        {Number(stat.value).toLocaleString()}
      </p>
      <h3 className="text-slate-600 font-medium mt-2">{stat.title}</h3>
    </div>
  );
});

const ActivityItem = React.memo(({ activity }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
    <div>
      <p className="font-medium text-slate-800">{activity.product_name}</p>
      <p className="text-sm text-slate-500">
        {activity.transaction_type === "IN" ? "Stock In" : "Stock Out"} •{" "}
        {activity.reference_code}
      </p>
    </div>
    <div className="text-right">
      <p
        className={`font-semibold ${activity.transaction_type === "IN" ? "text-emerald-600" : "text-red-600"}`}
      >
        {activity.transaction_type === "IN" ? "+" : "-"}
        {activity.quantity}
      </p>
      <p className="text-xs text-slate-400">
        {new Date(activity.created_at).toLocaleDateString("en-GB")}
      </p>
    </div>
  </div>
));

const LowStockItem = React.memo(({ item }) => (
  <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition">
    <div>
      <p className="font-medium text-slate-800">{item.product_name}</p>
      <p className="text-sm text-slate-500">Code: {item.product_code}</p>
    </div>
    <div className="text-right">
      <p className="text-red-600 font-bold">
        {item.stock} / {item.minimum_stock}
      </p>
      <p className="text-xs text-red-500">Min Stock</p>
    </div>
  </div>
));

// ==================== MAIN COMPONENT ====================

export default function DashboardManager() {
  const [dashboardData, setDashboardData] = useState({
    pending_receipts: 0,
    pending_issues: 0,
    approved_receipts: 0,
    approved_issues: 0,
  });

  const [lowStock, setLowStock] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchManagerDashboard = useCallback(async () => {
    try {
      const response = await api.get("/dashboard/manager");
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching manager dashboard:", error);
      Swal.fire("Error!", "Failed to load dashboard data", "error");
    }
  }, []);

  const fetchLowStock = useCallback(async () => {
    try {
      const response = await api.get("/dashboard/low-stock");
      setLowStock(response.data || []);
    } catch (error) {
      console.error("Error fetching low stock:", error);
      setLowStock([]);
    }
  }, []);

  const fetchRecentActivities = useCallback(async () => {
    try {
      const response = await api.get("/dashboard/recent-activities");
      if (response.data.success) {
        setRecentActivities(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      setRecentActivities([]);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchManagerDashboard(),
        fetchLowStock(),
        fetchRecentActivities(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchManagerDashboard, fetchLowStock, fetchRecentActivities]);

  const stats = useMemo(
    () => [
      {
        title: "Pending Receipts",
        value: dashboardData.pending_receipts || 0,
        icon: ArrowDownToLine,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
      {
        title: "Pending Issues",
        value: dashboardData.pending_issues || 0,
        icon: ArrowUpFromLine,
        color: "text-orange-600",
        bg: "bg-orange-50",
      },
      {
        title: "Approved Receipts",
        value: dashboardData.approved_receipts || 0,
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        title: "Approved Issues",
        value: dashboardData.approved_issues || 0,
        icon: CheckCircle,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
    ],
    [dashboardData],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <ManagerSidebar />
        <main className="ml-72 flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <ManagerSidebar />

      <main className="flex-1 ml-72 p-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">
            Manager Dashboard
          </h1>
          <p className="text-slate-500 mt-2">
            Real-time Overview & Approval Monitoring
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <ArrowDownToLine size={22} className="text-blue-500" />
              Recent Stock Movements
            </h2>
            <div className="space-y-3 max-h-105 overflow-y-auto">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Package size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <AlertTriangle size={22} className="text-red-500" />
              Low Stock Products
            </h2>
            <div className="space-y-3 max-h-105 overflow-y-auto">
              {lowStock.length > 0 ? (
                lowStock.map((item) => (
                  <LowStockItem key={item.id} item={item} />
                ))
              ) : (
                <div className="text-center py-10 text-emerald-500">
                  <CheckCircle size={48} className="mx-auto mb-3" />
                  <p>All products have sufficient stock ✓</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
