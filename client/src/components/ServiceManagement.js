import React, { useState } from "react";
import api from "../services/api";

function ServiceManagement({
  services,
  loading,
  onOpenAddModal,
  onOpenEditModal,
  onRefreshServices,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [togglingId, setTogglingId] = useState(null);

  const token = localStorage.getItem("token");
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const handleToggleActive = async (service) => {
    const actionText = service.isActive ? "deactivate" : "activate";
    if (
      !window.confirm(
        `Are you sure you want to ${actionText} the "${service.name}" service?`
      )
    ) {
      return;
    }

    setTogglingId(service._id);

    try {
      const response = await api.put(
        `/api/services/${service._id}/toggle`,
        {},
        authConfig
      );

      alert(response.data.message || `Service ${actionText}d successfully.`);
      if (onRefreshServices) {
        onRefreshServices();
      }
    } catch (err) {
      console.error("Error toggling service status:", err);
      alert(err.response?.data?.message || "Failed to change service status.");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredServices = services.filter((service) => {
    const searchLower = searchTerm.trim().toLowerCase();
    const nameMatch = service.name ? service.name.toLowerCase().includes(searchLower) : false;
    const descMatch = service.description
      ? service.description.toLowerCase().includes(searchLower)
      : false;

    const matchesSearch = searchLower === "" || nameMatch || descMatch;

    const matchesCategory =
      categoryFilter === "All" ||
      (service.category &&
        service.category.toLowerCase() === categoryFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && service.isActive) ||
      (statusFilter === "Inactive" && !service.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    "All",
    "Identity",
    "Certificates",
    "Travel",
    "Transport",
    "Welfare",
    "General Services",
  ];

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
          <div>
            <h4 className="fw-bold mb-0">
              <i className="bi bi-gear-wide-connected text-primary me-2"></i>
              Service Management
            </h4>
            <small className="text-muted">
              Configure SevaConnect services, fees, and required citizen documents.
            </small>
          </div>
          <div>
            <button className="btn btn-primary px-3" onClick={onOpenAddModal}>
              <i className="bi bi-plus-lg me-1"></i> Add New Service
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="row g-3 mb-4">
          <div className="col-md-5 col-lg-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search services by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          <div className="col-md-4 col-lg-3">
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories
                .filter((c) => c !== "All")
                .map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          <div className="col-md-3 col-lg-2">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          {(searchTerm || categoryFilter !== "All" || statusFilter !== "All") && (
            <div className="col-md-2 col-lg-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("All");
                  setStatusFilter("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Services Table */}
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="alert alert-info text-center py-4 my-2">
            <i className="bi bi-file-earmark-x fs-2 d-block mb-2 text-muted"></i>
            <h6 className="fw-bold mb-1">No services found</h6>
            <p className="small text-muted mb-0">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Service Fee</th>
                  <th>Processing Time</th>
                  <th>Required Documents</th>
                  <th>Status</th>
                  <th style={{ minWidth: "180px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-3">{service.icon || "📄"}</span>
                        <div>
                          <strong className="text-dark d-block">{service.name}</strong>
                          <small className="text-muted d-inline-block text-truncate" style={{ maxWidth: "220px" }}>
                            {service.description}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge bg-light text-dark border">
                        {service.category || "General"}
                      </span>
                    </td>

                    <td className="fw-bold text-primary">₹{service.fee}</td>

                    <td>
                      <small className="text-muted">{service.processingTime || "3-5 Days"}</small>
                    </td>

                    <td>
                      <div className="d-flex flex-wrap gap-1" style={{ maxWidth: "260px" }}>
                        {service.documents && service.documents.length > 0 ? (
                          service.documents.map((doc, idx) => (
                            <span key={idx} className="badge bg-info text-dark" style={{ fontSize: "11px" }}>
                              ✓ {doc}
                            </span>
                          ))
                        ) : (
                          <small className="text-muted">None specified</small>
                        )}
                      </div>
                    </td>

                    <td>
                      {service.isActive ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </td>

                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => onOpenEditModal(service)}
                          title="Edit service details"
                        >
                          <i className="bi bi-pencil-fill me-1"></i> Edit
                        </button>
                        <button
                          className={`btn ${service.isActive ? "btn-outline-danger" : "btn-outline-success"}`}
                          onClick={() => handleToggleActive(service)}
                          disabled={togglingId === service._id}
                          title={service.isActive ? "Deactivate service" : "Activate service"}
                        >
                          {togglingId === service._id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : service.isActive ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceManagement;
