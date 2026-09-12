import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OpportunityRadar from './components/OpportunityRadar';
import TrackerBoard from './components/TrackerBoard';
import AgentConsole from './components/AgentConsole';
import BrowserCanvas from './components/BrowserCanvas';
import HumanApprovalModal from './components/HumanApprovalModal';
import OnboardingModal from './components/OnboardingModal';
import GeminiChatbot from './components/GeminiChatbot';
import SplashScreen from './components/SplashScreen';
import { FileText, Copy, X } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('radar');
  
  // Profile state — starts NULL (user inputs details manually)
  const [profile, setProfile] = useState(null);
  
  // Controls manual profile editing modal
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Opportunities state
  const [opportunities, setOpportunities] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingOpps, setLoadingOpps] = useState(false);
  const [isScrapingLive, setIsScrapingLive] = useState(false);

  // Tracker state
  const [trackerList, setTrackerList] = useState([]);

  // WebCMD Console logs
  const [logs, setLogs] = useState([]);
  const [doctorOutput, setDoctorOutput] = useState(null);

  // Human Approval Modal state
  const [approvalRequest, setApprovalRequest] = useState(null);

  // AI Content Generator Modal state
  const [generatedContent, setGeneratedContent] = useState(null);
  const [copiedType, setCopiedType] = useState(null);

  // Fetch opportunities dynamically based on entered profile skills
  const fetchOpportunities = async (profileData = profile) => {
    if (!profileData || !profileData.skills || profileData.skills.length === 0) {
      setOpportunities([]);
      return;
    }

    setLoadingOpps(true);
    setIsScrapingLive(true);
    try {
      const queryParams = new URLSearchParams();
      if (categoryFilter !== 'All') queryParams.append('category', categoryFilter);
      if (searchQuery) queryParams.append('query', searchQuery);

      const res = await fetch(`http://localhost:3001/api/opportunities?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOpportunities(data.data);
      }
    } catch (err) {
      console.error('Error fetching live opportunities:', err);
    } finally {
      setLoadingOpps(false);
      setIsScrapingLive(false);
    }
  };

  // Fetch application tracker
  const fetchTracker = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/tracker');
      const data = await res.json();
      if (data.success) setTrackerList(data.tracker);
    } catch (err) {
      console.error('Error fetching tracker:', err);
    }
  };

  // Fetch WebCMD logs
  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/webcmd/logs');
      const data = await res.json();
      if (data.success) setLogs(data.logs);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  // Refresh handler — force clear cache and re-scrape
  const handleRefreshOpportunities = async () => {
    if (!profile) return;
    setLoadingOpps(true);
    setIsScrapingLive(true);
    try {
      const res = await fetch('http://localhost:3001/api/opportunities/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categoryFilter })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOpportunities(data.data);
      }
    } catch (err) {
      console.error('Error refreshing opportunities:', err);
    } finally {
      setLoadingOpps(false);
      setIsScrapingLive(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchOpportunities();
    }
    fetchTracker();
    fetchLogs();

    const interval = setInterval(() => {
      fetchLogs();
    }, 2000);
    return () => clearInterval(interval);
  }, [profile, categoryFilter, searchQuery]);

  // Handle Manual Profile Submission
  const handleProfileComplete = async (updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditingProfile(false);

    try {
      await fetch('http://localhost:3001/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      fetchOpportunities(updatedProfile);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  // Handle prepare autofill application (Triggers Human Approval Gate)
  const handlePrepareApply = async (oppId) => {
    try {
      const res = await fetch('http://localhost:3001/api/autofill/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId: oppId })
      });
      const data = await res.json();
      if (data.success) {
        setApprovalRequest(data.approvalRequest);
      } else {
        alert(data.error || 'Please enter your student details first');
      }
    } catch (err) {
      alert('Error preparing form: ' + err.message);
    }
  };

  // Handle Human Approval submission
  const handleApproveSubmission = async (approvalId, modifiedData) => {
    try {
      const res = await fetch('http://localhost:3001/api/autofill/process-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, decision: 'APPROVE', modifiedData })
      });
      const data = await res.json();
      if (data.success) {
        setApprovalRequest(null);
        fetchTracker();
        setActiveTab('tracker');
      }
    } catch (err) {
      alert('Error approving submission: ' + err.message);
    }
  };

  // Handle Human Approval rejection
  const handleRejectSubmission = async () => {
    if (!approvalRequest) return;
    await fetch('http://localhost:3001/api/autofill/process-approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalId: approvalRequest.id, decision: 'REJECT' })
    });
    setApprovalRequest(null);
  };

  // Generate AI Cold Email & Cover Letter
  const handleGenerateContent = async (opp) => {
    try {
      const res = await fetch('http://localhost:3001/api/match/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId: opp.id })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedContent({ opp, coldEmail: data.coldEmail, coverLetter: data.coverLetter });
      } else {
        alert(data.error || 'Please enter your student details first.');
      }
    } catch (err) {
      alert('Error generating AI content: ' + err.message);
    }
  };

  // Save to Tracker directly
  const handleSaveToTracker = async (opp) => {
    try {
      await fetch('http://localhost:3001/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opp.id,
          title: opp.title,
          organization: opp.organization,
          category: opp.category,
          status: 'Wishlist',
          notes: 'Saved from Opportunity Radar.'
        })
      });
      fetchTracker();
      setActiveTab('tracker');
    } catch (err) {
      alert('Error saving to tracker: ' + err.message);
    }
  };

  // Update Tracker Stage
  const handleUpdateTrackerStatus = async (id, newStatus) => {
    try {
      await fetch(`http://localhost:3001/api/tracker/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchTracker();
    } catch (err) {
      console.error('Error updating tracker status:', err);
    }
  };

  // Run webcmd doctor
  const handleRunDoctor = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/webcmd/doctor');
      const data = await res.json();
      setDoctorOutput(data.output || 'webcmd bridge check completed cleanly.');
      fetchLogs();
    } catch (err) {
      alert('Doctor check failed: ' + err.message);
    }
  };

  // Capture DOM snapshot
  const handleCaptureSnapshot = async (sessionId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/webcmd/snapshot/${sessionId}`);
      const data = await res.json();
      return data.snapshot;
    } catch (err) {
      return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile || { name: 'Enter Profile', gpa: 'N/A', major: 'Student' }}
        onOpenProfile={() => setIsEditingProfile(true)}
      />

      {/* Main Workspace Body */}
      <main style={{ flex: 1 }}>
        {!profile ? (
          /* Show Manual Detail Form when profile is null */
          <OnboardingModal
            profile={null}
            onComplete={handleProfileComplete}
            isInline={true}
          />
        ) : (
          /* Show Workspace once Student Profile is entered */
          <>
            {activeTab === 'radar' && (
              <OpportunityRadar
                opportunities={opportunities}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onPrepareApply={handlePrepareApply}
                onGenerateContent={handleGenerateContent}
                onSaveToTracker={handleSaveToTracker}
                isLoading={isScrapingLive}
                onRefresh={handleRefreshOpportunities}
              />
            )}

            {activeTab === 'tracker' && (
              <TrackerBoard
                trackerList={trackerList}
                onUpdateStatus={handleUpdateTrackerStatus}
              />
            )}

            {activeTab === 'console' && (
              <AgentConsole
                logs={logs}
                onRunDoctor={handleRunDoctor}
                doctorOutput={doctorOutput}
              />
            )}

            {activeTab === 'canvas' && (
              <BrowserCanvas
                onCaptureSnapshot={handleCaptureSnapshot}
              />
            )}
          </>
        )}
      </main>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <OnboardingModal
          profile={profile}
          onComplete={handleProfileComplete}
          isInline={false}
        />
      )}

      {/* Human Approval Modal */}
      {approvalRequest && (
        <HumanApprovalModal
          approvalRequest={approvalRequest}
          onApprove={handleApproveSubmission}
          onReject={handleRejectSubmission}
          onClose={() => setApprovalRequest(null)}
        />
      )}

      {/* AI Content Generator Modal */}
      {generatedContent && (
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
          <div className="glass-panel" style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="var(--primary-glow)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                  AI Content for {generatedContent.opp.title}
                </h3>
              </div>
              <button onClick={() => setGeneratedContent(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Cold Email Block */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)' }}>Personalized Cold Email to PI / Recruiter</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedContent.coldEmail);
                    setCopiedType('email');
                    setTimeout(() => setCopiedType(null), 2000);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                >
                  <Copy size={12} /> {copiedType === 'email' ? 'Copied!' : 'Copy Email'}
                </button>
              </div>
              <pre style={{
                fontFamily: 'var(--font-code)',
                fontSize: '0.8rem',
                color: '#f8fafc',
                background: '#040711',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid var(--border-card)',
                whiteSpace: 'pre-wrap'
              }}>
                {generatedContent.coldEmail}
              </pre>
            </div>

            {/* Cover Letter Block */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-glow)' }}>Tailored Cover Letter</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedContent.coverLetter);
                    setCopiedType('letter');
                    setTimeout(() => setCopiedType(null), 2000);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                >
                  <Copy size={12} /> {copiedType === 'letter' ? 'Copied!' : 'Copy Letter'}
                </button>
              </div>
              <pre style={{
                fontFamily: 'var(--font-code)',
                fontSize: '0.8rem',
                color: '#f8fafc',
                background: '#040711',
                padding: '14px',
                borderRadius: '10px',
                border: '1px solid var(--border-card)',
                whiteSpace: 'pre-wrap'
              }}>
                {generatedContent.coverLetter}
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* Gemini AI Chatbot */}
      <GeminiChatbot profile={profile} opportunities={opportunities} />

      {/* Startup Animated Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

    </div>
  );
}
