import { GOLD, BOR, SURF, TX, DIM, MU, sT } from '../utils/theme';

export default function InsightsCard({ bills }) {
  const now = new Date();
  const dayMs = 86400000;
  const weekStart = new Date(now.getTime() - 7*dayMs);
  const prevWeekStart = new Date(now.getTime() - 14*dayMs);

  const thisWeek = bills.filter(b => b._date >= weekStart);
  const lastWeek = bills.filter(b => b._date >= prevWeekStart && b._date < weekStart);
  const twTotal = thisWeek.reduce((s,b)=>s+b._total,0);
  const lwTotal = lastWeek.reduce((s,b)=>s+b._total,0);

  const insights = [];

  if (lwTotal > 0) {
    const pct = Math.round(((twTotal - lwTotal) / lwTotal) * 100);
    if (pct >= 0) insights.push({ icon:'📈', text:'Sales up '+pct+'% vs last week', good:true });
    else insights.push({ icon:'📉', text:'Sales down '+Math.abs(pct)+'% vs last week', good:false });
  } else if (twTotal > 0) {
    insights.push({ icon:'🚀', text:'Rs. '+twTotal.toLocaleString()+' in sales this week', good:true });
  }

  if (thisWeek.length > 0) {
    const avg = Math.round(twTotal / thisWeek.length);
    insights.push({ icon:'🧾', text:'Average bill: Rs. '+avg.toLocaleString(), good:true });
  }

  const monthBills = bills.filter(b => b._date >= new Date(now.getTime() - 30*dayMs));
  if (monthBills.length >= 3) {
    const hours = {};
    monthBills.forEach(b => { const h = b._date.getHours(); hours[h] = (hours[h]||0)+1; });
    const best = Object.entries(hours).sort((a,b)=>b[1]-a[1])[0];
    if (best) {
      const h = Number(best[0]);
      const label = (h%12===0?12:h%12) + (h<12?' AM':' PM');
      insights.push({ icon:'⏰', text:'Busiest hour: around '+label, good:true });
    }
    const cash = monthBills.filter(b=>b._mode==='cash').length;
    const pctCash = Math.round(cash/monthBills.length*100);
    insights.push({ icon:'💳', text:pctCash+'% Cash · '+(100-pctCash)+'% UPI (30 days)', good:true });
  }

  if (insights.length === 0) return null;

  return (
    <div style={{background:'linear-gradient(145deg,#1E1A10,#171513)',border:'1px solid '+GOLD+'33',borderRadius:14,padding:16,marginBottom:20}}>
      <p style={{...sT,marginBottom:12}}>✨ Smart Insights</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
        {insights.map((ins,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,background:'#14120E',border:'1px solid #2A2418',borderRadius:10,padding:'10px 14px'}}>
            <span style={{fontSize:20}}>{ins.icon}</span>
            <span style={{fontSize:13,color:ins.good?TX:'#F87171',fontWeight:500}}>{ins.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
