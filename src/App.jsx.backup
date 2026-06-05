import { useState, useEffect } from 'react';
import { INDUSTRIES, TRANSLATIONS } from './config';
import { generateId, calculateTotal, formatCurrency, sum, getTopItems } from './utils';
import { loadShop, saveShop, loadProducts, saveProduct, loadCustomers, saveCustomer, loadBills, saveBill } from './supabase';

export default function POSApp() {
  const [industry, setIndustry] = useState(null);
  const [shop, setShop] = useState(null);
  const [lang, setLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [cart, setCart] = useState([]);
  const [tab, setTab] = useState('billing');
  const [search, setSearch] = useState('');
  const [billCounter, setBillCounter] = useState(1001);
  const [loaded, setLoaded] = useState(false);

  const t = TRANSLATIONS[lang];

  // Load data on mount
  useEffect(() => {
    (async () => {
      const saved = localStorage.getItem('pos-industry');
      if (saved) {
        const ind = JSON.parse(saved);
        setIndustry(ind);
        const s = await loadShop();
        const p = await loadProducts(s?.id || '');
        const c = await loadCustomers(s?.id || '');
        const b = await loadBills(s?.id || '');
        setShop(s);
        setProducts(p || ind.sampleProducts || []);
        setCustomers(c || []);
        setBills(b || []);
        setLoaded(true);
      }
    })();
  }, []);

  const selectIndustry = (key) => {
    const ind = INDUSTRIES[key];
    localStorage.setItem('pos-industry', JSON.stringify(ind));
    setIndustry(ind);
    setProducts(ind.sampleProducts || []);
  };

  const setupShop = async (e) => {
    e.preventDefault();
    const shopData = {
      id: generateId('shop'),
      name: e.target.shopName.value,
      owner: e.target.ownerName.value || 'Owner',
      industry_type: industry.id,
      language: lang,
      created_at: new Date(),
    };
    await saveShop(shopData);
    localStorage.setItem('pos-shop', JSON.stringify(shopData));
    setShop(shopData);
  };

  const addProduct = async (e) => {
    e.preventDefault();
    const newProduct = {
      id: generateId('prod'),
      name: e.target.name.value,
      price: parseFloat(e.target.price.value),
      stock: parseFloat(e.target.stock.value) || 0,
      category: e.target.category.value,
      gst: 5,
      unit: 'pcs',
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    await saveProduct(shop.id, newProduct);
    localStorage.setItem('pos-products', JSON.stringify(updated));
    e.target.reset();
  };

  const completeSale = async (mode) => {
    if (cart.length === 0) return;
    
    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const { grandTotal, gst } = calculateTotal(subtotal, 5);
    
    const bill = {
      id: generateId('bill'),
      num: billCounter,
      items: cart,
      subtotal,
      gst: Math.round(gst),
      total: Math.round(grandTotal),
      mode,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      shop_id: shop.id,
      created_at: new Date(),
    };

    const updated = [bill, ...bills];
    setBills(updated);
    await saveBill(shop.id, bill);
    localStorage.setItem('pos-bills', JSON.stringify(updated));
    setBillCounter(billCounter + 1);
    setCart([]);
    alert(`Bill #${bill.num} completed! Total: ₹${bill.total}`);
  };

  if (!industry) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #E6F7F5, #F3F3EE)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Noto Sans', sans-serif" }}>
        <div style={{ maxWidth: 900, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0D9488', marginBottom: 8 }}>🏪 ShopEasy POS v2</h1>
            <p style={{ fontSize: 16, color: '#666', lineHeight: 1.6 }}>Multi-Industry Point of Sale System</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {Object.entries(INDUSTRIES).map(([key, ind]) => (
              <div key={key} onClick={() => selectIndustry(key)} style={{ background: '#fff', borderRadius: 16, padding: 24, cursor: 'pointer', border: '2px solid #eee', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0D9488'; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{ind.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{ind.name}</h3>
                <p style={{ fontSize: 12, color: '#999', lineHeight: 1.5, marginBottom: 14 }}>{ind.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div style={{ background: '#F3F3EE', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Noto Sans', sans-serif" }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0D9488', marginBottom: 24 }}>Setup Your Shop</h2>
          <form onSubmit={setupShop}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Shop Name</label>
              <input type="text" name="shopName" required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14 }} placeholder="My Shop" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Owner Name</label>
              <input type="text" name="ownerName" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14 }} placeholder="Your Name" />
            </div>
            <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, background: '#0D9488', color: '#fff', border: 'none', cursor: 'pointer' }}>Get Started</button>
          </form>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const { grandTotal, gst } = calculateTotal(subtotal, 5);
  const todayBills = bills.filter(b => b.date === new Date().toLocaleDateString());
  const todaySales = sum(todayBills, 'total');
  const topProducts = getTopItems(
    cart.length > 0 ? cart : products,
    'price',
    5
  );

  return (
    <div style={{ fontFamily: "'Noto Sans', sans-serif", background: '#F3F3EE', minHeight: '100vh', color: '#1a1a1a' }}>
      {/* HEADER */}
      <div style={{ background: '#0D9488', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 24 }}>{industry.icon}</div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{shop.name}</h1>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.65)' }}>ShopEasy POS v2</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setLang(lang === 'en' ? 'te' : 'en')} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,.2)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {lang === 'en' ? 'తెలుగు' : 'EN'}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 2, padding: '6px 12px 0', background: '#E8E8E3', overflowX: 'auto' }}>
        {industry.features.map((feature) => (
          <button
            key={feature}
            onClick={() => setTab(feature)}
            style={{
              padding: '9px 16px',
              borderRadius: '8px 8px 0 0',
              fontSize: 13,
              fontWeight: tab === feature ? 700 : 500,
              background: tab === feature ? '#fff' : 'transparent',
              color: tab === feature ? '#0D9488' : '#999',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
            }}
          >
            {feature}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ background: '#fff', minHeight: 'calc(100vh - 120px)', padding: 16 }}>
        {tab === 'billing' && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {/* PRODUCTS */}
            <div style={{ flex: '1 1 55%', minWidth: 250 }}>
              <input
                type="text"
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0e0e0', marginBottom: 12, fontSize: 14 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setCart(prev => {
                      const ex = prev.find(c => c.id === p.id);
                      return ex ? prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c) : [...prev, { ...p, qty: 1 }];
                    })}
                    style={{ background: '#f9f9f9', borderRadius: 12, padding: 12, cursor: 'pointer', border: '1.5px solid #eee', transition: 'all 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0D9488'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(13,148,136,.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <p style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{p.name}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0D9488' }}>₹{p.price}</p>
                    {p.stock !== undefined && <p style={{ fontSize: 10, color: p.stock < 10 ? '#DC2626' : '#999' }}>{p.stock} left</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* CART */}
            <div style={{ flex: '1 1 40%', minWidth: 250, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>🧾 {t.cart}</h3>
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 320px)', marginBottom: 12 }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</p>
                      <p style={{ fontSize: 10, color: '#999' }}>₹{item.price} × {item.qty}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => setCart(prev => prev.map(c => c.id === item.id ? { ...c, qty: c.qty - 1 } : c).filter(c => c.qty > 0))} style={{ width: 28, height: 28, borderRadius: '50%', background: '#FEF2F2', color: '#DC2626', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>−</button>
                      <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => setCart(prev => prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))} style={{ width: 28, height: 28, borderRadius: '50%', background: '#E6F7F5', color: '#0D9488', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>+</button>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 55, textAlign: 'right' }}>₹{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ paddingTop: 12, borderTop: '2px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginBottom: 3 }}>
                  <span>{t.subtotal}</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginBottom: 8 }}>
                  <span>{t.gst}</span>
                  <span>₹{Math.round(gst).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, margin: '8px 0 12px' }}>
                  <span>{t.grandTotal}</span>
                  <span style={{ color: '#0D9488' }}>₹{Math.round(grandTotal).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => completeSale('cash')} style={{ flex: 2, padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700, background: cart.length ? '#0D9488' : '#ddd', color: '#fff', border: 'none', cursor: 'pointer' }}>💵 Cash</button>
                  <button onClick={() => completeSale('credit')} style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700, background: cart.length ? '#F59E0B' : '#ddd', color: '#fff', border: 'none', cursor: 'pointer' }}>📒 Khata</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>📦 {t.inventory}</h3>
              <button onClick={() => {
                const name = prompt('Product name:');
                const price = prompt('Price:');
                const stock = prompt('Stock:');
                if (name && price && stock) {
                  const p = { id: generateId('prod'), name, price: parseFloat(price), stock: parseFloat(stock), category: 'Uncategorized', gst: 5, unit: 'pcs' };
                  setProducts([...products, p]);
                }
              }} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#0D9488', color: '#fff', border: 'none', cursor: 'pointer' }}>+ Add Product</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #e0e0e0' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600 }}>Product</th>
                    <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>Price</th>
                    <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600 }}>Stock</th>
                    <th style={{ textAlign: 'center', padding: '12px', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px', fontWeight: 500 }}>{p.name}</td>
                      <td style={{ textAlign: 'right', padding: '12px' }}>₹{p.price}</td>
                      <td style={{ textAlign: 'right', padding: '12px', color: p.stock < 10 ? '#DC2626' : '#059669', fontWeight: 600 }}>{p.stock}</td>
                      <td style={{ textAlign: 'center', padding: '12px' }}>
                        <span style={{ fontSize: 11, background: p.stock < 10 ? '#FEF2F2' : '#E6F7F5', color: p.stock < 10 ? '#DC2626' : '#059669', padding: '4px 8px', borderRadius: 4, fontWeight: 600 }}>
                          {p.stock < 10 ? '⚠️ Low' : '✓ OK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'khata' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📒 {t.khata}</h3>
            <p style={{ color: '#999' }}>Credit tracking feature coming soon for {industry.name}</p>
          </div>
        )}

        {tab === 'reports' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📊 {t.reports}</h3>
            
            {/* Daily Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
              <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 16, border: '1px solid #e0e0e0' }}>
                <p style={{ fontSize: 11, color: '#999', fontWeight: 600, marginBottom: 4 }}>Today's Sales</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#0D9488' }}>₹{todaySales.toLocaleString()}</p>
                <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{todayBills.length} bills</p>
              </div>
              <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 16, border: '1px solid #e0e0e0' }}>
                <p style={{ fontSize: 11, color: '#999', fontWeight: 600, marginBottom: 4 }}>Total Bills</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#0D9488' }}>{bills.length}</p>
                <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>All time</p>
              </div>
              <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 16, border: '1px solid #e0e0e0' }}>
                <p style={{ fontSize: 11, color: '#999', fontWeight: 600, marginBottom: 4 }}>Avg Bill Value</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#0D9488' }}>₹{bills.length > 0 ? Math.round(sum(bills, 'total') / bills.length).toLocaleString() : '0'}</p>
                <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Per transaction</p>
              </div>
            </div>

            {/* Recent Bills */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Recent Bills</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #e0e0e0' }}>
                      <th style={{ textAlign: 'left', padding: '10px', fontWeight: 600 }}>Bill #</th>
                      <th style={{ textAlign: 'left', padding: '10px', fontWeight: 600 }}>Date</th>
                      <th style={{ textAlign: 'right', padding: '10px', fontWeight: 600 }}>Total</th>
                      <th style={{ textAlign: 'center', padding: '10px', fontWeight: 600 }}>Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.slice(0, 10).map((b) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px', fontWeight: 500 }}>BILL{String(b.num).padStart(6, '0')}</td>
                        <td style={{ padding: '10px' }}>{b.date} {b.time}</td>
                        <td style={{ textAlign: 'right', padding: '10px', fontWeight: 600 }}>₹{b.total.toLocaleString()}</td>
                        <td style={{ textAlign: 'center', padding: '10px' }}>
                          <span style={{ fontSize: 10, background: b.mode === 'cash' ? '#E6F7F5' : '#FEF2F2', color: b.mode === 'cash' ? '#059669' : '#DC2626', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                            {b.mode === 'cash' ? '💵 Cash' : '📒 Khata'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
