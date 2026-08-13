import React from "react";

function ApplicationFilters({
  searchTerm = "",
  setSearchTerm,
  onSearchChange,
  statusFilter = "All",
  setStatusFilter,
  onStatusChange,
  totalCount = 0,
  filteredCount = 0,
  onClear,
  onClearFilters,
}) {
  const handleSearchChange = setSearchTerm || onSearchChange || (() => {});
  const handleStatusChange = setStatusFilter || onStatusChange || (() => {});
  const handleClear = onClear || onClearFilters || (() => {});

  const isFiltered = (searchTerm || "").trim() !== "" || statusFilter !== "All";

  return (
    <div className="card shadow-sm border-0 mb-4 bg-white">
      <div className="card-body p-3">
        <div className="row g-3 align-items-center">
          {/* Search Box */}
          <div className="col-md-5 col-lg-5">
            <label className="form-label fw-semibold mb-1 small text-secondary">
              Search Applications
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by Name, Email, or App ID..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => handleSearchChange("")}
                  title="Clear search text"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          {/* Status Filter Dropdown */}
          <div className="col-md-4 col-lg-3">
            <label className="form-label fw-semibold mb-1 small text-secondary">
              Filter by Status
            </label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Processing">Processing</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Payment Pending">Payment Pending</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="col-md-3 col-lg-2 d-flex align-items-end">
            <button
              className="btn btn-outline-secondary w-100 mt-md-4"
              onClick={handleClear}
              disabled={!isFiltered}
              title="Reset all filters"
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i>
              Clear Filters
            </button>
          </div>

          {/* Application Count Badge */}
          <div className="col-12 text-md-end text-muted small border-top pt-2 mt-2">
            <span className="fw-semibold">
              {isFiltered ? (
                <>
                  Showing <strong className="text-primary">{filteredCount}</strong> of{" "}
                  <strong>{totalCount}</strong> applications
                </>
              ) : (
                <>
                  Showing <strong className="text-primary">{totalCount}</strong> total applications
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationFilters;
