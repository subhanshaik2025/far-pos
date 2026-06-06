import { useState } from 'react';
import { registerUser, loginUser } from './auth';
import { INDUSTRIES } from './config';

export default function AuthPage({ onLoginSuccess }) {
  const [step, setStep] = useState('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (password.length < 4) {
      setError('Please enter your password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const result = await loginUser(phoneNumber, password);
    if (result.success) {
      onLoginSuccess(result.user);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!selectedIndustry) {
      setError('Please select a business type');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const result = await registerUser(shopName, ownerName, phoneNumber, password, selectedIndustry);
    if (result.success) {
      onLoginSuccess(result.user);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (step === 'login') {
    return (
      <div style={{ background: 'linear-gradient(135deg, #E6F7F5, #F3F3EE)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Noto Sans', sans-serif" }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0D9488', marginBottom: 8, textAlign: 'center' }}>FAR-POS</h1>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 24, textAlign: 'center' }}>Multi-Industry Point of Sale</p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 8 }}>Phone Number</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14 }} placeholder="10-digit phone number" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 8 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, paddingRight: '40px' }} placeholder="Enter your password" />
              <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</button>
            </div>
          </div>

          {error && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 12px', borderRadius: 8, marginBottom: 16, fontSize: 12 }}>⚠️ {error}</div>}

          <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, background: '#0D9488', color: '#fff', border: 'none', cursor: 'pointer', marginBottom: 12, opacity: loading ? 0.6 : 1 }}>{loading ? 'Logging in...' : 'Login'}</button>

          <button onClick={() => { setStep('register'); setError(''); setPhoneNumber(''); setPassword(''); }} style={{ width: '100%', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, background: '#f0f0f0', color: '#0D9488', border: 'none', cursor: 'pointer' }}>Don't have account? Register</button>
        </div>
      </div>
    );
  }

  if (step === 'register') {
    return (
      <div style={{ background: 'linear-gradient(135deg, #E6F7F5, #F3F3EE)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Noto Sans', sans-serif" }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0D9488', marginBottom: 20 }}>Create Account</h2>

          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Phone Number</label><input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14 }} placeholder="10-digit phone number" /></div>

          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Owner Name</label><input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14 }} placeholder="Your full name" /></div>

          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Shop Name</label><input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14 }} placeholder="Your shop name" /></div>

          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Password</label><div style={{ position: 'relative' }}><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14, paddingRight: '40px' }} placeholder="Create a password (min 4 chars)" /><button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</button></div></div>

          {error && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 12px', borderRadius: 8, marginBottom: 16, fontSize: 12 }}>⚠️ {error}</div>}

          <button onClick={() => setStep('selectIndustry')} style={{ width: '100%', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, background: '#0D9488', color: '#fff', border: 'none', cursor: 'pointer', marginBottom: 12 }}>Next: Select Business Type</button>

          <button onClick={() => { setStep('login'); setError(''); }} style={{ width: '100%', padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, background: '#f0f0f0', color: '#666', border: 'none', cursor: 'pointer' }}>Back to Login</button>
        </div>
      </div>
    );
  }

  if (step === 'selectIndustry') {
    return (
      <div style={{ background: 'linear-gradient(135deg, #E6F7F5, #F3F3EE)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Noto Sans', sans-serif" }}>
        <div style={{ maxWidth: 900, width: '100%' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0D9488', marginBottom: 20, textAlign: 'center' }}>Select Your Business Type</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
            {Object.entries(INDUSTRIES).map(([key, ind]) => (
              <div key={key} onClick={() => setSelectedIndustry(key)} style={{ background: selectedIndustry === key ? '#E6F7F5' : '#fff', borderRadius: 16, padding: 20, cursor: 'pointer', border: selectedIndustry === key ? '2px solid #0D9488' : '2px solid #eee', transition: 'all 0.2s', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{ind.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{ind.name}</h3>
                <p style={{ fontSize: 11, color: '#999' }}>{ind.description}</p>
              </div>
            ))}
          </div>

          {error && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '10px 12px', borderRadius: 8, marginBottom: 16, fontSize: 12 }}>⚠️ {error}</div>}

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep('register')} style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, background: '#f0f0f0', color: '#666', border: 'none', cursor: 'pointer' }}>Back</button>
            <button onClick={handleRegister} disabled={loading} style={{ flex: 1, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 700, background: '#0D9488', color: '#fff', border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Creating Account...' : 'Create Account'}</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
