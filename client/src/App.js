import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ApplyService from "./pages/ApplyService";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import OperatorDashboard from "./pages/OperatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

        {/* Public Pages */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Citizen */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/apply-service"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <ApplyService />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <MyApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["citizen", "operator", "admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Operator */}
        <Route
          path="/operator"
          element={
            <ProtectedRoute allowedRoles={["operator"]}>
              <OperatorDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;