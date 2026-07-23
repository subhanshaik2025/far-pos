import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { GOLD, BOR, TX, DIM, MU, ghostBtn } from '../utils/theme';

export default function BarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('Tap "Start Camera" to begin');
  const [lastCode, setLastCode] = useState('');
  const [started, setStarted] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const startCamera = async () => {
    try {
      setStatus('Requesting camera permission...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error('Video element not ready');

      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.muted = true;

      await new Promise((resolve, reject) => {
        const onReady = () => { video.removeEventListener('loadedmetadata', onReady); resolve(); };
        video.addEventListener('loadedmetadata', onReady);
        setTimeout(() => reject(new Error('Video timeout')), 5000);
      });

      try {
        await video.play();
      } catch(playErr) {
        video.muted = true;
        await new Promise(r => setTimeout(r, 100));
        await video.play();
      }

      setStarted(true);
      setStatus('📷 Point at barcode');

      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoElement(video, (result) => {
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
      console.error('Scanner error:', e);
      let msg = '';
      if (e && typeof e === 'object') {
        if (e.name === 'NotAllowedError') msg = 'Camera denied. Settings → Safari → Camera → Allow';
        else if (e.name === 'NotFoundError') msg = 'No camera found';
        else if (e.name === 'NotReadableError') msg = 'Camera busy — close other camera apps';
        else if (e.message) msg = e.message;
        else if (e.name) msg = e.name;
      }
      if (!msg) msg = 'Camera failed. Use manual entry below.';
      setStatus('❌ ' + msg);
    }
  };

  const submitManual = () => {
    const code = manualCode.trim();
    if (!code) return;
    onScan(code);
  };

  useEffect(() => {
    return () => {
      try { controlsRef.current && controlsRef.current.stop(); } catch(e) {}
      try { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); } catch(e) {}
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
          <div style={{textAlign:'center',padding:'20px'}}>
            <div style={{fontSize:50,marginBottom:12}}>📷</div>
            <p style={{fontSize:13,color:TX,marginBottom:16,lineHeight:1.5}}>Tap to start camera. When browser asks, tap <b style={{color:GOLD}}>Allow</b>.</p>
            <button onClick={startCamera} style={{padding:'12px 24px',background:'linear-gradient(135deg,#C9A84C,#E8C97A)',color:'#000',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:16}}>▶️ Start Camera</button>

            <div style={{borderTop:'1px solid '+BOR,paddingTop:16,marginTop:8}}>
              <p style={{fontSize:11,color:MU,margin:'0 0 8px',letterSpacing:1,textTransform:'uppercase'}}>Or enter barcode manually</p>
              <div style={{display:'flex',gap:6}}>
                <input value={manualCode} onChange={e=>setManualCode(e.target.value)} placeholder='Type barcode number' style={{flex:1,padding:'10px 12px',background:'#141414',border:'1px solid '+BOR,color:TX,borderRadius:8,fontSize:13}} />
                <button onClick={submitManual} disabled={!manualCode.trim()} style={{padding:'10px 16px',background:GOLD,color:'#000',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',opacity:manualCode.trim()?1:0.4}}>Add</button>
              </div>
            </div>
          </div>
        )}

        {started && (
          <div style={{position:'relative',background:'#000',borderRadius:12,overflow:'hidden',aspectRatio:'4/3'}}>
            <video ref={videoRef} style={{width:'100%',height:'100%',objectFit:'cover'}} muted playsInline autoPlay></video>
            <div style={{position:'absolute',top:'50%',left:'10%',right:'10%',height:2,background:GOLD,boxShadow:'0 0 12px '+GOLD,pointerEvents:'none'}}></div>
          </div>
        )}
        {!started && (
          <video ref={videoRef} style={{display:'none'}} muted playsInline autoPlay></video>
        )}

        <p style={{marginTop:12,fontSize:13,color:TX,textAlign:'center'}}>{status}</p>
        {lastCode && <p style={{fontSize:11,color:MU,textAlign:'center',margin:'4px 0 0'}}>Last: {lastCode}</p>}
      </div>
    </div>
  );
}
