// SKU + Barcode utilities
// Standard EAN-13 style codes for maximum scanner compatibility

export function generateSKU(name, category) {
  const clean = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
  const cat = clean(category) || 'GEN';
  const nm = clean(name) || 'ITM';
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return cat + '-' + nm + '-' + rand;
}

export function generateBarcode(sku) {
  // Create 12-digit numeric barcode from SKU string
  let hash = 0;
  const s = String(sku || Date.now());
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  const num = String(Math.abs(hash)).padStart(11, '0').slice(0, 11);
  // EAN-13 check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(num[i] || '0') * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return num.padEnd(12, '0') + check;
}

export function findProductByBarcode(products, code) {
  const c = String(code).trim();
  return products.find(p => String(p.barcode || '').trim() === c) ||
         products.find(p => String(p.sku || '').trim().toUpperCase() === c.toUpperCase()) ||
         null;
}
