/* eslint-disable no-unused-vars */
import React from "react";
import {
  X,
  Plus,
  Edit2,
  Hash,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
} from "lucide-react";

const SupplierModal = ({
  showModal,
  setShowModal,
  editingSupplier,
  formData,
  setFormData,
  handleSubmit,
  generateCode,
  existingSupplierNames = [],
}) => {
  if (!showModal) return null;

  // Fungsi untuk cek duplicate name
  const isSupplierNameExists = (name) => {
    if (!name) return false;
    
    // Jika sedang edit dan nama tidak berubah, skip validasi
    if (editingSupplier && editingSupplier.supplier_name === name) {
      return false;
    }
    
    return existingSupplierNames.some(
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
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              {editingSupplier ? (
                <Edit2 size={20} className="text-blue-600" />
              ) : (
                <Plus size={20} className="text-blue-600" />
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
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
          {!editingSupplier && (
            <div className="mb-4">
              <label className="block text-slate-700 font-medium mb-2">
                Supplier Code *
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
                    maxLength={20}
                    value={formData.supplier_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        supplier_code: e.target.value,
                      })
                    }
                    readOnly
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SUP0001"
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
              Supplier Name *
            </label>
            <input
              type="text"
              required
              maxLength={15}
              value={formData.supplier_name}
              onChange={(e) => {
                const newName = e.target.value;
                setFormData({ ...formData, supplier_name: newName });
              }}
              className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.supplier_name && isSupplierNameExists(formData.supplier_name)
                  ? "border-red-500 bg-red-50 focus:ring-red-500"
                  : "border-slate-200"
              }`}
              placeholder="Enter supplier name"
            />
            {formData.supplier_name && isSupplierNameExists(formData.supplier_name) && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Supplier name already exists! Please use a different name.
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-slate-700 font-medium mb-2">
              Contact Person *
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                required
                maxLength={25}
                value={formData.contact_person}
                onChange={(e) =>
                  setFormData({ ...formData, contact_person: e.target.value })
                }
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contact person name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-700 font-medium mb-2">
                Phone *
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="tel"
                  required
                  maxLength={15}
                  value={formData.phone}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, phone: onlyNumbers });
                  }}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div>
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
                  maxLength={50}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@supplier.com"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-slate-700 font-medium mb-2">
              Address *
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-3 text-slate-400"
                size={18}
              />
              <textarea
                rows="3"
                required
                maxLength={100}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Complete supplier address"
              />
            </div>
          </div>

          {editingSupplier && (
            <div className="mb-6">
              <label className="block text-slate-700 font-medium mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

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
              disabled={formData.supplier_name && isSupplierNameExists(formData.supplier_name)}
              className={`flex-1 px-4 py-2.5 rounded-xl transition ${
                formData.supplier_name && isSupplierNameExists(formData.supplier_name)
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {editingSupplier ? "Update Supplier" : "Save Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;