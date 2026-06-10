import { useState } from 'react';
import { GOLD, GOLD_L, BOR, SURF, TX, DIM, MU, inp, goldBtn, ghostBtn, card, sT } from '../utils/theme';
import { getSalesFromSheet } from '../salesSheets';

function parseBillDate(b) {
  try {
    const ts = b.timestamp || b.Timestamp || '';
    const dt = b.date || b.Date || '';
    if (ts && String(ts).includes('T')) { const d = new Date(ts); if (!isNaN(d)) return d; }
    if (dt) {
      const s = String(dt).trim();
      const p = s.split('/');
      if (p.length === 3) { const d = new Date(p[2]+'-'+p[1].padStart(2,'0')+'-'+p[0].padStart(2,'0')); if (!isNaN(d)) return d; }
      const d2 = new Date(s); if (!isNaN(d2)) return d2;
    }
    return new Date();
  } catch(e) { return new Date(); }
}

function normalBill(b) {
  return {
    ...b,
    total: Number(b.total || b.Total || 0),
    gst: Number(b.gst || b.GST || 0),
    discount: Number(b.discount || b.Discount || 0),
    mode: String(b.mode || b.payment_mode || b.Payment_mode || '').toLowerCase(),
    timestamp: b.timestamp || b.Timestamp || '',
    date: b.date || b.Date || '',
    items_json: b.items_json || b.Items_json || '',
    items: b.items || [],
  };
}

function getTopProducts(bills) {
  const map = {};
  bills.forEach(b => {
    let items = [];
    try { items = typeof b.items_json === 'string' && b.items_json ? JSON.parse(b.items_json) : (b.items||[]); } catch(e){}
    items.forEach(item => {
      const name = item.name || 'Unknown';
      if (!map[name]) map[name] = { name, qty:0, revenue:0 };
      map[name].qty += Number(item.qty||1);
      map[name].revenue += Number(item.price||0) * Number(item.qty||1);
    });
  });
  return Object.values(map).sort((a,b)=>b.revenue-a.revenue).slice(0,5);
}

function getDayWise(bills) {
  const map = {};
  bills.forEach(b => {
    const d = parseBillDate(b).toISOString().split('T')[0];
    if (!map[d]) map[d] = { date:d, total:0, cash:0, upi:0, count:0 };
    map[d].total += Number(b.total||0);
    map[d].count++;
    if (b.mode === 'cash') map[d].cash += Number(b.total||0);
    else map[d].upi += Number(b.total||0);
  });
  return Object.values(map).sort((a,b)=>b.date.localeCompare(a.date));
}

export default function ReportsTab({ bills, setBills, expenses, saveExpenses, currentUser, userRef, generateId, showToast }) {
  const [reportView, setReportView] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({title:'',amount:'',category:'rent'});

  const normalBills = bills.map(normalBill);

  const filterByDate = (bs, d) => bs.filter(b => parseBillDate(b).toISOString().split('T')[0] === d);
  const filterByWeek = (bs) => { const w = new Date(Date.now()-7*86400000); return bs.filter(b => parseBillDate(b) >= w); };
  const filterByMonth = (bs) => { const n = new Date(); return bs.filter(b => { const d=parseBillDate(b); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear(); }); };

  const selectedBills = reportView==='daily' ? filterByDate(normalBills,selectedDate) : reportView==='weekly' ? filterByWeek(normalBills) : filterByMonth(normalBills);
  const totalSales = selectedBills.reduce((s,b)=>s+b.total,0);
  const cashSales = selectedBills.filter(b=>b.mode==='cash').reduce((s,b)=>s+b.total,0);
  const upiSales = selectedBills.filter(b=>b.mode==='upi').reduce((s,b)=>s+b.total,0);
  const gstTotal = selectedBills.reduce((s,b)=>s+b.gst,0);
  const totalExpenses = expenses.filter(e=>{
    if(reportView==='daily') return e.date===selectedDate;
    if(reportView==='weekly') return new Date(e.date)>=new Date(Date.now()-7*86400000);
    const d=new Date(e.date); const n=new Date();
    return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();
  }).reduce((s,e)=>s+Number(e.amount||0),0);
  const netProfit = totalSales - gstTotal - totalExpenses;
  const topProducts = getTopProducts(selectedBills);
  const dayWise = getDayWise(reportView==='weekly'?filterByWeek(normalBills):filterByMonth(normalBills));
  const maxDay = Math.max(...dayWise.map(d=>d.total),1);

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <p style={{...sT,margin:0}}>Reports</p>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setShowAddExpense(true)} style={ghostBtn}>+ Expense</button>
          <button onClick={()=>getSalesFromSheet(userRef.current||currentUser).then(s=>{if(s&&s.length>0)setBills(s);})} style={ghostBtn}>Refresh</button>
        </div>
      </div>

      {showAddExpense&&(
        <div style={{...card,borderColor:GOLD+'44',marginBottom:16}}>
          <p style={{...sT,marginBottom:12}}>Add Expense</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10}}>
            <input placeholder='Title' value={newExpense.title} onChange={e=>setNewExpense({...newExpense,title:e.target.value})} style={inp} />
            <input type='number' placeholder='Amount' value={newExpense.amount} onChange={e=>setNewExpense({...newExpense,amount:e.target.value})} style={inp} />
            <select value={newExpense.category} onChange={e=>setNewExpense({...newExpense,category:e.target.value})} style={{...inp}}>
              {['rent','salary','utilities','supplies','other'].map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>{
              if(!newExpense.title||!newExpense.amount){showToast('Fill all fields','error');return;}
              const e={id:generateId('exp'),title:newExpense.title,amount:Number(newExpense.amount),category:newExpense.category,date:new Date().toISOString().split('T')[0]};
              saveExpenses([...expenses,e]);
              setNewExpense({title:'',amount:'',category:'rent'});
              setShowAddExpense(false);
            }} style={goldBtn(false)}>Save Expense</button>
            <button onClick={()=>setShowAddExpense(false)} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{display:'flex',gap:6,marginBottom:16}}>
        {['daily','weekly','monthly'].map(v=>(
          <button key={v} onClick={()=>setReportView(v)} style={{padding:'8px 18px',borderRadius:8,fontSize:13,fontWeight:reportView===v?600:400,background:reportView===v?GOLD:'#1A1A1A',color:reportView===v?'#000':MU,border:reportView===v?'none':'1px solid #2A2A2A',cursor:'pointer',textTransform:'capitalize'}}>{v}</button>
        ))}
      </div>

      {reportView==='daily'&&<input type='date' value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} style={{...inp,width:'auto',marginBottom:16}} />}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10,marginBottom:20}}>
        {[
          {label:'Total Sales',value:'Rs. '+totalSales.toLocaleString(),sub:selectedBills.length+' bills',color:GOLD,accent:true},
          {label:'Net Profit',value:'Rs. '+netProfit.toLocaleString(),sub:'After GST & expenses',color:'#A3E635'},
          {label:'Cash',value:'Rs. '+cashSales.toLocaleString(),color:'#34D399'},
          {label:'UPI',value:'Rs. '+upiSales.toLocaleString(),color:'#FBBF24'},
          {label:'GST Collected',value:'Rs. '+gstTotal.toLocaleString(),color:MU},
          {label:'Expenses',value:'Rs. '+totalExpenses.toLocaleString(),color:'#F87171'},
        ].map(s=>(
          <div key={s.label} style={{background:SURF,border:'1px solid '+(s.accent?GOLD+'44':BOR),borderRadius:12,padding:16}}>
            <p style={{fontSize:11,color:DIM,letterSpacing:1.5,textTransform:'uppercase',margin:'0 0 6px'}}>{s.label}</p>
            <p style={{fontSize:20,fontWeight:600,color:s.color,margin:0}}>{s.value}</p>
            {s.sub&&<p style={{fontSize:11,color:DIM,margin:'4px 0 0'}}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {topProducts.length>0&&(
        <div style={{marginBottom:20}}>
          <p style={sT}>Top Products</p>
          {topProducts.map((p,i)=>(
            <div key={p.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:i===0?'#1E1A10':SURF,border:'1px solid '+(i===0?GOLD+'33':BOR),borderRadius:10,marginBottom:6}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:16,fontWeight:700,color:GOLD,minWidth:28}}>#{i+1}</span>
                <div>
                  <p style={{margin:0,fontSize:13,color:TX}}>{p.name}</p>
                  <p style={{margin:0,fontSize:11,color:DIM}}>Qty: {p.qty}</p>
                </div>
              </div>
              <span style={{fontWeight:600,color:GOLD}}>Rs. {p.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {(reportView==='weekly'||reportView==='monthly')&&dayWise.length>0&&(
        <div>
          <p style={sT}>Day Wise Sales</p>
          {dayWise.map(d=>(
            <div key={d.date} style={{marginBottom:14,background:SURF,border:'1px solid '+BOR,borderRadius:10,padding:'12px 14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:12,color:MU}}>{new Date(d.date).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</span>
                <span style={{fontSize:12,fontWeight:600,color:TX}}>Rs. {d.total.toLocaleString()} <span style={{color:DIM}}>({d.count} bills)</span></span>
              </div>
              <div style={{background:'#222',borderRadius:4,height:6}}>
                <div style={{background:'linear-gradient(90deg,'+GOLD+','+GOLD_L+')',borderRadius:4,height:6,width:(d.total/maxDay*100)+'%'}}></div>
              </div>
              <div style={{display:'flex',gap:16,marginTop:6}}>
                <span style={{fontSize:11,color:'#34D399'}}>Cash Rs. {d.cash.toLocaleString()}</span>
                <span style={{fontSize:11,color:'#FBBF24'}}>UPI Rs. {d.upi.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBills.length===0&&(
        <div style={{textAlign:'center',padding:'60px 0',color:DIM}}>
          <div style={{fontSize:48,marginBottom:12}}>📊</div>
          <p style={{fontSize:14}}>No sales data for this period</p>
        </div>
      )}

      {expenses.length>0&&(
        <div style={{marginTop:20}}>
          <p style={sT}>Expenses</p>
          {expenses.slice().reverse().map(e=>(
            <div key={e.id} style={{...card,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <p style={{margin:'0 0 3px',fontSize:13,fontWeight:600,color:TX}}>{e.title}</p>
                <p style={{margin:0,fontSize:11,color:DIM}}>{e.date} · {e.category}</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:15,fontWeight:700,color:'#F87171'}}>Rs. {e.amount.toLocaleString()}</span>
                <button onClick={()=>saveExpenses(expenses.filter(x=>x.id!==e.id))} style={{background:'#2A1010',border:'1px solid #4A2020',color:'#F87171',borderRadius:6,padding:'2px 8px',cursor:'pointer',fontSize:12}}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
