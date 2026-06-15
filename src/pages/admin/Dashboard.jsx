/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../api/axios";
import AdminSidebar from "../../components/sidebar/AdminSidebar";
import Swal from "sweetalert2";

// Import icons
import {
  Package,
  Tags,
  Truck,
  Layers,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
  Boxes,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Users,
  Calendar,
  MoreVertical,
  RefreshCw,
  Download,
  Printer
} from "lucide-react";

// ==================== MEMOIZED COMPONENTS ====================

const StatCard = React.memo(({ stat, index }) => {
  const Icon = stat.icon;
  const gradients = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
    orange: "from-orange-500 to-orange-600",
    slate: "from-slate-500 to-slate-600"
  };
  
  return (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`absolute inset-0 bg-linear-to-br ${gradients[stat.gradient]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className={`${stat.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-8 h-8 ${stat.color}`} />
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-800 tracking-tight">
              {stat.value?.toLocaleString() || "0"}
            </p>
            <div className="flex items-center gap-1 mt-1 justify-end">
              {stat.trend !== undefined && (
                <>
                  {stat.trend > 0 ? (
                    <TrendingUp size={14} className="text-emerald-500" />
                  ) : stat.trend < 0 ? (
                    <TrendingDown size={14} className="text-red-500" />
                  ) : null}
                  <span className={`text-xs ${stat.trend > 0 ? 'text-emerald-600' : stat.trend < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {Math.abs(stat.trend)}%
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <h3 className="mt-6 text-slate-600 font-medium text-sm uppercase tracking-wide">
          {stat.title}
        </h3>
      </div>
    </div>
  );
});

const ActivityItem = React.memo(({ activity, index }) => {
  const isInbound = activity.transaction_type === 'IN';
  
  return (
    <div className="p-4 hover:bg-slate-50 transition-all duration-200 border-l-2 border-transparent hover:border-blue-500">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl transition-all duration-200 ${
            isInbound ? 'bg-emerald-50' : 'bg-red-50'
          }`}>
            {isInbound ? (
              <ArrowDownToLine size={16} className="text-emerald-500" />
            ) : (
              <ArrowUpFromLine size={16} className="text-red-500" />
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{activity.product_name}</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {isInbound ? 'Stock In' : 'Stock Out'} • {activity.reference_code}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Clock size={12} className="text-slate-400" />
              <p className="text-xs text-slate-400">
                {new Date(activity.created_at).toLocaleString('id-ID', { 
                  day: 'numeric', 
                  month: 'short', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold ${
            isInbound ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {isInbound ? '+' : '-'}{activity.quantity}
          </span>
        </div>
      </div>
    </div>
  );
});

const LowStockItem = React.memo(({ product, index }) => {
  const percentage = (product.stock / product.minimum_stock) * 100;
  const isCritical = percentage <= 50;
  
  return (
    <div className="p-4 hover:bg-slate-50 transition-all duration-200 border-l-2 border-transparent hover:border-red-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{product.product_name}</p>
          <p className="text-sm text-slate-500 mt-0.5">Code: {product.product_code}</p>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Stock Level</span>
              <span className={`font-medium ${isCritical ? 'text-red-600' : 'text-orange-600'}`}>
                {product.stock} / {product.minimum_stock}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  isCritical ? 'bg-red-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
          </div>
        </div>
        <div className="ml-4">
          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
            isCritical ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {isCritical ? 'Critical' : 'Warning'}
          </div>
        </div>
      </div>
    </div>
  );
});

// Weekly activity chart component (pure SVG) - REAL TIME
const WeeklyActivityChart = React.memo(({ weeklyData, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  const maxValue = Math.max(...weeklyData.map(d => d.total), 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Weekly Activity</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-slate-500">Stock In</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs text-slate-500">Stock Out</span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs text-slate-500">Total</span>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2 h-40">
        {weeklyData.map((day, idx) => (
          <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative w-full flex flex-col items-center gap-1">
              {/* Total bar (blue) - background */}
              <div 
                className="w-full bg-blue-200 rounded-t-lg transition-all duration-500"
                style={{ height: `${(day.total / maxValue) * 100}px`, maxHeight: '100px' }}
              />
              {/* Stock In bar (emerald) - foreground */}
              <div 
                className="absolute bottom-0 w-full bg-emerald-500 rounded-t-lg transition-all duration-500 hover:bg-emerald-600"
                style={{ height: `${(day.stock_in / maxValue) * 100}px`, maxHeight: '100px' }}
              />
              {/* Tooltip */}
              <div className="opacity-0 hover:opacity-100 absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap transition-opacity z-10 pointer-events-none">
                <div>Total: {day.total}</div>
                <div>In: {day.stock_in} | Out: {day.stock_out}</div>
              </div>
            </div>
            <span className="text-xs text-slate-500">{day.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// Distribution chart (donut chart using SVG)
const DistributionChart = React.memo(({ receipts, issues }) => {
  const total = receipts + issues;
  const receiptPercent = total > 0 ? (receipts / total) * 100 : 0;
  const issuePercent = total > 0 ? (issues / total) * 100 : 0;
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const receiptOffset = circumference - (receiptPercent / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={receiptOffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-slate-800">{total}</span>
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs text-slate-600">Receipts ({receipts})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-200"></div>
          <span className="text-xs text-slate-600">Issues ({issues})</span>
        </div>
      </div>
    </div>
  );
});

// ==================== MAIN COMPONENT ====================

const Dashboard = () => {
  const [summary, setSummary] = useState({
    total_products: 0,
    total_categories: 0,
    total_suppliers: 0,
    total_locations: 0,
    total_goods_receipts: 0,
    total_goods_issues: 0,
    low_stock_products: 0,
    total_users: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([
    { day: 'Mon', stock_in: 0, stock_out: 0, total: 0 },
    { day: 'Tue', stock_in: 0, stock_out: 0, total: 0 },
    { day: 'Wed', stock_in: 0, stock_out: 0, total: 0 },
    { day: 'Thu', stock_in: 0, stock_out: 0, total: 0 },
    { day: 'Fri', stock_in: 0, stock_out: 0, total: 0 },
    { day: 'Sat', stock_in: 0, stock_out: 0, total: 0 },
    { day: 'Sun', stock_in: 0, stock_out: 0, total: 0 }
  ]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [statsRes, activitiesRes, lowStockRes, weeklyRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/recent-activities"),
        api.get("/dashboard/low-stock"),
        api.get("/dashboard/weekly-activity")  
      ]);

      if (statsRes.data.success) {
        setSummary(statsRes.data);
      }

      if (activitiesRes.data.success) {
        setRecentActivities(activitiesRes.data.data || []);
      }

      if (lowStockRes.data) {
        setLowStockProducts(lowStockRes.data || []);
      }

      if (weeklyRes.data.success) {
        setWeeklyActivity(weeklyRes.data.data || []);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      Swal.fire('Error!', 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Refresh data every 30 seconds (real-time)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Memoize stats array
  const stats = useMemo(() => [
    {
      title: "Total Products",
      value: summary.total_products ?? 0,
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      gradient: "emerald",
      trend: 12
    },
    {
      title: "Categories",
      value: summary.total_categories ?? 0,
      icon: Tags,
      color: "text-blue-600",
      bg: "bg-blue-50",
      gradient: "blue",
      trend: 5
    },
    {
      title: "Suppliers",
      value: summary.total_suppliers ?? 0,
      icon: Truck,
      color: "text-amber-600",
      bg: "bg-amber-50",
      gradient: "amber",
      trend: -2
    },
    {
      title: "Locations",
      value: summary.total_locations ?? 0,
      icon: Layers,
      color: "text-purple-600",
      bg: "bg-purple-50",
      gradient: "purple",
      trend: 8
    },
    {
      title: "Goods Receipts",
      value: summary.total_goods_receipts ?? 0,
      icon: ArrowDownToLine,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      gradient: "emerald",
      trend: 15
    },
    {
      title: "Goods Issues",
      value: summary.total_goods_issues ?? 0,
      icon: ArrowUpFromLine,
      color: "text-red-600",
      bg: "bg-red-50",
      gradient: "red",
      trend: 7
    },
    {
      title: "Low Stock",
      value: summary.low_stock_products ?? 0,
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      gradient: "orange",
      trend: -4
    },
    {
      title: "Total Users",
      value: summary.total_users ?? 0,
      icon: Users,
      color: "text-slate-600",
      bg: "bg-slate-100",
      gradient: "slate",
      trend: 3
    },
  ], [summary]);

  const totalReceipts = summary.total_goods_receipts ?? 0;
  const totalIssues = summary.total_goods_issues ?? 0;

  return (
    <div className="flex min-h-screen bg-linear-to-br from-slate-100 to-slate-200">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header with actions */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-2">
              Welcome back! Here's what's happening with your inventory today.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => fetchDashboardData()}
              className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              title="Refresh data"
            >
              <RefreshCw size={18} className="text-slate-500" />
            </button>
            <button className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <Download size={18} className="text-slate-500" />
            </button>
            <button className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <Printer size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Package size={24} className="text-blue-600 animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.slice(0, 4).map((stat, index) => (
                <StatCard key={index} stat={stat} index={index} />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.slice(4, 8).map((stat, index) => (
                <StatCard key={index} stat={stat} index={index} />
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Weekly Activity Chart - REAL TIME */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">Activity Overview</h2>
                    <p className="text-sm text-slate-500 mt-1">Weekly stock movement trends (real-time)</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Activity size={20} className="text-blue-600" />
                  </div>
                </div>
                <WeeklyActivityChart weeklyData={weeklyActivity} loading={chartLoading} />
              </div>

              {/* Distribution Chart */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">Transaction Distribution</h2>
                    <p className="text-sm text-slate-500 mt-1">Receipts vs Issues ratio</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-xl">
                    <ShoppingCart size={20} className="text-purple-600" />
                  </div>
                </div>
                <DistributionChart receipts={totalReceipts} issues={totalIssues} />
              </div>
            </div>

            {/* Two Column Layout for Recent Activities and Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Activity size={20} className="text-blue-600" />
                        <h2 className="text-xl font-semibold text-slate-800">Recent Activities</h2>
                      </div>
                      <p className="text-slate-500 text-sm mt-1">Latest stock movements in real-time</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      Live
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 max-h-125 overflow-y-auto">
                  {recentActivities.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <Activity size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No recent activities</p>
                      <p className="text-sm mt-1">Transactions will appear here</p>
                    </div>
                  ) : (
                    recentActivities.map((activity, idx) => (
                      <ActivityItem key={activity.id} activity={activity} index={idx} />
                    ))
                  )}
                </div>
              </div>

              {/* Low Stock Products */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertCircle size={20} className="text-orange-600" />
                        <h2 className="text-xl font-semibold text-slate-800">Stock Alerts</h2>
                      </div>
                      <p className="text-slate-500 text-sm mt-1">Products below minimum stock level</p>
                    </div>
                    <div className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                      {lowStockProducts.length} items
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 max-h-125 overflow-y-auto">
                  {lowStockProducts.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <CheckCircle size={48} className="mx-auto mb-3 text-emerald-400" />
                      <p className="font-medium">All products have sufficient stock</p>
                      <p className="text-sm mt-1">Inventory is well maintained</p>
                    </div>
                  ) : (
                    lowStockProducts.map((product, idx) => (
                      <LowStockItem key={product.id} product={product} index={idx} />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="mt-8 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Last updated</p>
                    <p className="text-xs text-slate-500">{new Date().toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs text-slate-500">Auto-refresh every 30s</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;