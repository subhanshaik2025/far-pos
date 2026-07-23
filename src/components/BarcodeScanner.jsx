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
  const streamRef = useRef(null);
  const [status, setStatus] = useState('Tap "Start Camera" to begin');
  const [lastCode, setLastCode] = useState('');
  const [started, setStarted] = useState(false);

  const startCamera = async () => {
    setStatus('Requesting camera access...');
    try {
      // STEP 1: Explicitly request camera permission FIRST (works better on iOS)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;

      // STEP 2: Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        try { await videoRef.current.play(); } catch(playErr) { console.warn("Play blocked, retrying:", playErr); videoRef.current.muted = true; await videoRef.current.play(); }
      }

      setStatus('📷 Point at barcode');
      setStarted(true);

      // STEP 3: Load ZXing and start decoding
      await loadZXing();
      if (!window.ZXingBrowser) { setStatus('❌ Scanner library failed'); return; }

      const reader = new window.ZXingBrowser.BrowserMultiFormatReader();
      const controls = await reader.decodeFromStream(stream, videoRef.current, (result) => {
        if (result) {
          const code = result.getText();
          setLastCode(code);
          setStatus('✅ Scanned: ' + code);
          if (navigator.vibrate) navigator.vibrate(150);
          onScan(code);
        }
      });
      controlsRef.current = controls;

    } catch(e) {
      let msg = e.message || String(e);
      if (msg.includes('NotAllowed') || msg.includes('Permission')) {
        msg = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (msg.includes('NotFound')) {
        msg = 'No camera found on this device.';
      } else if (msg.includes('NotReadable')) {
        msg = 'Camera in use by another app. Close other apps and try again.';
      }
      setStatus('❌ ' + msg);
    }
  };

  useEffect(() => {
    return () => {
      try { controlsRef.current && controlsRef.current.stop(); } catch(e) {}
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }
      } catch(e) {}
    };
  }, []);

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:1000,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:480,background:'#0F0F0F',border:'1px solid '+BOR,borderRadius:16,padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <p style={{fontSize:14,color:GOLD,margin:0,fontWeight:600,letterSpacing:1}}>📷 SCAN BARCODE</p>
          <button onClick={onClose} style={{...ghostBtn,padding:'6px 12px'}}>✕ Close</button>
        </div>

        {!started && (
          <div style={{textAlign:'center',padding:'40px 20px'}}>
            <div style={{fontSize:60,marginBottom:16}}>📷</div>
            <p style={{fontSize:14,color:TX,marginBottom:20,lineHeight:1.5}}>We need camera access to scan barcodes. Tap below and allow camera when asked.</p>
            <button onClick={startCamera} style={{padding:'14px 28px',background:'linear-gradient(135deg,#C9A84C,#E8C97A)',color:'#000',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer'}}>▶️ Start Camera</button>
          </div>
        )}

        {started && (
          <div style={{position:'relative',background:'#000',borderRadius:12,overflow:'hidden',aspectRatio:'4/3'}}>
            <video ref={videoRef} style={{width:'100%',height:'100%',objectFit:'cover'}} muted playsInline autoPlay webkit-playsinline='true'></video>
            <div style={{position:'absolute',top:'50%',left:'10%',right:'10%',height:2,background:GOLD,boxShadow:'0 0 12px '+GOLD,pointerEvents:'none'}}></div>
          </div>
        )}

        <p style={{marginTop:12,fontSize:13,color:TX,textAlign:'center'}}>{status}</p>
        {lastCode && <p style={{fontSize:11,color:MU,textAlign:'center',margin:'4px 0 0'}}>Last code: {lastCode}</p>}
        {started && <p style={{fontSize:11,color:DIM,textAlign:'center',margin:'8px 0 0'}}>Hold barcode 10-20cm from camera</p>}
      </div>
    </div>
  );
}
