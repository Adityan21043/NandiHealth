import React from 'react';
import { useNavigate } from 'react-router-dom';

function LifestyleGuide() {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F4F7FB', minHeight: '100vh', padding: '20px' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#185FA5', fontSize: '14px', cursor: 'pointer', marginBottom: '16px' }}>← Back to Dashboard</button>
      <h1 style={{ color: '#0F2A4A', fontSize: '22px' }}>📖 Lifestyle Guide</h1>
      <p style={{ color: '#4A5568' }}>Coming soon — Phase 4</p>
    </div>
  );
}

export default LifestyleGuide;
