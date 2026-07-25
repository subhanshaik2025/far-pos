import { useState } from 'react';
import { GOLD, BOR, SURF, TX, DIM, MU, inp, goldBtn, ghostBtn, card, sT } from '../utils/theme';

// JsBarcode - lightweight barcode renderer (loads from CDN once)
function loadBarcodeLib() {
  if (window.JsBarcode) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function BarcodeLabels({ products, onClose, shopName }) {
  const [selected, setSelected] = useState({});
  const [copiesPerItem, setCopiesPerItem] = useState({});

  const toggleAll = (on) => {
    const next = {};
    products.forEach(p => { if (p.barcode) next[p.id] = on; });
    setSelected(next);
  };

  const chosen = products.filter(p => selected[p.id] && p.barcode);
  const totalLabels = chosen.reduce((s,p) => s + (Number(copiesPerItem[p.id])||1), 0);

  const printLabels = async () => {
    if (chosen.length === 0) { alert('Select at least one product'); return; }
    await loadBarcodeLib();

    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) { alert('Popup blocked — allow popups for this site'); return; }

    let cells = '';
    chosen.forEach(p => {
      const copies = Number(copiesPerItem[p.id]) || 1;
      for (let i = 0; i < copies; i++) {
        cells += `
          <div class="label">
            <div class="shop">${shopName || 'FAR POS'}</div>
            <div class="name">${p.name}</div>
            <svg class="bc" jsbarcode-value="${p.barcode}" jsbarcode-format="EAN13" jsbarcode-width="1.4" jsbarcode-height="40" jsbarcode-fontsize="11" jsbarcode-margin="2"></svg>

          </div>
        `;
      }
    });

    win.document.write(`<!DOCTYPE html><html><head><title>Barcode Labels</title><style>
      *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif;}
      @page{size:A4 portrait;margin:10mm 5mm;}
      body{background:#fff;color:#000;}
      html,body{width:210mm;}
      /* Oddy ST-12 A4: 2 cols x 6 rows = 12 labels, 100.01mm x 44.15mm each */
      .grid{
        display:grid;
        grid-template-columns:100.01mm 100.01mm;
        grid-auto-rows:44.15mm;
        column-gap:0mm;
        row-gap:0mm;
        justify-content:center;
      }
      .label{
        width:100.01mm;
        height:44.15mm;
        padding:3mm 4mm;
        text-align:center;
        page-break-inside:avoid;
        display:flex;
        flex-direction:column;
        justify-content:space-evenly;
        align-items:center;
        overflow:hidden;
        border:0.5px dashed #ddd;
      }
      .shop{
        font-size:8pt;
        color:#333;
        text-transform:uppercase;
        letter-spacing:1px;
        font-weight:700;
        line-height:1;
      }
      .name{
        font-size:11pt;
        font-weight:bold;
        line-height:1.2;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        width:100%;
        padding:0 2mm;
      }
      .bc{
        width:85%;
        height:16mm;
        max-height:16mm;
      }
      @media screen{
        .label{border:1px dashed #ccc;}
      }
      @media print{
        .label{border:none;}
        body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      }
      .toolbar{
        background:#f5f5f5;
        padding:12px;
        text-align:center;
        margin-bottom:8mm;
        position:sticky;
        top:0;
        z-index:10;
        box-shadow:0 2px 8px rgba(0,0,0,0.1);
      }
      .toolbar button{
        padding:8px 20px;
        background:#C9A84C;
        color:#000;
        border:none;
        border-radius:6px;
        font-weight:bold;
        cursor:pointer;
        font-size:14px;
      }
      .toolbar .info{
        font-size:12px;
        color:#666;
        margin-left:12px;
      }
      @media print{.toolbar{display:none;}}
    </style><script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script></head>
    <body>
      <div class="toolbar"><button onclick="window.print()">🖨️ Print Labels</button><span class="info">Oddy ST-12 A4 · 12 labels per page (2 × 6 · 100mm × 44mm)</span></div>
      <div class="grid">${cells}</div>
      <script>window.onload=function(){JsBarcode('.bc').init();}</script>
    </body></html>`);
    win.document.close();
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,padding:20,overflow:'auto'}}>
      <div style={{maxWidth:820,margin:'0 auto',background:'#0F0F0F',border:'1px solid '+BOR,borderRadius:16,padding:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <p style={{...sT,margin:0}}>🏷️ Print Barcode Labels</p>
          <button onClick={onClose} style={{...ghostBtn,padding:'6px 12px'}}>✕ Close</button>
        </div>

        <p style={{fontSize:12,color:MU,marginBottom:12}}>Buy <b style={{color:GOLD}}>Oddy ST-12 A4 label sticker sheets (2×6, 12 per page)</b> from Amazon (~₹300/100 sheets). Print, peel, and stick on your products.</p>

        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <button onClick={()=>toggleAll(true)} style={ghostBtn}>Select All</button>
          <button onClick={()=>toggleAll(false)} style={ghostBtn}>Clear</button>
          <div style={{flex:1}}></div>
          <span style={{fontSize:13,color:GOLD,fontWeight:600,alignSelf:'center'}}>{totalLabels} labels ready</span>
        </div>

        <div style={{maxHeight:'50vh',overflow:'auto',border:'1px solid '+BOR,borderRadius:10,marginBottom:14}}>
          {products.length===0 && <p style={{padding:20,textAlign:'center',color:DIM}}>No products yet</p>}
          {products.map(p=>(
            <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderBottom:'1px solid '+BOR}}>
              <input type='checkbox' checked={!!selected[p.id]} onChange={e=>setSelected({...selected,[p.id]:e.target.checked})} disabled={!p.barcode} style={{width:18,height:18,cursor:'pointer'}} />
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:0,fontSize:13,color:TX,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</p>
                <p style={{margin:'3px 0 0',fontSize:11,color:DIM}}>
                  {p.sku ? '📦 SKU: '+p.sku+' · ' : ''}
                  {p.barcode ? '🏷️ '+p.barcode : <span style={{color:'#F87171'}}>No barcode — assign one first</span>}
                </p>
              </div>
              {p.barcode && (
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:11,color:MU}}>Copies:</span>
                  <input type='number' min='1' max='50' value={copiesPerItem[p.id]||1} onChange={e=>setCopiesPerItem({...copiesPerItem,[p.id]:e.target.value})} style={{...inp,width:60,padding:'6px 8px',borderRadius:6}} />
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={printLabels} style={goldBtn(false)} disabled={totalLabels===0}>🖨️ Print {totalLabels} Label{totalLabels!==1?'s':''} (A4)</button>
      </div>
    </div>
  );
}
