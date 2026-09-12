import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Edit3, Lock, ExternalLink, Sparkles, FileText } from 'lucide-react';

export default function HumanApprovalModal({ approvalRequest, onApprove, onReject, onClose }) {
  if (!approvalRequest) return null;

  const [formData, setFormData] = useState(approvalRequest.prefilledData || {});
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    setSubmitting(true);
    await onApprove(approvalRequest.id, formData);
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '750px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        borderRadius: '20px',
        border: '2px solid rgba(245, 158, 11, 0.5)',
        boxShadow: '0 0 40px rgba(245, 158, 11, 0.2)'
      }}>
        
        {/* Safety Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(239, 68, 68, 0.15) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ShieldAlert size={28} color="#f59e0b" />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24', margin: 0 }}>
              HUMAN-IN-THE-LOOP SAFETY APPROVAL GATE
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#fef08a', margin: '4px 0 0 0' }}>
              Vortex WebCMD agent prepared your application form. Review and edit pre-filled data before final submission.
            </p>
          </div>
        </div>

        {/* Opportunity Summary */}
        <div style={{ marginBottom: '20px', background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TARGET APPLICATION</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{approvalRequest.opportunityTitle}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{approvalRequest.organization}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={12} /> Target URL: {approvalRequest.targetUrl}
          </div>
        </div>

        {/* Pre-filled Data Form Fields */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Pre-filled Form Data ({isEditing ? 'Editing Mode' : 'Read-Only Preview'})
            </h4>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              <Edit3 size={12} /> {isEditing ? 'Done Editing' : 'Edit Fields'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email Address</label>
              <input
                type="email"
                disabled={!isEditing}
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>University & Major</label>
              <input
                type="text"
                disabled={!isEditing}
                value={`${formData.university || ''} (${formData.major || ''})`}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Resume Link</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.resumeLink || ''}
                onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* AI Answers Preview */}
          {formData.answers && (
            <div style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                AI Pre-Generated Short Essay Answers
              </label>
              {Object.entries(formData.answers).map(([q, ans], idx) => (
                <div key={idx} style={{ marginBottom: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-glow)', marginBottom: '4px' }}>Q: {q}</div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={ans}
                      onChange={(e) => {
                        const newAns = { ...formData.answers, [q]: e.target.value };
                        setFormData({ ...formData, answers: newAns });
                      }}
                      style={{
                        width: '100%',
                        padding: '6px',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid var(--border-card)',
                        color: 'var(--text-main)',
                        fontSize: '0.8rem',
                        borderRadius: '6px'
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ans}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-card)', paddingTop: '18px' }}>
          <button
            onClick={onReject}
            disabled={submitting}
            className="btn btn-danger"
          >
            <XCircle size={16} /> Reject & Cancel
          </button>

          <button
            onClick={handleApprove}
            disabled={submitting}
            className="btn btn-success"
            style={{ padding: '10px 24px', fontSize: '0.95rem' }}
          >
            <CheckCircle size={18} /> {submitting ? 'Executing webcmd Submit...' : 'Approve & Submit Application'}
          </button>
        </div>

      </div>
    </div>
  );
}
