import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Ambil token dari cookie
        const token = Cookies.get("token");

        console.log("Token from cookie:", token ? "Exists" : "Not found");

        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        // Ambil user dari localStorage
        const userStr = localStorage.getItem("user");

        if (!userStr) {
          setIsAuthenticated(false);
          return;
        }

        const user = JSON.parse(userStr);
        console.log("User from localStorage:", user);

        setUserRole(user.role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log(`Role mismatch: required ${requiredRole}, got ${userRole}`);
    return <Navigate to={`/${userRole?.toLowerCase()}/dashboard`} replace />;
  }

  console.log("Authenticated, rendering children");
  return children;
};

export default ProtectedRoute;
