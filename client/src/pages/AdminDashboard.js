import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import DocumentVerificationModal from "../components/DocumentVerificationModal";
import StatusUpdateModal from "../components/StatusUpdateModal";
import ApplicationFilters from "../components/ApplicationFilters";

import UserManagement from "../components/UserManagement";
import UserRoleModal from "../components/UserRoleModal";

import ServiceManagement from "../components/ServiceManagement";
import ServiceFormModal from "../components/ServiceFormModal";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("applications"); // 'applications' | 'users' | 'services'

  // Data States
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Application Search & Filter State
  const [appSearchTerm, setAppSearchTerm] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("All");

  // Application Modals State
  const [selectedDocApp, setSelectedDocApp] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [selectedStatusApp, setSelectedStatusApp] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // User Management Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Service Management Modal State
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    await Promise.all([fetchApplications(), fetchUsers(), fetchServices()]);
    setLoading(false);
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/applications");
      setApplications(response.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/users");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/services");
      setServices(response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  // Callback when an application is updated
  const handleAppModalUpdate = (updatedApplication) => {
    setApplications((prev) =>
      prev.map((app) => (app._id === updatedApplication._id ? updatedApplication : app))
    );
    if (selectedDocApp?._id === updatedApplication._id) {
      setSelectedDocApp(updatedApplication);
    }
    if (selectedStatusApp?._id === updatedApplication._id) {
      setSelectedStatusApp(updatedApplication);
    }
  };

  // Callback when a user role is updated
  const handleUserRoleUpdate = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === updatedUser.id || u._id === updatedUser._id ? { ...u, role: updatedUser.role } : u))
    );
    fetchUsers();
  };

  // Callback when a service is saved or toggled
  const handleServiceSave = () => {
    fetchServices();
  };

  // Client-Side Search & Filter for Applications
  const filteredApplications = applications.filter((app) => {
    const searchLower = appSearchTerm.trim().toLowerCase();
    const formattedId = `sc-${new Date(app.createdAt || Date.now()).getFullYear()}-${app._id.slice(-6)}`.toLowerCase();
    const shortId = `#${app._id.slice(-6)}`.toLowerCase();
    const fullId = app._id.toLowerCase();

    const nameMatch = app.citizenName ? app.citizenName.toLowerCase().includes(searchLower) : false;
    const emailMatch = app.email ? app.email.toLowerCase().includes(searchLower) : false;
    const idMatch = fullId.includes(searchLower) || shortId.includes(searchLower) || formattedId.includes(searchLower);

    const matchesSearch = searchLower === "" || nameMatch || emailMatch || idMatch;

    let matchesStatus = true;
    if (appStatusFilter === "Pending") {
      matchesStatus = app.status === "Pending" || app.status === "Document Verification";
    } else if (appStatusFilter === "Processing") {
      matchesStatus = app.status === "Processing";
    } else if (appStatusFilter === "Approved") {
      matchesStatus = app.status === "Approved";
    } else if (appStatusFilter === "Rejected") {
      matchesStatus = app.status === "Rejected" || app.status === "Documents Rejected";
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="badge bg-warning text-dark">Pending</span>;
      case "Document Verification":
        return <span className="badge bg-info text-dark">Document Verification</span>;
      case "Processing":
        return <span className="badge bg-primary">Processing</span>;
      case "Approved":
        return <span className="badge bg-success">Approved</span>;
      case "Rejected":
      case "Documents Rejected":
        return <span className="badge bg-danger">{status}</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const activeServicesCount = services.filter((s) => s.isActive).length;
  const inactiveServicesCount = services.filter((s) => !s.isActive).length;

  return (
    <MainLayout>
      <div className="container-fluid">
        <h2 className="mb-4 fw-bold">Admin Portal Dashboard 🛡️</h2>

        {/* Dynamic Statistics Header */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Total Registered Users</h6>
                <h2 className="fw-bold text-dark">{users.length}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Total Applications</h6>
                <h2 className="fw-bold text-dark">{applications.length}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Active Services</h6>
                <h2 className="fw-bold text-success">{activeServicesCount}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Inactive Services</h6>
                <h2 className="fw-bold text-secondary">{inactiveServicesCount}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <ul className="nav nav-pills mb-4 bg-white p-2 rounded shadow-sm border">
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold px-4 ${activeTab === "applications" ? "active" : ""}`}
              onClick={() => setActiveTab("applications")}
            >
              <i className="bi bi-file-earmark-text me-2"></i> Applications ({applications.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold px-4 ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <i className="bi bi-people me-2"></i> User Management ({users.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold px-4 ${activeTab === "services" ? "active" : ""}`}
              onClick={() => setActiveTab("services")}
            >
              <i className="bi bi-gear-wide-connected me-2"></i> Service Management ({services.length})
            </button>
          </li>
        </ul>

        {/* TAB 1: APPLICATIONS */}
        {activeTab === "applications" && (
          <div>
            <ApplicationFilters
              searchTerm={appSearchTerm}
              setSearchTerm={setAppSearchTerm}
              statusFilter={appStatusFilter}
              setStatusFilter={setAppStatusFilter}
              totalCount={applications.length}
              filteredCount={filteredApplications.length}
              onClear={() => {
                setAppSearchTerm("");
                setAppStatusFilter("All");
              }}
            />

            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4">Service Applications List</h4>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Loading applications...</p>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="alert alert-info text-center py-4 my-3 border-0 shadow-sm">
                    <i className="bi bi-search fs-2 text-muted mb-2 d-block"></i>
                    <h5 className="fw-bold mb-1">No applications match your criteria</h5>
                    <p className="text-muted mb-3 small">
                      Try adjusting your search query or changing the status filter.
                    </p>
                    <button
                      className="btn btn-outline-primary btn-sm px-3"
                      onClick={() => {
                        setAppSearchTerm("");
                        setAppStatusFilter("All");
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-dark">
                        <tr>
                          <th>App ID</th>
                          <th>Citizen Details</th>
                          <th>Service</th>
                          <th>Status</th>
                          <th>Remarks</th>
                          <th>Submitted Date</th>
                          <th style={{ minWidth: "220px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.map((app) => (
                          <tr key={app._id}>
                            <td>
                              <small className="text-muted font-monospace">
                                #{app._id.slice(-6).toUpperCase()}
                              </small>
                            </td>

                            <td>
                              <strong>{app.citizenName}</strong>
                              <br />
                              <small className="text-muted">
                                <i className="bi bi-envelope me-1"></i>{app.email}
                              </small>
                            </td>

                            <td className="fw-semibold text-primary">{app.service}</td>

                            <td>{getStatusBadge(app.status)}</td>

                            <td>
                              {app.rejectionReason ? (
                                <small className="text-danger">
                                  <i className="bi bi-info-circle me-1"></i>
                                  {app.rejectionReason}
                                </small>
                              ) : (
                                <small className="text-muted">—</small>
                              )}
                            </td>

                            <td>
                              <small className="text-muted">
                                {new Date(app.createdAt).toLocaleDateString()}
                              </small>
                            </td>

                            <td>
                              <div className="d-flex flex-column gap-1">
                                <button
                                  className="btn btn-outline-primary btn-sm text-start"
                                  onClick={() => {
                                    setSelectedDocApp(app);
                                    setShowVerifyModal(true);
                                  }}
                                >
                                  <i className="bi bi-folder-check me-1"></i>
                                  View & Verify Docs ({app.documents ? app.documents.length : 0})
                                </button>

                                <button
                                  className="btn btn-outline-dark btn-sm text-start"
                                  onClick={() => {
                                    setSelectedStatusApp(app);
                                    setShowStatusModal(true);
                                  }}
                                >
                                  <i className="bi bi-pencil-square me-1"></i>
                                  Update Status & Remarks
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
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === "users" && (
          <UserManagement
            users={users}
            loading={loading}
            onOpenRoleModal={(user) => {
              setSelectedUser(user);
              setShowRoleModal(true);
            }}
          />
        )}

        {/* TAB 3: SERVICE MANAGEMENT */}
        {activeTab === "services" && (
          <ServiceManagement
            services={services}
            loading={loading}
            onOpenAddModal={() => {
              setSelectedService(null);
              setShowServiceModal(true);
            }}
            onOpenEditModal={(service) => {
              setSelectedService(service);
              setShowServiceModal(true);
            }}
            onRefreshServices={fetchServices}
          />
        )}
      </div>

      {/* Document Verification Modal */}
      <DocumentVerificationModal
        show={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          fetchApplications();
        }}
        application={selectedDocApp}
        onUpdate={handleAppModalUpdate}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        show={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          fetchApplications();
        }}
        application={selectedStatusApp}
        onUpdate={handleAppModalUpdate}
      />

      {/* User Role Modal */}
      <UserRoleModal
        show={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          fetchUsers();
        }}
        targetUser={selectedUser}
        onUpdate={handleUserRoleUpdate}
      />

      {/* Service Form Modal (Add & Edit) */}
      <ServiceFormModal
        show={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          fetchServices();
        }}
        serviceToEdit={selectedService}
        onSave={handleServiceSave}
      />
    </MainLayout>
  );
}

export default AdminDashboard;