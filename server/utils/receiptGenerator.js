const fs = require("fs");
const path = require("path");

function buildReceiptPdfBuffer({ receiptNumber, applicationId, citizenName, service, amount, paymentDate, paymentId, orderId, permanentStatus }) {
  const sanitize = (str) =>
    String(str || "")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");

  let streamCommands = [];

  // Card outline box
  streamCommands.push("0.96 0.98 0.96 rg 20 20 572 752 re f");
  streamCommands.push("0.1 0.5 0.2 RG 3 w 30 30 552 732 re s");

  // Header Banner Box
  streamCommands.push("0.1 0.5 0.25 rg 30 700 552 62 re f");

  // Header Text
  streamCommands.push("BT /F2 18 Tf 1.0 1.0 1.0 rg 50 735 Td (SEVACONNECT E-SEVAI PORTAL) Tj ET");
  streamCommands.push("BT /F2 14 Tf 0.9 1.0 0.9 rg 50 712 Td (OFFICIAL SERVICE FEE PAYMENT RECEIPT) Tj ET");

  // Paid Stamp Banner Box
  streamCommands.push("0.85 0.95 0.85 rg 50 645 512 40 re f");
  streamCommands.push("0.1 0.6 0.2 RG 2 w 50 645 512 40 re s");
  streamCommands.push("BT /F2 16 Tf 0.1 0.5 0.2 rg 70 660 Td (STATUS: PAYMENT CONFIRMED & PAID [PAID]) Tj ET");

  // Fields Line Divider
  streamCommands.push("0.8 0.8 0.8 RG 1 w 50 625 Td 512 0 l s");

  let fields = [
    { label: "Receipt Number", value: receiptNumber },
    { label: "Application ID", value: `#${applicationId.toString().slice(-6).toUpperCase()}` },
    { label: "Full System ID", value: applicationId.toString() },
    { label: "Citizen Name", value: citizenName },
    { label: "Service Name", value: service },
    { label: "Amount Paid", value: `INR Rs. ${amount}` },
    { label: "Payment Date", value: paymentDate },
    { label: "Payment Transaction ID", value: paymentId },
    { label: "Razorpay Order ID", value: orderId },
    { label: "Payment Gateway Status", value: "PAID / SUCCESSFUL" },
    { label: "Permanent Document Dispatch", value: permanentStatus || "DISPATCHED" },
  ];

  let currentY = 595;
  fields.forEach(({ label, value }) => {
    streamCommands.push(`BT /F2 11 Tf 0.3 0.3 0.3 rg 60 ${currentY} Td (${sanitize(label)}:) Tj ET`);
    streamCommands.push(`BT /F1 11 Tf 0.1 0.1 0.1 rg 240 ${currentY} Td (${sanitize(value)}) Tj ET`);
    currentY -= 28;
  });

  // Footer Box
  streamCommands.push("0.9 0.95 0.9 rg 50 90 512 70 re f");
  streamCommands.push("0.2 0.5 0.3 RG 1 w 50 90 512 70 re s");
  streamCommands.push("BT /F2 10 Tf 0.1 0.4 0.2 rg 65 135 Td (Thank you for using SevaConnect CSC Management Portal.) Tj ET");
  streamCommands.push("BT /F1 9 Tf 0.3 0.3 0.3 rg 65 115 Td (This is an electronically verified payment receipt for academic demonstration.) Tj ET");

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

exports.generateReceiptPdf = ({ receiptNumber, applicationId, citizenName, service, amount, paymentDate, paymentId, orderId, permanentStatus }) => {
  return buildReceiptPdfBuffer({ receiptNumber, applicationId, citizenName, service, amount, paymentDate, paymentId, orderId, permanentStatus });
};
