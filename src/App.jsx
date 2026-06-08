import { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import { getCurrentUser, isUserLoggedIn, logoutUser } from './auth';
import { INDUSTRIES } from './config';
import { generateId, calculateTotal } from './utils';
import { initializeAppData } from './loadGoogleSheet';
import { saveBillToSheet, getSalesFromSheet } from './salesSheets';

export default function POSApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [industry, setIndustry] = useState(null);
  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [cart, setCart] = useState([]);
  const [tab, setTab] = useState('billing');
  const [reportView, setReportView] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loadingBill, setLoadingBill] = useState(false);

  useEffect(() => {
    initializeAppData();
    if (isUserLoggedIn()) {
      const user = getCurrentUser();
      setCurrentUser(user);
      setIsLoggedIn(true);
      const ind = INDUSTRIES[user.industry_type];
      setIndustry(ind);
      setProducts(ind.sampleProducts || []);
      getSalesFromSheet(user.shop_name).then(sales => setBills(sales));
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    const ind = INDUSTRIES[user.industry_type];
    setIndustry(ind);
    setProducts(ind.sampleProducts || []);
    getSalesFromSheet(user.shop_name).then(sales => setBills(sales));
  };

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCart([]);
    setBills([]);
  };

  if (!isLoggedIn) return <AuthPage onLoginSuccess={handleLoginSuccess} />;

  const subtotal = cart.reduce((s, c) => s + (c.price * c.qty), 0);
  const { grandTotal, gst } = calculateTotal(subtotal, 5);

  const completeBill = async (mode) => {
    if (cart.length === 0) { alert('Cart is empty'); return; }
    setLoadingBill(true);
    const bill = {
      id: generateId('bill'),
      items: cart,
      subtotal: Math.round(subtotal),
      gst: Math.round(gst),
      total: Math.round(grandTotal),
      mode: mode,
      date: new Date().toLocaleDateString('en-IN'),
      timestamp: new Date().toISOString(),
    };
    const result = await saveBillToSheet(bill, currentUser);
    console.log('saveBill result:', result);
    const updated = [...bills, bill];
    setBills(updated);
    localStorage.setItem('pos-bills', JSON.stringify(updated));
    setCart([]);
    setLoadingBill(false);
    alert('Bill saved! Total: Rs.' + bill.total);
  };

  const parseBillDate = (b) => {
    if (b.timestamp) return new Date(b.timestamp);
    if (b.date) return new Date(b.date);
    return new Date();
  };

  const filterByDate = (bills, dateStr) =>
    bills.filter(b => parseBillDate(b).toISOString().split('T')[0] === dateStr);

  const filterByWeek = (bills) => {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    return bills.filter(b => parseBillDate(b) >= weekAgo);
  };

  const filterByMonth = (bills) => {
    const now = new Date();
    return bills.filter(b => {
      const d = parseBillDate(b);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  };

  const getTopProducts = (filteredBills) => {
    const map = {};
    filteredBills.forEach(b => {
      const items = typeof b.items_json === 'string' ? JSON.parse(b.items_json) : (b.items || []);
      items.forEach(item => {
        if (!map[item.name]) map[item.name] = { name: item.name, qty: 0, revenue: 0 };
        map[item.name].qty += item.qty;
        map[item.name].revenue += item.price * item.qty;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  };

  const getDayWiseSales = (bills) => {
    const map = {};
    bills.forEach(b => {
      const d = parseBillDate(b).toISOString().split('T')[0];
      if (!map[d]) map[d] = { date: d, total: 0, cash: 0, upi: 0, count: 0 };
      map[d].total += Number(b.total);
      map[d].count += 1;
      if ((b.mode || b.payment_mode) === 'cash') map[d].cash += Number(b.total);
      else map[d].upi += Number(b.total);
    });
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  };

  const selectedBills = reportView === 'daily' ? filterByDate(bills, selectedDate)
    : reportView === 'weekly' ? filterByWeek(bills)
    : filterByMonth(bills);

  const totalSales = selectedBills.reduce((s, b) => s + Number(b.total), 0);
  const cashSales = selectedBills.filter(b => (b.mode || b.payment_mode) === 'cash').reduce((s, b) => s + Number(b.total), 0);
  const upiSales = selectedBills.filter(b => (b.mode || b.payment_mode) === 'upi').reduce((s, b) => s + Number(b.total), 0);
  const gstTotal = selectedBills.reduce((s, b) => s + Number(b.gst || 0), 0);
  const netProfit = totalSales - gstTotal;
  const topProducts = getTopProducts(selectedBills);
  const dayWise = getDayWiseSales(reportView === 'weekly' ? filterByWeek(bills) : filterByMonth(bills));
  const maxDayTotal = Math.max(...dayWise.map(d => d.total), 1);

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#F3F3EE', minHeight: '100vh' }}>
      <div style={{ background: '#0D9488', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 24 }}>{industry?.icon}</div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{currentUser?.shop_name}</h1>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.65)', margin: 0 }}>FAR-POS v2</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'rgba(220,38,38,.3)', color: '#fff', border: '1px solid rgba(220,38,38,.5)', cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={{ display: 'flex', gap: 2, padding: '6px 12px 0', background: '#E8E8E3', overflowX: 'auto' }}>
        {industry?.features?.map((feature) => (
          <button key={feature} onClick={() => setTab(feature)} style={{ padding: '9px 16px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: tab === feature ? 700 : 500, background: tab === feature ? '#fff' : 'transparent', color: tab === feature ? '#0D9488' : '#999', border: 'none', cursor: 'pointer', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
            {feature}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', minHeight: 'calc(100vh - 120px)', padding: 16 }}>

        {tab === 'billing' && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h3 style={{ marginTop: 0 }}>Products</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                {products.map((p) => (
                  <div key={p.id} onClick={() => { const ex = cart.find(c => c.id === p.id); setCart(ex ? cart.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c) : [...cart, { ...p, qty: 1 }]); }} style={{ background: '#f9f9f9', borderRadius: 12, padding: 12, cursor: 'pointer', border: '1px solid #eee' }}>
                    <p style={{ fontWeight: 600, fontSize: 12, margin: '0 0 4px' }}>{p.name}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0D9488', margin: 0 }}>Rs.{p.price}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h3 style={{ marginTop: 0 }}>Cart</h3>
              {cart.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>No items added</p>}
              <div style={{ marginBottom: 12 }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: 10, color: '#999', margin: 0 }}>Rs.{item.price} x {item.qty}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>Rs.{(item.price * item.qty).toLocaleString()}</span>
                      <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} style={{ background: '#fee', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', color: '#DC2626', fontSize: 12 }}>x</button>
                    </div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div style={{ paddingTop: 12, borderTop: '2px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 13 }}>Subtotal</span><span>Rs.{subtotal.toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 13 }}>GST (5%)</span><span>Rs.{Math.round(gst).toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, marginBottom: 12 }}><span>Total</span><span style={{ color: '#0D9488' }}>Rs.{Math.round(grandTotal).toLocaleString()}</span></div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => completeBill('cash')} disabled={loadingBill} style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700, background: loadingBill ? '#aaa' : '#0D9488', color: '#fff', border: 'none', cursor: loadingBill ? 'not-allowed' : 'pointer' }}>{loadingBill ? 'Saving...' : 'Cash'}</button>
                    <button onClick={() => completeBill('upi')} disabled={loadingBill} style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700, background: loadingBill ? '#aaa' : '#F59E0B', color: '#fff', border: 'none', cursor: loadingBill ? 'not-allowed' : 'pointer' }}>{loadingBill ? 'Saving...' : 'UPI'}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'reports' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Reports</h3>
              <button onClick={() => getSalesFromSheet(currentUser.shop_name).then(s => setBills(s))} style={{ padding: '6px 12px', borderRadius: 8, background: '#0D9488', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>Refresh</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['daily','weekly','monthly'].map(v => (
                <button key={v} onClick={() => setReportView(v)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: reportView === v ? 700 : 500, background: reportView === v ? '#0D9488' : '#f0f0f0', color: reportView === v ? '#fff' : '#666', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }}>{v}</button>
              ))}
            </div>

            {reportView === 'daily' && (
              <div style={{ marginBottom: 16 }}>
                <input type='date' value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#E6F7F5', borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 11, color: '#666', margin: '0 0 4px' }}>Total Sales</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#0D9488', margin: 0 }}>Rs.{totalSales.toLocaleString()}</p>
                <p style={{ fontSize: 11, color: '#999', margin: '4px 0 0' }}>{selectedBills.length} bills</p>
              </div>
              <div style={{ background: '#FEF3C7', borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 11, color: '#666', margin: '0 0 4px' }}>Net Profit</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#D97706', margin: 0 }}>Rs.{netProfit.toLocaleString()}</p>
                <p style={{ fontSize: 11, color: '#999', margin: '4px 0 0' }}>After GST Rs.{gstTotal.toLocaleString()}</p>
              </div>
              <div style={{ background: '#ECFDF5', borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 11, color: '#666', margin: '0 0 4px' }}>Cash</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#059669', margin: 0 }}>Rs.{cashSales.toLocaleString()}</p>
              </div>
              <div style={{ background: '#FFF7ED', borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 11, color: '#666', margin: '0 0 4px' }}>UPI</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#F59E0B', margin: 0 }}>Rs.{upiSales.toLocaleString()}</p>
              </div>
            </div>

            {topProducts.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 10px' }}>Top Products</h4>
                {topProducts.map((p, i) => (
                  <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: i === 0 ? '#E6F7F5' : '#f9f9f9', borderRadius: 8, marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: '#0D9488' }}>#{i+1}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{p.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#999' }}>Qty: {p.qty}</p>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: '#0D9488' }}>Rs.{p.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {(reportView === 'weekly' || reportView === 'monthly') && dayWise.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 10px' }}>Day Wise Sales</h4>
                {dayWise.map(d => (
                  <div key={d.date} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#666' }}>{new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>Rs.{d.total.toLocaleString()} ({d.count} bills)</span>
                    </div>
                    <div style={{ background: '#f0f0f0', borderRadius: 4, height: 8 }}>
                      <div style={{ background: '#0D9488', borderRadius: 4, height: 8, width: (d.total / maxDayTotal * 100) + '%' }}></div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
                      <span style={{ fontSize: 10, color: '#059669' }}>Cash: Rs.{d.cash.toLocaleString()}</span>
                      <span style={{ fontSize: 10, color: '#F59E0B' }}>UPI: Rs.{d.upi.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedBills.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <p style={{ fontSize: 40, margin: 0 }}>📊</p>
                <p>No sales data for this period</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
