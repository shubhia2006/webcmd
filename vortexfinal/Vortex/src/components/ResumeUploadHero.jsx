import React, { useState } from 'react';
import { UploadCloud, FileText, Sparkles, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ResumeUploadHero({ onResumeParsed, onManualEntry }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setParsing(true);
    setErrorMessage('');
    setStatusMessage('Reading resume file...');

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      setStatusMessage('Extracting text & skills with AI Parser...');

      const res = await fetch('http://localhost:3001/api/resume/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success && data.profile) {
        setStatusMessage('AI Profile generated! Fetching matching live opportunities...');
        setTimeout(() => {
          setParsing(false);
          onResumeParsed(data.profile);
        }, 600);
      } else {
        throw new Error(data.error || 'Failed to parse resume');
      }
    } catch (err) {
      setParsing(false);
      setErrorMessage(err.message || 'Error processing resume file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      
      {/* Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '6px 14px', borderRadius: '999px', fontSize: '0.78rem', color: '#c7d2fe', marginBottom: '16px' }}>
        <Sparkles size={14} color="#818cf8" />
        <span>VORTEX AI RESUME PARSER & WEBCMD LIVE CRAWLER</span>
      </div>

      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '12px', background: 'linear-gradient(90deg, #ffffff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Upload Your Resume to Auto-Discover Tailored Opportunities
      </h1>

      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.5 }}>
        No hardcoded or pre-existing data. Upload your resume (PDF / TXT) — our AI will extract your profile and deploy the <strong>WebCMD agent</strong> to crawl live Hackathons, Internships, Scholarships, and Research Opportunities matching your background!
      </p>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="glass-panel"
        style={{
          padding: '40px 20px',
          borderRadius: '20px',
          border: dragOver ? '2px dashed #818cf8' : '2px dashed rgba(255, 255, 255, 0.15)',
          background: dragOver ? 'rgba(99, 102, 241, 0.1)' : 'rgba(15, 23, 42, 0.7)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '20px'
        }}
        onClick={() => document.getElementById('resume-file-input').click()}
      >
        <input
          id="resume-file-input"
          type="file"
          accept=".pdf,.txt,.docx"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
        />

        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          {parsing ? (
            <Sparkles size={32} color="#818cf8" style={{ animation: 'spin 2s linear infinite' }} />
          ) : (
            <UploadCloud size={32} color="#818cf8" />
          )}
        </div>

        {parsing ? (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-glow)', marginBottom: '6px' }}>
              Parsing {file?.name}...
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{statusMessage}</p>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              Drag & Drop your Resume here or <span style={{ color: 'var(--primary-glow)', textDecoration: 'underline' }}>Browse File</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Supports PDF, TXT, DOCX formats (Max 10MB)
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div style={{ color: '#fca5a5', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {errorMessage}
        </div>
      )}

      {/* Manual Fallback Link */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Don't have your resume file right now?{' '}
        <button
          onClick={onManualEntry}
          style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Enter your details manually <ArrowRight size={12} />
        </button>
      </div>

    </div>
  );
}
