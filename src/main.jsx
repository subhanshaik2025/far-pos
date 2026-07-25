import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AdminApp from './AdminApp'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{background:'#0F0F0F',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#DDD',fontFamily:'sans-serif',padding:20}}>
          <img src='/logo.png' style={{height:60,marginBottom:20}} alt='FAR POS' />
          <p style={{color:'#F87171',marginBottom:8}}>Something went wrong</p>
          <p style={{color:'#555',fontSize:12,marginBottom:20}}>{String(this.state.error)}</p>
          <button onClick={()=>window.location.reload()} style={{background:'#C9A84C',color:'#000',border:'none',padding:'10px 24px',borderRadius:8,cursor:'pointer',fontWeight:600}}>Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const isAdmin = window.location.pathname.startsWith('/admin');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      {isAdmin ? <AdminApp /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('SW registered');

      // Auto-update: when new SW is waiting, activate it immediately
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available — tell SW to skip waiting
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      // When SW has taken control, reload to get fresh version
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('New version available — reloading...');
          window.location.reload();
        }
      });

      // Check for updates every 5 minutes (while app is open)
      setInterval(() => reg.update(), 5 * 60 * 1000);

    }).catch(e => console.log('SW error', e));
  }
}
