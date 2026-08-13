import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
  return (
    <>
      <Navbar />

      <div className="d-flex">
        <Sidebar />

        <div
          className="container-fluid p-4"
          style={{
            backgroundColor: "#f4f7fc",
            minHeight: "100vh",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export default MainLayout;