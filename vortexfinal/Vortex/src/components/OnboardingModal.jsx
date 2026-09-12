import React, { useState } from 'react';
import { GraduationCap, MapPin, Sparkles, Code, ArrowRight, BookOpen, Check } from 'lucide-react';

export default function OnboardingModal({ profile, onComplete, isInline = false }) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    university: profile?.university || '',
    major: profile?.major || '',
    degree: profile?.degree || '',
    gpa: profile?.gpa || '',
    stateLocation: profile?.stateLocation || '',
    skills: Array.isArray(profile?.skills) ? profile.skills.join(', ') : '',
    interests: ''
  });

  const popularColleges = [
    'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kharagpur',
    'NIT Trichy', 'BITS Pilani', 'DTU Delhi', 'NSUT Delhi',
    'VIT Vellore', 'SRM Chennai', 'Pune University', 'Anna University'
  ];

  const popularSkills = ['Python', 'C++', 'Java', 'React', 'Node.js', 'AI & ML', 'Data Structures', 'Web3', 'Flutter', 'SQL'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArray = typeof formData.skills === 'string'
      ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : formData.skills;

    onComplete({
      ...formData,
      skills: skillsArray
    });
  };

  const formContent = (
    <div className="glass-panel" style={{
      maxWidth: '740px',
      width: '100%',
      maxHeight: '92vh',
      overflowY: 'auto',
      padding: '32px',
      borderRadius: '24px',
      border: '2px solid rgba(99, 102, 241, 0.4)',
      boxShadow: '0 0 50px rgba(99, 102, 241, 0.25)',
      margin: '0 auto'
    }}>
      
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
          boxShadow: '0 0 25px rgba(99, 102, 241, 0.6)'
        }}>
          <GraduationCap size={30} color="#ffffff" />
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(90deg, #ffffff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 6px 0' }}>
          Enter Your Student Details 🇮🇳
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto' }}>
          Enter your college and technical skills below. Vortex will crawl live <strong>Hackathons, Internships, Scholarships & Research Opportunities</strong> matching your exact profile!
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* Section 1: Basic Info */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-card)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-glow)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={16} /> 1. Personal & College Details
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Your Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email Address *</label>
              <input
                type="email"
                required
                placeholder="aarav@college.edu.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>College / University (India) *</label>
              <input
                type="text"
                required
                placeholder="e.g. IIT Bombay / BITS Pilani / NIT Trichy / VIT"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Degree & Branch *</label>
              <select
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              >
                <option value="" disabled>Select your degree...</option>
                <option value="B.Tech CS (1st/2nd Year)">B.Tech CS (1st/2nd Year)</option>
                <option value="B.Tech CS (3rd Year)">B.Tech CS (3rd Year)</option>
                <option value="B.Tech CS (4th Year / Final)">B.Tech CS (4th Year / Final)</option>
                <option value="B.Tech ECE / EEE">B.Tech ECE / EEE</option>
                <option value="M.Tech / MS Computer Science">M.Tech / MS Computer Science</option>
                <option value="B.Sc / BCA / MCA">B.Sc / BCA / MCA</option>
              </select>
            </div>
          </div>

          {/* Quick College Selector Pills */}
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: 'center' }}>Quick select:</span>
            {popularColleges.slice(0, 6).map(c => (
              <button
                type="button"
                key={c}
                onClick={() => setFormData({ ...formData, university: c })}
                style={{
                  background: formData.university === c ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-muted)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                {c}
              </button>
            ))}
          </div>

        </div>

        {/* Section 2: Skills & Tech Stack */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-card)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Code size={16} /> 2. Technical Stack & Skills *
          </h4>

          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Enter your key skills (comma-separated):
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Python, C++, React, AI, Node.js, Data Structures"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              marginBottom: '10px',
              outline: 'none'
            }}
          />

          {/* Click to add popular skill pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {popularSkills.map(skill => (
              <button
                type="button"
                key={skill}
                onClick={() => {
                  if (!formData.skills.includes(skill)) {
                    setFormData({
                      ...formData,
                      skills: formData.skills ? `${formData.skills}, ${skill}` : skill
                    });
                  }
                }}
                style={{
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: '#38bdf8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  cursor: 'pointer'
                }}
              >
                + {skill}
              </button>
            ))}
          </div>

        </div>

        {/* Section 3: Preferences */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Target Region</label>
            <select
              value={formData.stateLocation}
              onChange={(e) => setFormData({ ...formData, stateLocation: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            >
              <option value="" disabled>Select your target region...</option>
              <option value="Pan India / Remote">Pan India & Remote</option>
              <option value="Bangalore, Karnataka">Bangalore, Karnataka</option>
              <option value="Hyderabad / Telangana">Hyderabad / Telangana</option>
              <option value="Delhi NCR / Gurgaon">Delhi NCR / Gurgaon</option>
              <option value="Mumbai, Maharashtra">Mumbai, Maharashtra</option>
              <option value="Chennai, Tamil Nadu">Chennai, Tamil Nadu</option>
              <option value="Pune, Maharashtra">Pune, Maharashtra</option>
              <option value="Global Fellowships (Canada/US)">Global Fellowships (Canada/US/Remote)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CGPA / GPA</label>
            <input
              type="text"
              placeholder="e.g. 8.5/10"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            padding: '14px',
            fontSize: '1rem',
            borderRadius: '12px',
            marginTop: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Sparkles size={18} /> Fetch Tailored Opportunities for My Skills <ArrowRight size={18} />
        </button>

      </form>

    </div>
  );

  if (isInline) {
    return <div style={{ padding: '40px 24px' }}>{formContent}</div>;
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(4, 7, 17, 0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      {formContent}
    </div>
  );
}
