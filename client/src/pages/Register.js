import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          phone,
          password,
        }
      );

      alert(response.data.message);

      navigate("/login");

    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Server Error");
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
        style={{ width: "500px" }}
      >
        <div className="text-center mb-4">

          <i
            className="bi bi-person-plus-fill text-primary"
            style={{ fontSize: "70px" }}
          ></i>

          <h1 className="fw-bold mt-3">
            SevaConnect
          </h1>

          <p className="text-secondary mb-1 fs-5">
            Smart Common Service Center Management Platform
          </p>

          <p className="text-muted">
            Create your citizen account to access government services
          </p>

        </div>

        <form onSubmit={handleRegister}>

          <div className="mb-3">

            <label className="form-label fw-semibold">
              Full Name
            </label>

            <div className="input-group">

              <span className="input-group-text">
                <i className="bi bi-person-fill"></i>
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Enter Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

            </div>

          </div>

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

          <div className="mb-3">

            <label className="form-label fw-semibold">
              Phone Number
            </label>

            <div className="input-group">

              <span className="input-group-text">
                <i className="bi bi-telephone-fill"></i>
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Enter Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

            </div>

          </div>

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
                onClick={() => setShowPassword(!showPassword)}
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

          <button
            type="submit"
            className="btn btn-primary w-100 py-2"
          >
            <i className="bi bi-person-check-fill me-2"></i>
            Register
          </button>

        </form>

        <div className="text-center mt-4">

          <p className="mb-2">
            Already have an account?
          </p>

          <Link
            to="/login"
            className="btn btn-outline-primary px-4"
          >
            Login Here
          </Link>

        </div>

        <hr />

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

export default Register;