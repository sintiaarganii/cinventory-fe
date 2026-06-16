/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Calendar,
  Hash,
  ArrowUpFromLine,
  Trash2,
  Eye,
  MapPin,
} from "lucide-react";
import api from "../../api/axios";
import Swal from "sweetalert2";

const GoodsIssuesStaffModal = ({
  show,
  onClose,
  mode,
  issue,
  products,
  existingCodes,
}) => {
  const [loading, setLoading] = useState(false);
  const [issueDetails, setIssueDetails] = useState([]);

  const [formData, setFormData] = useState({
    issue_code: "",
    issue_date: new Date().toISOString().split("T")[0],
    destination: "",
    notes: "",
    items: [{ product_id: "", quantity: 1 }],
  });

  // Fetch issue details for detail mode
  useEffect(() => {
    if (mode === "detail" && issue?.id) {
      fetchIssueDetails(issue.id);
    }
  }, [mode, issue]);

  const fetchIssueDetails = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/goods-issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIssueDetails(response.data.details || []);
    } catch (error) {
      console.error("Error fetching issue details:", error);
    }
  };

  // Reset form when modal opens in create mode
  useEffect(() => {
    if (mode === "create" && show) {
      setFormData({
        issue_code: "",
        issue_date: new Date().toISOString().split("T")[0],
        destination: "",
        notes: "",
        items: [{ product_id: "", quantity: 1 }],
      });
    }
  }, [mode, show]);

  if (!show) return null;

  // =====================
  // CREATE MODE FUNCTIONS
  // =====================
  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: "", quantity: 1 }],
    });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const generateCode = () => {
    const prefix = "GI";
    let isUnique = false;
    let code = "";

    while (!isUnique) {
      const randomNum = Math.floor(Math.random() * 10000); // 0-9999 (4 digit)
      code = `${prefix}${randomNum.toString().padStart(4, "0")}`; // GI + 4 angka
      if (!existingCodes.includes(code)) {
        isUnique = true;
      }
    }
    setFormData({ ...formData, issue_code: code });
  };

  const isCodeExists = (code) => {
    return existingCodes.includes(code);
  };

  const getProductStock = (productId) => {
    const product = products.find((p) => p.id === parseInt(productId));
    return product ? product.stock : 0;
  };

  const isFormValid = () => {
    if (!formData.destination.trim()) return false;
    if (formData.destination.length < 3) return false;
    if (!formData.issue_code.trim()) return false;
    if (formData.issue_code.length < 4) return false;
    if (isCodeExists(formData.issue_code)) return false;
    const validItems = formData.items.filter(
      (item) => item.product_id && item.quantity > 0,
    );
    if (validItems.length === 0) return false;
    return true;
  };

  const validateForm = () => {
    if (!formData.destination.trim()) {
      Swal.fire("Validation Error", "Destination is required", "warning");
      return false;
    }

    if (formData.destination.length < 3) {
      Swal.fire(
        "Validation Error",
        "Destination must be at least 3 characters",
        "warning",
      );
      return false;
    }

    if (!formData.issue_code) {
      Swal.fire("Validation Error", "Issue code is required", "warning");
      return false;
    }

    // Cari bagian validasi code (kurang lebih baris 139-145)
    if (formData.issue_code.length < 6) {
      // Ubah dari 8 jadi 6
      Swal.fire(
        "Validation Error",
        "Issue code must be at least 6 characters",
        "warning",
      );
      return false;
    }

    if (isCodeExists(formData.issue_code)) {
      Swal.fire(
        "Validation Error",
        "Issue code already exists! Please generate a new code.",
        "warning",
      );
      return false;
    }

    if (new Date(formData.issue_date) > new Date()) {
      Swal.fire(
        "Validation Error",
        "Issue date cannot be in the future",
        "warning",
      );
      return false;
    }

    const validItems = formData.items.filter(
      (item) => item.product_id && item.quantity > 0,
    );
    if (validItems.length === 0) {
      Swal.fire(
        "Validation Error",
        "At least one product is required",
        "warning",
      );
      return false;
    }

    // Check stock availability for all items
    for (const item of validItems) {
      const product = products.find((p) => p.id === parseInt(item.product_id));
      if (!product) {
        Swal.fire("Validation Error", "Invalid product selected", "warning");
        return false;
      }
      if (product.stock < parseInt(item.quantity)) {
        Swal.fire(
          "Validation Error",
          `Insufficient stock for "${product.product_name}". Available: ${product.stock}`,
          "warning",
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const validItems = formData.items.filter(
      (item) => item.product_id && item.quantity > 0,
    );
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/goods-issues",
        {
          issue_code: formData.issue_code,
          issue_date: formData.issue_date,
          destination: formData.destination,
          notes: formData.notes,
          items: validItems.map((item) => ({
            product_id: parseInt(item.product_id),
            quantity: parseInt(item.quantity),
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Swal.fire("Success!", "Goods issue has been created", "success");
      onClose();
    } catch (error) {
      console.error("Error creating issue:", error);
      if (error.response?.data?.message?.includes("duplicate key")) {
        Swal.fire(
          "Error!",
          "Issue code already exists. Please generate a new code.",
          "error",
        );
      } else {
        Swal.fire(
          "Error!",
          error.response?.data?.message || "Failed to create issue",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
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

  // Render Detail Mode
  if (mode === "detail" && issue) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Eye size={20} className="text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Issue Details
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  View issue information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Issue Code</p>
                <p className="font-semibold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg inline-block">
                  {issue.issue_code}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Destination</p>
                <p className="font-semibold text-slate-800">
                  {issue.destination}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Issue Date</p>
                <p className="font-semibold text-slate-800">
                  {new Date(issue.issue_date).toLocaleDateString("en-GB")}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Status</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(issue.status)}`}
                >
                  {issue.status}
                </span>
              </div>
            </div>

            {issueDetails && issueDetails.length > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Products
                </p>
                <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="text-left p-3 text-xs font-semibold text-slate-600">
                          Product Name
                        </th>
                        <th className="text-right p-3 text-xs font-semibold text-slate-600 w-24">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {issueDetails.map((detail, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="p-3 text-sm text-slate-700">
                            {detail.product_name}
                          </td>
                          <td className="p-3 text-sm font-semibold text-slate-800 text-right">
                            {detail.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {issue.notes && (
              <div className="border-t border-slate-100 pt-4 mt-4">
                <p className="text-sm text-slate-500 mb-2">Notes</p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-slate-700">{issue.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Create Mode
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <ArrowUpFromLine size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Create Goods Issue
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Release stock from inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-sm">
              Issue Code <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  required
                  value={formData.issue_code}
                  onChange={(e) =>
                    setFormData({ ...formData, issue_code: e.target.value })
                  }
                  readOnly
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                    formData.issue_code && isCodeExists(formData.issue_code)
                      ? "border-red-500 bg-red-50 focus:ring-red-500"
                      : "border-slate-300 focus:border-orange-500"
                  }`}
                  placeholder="GI0001"
                />
              </div>
              <button
                type="button"
                onClick={generateCode}
                className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm"
              >
                Generate
              </button>
            </div>
            {formData.issue_code && formData.issue_code.length < 6 && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Code is too short (minimum 6 characters)
              </p>
            )}
            {formData.issue_code && isCodeExists(formData.issue_code) && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ Code already exists! Please generate a new one.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-2">
                Issue Date *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10"
                  size={18}
                />
                <input
                  type="date"
                  required
                  value={formData.issue_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      issue_date: e.target.value,
                    })
                  }
                  min={
                    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className="
                    w-full
                    pl-10
                    pr-4
                    py-3
                    border
                    border-slate-300
                    rounded-xl
                    focus:outline-none
                    focus:ring-2
                    focus:ring-orange-500
                    focus:border-orange-500
                    transition-all
                  "
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Date can only be selected up to 3 days back.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2 text-sm">
                Destination <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  required
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Destination location"
                />
              </div>
              {formData.destination && formData.destination.length < 3 && (
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ Destination is too short (minimum 3 characters)
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-2 text-sm">
              Notes
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
              placeholder="Additional notes (optional)"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-slate-700 font-semibold text-sm">
                Products <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium transition-colors"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => {
                const stock = getProductStock(item.product_id);
                const isLowStock = stock < item.quantity && item.product_id;
                const hasProduct = !!item.product_id;
                const hasValidQuantity = item.quantity > 0;
                const isItemValid =
                  hasProduct && hasValidQuantity && !isLowStock;

                return (
                  <div
                    key={index}
                    className={`flex gap-3 items-center p-3 rounded-xl transition-all ${
                      !isItemValid && (item.product_id || item.quantity)
                        ? "bg-red-50 border border-red-200"
                        : "bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="flex-1">
                      <select
                        required
                        value={item.product_id}
                        onChange={(e) =>
                          updateItem(index, "product_id", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        <option value="">Select Product</option>
                        {products
                          .filter((prod) => prod.stock > 0)
                          .map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.product_name} (Stock: {prod.stock}{" "}
                              {prod.unit})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className={`w-full border rounded-xl px-3 py-3 text-center focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          isLowStock || (!hasValidQuantity && item.product_id)
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-300"
                        }`}
                        placeholder="Qty"
                      />
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {formData.items.filter(
              (item) => item.product_id && item.quantity > 0,
            ).length === 0 && (
              <p className="text-xs text-red-500 mt-2">
                ⚠️ At least one product is required
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "Creating..." : "Create Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoodsIssuesStaffModal;
