import React from 'react';
import { Compass, CheckSquare, Terminal, Monitor, User, ShieldCheck, Zap } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, profile, doctorStatus, onOpenProfile }) {
  return (
    <header className="glass-panel" style={{ margin: '16px 24px 0 24px', padding: '14px 24px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
          }}>
            <Zap size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                VORTEX
              </span>
              <span className="badge badge-internship pulse-badge" style={{ fontSize: '0.65rem' }}>
                WEBCMD AGENT
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              AI Browser Infrastructure for Student Life
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
          <button
            onClick={() => setActiveTab('radar')}
            className={`btn ${activeTab === 'radar' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Compass size={16} /> Radar
          </button>
          
          <button
            onClick={() => setActiveTab('tracker')}
            className={`btn ${activeTab === 'tracker' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <CheckSquare size={16} /> Application Tracker
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`btn ${activeTab === 'console' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Terminal size={16} /> Agent Console
          </button>

          <button
            onClick={() => setActiveTab('canvas')}
            className={`btn ${activeTab === 'canvas' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Monitor size={16} /> Browser Canvas
          </button>
        </nav>

        {/* Right Info / Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* webcmd status badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '6px 12px',
            borderRadius: '999px',
            fontSize: '0.75rem',
            color: '#34d399'
          }}>
            <ShieldCheck size={14} />
            <span>webcmd: <strong>HEALTHY</strong></span>
          </div>

          {/* Student Profile Button */}
          <button
            onClick={onOpenProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-card)',
              padding: '6px 12px',
              borderRadius: '12px',
              cursor: 'pointer',
              color: 'var(--text-main)'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              {profile.name ? profile.name[0] : 'A'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{profile.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GPA {profile.gpa} • {profile.major}</div>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
}
