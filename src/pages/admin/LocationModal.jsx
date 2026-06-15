/* eslint-disable no-unused-vars */
import React from "react";
import { X, Plus, Edit2, Hash, Navigation, AlertCircle } from "lucide-react";

const LocationModal = ({
  showModal,
  setShowModal,
  editingLocation,
  formData,
  setFormData,
  handleSubmit,
  generateCode,
  existingLocationNames = [], 
}) => {
  if (!showModal) return null;

  // Fungsi untuk cek duplicate name
  const isLocationNameExists = (name) => {
    if (!name) return false;
    
    // Jika sedang edit dan nama tidak berubah, skip validasi
    if (editingLocation && editingLocation.location_name === name) {
      return false;
    }
    
    return existingLocationNames.some(
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
              {editingLocation ? (
                <Edit2 size={20} className="text-blue-600" />
              ) : (
                <Plus size={20} className="text-blue-600" />
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {editingLocation ? "Edit Location" : "Add New Location"}
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
          {!editingLocation && (
            <div className="mb-4">
              <label className="block text-slate-700 font-medium mb-2">
                Location Code *
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
                    maxLength={15}
                    value={formData.location_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location_code: e.target.value,
                      })
                    }
                    readOnly
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="LOC0001"
                  />
                </div>
                <button
                  type="button"
                  onClick={generateCode}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200"
                >
                  Generate
                </button>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-slate-700 font-medium mb-2">
              Location Name *
            </label>
            <div className="relative">
              <Navigation
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                required
                maxLength={15}
                value={formData.location_name}
                onChange={(e) =>
                  setFormData({ ...formData, location_name: e.target.value })
                }
                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formData.location_name && isLocationNameExists(formData.location_name)
                    ? "border-red-500 bg-red-50 focus:ring-red-500"
                    : "border-slate-200"
                }`}
                placeholder="Enter location name"
              />
            </div>
            {formData.location_name && isLocationNameExists(formData.location_name) && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Location name already exists! Please use a different name.
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-slate-700 font-medium mb-2">
              Description
            </label>
            <textarea
              rows="3"
              maxLength={30}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter location description"
            />
          </div>

          {editingLocation && (
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
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formData.location_name && isLocationNameExists(formData.location_name)}
              className={`flex-1 px-4 py-2.5 rounded-xl transition ${
                formData.location_name && isLocationNameExists(formData.location_name)
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {editingLocation ? "Update Location" : "Save Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;