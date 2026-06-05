import { useState, useEffect, useRef } from "react";

// ===== LANGUAGE PACK =====
const L = {
  en: {
    billing: "Billing", inventory: "Inventory", khata: "Khata", reports: "Reports", settings: "Settings",
    search: "Search products or scan barcode...", cart: "Current Bill", total: "Subtotal", pay: "Cash / UPI",
    credit: "Khata (Credit)", qty: "Qty", price: "Price", amount: "Amount", stock: "Stock", product: "Product",
    unit: "Unit", category: "Category", customer: "Customer", phone: "Phone", balance: "Credit Balance",
    lastVisit: "Last Visit", sendReminder: "WhatsApp Reminder", markPaid: "Record Payment", billNo: "Bill #",
    gst: "GST", grandTotal: "Grand Total", discount: "Disc.", items: "items", clearCart: "Clear",
    printBill: "Print", dailySummary: "Today's Summary", totalSales: "Total Sales", totalBills: "Bills",
    cashCollected: "Cash / UPI", creditGiven: "Credit Given", lowStock: "Low Stock Alerts",
    allCat: "All", noResults: "No products found", addProduct: "Add Product", editProduct: "Edit Product",
    save: "Save", cancel: "Cancel", delete: "Delete", name: "Name", nameTe: "Telugu Name", barcode: "Barcode",
    costPrice: "Cost Price", sellingPrice: "Selling Price", gstRate: "GST %", stockQty: "Stock Qty",
    lowStockAt: "Low Stock Alert At", shopName: "Shop Name", ownerName: "Owner Name", address: "Address",
    gstNo: "GST Number", language: "Language", selectCustomer: "Select customer (optional)",
    addCustomer: "Add Customer", totalOutstanding: "Total Outstanding", customersWithCredit: "customers with credit",
    noPending: "No pending credit", paymentReceived: "Payment Received", enterAmount: "Enter amount",
    billHistory: "Recent Bills", profit: "Est. Profit", topProducts: "Top Selling Products",
    weeklySales: "This Week", qtySold: "Qty Sold", revenue: "Revenue", date: "Date", mode: "Mode",
    paidSuccess: "Payment Successful!", khataSuccess: "Added to Khata!", savedSuccess: "Saved!",
    paymentRecorded: "Payment Recorded!", time: "Time", reorder: "Reorder", cashPay: "Cash", upiPay: "UPI",
    walk_in: "Walk-in Customer", today: "Today", yesterday: "Yesterday", thisWeek: "This Week",
    noData: "No data yet. Start billing!", shopSetup: "Setup Your Shop", getStarted: "Get Started",
    welcome: "Welcome to ShopEasy POS", setupDesc: "Enter your shop details to get started",
  },
  te: {
    billing: "బిల్లింగ్", inventory: "స్టాక్", khata: "ఖాతా", reports: "రిపోర్ట్స్", settings: "సెట్టింగ్స్",
    search: "ఉత్పత్తులు వెతకండి...", cart: "ప్రస్తుత బిల్లు", total: "మొత్తం", pay: "నగదు / UPI",
    credit: "ఖాతా (అరువు)", qty: "పరిమాణం", price: "ధర", amount: "మొత్తం", stock: "స్టాక్", product: "ఉత్పత్తి",
    unit: "యూనిట్", category: "వర్గం", customer: "కస్టమర్", phone: "ఫోన్", balance: "అరువు బ్యాలన్స్",
    lastVisit: "చివరి సందర్శన", sendReminder: "WhatsApp రిమైండర్", markPaid: "చెల్లింపు నమోదు", billNo: "బిల్లు #",
    gst: "GST", grandTotal: "మొత్తం బిల్లు", discount: "డిస్కౌంట్", items: "వస్తువులు", clearCart: "క్లియర్",
    printBill: "ప్రింట్", dailySummary: "ఈ రోజు సారాంశం", totalSales: "మొత్తం అమ్మకాలు", totalBills: "బిల్లులు",
    cashCollected: "నగదు / UPI", creditGiven: "అరువు", lowStock: "తక్కువ స్టాక్",
    allCat: "అన్నీ", noResults: "ఉత్పత్తులు లేవు", addProduct: "ఉత్పత్తి జోడించు", editProduct: "మార్పు చేయండి",
    save: "సేవ్", cancel: "రద్దు", delete: "తొలగించు", name: "పేరు", nameTe: "తెలుగు పేరు", barcode: "బార్‌కోడ్",
    costPrice: "కొనుగోలు ధర", sellingPrice: "అమ్మకపు ధర", gstRate: "GST %", stockQty: "స్టాక్ పరిమాణం",
    lowStockAt: "తక్కువ స్టాక్ హెచ్చరిక", shopName: "దుకాణం పేరు", ownerName: "యజమాని పేరు", address: "చిరునామా",
    gstNo: "GST నంబర్", language: "భాష", selectCustomer: "కస్టమర్ ఎంచుకోండి (ఐచ్ఛికం)",
    addCustomer: "కస్టమర్ జోడించు", totalOutstanding: "మొత్తం బాకీ", customersWithCredit: "బాకీ ఉన్న కస్టమర్లు",
    noPending: "బాకీ లేదు", paymentReceived: "చెల్లింపు అందింది", enterAmount: "మొత్తం నమోదు చేయండి",
    billHistory: "ఇటీవలి బిల్లులు", profit: "అంచనా లాభం", topProducts: "అత్యధిక అమ్మకాలు",
    weeklySales: "ఈ వారం", qtySold: "అమ్మిన పరిమాణం", revenue: "ఆదాయం", date: "తేదీ", mode: "విధానం",
    paidSuccess: "చెల్లింపు విజయవంతం!", khataSuccess: "ఖాతాలో జమ!", savedSuccess: "సేవ్ అయింది!",
    paymentRecorded: "చెల్లింపు నమోదు!", time: "సమయం", reorder: "ఆర్డర్", cashPay: "నగదు", upiPay: "UPI",
    walk_in: "వాక్-ఇన్ కస్టమర్", today: "ఈ రోజు", yesterday: "నిన్న", thisWeek: "ఈ వారం",
    noData: "డేటా లేదు. బిల్లింగ్ ప్రారంభించండి!", shopSetup: "మీ షాప్ సెటప్ చేయండి", getStarted: "ప్రారంభించండి",
    welcome: "ShopEasy POS కి స్వాగతం", setupDesc: "ప్రారంభించడానికి మీ షాప్ వివరాలు నమోదు చేయండి",
  },
};

const defaultProducts = [
  { id: "p1", name: "Toor Dal", te: "తూర్ పప్పు", price: 140, cost: 120, stock: 25, unit: "kg", barcode: "890001", cat: "Grocery", gst: 5, low: 10 },
  { id: "p2", name: "Basmati Rice", te: "బాస్మతి బియ్యం", price: 95, cost: 82, stock: 50, unit: "kg", barcode: "890002", cat: "Grocery", gst: 5, low: 10 },
  { id: "p3", name: "Sunflower Oil", te: "సన్‌ఫ్లవర్ నూనె", price: 180, cost: 155, stock: 12, unit: "L", barcode: "890003", cat: "Grocery", gst: 5, low: 5 },
  { id: "p4", name: "Sugar", te: "చక్కెర", price: 45, cost: 38, stock: 40, unit: "kg", barcode: "890004", cat: "Grocery", gst: 5, low: 10 },
  { id: "p5", name: "Surf Excel 1kg", te: "సర్ఫ్ ఎక్సెల్", price: 210, cost: 185, stock: 18, unit: "pkt", barcode: "890005", cat: "FMCG", gst: 18, low: 8 },
  { id: "p6", name: "Parle-G Biscuit", te: "పార్లే-జి బిస్కెట్", price: 10, cost: 8, stock: 100, unit: "pkt", barcode: "890006", cat: "Snacks", gst: 12, low: 20 },
  { id: "p7", name: "Amul Butter 100g", te: "అముల్ వెన్న", price: 56, cost: 48, stock: 15, unit: "pkt", barcode: "890007", cat: "Dairy", gst: 12, low: 5 },
  { id: "p8", name: "Maggi Noodles", te: "మ్యాగీ నూడుల్స్", price: 14, cost: 12, stock: 60, unit: "pkt", barcode: "890008", cat: "Snacks", gst: 12, low: 15 },
  { id: "p9", name: "Vim Bar", te: "విమ్ బార్", price: 10, cost: 8, stock: 45, unit: "bar", barcode: "890009", cat: "FMCG", gst: 18, low: 10 },
  { id: "p10", name: "Brooke Bond Tea", te: "బ్రూక్ బాండ్ టీ", price: 165, cost: 140, stock: 20, unit: "pkt", barcode: "890010", cat: "Grocery", gst: 5, low: 8 },
  { id: "p11", name: "Colgate 100g", te: "కోల్‌గేట్ పేస్ట్", price: 55, cost: 45, stock: 22, unit: "pkt", barcode: "890011", cat: "FMCG", gst: 18, low: 8 },
  { id: "p12", name: "Atta 5kg", te: "గోధుమ పిండి", price: 260, cost: 225, stock: 30, unit: "bag", barcode: "890012", cat: "Grocery", gst: 5, low: 8 },
  { id: "p13", name: "Lays Chips", te: "లేస్ చిప్స్", price: 20, cost: 16, stock: 50, unit: "pkt", barcode: "890013", cat: "Snacks", gst: 12, low: 15 },
  { id: "p14", name: "Clinic Plus", te: "క్లినిక్ ప్లస్", price: 86, cost: 72, stock: 16, unit: "btl", barcode: "890014", cat: "FMCG", gst: 18, low: 5 },
  { id: "p15", name: "Amul Milk 500ml", te: "అముల్ పాలు", price: 29, cost: 26, stock: 35, unit: "pkt", barcode: "890015", cat: "Dairy", gst: 0, low: 10 },
];

const defaultCustomers = [
  { id: "c1", name: "Ravi Kumar", phone: "9876543210", credit: 1250, visits: 45, lastVisit: "2026-06-04" },
  { id: "c2", name: "Lakshmi Devi", phone: "9876543211", credit: 0, visits: 32, lastVisit: "2026-06-05" },
  { id: "c3", name: "Suresh Babu", phone: "9876543212", credit: 3400, visits: 28, lastVisit: "2026-05-28" },
  { id: "c4", name: "Padma Rao", phone: "9876543213", credit: 780, visits: 19, lastVisit: "2026-06-01" },
  { id: "c5", name: "Venkat Reddy", phone: "9876543214", credit: 2100, visits: 52, lastVisit: "2026-06-03" },
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today = () => new Date().toISOString().split("T")[0];
const nowTime = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

// ===== STORAGE HELPERS (localStorage) =====
function loadData(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}
function saveData(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error("Save error:", e); }
}

export default function POSApp() {
  const [loaded, setLoaded] = useState(false);
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("billing");
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);
  const [billCounter, setBillCounter] = useState(1001);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [selCustomer, setSelCustomer] = useState("");
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const searchRef = useRef(null);
  const t = L[lang];

  // ===== LOAD DATA =====
  useEffect(() => {
    const s = loadData("pos-shop", null);
    const p = loadData("pos-products", defaultProducts);
    const c = loadData("pos-customers", defaultCustomers);
    const b = loadData("pos-bills", []);
    const bc = loadData("pos-bill-counter", 1001);
    const ln = loadData("pos-lang", "en");
    setShop(s); setProducts(p); setCustomers(c); setBills(b); setBillCounter(bc); setLang(ln);
    setLoaded(true);
  }, []);

  // ===== SAVE ON CHANGE =====
  useEffect(() => { if (loaded) saveData("pos-products", products); }, [products]);
  useEffect(() => { if (loaded) saveData("pos-customers", customers); }, [customers]);
  useEffect(() => { if (loaded) saveData("pos-bills", bills); }, [bills]);
  useEffect(() => { if (loaded) saveData("pos-bill-counter", billCounter); }, [billCounter]);
  useEffect(() => { if (loaded) saveData("pos-lang", lang); }, [lang]);

  const showToast = (msg, icon = "✅") => { setToast({ msg, icon }); setTimeout(() => setToast(null), 2000); };

  // ===== CART LOGIC =====
  const addToCart = (p) => {
    if (p.stock <= 0) return;
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      if (ex) {
        if (ex.qty >= p.stock) return prev;
        return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const updateQty = (id, d) => setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + d) } : c).filter(c => c.qty > 0));
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const totalGst = cart.reduce((s, c) => s + Math.round(c.price * c.qty * (c.gst || 0) / 100), 0);
  const grandTotal = subtotal + totalGst;
  const totalCost = cart.reduce((s, c) => s + (c.cost || 0) * c.qty, 0);

  const completeSale = (mode) => {
    if (cart.length === 0) return;
    const isCredit = mode === "credit";
    const bill = {
      id: uid(), num: billCounter, items: cart.map(c => ({ id: c.id, name: c.name, te: c.te, qty: c.qty, price: c.price, gst: c.gst, total: c.price * c.qty })),
      subtotal, gst: totalGst, total: grandTotal, cost: totalCost, mode: isCredit ? "credit" : mode,
      customerId: selCustomer || null, customerName: selCustomer ? customers.find(c => c.id === selCustomer)?.name : t.walk_in,
      date: today(), time: nowTime(), createdAt: Date.now(),
    };
    setBills(prev => [bill, ...prev]);
    setBillCounter(bc => bc + 1);
    // Deduct stock
    setProducts(prev => prev.map(p => { const ci = cart.find(c => c.id === p.id); return ci ? { ...p, stock: Math.max(0, p.stock - ci.qty) } : p; }));
    // Update customer credit
    if (isCredit && selCustomer) {
      setCustomers(prev => prev.map(c => c.id === selCustomer ? { ...c, credit: c.credit + grandTotal, lastVisit: today(), visits: c.visits + 1 } : c));
    } else if (selCustomer) {
      setCustomers(prev => prev.map(c => c.id === selCustomer ? { ...c, lastVisit: today(), visits: c.visits + 1 } : c));
    }
    showToast(isCredit ? t.khataSuccess : t.paidSuccess, isCredit ? "📒" : "✅");
    setCart([]); setSelCustomer("");
  };

  // ===== COMPUTED =====
  const categories = ["All", ...new Set(products.map(p => p.cat))];
  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || (p.te && p.te.includes(search)) || (p.barcode && p.barcode.includes(search));
    const mc = catFilter === "All" || p.cat === catFilter;
    return ms && mc;
  });
  const todayBills = bills.filter(b => b.date === today());
  const todayStats = {
    sales: todayBills.reduce((s, b) => s + b.total, 0),
    bills: todayBills.length,
    cash: todayBills.filter(b => b.mode !== "credit").reduce((s, b) => s + b.total, 0),
    credit: todayBills.filter(b => b.mode === "credit").reduce((s, b) => s + b.total, 0),
    profit: todayBills.reduce((s, b) => s + (b.total - (b.cost || 0) - b.gst), 0),
  };
  const lowStockItems = products.filter(p => p.stock <= (p.low || 10)).sort((a, b) => a.stock - b.stock);
  const totalCredit = customers.reduce((s, c) => s + c.credit, 0);

  // ===== KEYBOARD SHORTCUTS =====
  useEffect(() => {
    const h = (e) => {
      if (modal || payModal) return;
      if (e.key === "F2") { e.preventDefault(); setTab("billing"); setTimeout(() => searchRef.current?.focus(), 100); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [modal, payModal]);

  if (!loaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#999" }}>Loading...</div>;

  // ===== SHOP SETUP =====
  if (!shop) return <ShopSetup t={t} lang={lang} setLang={setLang} onSave={(s) => { setShop(s); saveData("pos-shop", s); }} />;

  return (
    <div style={{ fontFamily: "'Noto Sans', 'Noto Sans Telugu', system-ui, sans-serif", background: "#F3F3EE", minHeight: "100vh", color: "#1a1a1a", fontSize: 14 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}button{cursor:pointer;border:none;font-family:inherit}input,select,textarea{font-family:inherit}
        .sh::-webkit-scrollbar{width:4px;height:4px}.sh::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px}
        .pc{background:#fff;border-radius:12px;padding:12px;cursor:pointer;transition:all .15s;border:1.5px solid #eee}
        .pc:hover{border-color:#0D9488;box-shadow:0 4px 16px rgba(13,148,136,.08)}.pc:active{transform:scale(.97)}
        .qb{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;transition:all .12s}
        .qb:active{transform:scale(.85)}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:200;animation:fi .15s}
        @keyframes fi{from{opacity:0}to{opacity:1}}@keyframes su{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        .mbox{background:#fff;border-radius:16px;width:92%;max-width:480px;max-height:90vh;overflow-y:auto;animation:su .25s ease-out;padding:24px}
        .inp{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid #e0e0e0;font-size:14px;outline:none;transition:border .2s;background:#FAFAF8}
        .inp:focus{border-color:#0D9488}
        .toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:12px;z-index:300;font-size:14px;font-weight:600;display:flex;gap:8px;align-items:center;animation:su .3s ease-out;box-shadow:0 8px 30px rgba(0,0,0,.2)}
        .stat{background:#fff;border-radius:14px;padding:16px;text-align:center;flex:1;min-width:90px;border:1.5px solid #f0f0f0}
        .krow{background:#fff;border-radius:14px;padding:16px;margin-bottom:10px;border:1.5px solid #eee;transition:border .15s}.krow:hover{border-color:#0D9488}
      `}</style>

      {/* TOAST */}
      {toast && <div className="toast">{toast.icon} {toast.msg}</div>}

      {/* MODALS */}
      {modal && <div className="overlay" onClick={() => setModal(null)}><div className="mbox" onClick={e => e.stopPropagation()}>
        {modal.type === "product" && <ProductForm t={t} lang={lang} product={modal.data} categories={categories.filter(c=>c!=="All")}
          onSave={(p) => { if (modal.data) { setProducts(prev => prev.map(x => x.id === p.id ? p : x)); } else { setProducts(prev => [...prev, { ...p, id: uid() }]); } setModal(null); showToast(t.savedSuccess); }}
          onDelete={modal.data ? () => { setProducts(prev => prev.filter(x => x.id !== modal.data.id)); setModal(null); } : null}
          onClose={() => setModal(null)} />}
        {modal.type === "customer" && <CustomerForm t={t} lang={lang}
          onSave={(c) => { setCustomers(prev => [...prev, { ...c, id: uid(), credit: 0, visits: 0, lastVisit: today() }]); setModal(null); showToast(t.savedSuccess); }}
          onClose={() => setModal(null)} />}
      </div></div>}

      {payModal && <div className="overlay" onClick={() => setPayModal(null)}><div className="mbox" onClick={e => e.stopPropagation()}>
        <PaymentModal t={t} lang={lang} customer={payModal} onClose={() => setPayModal(null)}
          onPay={(amt) => { setCustomers(prev => prev.map(c => c.id === payModal.id ? { ...c, credit: Math.max(0, c.credit - amt) } : c)); setPayModal(null); showToast(t.paymentRecorded, "💰"); }} />
      </div></div>}

      {/* HEADER */}
      <div style={{ background: "#0D9488", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏪</div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{shop.name || "ShopEasy POS"}</h1>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,.65)" }}>{t.billNo}{billCounter} • {new Date().toLocaleDateString(lang === "te" ? "te-IN" : "en-IN")}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", borderRadius: 7, overflow: "hidden", border: "1.5px solid rgba(255,255,255,.4)" }}>
            {[["en", "EN"], ["te", "తె"]].map(([k, v]) => (
              <button key={k} onClick={() => setLang(k)} style={{ padding: "4px 12px", fontSize: 12, fontWeight: 700, background: lang === k ? "#fff" : "transparent", color: lang === k ? "#0D9488" : "rgba(255,255,255,.8)", transition: "all .15s" }}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="sh" style={{ display: "flex", gap: 2, padding: "6px 12px 0", background: "#E8E8E3", overflowX: "auto" }}>
        {[
          { key: "billing", icon: "🧾" }, { key: "inventory", icon: "📦" },
          { key: "khata", icon: "📒" }, { key: "reports", icon: "📊" },
        ].map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)} style={{
            padding: "9px 18px", borderRadius: "10px 10px 0 0", fontSize: 13, fontWeight: tab === tb.key ? 700 : 500,
            background: tab === tb.key ? "#fff" : "transparent", color: tab === tb.key ? "#0D9488" : "#999",
            boxShadow: tab === tb.key ? "0 -2px 8px rgba(0,0,0,.04)" : "none", whiteSpace: "nowrap", transition: "all .15s",
          }}>{tb.icon} {t[tb.key]}</button>
        ))}
      </div>

      {/* === BILLING TAB === */}
      {tab === "billing" && (
        <div style={{ display: "flex", flexWrap: "wrap", background: "#fff", minHeight: "calc(100vh - 96px)" }}>
          {/* LEFT: Products */}
          <div style={{ flex: "1 1 56%", minWidth: 280, padding: 14, borderRight: "1px solid #f0f0f0" }}>
            <div style={{ position: "relative", marginBottom: 10 }}>
              <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search}
                className="inp" style={{ paddingLeft: 38, fontSize: 14 }} />
              <span style={{ position: "absolute", left: 12, top: 11, fontSize: 15, opacity: .35 }}>🔍</span>
            </div>
            <div className="sh" style={{ display: "flex", gap: 5, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
              {categories.map(c => (
                <button key={c} onClick={() => setCatFilter(c)} style={{
                  padding: "5px 13px", borderRadius: 18, fontSize: 12, fontWeight: catFilter === c ? 700 : 500,
                  background: catFilter === c ? "#0D9488" : "#F3F3EE", color: catFilter === c ? "#fff" : "#777", whiteSpace: "nowrap", transition: "all .12s",
                }}>{c === "All" ? t.allCat : c}</button>
              ))}
              <button onClick={() => setModal({ type: "product", data: null })} style={{ padding: "5px 13px", borderRadius: 18, fontSize: 12, fontWeight: 600, background: "#E6F7F5", color: "#0D9488", whiteSpace: "nowrap" }}>+ {t.addProduct}</button>
            </div>
            <div className="sh" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(145px,1fr))", gap: 8, maxHeight: "calc(100vh - 230px)", overflowY: "auto" }}>
              {filtered.length === 0 && <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#ccc", padding: 30 }}>{t.noResults}</p>}
              {filtered.map(p => (
                <div key={p.id} className="pc" onClick={() => addToCart(p)} onContextMenu={e => { e.preventDefault(); setModal({ type: "product", data: p }); }}>
                  <div style={{ marginBottom: 6 }}>
                    <p style={{ fontWeight: 600, fontSize: 12.5, lineHeight: 1.3 }}>{lang === "te" && p.te ? p.te : p.name}</p>
                    <p style={{ fontSize: 10, color: "#bbb", marginTop: 1 }}>{lang === "te" ? p.name : p.te || ""}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 15, color: "#0D9488" }}>₹{p.price}</span>
                    <span style={{ fontSize: 10, color: p.stock <= (p.low||10) ? "#DC2626" : "#bbb", fontWeight: p.stock <= (p.low||10) ? 700 : 400 }}>
                      {p.stock} {p.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Cart */}
          <div style={{ flex: "1 1 40%", minWidth: 270, display: "flex", flexDirection: "column", background: "#FAFAF8" }}>
            <div style={{ padding: "14px 14px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>🧾 {t.cart}</h2>
              {cart.length > 0 && <button onClick={() => setCart([])} style={{ fontSize: 11, color: "#DC2626", background: "#FEF2F2", padding: "4px 10px", borderRadius: 6, fontWeight: 600 }}>{t.clearCart}</button>}
            </div>
            <div style={{ padding: "0 14px 6px" }}>
              <select value={selCustomer} onChange={e => setSelCustomer(e.target.value)} className="inp" style={{ padding: "8px 10px", fontSize: 12.5, color: selCustomer ? "#1a1a1a" : "#aaa" }}>
                <option value="">{t.selectCustomer}</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
              </select>
              <button onClick={() => setModal({ type: "customer" })} style={{ fontSize: 11, color: "#0D9488", background: "transparent", padding: "4px 0", fontWeight: 600, marginTop: 4 }}>+ {t.addCustomer}</button>
            </div>

            <div className="sh" style={{ flex: 1, padding: "0 14px", overflowY: "auto", maxHeight: "calc(100vh - 410px)" }}>
              {cart.length === 0 && <div style={{ textAlign: "center", padding: "36px 16px", color: "#ddd" }}>
                <p style={{ fontSize: 40, marginBottom: 8 }}>🛒</p>
                <p style={{ fontSize: 12 }}>{lang === "te" ? "ఉత్పత్తులపై క్లిక్ చేయండి" : "Tap products to add to bill"}</p>
              </div>}
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lang === "te" && item.te ? item.te : item.name}</p>
                    <p style={{ fontSize: 10, color: "#bbb" }}>₹{item.price} × {item.qty}{item.gst ? ` + ${item.gst}% GST` : ""}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button className="qb" onClick={() => updateQty(item.id, -1)} style={{ background: "#FEF2F2", color: "#DC2626" }}>−</button>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 600, width: 22, textAlign: "center" }}>{item.qty}</span>
                    <button className="qb" onClick={() => updateQty(item.id, 1)} style={{ background: "#E6F7F5", color: "#0D9488" }}>+</button>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13, minWidth: 55, textAlign: "right" }}>₹{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals & Pay */}
            <div style={{ padding: 14, borderTop: "2px solid #eee", background: "#fff" }}>
              {[
                [t.total + ` (${cart.reduce((s, c) => s + c.qty, 0)} ${t.items})`, `₹${subtotal.toLocaleString()}`],
                [t.gst, `₹${totalGst.toLocaleString()}`],
              ].map(([l, v], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#999", marginBottom: 3 }}><span>{l}</span><span>{v}</span></div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 700, margin: "8px 0 14px" }}>
                <span>{t.grandTotal}</span>
                <span style={{ fontFamily: "'JetBrains Mono'", color: "#0D9488" }}>₹{grandTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => completeSale("cash")} style={{ flex: 2, padding: 13, borderRadius: 12, fontSize: 14, fontWeight: 700, background: cart.length ? "#0D9488" : "#ddd", color: "#fff", transition: "all .15s" }}>
                  💵 {t.pay}
                </button>
                <button onClick={() => completeSale("credit")} style={{ flex: 1, padding: 13, borderRadius: 12, fontSize: 13, fontWeight: 700, background: cart.length && selCustomer ? "#F59E0B" : "#e5e5e5", color: "#fff", transition: "all .15s" }}
                  disabled={!selCustomer}>
                  📒 {t.credit}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === INVENTORY TAB === */}
      {tab === "inventory" && (
        <div style={{ background: "#fff", minHeight: "calc(100vh - 96px)", padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>📦 {t.inventory}</h3>
            <button onClick={() => setModal({ type: "product", data: null })} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#0D9488", color: "#fff" }}>+ {t.addProduct}</button>
          </div>
          {lowStockItems.length > 0 && <>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>⚠️ {t.lowStock} ({lowStockItems.length})</p>
            <div style={{ background: "#FEF2F2", borderRadius: 12, marginBottom: 20, overflow: "hidden" }}>
              {lowStockItems.map((p, i) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: i < lowStockItems.length - 1 ? "1px solid #FECACA" : "none" }}>
                  <p style={{ fontWeight: 600, fontSize: 13 }}>{lang === "te" && p.te ? p.te : p.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, color: p.stock <= 5 ? "#DC2626" : "#D97706" }}>{p.stock} {p.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </>}
          <input type="text" placeholder={t.search} className="inp" style={{ marginBottom: 12 }} value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr .8fr", padding: "10px 14px", background: "#0D9488", color: "#fff", fontSize: 11, fontWeight: 700 }}>
              <span>{t.product}</span><span>{t.price}</span><span>{t.costPrice}</span><span>{t.stock}</span><span>{t.category}</span>
            </div>
            {filtered.map((p, i) => (
              <div key={p.id} onClick={() => setModal({ type: "product", data: p })} style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr .8fr", padding: "10px 14px", fontSize: 12.5, borderBottom: "1px solid #f5f5f5", background: i % 2 ? "#fff" : "#FAFAF8", cursor: "pointer", transition: "background .1s" }}>
                <span style={{ fontWeight: 500 }}>{lang === "te" && p.te ? p.te : p.name}</span>
                <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 600 }}>₹{p.price}</span>
                <span style={{ fontFamily: "'JetBrains Mono'", color: "#999" }}>₹{p.cost || "—"}</span>
                <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 600, color: p.stock <= (p.low||10) ? "#DC2626" : "#059669" }}>{p.stock} {p.unit}</span>
                <span style={{ color: "#aaa" }}>{p.cat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === KHATA TAB === */}
      {tab === "khata" && (
        <div style={{ background: "#fff", minHeight: "calc(100vh - 96px)", padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#D97706" }}>📒 {t.khata}</h3>
            <button onClick={() => setModal({ type: "customer" })} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#0D9488", color: "#fff" }}>+ {t.addCustomer}</button>
          </div>
          <div style={{ background: "linear-gradient(135deg,#FEF3C7,#FFFBEB)", borderRadius: 14, padding: 18, marginBottom: 18, border: "1px solid #FDE68A" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#92400E" }}>{t.totalOutstanding}</p>
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 30, fontWeight: 700, color: "#D97706" }}>₹{totalCredit.toLocaleString()}</p>
            <p style={{ fontSize: 11, color: "#B45309" }}>{customers.filter(c => c.credit > 0).length} {t.customersWithCredit}</p>
          </div>
          {customers.map(c => (
            <div key={c.id} className="krow">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>👤 {c.name}</p>
                  <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>📱 {c.phone} • {c.visits} visits • {t.lastVisit}: {c.lastVisit}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#aaa" }}>{t.balance}</p>
                  <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 22, fontWeight: 700, color: c.credit > 0 ? "#DC2626" : "#059669" }}>₹{c.credit.toLocaleString()}</p>
                </div>
              </div>
              {c.credit > 0 ? (
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => setPayModal(c)} style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#059669", color: "#fff" }}>💰 {t.markPaid}</button>
                  <button onClick={() => { const url = `https://wa.me/91${c.phone}?text=${encodeURIComponent(`${c.name} గారు, మీ దుకాణం బాకీ ₹${c.credit} ఉంది. దయచేసి చెల్లించండి. - ${shop.name}`)}`; window.open(url, "_blank"); }}
                    style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#25D366", color: "#fff" }}>💬 {t.sendReminder}</button>
                </div>
              ) : <p style={{ marginTop: 10, fontSize: 12, color: "#059669", fontWeight: 600, textAlign: "center" }}>✅ {t.noPending}</p>}
            </div>
          ))}
        </div>
      )}

      {/* === REPORTS TAB === */}
      {tab === "reports" && (
        <div style={{ background: "#fff", minHeight: "calc(100vh - 96px)", padding: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>📊 {t.dailySummary}</h3>
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { l: t.totalSales, v: `₹${todayStats.sales.toLocaleString()}`, icon: "💰", c: "#0D9488" },
              { l: t.totalBills, v: todayStats.bills, icon: "🧾", c: "#2563EB" },
              { l: t.cashCollected, v: `₹${todayStats.cash.toLocaleString()}`, icon: "💵", c: "#059669" },
              { l: t.creditGiven, v: `₹${todayStats.credit.toLocaleString()}`, icon: "📒", c: "#D97706" },
              { l: t.profit, v: `₹${todayStats.profit.toLocaleString()}`, icon: "📈", c: "#7C3AED" },
            ].map((s, i) => (
              <div key={i} className="stat" style={{ borderTop: `3px solid ${s.c}` }}>
                <p style={{ fontSize: 20, marginBottom: 2 }}>{s.icon}</p>
                <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 20, fontWeight: 700, color: s.c }}>{s.v}</p>
                <p style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{s.l}</p>
              </div>
            ))}
          </div>

          {/* Top Products */}
          {todayBills.length > 0 && <>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🏆 {t.topProducts}</h4>
            <div style={{ borderRadius: 12, border: "1px solid #eee", overflow: "hidden", marginBottom: 20 }}>
              {(() => {
                const pm = {};
                todayBills.forEach(b => b.items.forEach(it => { pm[it.name] = pm[it.name] || { name: it.name, te: it.te, qty: 0, rev: 0 }; pm[it.name].qty += it.qty; pm[it.name].rev += it.total; }));
                return Object.values(pm).sort((a, b) => b.rev - a.rev).slice(0, 5).map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #f5f5f5", background: i % 2 ? "#fff" : "#FAFAF8" }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{lang === "te" && p.te ? p.te : p.name}</span>
                    <div style={{ display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 12, color: "#999" }}>{p.qty} {t.qtySold}</span>
                      <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 13, fontWeight: 600, color: "#0D9488" }}>₹{p.rev.toLocaleString()}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </>}

          {/* Bill History */}
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>🧾 {t.billHistory}</h4>
          {bills.length === 0 && <p style={{ color: "#ccc", textAlign: "center", padding: 30 }}>{t.noData}</p>}
          <div style={{ borderRadius: 12, border: bills.length ? "1px solid #eee" : "none", overflow: "hidden" }}>
            {bills.slice(0, 20).map((b, i) => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #f5f5f5", background: i % 2 ? "#fff" : "#FAFAF8" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>#{b.num} — {b.customerName}</p>
                  <p style={{ fontSize: 11, color: "#aaa" }}>{b.date} {b.time} • {b.items.length} {t.items}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 15, fontWeight: 700, color: "#0D9488" }}>₹{b.total.toLocaleString()}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: b.mode === "credit" ? "#FEF3C7" : "#E6F7F5", color: b.mode === "credit" ? "#D97706" : "#0D9488" }}>
                    {b.mode === "credit" ? t.credit : t.cashPay}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== PRODUCT FORM =====
function ProductForm({ t, lang, product, categories, onSave, onDelete, onClose }) {
  const [f, setF] = useState(product || { name: "", te: "", price: "", cost: "", stock: "", unit: "pkt", barcode: "", cat: categories[0] || "Grocery", gst: 5, low: 10 });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>{product ? t.editProduct : t.addProduct}</h3>
      {[
        [t.name, "name", "text"], [t.nameTe, "te", "text"], [t.barcode, "barcode", "text"],
        [t.sellingPrice + " (₹)", "price", "number"], [t.costPrice + " (₹)", "cost", "number"],
        [t.stockQty, "stock", "number"], [t.gstRate, "gst", "number"], [t.lowStockAt, "low", "number"],
      ].map(([label, key, type]) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 3 }}>{label}</label>
          <input className="inp" type={type} value={f[key]} onChange={e => set(key, type === "number" ? Number(e.target.value) : e.target.value)} />
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 3 }}>{t.unit}</label>
          <select className="inp" value={f.unit} onChange={e => set("unit", e.target.value)}>
            {["pkt", "kg", "g", "L", "mL", "pcs", "box", "btl", "bar", "bag"].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 3 }}>{t.category}</label>
          <input className="inp" value={f.cat} onChange={e => set("cat", e.target.value)} list="cats" />
          <datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={() => { if (!f.name || !f.price) return; onSave({ ...f, price: Number(f.price), cost: Number(f.cost), stock: Number(f.stock), gst: Number(f.gst), low: Number(f.low) }); }}
          style={{ flex: 2, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, background: "#0D9488", color: "#fff" }}>{t.save}</button>
        <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 600, background: "#f0f0f0", color: "#888" }}>{t.cancel}</button>
      </div>
      {onDelete && <button onClick={onDelete} style={{ width: "100%", padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, background: "#FEF2F2", color: "#DC2626", marginTop: 8 }}>{t.delete}</button>}
    </div>
  );
}

// ===== CUSTOMER FORM =====
function CustomerForm({ t, lang, onSave, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>{t.addCustomer}</h3>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 3 }}>{t.name}</label>
        <input className="inp" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 3 }}>{t.phone}</label>
        <input className="inp" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => { if (!name) return; onSave({ name, phone }); }} style={{ flex: 2, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, background: "#0D9488", color: "#fff" }}>{t.save}</button>
        <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 600, background: "#f0f0f0", color: "#888" }}>{t.cancel}</button>
      </div>
    </div>
  );
}

// ===== PAYMENT MODAL =====
function PaymentModal({ t, lang, customer, onClose, onPay }) {
  const [amt, setAmt] = useState(customer.credit);
  return (
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>💰 {t.paymentReceived}</h3>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>👤 {customer.name} — {t.balance}: <strong style={{ color: "#DC2626" }}>₹{customer.credit.toLocaleString()}</strong></p>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 3 }}>{t.enterAmount}</label>
      <input className="inp" type="number" value={amt} onChange={e => setAmt(Number(e.target.value))} style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 16, fontFamily: "'JetBrains Mono'" }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => { if (amt > 0) onPay(amt); }} style={{ flex: 2, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, background: "#059669", color: "#fff" }}>✅ {t.save}</button>
        <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 600, background: "#f0f0f0", color: "#888" }}>{t.cancel}</button>
      </div>
    </div>
  );
}

// ===== SHOP SETUP =====
function ShopSetup({ t, lang, setLang, onSave }) {
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #E6F7F5, #F3F3EE)", fontFamily: "'Noto Sans', sans-serif", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}.sinp{width:100%;padding:14px 16px;border-radius:12px;border:1.5px solid #e0e0e0;font-size:15px;outline:none;font-family:inherit;background:#fff}.sinp:focus{border-color:#0D9488}`}</style>
      <div style={{ background: "#fff", borderRadius: 20, padding: 36, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,.06)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "#0D9488", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 12 }}>🏪</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>{t.welcome}</h1>
          <p style={{ fontSize: 14, color: "#999", marginTop: 4 }}>{t.setupDesc}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 20, borderRadius: 10, overflow: "hidden", border: "1.5px solid #0D9488" }}>
          {[["en", "English"], ["te", "తెలుగు"]].map(([k, v]) => (
            <button key={k} onClick={() => setLang(k)} style={{ flex: 1, padding: "10px", fontSize: 14, fontWeight: 700, background: lang === k ? "#0D9488" : "#fff", color: lang === k ? "#fff" : "#0D9488", border: "none", cursor: "pointer" }}>{v}</button>
          ))}
        </div>
        {[[t.shopName, name, setName], [t.ownerName, owner, setOwner], [t.phone, phone, setPhone]].map(([l, v, sv], i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#888", display: "block", marginBottom: 4 }}>{l}</label>
            <input className="sinp" value={v} onChange={e => sv(e.target.value)} type={i === 2 ? "tel" : "text"} />
          </div>
        ))}
        <button onClick={() => { if (!name) return; onSave({ name, owner, phone }); }}
          style={{ width: "100%", padding: 14, borderRadius: 12, fontSize: 16, fontWeight: 700, background: "#0D9488", color: "#fff", border: "none", cursor: "pointer", marginTop: 8 }}>
          {t.getStarted} →
        </button>
      </div>
    </div>
  );
}
