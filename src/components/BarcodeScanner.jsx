import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { GOLD, BOR, TX, DIM, MU, ghostBtn } from '../utils/theme';

export default function BarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('Tap to start');
  const [debug, setDebug] = useState('');
  const [lastCode, setLastCode] = useState('');
  const [started, setStarted] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const log = (m) => { console.log('[SCAN]', m); setDebug(d => d + '\n' + m); };

  const startCamera = async () => {
    try {
      log('1. Started');
      setStarted(true);
      await new Promise(r => setTimeout(r, 300));

      const video = videoRef.current;
      if (!video) { log('❌ NO VIDEO REF'); return; }
      log('2. Video ref OK');

      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('muted', 'true');
      video.setAttribute('autoplay', 'true');
      video.playsInline = true;
      video.muted = true;
      video.autoplay = true;
      log('3. Attrs set');

      log('4. Requesting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      streamRef.current = stream;
      log('5. Got stream, tracks: ' + stream.getTracks().length);

      const track = stream.getVideoTracks()[0];
      if (track) {
        log('6. Track: ' + track.label + ' state=' + track.readyState);
      }

      video.srcObject = stream;
      log('7. srcObject set');

      await new Promise((resolve, reject) => {
        let done = false;
        const finish = (ok, why) => { if (done) return; done = true; log('8. ' + why); if (ok) resolve(); else reject(new Error(why)); };
        video.addEventListener('loadedmetadata', () => finish(true, 'metadata OK'), { once: true });
        video.addEventListener('canplay', () => finish(true, 'canplay OK'), { once: true });
        setTimeout(() => finish(false, 'metadata timeout'), 8000);
      });

      log('9. Video dims: ' + video.videoWidth + 'x' + video.videoHeight);

      try { await video.play(); log('10. play() OK'); }
      catch(pe) { log('10. play() failed: ' + pe.message); }

      setStatus('📷 Point at barcode');
      log('11. Starting decode...');

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
      log('12. Decoder ready ✅');

    } catch(e) {
      console.error('Scanner error:', e);
      setStarted(false);
      let msg = e.name || e.message || 'Unknown';
      log('❌ ERROR: ' + msg);
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

        <div style={{display:started?'block':'none',position:'relative',background:'#000',borderRadius:12,overflow:'hidden',aspectRatio:'4/3'}}>
          <video ref={videoRef} playsInline muted autoPlay webkit-playsinline='true' style={{width:'100%',height:'100%',objectFit:'cover',display:'block',background:'#000'}}></video>
          <div style={{position:'absolute',top:'50%',left:'10%',right:'10%',height:2,background:GOLD,boxShadow:'0 0 12px '+GOLD,pointerEvents:'none'}}></div>
        </div>

        <p style={{marginTop:12,fontSize:13,color:TX,textAlign:'center'}}>{status}</p>
        {lastCode && <p style={{fontSize:11,color:MU,textAlign:'center',margin:'4px 0 0'}}>Last: {lastCode}</p>}

        {debug && (
          <pre style={{marginTop:12,fontSize:10,color:'#8FCC8F',background:'#0A0A0A',padding:8,borderRadius:6,maxHeight:150,overflow:'auto',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>{debug}</pre>
        )}
      </div>
    </div>
  );
}
