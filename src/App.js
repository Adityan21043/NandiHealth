import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function App() {
  return (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => (
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
          <p style={{ color: '#4A5568', fontSize: '15px', marginBottom: '24px' }}>
            Single kidney management
          </p>
          <p style={{ color: '#4A5568', fontSize: '14px', marginBottom: '16px' }}>
            Welcome, {user.signInDetails.loginId}
          </p>
          <button
            onClick={signOut}
            style={{
              background: '#185FA5',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
            }}>
            Sign out
          </button>
        </div>
      )}
    </Authenticator>
  );
}

export default App;