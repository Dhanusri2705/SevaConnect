const Service = require("../models/Service");

const defaultServices = [
  {
    name: "Aadhaar Services",
    icon: "🪪",
    category: "Identity",
    description: "Apply for Aadhaar related services and assistance.",
    documents: ["Existing Aadhaar Card", "Address Proof", "Identity Proof"],
    fee: 100,
    processingTime: "3-5 Days",
    isActive: true,
  },
  {
    name: "PAN Card",
    icon: "📄",
    category: "Identity",
    description: "Apply for new PAN card and PAN related services.",
    documents: [
      "Aadhaar Card",
      "Address Proof",
      "Date of Birth Proof",
      "Passport-size Photograph",
    ],
    fee: 100,
    processingTime: "5-7 Days",
    isActive: true,
  },
  {
    name: "Passport",
    icon: "🛂",
    category: "Travel",
    description: "Get assistance with passport application services.",
    documents: [
      "Aadhaar Card",
      "Address Proof",
      "Birth Certificate",
      "Passport-size Photograph",
    ],
    fee: 150,
    processingTime: "7-14 Days",
    isActive: true,
  },
  {
    name: "Income Certificate",
    icon: "💰",
    category: "Certificates",
    description: "Apply for an Income Certificate through SevaConnect.",
    documents: [
      "Aadhaar Card",
      "Address Proof",
      "Income Proof",
      "Passport-size Photograph",
    ],
    fee: 100,
    processingTime: "3-5 Days",
    isActive: true,
  },
  {
    name: "Community Certificate",
    icon: "📜",
    category: "Certificates",
    description: "Apply for Community Certificate services.",
    documents: [
      "Aadhaar Card",
      "Address Proof",
      "Existing Community Certificate if available",
      "Passport-size Photograph",
    ],
    fee: 100,
    processingTime: "5-7 Days",
    isActive: true,
  },
  {
    name: "Birth Certificate",
    icon: "👶",
    category: "Certificates",
    description: "Apply for Birth Certificate related services.",
    documents: [
      "Hospital Birth Record",
      "Parent/Guardian ID Proof",
      "Address Proof",
    ],
    fee: 100,
    processingTime: "3-5 Days",
    isActive: true,
  },
  {
    name: "Death Certificate",
    icon: "📃",
    category: "Certificates",
    description: "Apply for Death Certificate related services.",
    documents: [
      "Hospital/Medical Record",
      "Applicant ID Proof",
      "Address Proof",
    ],
    fee: 100,
    processingTime: "3-5 Days",
    isActive: true,
  },
  {
    name: "Driving Licence",
    icon: "🚗",
    category: "Transport",
    description: "Get assistance with Driving Licence services.",
    documents: [
      "Aadhaar Card",
      "Address Proof",
      "Age Proof",
      "Passport-size Photograph",
    ],
    fee: 150,
    processingTime: "5-10 Days",
    isActive: true,
  },
  {
    name: "Voter ID",
    icon: "🗳️",
    category: "Identity",
    description: "Apply for Voter ID related services.",
    documents: [
      "Aadhaar Card",
      "Address Proof",
      "Age Proof",
      "Passport-size Photograph",
    ],
    fee: 100,
    processingTime: "7-10 Days",
    isActive: true,
  },
  {
    name: "Government Scheme",
    icon: "🏛️",
    category: "Welfare",
    description: "Apply for various government welfare schemes.",
    documents: [
      "Aadhaar Card",
      "Address Proof",
      "Income Certificate",
      "Bank Passbook",
    ],
    fee: 50,
    processingTime: "5-7 Days",
    isActive: true,
  },
];

// Get All Services (Auto-seed if empty)
exports.getServices = async (req, res) => {
  try {
    let services = await Service.find().sort({ createdAt: -1 });

    if (services.length === 0) {
      await Service.insertMany(defaultServices);
      services = await Service.find().sort({ createdAt: -1 });
    }

    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Server error loading services." });
  }
};

// Create New Service (Admin Only)
exports.createService = async (req, res) => {
  try {
    const { name, description, category, fee, processingTime, icon, documents, isActive } = req.body;

    if (!name || !description || fee === undefined || !documents || documents.length === 0) {
      return res.status(400).json({
        message: "Service name, description, fee, and at least one required document are required.",
      });
    }

    if (Number(fee) < 0) {
      return res.status(400).json({ message: "Fee must be a valid non-negative number." });
    }

    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({ message: "A service with this name already exists." });
    }

    const service = await Service.create({
      name,
      description,
      category: category || "General Services",
      fee: Number(fee),
      processingTime: processingTime || "3-5 Days",
      icon: icon || "📄",
      documents: documents.filter((doc) => doc.trim() !== ""),
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      message: "Service created successfully.",
      service,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Failed to create service." });
  }
};

// Update Existing Service (Admin Only)
exports.updateService = async (req, res) => {
  try {
    const { name, description, category, fee, processingTime, icon, documents, isActive } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }

    if (fee !== undefined && Number(fee) < 0) {
      return res.status(400).json({ message: "Fee must be a valid non-negative number." });
    }

    if (name) service.name = name;
    if (description) service.description = description;
    if (category) service.category = category;
    if (fee !== undefined) service.fee = Number(fee);
    if (processingTime) service.processingTime = processingTime;
    if (icon) service.icon = icon;
    if (documents && Array.isArray(documents)) {
      service.documents = documents.filter((doc) => doc.trim() !== "");
    }
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();

    res.status(200).json({
      message: "Service updated successfully.",
      service,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Failed to update service." });
  }
};

// Toggle Active/Inactive Status (Admin Only)
exports.toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.status(200).json({
      message: `Service ${service.isActive ? "activated" : "deactivated"} successfully.`,
      service,
    });
  } catch (error) {
    console.error("Error toggling service status:", error);
    res.status(500).json({ message: "Failed to toggle service status." });
  }
};
