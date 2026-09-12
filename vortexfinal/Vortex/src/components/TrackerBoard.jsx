import React from 'react';
import { CheckSquare, ArrowRight, ExternalLink, Calendar, Award, Trash2 } from 'lucide-react';

export default function TrackerBoard({ trackerList, onUpdateStatus }) {
  const columns = [
    { key: 'Wishlist', title: 'Wishlist / Saved', color: '#818cf8' },
    { key: 'Applied', title: 'Submitted & Applied', color: '#34d399' },
    { key: 'Interviewing', title: 'Interviewing', color: '#38bdf8' },
    { key: 'Offer', title: 'Offer / Accepted', color: '#f472b6' }
  ];

  return (
    <div style={{ padding: '24px' }}>
      
      {/* Board Header */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckSquare size={24} color="var(--success)" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Application Kanban Tracker</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Track application status, interview schedules, and submission confirmation codes
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '20px' }}>
        {columns.map(col => {
          const itemsInCol = trackerList.filter(item => item.status === col.key);

          return (
            <div key={col.key} className="glass-panel" style={{ padding: '16px', borderRadius: '16px', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
              
              {/* Column Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                paddingBottom: '10px',
                borderBottom: `2px solid ${col.color}`
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: col.color }}>{col.title}</span>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {itemsInCol.length}
                </span>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                {itemsInCol.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '30px' }}>
                    No applications in this stage
                  </div>
                ) : (
                  itemsInCol.map(item => (
                    <div key={item.id} style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="badge badge-internship" style={{ fontSize: '0.65rem' }}>{item.category}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Added {item.dateAdded}</span>
                      </div>

                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{item.title}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{item.organization}</div>

                      {item.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
                          {item.notes}
                        </div>
                      )}

                      {/* Status Shift Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Move stage:</span>
                        <select
                          value={item.status}
                          onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                          style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#c7d2fe',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            padding: '3px 6px',
                            outline: 'none'
                          }}
                        >
                          <option value="Wishlist">Wishlist</option>
                          <option value="Applied">Applied</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Offer">Offer/Accepted</option>
                        </select>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
