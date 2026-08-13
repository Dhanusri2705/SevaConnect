const fs = require("fs");
const path = require("path");

/**
 * Creates a valid PDF 1.4 buffer with custom title, watermark, fields & footer
 */
function buildPdfBuffer({ title, watermark, fields, notice }) {
  const sanitize = (str) =>
    String(str || "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");

  let streamCommands = [];

  // Background card outline box
  streamCommands.push("0.95 0.96 0.98 rg 20 20 572 752 re f");
  streamCommands.push("0.1 0.3 0.6 RG 3 w 30 30 552 732 re s");

  // Header Banner Box
  streamCommands.push("0.11 0.38 0.76 rg 30 700 552 62 re f");

  // Header Text
  streamCommands.push("BT /F2 18 Tf 1.0 1.0 1.0 rg 50 735 Td (SEVACONNECT E-SEVAI PORTAL) Tj ET");
  streamCommands.push(`BT /F2 13 Tf 0.9 0.95 1.0 rg 50 712 Td (${sanitize(title)}) Tj ET`);

  // Watermark Banner (Bold Warning Box)
  streamCommands.push("1.0 0.92 0.8 rg 50 655 512 32 re f");
  streamCommands.push("0.8 0.2 0.1 RG 1.5 w 50 655 512 32 re s");
  streamCommands.push(`BT /F2 10 Tf 0.8 0.1 0.1 rg 60 666 Td (${sanitize(watermark)}) Tj ET`);

  // Section Title
  streamCommands.push("BT /F2 14 Tf 0.1 0.2 0.4 rg 50 620 Td (PROVISIONAL SERVICE DOCUMENT ACKNOWLEDGEMENT) Tj ET");
  streamCommands.push("0.7 0.7 0.7 RG 1 w 50 610 Td 512 0 l s");

  // Fields Table
  let currentY = 580;
  fields.forEach(({ label, value }) => {
    streamCommands.push(`BT /F2 11 Tf 0.3 0.3 0.3 rg 60 ${currentY} Td (${sanitize(label)}:) Tj ET`);
    streamCommands.push(`BT /F1 11 Tf 0.1 0.1 0.1 rg 240 ${currentY} Td (${sanitize(value)}) Tj ET`);
    currentY -= 26;
  });

  // Notice Box at Bottom
  streamCommands.push("0.9 0.93 0.98 rg 50 90 512 80 re f");
  streamCommands.push("0.3 0.5 0.8 RG 1 w 50 90 512 80 re s");
  streamCommands.push("BT /F2 11 Tf 0.1 0.3 0.6 rg 65 150 Td (Academic Demonstration & Tracking Notice:) Tj ET");
  streamCommands.push(`BT /F1 9 Tf 0.2 0.2 0.2 rg 65 130 Td (${sanitize(notice)}) Tj ET`);
  streamCommands.push("BT /F1 9 Tf 0.4 0.4 0.4 rg 65 108 Td (Generated automatically via SevaConnect CSC Workflow Manager.) Tj ET");

  // Official Seal Box
  streamCommands.push("0.1 0.5 0.2 RG 2 w 410 180 130 50 re s");
  streamCommands.push("BT /F2 10 Tf 0.1 0.5 0.2 rg 420 210 Td (SEVACONNECT) Tj ET");
  streamCommands.push("BT /F2 9 Tf 0.1 0.5 0.2 rg 420 195 Td (VERIFIED & ISSUED) Tj ET");

  const contentStream = streamCommands.join("\n");

  const pdfTemplate = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
6 0 obj
<< /Length ${Buffer.byteLength(contentStream)} >>
stream
${contentStream}
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000315 00000 n 
0000000391 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${450 + Buffer.byteLength(contentStream)}
%%EOF`;

  return Buffer.from(pdfTemplate);
}

/**
 * Generate provisional service document PDF and save to uploads/generated
 */
exports.generateServiceDocument = async (application) => {
  try {
    const outputDir = path.join(__dirname, "..", "uploads", "generated");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const shortId = `#${application._id.toString().slice(-6).toUpperCase()}`;
    const formattedDate = new Date(application.createdAt || Date.now()).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    let title = `${application.service} - Temporary Document`;
    let watermark = "SAMPLE / PROVISIONAL DOCUMENT - NOT A GOVERNMENT-ISSUED DOCUMENT";
    let notice = "This document is provisionally generated for verification and academic demonstration.";
    let fields = [
      { label: "Application ID", value: shortId },
      { label: "Full System ID", value: application._id.toString() },
      { label: "Applicant Name", value: application.citizenName },
      { label: "Contact Email", value: application.email },
      { label: "Contact Phone", value: application.phone || "N/A" },
      { label: "Service Type", value: application.service },
      { label: "Application Date", value: formattedDate },
      { label: "Verification Status", value: "Document Verified & Approved" },
    ];

    const serviceName = (application.service || "").toLowerCase();

    if (serviceName.includes("aadhaar")) {
      title = "Provisional Aadhaar Identity Slip";
      watermark = "SAMPLE / PROVISIONAL DOCUMENT - NOT A GOVERNMENT-ISSUED AADHAAR";
      notice = "Simulated Aadhaar verification slip for SevaConnect CSC platform demonstration.";
      fields.push(
        { label: "Virtual ID (Demo)", value: `9876 - 5432 - ${application._id.toString().slice(-4)} - 1098` },
        { label: "Date of Birth", value: "XX/XX/XXXX (Verified via Hospital Proof)" },
        { label: "Permanent Address", value: "Registered Residence, India" }
      );
    } else if (serviceName.includes("pan")) {
      title = "Provisional PAN Card Slip";
      watermark = "SAMPLE / PROVISIONAL DOCUMENT - NOT AN OFFICIAL PAN CARD";
      notice = "Simulated PAN card application slip for SevaConnect CSC platform demonstration.";
      fields.push(
        { label: "PAN Reference No", value: `PAN-SC-2026-${application._id.toString().slice(-6).toUpperCase()}` },
        { label: "Status", value: "Verification Complete - Subject to Final Payment" }
      );
    } else if (serviceName.includes("birth")) {
      title = "Provisional Birth Certificate";
      watermark = "SAMPLE / PROVISIONAL DOCUMENT - NOT AN OFFICIAL BIRTH CERTIFICATE";
      notice = "Simulated Birth Certificate generated via SevaConnect Common Service Center.";
      fields.push(
        { label: "Registration No", value: `BIRTH-2026-${application._id.toString().slice(-6).toUpperCase()}` },
        { label: "Child / Applicant Name", value: application.citizenName }
      );
    }

    const pdfBuffer = buildPdfBuffer({ title, watermark, fields, notice });
    const fileName = `generated_${serviceName.replace(/[^a-z0-9]/gi, "_")}_${application._id}.pdf`;
    const relativePath = `uploads/generated/${fileName}`;
    const fullPath = path.join(__dirname, "..", relativePath);

    fs.writeFileSync(fullPath, pdfBuffer);

    return relativePath.replace(/\\/g, "/");
  } catch (error) {
    console.error("Failed to generate PDF document:", error);
    return "";
  }
};
