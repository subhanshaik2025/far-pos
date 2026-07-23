import { useState } from 'react';
import { GOLD, BOR, SURF, TX, DIM, MU, inp, card, sT } from '../utils/theme';
import { normalizeBill } from '../utils/billUtils';

export default function CustomersTab({ bills }) {
  const [search, setSearch] = useState('');

  const map = {};
  bills.forEach(b => {
    const phone = String(b.customerPhone || b.customer_phone || '').replace(/[^0-9]/g,'');
    if (phone.length < 10) return;
    const n = normalizeBill(b);
    if (!map[phone]) map[phone] = { phone, name:'', visits:0, total:0, last:null };
    map[phone].visits++;
    map[phone].total += n._total;
    const nm = b.customerName || b.customer_name;
    if (nm && String(nm).trim()) map[phone].name = String(nm).trim();
    if (!map[phone].last || n._date > map[phone].last) map[phone].last = n._date;
  });

  const all = Object.values(map).sort((a,b)=>b.total-a.total);
  const repeats = all.filter(c=>c.visits>1).length;
  const customers = all.filter(c=>{
    if (!search) return true;
    const q = search.toLowerCase();
    return c.phone.includes(q) || c.name.toLowerCase().includes(q);
  });

  return (
    <div>
      <p style={sT}>Customers</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10,marginBottom:16}}>
        <div style={{background:SURF,border:'1px solid '+GOLD+'44',borderRadius:12,padding:16}}>
          <p style={{fontSize:11,color:DIM,letterSpacing:1.5,textTransform:'uppercase',margin:'0 0 6px'}}>Total Customers</p>
          <p style={{fontSize:22,fontWeight:700,color:GOLD,margin:0}}>{all.length}</p>
        </div>
        <div style={{background:SURF,border:'1px solid '+BOR,borderRadius:12,padding:16}}>
          <p style={{fontSize:11,color:DIM,letterSpacing:1.5,textTransform:'uppercase',margin:'0 0 6px'}}>Repeat Customers</p>
          <p style={{fontSize:22,fontWeight:700,color:'#34D399',margin:0}}>{repeats}</p>
        </div>
      </div>

      <input placeholder='Search by name or phone...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,marginBottom:16}} />

      {all.length===0&&(
        <div style={{textAlign:'center',padding:'50px 0',color:DIM}}>
          <div style={{fontSize:40,marginBottom:10}}>👥</div>
          <p style={{fontSize:13}}>No customers yet</p>
          <p style={{fontSize:12,color:DIM,marginTop:6}}>Add customer phone at billing time — they appear here automatically</p>
        </div>
      )}

      {customers.map(c=>(
        <div key={c.phone} style={{...card,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <p style={{margin:0,fontSize:14,fontWeight:600,color:TX}}>{c.name||'Customer'}</p>
              {c.visits>1&&<span style={{fontSize:10,fontWeight:700,background:'#1E1A10',color:GOLD,border:'1px solid '+GOLD+'44',borderRadius:10,padding:'2px 8px'}}>⭐ {c.visits} visits</span>}
            </div>
            <p style={{margin:'4px 0 0',fontSize:12,color:DIM}}>{c.phone} · Last visit: {c.last?c.last.toLocaleDateString('en-IN'):'—'}</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{textAlign:'right'}}>
              <p style={{margin:0,fontSize:16,fontWeight:700,color:GOLD}}>Rs. {c.total.toLocaleString()}</p>
              <p style={{margin:0,fontSize:11,color:DIM}}>lifetime</p>
            </div>
            <button onClick={()=>window.open('https://wa.me/91'+c.phone,'_blank')} style={{background:'#1A2A1A',border:'1px solid #2A4A2A',color:'#34D399',borderRadius:8,padding:'8px 14px',cursor:'pointer',fontSize:12,fontWeight:600}}>WhatsApp</button>
          </div>
        </div>
      ))}
    </div>
  );
}
