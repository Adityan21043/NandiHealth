import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css';
import Dashboard from './Dashboard';
import MedicationChecker from './MedicationChecker';
import DietReference from './DietReference';
import HealthAssistant from './HealthAssistant';
import LifestyleGuide from './LifestyleGuide';

function App() {
  return (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard signOut={signOut} user={user} />} />
            <Route path="/medication" element={<MedicationChecker />} />
            <Route path="/diet" element={<DietReference />} />
            <Route path="/assistant" element={<HealthAssistant />} />
            <Route path="/lifestyle" element={<LifestyleGuide />} />
          </Routes>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}

export default App;