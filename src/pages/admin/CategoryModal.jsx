/* eslint-disable no-unused-vars */
import React from "react";
import { X, Plus, Edit2, AlertCircle } from "lucide-react";

const CategoryModal = ({
  showModal,
  setShowModal,
  editingCategory,
  formData,
  setFormData,
  handleSubmit,
  existingCategoryNames = [], 
}) => {
  if (!showModal) return null;

  // Fungsi untuk cek duplicate name
  const isCategoryNameExists = (name) => {
    if (!name) return false;
    
    // Jika sedang edit dan nama tidak berubah, skip validasi
    if (editingCategory && editingCategory.category_name === name) {
      return false;
    }
    
    return existingCategoryNames.some(
      (existingName) => existingName.toLowerCase() === name.trim().toLowerCase()
    );
  };

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
              {editingCategory ? (
                <Edit2 size={20} className="text-blue-600" />
              ) : (
                <Plus size={20} className="text-blue-600" />
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h2>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-slate-700 font-medium mb-2">
              Category Name *
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={formData.category_name}
              onChange={(e) =>
                setFormData({ ...formData, category_name: e.target.value })
              }
              className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.category_name && isCategoryNameExists(formData.category_name)
                  ? "border-red-500 bg-red-50 focus:ring-red-500"
                  : "border-slate-200"
              }`}
              placeholder="Enter category name"
            />
            {formData.category_name && isCategoryNameExists(formData.category_name) && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Category name already exists! Please use a different name.
              </p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-slate-700 font-medium mb-2">
              Description
            </label>
            <textarea
              rows="4"
              maxLength={40}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter category description (optional)"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formData.category_name && isCategoryNameExists(formData.category_name)}
              className={`flex-1 px-4 py-2.5 rounded-xl transition ${
                formData.category_name && isCategoryNameExists(formData.category_name)
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {editingCategory ? "Update Category" : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;