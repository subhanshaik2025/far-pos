import { useEffect, useRef, useState } from 'react';
import { GOLD, BOR, TX, DIM, MU, ghostBtn } from '../utils/theme';

function loadZXing() {
  if (window.ZXingBrowser) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/index.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function BarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [status, setStatus] = useState('Loading camera...');
  const [lastCode, setLastCode] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadZXing();
        if (cancelled) return;
        if (!window.ZXingBrowser) { setStatus('❌ Scanner library failed to load'); return; }

        const reader = new window.ZXingBrowser.BrowserMultiFormatReader();
        setStatus('📷 Point camera at barcode');

        const constraints = { video: { facingMode: 'environment' } };
        const controls = await reader.decodeFromConstraints(constraints, videoRef.current, (result, err) => {
          if (result) {
            const code = result.getText();
            setLastCode(code);
            setStatus('✅ Scanned: ' + code);
            navigator.vibrate && navigator.vibrate(150);
            onScan(code);
          }
        });
        controlsRef.current = controls;
      } catch(e) {
        setStatus('❌ ' + (e.message || 'Camera access denied'));
      }
    })();

    return () => {
      cancelled = true;
      try { controlsRef.current && controlsRef.current.stop(); } catch(e) {}
    };
  }, [onScan]);

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:1000,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:480,background:'#0F0F0F',border:'1px solid '+BOR,borderRadius:16,padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <p style={{fontSize:14,color:GOLD,margin:0,fontWeight:600,letterSpacing:1}}>📷 SCAN BARCODE</p>
          <button onClick={onClose} style={{...ghostBtn,padding:'6px 12px'}}>✕ Close</button>
        </div>

        <div style={{position:'relative',background:'#000',borderRadius:12,overflow:'hidden',aspectRatio:'4/3'}}>
          <video ref={videoRef} style={{width:'100%',height:'100%',objectFit:'cover'}} muted playsInline autoPlay></video>
          <div style={{position:'absolute',top:'50%',left:'10%',right:'10%',height:2,background:GOLD,boxShadow:'0 0 12px '+GOLD,pointerEvents:'none'}}></div>
        </div>

        <p style={{marginTop:12,fontSize:13,color:TX,textAlign:'center'}}>{status}</p>
        {lastCode && <p style={{fontSize:11,color:MU,textAlign:'center',margin:'4px 0 0'}}>Last code: {lastCode}</p>}
        <p style={{fontSize:11,color:DIM,textAlign:'center',margin:'8px 0 0'}}>Hold barcode 10-20cm from camera</p>
      </div>
    </div>
  );
}
