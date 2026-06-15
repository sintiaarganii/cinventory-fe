/* eslint-disable no-unused-vars */
import React from "react";
import { X, Plus, Edit2, Hash, AlertCircle } from "lucide-react";

const ProductModal = ({
  showModal,
  setShowModal,
  editingProduct,
  formData,
  setFormData,
  categories,
  suppliers,
  locations,
  handleSubmit,
  generateCode,
  existingProductNames = [], 
}) => {
  if (!showModal) return null;

  // Fungsi untuk cek duplicate name
  const isProductNameExists = (name) => {
    if (!name) return false;
    
    // Jika sedang edit dan nama tidak berubah, skip validasi
    if (editingProduct && editingProduct.product_name === name) {
      return false;
    }
    
    return existingProductNames.some(
      (existingName) => existingName.toLowerCase() === name.trim().toLowerCase()
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowModal(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              {editingProduct ? (
                <Edit2 size={20} className="text-blue-600" />
              ) : (
                <Plus size={20} className="text-blue-600" />
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-slate-400 hover:text-slate-600 transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {!editingProduct && (
            <div className="mb-4">
              <label className="block text-slate-700 font-medium mb-2">
                Product Code *
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
                    maxLength={10}
                    value={formData.product_code}
                    onChange={(e) =>
                      setFormData({ ...formData, product_code: e.target.value })
                    }
                    readOnly
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PRD0001"
                  />
                </div>
                <button
                  type="button"
                  onClick={generateCode}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition"
                >
                  Generate
                </button>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-slate-700 font-medium mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              maxLength={15}
              value={formData.product_name}
              onChange={(e) =>
                setFormData({ ...formData, product_name: e.target.value })
              }
              className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.product_name && isProductNameExists(formData.product_name)
                  ? "border-red-500 bg-red-50 focus:ring-red-500"
                  : "border-slate-200"
              }`}
              placeholder="Enter product name"
            />
            {formData.product_name && isProductNameExists(formData.product_name) && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Product name already exists! Please use a different name.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-700 font-medium mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-2">
                Supplier *
              </label>
              <select
                required
                value={formData.supplier_id}
                onChange={(e) =>
                  setFormData({ ...formData, supplier_id: e.target.value })
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.supplier_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-700 font-medium mb-2">
                Location *
              </label>
              <select
                required
                value={formData.location_id}
                onChange={(e) =>
                  setFormData({ ...formData, location_id: e.target.value })
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.location_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-2">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pcs">Pcs</option>
                <option value="kg">Kg</option>
                <option value="liter">Liter</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-700 font-medium mb-2">
                Initial Stock
              </label>
              <input
                type="number"
                min="0"
                max={100}
                value={formData.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-2">
                Minimum Stock
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.minimum_stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimum_stock: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-slate-700 font-medium mb-2">
              Description
            </label>
            <textarea
              rows="3"
              maxLength={100}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter product description (optional)"
            />
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
              disabled={formData.product_name && isProductNameExists(formData.product_name)}
              className={`flex-1 px-4 py-2.5 rounded-xl transition ${
                formData.product_name && isProductNameExists(formData.product_name)
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {editingProduct ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;