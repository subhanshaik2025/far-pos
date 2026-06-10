
export function parseItems(bill) {
  try {
    if (typeof bill.items_json === 'string') return JSON.parse(bill.items_json);
    if (Array.isArray(bill.items)) return bill.items;
    return [];
  } catch(e) { return []; }
}

export function parseBillDate(b) {
  // Normalize field names from Google Sheets
  const timestamp = b.timestamp || b.Timestamp || '';
  const date = b.date || b.Date || '';
  b = { ...b, timestamp, date };
  try {
    if (b.timestamp) {
      const t = new Date(b.timestamp);
      if (!isNaN(t.getTime())) return t;
    }
    if (b.date) {
      const s = String(b.date).trim();
      const p = s.split('/');
      if (p.length === 3) {
        const d = new Date(p[2]+'-'+p[1].padStart(2,'0')+'-'+p[0].padStart(2,'0'));
        if (!isNaN(d.getTime())) return d;
      }
      const d2 = new Date(s);
      if (!isNaN(d2.getTime())) return d2;
    }
    return new Date();
  } catch(e) { return new Date(); }
}

export function filterByDate(bills, dateStr) {
  return bills.filter(b => parseBillDate(b).toISOString().split('T')[0] === dateStr);
}

export function filterByWeek(bills) {
  const w = new Date(Date.now() - 7*86400000);
  return bills.filter(b => parseBillDate(b) >= w);
}

export function filterByMonth(bills) {
  const n = new Date();
  return bills.filter(b => {
    const d = parseBillDate(b);
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  });
}

export function getTopProducts(bills) {
  const map = {};
  bills.forEach(b => {
    const items = parseItems(b);
    items.forEach(item => {
      const name = item.name || 'Unknown';
      if (!map[name]) map[name] = { name, qty: 0, revenue: 0 };
      map[name].qty += Number(item.qty || 1);
      map[name].revenue += Number(item.price || 0) * Number(item.qty || 1);
    });
  });
  return Object.values(map).sort((a,b) => b.revenue - a.revenue).slice(0,5);
}

export function getDayWise(bills) {
  const map = {};
  bills.forEach(b => {
    const d = parseBillDate(b).toISOString().split('T')[0];
    if (!map[d]) map[d] = { date: d, total: 0, cash: 0, upi: 0, count: 0 };
    map[d].total += Number(b.total || 0);
    map[d].count++;
    if ((b.mode || b.payment_mode) === 'cash') map[d].cash += Number(b.total || 0);
    else map[d].upi += Number(b.total || 0);
  });
  return Object.values(map).sort((a,b) => b.date.localeCompare(a.date));
}
