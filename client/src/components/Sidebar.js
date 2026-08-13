import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = (user.role || "citizen").toLowerCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className="bg-dark text-white p-3 d-flex flex-column"
      style={{
        width: "250px",
        minHeight: "100vh",
      }}
    >
      <div className="text-center mb-4 pb-2 border-bottom border-secondary">
        <h5 className="fw-bold mb-0 text-white">
          <i className="bi bi-shield-lock-fill text-primary me-2"></i>
          SevaConnect
        </h5>
        <span className="badge bg-primary text-uppercase mt-2 px-3 py-1" style={{ fontSize: "11px" }}>
          {role} Portal
        </span>
      </div>

      <ul className="nav flex-column mb-auto">
        {/* CITIZEN MENU ITEMS */}
        {role === "citizen" && (
          <>
            <li className="nav-item mb-2">
              <Link
                className={`nav-link text-white rounded ${isActive("/dashboard") ? "bg-primary fw-bold" : ""}`}
                to="/dashboard"
              >
                <i className="bi bi-house-door me-2"></i> Dashboard
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link
                className={`nav-link text-white rounded ${isActive("/apply-service") ? "bg-primary fw-bold" : ""}`}
                to="/apply-service"
              >
                <i className="bi bi-file-earmark-plus me-2"></i> Apply Service
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link
                className={`nav-link text-white rounded ${isActive("/applications") ? "bg-primary fw-bold" : ""}`}
                to="/applications"
              >
                <i className="bi bi-folder-check me-2"></i> My Applications
              </Link>
            </li>
          </>
        )}

        {/* OPERATOR MENU ITEMS */}
        {role === "operator" && (
          <li className="nav-item mb-2">
            <Link
              className={`nav-link text-white rounded ${isActive("/operator") ? "bg-primary fw-bold" : ""}`}
              to="/operator"
            >
              <i className="bi bi-speedometer2 me-2"></i> Applications Dashboard
            </Link>
          </li>
        )}

        {/* ADMIN MENU ITEMS */}
        {role === "admin" && (
          <li className="nav-item mb-2">
            <Link
              className={`nav-link text-white rounded ${isActive("/admin") ? "bg-primary fw-bold" : ""}`}
              to="/admin"
            >
              <i className="bi bi-gear-fill me-2"></i> Admin Portal
            </Link>
          </li>
        )}

        {/* COMMON PROFILE LINK */}
        <li className="nav-item mb-2">
          <Link
            className={`nav-link text-white rounded ${isActive("/profile") ? "bg-primary fw-bold" : ""}`}
            to="/profile"
          >
            <i className="bi bi-person-circle me-2"></i> Profile
          </Link>
        </li>
      </ul>

      {/* LOGOUT BUTTON */}
      <div className="pt-3 border-top border-secondary mt-auto">
        <button className="btn btn-outline-danger w-100 text-start" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;