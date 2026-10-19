import React, { useState, useEffect } from "react";
import api from "../services/api";

function ServiceFormModal({ show, onClose, serviceToEdit, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Identity",
    fee: 100,
    processingTime: "3-5 Days",
    icon: "📄",
    isActive: true,
  });

  const [documents, setDocuments] = useState(["Aadhaar Card", "Address Proof"]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (serviceToEdit) {
      setFormData({
        name: serviceToEdit.name || "",
        description: serviceToEdit.description || "",
        category: serviceToEdit.category || "Identity",
        fee: serviceToEdit.fee !== undefined ? serviceToEdit.fee : 100,
        processingTime: serviceToEdit.processingTime || "3-5 Days",
        icon: serviceToEdit.icon || "📄",
        isActive: serviceToEdit.isActive !== undefined ? serviceToEdit.isActive : true,
      });
      setDocuments(
        serviceToEdit.documents && serviceToEdit.documents.length > 0
          ? [...serviceToEdit.documents]
          : ["Identity Proof"]
      );
      setErrorMsg(null);
    } else {
      setFormData({
        name: "",
        description: "",
        category: "Identity",
        fee: 100,
        processingTime: "3-5 Days",
        icon: "📄",
        isActive: true,
      });
      setDocuments(["Aadhaar Card", "Address Proof"]);
      setErrorMsg(null);
    }
  }, [serviceToEdit, show]);

  if (!show) return null;

  const token = localStorage.getItem("token");
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const handleDocumentChange = (index, value) => {
    const updated = [...documents];
    updated[index] = value;
    setDocuments(updated);
  };

  const handleAddDocument = () => {
    setDocuments([...documents, ""]);
  };

  const handleRemoveDocument = (index) => {
    if (documents.length <= 1) {
      alert("A service must require at least one document.");
      return;
    }
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanDocs = documents.map((d) => d.trim()).filter((d) => d !== "");
    if (cleanDocs.length === 0) {
      setErrorMsg("Please specify at least one required document.");
      return;
    }

    if (Number(formData.fee) < 0) {
      setErrorMsg("Service fee cannot be negative.");
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      fee: Number(formData.fee),
      documents: cleanDocs,
    };

    try {
      let response;
      if (serviceToEdit) {
        response = await api.put(
          `/api/services/${serviceToEdit._id}`,
          payload,
          authConfig
        );
      } else {
        response = await api.post(
          "/api/services",
          payload,
          authConfig
        );
      }

      alert(response.data.message || "Service saved successfully.");
      if (onSave && response.data.service) {
        onSave(response.data.service);
      }
      onClose();
    } catch (err) {
      console.error("Error saving service:", err);
      setErrorMsg(
        err.response?.data?.message || "Failed to save service. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Identity",
    "Certificates",
    "Travel",
    "Transport",
    "Welfare",
    "General Services",
  ];

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0 rounded-3">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">
              <i className={`bi ${serviceToEdit ? "bi-pencil-square" : "bi-plus-circle"} me-2`}></i>
              {serviceToEdit ? "Edit Service" : "Add New Service"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {errorMsg && (
                <div className="alert alert-danger mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {errorMsg}
                </div>
              )}

              <div className="row g-3">
                {/* Service Name */}
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Service Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Income Certificate"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Icon */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Icon / Emoji</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 💰 or 📄"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Description *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe the service details and eligibility..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                {/* Category */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fee */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Service Fee (₹) *</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="1"
                      placeholder="100"
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Processing Time */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Processing Time</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 3-5 Days"
                    value={formData.processingTime}
                    onChange={(e) =>
                      setFormData({ ...formData, processingTime: e.target.value })
                    }
                  />
                </div>

                {/* Required Documents Dynamic List */}
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold mb-0">
                      Required Documents list *
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleAddDocument}
                    >
                      <i className="bi bi-plus-lg me-1"></i> Add Document
                    </button>
                  </div>

                  {documents.map((docName, idx) => (
                    <div key={idx} className="input-group mb-2">
                      <span className="input-group-text bg-light">{idx + 1}</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Address Proof"
                        value={docName}
                        onChange={(e) => handleDocumentChange(idx, e.target.value)}
                        required
                      />
                      <button
                        className="btn btn-outline-danger"
                        type="button"
                        onClick={() => handleRemoveDocument(idx)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Active Status Checkbox */}
                <div className="col-12 mt-2">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isActiveSwitch"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                    <label className="form-check-label fw-semibold" htmlFor="isActiveSwitch">
                      Active Service (Available for citizens to apply)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-secondary px-3"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  "Save Service"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ServiceFormModal;
