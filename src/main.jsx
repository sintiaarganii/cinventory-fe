import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import DashboardAdmin from "./pages/admin/Dashboard";
import DashboardManager from "./pages/manager/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardStaff from "./pages/staff/DashboardStaff";
import Login from "./pages/Login";
import "./index.css";
import UserManagement from "./pages/admin/UserManagement";
import Category from "./pages/admin/Category";
import Suppliers from "./pages/admin/Suppliers";
import Locations from "./pages/admin/Locations";
import Products from "./pages/admin/Products";
import GoodsReceipts from "./pages/admin/GoodsReceipts";
import GoodsIssues from "./pages/admin/GoodsIssues";
import Reports from "./pages/admin/Reports";
import ReceiptApproval from "./pages/manager/ReceiptApproval";
import IssueApproval from "./pages/manager/IssueApproval";
import StockMovements from "./pages/manager/StockMovements";
import ReportsManager from "./pages/manager/ReportsManager";
import GoodsReceiptsStaff from "./pages/staff/GoodsReceiptsStaff";
import GoodsIssuesStaff from "./pages/staff/GoodsIssuesStaff";
import StockMovementsStaff from "./pages/staff/StockMovementsStaff";
import ActivityLogs from "./pages/admin/ActivityLogs";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      // ADMIN ROUTES
      {
        path: "/admin/dashboard",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <DashboardAdmin />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/users",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/categories",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <Category />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/suppliers",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <Suppliers />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/locations",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <Locations />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/products",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <Products />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/goods-receipts",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <GoodsReceipts />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/goods-issues",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <GoodsIssues />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/reports",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <Reports />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/activity-logs",
        element: (
          <ProtectedRoute requiredRole="Admin">
            <ActivityLogs />
          </ProtectedRoute>
        ),
      },
      // MANAGER ROUTES
      {
        path: "/manager/dashboard",
        element: (
          <ProtectedRoute requiredRole="Manager">
            <DashboardManager />
          </ProtectedRoute>
        ),
      },
      {
        path: "/manager/receipt-approval",
        element: (
          <ProtectedRoute requiredRole="Manager">
            <ReceiptApproval />
          </ProtectedRoute>
        ),
      },
      {
        path: "/manager/issue-approval",
        element: (
          <ProtectedRoute requiredRole="Manager">
            <IssueApproval />
          </ProtectedRoute>
        ),
      },
      {
        path: "/manager/stock-movements",
        element: (
          <ProtectedRoute requiredRole="Manager">
            <StockMovements />
          </ProtectedRoute>
        ),
      },
      {
        path: "/manager/reports",
        element: (
          <ProtectedRoute requiredRole="Manager">
            <ReportsManager />
          </ProtectedRoute>
        ),
      },
      
      // STAFF ROUTES
      {
        path: "/staff/dashboard",
        element: (
          <ProtectedRoute requiredRole="Staff">
            <DashboardStaff />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/goods-receipts",
        element: (
          <ProtectedRoute requiredRole="Staff">
            <GoodsReceiptsStaff />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/goods-issues",
        element: (
          <ProtectedRoute requiredRole="Staff">
            <GoodsIssuesStaff />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff/stock-movements",
        element: (
          <ProtectedRoute requiredRole="Staff">
            <StockMovementsStaff />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
