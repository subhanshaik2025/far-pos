// FAR-POS feature guard — fails if any shipped feature is missing
const fs = require('fs');

const CHECKS = [
  // [file, must-contain string, feature name]
  ['src/App.jsx', "import BillingTab", 'Billing tab import'],
  ['src/App.jsx', "import CustomersTab", 'Customers tab import'],
  ['src/App.jsx', "import BarcodeScanner", 'Scanner import'],
  ['src/App.jsx', "import BarcodeLabels", 'Labels import'],
  ['src/App.jsx', "completeBill=async(mode,customer)", 'completeBill accepts customer'],
  ['src/App.jsx', "customerPhone:(customer", 'Bill stores customer phone'],
  ['src/App.jsx', "customerName:(customer", 'Bill stores customer name'],
  ['src/App.jsx', "bills={bills}", 'bills passed to BillingTab'],
  ['src/App.jsx', "onOpenScanner={()=>setShowScanner(true)}", 'Scanner opener passed'],
  ['src/App.jsx', "tab==='customers'", 'Customers tab renders'],
  ['src/App.jsx', "'customers'", 'Customers in tab list'],
  ['src/App.jsx', "<BarcodeScanner", 'Scanner modal renders'],
  ['src/App.jsx', "<BarcodeLabels", 'Labels modal renders'],
  ['src/App.jsx', "autoAssignSKU", 'Auto-assign SKU'],
  ['src/App.jsx', "handleBarcodeScan", 'Scan handler'],
  ['src/App.jsx', "shopSettings.gstPercent !== undefined", 'GST=0% fix'],
  ['src/App.jsx', "queueBill", 'Offline queue wired'],
  ['src/App.jsx', "sanitizeProducts", 'Validation layer wired'],
  ['src/App.jsx', "setLastBillForShare", 'Optional WhatsApp'],

  ['src/components/BillingTab.jsx', "onOpenScanner }", 'BillingTab accepts scanner prop'],
  ['src/components/BillingTab.jsx', "bills,", 'BillingTab accepts bills'],
  ['src/components/BillingTab.jsx', "Scan Barcode", 'Scan button visible'],
  ['src/components/BillingTab.jsx', "custPhone", 'Customer capture'],
  ['src/components/BillingTab.jsx', "Repeat customer", 'Repeat detection'],
  ['src/components/BillingTab.jsx', "pay('cash')", 'Cash uses pay wrapper'],
  ['src/components/BillingTab.jsx', "pay('upi')", 'UPI uses pay wrapper'],

  ['src/components/CustomersTab.jsx', "customerPhone", 'Customers reads phone'],
  ['src/components/ReportsTab.jsx', "InsightsCard", 'Smart Insights wired'],
  ['src/components/ReportsTab.jsx', "localDateStr", 'Date fix in Reports'],
  ['src/components/InsightsCard.jsx', "Smart Insights", 'Insights component'],

  ['src/components/BarcodeScanner.jsx', "BrowserMultiFormatReader", 'Bundled ZXing'],
  ['src/components/BarcodeScanner.jsx', "BarcodeFormat.EAN_13", 'Fast format hints'],
  ['src/components/BarcodeScanner.jsx', "Start Camera", 'iOS start button'],
  ['src/components/BarcodeScanner.jsx', "submitManual", 'Manual entry fallback'],

  ['src/components/BarcodeLabels.jsx', "100.01mm", 'Oddy ST-12 width'],
  ['src/components/BarcodeLabels.jsx', "44.15mm", 'Oddy ST-12 height'],
  ['src/components/BarcodeLabels.jsx', "JsBarcode", 'Barcode renderer'],

  ['src/utils/barcode.js', "generateSKU", 'SKU generator'],
  ['src/utils/barcode.js', "findProductByBarcode", 'Barcode lookup'],
  ['src/utils/barcode.js', "stripped", 'Leading-zero tolerance'],

  ['src/utils/billUtils.js', "localDateStr", 'Local date util'],
  ['src/utils/billUtils.js', "sanitizeProducts", 'Product sanitizer'],
  ['src/utils/billUtils.js', "sku: p.sku", 'SKU survives sanitize'],
  ['src/utils/billUtils.js', "barcode: p.barcode", 'Barcode survives sanitize'],

  ['src/utils/syncQueue.js', "flushQueue", 'Offline sync'],
  ['src/salesSheets.js', "customer_phone", 'Customer to Sheets'],

  ['src/AdminApp.jsx', "removeBill", 'Admin remove bill'],
  ['src/AdminApp.jsx', "whatsappVendor", 'Admin WhatsApp'],
  ['src/AdminApp.jsx', "Revenue by Vendor", 'Admin analytics'],

  ['src/utils/syncQueue.js', 'attempts < 10', 'Retry cap'],
  ['src/salesSheets.js', 'bill.gstPercent !== undefined', 'GST 0% to Sheets'],
  ['src/main.jsx', "controllerchange", 'Auto-update reload'],
  ['public/sw.js', "skipWaiting", 'SW instant activate'],
  ['public/sw.js', "clients.claim", 'SW claims tabs'],
];

// Files that must simply exist
const FILES = [
  'src/App.jsx', 'src/AuthPage.jsx', 'src/AdminApp.jsx', 'src/main.jsx',
  'src/salesSheets.js', 'src/config.js',
  'src/components/BillingTab.jsx', 'src/components/HistoryTab.jsx',
  'src/components/ReportsTab.jsx', 'src/components/CustomersTab.jsx',
  'src/components/InsightsCard.jsx', 'src/components/BarcodeScanner.jsx',
  'src/components/BarcodeLabels.jsx',
  'src/utils/theme.js', 'src/utils/billUtils.js', 'src/utils/barcode.js',
  'src/utils/syncQueue.js', 'public/sw.js',
];

let failed = 0;
let passed = 0;
const missing = [];

FILES.forEach(f => {
  if (!fs.existsSync(f)) { missing.push('MISSING FILE: ' + f); failed++; }
  else passed++;
});

CHECKS.forEach(([file, needle, name]) => {
  if (!fs.existsSync(file)) { missing.push('[' + name + '] file gone: ' + file); failed++; return; }
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes(needle)) { missing.push('[' + name + '] broken in ' + file); failed++; }
  else passed++;
});

console.log('');
console.log('  FAR-POS FEATURE GUARD');
console.log('  ' + '-'.repeat(40));
console.log('  Passed: ' + passed);
console.log('  Failed: ' + failed);

if (failed > 0) {
  console.log('');
  missing.forEach(m => console.log('  X  ' + m));
  console.log('');
  console.log('  BUILD BLOCKED - a shipped feature is missing.');
  console.log('  Fix it, or run: git checkout src/  to undo local changes.');
  console.log('');
  process.exit(1);
}

console.log('  All features intact. Safe to deploy.');
console.log('');
