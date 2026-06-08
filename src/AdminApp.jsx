import { useState, useEffect } from 'react';

const GOLD='#C9A84C',BG='#0F0F0F',SURF='#1A1A1A',BOR='#2A2A2A',TX='#DDDDDD',MU='#888',DIM='#555';
const USERS_URL='https://script.google.com/macros/s/AKfycbyOJivL481i7M6VTA-xLb0jGI2lmu9IvRpjvooU47GbH8to_GiZ24A35OhPgTtZGaj7qQ/exec';
const SALES_URL='https://script.google.com/macros/s/AKfycbw44V48--8hOrxNlwlUC_f5AdSNiZOnMoN1BG1ii4G9SozC7GNG4FN2EY3JV8MDg1lliw/exec';
const ADMIN_PHONE='9533360607';
const ADMIN_PASSWORD='admin@far123';

const inp={width:'100%',padding:'11px 14px',borderRadius:8,border:'1px solid #333',background:'#111',color:TX,fontSize:13,outline:'none',boxSizing:'border-box'};
const gBtn=(d)=>({padding:'10px 20px',background:d?'#333':GOLD,color:d?MU:'#000',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:d?'not-allowed':'pointer'});
const ghBtn={padding:'10px 18px',background:'transparent',color:GOLD,border:'1px solid #333',borderRadius:8,fontSize:13,cursor:'pointer'};
const card={background:SURF,border:'1px solid #2A2A2A',borderRadius:12,padding:16,marginBottom:10};

export default function AdminApp() {
  const [isLoggedIn,setIsLoggedIn]=useState(!!localStorage.getItem('admin-token'));
  const [phone,setPhone]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const [tab,setTab]=useState('overview');
  const [vendors,setVendors]=useState([]);
  const [registered,setRegistered]=useState([]);
  const [allSales,setAllSales]=useState({});
  const [selectedVendor,setSelectedVendor]=useState(null);
  const [showAddVendor,setShowAddVendor]=useState(false);
  const [newVendor,setNewVendor]=useState({phone:'',ownerName:'',shopName:'',industryType:'kirana',plan:'starter'});
  const [dataLoading,setDataLoading]=useState(false);
  const [searchQ,setSearchQ]=useState('');

  useEffect(()=>{ if(isLoggedIn) loadData(); },[isLoggedIn]);

  const loadData=async()=>{
    setDataLoading(true);
    try {
      const res=await fetch(USERS_URL+'?action=getAdminData');
      const data=await res.json();
      if(data.success){ setVendors(data.allowed||[]); setRegistered(data.registered||[]); }
    } catch(e){ console.error(e); }
    setDataLoading(false);
  };

  const loadVendorSales=async(shopName)=>{
    if(allSales[shopName]) return;
    try {
      const res=await fetch(SALES_URL+'?action=getSales&shop_name='+encodeURIComponent(shopName));
      const data=await res.json();
      if(data.success) setAllSales(prev=>({...prev,[shopName]:data.sales||[]}));
    } catch(e){ console.error(e); }
  };

  const handleLogin=async()=>{
    if(!phone||!password){setError('Fill all fields');return;}
    setLoading(true);
    if(phone===ADMIN_PHONE&&password===ADMIN_PASSWORD){
      localStorage.setItem('admin-token','1');
      setIsLoggedIn(true);
    } else { setError('Invalid admin credentials'); }
    setLoading(false);
  };

  const updateStatus=async(vendorPhone,status)=>{
    try {
      await fetch(USERS_URL+'?action=updateVendorStatus&phone='+vendorPhone+'&status='+status);
      setVendors(vendors.map(v=>String(v['Phone Number']||v.phone)===String(vendorPhone)?{...v,Status:status}:v));
    } catch(e){ alert('Failed'); }
  };

  const addVendor=async()=>{
    if(!newVendor.phone||!newVendor.ownerName||!newVendor.shopName){alert('Fill all fields');return;}
    try {
      const params=new URLSearchParams({action:'addVendor',...newVendor});
      await fetch(USERS_URL+'?'+params.toString());
      setShowAddVendor(false);
      setNewVendor({phone:'',ownerName:'',shopName:'',industryType:'kirana',plan:'starter'});
      loadData();
    } catch(e){ alert('Failed'); }
  };

  const gp=(v)=>String(v['Phone Number']||v.phone||'');
  const gn=(v)=>v['Owner Name']||v.ownerName||'';
  const gs=(v)=>v['Shop Name']||v.shopName||'';
  const gpl=(v)=>v['Plan']||v.plan||'starter';
  const gst=(v)=>v['Status']||v.status||'Active';
  const gi=(v)=>v['Industry Type']||v.industryType||'';
  const isReg=(phone)=>registered.some(r=>String(r.phone)===String(phone));
  const getReg=(phone)=>registered.find(r=>String(r.phone)===String(phone));

  const filtered=vendors.filter(v=>{
    if(!searchQ) return true;
    const q=searchQ.toLowerCase();
    return gn(v).toLowerCase().includes(q)||gs(v).toLowerCase().includes(q)||gp(v).includes(q);
  });

  const tStyle=(a)=>({padding:'8px 20px',borderRadius:'8px 8px 0 0',fontSize:13,cursor:'pointer',border:'none',background:a?SURF:'transparent',color:a?GOLD:'#555',fontWeight:a?600:400,borderTop:a?'2px solid '+GOLD:'2px solid transparent',whiteSpace:'nowrap'});

  if(!isLoggedIn) return (
    <div style={{background:BG,minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:SURF,borderRadius:20,padding:36,maxWidth:400,width:'100%',border:'1px solid '+BOR}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:11,letterSpacing:4,color:MU,marginBottom:8,textTransform:'uppercase'}}>Admin Access</div>
          <div style={{fontSize:32,fontWeight:700,letterSpacing:4,color:GOLD}}>FAR — POS</div>
          <div style={{fontSize:11,color:DIM,marginTop:8,letterSpacing:2,textTransform:'uppercase'}}>Control Panel</div>
          <div style={{width:40,height:2,background:GOLD,margin:'14px auto 0',borderRadius:2}}></div>
        </div>
        {error&&<div style={{background:'#2A1010',color:'#FF6B6B',padding:'10px 14px',borderRadius:8,marginBottom:14,fontSize:13,border:'1px solid #4A2020'}}>⚠ {error}</div>}
        <input type='tel' placeholder='Admin Phone' value={phone} onChange={e=>setPhone(e.target.value)} style={{...inp,marginBottom:12}} />
        <input type='password' placeholder='Admin Password' value={password} onChange={e=>setPassword(e.target.value)} style={{...inp,marginBottom:16}} />
        <button onClick={handleLogin} disabled={loading} style={{...gBtn(loading),width:'100%',padding:14,fontSize:14}}>
          {loading?'Checking...':'Login as Admin'}
        </button>
        <div style={{textAlign:'center',marginTop:20,fontSize:11,color:'#333',letterSpacing:1}}>RESTRICTED ACCESS</div>
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:'sans-serif',background:BG,minHeight:'100vh',color:TX}}>
      <div style={{background:SURF,borderBottom:'1px solid '+BOR,padding:'14px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:20,fontWeight:600,letterSpacing:3,color:GOLD}}>FAR — POS</div>
          <div style={{fontSize:11,color:MU,marginTop:2,letterSpacing:1}}>ADMIN CONTROL PANEL</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={loadData} style={ghBtn}>Refresh</button>
          <button onClick={()=>{localStorage.removeItem('admin-token');setIsLoggedIn(false);}} style={{background:'#2A1010',border:'1px solid #4A2020',color:'#F87171',padding:'6px 14px',borderRadius:8,fontSize:12,cursor:'pointer'}}>Logout</button>
        </div>
      </div>

      <div style={{background:'#141414',display:'flex',gap:4,padding:'10px 24px 0',borderBottom:'1px solid #222',overflowX:'auto'}}>
        {['overview','vendors','analytics'].map(f=>(
          <button key={f} onClick={()=>setTab(f)} style={tStyle(tab===f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
        ))}
      </div>

      <div style={{padding:24,maxWidth:1200,margin:'0 auto'}}>

        {tab==='overview'&&(
          <div>
            <p style={{fontSize:11,letterSpacing:2,color:GOLD,textTransform:'uppercase',margin:'0 0 20px'}}>Overview</p>
            {dataLoading&&<p style={{color:MU,fontSize:13}}>Loading...</p>}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:28}}>
              {[
                {label:'Total Vendors',value:vendors.length,color:GOLD},
                {label:'Active',value:vendors.filter(v=>gst(v).toLowerCase()==='active').length,color:'#34D399'},
                {label:'Registered',value:registered.length,color:'#60A5FA'},
                {label:'Pro Plan',value:vendors.filter(v=>gpl(v).toLowerCase()==='pro').length,color:'#FBBF24'},
                {label:'Not Registered',value:vendors.length-registered.length,color:'#F87171'},
              ].map(s=>(
                <div key={s.label} style={{background:SURF,border:'1px solid '+BOR,borderRadius:12,padding:16}}>
                  <p style={{fontSize:11,color:DIM,letterSpacing:1.5,textTransform:'uppercase',margin:'0 0 8px'}}>{s.label}</p>
                  <p style={{fontSize:28,fontWeight:700,color:s.color,margin:0}}>{s.value}</p>
                </div>
              ))}
            </div>
            <p style={{fontSize:11,letterSpacing:2,color:GOLD,textTransform:'uppercase',margin:'0 0 14px'}}>All Vendors</p>
            {vendors.slice().reverse().map(v=>(
              <div key={gp(v)} style={{...card,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:40,height:40,borderRadius:10,background:'#111',border:'1px solid #333',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                    {gi(v)==='restaurant'?'🍽':gi(v)==='salon'?'✂️':gi(v)==='pharmacy'?'💊':'🏪'}
                  </div>
                  <div>
                    <p style={{margin:'0 0 2px',fontSize:14,fontWeight:600,color:TX}}>{gs(v)}</p>
                    <p style={{margin:0,fontSize:12,color:MU}}>{gn(v)} · {gp(v)}</p>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:gpl(v).toLowerCase()==='pro'?'#1A1500':'#1A1A1A',color:gpl(v).toLowerCase()==='pro'?GOLD:MU,border:'1px solid #333'}}>{gpl(v)}</span>
                  <span style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:gst(v).toLowerCase()==='active'?'#0A1A0A':'#1A0A0A',color:gst(v).toLowerCase()==='active'?'#34D399':'#F87171',border:'1px solid #333'}}>{gst(v)}</span>
                  <span style={{fontSize:11,color:isReg(gp(v))?'#60A5FA':DIM}}>{isReg(gp(v))?'✓ Registered':'Not registered'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='vendors'&&(
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <p style={{fontSize:11,letterSpacing:2,color:GOLD,textTransform:'uppercase',margin:0}}>Vendor Management</p>
              <button onClick={()=>setShowAddVendor(true)} style={gBtn(false)}>+ Add Vendor</button>
            </div>
            {showAddVendor&&(
              <div style={{...card,borderColor:GOLD+'44',marginBottom:20}}>
                <p style={{fontSize:11,letterSpacing:2,color:GOLD,textTransform:'uppercase',margin:'0 0 14px'}}>New Vendor</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginBottom:12}}>
                  <input placeholder='Phone' value={newVendor.phone} onChange={e=>setNewVendor({...newVendor,phone:e.target.value})} style={inp} />
                  <input placeholder='Owner Name' value={newVendor.ownerName} onChange={e=>setNewVendor({...newVendor,ownerName:e.target.value})} style={inp} />
                  <input placeholder='Shop Name' value={newVendor.shopName} onChange={e=>setNewVendor({...newVendor,shopName:e.target.value})} style={inp} />
                  <select value={newVendor.industryType} onChange={e=>setNewVendor({...newVendor,industryType:e.target.value})} style={inp}>
                    {['kirana','restaurant','cloth','tiffin','pharmacy','salon'].map(i=><option key={i} value={i}>{i}</option>)}
                  </select>
                  <select value={newVendor.plan} onChange={e=>setNewVendor({...newVendor,plan:e.target.value})} style={inp}>
                    {['starter','pro','enterprise'].map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={addVendor} style={gBtn(false)}>Add Vendor</button>
                  <button onClick={()=>setShowAddVendor(false)} style={ghBtn}>Cancel</button>
                </div>
              </div>
            )}
            <input placeholder='Search vendors...' value={searchQ} onChange={e=>setSearchQ(e.target.value)} style={{...inp,marginBottom:16}} />
            <div style={{...card,padding:0,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1.5fr',background:'#111',padding:'10px 16px',borderBottom:'1px solid #222'}}>
                {['Shop','Owner','Phone','Plan','Status','Actions'].map(h=><span key={h} style={{fontSize:11,color:MU,letterSpacing:1,textTransform:'uppercase'}}>{h}</span>)}
              </div>
              {filtered.map((v,i)=>(
                <div key={gp(v)} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1.5fr',padding:'12px 16px',borderBottom:i<filtered.length-1?'1px solid #1A1A1A':'none',alignItems:'center'}}>
                  <div>
                    <p style={{margin:'0 0 2px',fontSize:13,fontWeight:600,color:TX}}>{gs(v)}</p>
                    <p style={{margin:0,fontSize:11,color:DIM}}>{gi(v)}</p>
                  </div>
                  <span style={{fontSize:12,color:MU}}>{gn(v)}</span>
                  <span style={{fontSize:12,color:MU}}>{gp(v)}</span>
                  <span style={{fontSize:11,padding:'3px 8px',borderRadius:20,background:gpl(v).toLowerCase()==='pro'?'#1A1500':'#1A1A1A',color:gpl(v).toLowerCase()==='pro'?GOLD:MU,border:'1px solid #333',display:'inline-block'}}>{gpl(v)}</span>
                  <span style={{fontSize:11,padding:'3px 8px',borderRadius:20,background:gst(v).toLowerCase()==='active'?'#0A1A0A':'#1A0A0A',color:gst(v).toLowerCase()==='active'?'#34D399':'#F87171',border:'1px solid #333',display:'inline-block'}}>{gst(v)}</span>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>{setSelectedVendor(v);loadVendorSales(gs(v));setTab('analytics');}} style={{...ghBtn,padding:'4px 10px',fontSize:11}}>View</button>
                    {gst(v).toLowerCase()==='active'
                      ?<button onClick={()=>updateStatus(gp(v),'Blocked')} style={{padding:'4px 10px',background:'#2A1010',border:'1px solid #4A2020',color:'#F87171',borderRadius:6,fontSize:11,cursor:'pointer'}}>Block</button>
                      :<button onClick={()=>updateStatus(gp(v),'Active')} style={{padding:'4px 10px',background:'#0A1A0A',border:'1px solid #1A4A1A',color:'#34D399',borderRadius:6,fontSize:11,cursor:'pointer'}}>Activate</button>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='analytics'&&(
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <p style={{fontSize:11,letterSpacing:2,color:GOLD,textTransform:'uppercase',margin:0}}>
                {selectedVendor?'Analytics: '+gs(selectedVendor):'Select Vendor'}
              </p>
              {selectedVendor&&<button onClick={()=>setSelectedVendor(null)} style={ghBtn}>Back</button>}
            </div>
            {!selectedVendor&&(
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
                {vendors.map(v=>(
                  <div key={gp(v)} onClick={()=>{setSelectedVendor(v);loadVendorSales(gs(v));}} style={{...card,cursor:'pointer'}}>
                    <p style={{margin:'0 0 4px',fontSize:14,fontWeight:600,color:TX}}>{gs(v)}</p>
                    <p style={{margin:'0 0 8px',fontSize:12,color:MU}}>{gn(v)} · {gp(v)}</p>
                    <div style={{display:'flex',gap:6}}>
                      <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:gpl(v).toLowerCase()==='pro'?'#1A1500':'#1A1A1A',color:gpl(v).toLowerCase()==='pro'?GOLD:MU,border:'1px solid #333'}}>{gpl(v)}</span>
                      <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:isReg(gp(v))?'#0A0A1A':'#1A1A1A',color:isReg(gp(v))?'#60A5FA':DIM,border:'1px solid #333'}}>{isReg(gp(v))?'Registered':'Pending'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedVendor&&(()=>{
              const shopName=gs(selectedVendor);
              const sales=allSales[shopName]||[];
              const totalRev=sales.reduce((s,b)=>s+Number(b.total||0),0);
              const cashRev=sales.filter(b=>(b.mode||b.payment_mode)==='cash').reduce((s,b)=>s+Number(b.total||0),0);
              const upiRev=sales.filter(b=>(b.mode||b.payment_mode)==='upi').reduce((s,b)=>s+Number(b.total||0),0);
              const gstRev=sales.reduce((s,b)=>s+Number(b.gst||0),0);
              return (
                <div>
                  <div style={{...card,borderColor:GOLD+'44',marginBottom:20}}>
                    <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                      <div style={{flex:1,minWidth:180}}>
                        <p style={{fontSize:16,fontWeight:700,color:TX,margin:'0 0 8px'}}>{shopName}</p>
                        <p style={{fontSize:12,color:MU,margin:'0 0 4px'}}>Owner: {gn(selectedVendor)}</p>
                        <p style={{fontSize:12,color:MU,margin:'0 0 4px'}}>Phone: {gp(selectedVendor)}</p>
                        <p style={{fontSize:12,color:MU,margin:0}}>Industry: {gi(selectedVendor)}</p>
                      </div>
                      <div style={{flex:1,minWidth:180}}>
                        <p style={{fontSize:12,color:MU,margin:'0 0 4px'}}>Plan: <span style={{color:GOLD}}>{gpl(selectedVendor)}</span></p>
                        <p style={{fontSize:12,color:MU,margin:'0 0 4px'}}>Status: <span style={{color:gst(selectedVendor).toLowerCase()==='active'?'#34D399':'#F87171'}}>{gst(selectedVendor)}</span></p>
                        <p style={{fontSize:12,color:MU,margin:0}}>Registered: <span style={{color:isReg(gp(selectedVendor))?'#60A5FA':'#F87171'}}>{isReg(gp(selectedVendor))?'Yes':'No'}</span></p>
                      </div>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10,marginBottom:20}}>
                    {[
                      {label:'Revenue',value:'Rs. '+totalRev.toLocaleString(),color:GOLD},
                      {label:'Bills',value:sales.length,color:'#60A5FA'},
                      {label:'Cash',value:'Rs. '+cashRev.toLocaleString(),color:'#34D399'},
                      {label:'UPI',value:'Rs. '+upiRev.toLocaleString(),color:'#FBBF24'},
                      {label:'GST',value:'Rs. '+gstRev.toLocaleString(),color:MU},
                      {label:'Avg Bill',value:'Rs. '+(sales.length?Math.round(totalRev/sales.length):0).toLocaleString(),color:'#C084FC'},
                    ].map(s=>(
                      <div key={s.label} style={{background:SURF,border:'1px solid '+BOR,borderRadius:12,padding:14}}>
                        <p style={{fontSize:10,color:DIM,letterSpacing:1.5,textTransform:'uppercase',margin:'0 0 6px'}}>{s.label}</p>
                        <p style={{fontSize:20,fontWeight:700,color:s.color,margin:0}}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{fontSize:11,letterSpacing:2,color:GOLD,textTransform:'uppercase',margin:'0 0 12px'}}>Recent Bills</p>
                  {sales.length===0&&<p style={{color:DIM,fontSize:13}}>No sales yet</p>}
                  {[...sales].reverse().slice(0,20).map((b,i)=>(
                    <div key={i} style={{...card,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <p style={{margin:'0 0 3px',fontSize:13,fontWeight:600,color:TX}}>{b.bill_id||b.id}</p>
                        <p style={{margin:0,fontSize:11,color:DIM}}>{b.date} · {(b.payment_mode||b.mode||'').toUpperCase()}</p>
                      </div>
                      <span style={{fontSize:15,fontWeight:700,color:GOLD}}>Rs. {Number(b.total).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
