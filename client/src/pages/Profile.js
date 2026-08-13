import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Change Password Form state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState(null); // { type: 'success' | 'danger', text: '' }

  const token = localStorage.getItem("token");
  const localUser = JSON.parse(localStorage.getItem("user"));
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch user profile from backend
      let userData = null;
      try {
        const profileRes = await axios.get(
          "http://localhost:5000/api/auth/profile",
          authConfig
        );
        userData = profileRes.data;
      } catch (err) {
        console.warn("Could not fetch /api/auth/profile, falling back to cached user details:", err);
        userData = localUser;
      }
      setProfile(userData);

      // 2. Fetch statistics based on role
      const userRole = userData?.role || localUser?.role || "citizen";
      const userEmail = userData?.email || localUser?.email;

      if (userRole === "citizen" && userEmail) {
        const appsRes = await axios.get(
          `http://localhost:5000/api/applications/user/${userEmail}`
        );
        const apps = appsRes.data || [];
        setStats({
          total: apps.length,
          pending: apps.filter(a => a.status === "Pending" || a.status === "Document Verification").length,
          processing: apps.filter(a => a.status === "Processing").length,
          approved: apps.filter(a => a.status === "Approved").length,
          rejected: apps.filter(a => a.status === "Rejected" || a.status === "Documents Rejected").length,
        });
      } else {
        const appsRes = await axios.get(
          "http://localhost:5000/api/applications"
        );
        const apps = appsRes.data || [];
        setStats({
          total: apps.length,
          pending: apps.filter(a => a.status === "Pending" || a.status === "Document Verification").length,
          processing: apps.filter(a => a.status === "Processing").length,
          approved: apps.filter(a => a.status === "Approved").length,
          rejected: apps.filter(a => a.status === "Rejected" || a.status === "Documents Rejected").length,
        });
      }
    } catch (err) {
      console.error("Error loading profile data:", err);
      setError("Failed to load profile details. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPassMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassMessage({
        type: "danger",
        text: "New password and confirm password do not match.",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPassMessage({
        type: "danger",
        text: "New password must be at least 6 characters long.",
      });
      return;
    }

    setPassLoading(true);

    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        authConfig
      );

      setPassMessage({
        type: "success",
        text: response.data.message || "Password changed successfully!",
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => setShowChangePassword(false), 2000);
    } catch (err) {
      console.error("Error changing password:", err);
      setPassMessage({
        type: "danger",
        text: err.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setPassLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getRoleBadge = (role) => {
    const r = (role || "citizen").toUpperCase();
    if (r === "ADMIN") return <span className="badge bg-dark px-3 py-2 fs-6">ADMIN</span>;
    if (r === "OPERATOR") return <span className="badge bg-info text-dark px-3 py-2 fs-6">OPERATOR</span>;
    return <span className="badge bg-primary px-3 py-2 fs-6">CITIZEN</span>;
  };

  return (
    <MainLayout>
      <div className="container py-2">
        <h2 className="fw-bold mb-4">My Account Profile</h2>

        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {loading ? (
          <div className="card shadow-sm p-5 text-center border-0">
            <div className="spinner-border text-primary mx-auto mb-3" role="status"></div>
            <p className="text-muted mb-0">Loading profile information...</p>
          </div>
        ) : (
          <div className="row g-4">
            {/* Header / Avatar Card */}
            <div className="col-12">
              <div className="card shadow-sm border-0 overflow-hidden">
                <div className="card-body p-4 bg-white">
                  <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: "90px", height: "90px", fontSize: "42px" }}
                    >
                      <i className="bi bi-person-fill"></i>
                    </div>
                    <div className="text-center text-md-start">
                      <h3 className="fw-bold mb-1">{profile?.name || "User"}</h3>
                      <p className="text-muted mb-2">
                        <i className="bi bi-envelope me-2"></i>
                        {profile?.email}
                      </p>
                      <div>{getRoleBadge(profile?.role)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Details Card */}
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-person-lines-fill text-primary me-2"></i>
                    Personal Information
                  </h5>
                </div>
                <div className="card-body p-4">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                      <span className="text-muted fw-semibold">Full Name</span>
                      <span className="fw-bold text-dark">{profile?.name || "N/A"}</span>
                    </li>
                    <li className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                      <span className="text-muted fw-semibold">Email Address</span>
                      <span className="fw-bold text-dark">{profile?.email || "N/A"}</span>
                    </li>
                    <li className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                      <span className="text-muted fw-semibold">Phone Number</span>
                      <span className="fw-bold text-dark">{profile?.phone || "N/A"}</span>
                    </li>
                    <li className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                      <span className="text-muted fw-semibold">Account Role</span>
                      <div>{getRoleBadge(profile?.role)}</div>
                    </li>
                    <li className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center border-0">
                      <span className="text-muted fw-semibold">Account Created Date</span>
                      <span className="fw-bold text-dark">
                        {formatDate(profile?.createdAt)}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Application Statistics Card */}
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-bar-chart-line-fill text-primary me-2"></i>
                    Application Statistics
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3 text-center border">
                        <small className="text-muted d-block fw-semibold mb-1">Total Applications</small>
                        <span className="fs-3 fw-bold text-primary">{stats?.total || 0}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3 text-center border">
                        <small className="text-muted d-block fw-semibold mb-1">Pending Review</small>
                        <span className="fs-3 fw-bold text-warning">{stats?.pending || 0}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3 text-center border">
                        <small className="text-muted d-block fw-semibold mb-1">Processing</small>
                        <span className="fs-3 fw-bold text-info">{stats?.processing || 0}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3 text-center border">
                        <small className="text-muted d-block fw-semibold mb-1">Approved / Completed</small>
                        <span className="fs-3 fw-bold text-success">{stats?.approved || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security Card */}
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-shield-lock-fill text-primary me-2"></i>
                    Account Security
                  </h5>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setShowChangePassword(!showChangePassword)}
                  >
                    <i className={`bi ${showChangePassword ? "bi-chevron-up" : "bi-key-fill"} me-1`}></i>
                    {showChangePassword ? "Close Form" : "Change Password"}
                  </button>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3 align-items-center">
                    <div className="col-md-4">
                      <small className="text-muted d-block fw-semibold">Password</small>
                      <span className="font-monospace fs-5">••••••••</span>
                    </div>
                    <div className="col-md-4">
                      <small className="text-muted d-block fw-semibold">Authentication Status</small>
                      <span className="badge bg-success">
                        <i className="bi bi-shield-check me-1"></i> Active & Authenticated
                      </span>
                    </div>
                    <div className="col-md-4">
                      <small className="text-muted d-block fw-semibold">Access Level</small>
                      <span className="fw-bold text-dark text-capitalize">
                        {profile?.role || "Citizen"} Portal Access
                      </span>
                    </div>
                  </div>

                  {/* Change Password Collapsible Form */}
                  {showChangePassword && (
                    <div className="mt-4 pt-4 border-top">
                      <h6 className="fw-bold mb-3">Change Account Password</h6>

                      {passMessage && (
                        <div
                          className={`alert alert-${passMessage.type} alert-dismissible fade show mb-3`}
                          role="alert"
                        >
                          {passMessage.text}
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setPassMessage(null)}
                          ></button>
                        </div>
                      )}

                      <form onSubmit={handlePasswordChangeSubmit}>
                        <div className="row g-3">
                          {/* Current Password */}
                          <div className="col-md-4">
                            <label className="form-label fw-semibold">Current Password</label>
                            <div className="input-group">
                              <input
                                type={showPasswords.current ? "text" : "password"}
                                className="form-control"
                                placeholder="Enter current password"
                                value={passwordForm.currentPassword}
                                onChange={(e) =>
                                  setPasswordForm({
                                    ...passwordForm,
                                    currentPassword: e.target.value,
                                  })
                                }
                                required
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    current: !showPasswords.current,
                                  })
                                }
                              >
                                <i
                                  className={
                                    showPasswords.current
                                      ? "bi bi-eye-slash-fill"
                                      : "bi bi-eye-fill"
                                  }
                                ></i>
                              </button>
                            </div>
                          </div>

                          {/* New Password */}
                          <div className="col-md-4">
                            <label className="form-label fw-semibold">New Password</label>
                            <div className="input-group">
                              <input
                                type={showPasswords.new ? "text" : "password"}
                                className="form-control"
                                placeholder="Enter new password"
                                value={passwordForm.newPassword}
                                onChange={(e) =>
                                  setPasswordForm({
                                    ...passwordForm,
                                    newPassword: e.target.value,
                                  })
                                }
                                required
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    new: !showPasswords.new,
                                  })
                                }
                              >
                                <i
                                  className={
                                    showPasswords.new
                                      ? "bi bi-eye-slash-fill"
                                      : "bi bi-eye-fill"
                                  }
                                ></i>
                              </button>
                            </div>
                          </div>

                          {/* Confirm Password */}
                          <div className="col-md-4">
                            <label className="form-label fw-semibold">Confirm New Password</label>
                            <div className="input-group">
                              <input
                                type={showPasswords.confirm ? "text" : "password"}
                                className="form-control"
                                placeholder="Confirm new password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) =>
                                  setPasswordForm({
                                    ...passwordForm,
                                    confirmPassword: e.target.value,
                                  })
                                }
                                required
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  setShowPasswords({
                                    ...showPasswords,
                                    confirm: !showPasswords.confirm,
                                  })
                                }
                              >
                                <i
                                  className={
                                    showPasswords.confirm
                                      ? "bi bi-eye-slash-fill"
                                      : "bi bi-eye-fill"
                                  }
                                ></i>
                              </button>
                            </div>
                          </div>

                          <div className="col-12 mt-3">
                            <button
                              type="submit"
                              className="btn btn-primary px-4 me-2"
                              disabled={passLoading}
                            >
                              {passLoading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Updating Password...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check-circle me-1"></i> Update Password
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary px-3"
                              onClick={() => setShowChangePassword(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Profile;