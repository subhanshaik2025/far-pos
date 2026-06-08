const SALES_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw44V48--8hOrxNlwlUC_f5AdSNiZOnMoN1BG1ii4G9SozC7GNG4FN2EY3JV8MDg1lliw/exec';

export async function saveBillToSheet(bill, user) {
  try {
    const params = new URLSearchParams({
      action: 'saveBill',
      bill_id: bill.id,
      shop_phone: user.phone,
      shop_name: user.shop_name,
      items_json: JSON.stringify(bill.items),
      subtotal: bill.subtotal,
      gst: bill.gst,
      total: bill.total,
      payment_mode: bill.mode,
      date: bill.date,
      timestamp: bill.timestamp,
    });
    const res = await fetch(SALES_SCRIPT_URL + '?' + params.toString());
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('saveBillToSheet error:', err);
    return { success: false, error: 'Network error' };
  }
}

export async function getSalesFromSheet(shopName) {
  try {
    const params = new URLSearchParams({
      action: 'getSales',
      shop_name: shopName,
    });
    const res = await fetch(SALES_SCRIPT_URL + '?' + params.toString());
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('pos-bills', JSON.stringify(data.sales));
      return data.sales;
    }
  } catch (err) {
    console.error('getSalesFromSheet error:', err);
  }
  return JSON.parse(localStorage.getItem('pos-bills') || '[]');
}
