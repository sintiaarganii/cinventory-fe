/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  MapPin,
  CheckCircle,
  XCircle,
  Hash,
  Navigation,
} from "lucide-react";
import AdminSidebar from "../../components/sidebar/AdminSidebar";
import api from "../../api/axios";
import Swal from "sweetalert2";

// Lazy load Modal
const LocationModal = lazy(() => import("./LocationModal"));

// ==================== MEMOIZED COMPONENTS ====================

const StatCard = React.memo(({ stat, index, animateCards }) => {
  const Icon = stat.icon;
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${
        animateCards ? "animate-fadeInUp" : "opacity-0"
      }`}
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
      <h3 className="mt-6 text-slate-600 font-medium">{stat.title}</h3>
    </div>
  );
});

const LocationRow = React.memo(
  ({ item, handleEditLocation, handleDeleteLocation, animateItems, index }) => (
    <tr
      className={`border-b border-slate-100 hover:bg-slate-50 transition-all duration-200 ${
        animateItems ? "animate-fadeInUp" : "opacity-0"
      }`}
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "forwards",
      }}
    >
      <td className="p-4 text-slate-600">{item.id}</td>
      <td className="p-4">
        <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-600">
          {item.location_code}
        </span>
      </td>
      <td className="p-4 font-medium text-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {item.location_name?.charAt(0).toUpperCase()}
          </div>
          {item.location_name}
        </div>
      </td>
      <td className="p-4 text-slate-600 max-w-md truncate">
        {item.description || "-"}
      </td>
      <td className="p-4">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            item.status === "active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.status === "active" ? (
            <CheckCircle size={12} />
          ) : (
            <XCircle size={12} />
          )}
          {item.status === "active" ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleEditLocation(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
            title="Edit"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleDeleteLocation(item.id, item.location_name)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  ),
);

// ==================== SKELETON LOADER ====================
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="border-b border-slate-100 p-4">
        <div className="flex gap-4">
          <div className="h-4 bg-slate-200 rounded w-12"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-4 bg-slate-200 rounded w-40"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-4 bg-slate-200 rounded w-24"></div>
        </div>
      </div>
    ))}
  </div>
);

// ==================== MAIN COMPONENT ====================

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);

  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  const [formData, setFormData] = useState({
    location_code: "",
    location_name: "",
    description: "",
    status: "active",
  });

  // =====================
  // FETCH LOCATIONS
  // =====================
  const getLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAnimateCards(false);
      setAnimateItems(false);

      const token = localStorage.getItem("token");
      const response = await api.get("/locations", {
        params: { page, limit: 5, search },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setLocations(response.data.locations || []);
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
      console.error("Error fetching locations:", error);
      setError("Failed to load location data");
      setLocations([]);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to fetch locations",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      getLocations();
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  useEffect(() => {
    getLocations();
  }, [page]);

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
  // HANDLERS
  // =====================
  const generateCode = useCallback(() => {
    const prefix = "LOC";
    const randomNum = Math.floor(Math.random() * 10000);
    const code = `${prefix}${randomNum.toString().padStart(4, "0")}`;
    setFormData((prev) => ({ ...prev, location_code: code }));
  }, []);

  const handleAddLocation = useCallback(() => {
    setEditingLocation(null);
    setFormData({
      location_code: "",
      location_name: "",
      description: "",
      status: "active",
    });
    setShowModal(true);
  }, []);

  const handleEditLocation = useCallback((location) => {
    setEditingLocation(location);
    setFormData({
      location_code: location.location_code,
      location_name: location.location_name,
      description: location.description || "",
      status: location.status || "active",
    });
    setShowModal(true);
  }, []);

  const handleDeleteLocation = useCallback(
    async (id, name) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Location "${name}" will be permanently deleted!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await api.delete(`/locations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "Location has been deleted.", "success");
          getLocations();
        } catch (error) {
          Swal.fire(
            "Error!",
            error.response?.data?.message || "Failed to delete location",
            "error",
          );
        }
      }
    },
    [getLocations],
  );

  // ==================== VALIDATION ====================
  const validateForm = () => {
    if (!formData.location_name.trim()) {
      Swal.fire("Warning", "Location name is required", "warning");
      return false;
    }
    if (formData.location_name.trim().length < 2) {
      Swal.fire(
        "Warning",
        "Location name must be at least 2 characters",
        "warning",
      );
      return false;
    }

    // CEK DUPLICATE LOCATION NAME
    const isNameExists = locations.some(
      (loc) =>
        loc.location_name.toLowerCase() ===
          formData.location_name.trim().toLowerCase() &&
        (!editingLocation || loc.id !== editingLocation.id),
    );

    if (isNameExists) {
      Swal.fire(
        "Warning",
        "Location name already exists! Please use a different name.",
        "warning",
      );
      return false;
    }

    if (!editingLocation && !formData.location_code.trim()) {
      Swal.fire("Warning", "Location code is required", "warning");
      return false;
    }
    if (!editingLocation && formData.location_code.trim().length < 3) {
      Swal.fire(
        "Warning",
        "Location code must be at least 3 characters",
        "warning",
      );
      return false;
    }

    if (!formData.description.trim()) {
      Swal.fire("Warning", "Description is required", "warning");
      return false;
    }

    return true;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const payload = {
          location_name: formData.location_name.trim(),
          description: formData.description.trim(),
          status: formData.status,
        };

        if (editingLocation) {
          await api.put(`/locations/${editingLocation.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Success!", "Location has been updated", "success");
        } else {
          await api.post(
            "/locations",
            { ...payload, location_code: formData.location_code },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          Swal.fire("Success!", "Location has been added", "success");
        }

        setShowModal(false);
        getLocations();
      } catch (error) {
        console.error("Error saving location:", error);
        Swal.fire(
          "Error!",
          error.response?.data?.message || "Failed to save location",
          "error",
        );
      }
    },
    [formData, editingLocation, getLocations],
  );

  // Stats
  const stats = useMemo(
    () => [
      {
        title: "Total Locations",
        value: total,
        icon: MapPin,
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
      {
        title: "Active Locations",
        value: locations.filter((l) => l.status === "active").length,
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        title: "Inactive Locations",
        value: locations.filter((l) => l.status === "inactive").length,
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
      },
    ],
    [total, locations],
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">Locations</h1>
          <p className="text-slate-500 mt-2">
            Manage storage locations in your inventory system
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              stat={stat}
              index={index}
              animateCards={animateCards}
            />
          ))}
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
              placeholder="Search locations by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            />
          </div>
          <button
            onClick={handleAddLocation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
          >
            <Plus size={20} /> Add Location
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
          {loading ? (
            <TableSkeleton />
          ) : locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <MapPin size={48} className="mb-3 opacity-50" />
              <p className="text-lg">No location data available</p>
              <p className="text-sm mt-1">
                Click "Add Location" button to create one
              </p>
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
                      Code
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Location Name
                    </th>
                    <th className="text-left p-4 text-slate-700 font-semibold">
                      Description
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
                  {locations.map((item, index) => (
                    <LocationRow
                      key={item.id}
                      item={item}
                      index={index}
                      handleEditLocation={handleEditLocation}
                      handleDeleteLocation={handleDeleteLocation}
                      animateItems={animateItems}
                    />
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
              Showing {locations.length} of {total} locations
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

      {/* Lazy Modal */}
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        }
      >
        {showModal && (
          <LocationModal
            showModal={showModal}
            setShowModal={setShowModal}
            editingLocation={editingLocation}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            generateCode={generateCode}
            existingLocationNames={locations.map((loc) => loc.location_name)} 
          />
        )}
      </Suspense>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Locations;
