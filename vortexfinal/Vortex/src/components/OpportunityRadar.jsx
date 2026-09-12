import React, { useState } from 'react';
import { Search, Sparkles, Award, MapPin, Calendar, CheckCircle, ShieldAlert, FileText, AlertCircle, XCircle, RefreshCw, ExternalLink, Loader, Globe } from 'lucide-react';

export default function OpportunityRadar({
  opportunities,
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  onPrepareApply,
  onGenerateContent,
  onSaveToTracker,
  isLoading,
  onRefresh
}) {
  const categories = ['All', 'Hackathon', 'Internship', 'Research', 'Scholarship'];
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      
      {/* Top Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Category Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`badge ${categoryFilter === cat ? 'badge-internship' : 'btn-secondary'}`}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  border: categoryFilter === cat ? '1px solid var(--primary-glow)' : '1px solid var(--border-card)',
                  background: categoryFilter === cat ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.04)',
                  color: categoryFilter === cat ? '#c7d2fe' : 'var(--text-muted)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search + Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '300px', flex: 1, maxWidth: '520px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filter by tech stack, company, hackathon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className="btn btn-secondary"
              style={{
                padding: '10px 16px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                opacity: (refreshing || isLoading) ? 0.6 : 1
              }}
            >
              <RefreshCw size={16} style={{ animation: (refreshing || isLoading) ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Scraping...' : 'Refresh Live'}
            </button>
          </div>

        </div>
      </div>

      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>MATCHED OPPORTUNITIES</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{opportunities.length} Found</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>HIGHEST AI FIT</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>
            {opportunities.length > 0 ? `${opportunities[0].matchScore}% FIT` : 'N/A'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>DATA SOURCE</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={18} /> Live Web Scrape
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>AUTOFILL SAFETY</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={18} /> Human Gate
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="glass-panel" style={{ padding: '80px 20px', textAlign: 'center', borderRadius: '20px', maxWidth: '600px', margin: '40px auto' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(90deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🔍 Scraping Live Web Results...
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Playwright is searching <strong>Google, Unstop, Devpost & Internshala</strong> in real-time for opportunities matching your skills and CGPA.
            <br />This may take 15–30 seconds on first load.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '380px', margin: '16px auto 0' }}>
            <LoadingStep text="Launching headless Chromium..." />
            <LoadingStep text="Querying Google Search for your skills..." />
            <LoadingStep text="Scraping Unstop competitions..." />
            <LoadingStep text="Checking Devpost hackathons..." />
            <LoadingStep text="Scanning Internshala listings..." />
          </div>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '20px', maxWidth: '600px', margin: '40px auto' }}>
          <AlertCircle size={48} color="#f59e0b" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No Opportunities Found</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
            Try adjusting your student skills, clearing the search filter, or clicking <strong>Refresh Live</strong> to re-scrape.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {opportunities.map(opp => {
            const badgeClass = 
              opp.category === 'Hackathon' ? 'badge-hackathon' :
              opp.category === 'Internship' ? 'badge-internship' :
              opp.category === 'Research' ? 'badge-research' : 'badge-scholarship';

            const cgpaDetails = opp.matchDetails || {};

            return (
              <div key={opp.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Header Badge & Match Score */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className={`badge ${badgeClass}`}>{opp.category}</span>
                    
                    <div style={{
                      background: opp.matchScore > 50 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      border: opp.matchScore > 50 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                      color: opp.matchScore > 50 ? '#34d399' : '#fbbf24',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Sparkles size={12} /> {opp.matchScore}% FIT
                    </div>
                  </div>

                  {/* Title & Organization */}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '6px' }}>{opp.title}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    {opp.organization}
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>• via {opp.source}</span>
                  </div>

                  {/* CGPA Requirement Indicator */}
                  {cgpaDetails.cgpaHighlight && (
                    <div style={{
                      background: cgpaDetails.cgpaStatus === 'Ineligible CGPA' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(15, 23, 42, 0.8)',
                      border: cgpaDetails.cgpaStatus === 'Ineligible CGPA' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-card)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      marginBottom: '14px',
                      color: cgpaDetails.cgpaStatus === 'Ineligible CGPA' ? '#fca5a5' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {cgpaDetails.cgpaStatus === 'Ineligible CGPA' ? (
                        <XCircle size={14} color="#ef4444" />
                      ) : (
                        <CheckCircle size={14} color="#10b981" />
                      )}
                      <span>{cgpaDetails.cgpaHighlight}</span>
                    </div>
                  )}

                  {/* Info List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={14} color="var(--warning)" />
                      <strong style={{ color: 'var(--text-main)' }}>{opp.prizeStipend}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} />
                      <span>{opp.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} />
                      <span>Deadline: <strong>{opp.deadline || 'Check source'}</strong> {opp.daysLeft != null ? `(${opp.daysLeft} days left)` : ''}</span>
                    </div>
                  </div>

                  {/* Description snippet */}
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {opp.description}
                  </p>

                  {/* Required Skills */}
                  {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                      {opp.requiredSkills.map(skill => (
                        <span key={skill} style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-card)', paddingTop: '16px' }}>
                  
                  {/* Source Link */}
                  {opp.url && (
                    <a
                      href={opp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ width: '100%', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <ExternalLink size={16} /> Visit Official Page
                    </a>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      onClick={() => onGenerateContent(opp)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '8px' }}
                    >
                      <FileText size={14} /> AI Email/Letter
                    </button>

                    <button
                      onClick={() => onSaveToTracker(opp)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '8px' }}
                    >
                      <CheckCircle size={14} /> Save Tracker
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

// Small helper for loading step animation
function LoadingStep({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
      <Loader size={14} style={{ animation: 'spin 1.2s linear infinite', color: '#6366f1' }} />
      <span>{text}</span>
    </div>
  );
}
