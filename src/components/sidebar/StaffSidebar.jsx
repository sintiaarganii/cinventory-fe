import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { useState } from "react";

import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/staff/dashboard",
  },
  {
    title: "Goods Receipts",
    icon: ArrowDownCircle,
    path: "/staff/goods-receipts",
  },
  {
    title: "Goods Issues",
    icon: ArrowUpCircle,
    path: "/staff/goods-issues",
  },
  {
    title: "Stock Movements",
    icon: History,
    path: "/staff/stock-movements",
  },
];

const StaffSidebar = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of the system and need to login again",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Logout!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoggingOut(true);

        Swal.fire({
          title: "Logging out...",
          text: "Please wait a moment",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await new Promise((resolve) => setTimeout(resolve, 500));

        Cookies.remove("token");
        localStorage.clear();

        Swal.fire({
          icon: "success",
          title: "Logged Out!",
          text: "You have been successfully logged out",
          confirmButtonColor: "#10b981",
          timer: 1500,
          showConfirmButton: true,
        }).then(() => {
          setIsLoggingOut(false);
          navigate("/");
        });
      }
    });
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white text-slate-800 flex flex-col border-r border-slate-200 shadow-sm z-50">
      {/* Logo Header */}
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Cinventory</h1>
        <p className="text-xs text-slate-500 mt-1">Staff Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "hover:bg-slate-100 text-slate-700"
                }`
              }
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-200">
        <div className="mb-4 px-2">
          <p className="font-semibold text-slate-800 truncate">
            {user?.fullname || "Staff"}
          </p>
          <p className="text-sm text-slate-500">{user?.role || "Staff"}</p>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 ${
            isLoggingOut ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoggingOut ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Logging out...
            </>
          ) : (
            <>
              <LogOut size={18} />
              Logout
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
