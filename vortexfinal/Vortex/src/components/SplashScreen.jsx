import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => onFinish(), 800);
    }, 2400);
    return () => clearTimeout(timer);
  }, [onFinish]);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${40 + Math.random() * 50}%`,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 4,
    duration: 4 + Math.random() * 4,
    color: ['#6366f1', '#06b6d4', '#ec4899', '#818cf8', '#34d399'][Math.floor(Math.random() * 5)]
  }));

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      {/* Floating particles */}
      <div className="splash-particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="splash-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="splash-logo">
        <Zap size={44} color="white" strokeWidth={2.5} />
      </div>

      {/* Title */}
      <h1 className="splash-title">VORTEX</h1>
      <p className="splash-subtitle">AI-POWERED STUDENT OPPORTUNITY ENGINE</p>

      {/* Loader bar */}
      <div className="splash-loader">
        <div className="splash-loader-bar" />
      </div>
    </div>
  );
}
