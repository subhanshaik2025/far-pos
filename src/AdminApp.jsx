import { useState, useEffect } from 'react';
const GOLD='#C9A84C',BG='#0F0F0F',SURF='#1A1A1A',BOR='#2A2A2A',TX='#DDDDDD',MU='#888',DIM='#555';
const USERS_URL='https://script.google.com/macros/s/AKfycbyOJivL481i7M6VTA-xLb0jGI2lmu9IvRpjvooU47GbH8to_GiZ24A35OhPgTtZGaj7qQ/exec';
const SALES_URL='https://script.google.com/macros/s/AKfycbyWh7fm7c7C_LcwzVdf70Utn-09-h7EVs7O-IX-tkPsaI-T9hWToBrJZX-G4wPJ0PcelQ/exec';
const ADMIN_PHONE='9533360607';
const ADMIN_PASSWORD='admin@far123';

const inp={width:'100%',padding:'11px 14px',borderRadius:8,border:'1px solid #333',background:'#111',color:TX,fontSize:13,outline:'none',boxSizing:'border-box'};
const gBtn=(d)=>({padding:'10px 20px',background:d?'#333':GOLD,color:d?MU:'#000',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:d?'not-allowed':'pointer'});
const ghBtn={padding:'8px 16px',background:'transparent',color:GOLD,border:'1px solid #333',borderRadius:8,fontSize:12,cursor:'pointer'};
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
  const [toast,setToast]=useState('');
  const [whatsappVendor,setWhatsappVendor]=useState(null);
  const [whatsappMsg,setWhatsappMsg]=useState('');
  const [removeBillVendor,setRemoveBillVendor]=useState(null);
  const [vendorSalesLoading,setVendorSalesLoading]=useState(false);

  useEffect(()=>{ if(isLoggedIn) loadData(); },[isLoggedIn]);

  const showToast=(msg)=>{ setToast(msg); setTimeout(()=>setToast(''),3000); };

  const loadData=async()=>{
    setDataLoading(true);
    try {
      const res=await fetch(USERS_URL+'?action=getAdminData');
      const data=await res.json();
      if(data.success){ const al=data.allowed||[]; const rg=data.registered||[]; setVendors(al); setRegistered(rg); setTimeout(()=>loadAllSalesWith(al,rg),0); }
    } catch(e){ console.error(e); }
    setDataLoading(false);
  };

  const loadVendorSales=async(v)=>{
    const key=vkey(v);
    if(allSales[key]) return;
    const vendorId=gid(v);
    const shopName=salesShop(v);
    if(!vendorId){ setAllSales(prev=>({...prev,[key]:[]})); return; }
    try {
      const res=await fetch(SALES_URL+'?action=getSales&vendor_id='+encodeURIComponent(vendorId)+'&shop_name='+encodeURIComponent(shopName));
      const data=await res.json();
      setAllSales(prev=>({...prev,[key]:(data&&data.success&&data.sales)?data.sales:[]}));
    } catch(e){ setAllSales(prev=>({...prev,[key]:[]})); }
  };

  const loadAllSales=async(vendorList)=>{
    setDataLoading(true);
    const next={};
    for(const v of vendorList){
      const key=vkey(v);
      const vendorId=gid(v);
      const shopName=salesShop(v);
      if(!vendorId){ next[key]=[]; continue; }
      try {
        const res=await fetch(SALES_URL+'?action=getSales&vendor_id='+encodeURIComponent(vendorId)+'&shop_name='+encodeURIComponent(shopName));
        const data=await res.json();
        next[key]=(data&&data.success&&data.sales)?data.sales:[];
      } catch(e){ next[key]=[]; }
    }
    setAllSales(next);
    setDataLoading(false);
  };

  const loadAllSalesWith=async(vendorList,regList)=>{
    const np=(p)=>String(p||'').replace(/[^0-9]/g,'');
    const next={};
    for(const v of vendorList){
      const ph=np(v['Phone Number']||v.phone);
      const reg=regList.find(r=>np(r.phone||r['Phone'])===ph);
      if(!reg||!reg.id){ next[ph]=[]; continue; }
      try {
        const res=await fetch(SALES_URL+'?action=getSales&vendor_id='+encodeURIComponent(reg.id)+'&shop_name='+encodeURIComponent(reg.shop_name||''));
        const data=await res.json();
        next[ph]=(data&&data.success&&data.sales)?data.sales:[];
      } catch(e){ next[ph]=[]; }
    }
    setAllSales(next);
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
      showToast(status==='active'?'✅ Vendor activated':'🚫 Vendor blocked');
    } catch(e){ showToast('❌ Failed'); }
  };

  const addVendor=async()=>{
    if(!newVendor.phone||!newVendor.ownerName||!newVendor.shopName){showToast('Fill all fields');return;}
    try {
      const params=new URLSearchParams({action:'addVendor',...newVendor});
      await fetch(USERS_URL+'?'+params.toString());
      setShowAddVendor(false);
      setNewVendor({phone:'',ownerName:'',shopName:'',industryType:'kirana',plan:'starter'});
      loadData();
      showToast('✅ Vendor added!');
    } catch(e){ showToast('❌ Failed'); }
  };

  const removeBill=async(vendor,billId)=>{
    const confirmed=window.confirm('Remove bill '+billId+' from '+gs(vendor)+'? This cannot be undone.');
    if(!confirmed) return;
    const shopName=gs(vendor);
    const updated=(allSales[vkey(vendor)]||[]).filter(b=>(b.bill_id||b.id)!==billId);
    setAllSales(prev=>({...prev,[vkey(vendor)]:updated}));
    showToast('🗑️ Bill removed from view. Note: manually delete from Google Sheets to permanently remove.');
  };

  const sendWhatsApp=(vendor,msg)=>{
    const ph=gp(vendor).replace(/[^0-9]/g,'');
    window.open('https://wa.me/91'+ph+'?text='+encodeURIComponent(msg),'_blank');
    setWhatsappVendor(null);
    setWhatsappMsg('');
    showToast('📱 Opening WhatsApp...');
  };

  const gp=(v)=>String(v['Phone Number']||v.phone||'');
  const gn=(v)=>v['Owner Name']||v.ownerName||'Unknown';
  const gs=(v)=>v['Shop Name']||v.shopName||'Unknown';
  const gi=(v)=>v['Industry Type']||v.industryType||'';
  const gpl=(v)=>v['Plan']||v.plan||'starter';
  const gst=(v)=>v['Status']||v.status||'active';
  const normPhone=(p)=>String(p||'').replace(/[^0-9]/g,'');
  const getReg=(v)=>registered.find(r=>normPhone(r.phone||r['Phone'])===normPhone(gp(v)))||null;
  const gid=(v)=>{ const r=getReg(v); return r?String(r.id||''):''; };
  const salesShop=(v)=>{ const r=getReg(v); return r?String(r.shop_name||gs(v)):gs(v); };
  const vkey=(v)=>normPhone(gp(v));
  const isReg=(ph)=>registered.some(r=>String(r['Phone']||r.phone||'')===String(ph));

  const getVendorRevenue=(v)=>{
    const sales=allSales[vkey(v)]||[];
    return sales.reduce((s,b)=>s+Number(b.total||0),0);
  };

  // Sort vendors by total sales (highest first)
  const sortedVendors=[...vendors].sort((a,b)=>{
    const ra=getVendorRevenue(a);
    const rb=getVendorRevenue(b);
    return rb-ra;
  });

  const filteredVendors=sortedVendors.filter(v=>{
    if(!searchQ) return true;
    const q=searchQ.toLowerCase();
    return gn(v).toLowerCase().includes(q)||gs(v).toLowerCase().includes(q)||gp(v).includes(q);
  });

  // Overall stats
  const totalRevenue=vendors.reduce((s,v)=>s+(allSales[vkey(v)]||[]).reduce((ss,b)=>ss+Number(b.total||0),0),0);
  const totalBills=vendors.reduce((s,v)=>s+(allSales[vkey(v)]||[]).length,0);
  const activeVendors=vendors.filter(v=>gst(v).toLowerCase()==='active').length;
  const totalCash=vendors.reduce((s,v)=>s+(allSales[vkey(v)]||[]).filter(b=>(b.payment_mode||b.mode||'').toLowerCase()==='cash').reduce((ss,b)=>ss+Number(b.total||0),0),0);
  const totalUPI=vendors.reduce((s,v)=>s+(allSales[vkey(v)]||[]).filter(b=>(b.payment_mode||b.mode||'').toLowerCase()==='upi').reduce((ss,b)=>ss+Number(b.total||0),0),0);

  if(!isLoggedIn) return (
    <div style={{minHeight:'100vh',background:BG,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:380,background:SURF,border:'1px solid '+BOR,borderRadius:16,padding:32}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <img src='/logo.png' style={{height:56,marginBottom:12}} alt='FAR POS' />
          <p style={{fontSize:20,fontWeight:700,color:GOLD,margin:0,letterSpacing:1}}>ADMIN PANEL</p>
          <p style={{fontSize:12,color:MU,margin:'4px 0 0'}}>FAR POS Management</p>
        </div>
        {error&&<p style={{color:'#F87171',fontSize:13,marginBottom:12,textAlign:'center'}}>{error}</p>}
        <input placeholder='Admin Phone' value={phone} onChange={e=>setPhone(e.target.value)} style={{...inp,marginBottom:10}} />
        <input type='password' placeholder='Password' value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} style={{...inp,marginBottom:16}} />
        <button onClick={handleLogin} disabled={loading} style={{...gBtn(loading),width:'100%',padding:'13px'}}>{loading?'Logging in...':'Login'}</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:BG,color:TX,fontFamily:'Inter,sans-serif'}}>
      {/* Toast */}
      {toast&&<div style={{position:'fixed',top:16,left:'50%',transform:'translateX(-50%)',background:SURF,border:'1px solid '+BOR,borderRadius:10,padding:'10px 20px',fontSize:13,color:TX,zIndex:9999,boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>{toast}</div>}

      {/* WhatsApp Modal */}
      {whatsappVendor&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{width:'100%',maxWidth:480,background:SURF,border:'1px solid '+BOR,borderRadius:16,padding:20}}>
            <p style={{fontSize:14,fontWeight:700,color:GOLD,margin:'0 0 4px'}}>📱 Send WhatsApp</p>
            <p style={{fontSize:12,color:MU,margin:'0 0 14px'}}>To: {gn(whatsappVendor)} ({gp(whatsappVendor)}) — {gs(whatsappVendor)}</p>
            <textarea value={whatsappMsg} onChange={e=>setWhatsappMsg(e.target.value)} placeholder='Type your message...' rows={5} style={{...inp,resize:'vertical',marginBottom:12}} />
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>sendWhatsApp(whatsappVendor,whatsappMsg)} disabled={!whatsappMsg.trim()} style={gBtn(!whatsappMsg.trim())}>📱 Send</button>
              <button onClick={()=>setWhatsappVendor(null)} style={ghBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{background:SURF,borderBottom:'1px solid '+BOR,padding:'14px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src='/logo.png' style={{height:36}} alt='FAR POS' />
          <div>
            <p style={{margin:0,fontSize:14,fontWeight:700,color:GOLD,letterSpacing:1}}>FAR POS ADMIN</p>
            <p style={{margin:0,fontSize:10,color:MU}}>{vendors.length} vendors · Rs. {totalRevenue.toLocaleString()} total</p>
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={loadData} style={ghBtn}>{dataLoading?'Loading...':'🔄 Refresh'}</button>
          <button onClick={()=>{localStorage.removeItem('admin-token');setIsLoggedIn(false);}} style={{...ghBtn,color:'#F87171',borderColor:'#4A2020'}}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,padding:'12px 24px',borderBottom:'1px solid '+BOR,overflowX:'auto'}}>
        {['overview','vendors','analytics'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 18px',borderRadius:8,fontSize:13,fontWeight:tab===t?700:400,background:tab===t?GOLD:'transparent',color:tab===t?'#000':MU,border:tab===t?'none':'1px solid transparent',cursor:'pointer',textTransform:'capitalize',whiteSpace:'nowrap'}}>{t==='overview'?'📊 Overview':t==='vendors'?'👥 Vendors':'📈 Analytics'}</button>
        ))}
      </div>

      <div style={{padding:24,maxWidth:1200,margin:'0 auto'}}>

        {/* OVERVIEW TAB */}
        {tab==='overview'&&(
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:24}}>
              {[
                {label:'Total Revenue',value:'Rs. '+totalRevenue.toLocaleString(),color:GOLD,icon:'💰'},
                {label:'Total Bills',value:totalBills,color:'#60A5FA',icon:'🧾'},
                {label:'Total Vendors',value:vendors.length,color:'#C084FC',icon:'🏪'},
                {label:'Active Vendors',value:activeVendors,color:'#34D399',icon:'✅'},
                {label:'Cash Sales',value:'Rs. '+totalCash.toLocaleString(),color:'#34D399',icon:'💵'},
                {label:'UPI Sales',value:'Rs. '+totalUPI.toLocaleString(),color:'#FBBF24',icon:'📱'},
              ].map(s=>(
                <div key={s.label} style={{background:SURF,border:'1px solid '+BOR,borderRadius:12,padding:16}}>
                  <p style={{fontSize:20,margin:'0 0 6px'}}>{s.icon}</p>
                  <p style={{fontSize:11,color:DIM,letterSpacing:1.5,textTransform:'uppercase',margin:'0 0 4px'}}>{s.label}</p>
                  <p style={{fontSize:22,fontWeight:700,color:s.color,margin:0}}>{s.value}</p>
                </div>
              ))}
            </div>

            <p style={{fontSize:11,letterSpacing:2,color:GOLD,textTransform:'uppercase',margin:'0 0 12px',fontWeight:600}}>Top Vendors by Revenue</p>
            {sortedVendors.slice(0,5).map((v,i)=>{
              const rev=getVendorRevenue(v);
              const bills=(allSales[vkey(v)]||[]).length;
              return (
                <div key={gp(v)} style={{...card,display:'flex',alignItems:'center',gap:14,cursor:'pointer',borderColor:i===0?GOLD+'44':BOR}} onClick={()=>{setSelectedVendor(v);setTab('vendors');loadVendorSales(v);}}>
                  <span style={{fontSize:18,fontWeight:700,color:GOLD,minWidth:28}}>#{i+1}</span>
                  <div style={{flex:1}}>
                    <p style={{margin:'0 0 2px',fontSize:14,fontWeight:600,color:TX}}>{gs(v)}</p>
                    <p style={{margin:0,fontSize:11,color:MU}}>{gn(v)} · {bills} bills</p>
                  </div>
                  <span style={{fontSize:16,fontWeight:700,color:GOLD}}>Rs. {rev.toLocaleString()}</span>
                </div>
              );
            })}

            {vendors.length===0&&!dataLoading&&(
              <div style={{textAlign:'center',padding:'60px 0',color:DIM}}>
                <p style={{fontSize:40,marginBottom:12}}>🏪</p>
                <p>No vendors yet. Add your first vendor!</p>
              </div>
            )}
          </div>
        )}

        {/* VENDORS TAB */}
        {tab==='vendors'&&(
          <div>
            <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
              <input placeholder='Search vendor, shop, phone...' value={searchQ} onChange={e=>setSearchQ(e.target.value)} style={{...inp,maxWidth:320}} />
              <button onClick={()=>setShowAddVendor(true)} style={gBtn(false)}>+ Add Vendor</button>
            </div>

            {showAddVendor&&(
              <div style={{...card,borderColor:GOLD+'44',marginBottom:20}}>
                <p style={{fontSize:13,fontWeight:700,color:GOLD,margin:'0 0 14px'}}>Add New Vendor</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                  <input placeholder='Phone Number' value={newVendor.phone} onChange={e=>setNewVendor({...newVendor,phone:e.target.value})} style={inp} />
                  <input placeholder='Owner Name' value={newVendor.ownerName} onChange={e=>setNewVendor({...newVendor,ownerName:e.target.value})} style={inp} />
                  <input placeholder='Shop Name' value={newVendor.shopName} onChange={e=>setNewVendor({...newVendor,shopName:e.target.value})} style={inp} />
                  <select value={newVendor.industryType} onChange={e=>setNewVendor({...newVendor,industryType:e.target.value})} style={{...inp}}>
                    {['kirana','restaurant','cloth','tiffin','pharmacy','salon'].map(i=><option key={i} value={i}>{i.charAt(0).toUpperCase()+i.slice(1)}</option>)}
                  </select>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={addVendor} style={gBtn(false)}>Add Vendor</button>
                  <button onClick={()=>setShowAddVendor(false)} style={ghBtn}>Cancel</button>
                </div>
              </div>
            )}

            {/* Vendor List */}
            {!selectedVendor&&filteredVendors.map((v,i)=>{
              const rev=getVendorRevenue(v);
              const bills=(allSales[vkey(v)]||[]).length;
              const isActive=gst(v).toLowerCase()==='active';
              return (
                <div key={gp(v)} style={{...card,borderColor:i===0&&!searchQ?GOLD+'33':BOR}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:10}}>
                    <div style={{cursor:'pointer'}} onClick={()=>{setSelectedVendor(v);loadVendorSales(v);}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                        <p style={{margin:0,fontSize:14,fontWeight:700,color:TX}}>{gs(v)}</p>
                        <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,background:isActive?'#1A2E1A':'#2A1010',color:isActive?'#34D399':'#F87171'}}>{isActive?'ACTIVE':'BLOCKED'}</span>
                        {i===0&&!searchQ&&<span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,background:'#1E1A10',color:GOLD}}>🏆 TOP</span>}
                      </div>
                      <p style={{margin:'0 0 2px',fontSize:12,color:MU}}>{gn(v)} · {gp(v)}</p>
                      <p style={{margin:0,fontSize:11,color:DIM}}>{gi(v)} · {gpl(v)} plan · {bills} bills · Rs. {rev.toLocaleString()}</p>
                    </div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      <button onClick={()=>{setSelectedVendor(v);loadVendorSales(v);}} style={ghBtn}>📊 Details</button>
                      <button onClick={()=>{setWhatsappVendor(v);setWhatsappMsg('Dear '+gn(v)+', message from FAR POS team. Regards, FAR POS Team');}} style={{...ghBtn,color:'#34D399',borderColor:'#2A4A2A'}}>📱 WhatsApp</button>
                      <button onClick={()=>updateStatus(gp(v),isActive?'blocked':'active')} style={{...ghBtn,color:isActive?'#F87171':'#34D399',borderColor:isActive?'#4A2020':'#1A4A1A'}}>{isActive?'🚫 Block':'✅ Activate'}</button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Vendor Detail */}
            {selectedVendor&&(()=>{
              const shopName=gs(selectedVendor);
              const sales=allSales[vkey(selectedVendor)]||[];
              const totalRev=sales.reduce((s,b)=>s+Number(b.total||0),0);
              const cashRev=sales.filter(b=>(b.payment_mode||b.mode||'').toLowerCase()==='cash').reduce((s,b)=>s+Number(b.total||0),0);
              const upiRev=sales.filter(b=>(b.payment_mode||b.mode||'').toLowerCase()==='upi').reduce((s,b)=>s+Number(b.total||0),0);
              const gstRev=sales.reduce((s,b)=>s+Number(b.gst||0),0);
              return (
                <div>
                  <button onClick={()=>setSelectedVendor(null)} style={{...ghBtn,marginBottom:16}}>← Back to Vendors</button>
                  <div style={{...card,borderColor:GOLD+'44',marginBottom:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:10}}>
                      <div>
                        <p style={{fontSize:18,fontWeight:700,color:TX,margin:'0 0 4px'}}>{shopName}</p>
                        <p style={{fontSize:12,color:MU,margin:'0 0 2px'}}>👤 {gn(selectedVendor)} · 📞 {gp(selectedVendor)}</p>
                        <p style={{fontSize:12,color:MU,margin:0}}>🏭 {gi(selectedVendor)} · 📋 {gpl(selectedVendor)} plan · {isReg(gp(selectedVendor))?'✅ Registered':'❌ Not Registered'}</p>
                      </div>
                      <div style={{display:'flex',gap:6}}>
                        <button onClick={()=>{setWhatsappVendor(selectedVendor);setWhatsappMsg('Dear '+gn(selectedVendor)+', message from FAR POS team. Regards, FAR POS Team');}} style={{...ghBtn,color:'#34D399',borderColor:'#2A4A2A'}}>📱 WhatsApp</button>
                        <button onClick={()=>updateStatus(gp(selectedVendor),gst(selectedVendor).toLowerCase()==='active'?'blocked':'active')} style={{...ghBtn,color:gst(selectedVendor).toLowerCase()==='active'?'#F87171':'#34D399'}}>{gst(selectedVendor).toLowerCase()==='active'?'🚫 Block':'✅ Activate'}</button>
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

                  {vendorSalesLoading&&<p style={{color:MU,textAlign:'center',padding:20}}>Loading sales...</p>}

                  <p style={{fontSize:11,letterSpacing:2,color:GOLD,textTransform:'uppercase',margin:'0 0 12px',fontWeight:600}}>Bills ({sales.length})</p>
                  {sales.length===0&&!vendorSalesLoading&&<p style={{color:DIM,fontSize:13}}>No sales yet</p>}
                  {[...sales].reverse().slice(0,50).map((b,i)=>(
                    <div key={i} style={{...card,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <p style={{margin:'0 0 2px',fontSize:13,fontWeight:600,color:TX}}>{b.bill_id||b.id||'Bill '+(i+1)}</p>
                        <p style={{margin:'0 0 2px',fontSize:11,color:DIM}}>{b.date||b.timestamp} · {(b.payment_mode||b.mode||'').toUpperCase()}</p>
                        {(b.customer_name||b.customerName)&&<p style={{margin:0,fontSize:11,color:'#60A5FA'}}>👤 {b.customer_name||b.customerName} {(b.customer_phone||b.customerPhone)?'· '+(b.customer_phone||b.customerPhone):''}</p>}
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontSize:15,fontWeight:700,color:GOLD}}>Rs. {Number(b.total||0).toLocaleString()}</span>
                        <button onClick={()=>removeBill(selectedVendor,b.bill_id||b.id)} style={{padding:'4px 10px',background:'#2A1010',border:'1px solid #4A2020',color:'#F87171',borderRadius:6,cursor:'pointer',fontSize:11}}>🗑️ Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab==='analytics'&&(
          <div>
            <p style={{fontSize:11,letterSpacing:2,color:GOLD,textTransform:'uppercase',margin:'0 0 16px',fontWeight:600}}>Revenue by Vendor</p>
            {sortedVendors.length===0&&<p style={{color:DIM}}>No data yet — click Refresh to load vendor sales</p>}
            {sortedVendors.map((v,i)=>{
              const rev=getVendorRevenue(v);
              const bills=(allSales[vkey(v)]||[]).length;
              const maxRev=getVendorRevenue(sortedVendors[0])||1;
              const pct=Math.round(rev/maxRev*100);
              const cash=(allSales[vkey(v)]||[]).filter(b=>(b.payment_mode||b.mode||'').toLowerCase()==='cash').reduce((s,b)=>s+Number(b.total||0),0);
              const upi=rev-cash;
              return (
                <div key={gp(v)} style={{...card}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <div>
                      <span style={{fontSize:14,fontWeight:700,color:TX}}>{gs(v)}</span>
                      <span style={{fontSize:11,color:MU,marginLeft:8}}>{gn(v)}</span>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <span style={{fontSize:15,fontWeight:700,color:GOLD}}>Rs. {rev.toLocaleString()}</span>
                      <span style={{fontSize:11,color:MU,marginLeft:8}}>{bills} bills</span>
                    </div>
                  </div>
                  <div style={{background:'#222',borderRadius:4,height:8,marginBottom:6}}>
                    <div style={{background:'linear-gradient(90deg,'+GOLD+',#E8C97A)',borderRadius:4,height:8,width:pct+'%',transition:'width .3s'}}></div>
                  </div>
                  <div style={{display:'flex',gap:16}}>
                    <span style={{fontSize:11,color:'#34D399'}}>💵 Cash Rs. {cash.toLocaleString()}</span>
                    <span style={{fontSize:11,color:'#FBBF24'}}>📱 UPI Rs. {upi.toLocaleString()}</span>
                    <span style={{fontSize:11,color:'#C084FC'}}>📊 Avg Rs. {bills?Math.round(rev/bills).toLocaleString():0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
