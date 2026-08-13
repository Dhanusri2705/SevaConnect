import React from "react";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">

        <span className="navbar-brand fw-bold">
          <i className="bi bi-building"></i> SevaConnect
        </span>

        <div className="ms-auto text-white">
          <i className="bi bi-person-circle me-2"></i>

          Welcome,
          {" "}
          {user ? user.name : "Citizen"}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;