import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const GlobalAnimationStyles = ({ isDarkMode }) => (
  <style>{`
    @keyframes borderRotate {
      0% { border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}; box-shadow: 0 0 15px rgba(255, 255, 255, 0.02); }
      50% { border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}; box-shadow: 0 0 25px rgba(255, 255, 255, 0.1); }
      100% { border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}; box-shadow: 0 0 15px rgba(255, 255, 255, 0.02); }
    }
    
    html, body {
      margin: 0; padding: 0; width: 100%; overflow-x: hidden;
      background-color: ${isDarkMode ? '#020305' : '#f8fafc'};
      transition: background-color 0.4s ease;
    }

    .nav-item {
      color: ${isDarkMode ? '#9ca3af' : '#64748b'}; text-decoration: none; font-weight: 600; font-size: 14px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; padding: 8px 14px;
      border-radius: 8px; background: transparent; white-space: nowrap;
    }
    .nav-item:hover { 
      color: ${isDarkMode ? '#ffffff' : '#0f172a'}; 
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'}; 
    }
    
    .nav-item.active-route {
      color: ${isDarkMode ? '#ffffff' : '#0f172a'}; 
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'};
      border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'};
      text-shadow: ${isDarkMode ? '0 0 10px rgba(255, 255, 255, 0.2)' : 'none'};
    }

    .master-glass-hull {
      width: 100%; max-width: 680px; 
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.7)'};
      backdrop-filter: blur(35px) saturate(200%); -webkit-backdrop-filter: blur(35px) saturate(200%);
      border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'};
      box-shadow: ${isDarkMode ? '0 40px 100px rgba(0, 0, 0, 0.8)' : '0 40px 100px rgba(15, 23, 42, 0.08)'};
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 40px; border-radius: 24px; box-sizing: border-box;
      margin: 0 auto;
    }

    .vertical-stack {
      display: flex; flex-direction: column; gap: 24px; width: 100%;
    }

    .drop-zone-node { 
      border: 1px dashed ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}; 
      background: ${isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)'}; 
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); position: relative;
      display: flex !important; flex-direction: column !important; 
      align-items: center !important; justify-content: center !important;
      text-align: center !important; height: 150px !important; box-sizing: border-box;
      border-radius: 16px;
    }
    .drop-zone-node:hover { 
      border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}; 
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)'}; 
    }
    .drop-zone-node.active-drag { 
      animation: borderRotate 1.2s infinite ease-in-out; 
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)'} !important; 
    }

    .file-pill-row {
      display: flex; align-items: center; justify-content: space-between;
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'}; 
      border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)'};
      padding: 12px 16px; border-radius: 12px; transition: all 0.2s ease;
      margin-bottom: 8px;
    }
    .file-pill-row:hover {
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)'}; 
      border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
    }
    .file-delete-btn {
      background: transparent; border: none; color: rgba(239, 68, 68, 0.6);
      cursor: pointer; font-size: 14px; padding: 4px 8px; border-radius: 6px;
      transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;
    }
    .file-delete-btn:hover {
      color: rgba(239, 68, 68, 1); background: rgba(239, 68, 68, 0.1);
    }

    .cyber-input {
      width: 100%; padding: 14px 16px; box-sizing: border-box; 
      background: ${isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)'};
      border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}; 
      border-radius: 12px; color: ${isDarkMode ? '#fff' : '#0f172a'};
      font-size: 14px; outline: none; transition: all 0.3s ease;
    }
    .cyber-input:focus { 
      border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)'}; 
      background: ${isDarkMode ? 'rgba(0, 0, 0, 0.6)' : '#fff'}; 
      box-shadow: 0 0 15px rgba(0,0,0,0.02); 
    }

    .neon-trigger-btn {
      background: ${isDarkMode ? 'linear-gradient(135deg, #14171c 0%, #090a0d 100%)' : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}; 
      color: #ffffff;
      border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)'}; 
      padding: 16px; border-radius: 12px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      font-size: 14px; letter-spacing: 0.5px; width: 100%;
      text-align: center; text-decoration: none; display: block; box-sizing: border-box;
    }
    .neon-trigger-btn:hover:not(:disabled) { 
      transform: translateY(-1px);
      background: ${isDarkMode ? 'linear-gradient(135deg, #1c2027 0%, #111419 100%)' : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'};
      border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.15)'};
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4); 
    }

    .light-btn-node {
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.05)'}; 
      color: ${isDarkMode ? '#070b12' : '#0f172a'}; 
      border: ${isDarkMode ? 'none' : '1px solid rgba(0,0,0,0.05)'}; 
      padding: 16px; border-radius: 12px;
      font-weight: 700; cursor: pointer; transition: all 0.3s ease; font-size: 14px; width: 100%;
      text-align: center; text-decoration: none; display: block; box-sizing: border-box;
    }
    .light-btn-node:hover:not(:disabled) { 
      background: ${isDarkMode ? '#ffffff' : 'rgba(15, 23, 42, 0.08)'}; 
      transform: translateY(-1px); 
    }

    .modal-backdrop-blur {
      position: fixed; inset: 0; background: ${isDarkMode ? 'rgba(2, 3, 5, 0.9)' : 'rgba(255, 255, 255, 0.8)'};
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; box-sizing: border-box;
    }
    .modal-frame-card {
      background: ${isDarkMode ? 'rgba(7, 9, 13, 0.98)' : '#ffffff'}; 
      width: 100%; max-width: 440px;
      border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}; 
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
      border-radius: 20px; padding: 32px; box-sizing: border-box;
    }

    .faq-item {
      border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)'}; 
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)'};
      border-radius: 14px; padding: 18px; cursor: pointer; transition: all 0.25s ease;
    }
    .faq-item:hover {
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'}; 
      border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.08)'};
    }

    .step-badge {
      display: inline-flex; align-items: center; justify-content: center;
      width: 24px; height: 24px; border-radius: 50%; 
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'};
      color: ${isDarkMode ? '#fff' : '#0f172a'}; font-size: 11px; font-weight: 700; margin-bottom: 12px;
    }

    .theme-toggle-btn {
      background: transparent; border: none; font-size: 18px; cursor: pointer;
      padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
      margin-left: 8px;
    }
    .theme-toggle-btn:hover {
      background: ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
    }

    .metric-card {
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.9)'};
      border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'};
      padding: 24px; border-radius: 20px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex; flex-direction: column; justify-content: space-between; position: relative;
    }
    .metric-card:hover {
      transform: translateY(-2px);
      border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)'};
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#ffffff'};
    }
    .db-table-row {
      border-bottom: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)'};
      transition: background 0.2s ease;
    }
    .db-table-row:hover {
      background: ${isDarkMode ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.01)'};
    }

    @media (max-width: 992px) {
      .stats-grid-db { grid-template-columns: repeat(2, 1fr) !important; }
    }

    @media (max-width: 768px) {
      .nav-container { flex-direction: column !important; gap: 14px !important; text-align: center !important; }
      .nav-links-box { width: 100% !important; justify-content: center !important; flex-wrap: wrap !important; }
      .app-viewport { padding-top: 190px !important; padding-left: 16px !important; padding-right: 16px !important; }
      .master-glass-hull { padding: 28px 20px; }
      .stats-grid { grid-template-columns: 1fr !important; }
      .stats-grid-db { grid-template-columns: 1fr !important; }
      .db-responsive-table { overflow-x: auto !important; }
    }
  `}</style>
);

const playDropSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
    oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
    oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.12);
  } catch (e) { }
};

function Navbar({ isDarkMode, setIsDarkMode }) {
  const location = useLocation();
  return (
    <nav style={{ 
      width: '100%', 
      backgroundColor: isDarkMode ? 'rgba(4, 5, 8, 0.85)' : 'rgba(255, 255, 255, 0.85)', 
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      padding: '16px 0', 
      borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.05)'}`, 
      position: 'fixed', top: 0, left: 0, zIndex: 100,
      transition: 'background-color 0.4s ease, border-bottom 0.4s ease'
    }}>
      <div className="nav-container" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', boxSizing: 'border-box' }}>
        <Link to="/" style={{ fontSize: '20px', fontWeight: '900', color: isDarkMode ? '#ffffff' : '#0f172a', letterSpacing: '0.5px', textDecoration: 'none' }}>
          <span>📦 Ziply File Share</span>
        </Link>
        <div className="nav-links-box" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active-route' : ''}`}>Home</Link>
          <Link to="/send" className={`nav-item ${location.pathname === '/send' ? 'active-route' : ''}`}>Send Files</Link>
          <Link to="/receive" className={`nav-item ${location.pathname === '/receive' ? 'active-route' : ''}`}>Receive File</Link>
          <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active-route' : ''}`}>Dashboard</Link>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="theme-toggle-btn" 
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}

function HomePage({ isDarkMode }) {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { 
      q: "How does the ZIP Archiving feature work?", 
      a: "When you upload multiple files or folders, Ziply automatically bundles them into a single, high-compression `.zip` archive on the fly for fast and effortless one-click downloads." 
    },
    { 
      q: "Is registration or personal information required?", 
      a: "No registration, email, or login required. You can instantly drag, upload, and generate secure download codes right away with total anonymity." 
    },
    { 
      q: "How long do shared files remain active?", 
      a: "You have complete control. Choose between 5m, 15m, 1h, 1d, or set '1 Download Max' (Instant) so files self-destruct and vaporize immediately after being fetched." 
    },
    { 
      q: "How can I track my active uploads?", 
      a: "Head over to the Dashboard tab to see real-time live metrics including active file shares, bandwidth volume, live download hits, and sync latency." 
    }
  ];

  return (
    <div className="master-glass-hull" style={{ maxWidth: '780px' }}>
      <div style={{ textAlign: 'center', marginBottom: '44px' }}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', 
          background: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', 
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`, 
          padding: '6px 14px', borderRadius: '30px', 
          color: isDarkMode ? '#d1d5db' : '#475569', fontSize: '12px', fontWeight: '600', letterSpacing: '0.3px', marginBottom: '20px' 
        }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399', boxShadow: '0 0 8px #34d399' }}></span>
          Encrypted Relay Network Active
        </div>
        <h1 style={{ fontSize: '40px', color: isDarkMode ? '#fff' : '#0f172a', fontWeight: '950', margin: '0 0 14px 0', letterSpacing: '-1.5px', lineHeight: '1.15' }}>
          Share Files Privately.<br/>Automated ZIPs & Self-Destruct.
        </h1>
        <p style={{ color: isDarkMode ? '#9ca3af' : '#475569', fontSize: '15px', lineHeight: '1.6', margin: '0 auto', maxWidth: '600px' }}>
          Upload multiple files bundled into compressed ZIP archives, shield them with passwords, set dynamic expiry timers, and monitor live telemetry in real-time.
        </p>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '44px', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0) 100%)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`, padding: '16px', borderRadius: '16px' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', color: isDarkMode ? '#ffffff' : '#0f172a', fontFamily: 'monospace' }}>ZIP</div>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', marginTop: '4px', letterSpacing: '0.3px' }}>AUTO ARCHIVING</div>
        </div>
        <div style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0) 100%)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`, padding: '16px', borderRadius: '16px' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', color: isDarkMode ? '#ffffff' : '#0f172a', fontFamily: 'monospace' }}>REAL-TIME</div>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', marginTop: '4px', letterSpacing: '0.3px' }}>LIVE ANALYTICS</div>
        </div>
        <div style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0) 100%)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}`, padding: '16px', borderRadius: '16px' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', color: isDarkMode ? '#ffffff' : '#0f172a', fontFamily: 'monospace' }}>1-CLICK</div>
          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', marginTop: '4px', letterSpacing: '0.3px' }}>SELF DESTRUCT</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px', marginBottom: '48px' }}>
        <Link to="/send" className="light-btn-node" style={{ flex: 1.2 }}>🚀 Send Files Now</Link>
        <Link to="/receive" className="neon-trigger-btn" style={{ flex: 1 }}>🔑 Enter Share Code</Link>
      </div>

      <div style={{ marginBottom: '48px' }}>
        <h3 style={{ fontSize: '16px', color: isDarkMode ? '#fff' : '#0f172a', fontWeight: '800', marginBottom: '20px', letterSpacing: '-0.3px' }}>How Ziply Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.005)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}`, padding: '20px', borderRadius: '16px' }}>
            <div className="step-badge">1</div>
            <h4 style={{ margin: '0 0 6px 0', color: isDarkMode ? '#fff' : '#0f172a', fontSize: '14px', fontWeight: '700' }}>Upload & Bundle</h4>
            <p style={{ margin: 0, color: isDarkMode ? '#9ca3af' : '#475569', fontSize: '12px', lineHeight: '1.5' }}>Drop single or multiple files. Ziply automatically archives them into compressed `.zip` packages.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.005)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}`, padding: '20px', borderRadius: '16px' }}>
            <div className="step-badge">2</div>
            <h4 style={{ margin: '0 0 6px 0', color: isDarkMode ? '#fff' : '#0f172a', fontSize: '14px', fontWeight: '700' }}>Lock & Expiry</h4>
            <p style={{ margin: 0, color: isDarkMode ? '#9ca3af' : '#475569', fontSize: '12px', lineHeight: '1.5' }}>Set custom expiration timers or 1-download self-destruct limits with optional password locks.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.005)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}`, padding: '20px', borderRadius: '16px' }}>
            <div className="step-badge">3</div>
            <h4 style={{ margin: '0 0 6px 0', color: isDarkMode ? '#fff' : '#0f172a', fontSize: '14px', fontWeight: '700' }}>Share & Track</h4>
            <p style={{ margin: 0, color: isDarkMode ? '#9ca3af' : '#475569', fontSize: '12px', lineHeight: '1.5' }}>Share the unique 6-digit code or QR image, and monitor real-time download hits in the Dashboard.</p>
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'}`, paddingTop: '40px' }}>
        <h3 style={{ fontSize: '18px', color: isDarkMode ? '#fff' : '#0f172a', fontWeight: '800', marginBottom: '20px', letterSpacing: '-0.3px' }}>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-item" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: isDarkMode ? '#fff' : '#0f172a', fontSize: '14px', fontWeight: '600' }}>{faq.q}</span>
                <span style={{ color: '#6b7280', fontSize: '11px' }}>{openFaq === idx ? '▲' : '▼'}</span>
              </div>
              {openFaq === idx && (
                <p style={{ margin: '14px 0 0 0', color: isDarkMode ? '#9ca3af' : '#475569', fontSize: '13px', lineHeight: '1.5' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SendPage({ isDarkMode }) {
  const [files, setFiles] = useState([]);
  const [password, setPassword] = useState('');
  const [expiryType, setExpiryType] = useState('15m');
  const [shareCode, setShareCode] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [copied, setCopied] = useState(false);
  const [dragOverActive, setDragOverActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelection = (selectedFiles) => {
    playDropSound();
    setFiles(Array.from(selectedFiles));
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true); setUploadProgress(0); setShareCode('');

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (password) formData.append('password', password);
    formData.append('expiryType', expiryType);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        if (data.success) {
          setShareCode(data.code); setFiles([]); setPassword(''); setExpiryType('15m');
        }
      }
      setUploading(false);
    });

    xhr.open('POST', 'http://localhost:5000/api/upload');
    xhr.send(formData);
  };

  if (shareCode) {
    return (
      <div className="master-glass-hull">
        <div style={{ 
          padding: '24px', 
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0,0,0,0.02)', 
          borderRadius: '16px', 
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)'}`, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '20px' 
        }}>
          <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '800', letterSpacing: '1px' }}>FILE UPLOADED SUCCESSFULLY</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '900', fontFamily: 'monospace', color: isDarkMode ? '#fff' : '#0f172a', letterSpacing: '2px' }}>{shareCode}</div>
            <button 
              onClick={() => { navigator.clipboard.writeText(shareCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
              style={{ padding: '8px 16px', borderRadius: '8px', color: '#fff', cursor: 'pointer', background: copied ? '#059669' : '#0f172a', border: 'none', fontSize: '13px', fontWeight: '600' }}
            >
              {copied ? '📋 Copied' : '📄 Copy Code'}
            </button>
          </div>

          <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '12px', display: 'inline-block', border: '1px solid rgba(0,0,0,0.05)' }}>
            <QRCodeSVG value={shareCode} size={140} />
          </div>

          <button onClick={() => setShareCode('')} className="light-btn-node" style={{ marginTop: '10px', padding: '12px' }}>
            🔄 Share More Files
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="master-glass-hull">
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '26px', margin: '0 0 6px 0', color: isDarkMode ? '#fff' : '#0f172a', fontWeight: '800', letterSpacing: '-0.5px' }}>Send Files</h2>
        <p style={{ color: isDarkMode ? '#9ca3af' : '#475569', fontSize: '13px' }}>Share your files securely with time-limited download links via Ziply File Share.</p>
      </div>
      
      <form onSubmit={handleUpload}>
        <div className="vertical-stack">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <div 
              className={`drop-zone-node ${dragOverActive ? 'active-drag' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOverActive(true); }}
              onDragLeave={() => setDragOverActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragOverActive(false); if(e.dataTransfer.files.length) handleFileSelection(e.dataTransfer.files); }}
              style={{ width: '100%' }}
            >
              <input type="file" onChange={(e) => e.target.files.length && handleFileSelection(e.target.files)} multiple style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />
              <div style={{ color: files.length > 0 ? (isDarkMode ? '#ffffff' : '#0f172a') : '#9ca3af', fontWeight: '600', fontSize: '15px', padding: '16px', pointerEvents: 'none', zIndex: 2 }}>
                📁 Drag & Drop or Click to Upload Files
              </div>
            </div>

            {files.length > 0 && (
              <div style={{ maxHeight: '150px', overflowY: 'auto', paddingRight: '4px', marginTop: '4px' }}>
                {files.map((file, idx) => (
                  <div key={idx} className="file-pill-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '16px' }}>📄</span>
                      <span style={{ color: isDarkMode ? '#e5e7eb' : '#334155', fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ color: isDarkMode ? '#ffffff' : '#0f172a', fontSize: '12px', fontWeight: '600', fontFamily: 'monospace' }}>
                        {formatSize(file.size)}
                      </span>
                      <button type="button" className="file-delete-btn" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#475569', marginBottom: '8px', fontWeight: '600' }}>⏳ File Expiry Time</label>
              <div onClick={() => setShowDropdown(!showDropdown)} style={{ width: '100%', padding: '14px', boxSizing: 'border-box', background: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : '#fff', border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`, borderRadius: '12px', color: isDarkMode ? '#fff' : '#0f172a', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '500' }}>
                  {expiryType === '5m' && '5 Minutes'}
                  {expiryType === '15m' && '15 Minutes (Default)'}
                  {expiryType === '1h' && '1 Hour'}
                  {expiryType === '1d' && '1 Day'}
                  {expiryType === 'instant' && '💥 Delete immediately after download'}
                </span>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {showDropdown ? '▲' : '▼'}
                </span>
              </div>
              {showDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '6px', background: isDarkMode ? 'rgba(7, 9, 13, 0.98)' : '#ffffff', border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`, borderRadius: '12px', zIndex: 50, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                  {[
                    { value: '5m', label: '5 Minutes' },
                    { value: '15m', label: '15 Minutes (Default)' },
                    { value: '1h', label: '1 Hour' },
                    { value: '1d', label: '1 Day' },
                    { value: 'instant', label: '💥 Delete immediately after download' }
                  ].map((opt) => (
                    <div key={opt.value} onClick={() => { setExpiryType(opt.value); setShowDropdown(false); }} style={{ padding: '12px 16px', color: isDarkMode ? '#ffffff' : '#0f172a', background: expiryType === opt.value ? (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)') : 'transparent', cursor: 'pointer', fontSize: '13px' }}>
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#475569', marginBottom: '8px', fontWeight: '600' }}>🔒 Add Password (Optional)</label>
              <input type="password" placeholder="Leave empty if you don't want a password" value={password} onChange={(e) => setPassword(e.target.value)} className="cyber-input" />
            </div>
            
            <button type="submit" disabled={uploading || files.length === 0} className="neon-trigger-btn" style={{ marginTop: '8px' }}>
              {uploading ? 'Uploading Files...' : 'Generate Download Link'}
            </button>
          </div>
        </div>
      </form>

      {uploading && (
        <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.01)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: isDarkMode ? '#d1d5db' : '#475569', fontSize: '12px', marginBottom: '6px' }}>
            <span>Uploading to server...</span>
            <span style={{ color: isDarkMode ? '#ffffff' : '#0f172a', fontWeight: '700' }}>{uploadProgress}%</span>
          </div>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: isDarkMode ? '#ffffff' : '#0f172a', transition: 'width 0.2s ease' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ⚡ RECEIVE PAGE WITH NATIVE FORM STREAM FIX INTEGRATED
function ReceivePage({ isDarkMode }) {
  const [inputCode, setInputCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [downloadPassword, setDownloadPassword] = useState('');

  const initDownloadProcess = async (e) => {
    e.preventDefault(); setErrorMessage('');
    const code = inputCode.trim().toUpperCase();
    if (code.length !== 6) return setErrorMessage('Invalid code length.');

    try {
      const checkRes = await fetch(`http://localhost:5000/api/check-status/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: null })
      });
      if (!checkRes.ok) return setErrorMessage('File not found or expired.');
      const statusData = await checkRes.json();
      if (statusData.isProtected) { 
        setShowPasswordModal(true); 
      } else { 
        executePayloadDownload(code, null); 
      }
    } catch { setErrorMessage('Network error.'); }
  };

  // 🚀 SUPERFAST INSTANT STREAM FIX
  const executePayloadDownload = (code, passKey) => {
    try {
      // Direct Native Form Submit - RAM loading zero kar deta hai!
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `http://localhost:5000/api/download/${code}`;
      form.style.display = 'none';

      if (passKey) {
        const pwdInput = document.createElement('input');
        pwdInput.type = 'hidden';
        pwdInput.name = 'password';
        pwdInput.value = passKey;
        form.appendChild(pwdInput);
      }

      document.body.appendChild(form);
      form.submit();

      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
      }, 1000);

      setInputCode('');
      setShowPasswordModal(false);
      setDownloadPassword('');
    } catch (e) {
      setErrorMessage('Download failed.');
    }
  };

  return (
    <div className="master-glass-hull" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', margin: '0 0 6px 0', color: isDarkMode ? '#fff' : '#0f172a', fontWeight: '800', textAlign: 'center' }}>Receive File</h2>
      <p style={{ color: isDarkMode ? '#9ca3af' : '#475569', fontSize: '13px', marginBottom: '24px', textAlign: 'center' }}>Enter the 6-digit code to download your files.</p>
      
      <form onSubmit={initDownloadProcess}>
        <input type="text" maxLength="6" value={inputCode} onChange={(e) => setInputCode(e.target.value)} placeholder="• • • • • •" style={{ width: '100%', padding: '14px', backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : '#fff', border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)'}`, borderRadius: '12px', color: isDarkMode ? '#ffffff' : '#0f172a', fontSize: '24px', textAlign: 'center', fontFamily: 'monospace', letterSpacing: '6px', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }} required />
        <button type="submit" className="light-btn-node">Find File</button>
      </form>

      {errorMessage && <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#fca5a5', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '12px' }}>⚠ {errorMessage}</div>}

      {showPasswordModal && (
        <div className="modal-backdrop-blur">
          <div className="modal-frame-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '20px' }}>🔒</span>
              <h3 style={{ margin: 0, color: isDarkMode ? '#fff' : '#0f172a', fontWeight: '800', fontSize: '18px', letterSpacing: '-0.3px' }}>Password Required</h3>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <input 
                type="password" 
                placeholder="Enter Password" 
                value={downloadPassword} 
                onChange={(e) => setDownloadPassword(e.target.value)} 
                className="cyber-input" 
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button onClick={() => setShowPasswordModal(false)} className="light-btn-node" style={{ padding: '12px' }}>
                Cancel
              </button>
              <button onClick={() => executePayloadDownload(inputCode, downloadPassword)} className="neon-trigger-btn" style={{ flex: 1.4, marginTop: 0 }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardPage({ isDarkMode }) {
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState({
    activeShares: 0,
    downloadHits: 0,
    storageRegistry: '0 KB',
    syncLatency: '0.1ms'
  });

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/telemetry');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.registry || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (e) {
      console.error("Telemetry sync failed");
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteTransaction = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/telemetry/${id}`, { method: 'DELETE' });
      fetchTelemetry();
    } catch (e) { }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1060px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Metrics Row */}
      <div className="stats-grid-db" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: isDarkMode ? '#9ca3af' : '#64748b', letterSpacing: '0.8px' }}>ACTIVE SHARES</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: isDarkMode ? 'rgba(52, 211, 153, 0.1)' : 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '14px' }}>🛡️</span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: '900', color: isDarkMode ? '#fff' : '#0f172a', fontFamily: 'monospace' }}>{metrics.activeShares}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', fontWeight: '600' }}>TOTAL SHARED PACKAGES</div>
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: isDarkMode ? '#9ca3af' : '#64748b', letterSpacing: '0.8px' }}>DOWNLOAD HITS</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: isDarkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(96, 165, 250, 0.15)', color: '#60a5fa', fontSize: '14px' }}>📥</span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: '900', color: isDarkMode ? '#fff' : '#0f172a', fontFamily: 'monospace' }}>{metrics.downloadHits}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', fontWeight: '600' }}>TOTAL COMPLETED DOWNLOADS</div>
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: isDarkMode ? '#9ca3af' : '#64748b', letterSpacing: '0.8px' }}>STORAGE VOLUME</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: isDarkMode ? 'rgba(192, 132, 252, 0.1)' : 'rgba(192, 132, 252, 0.15)', color: '#c084fc', fontSize: '14px' }}>🗄️</span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '26px', fontWeight: '900', color: isDarkMode ? '#fff' : '#0f172a', fontFamily: 'monospace', padding: '4px 0' }}>{metrics.storageRegistry}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', fontWeight: '600' }}>TOTAL BANDWIDTH TRANSFERRED</div>
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: isDarkMode ? '#9ca3af' : '#64748b', letterSpacing: '0.8px' }}>NETWORK LATENCY</span>
            <span style={{ padding: '6px', borderRadius: '8px', background: isDarkMode ? 'rgba(244, 63, 94, 0.1)' : 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', fontSize: '14px' }}>⚙️</span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '32px', fontWeight: '900', color: isDarkMode ? '#fff' : '#0f172a', fontFamily: 'monospace' }}>{metrics.syncLatency}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', fontWeight: '600' }}>ACTIVE RELAY LATENCY</div>
          </div>
        </div>

      </div>

      {/* Main Transactions Log */}
      <div style={{ 
        width: '100%', 
        background: isDarkMode ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(30px)', border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'}`,
        borderRadius: '24px', padding: '32px', boxSizing: 'border-box',
        boxShadow: isDarkMode ? '0 30px 70px rgba(0,0,0,0.5)' : '0 30px 70px rgba(15,23,42,0.04)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: isDarkMode ? '#fff' : '#0f172a' }}>Active Relays</h3>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }}></span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>Real-time overview of active transfers and access logs</p>
          </div>
          <button onClick={fetchTelemetry} className="light-btn-node" style={{ width: 'auto', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🔄 Refresh Status
          </button>
        </div>

        <div className="db-responsive-table" style={{ width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'}` }}>
                <th style={{ padding: '12px 8px', fontSize: '10px', color: '#6b7280', fontWeight: '700', letterSpacing: '0.5px' }}>PACKAGE NAME</th>
                <th style={{ padding: '12px 8px', fontSize: '10px', color: '#6b7280', fontWeight: '700', letterSpacing: '0.5px' }}>SHARE CODE</th>
                <th style={{ padding: '12px 8px', fontSize: '10px', color: '#6b7280', fontWeight: '700', letterSpacing: '0.5px' }}>FILE SIZE</th>
                <th style={{ padding: '12px 8px', fontSize: '10px', color: '#6b7280', fontWeight: '700', letterSpacing: '0.5px' }}>DOWNLOADS</th>
                <th style={{ padding: '12px 8px', fontSize: '10px', color: '#6b7280', fontWeight: '700', letterSpacing: '0.5px' }}>EXPIRY TIME</th>
                <th style={{ padding: '12px 8px', fontSize: '10px', color: '#6b7280', fontWeight: '700', letterSpacing: '0.5px' }}>STATUS</th>
                <th style={{ padding: '12px 8px', fontSize: '10px', color: '#6b7280', fontWeight: '700', letterSpacing: '0.5px', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>No active file transfers found. Use the "Send Files" tab to create one.</td>
                </tr>
              ) : (
                transactions.map((trans) => (
                  <tr key={trans.id} className="db-table-row">
                    <td style={{ padding: '16px 8px', fontSize: '13px', color: isDarkMode ? '#fff' : '#0f172a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📁</span> {trans.name}
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: '13px', color: '#60a5fa', fontWeight: '700', fontFamily: 'monospace' }}>{trans.code}</td>
                    <td style={{ padding: '16px 8px', fontSize: '13px', color: isDarkMode ? '#d1d5db' : '#475569', fontFamily: 'monospace' }}>{trans.volume}</td>
                    <td style={{ padding: '16px 8px', fontSize: '13px', color: isDarkMode ? '#d1d5db' : '#475569', fontFamily: 'monospace' }}>{trans.hits}</td>
                    <td style={{ padding: '16px 8px', fontSize: '13px', color: isDarkMode ? '#9ca3af' : '#475569' }}>
                      <span style={{ marginRight: '4px' }}>⏱️</span> {trans.timeLimit}
                    </td>
                    <td style={{ padding: '16px 8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '12px', background: trans.state === 'ACTIVE' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: trans.state === 'ACTIVE' ? '#34d399' : '#ef4444', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: trans.state === 'ACTIVE' ? '#34d399' : '#ef4444' }}></span> {trans.state}
                      </span>
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                      <button onClick={() => handleDeleteTransaction(trans.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ef4444'} onMouseLeave={(e)=>e.target.style.color='rgba(239, 68, 68, 0.7)'}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  return (
    <Router>
      <GlobalAnimationStyles isDarkMode={isDarkMode} />
      <div className="app-viewport" style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif', 
        color: isDarkMode ? '#f3f4f6' : '#1e293b', 
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        padding: '120px 24px 40px 24px', boxSizing: 'border-box', position: 'relative', width: '100%', overflowX: 'hidden',
        background: isDarkMode 
          ? 'radial-gradient(circle at 50% 0%, #0c0e12 0%, #020305 100%)' 
          : 'radial-gradient(circle at 50% 0%, #f1f5f9 0%, #e2e8f0 100%)',
        transition: 'background 0.4s ease'
      }}>
        <div style={{ position: 'absolute', width: '100%', height: '500px', borderRadius: '50%', background: isDarkMode ? 'radial-gradient(circle, rgba(255, 255, 255, 0.01) 0%, rgba(0,0,0,0) 80%)' : 'radial-gradient(circle, rgba(15, 23, 42, 0.02) 0%, rgba(0,0,0,0) 80%)', top: '-10%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <div style={{ zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Routes>
            <Route path="/" element={<HomePage isDarkMode={isDarkMode} />} />
            <Route path="/send" element={<SendPage isDarkMode={isDarkMode} />} />
            <Route path="/receive" element={<ReceivePage isDarkMode={isDarkMode} />} />
            <Route path="/dashboard" element={<DashboardPage isDarkMode={isDarkMode} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;