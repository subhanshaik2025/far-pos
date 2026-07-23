import { useState, useMemo } from 'react';
import { GOLD, GOLD_L, BOR, SURF, TX, DIM, MU, inp } from '../utils/theme';

export default function BillingTab({ products, cart, setCart, discount, setDiscount, discountType, setDiscountType, subtotal, gst, gstPct, grandTotal, discountAmt, loadingBill, completeBill, showToast, bills, onOpenScanner }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [custPhone, setCustPhone] = useState('');
  const [custName, setCustName] = useState('');

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach(p => { if (p.category) set.add(p.category); });
    return ['All', ...Array.from(set)];
  }, [products]);

  const filtered = products.filter(p => {
    const mS = !search || String(p.name||'').toLowerCase().includes(search.toLowerCase());
    const mC = category === 'All' || p.category === category;
    return mS && mC;
  });

  const addToCart = (p) => {
    if (p.stock !== undefined && p.stock <= 0) { showToast('Out of stock','error'); return; }
    const ex = cart.find(c => c.id === p.id);
    setCart(ex ? cart.map(c => c.id === p.id ? {...c, qty: c.qty+1} : c) : [...cart, {...p, qty:1}]);
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) setCart(cart.filter(c => c.id !== id));
    else setCart(cart.map(c => c.id === id ? {...c, qty} : c));
  };

  const cartCount = cart.reduce((s,c)=>s+c.qty,0);
  const cleanPhone = String(custPhone).replace(/[^0-9]/g,'');
  const pastVisits = cleanPhone.length >= 10
    ? (bills||[]).filter(b => String(b.customerPhone||b.customer_phone||'').replace(/[^0-9]/g,'') === cleanPhone)
    : [];
  const knownName = pastVisits.map(b=>b.customerName||b.customer_name).find(n=>n&&String(n).trim()) || '';

  const handlePhoneChange = (v) => {
    setCustPhone(v);
    const p = String(v).replace(/[^0-9]/g,'');
    if (p.length >= 10 && !custName) {
      const past = (bills||[]).filter(b => String(b.customerPhone||b.customer_phone||'').replace(/[^0-9]/g,'') === p);
      const nm = past.map(b=>b.customerName||b.customer_name).find(n=>n&&String(n).trim());
      if (nm) setCustName(String(nm).trim());
    }
  };

  const pay = (mode) => {
    completeBill(mode, { phone: cleanPhone, name: custName.trim() });
    setCustPhone(''); setCustName('');
  };

  return (
    <div className='fp-bill-wrap'>
      <style>{
        '.fp-bill-wrap{display:grid;grid-template-columns:1fr 380px;gap:20px;align-items:start;}' +
        '@media(max-width:860px){.fp-bill-wrap{grid-template-columns:1fr;}}' +
        '.fp-prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;}' +
        '.fp-card{background:linear-gradient(145deg,#1C1C1C,#161616);border:1px solid #2A2A2A;border-radius:14px;padding:14px;cursor:pointer;transition:all .18s ease;}' +
        '.fp-card:hover{border-color:#C9A84C66;transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,0.08);}' +
        '.fp-card.fp-out{opacity:.45;cursor:not-allowed;}' +
        '.fp-chip{padding:7px 16px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid #2A2A2A;background:#161616;color:#888;white-space:nowrap;}' +
        '.fp-chip.fp-on{background:#C9A84C;color:#000;border-color:#C9A84C;}' +
        '.fp-cart{background:linear-gradient(160deg,#1A1A1A,#141414);border:1px solid #2A2A2A;border-radius:16px;padding:18px;position:sticky;top:16px;}' +
        '@media(max-width:860px){.fp-cart{position:static;}}' +
        '.fp-cart-item{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #222;}' +
        '.fp-qbtn{background:#222;border:1px solid #333;color:#DDD;width:28px;height:28px;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;}' +
        '.fp-pay{flex:1;padding:15px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;border:none;}' +
        '.fp-pay-cash{background:linear-gradient(135deg,#C9A84C,#E8C97A);color:#000;}' +
        '.fp-pay-upi{background:transparent;color:#C9A84C;border:1.5px solid #C9A84C66;}' +
        '.fp-pay:disabled{opacity:.5;cursor:not-allowed;}' +
        '.fp-badge{display:inline-flex;align-items:center;justify-content:center;background:#C9A84C;color:#000;font-size:11px;font-weight:700;min-width:22px;height:22px;border-radius:11px;padding:0 6px;}' +
        '.fp-scan-btn{width:100%;padding:14px 16px;background:linear-gradient(135deg,#C9A84C22,#C9A84C11);border:1.5px solid #C9A84C66;color:#C9A84C;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:12px;letter-spacing:.5px;transition:all .15s;}' +
        '.fp-scan-btn:hover{background:linear-gradient(135deg,#C9A84C33,#C9A84C22);border-color:#C9A84C;}'
      }</style>

      <div>
        <p style={{fontSize:11,letterSpacing:2,color:GOLD,textTransform:'uppercase',margin:'0 0 14px',fontWeight:600}}>Products</p>

        {onOpenScanner ? (
          <button className='fp-scan-btn' onClick={onOpenScanner}>📷 Scan Barcode</button>
        ) : null}

        <input placeholder='🔍  Search products...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,marginBottom:12,padding:'13px 16px',borderRadius:12,fontSize:14}} />

        {categories.length > 1 && (
          <div style={{display:'flex',gap:8,marginBottom:16,overflowX:'auto',paddingBottom:4}}>
            {categories.map(c=>(
              <button key={c} className={'fp-chip'+(category===c?' fp-on':'')} onClick={()=>setCategory(c)}>{c}</button>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{textAlign:'center',padding:'50px 0',color:DIM}}>
            <div style={{fontSize:40,marginBottom:10}}>🛒</div>
            <p style={{fontSize:13}}>{search ? 'No products match your search' : 'No products yet — add some in Products tab'}</p>
          </div>
        )}

        <div className='fp-prod-grid'>
          {filtered.map(p=>(
            <div key={p.id} className={'fp-card'+(p.stock!==undefined&&p.stock<=0?' fp-out':'')} onClick={()=>addToCart(p)}>
              <p style={{fontWeight:600,fontSize:14,margin:'0 0 6px',color:TX,lineHeight:1.3}}>{p.name}</p>
              <p style={{fontSize:16,fontWeight:800,color:GOLD,margin:'0 0 6px'}}>Rs. {Number(p.price).toLocaleString()}</p>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                {p.category ? <span style={{fontSize:10,color:DIM,background:'#111',padding:'2px 8px',borderRadius:10}}>{p.category}</span> : <span></span>}
                {p.stock!==undefined && <span style={{fontSize:10,fontWeight:600,color:p.stock<=0?'#F87171':p.stock<=5?'#FBBF24':'#34D399'}}>{p.stock<=0?'Out':p.stock+' left'}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='fp-cart'>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <p style={{fontSize:11,letterSpacing:2,color:GOLD,textTransform:'uppercase',margin:0,fontWeight:600}}>Current Bill</p>
          {cartCount>0 && <span className='fp-badge'>{cartCount}</span>}
        </div>

        {cart.length===0 && (
          <div style={{textAlign:'center',padding:'34px 0',color:DIM}}>
            <div style={{fontSize:34,marginBottom:8}}>🧾</div>
            <p style={{fontSize:13,margin:0}}>Tap products to add</p>
          </div>
        )}

        {cart.map(item=>(
          <div key={item.id} className='fp-cart-item'>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:13,color:'#DDD',margin:0,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</p>
              <p style={{fontSize:11,color:DIM,margin:'2px 0 0'}}>Rs. {Number(item.price).toLocaleString()} each</p>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:7,marginLeft:8}}>
              <button className='fp-qbtn' onClick={()=>updateQty(item.id,item.qty-1)}>−</button>
              <span style={{fontSize:14,fontWeight:700,minWidth:22,textAlign:'center',color:TX}}>{item.qty}</span>
              <button className='fp-qbtn' onClick={()=>updateQty(item.id,item.qty+1)}>+</button>
              <span style={{fontWeight:700,fontSize:13,color:GOLD,minWidth:64,textAlign:'right'}}>Rs. {(Number(item.price)*item.qty).toLocaleString()}</span>
            </div>
          </div>
        ))}

        {cart.length>0 && (
          <div style={{marginTop:16}}>
            <div style={{display:'flex',gap:8,marginBottom:14,alignItems:'center'}}>
              <span style={{fontSize:12,color:MU}}>Discount</span>
              <input type='number' value={discount} onChange={e=>setDiscount(Number(e.target.value))} style={{...inp,width:84,padding:'7px 10px',borderRadius:8}} placeholder='0' />
              <button onClick={()=>setDiscountType(discountType==='percent'?'flat':'percent')} style={{padding:'7px 14px',background:'#1E1E1E',color:GOLD,border:'1px solid #333',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer'}}>{discountType==='percent'?'%':'Rs'}</button>
            </div>

            <div style={{marginBottom:14}}>
              <p style={{fontSize:11,color:MU,margin:'0 0 8px',letterSpacing:1,textTransform:'uppercase'}}>Customer (optional)</p>
              <div style={{display:'flex',gap:8}}>
                <input placeholder='Phone' value={custPhone} onChange={e=>handlePhoneChange(e.target.value)} style={{...inp,flex:1,padding:'9px 12px',borderRadius:8}} maxLength={10} />
                <input placeholder='Name' value={custName} onChange={e=>setCustName(e.target.value)} style={{...inp,flex:1,padding:'9px 12px',borderRadius:8}} />
              </div>
              {pastVisits.length>0&&(
                <div style={{marginTop:8,background:'#1E1A10',border:'1px solid '+GOLD+'44',borderRadius:8,padding:'7px 12px',fontSize:12,color:GOLD,fontWeight:600}}>
                  ⭐ Repeat customer{knownName?' — '+knownName:''} · visit #{pastVisits.length+1}
                </div>
              )}
            </div>

            <div style={{borderTop:'1px solid #242424',paddingTop:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:13,color:MU}}><span>Subtotal</span><span style={{color:TX}}>Rs. {subtotal.toLocaleString()}</span></div>
              {discountAmt>0 && <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:13,color:MU}}><span>Discount</span><span style={{color:'#F87171'}}>− Rs. {discountAmt.toLocaleString()}</span></div>}
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:13,color:MU}}><span>GST ({gstPct}%)</span><span style={{color:TX}}>Rs. {Math.round(gst).toLocaleString()}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'14px 0 16px'}}>
                <span style={{fontSize:15,fontWeight:600,color:TX}}>Total</span>
                <span style={{fontSize:26,fontWeight:800,color:GOLD,letterSpacing:.5}}>Rs. {Math.round(grandTotal).toLocaleString()}</span>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button className='fp-pay fp-pay-cash' onClick={()=>pay('cash')} disabled={loadingBill}>{loadingBill?'Saving...':'💵 Cash'}</button>
                <button className='fp-pay fp-pay-upi' onClick={()=>pay('upi')} disabled={loadingBill}>{loadingBill?'...':'📱 UPI'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
