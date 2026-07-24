import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';
import { GOLD, BOR, TX, DIM, MU, ghostBtn } from '../utils/theme';

// SPEED OPTIMIZATION: only look for retail barcode formats
const HINTS = new Map();
HINTS.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
]);
HINTS.set(DecodeHintType.TRY_HARDER, false); // false = faster
HINTS.set(DecodeHintType.ASSUME_GS1, false);

export default function BarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const streamRef = useRef(null);
  const scannedRef = useRef(false);
  const [status, setStatus] = useState('Tap to start');
  const [lastCode, setLastCode] = useState('');
  const [started, setStarted] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const startCamera = async () => {
    try {
      setStatus('Starting camera...');
      setStarted(true);
      await new Promise(r => setTimeout(r, 200));

      const video = videoRef.current;
      if (!video) { setStatus('❌ Video not ready'); return; }

      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('autoplay', 'true');
      video.setAttribute('muted', 'true');
      video.playsInline = true;
      video.muted = true;
      video.autoplay = true;

      // FAST CAMERA: higher framerate, focus close
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, min: 15 },
          focusMode: 'continuous',
          advanced: [{ focusMode: 'continuous' }]
        },
        audio: false
      });
      streamRef.current = stream;
      video.srcObject = stream;

      // Try to lock focus mode (Android)
      const track = stream.getVideoTracks()[0];
      if (track && track.applyConstraints) {
        try {
          const caps = track.getCapabilities ? track.getCapabilities() : {};
          if (caps.focusMode && caps.focusMode.includes('continuous')) {
            await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
          }
        } catch(e) {}
      }

      await new Promise((resolve, reject) => {
        const onReady = () => { video.removeEventListener('loadedmetadata', onReady); resolve(); };
        video.addEventListener('loadedmetadata', onReady);
        setTimeout(() => reject(new Error('Video timeout')), 6000);
      });

      try { await video.play(); }
      catch(pe) { video.muted = true; await new Promise(r => setTimeout(r, 100)); await video.play(); }

      setStatus('📷 Point at barcode');

      // FAST DECODER: with restricted format hints
      const reader = new BrowserMultiFormatReader(HINTS, 100); // 100ms between scans (fast)

      const controls = await reader.decodeFromVideoElement(video, (result, err) => {
        if (result && !scannedRef.current) {
          scannedRef.current = true;
          const code = result.getText();
          setLastCode(code);
          setStatus('✅ Scanned: ' + code);
          if (navigator.vibrate) navigator.vibrate(80);
          onScan(code);
          // Allow next scan after 500ms
          setTimeout(() => { scannedRef.current = false; }, 500);
        }
      });
      controlsRef.current = controls;

    } catch(e) {
      console.error('Scanner error:', e);
      setStarted(false);
      let msg = '';
      if (e && typeof e === 'object') {
        if (e.name === 'NotAllowedError') msg = 'Camera denied. Settings → Safari → Camera → Allow';
        else if (e.name === 'NotFoundError') msg = 'No camera found';
        else if (e.name === 'NotReadableError') msg = 'Camera busy';
        else if (e.message) msg = e.message;
        else if (e.name) msg = e.name;
      }
      if (!msg) msg = 'Camera failed. Use manual entry.';
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
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:1000,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,overflow:'auto'}}>
      <div style={{width:'100%',maxWidth:480,background:'#0F0F0F',border:'1px solid '+BOR,borderRadius:16,padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <p style={{fontSize:14,color:GOLD,margin:0,fontWeight:600,letterSpacing:1}}>📷 SCAN BARCODE</p>
          <button onClick={onClose} style={{...ghostBtn,padding:'6px 12px'}}>✕ Close</button>
        </div>

        {!started && (
          <div style={{textAlign:'center',padding:'20px'}}>
            <div style={{fontSize:50,marginBottom:12}}>📷</div>
            <p style={{fontSize:13,color:TX,marginBottom:16,lineHeight:1.5}}>Tap to start camera</p>
            <button onClick={startCamera} style={{padding:'12px 24px',background:'linear-gradient(135deg,#C9A84C,#E8C97A)',color:'#000',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:16}}>▶️ Start Camera</button>

            <div style={{borderTop:'1px solid '+BOR,paddingTop:16,marginTop:8}}>
              <p style={{fontSize:11,color:MU,margin:'0 0 8px',letterSpacing:1,textTransform:'uppercase'}}>Or enter manually</p>
              <div style={{display:'flex',gap:6}}>
                <input value={manualCode} onChange={e=>setManualCode(e.target.value)} placeholder='Type barcode' style={{flex:1,padding:'10px 12px',background:'#141414',border:'1px solid '+BOR,color:TX,borderRadius:8,fontSize:13}} />
                <button onClick={submitManual} disabled={!manualCode.trim()} style={{padding:'10px 16px',background:GOLD,color:'#000',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',opacity:manualCode.trim()?1:0.4}}>Add</button>
              </div>
            </div>
          </div>
        )}

        <div style={{display:started?'block':'none',position:'relative',background:'#000',borderRadius:12,overflow:'hidden',aspectRatio:'4/3'}}>
          <video ref={videoRef} playsInline muted autoPlay webkit-playsinline='true' style={{width:'100%',height:'100%',objectFit:'cover',display:'block',background:'#000'}}></video>
          {/* Bright scan zone with corners for aiming */}
          <div style={{position:'absolute',top:'25%',bottom:'25%',left:'8%',right:'8%',border:'2px solid '+GOLD,borderRadius:8,boxShadow:'0 0 20px '+GOLD+'88, inset 0 0 20px rgba(0,0,0,0.4)',pointerEvents:'none'}}></div>
          <div style={{position:'absolute',top:'50%',left:'10%',right:'10%',height:1,background:GOLD,boxShadow:'0 0 8px '+GOLD,pointerEvents:'none',animation:'fpScanLine 1.2s ease-in-out infinite alternate'}}></div>
          <style>{'@keyframes fpScanLine { from { top: 27% } to { top: 73% } }'}</style>
        </div>

        <p style={{marginTop:12,fontSize:13,color:TX,textAlign:'center'}}>{status}</p>
        {lastCode && <p style={{fontSize:11,color:MU,textAlign:'center',margin:'4px 0 0'}}>Last: {lastCode}</p>}
        {started && <p style={{fontSize:11,color:DIM,textAlign:'center',margin:'8px 0 0'}}>Hold steady, fill the gold box with the barcode</p>}
      </div>
    </div>
  );
}
