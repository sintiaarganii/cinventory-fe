/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef } from "react";
import {
  Search,
  Users,
  Shield,
  UserCheck,
  Plus,
  Edit2,
  Power,
  X,
  Mail,
  User,
  Key,
  AlertCircle,
} from "lucide-react";
import axios from "../../api/axios";
import AdminSidebar from "../../components/sidebar/AdminSidebar";
import Swal from "sweetalert2";

// Modal component di dalam file yang sama (atau bisa di extract ke file terpisah)
const UserModal = ({
  showModal,
  setShowModal,
  editingUser,
  formData,
  setFormData,
  handleSubmit,
  existingEmails = [],
}) => {
  const [formErrors, setFormErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailExists = (email) => {
    if (!email) return false;
    
    // Jika sedang edit dan email tidak berubah, skip validasi
    if (editingUser && editingUser.email === email) {
      return false;
    }
    
    return existingEmails.some(
      (existingEmail) => existingEmail.toLowerCase() === email.trim().toLowerCase()
    );
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullname.trim()) {
      errors.fullname = "Full name is required";
    } else if (formData.fullname.trim().length < 3) {
      errors.fullname = "Full name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    } else if (isEmailExists(formData.email)) {
      errors.email = "Email already exists! Please use a different email address.";
    }

    if (!editingUser && !formData.password) {
      errors.password = "Password is required";
    } else if (!editingUser && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.role) {
      errors.role = "Role is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleSubmit(e);
    }
  };

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowModal(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              {editingUser ? (
                <Edit2 size={20} className="text-blue-600" />
              ) : (
                <Plus size={20} className="text-blue-600" />
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {editingUser ? "Edit User" : "Add New User"}
            </h2>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-slate-400 hover:text-slate-600 transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-slate-700 font-medium mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                required
                maxLength={50}
                value={formData.fullname}
                onChange={(e) => {
                  setFormData({ ...formData, fullname: e.target.value });
                  if (formErrors.fullname) setFormErrors({ ...formErrors, fullname: "" });
                }}
                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.fullname
                    ? "border-red-500 bg-red-50 focus:ring-red-500"
                    : "border-slate-200"
                }`}
                placeholder="Enter full name"
              />
            </div>
            {formErrors.fullname && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.fullname}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-slate-700 font-medium mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="email"
                required
                maxLength={100}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                }}
                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.email
                    ? "border-red-500 bg-red-50 focus:ring-red-500"
                    : "border-slate-200"
                }`}
                placeholder="user@example.com"
              />
            </div>
            {formErrors.email && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.email}
              </p>
            )}
          </div>

          {!editingUser && (
            <div className="mb-4">
              <label className="block text-slate-700 font-medium mb-2">
                Password *
              </label>
              <div className="relative">
                <Key
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                  }}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.password
                      ? "border-red-500 bg-red-50 focus:ring-red-500"
                      : "border-slate-200"
                  }`}
                  placeholder="Minimum 6 characters"
                />
              </div>
              {formErrors.password && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.password}
                </p>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-slate-700 font-medium mb-2">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => {
                setFormData({ ...formData, role: e.target.value });
                if (formErrors.role) setFormErrors({ ...formErrors, role: "" });
              }}
              className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.role
                  ? "border-red-500 bg-red-50 focus:ring-red-500"
                  : "border-slate-200"
              }`}
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </select>
            {formErrors.role && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.role}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formData.email && isEmailExists(formData.email)}
              className={`flex-1 px-4 py-2.5 rounded-xl transition ${
                formData.email && isEmailExists(formData.email)
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {editingUser ? "Update User" : "Save User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "staff",
  });

  const searchRef = useRef(null);
  let debounceTimer = useRef(null);

  const getUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      setAnimateCards(false);
      setAnimateItems(false);

      const response = await axios.get(
        `/users?page=${page}&limit=5&search=${search}&role=${role}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setUsers(response.data.users || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.total_pages || 0);
        setTimeout(() => {
          setAnimateCards(true);
          setAnimateItems(true);
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to fetch users",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      getUsers();
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search, role]);

  useEffect(() => {
    getUsers();
  }, [page]);

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      fullname: "",
      email: "",
      password: "",
      role: "staff",
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      fullname: user.fullname,
      email: user.email,
      password: "",
      role: user.role,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (editingUser) {
        const response = await axios.put(
          `/users/${editingUser.id}`,
          {
            fullname: formData.fullname.trim(),
            email: formData.email.trim(),
            role: formData.role,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data.success) {
          Swal.fire("Success!", response.data.message, "success");
          setShowModal(false);
          getUsers();
        }
      } else {
        const response = await axios.post(
          `/users`,
          {
            fullname: formData.fullname.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: formData.role,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 201) {
          Swal.fire("Success!", "User has been added", "success");
          setShowModal(false);
          getUsers();
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);
      
      if (error.response?.data?.message?.includes("duplicate") || 
          error.response?.data?.message?.includes("already exists")) {
        Swal.fire("Error!", "Email already exists! Please use a different email address.", "error");
      } else {
        Swal.fire("Error!", error.response?.data?.message || "An error occurred", "error");
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = !user.is_active;

      const response = await axios.patch(
        `/users/${user.id}/toggle-status`,
        { is_active: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        Swal.fire("Success!", response.data.message, "success");
        getUsers();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to change user status",
        "error",
      );
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "manager":
        return "bg-amber-100 text-amber-700";
      case "staff":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600";
  };

  const stats = [
    {
      title: "Total Users",
      value: total,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Users",
      value: users.filter((u) => u.is_active).length,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Admin",
      value: users.filter((u) => u.role === "admin").length,
      icon: Shield,
      color: "text-amber-600",
      bg: "bg-amber-50",
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-2">
            Manage all users in the inventory system
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

        {/* Search and Add Button */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer hover:border-slate-300"
            >
              <option value="">All Roles</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
            <button
              onClick={handleAddUser}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Plus size={20} /> Add User
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Users size={48} className="mb-3 opacity-50" />
              <p className="text-lg">No user data available</p>
              <p className="text-sm mt-1">
                Click "Add User" button to create one
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Name
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Email
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Role
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
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-all duration-200 ${
                        animateItems ? "animate-fadeInUp" : "opacity-0"
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: "forwards",
                      }}
                    >
                      <td className="p-4 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {user.fullname?.charAt(0).toUpperCase()}
                          </div>
                          {user.fullname}
                        </div>
                       </td>
                      <td className="p-4 text-slate-600">{user.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${getStatusBadgeClass(user.is_active)}`}
                        >
                          <span className="flex items-center gap-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-slate-400"}`}
                            ></span>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          title="Edit User"
                        >
                          <Edit2 size={18} />
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
              Showing {users.length} of {total} users
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
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      <UserModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        existingEmails={users.map(u => u.email)}
      />

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

export default UserManagement;