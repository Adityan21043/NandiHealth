import React from 'react';

function App() {
  return (
    <div style={{
      fontFamily: 'DM Sans, sans-serif',
      background: '#F4F7FB',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    }}>
      <div style={{
        background: '#0F2A4A',
        padding: '16px 28px',
        borderRadius: '12px',
        marginBottom: '16px',
      }}>
        <span style={{ color: '#E6F1FB', fontSize: '24px', fontWeight: '600' }}>
          NandiHealth
        </span>
      </div>
      <p style={{ color: '#4A5568', fontSize: '15px' }}>
        Single kidney management
      </p>
    </div>
  );
}

export default App;