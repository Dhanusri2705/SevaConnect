import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

function ApplyService() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const initialServiceFromUrl = searchParams.get("service") || "";

  const staticServices = {
    "Aadhaar Services": {
      description: "Apply for Aadhaar related services and assistance.",
      documents: ["Existing Aadhaar Card", "Address Proof", "Identity Proof"],
      fee: 100,
    },
    "PAN Card": {
      description: "Apply for new PAN card and PAN related services.",
      documents: ["Aadhaar Card", "Address Proof", "Date of Birth Proof", "Passport-size Photograph"],
      fee: 100,
    },
    Passport: {
      description: "Get assistance with passport application services.",
      documents: ["Aadhaar Card", "Address Proof", "Birth Certificate", "Passport-size Photograph"],
      fee: 150,
    },
    "Income Certificate": {
      description: "Apply for an Income Certificate through SevaConnect.",
      documents: ["Aadhaar Card", "Address Proof", "Income Proof", "Passport-size Photograph"],
      fee: 100,
    },
    "Community Certificate": {
      description: "Apply for Community Certificate services.",
      documents: ["Aadhaar Card", "Address Proof", "Existing Community Certificate if available", "Passport-size Photograph"],
      fee: 100,
    },
    "Birth Certificate": {
      description: "Apply for Birth Certificate related services.",
      documents: ["Hospital Birth Record", "Parent/Guardian ID Proof", "Address Proof"],
      fee: 100,
    },
    "Death Certificate": {
      description: "Apply for Death Certificate related services.",
      documents: ["Hospital/Medical Record", "Applicant ID Proof", "Address Proof"],
      fee: 100,
    },
    "Driving Licence": {
      description: "Get assistance with Driving Licence services.",
      documents: ["Aadhaar Card", "Address Proof", "Age Proof", "Passport-size Photograph"],
      fee: 150,
    },
    "Voter ID": {
      description: "Apply for Voter ID related services.",
      documents: ["Aadhaar Card", "Address Proof", "Age Proof", "Passport-size Photograph"],
      fee: 100,
    },
    "Government Scheme": {
      description: "Apply for various government welfare schemes.",
      documents: ["Aadhaar Card", "Address Proof", "Income Certificate", "Bank Passbook"],
      fee: 50,
    },
  };

  const [availableServices, setAvailableServices] = useState([]);
  const [selectedService, setSelectedService] = useState(initialServiceFromUrl || "Aadhaar Services");
  const [dbServiceDetails, setDbServiceDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    citizenName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    service: initialServiceFromUrl || "Aadhaar Services",
    description: "Application submitted via SevaConnect Citizen Portal.",
  });

  const [documents, setDocuments] = useState({});

  useEffect(() => {
    fetchServicesList();
  }, []);

  useEffect(() => {
    if (selectedService) {
      setFormData((prev) => ({ ...prev, service: selectedService }));
      fetchSingleServiceDetails(selectedService);
    }
  }, [selectedService]);

  const fetchServicesList = async () => {
    try {
      const response = await api.get("/api/services");
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const active = response.data.filter((s) => s.isActive !== false);
        setAvailableServices(active);

        if (!initialServiceFromUrl && active.length > 0) {
          setSelectedService(active[0].name);
        }
      }
    } catch (err) {
      console.warn("Using default static services list:", err);
    }
  };

  const fetchSingleServiceDetails = (serviceName) => {
    if (availableServices.length > 0) {
      const found = availableServices.find(
        (s) => s.name.toLowerCase() === serviceName.toLowerCase()
      );
      if (found) {
        setDbServiceDetails(found);
        return;
      }
    }
    setDbServiceDetails(null);
  };

  // Determine current active service metadata
  const currentService =
    dbServiceDetails ||
    staticServices[selectedService] || {
      description: "Please select a service to view required documents and details.",
      documents: ["Identity Proof", "Address Proof"],
      fee: 100,
    };

  const requiredDocList =
    currentService.documents && currentService.documents.length > 0
      ? currentService.documents
      : ["Identity Proof", "Address Proof"];

  const handleDocumentChange = (documentName, file) => {
    setDocuments((prev) => ({
      ...prev,
      [documentName]: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedService) {
      alert("Please select a service to apply.");
      return;
    }

    // Check whether all required documents are selected
    for (const docName of requiredDocList) {
      if (!documents[docName]) {
        alert(`Please upload required document: "${docName}" before submitting.`);
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Create Application Record in MongoDB
      const response = await api.post("/api/applications", {
        citizenName: formData.citizenName,
        email: formData.email,
        phone: formData.phone,
        service: selectedService,
        description: formData.description || `Application for ${selectedService}`,
      });

      const applicationId = response.data.application._id;

      // 2. Upload Each Required Document File to /api/applications/:id/documents
      for (const docName of requiredDocList) {
        const file = documents[docName];
        const uploadData = new FormData();
        uploadData.append("document", file);
        uploadData.append("documentType", docName);

        await api.post(
          `/api/applications/${applicationId}/documents`,
          uploadData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      alert("Application & all required documents submitted successfully!");
      navigate("/applications");
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.response?.data?.message || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-4" style={{ maxWidth: "750px" }}>
        {/* PAGE TITLE */}
        <div className="mb-4 text-center">
          <h2 className="fw-bold text-dark mb-1">Apply for Government Service</h2>
          <p className="text-muted">
            Complete the form below to submit your official service application.
          </p>
        </div>

        {/* SIMPLE SINGLE FORM CONTAINER */}
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Citizen Name */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">Citizen Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.citizenName}
                    onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                    required
                  />
                </div>

                {/* Email */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter 10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                {/* Selected Service */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark">Selected Service *</label>
                  <select
                    className="form-select"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                  >
                    {availableServices.length > 0
                      ? availableServices.map((service, idx) => (
                          <option key={service._id || idx} value={service.name}>
                            {service.name} (Fee: ₹{service.fee})
                          </option>
                        ))
                      : Object.keys(staticServices).map((name, idx) => (
                          <option key={idx} value={name}>
                            {name} (Fee: ₹{staticServices[name].fee})
                          </option>
                        ))}
                  </select>
                </div>

                {/* Required Documents Upload Section */}
                <div className="col-12 mt-4">
                  <label className="form-label fw-bold text-dark d-block mb-1">
                    Upload Required Documents
                  </label>
                  <small className="text-muted d-block mb-3">
                    Please upload clear copies for verification (JPG, PNG, or PDF format).
                  </small>

                  <div className="d-flex flex-column gap-3">
                    {requiredDocList.map((docName, index) => {
                      const selectedFileName = documents[docName]?.name;

                      return (
                        <div key={index} className="p-3 border rounded bg-light">
                          <label className="form-label fw-semibold text-dark mb-2">
                            {index + 1}. {docName} <span className="text-danger">*</span>
                          </label>
                          <input
                            type="file"
                            className="form-control"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) => handleDocumentChange(docName, e.target.files[0])}
                            required
                          />
                          {selectedFileName && (
                            <small className="text-success fw-bold d-block mt-1 font-monospace">
                              Attached: {selectedFileName}
                            </small>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Description */}
                <div className="col-12 mt-3">
                  <label className="form-label fw-semibold text-dark">Additional Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter any additional details or remarks for your application..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                {/* Submit Application Button */}
                <div className="col-12 mt-4 d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary py-3 fs-5 fw-bold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Submitting Application...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ApplyService;