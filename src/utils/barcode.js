// SKU + Barcode utilities
// Standard EAN-13 style codes for maximum scanner compatibility

export function generateSKU(name, category) {
  const clean = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
  const cat = clean(category) || "GEN";
  const nm = clean(name) || "ITM";
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return cat + "-" + nm + "-" + rand;
}

export function generateBarcode(sku) {
  let hash = 0;
  const s = String(sku || Date.now());
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  const num = String(Math.abs(hash)).padStart(11, "0").slice(0, 11);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(num[i] || "0") * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return num.padEnd(12, "0") + check;
}

// SMART LOOKUP: handles leading zero mismatches from scanners
export function findProductByBarcode(products, code) {
  const raw = String(code).trim();
  // Normalize: remove leading zeros
  const stripped = raw.replace(/^0+/, "");

  for (const p of products) {
    const b = String(p.barcode || "").trim();
    const bStripped = b.replace(/^0+/, "");
    if (b === raw) return p;
    if (bStripped === stripped) return p;
    // Also try zero-padded on either side
    if (b.padStart(13, "0") === raw.padStart(13, "0")) return p;
    if (b.padStart(14, "0") === raw.padStart(14, "0")) return p;
  }

  // Also try SKU match
  for (const p of products) {
    const s = String(p.sku || "").trim().toUpperCase();
    if (s === raw.toUpperCase()) return p;
  }

  return null;
}
