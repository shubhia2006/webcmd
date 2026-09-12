import React, { useState } from 'react';
import { Terminal, ShieldCheck, RefreshCw, Play, CheckCircle, AlertTriangle, Info, Code } from 'lucide-react';

export default function AgentConsole({ logs, onRunDoctor, doctorOutput }) {
  const [filter, setFilter] = useState('all');
  const [cliInput, setCliInput] = useState('webcmd devpost list-hackathons --profile student');
  const [executing, setExecuting] = useState(false);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const handleRunCli = (e) => {
    e.preventDefault();
    if (!cliInput) return;
    setExecuting(true);
    setTimeout(() => {
      setExecuting(false);
    }, 800);
  };

  return (
    <div style={{ padding: '24px' }}>
      
      {/* Console Header */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Terminal size={24} color="var(--primary-glow)" />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>WebCMD Browser Agent Console</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Real-time deterministic CLI execution logs & self-healing selector stream
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onRunDoctor}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            >
              <ShieldCheck size={16} color="#34d399" /> Run webcmd doctor
            </button>
          </div>

        </div>
      </div>

      {/* Doctor Output Display */}
      {doctorOutput && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={14} /> WEBCMD DOCTOR DIAGNOSTIC RESULTS
          </div>
          <pre style={{ fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: '#a7f3d0', whiteSpace: 'pre-wrap', margin: 0 }}>
            {doctorOutput}
          </pre>
        </div>
      )}

      {/* Terminal Container */}
      <div className="glass-panel" style={{
        background: '#040711',
        borderRadius: '16px',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        overflow: 'hidden'
      }}>
        
        {/* Terminal Title Bar */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', marginLeft: '8px' }}>
              vortex-agent@webcmd-bridge:~#
            </span>
          </div>

          {/* Log Filters */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'info', 'cmd', 'success', 'warn'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                  border: 'none',
                  color: filter === f ? '#white' : 'var(--text-dim)',
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontWeight: 700
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Log Stream Output */}
        <div style={{
          padding: '16px',
          height: '420px',
          overflowY: 'auto',
          fontFamily: 'var(--font-code)',
          fontSize: '0.82rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {filteredLogs.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '40px' }}>
              No log entries match the selected filter.
            </div>
          ) : (
            filteredLogs.map(log => {
              const color =
                log.type === 'cmd' ? '#38bdf8' :
                log.type === 'success' ? '#34d399' :
                log.type === 'warn' ? '#fbbf24' :
                log.type === 'error' ? '#fca5a5' : '#c7d2fe';

              return (
                <div key={log.id} style={{ display: 'flex', gap: '12px', lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--text-dim)', select: 'none', flexShrink: 0 }}>
                    [{log.timestamp}]
                  </span>
                  <span style={{ color, flexShrink: 0, fontWeight: 600 }}>
                    [{log.type.toUpperCase()}]
                  </span>
                  <span style={{ color: '#f8fafc', wordBreak: 'break-word' }}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* CLI Test Execution Bar */}
        <form onSubmit={handleRunCli} style={{
          background: 'rgba(15, 23, 42, 0.95)',
          padding: '12px 16px',
          borderTop: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ color: 'var(--primary-glow)', fontFamily: 'var(--font-code)', fontWeight: 700 }}>$</span>
          <input
            type="text"
            value={cliInput}
            onChange={(e) => setCliInput(e.target.value)}
            placeholder="Type webcmd CLI command..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontFamily: 'var(--font-code)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <Play size={12} /> {executing ? 'Running...' : 'Execute'}
          </button>
        </form>

      </div>

    </div>
  );
}
