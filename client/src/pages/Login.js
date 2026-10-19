import React, { useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/api/auth/login",
        {
          email,
          password,
        }
      );

      alert(response.data.message);

      // Store JWT token
      localStorage.setItem("token", response.data.token);

      // Store user details
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      // Get user's role
      const role = response.data.user.role;

      // Redirect based on role
      if (role === "operator") {
        navigate("/operator");
      } else if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else if (error.message) {
        alert(`Server Error: ${error.message}`);
      } else {
        alert("Server Error: Unable to connect to backend server");
      }
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f7fc",
      }}
    >
      <div
        className="card shadow-lg border-0 rounded-4 p-4"
        style={{
          width: "460px",
        }}
      >

        {/* Logo */}

        <div className="text-center">

          <i
            className="bi bi-building text-primary"
            style={{
              fontSize: "70px",
            }}
          ></i>

          <h1 className="fw-bold mt-3">
            SevaConnect
          </h1>

          <p
            className="text-secondary mb-1"
            style={{
              fontSize: "20px",
            }}
          >
            Smart Common Service Center Management Platform
          </p>

          <p className="text-muted">
            Access Government Services Digitally & Securely
          </p>

        </div>

        {/* Login Form */}

        <form onSubmit={handleLogin}>

          {/* Email */}

          <div className="mb-3">

            <label className="form-label fw-semibold">
              Email
            </label>

            <div className="input-group">

              <span className="input-group-text">
                <i className="bi bi-envelope-fill"></i>
              </span>

              <input
                type="email"
                className="form-control"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>

          </div>

          {/* Password */}

          <div className="mb-4">

            <label className="form-label fw-semibold">
              Password
            </label>

            <div className="input-group">

              <span className="input-group-text">
                <i className="bi bi-lock-fill"></i>
              </span>

              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                <i
                  className={
                    showPassword
                      ? "bi bi-eye-slash-fill"
                      : "bi bi-eye-fill"
                  }
                ></i>
              </button>

            </div>

          </div>

          {/* Login Button */}

          <button
            type="submit"
            className="btn btn-primary w-100 py-2"
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Login
          </button>

        </form>

        {/* Register */}

        <div className="text-center mt-4">

          <p className="mb-2">
            Don't have an account?
          </p>

          <Link
            to="/register"
            className="btn btn-outline-primary px-4"
          >
            Register Here
          </Link>

        </div>

        <hr />

        {/* Footer */}

        <div className="text-center">

          <small className="text-muted">
            © 2026 SevaConnect
          </small>

          <br />

          <small className="text-muted">
            Powered by MERN Stack
          </small>

        </div>

      </div>
    </div>
  );
}

export default Login;