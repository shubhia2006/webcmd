import React, { useState } from 'react';
import { Monitor, RefreshCw, Camera, Layers, ShieldCheck, ExternalLink, Globe } from 'lucide-react';

export default function BrowserCanvas({ onCaptureSnapshot }) {
  const [activeTab, setActiveTab] = useState('devpost');
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'devpost', title: 'Devpost Hackathons', url: 'https://devpost.com/hackathons', status: 'ACTIVE' },
    { id: 'unstop', title: 'Unstop Opportunity Hub', url: 'https://unstop.com/hackathons', status: 'SYNCHRONIZED' },
    { id: 'nsf', title: 'NSF REU Research Portal', url: 'https://www.nsf.gov/crssprgm/reu', status: 'READY' },
    { id: 'github', title: 'Simplify Early Careers', url: 'https://github.com/pittcsc/Summer2027-Internships', status: 'READY' }
  ];

  const handleRefreshSnapshot = async () => {
    setLoading(true);
    const data = await onCaptureSnapshot('sess_default');
    setSnapshot(data);
    setLoading(false);
  };

  const currentTabData = tabs.find(t => t.id === activeTab);

  return (
    <div style={{ padding: '24px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Monitor size={24} color="var(--secondary)" />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>WebCMD Live Browser Canvas</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Visual browser viewport inspector, DOM tree walker, and session binder
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshSnapshot}
            disabled={loading}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem' }}
          >
            <Camera size={14} /> {loading ? 'Capturing DOM...' : 'Take DOM Snapshot'}
          </button>
        </div>
      </div>

      {/* Browser Frame Simulation */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-glow)' }}>
        
        {/* Tab Bar */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderBottom: '1px solid var(--border-card)',
          overflowX: 'auto'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: activeTab === tab.id ? '1px solid var(--primary-glow)' : '1px solid transparent',
                color: activeTab === tab.id ? '#white' : 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Globe size={12} />
              <span>{tab.title}</span>
            </button>
          ))}
        </div>

        {/* Address Bar */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid var(--border-card)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-code)' }}>URL:</span>
          <input
            type="text"
            readOnly
            value={currentTabData?.url || ''}
            style={{
              flex: 1,
              background: 'rgba(5, 8, 15, 0.7)',
              border: '1px solid var(--border-card)',
              color: 'var(--secondary)',
              fontFamily: 'var(--font-code)',
              fontSize: '0.8rem',
              padding: '4px 10px',
              borderRadius: '6px'
            }}
          />
          <a
            href={currentTabData?.url}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Viewport & Inspection Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', minHeight: '400px' }}>
          
          {/* Simulated Web Viewport */}
          <div style={{
            background: '#090d16',
            padding: '24px',
            borderRight: '1px solid var(--border-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: 'var(--primary-glow)'
              }}>
                <Monitor size={32} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{currentTabData?.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                WebCMD self-healing DOM parser active. Interacting with site via deterministic CLI adapters.
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                <ShieldCheck size={14} /> WEBCMD SESSION BOUND
              </div>
            </div>
          </div>

          {/* DOM Inspection Panel */}
          <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} /> ACCESSIBILITY & DOM TREE
            </div>

            <pre style={{
              fontFamily: 'var(--font-code)',
              fontSize: '0.75rem',
              color: '#93c5fd',
              background: '#040711',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-card)',
              height: '320px',
              overflowY: 'auto'
            }}>
{snapshot ? JSON.stringify(snapshot, null, 2) : `[DOM Inspection Ready]
Click "Take DOM Snapshot" to view real-time accessibility tree and webcmd element mappings.

Target: ${currentTabData?.title}
Bridge Status: OK`}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
}
