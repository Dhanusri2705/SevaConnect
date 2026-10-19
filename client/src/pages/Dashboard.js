import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

function Dashboard() {
  const initialServices = [
    {
      name: "Aadhaar Services",
      icon: "🪪",
      description: "Apply for Aadhaar related services and assistance.",
    },
    {
      name: "PAN Card",
      icon: "📄",
      description: "Apply for new PAN card and PAN related services.",
    },
    {
      name: "Passport",
      icon: "🛂",
      description: "Get assistance with passport application services.",
    },
    {
      name: "Income Certificate",
      icon: "💰",
      description: "Apply for an Income Certificate through SevaConnect.",
    },
    {
      name: "Community Certificate",
      icon: "📜",
      description: "Apply for Community Certificate services.",
    },
    {
      name: "Birth Certificate",
      icon: "👶",
      description: "Apply for Birth Certificate related services.",
    },
    {
      name: "Death Certificate",
      icon: "📃",
      description: "Apply for Death Certificate related services.",
    },
    {
      name: "Driving Licence",
      icon: "🚗",
      description: "Get assistance with Driving Licence services.",
    },
    {
      name: "Voter ID",
      icon: "🗳️",
      description: "Apply for Voter ID related services.",
    },
    {
      name: "Government Scheme",
      icon: "🏛️",
      description: "Apply for various government welfare schemes.",
    },
  ];

  const [services, setServices] = useState(initialServices);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get("/api/services");
      if (response.data && response.data.length > 0) {
        // Filter only active services for citizens
        const activeServices = response.data.filter((s) => s.isActive !== false);
        setServices(activeServices);
      }
    } catch (error) {
      console.warn("Using fallback services list:", error);
    }
  };

  return (
    <MainLayout>
      <div className="container">
        {/* Welcome */}
        <div className="mb-4">
          <h2 className="fw-bold">Welcome to SevaConnect 👋</h2>
          <p className="text-muted">
            Access government and common service center facilities digitally and securely.
          </p>
        </div>

        {/* Services Heading */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold">Available Services</h3>
          <span className="badge bg-primary fs-6 px-3 py-2">
            {services.length} Active Services
          </span>
        </div>

        {/* Service Cards */}
        <div className="row">
          {services.map((service, index) => (
            <div className="col-md-6 col-lg-4 mb-4" key={service._id || index}>
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column">
                  <div className="text-center mb-3" style={{ fontSize: "45px" }}>
                    {service.icon || "📄"}
                  </div>

                  <h5 className="card-title text-center fw-bold">{service.name}</h5>

                  <p className="card-text text-muted text-center flex-grow-1">
                    {service.description}
                  </p>

                  {service.fee !== undefined && (
                    <div className="text-center mb-3">
                      <span className="badge bg-light text-primary border px-3 py-1">
                        Fee: ₹{service.fee}
                      </span>
                    </div>
                  )}

                  <div className="mt-auto d-flex justify-content-center gap-2">
                    <Link
                      to={`/apply-service?service=${encodeURIComponent(service.name)}`}
                      className="btn btn-outline-primary"
                    >
                      View Details
                    </Link>

                    <Link
                      to={`/apply-service?service=${encodeURIComponent(service.name)}`}
                      className="btn btn-primary"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;