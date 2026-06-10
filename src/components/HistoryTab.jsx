import { useState, useRef, useEffect } from 'react';
import { GOLD, BOR, SURF, TX, DIM, MU, inp, goldBtn, ghostBtn, card, sT } from '../utils/theme';
import { parseItems } from '../utils/billUtils';

export default function HistoryTab({ bills, setBills, currentUser, userRef, getSalesFromSheet, shareOnWhatsApp, generateGSTInvoice, sendDailySummary }) {
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const detailRef = useRef(null);

  useEffect(() => {
    if (detail && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [detail]);

  const safeParse = (bill) => {
    try {
      if (typeof bill.items_json === 'string' && bill.items_json.startsWith('[')) return JSON.parse(bill.items_json);
      if (Array.isArray(bill.items)) return bill.items;
    } catch(e) {}
    return [];
  };

  const getTotal = (bill) => {
    const t = Number(bill.total || bill.Total || 0);
    return t;
  };

  const getGst = (bill) => Number(bill.gst || bill.GST || 0);
  const getDiscount = (bill) => Number(bill.discount || bill.Discount || 0);
  const getDate = (bill) => String(bill.date || bill.Date || bill.timestamp || '').split('T')[0];
  const getMode = (bill) => String(bill.mode || bill.payment_mode || bill.Payment_mode || '');
  const getId = (bill) => String(bill.id || bill.bill_id || '—');

  const filtered = [...bills].reverse().filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return getId(b).toLowerCase().includes(q) ||
           String(getTotal(b)).includes(q) ||
           getDate(b).includes(q);
  });

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:8}}>
        <p style={{...sT,margin:0}}>Bill History</p>
        <div style={{display:'flex',gap:8}}>
          <button onClick={sendDailySummary} style={{...goldBtn(false),fontSize:12,padding:'6px 14px'}}>📊 WhatsApp Summary</button>
          <button onClick={()=>getSalesFromSheet(userRef.current||currentUser).then(s=>{if(s&&s.length>0)setBills(s);})} style={ghostBtn}>Refresh</button>
        </div>
      </div>

      <input placeholder='Search by bill ID, amount or date...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,marginBottom:16}} />

      {detail&&(
        <div ref={detailRef} style={{...card,borderColor:GOLD+'44',marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
            <p style={{...sT,margin:0}}>Bill Detail</p>
            <button onClick={()=>setDetail(null)} style={ghostBtn}>Close</button>
          </div>
          <p style={{fontSize:12,color:MU,margin:'0 0 4px'}}>ID: {getId(detail)}</p>
          <p style={{fontSize:12,color:MU,margin:'0 0 12px'}}>Date: {getDate(detail)} · {getMode(detail).toUpperCase()}</p>
          {safeParse(detail).length > 0 ? (
            safeParse(detail).map((item,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #222'}}>
                <span style={{fontSize:13,color:TX}}>{item.name||'Item'} × {Number(item.qty||1)}</span>
                <span style={{fontSize:13,color:GOLD}}>Rs. {(Number(item.price||0)*Number(item.qty||1)).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p style={{fontSize:12,color:DIM,margin:'0 0 12px'}}>Items not available for this bill</p>
          )}
          <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid #333'}}>
            {getDiscount(detail)>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:MU,marginBottom:4}}><span>Discount</span><span style={{color:'#F87171'}}>- Rs. {getDiscount(detail).toLocaleString()}</span></div>}
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:MU,marginBottom:4}}><span>GST</span><span style={{color:TX}}>Rs. {getGst(detail).toLocaleString()}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:18,fontWeight:700,marginTop:8}}><span>Total</span><span style={{color:GOLD}}>Rs. {getTotal(detail).toLocaleString()}</span></div>
          </div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button onClick={()=>shareOnWhatsApp(detail)} style={{...goldBtn(false),flex:1,textAlign:'center'}}>WhatsApp</button>
            <button onClick={()=>generateGSTInvoice(detail)} style={{flex:1,padding:'10px 18px',background:'transparent',color:GOLD,border:'1px solid #333',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>GST Invoice</button>
          </div>
        </div>
      )}

      {filtered.map((b,idx)=>(
        <div key={getId(b)+idx} onClick={()=>setDetail(detail&&getId(detail)===getId(b)?null:b)} style={{...card,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid '+(detail&&getId(detail)===getId(b)?GOLD+'66':BOR)}}>
          <div>
            <p style={{margin:'0 0 3px',fontSize:13,fontWeight:600,color:TX}}>{getId(b)}</p>
            <p style={{margin:0,fontSize:11,color:DIM}}>{getDate(b)} · {getMode(b).toUpperCase()}</p>
          </div>
          <span style={{fontSize:16,fontWeight:700,color:GOLD}}>Rs. {getTotal(b).toLocaleString()}</span>
        </div>
      ))}
      {bills.length===0&&<p style={{color:DIM,fontSize:13}}>No bills yet</p>}
    </div>
  );
}
