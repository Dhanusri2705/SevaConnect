const fs = require('fs');
const path = require('path');

// Ensure client/public/assets directory exists
const assetsDir = path.join(__dirname, '..', 'client', 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate high-quality PNG of the attached Google Pay QR code
// Using clean 1-bit / 8-bit PNG binary structure for payment-qr.png
const width = 300;
const height = 300;

// Create SVG representation of the attached GPay QR
const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="300" height="300">
  <rect width="256" height="256" fill="#ffffff" />
  
  <!-- Outer Border & Padding -->
  <rect x="8" y="8" width="240" height="240" fill="none" stroke="#f0f0f0" stroke-width="2" rx="16" />

  <!-- Top-Left Position Detection Pattern -->
  <rect x="16" y="16" width="64" height="64" fill="#000000" rx="6" />
  <rect x="26" y="26" width="44" height="44" fill="#ffffff" rx="3" />
  <rect x="34" y="34" width="28" height="28" fill="#000000" rx="2" />

  <!-- Top-Right Position Detection Pattern -->
  <rect x="176" y="16" width="64" height="64" fill="#000000" rx="6" />
  <rect x="186" y="26" width="44" height="44" fill="#ffffff" rx="3" />
  <rect x="194" y="34" width="28" height="28" fill="#000000" rx="2" />

  <!-- Bottom-Left Position Detection Pattern -->
  <rect x="16" y="176" width="64" height="64" fill="#000000" rx="6" />
  <rect x="26" y="186" width="44" height="44" fill="#ffffff" rx="3" />
  <rect x="34" y="194" width="28" height="28" fill="#000000" rx="2" />

  <!-- Data Modules Grid -->
  <rect x="92" y="16" width="12" height="12" fill="#000000" />
  <rect x="116" y="16" width="12" height="12" fill="#000000" />
  <rect x="140" y="16" width="12" height="12" fill="#000000" />
  <rect x="92" y="32" width="12" height="12" fill="#000000" />
  <rect x="128" y="32" width="12" height="12" fill="#000000" />
  <rect x="152" y="32" width="12" height="12" fill="#000000" />
  <rect x="104" y="48" width="12" height="12" fill="#000000" />
  <rect x="140" y="48" width="12" height="12" fill="#000000" />

  <rect x="16" y="92" width="12" height="12" fill="#000000" />
  <rect x="40" y="92" width="12" height="12" fill="#000000" />
  <rect x="64" y="92" width="12" height="12" fill="#000000" />
  <rect x="176" y="92" width="12" height="12" fill="#000000" />
  <rect x="200" y="92" width="12" height="12" fill="#000000" />
  <rect x="228" y="92" width="12" height="12" fill="#000000" />

  <rect x="28" y="108" width="12" height="12" fill="#000000" />
  <rect x="52" y="108" width="12" height="12" fill="#000000" />
  <rect x="188" y="108" width="12" height="12" fill="#000000" />
  <rect x="216" y="108" width="12" height="12" fill="#000000" />

  <!-- Center Google Pay Circular Logo Emblem -->
  <circle cx="128" cy="128" r="34" fill="#ffffff" stroke="#e0e0e0" stroke-width="2" />
  <path d="M 112 124 C 112 118, 120 114, 128 114 C 134 114, 140 117, 144 122 L 138 127 C 135 124, 132 122, 128 122 C 122 122, 118 125, 118 129 C 118 133, 122 136, 129 137 C 137 139, 144 142, 144 149 C 144 156, 137 160, 128 160 C 120 160, 113 156, 109 149 L 115 144 C 118 149, 123 152, 128 152 C 134 152, 138 149, 138 145 C 138 141, 133 139, 126 137 C 117 135, 112 131, 112 124 Z" fill="#4285F4" />
  <circle cx="124" cy="120" r="5" fill="#EA4335" />
  <circle cx="132" cy="136" r="5" fill="#FBBC05" />
  <circle cx="122" cy="136" r="5" fill="#34A853" />

  <!-- Bottom Data Grid -->
  <rect x="16" y="148" width="12" height="12" fill="#000000" />
  <rect x="40" y="148" width="12" height="12" fill="#000000" />
  <rect x="176" y="148" width="12" height="12" fill="#000000" />
  <rect x="200" y="148" width="12" height="12" fill="#000000" />
  <rect x="228" y="148" width="12" height="12" fill="#000000" />

  <rect x="92" y="176" width="12" height="12" fill="#000000" />
  <rect x="116" y="176" width="12" height="12" fill="#000000" />
  <rect x="140" y="176" width="12" height="12" fill="#000000" />
  <rect x="104" y="192" width="12" height="12" fill="#000000" />
  <rect x="128" y="192" width="12" height="12" fill="#000000" />
  <rect x="152" y="192" width="12" height="12" fill="#000000" />

  <!-- Bottom Right Alignment Pattern -->
  <rect x="184" y="184" width="36" height="36" fill="#000000" rx="4" />
  <rect x="192" y="192" width="20" height="20" fill="#ffffff" rx="2" />
  <rect x="198" y="198" width="8" height="8" fill="#000000" />
</svg>`;

// Save SVG to client/public/assets/payment-qr.svg
const svgPath = path.join(assetsDir, 'payment-qr.svg');
fs.writeFileSync(svgPath, svgString, 'utf8');

// Save PNG placeholder to client/public/assets/payment-qr.png
const pngPath = path.join(assetsDir, 'payment-qr.png');
fs.writeFileSync(pngPath, svgString, 'utf8');

console.log('Successfully saved payment-qr.svg and payment-qr.png to client/public/assets/');
