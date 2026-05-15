import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';

// ─── RISK ENGINE ────────────────────────────────────────────────────────────

function calculateRiskScore(profile) {
  const age = parseInt(profile.age) || 0;
  const bmi = parseFloat(calculateBMI(profile)) || 0;
  const factors = [];
  let score = 0;

  // Age
  if (age >= 70) {
    score += 3;
    factors.push({ label: 'Age 70+', icon: '⛔', severity: 'high', detail: 'Kidney function declines approximately 1% per year after 40. At 70+, your remaining kidney has significantly less reserve capacity. Medication dosing and hydration become critically important.' });
  } else if (age >= 60) {
    score += 2;
    factors.push({ label: 'Age 60–69', icon: '⚠️', severity: 'medium', detail: 'Kidney function has naturally declined from peak. Regular eGFR monitoring (at least annually) is recommended. Be cautious with medications processed by the kidneys.' });
  } else if (age >= 50) {
    score += 1;
    factors.push({ label: 'Age 50–59', icon: '⚠️', severity: 'low', detail: 'Mild age-related kidney function decline begins. Annual kidney function tests are a good precaution.' });
  } else {
    factors.push({ label: 'Age under 50', icon: '✅', severity: 'ok', detail: 'Age is not a significant kidney risk factor at this stage. Standard single-kidney precautions apply.' });
  }

  // BMI
  if (bmi >= 35) {
    score += 3;
    factors.push({ label: `BMI ${bmi} — Obese Class II+`, icon: '⛔', severity: 'high', detail: 'Severe obesity causes hyperfiltration — where the kidney overworks to compensate for body mass. This accelerates long-term kidney damage. Weight loss is one of the highest-impact interventions for kidney protection.' });
  } else if (bmi >= 30) {
    score += 2;
    factors.push({ label: `BMI ${bmi} — Obese`, icon: '⛔', severity: 'high', detail: 'Obesity significantly increases kidney workload through hyperfiltration. Even a 5–10% weight reduction meaningfully reduces kidney stress.' });
  } else if (bmi >= 25) {
    score += 1;
    factors.push({ label: `BMI ${bmi} — Overweight`, icon: '⚠️', severity: 'medium', detail: 'Moderately elevated BMI increases kidney workload. Moving toward a healthy BMI (18.5–24.9) will benefit long-term kidney health.' });
  } else if (bmi > 0) {
    factors.push({ label: `BMI ${bmi} — Healthy`, icon: '✅', severity: 'ok', detail: 'Healthy BMI reduces kidney workload. Maintaining this range is beneficial for long-term kidney function.' });
  }

  // Conditions
  const conditionDetails = {
    'High blood pressure': { score: 2, icon: '⛔', severity: 'high', detail: 'Hypertension is the #2 cause of kidney disease. High pressure damages the tiny blood vessels in the kidney over time. Target: below 130/80 mmHg. This is one of the most important things to control with one kidney.' },
    'Type 2 diabetes': { score: 3, icon: '⛔', severity: 'high', detail: 'Diabetes is the #1 cause of kidney disease. High blood glucose damages kidney filtration units (nephrons) irreversibly over time. Target HbA1c below 7%. Regular urine protein and eGFR testing is essential.' },
    'Type 1 diabetes': { score: 3, icon: '⛔', severity: 'high', detail: 'Type 1 diabetes requires lifelong careful kidney monitoring. Tight glucose control (HbA1c < 7%) and annual urine albumin tests are critical to protecting the remaining kidney.' },
    'Heart disease': { score: 2, icon: '⛔', severity: 'high', detail: 'The heart and kidney are deeply interdependent. Reduced cardiac output reduces blood flow to the kidney. Many heart medications require dose adjustment for single-kidney patients — always inform your cardiologist.' },
    'High cholesterol': { score: 1, icon: '⚠️', severity: 'medium', detail: 'Some statins require dose adjustment with reduced kidney function. However, managing cholesterol is important — cardiovascular disease accelerates kidney decline.' },
    'Thyroid condition': { score: 1, icon: '⚠️', severity: 'medium', detail: 'Both hypothyroidism and hyperthyroidism affect kidney blood flow and filtration rate. Proper thyroid management indirectly protects kidney function.' },
    'Liver condition': { score: 1, icon: '⚠️', severity: 'medium', detail: 'The liver and kidneys share drug metabolism. Liver conditions can increase kidney exposure to medications and toxins. Many drugs require dose adjustment when both organs are affected.' },
    'Autoimmune condition': { score: 2, icon: '⛔', severity: 'high', detail: 'Some autoimmune diseases directly attack the kidneys (lupus nephritis, IgA nephropathy). Medications used to treat autoimmune conditions (NSAIDs, certain biologics, high-dose steroids) carry significant kidney risks.' },
  };

  profile.otherConditions?.forEach(condition => {
    if (conditionDetails[condition]) {
      const c = conditionDetails[condition];
      score += c.score;
      factors.push({ label: condition, icon: c.icon, severity: c.severity, detail: c.detail });
    }
  });

  // Overall
  let overall;
  if (score >= 7) overall = { label: 'High Risk Profile', color: '#FAECE7', border: '#E8A090', badge: '#712B13', icon: '⛔', summary: 'Your profile indicates multiple significant kidney risk factors. Careful medication management, regular monitoring, and close communication with your nephrologist are strongly recommended.' };
  else if (score >= 4) overall = { label: 'Moderate Risk Profile', color: '#FAEEDA', border: '#F0C08A', badge: '#633806', icon: '⚠️', summary: 'Your profile has some kidney risk factors that warrant attention. Annual kidney function tests and careful medication choices will help protect your remaining kidney long-term.' };
  else if (score >= 1) overall = { label: 'Lower Risk Profile', color: '#FEF9E7', border: '#F5E07A', badge: '#7A6008', icon: '⚡', summary: 'Your profile shows minimal kidney risk factors. Continue standard single-kidney precautions and maintain healthy habits.' };
  else overall = { label: 'Healthy Profile', color: '#EAF3DE', border: '#B5D89A', badge: '#27500A', icon: '✅', summary: 'Your profile shows no significant kidney risk factors beyond having one kidney. Maintain healthy habits and standard single-kidney precautions.' };

  return { score, factors, overall };
}

function calculateBMI(profile) {
  if (!profile.weight || !profile.height) return null;
  let weightKg = profile.weightUnit === 'lbs' ? profile.weight * 0.453592 : parseFloat(profile.weight);
  let heightM;
  if (profile.heightUnit === 'ft') {
    const parts = profile.height.toString().split('.');
    const feet = parseFloat(parts[0]) || 0;
    const inches = parseFloat(parts[1]) || 0;
    heightM = (feet * 12 + inches) * 0.0254;
  } else {
    heightM = parseFloat(profile.height) / 100;
  }
  if (!heightM || !weightKg) return null;
  return (weightKg / (heightM * heightM)).toFixed(1);
}

function generateRecommendations(profile, factors) {
  const recs = [];
  const age = parseInt(profile.age) || 0;
  const bmi = parseFloat(calculateBMI(profile)) || 0;
  const conditions = profile.otherConditions || [];

  recs.push({ priority: 'high', text: 'Never take ibuprofen, naproxen, or other NSAIDs — use acetaminophen (Tylenol) for pain instead', icon: '💊' });
  recs.push({ priority: 'high', text: 'Always tell every doctor, dentist, radiologist, and pharmacist that you have one kidney before receiving any new medication or IV contrast dye', icon: '🏥' });
  recs.push({ priority: 'medium', text: 'Stay well hydrated — aim for 6–8 glasses of water daily unless your doctor advises otherwise. Dehydration is one of the top causes of acute kidney injury.', icon: '💧' });

  if (age >= 50) recs.push({ priority: 'high', text: 'Get your eGFR, creatinine, and urine albumin tested at least once a year — these are the key indicators of kidney health', icon: '🧪' });
  if (bmi >= 25) recs.push({ priority: 'high', text: `Your BMI of ${bmi} increases kidney workload. A 5–10% weight reduction significantly reduces hyperfiltration stress on your remaining kidney`, icon: '⚖️' });
  if (conditions.includes('High blood pressure')) recs.push({ priority: 'high', text: 'Keep blood pressure below 130/80 mmHg. This is the single most impactful lifestyle target for kidney protection', icon: '❤️' });
  if (conditions.includes('Type 2 diabetes') || conditions.includes('Type 1 diabetes')) recs.push({ priority: 'high', text: 'Keep HbA1c below 7%. Tight glucose control is critical — high blood sugar silently damages kidney blood vessels over time', icon: '🩸' });
  if (conditions.includes('Heart disease')) recs.push({ priority: 'medium', text: 'Inform your cardiologist you have one kidney — many heart medications require dose adjustments and some contrast dyes used in cardiac imaging can damage kidney function', icon: '🫀' });
  recs.push({ priority: 'medium', text: 'Avoid creatine supplements and very high protein diets — these increase kidney filtration demand significantly', icon: '💪' });
  recs.push({ priority: 'low', text: 'Limit sodium intake to under 2,300mg per day — excess sodium raises blood pressure and increases kidney workload', icon: '🧂' });
  recs.push({ priority: 'low', text: 'Avoid smoking — smoking reduces blood flow to the kidneys and accelerates kidney function decline', icon: '🚭' });

  return recs;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────

function Profile() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved
  const [activeSection, setActiveSection] = useState('info');
  const [profile, setProfile] = useState({
    age: '', weight: '', weightUnit: 'lbs',
    height: '', heightUnit: 'ft', sex: '',
    kidneyReason: '', otherConditions: [],
  });

  const conditions = [
    'High blood pressure', 'Type 2 diabetes', 'Type 1 diabetes',
    'Heart disease', 'High cholesterol', 'Thyroid condition',
    'Liver condition', 'Autoimmune condition'
  ];

  useEffect(() => {
    fetchAuthSession().then(session => {
      const id = session.tokens?.idToken?.payload?.email || 'user';
      setUserId(id);
      const saved = localStorage.getItem(`nandihealth-profile-${id}`);
      if (saved) setProfile(JSON.parse(saved));
    });
  }, []);

  const bmi = calculateBMI(profile);
  const isProfileComplete = profile.age && profile.weight && profile.height && profile.sex;
  const risk = isProfileComplete ? calculateRiskScore(profile) : null;
  const recommendations = isProfileComplete ? generateRecommendations(profile, risk?.factors) : [];

  const saveProfile = () => {
    if (!userId) return;
    setSaveStatus('saving');
    localStorage.setItem(`nandihealth-profile-${userId}`, JSON.stringify(profile));
    setTimeout(() => setSaveStatus('saved'), 600);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const toggleCondition = (condition) => {
    const current = profile.otherConditions || [];
    setProfile({ ...profile, otherConditions: current.includes(condition) ? current.filter(c => c !== condition) : [...current, condition] });
  };

  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #D8E3EF', fontSize: '14px', color: '#0F2A4A', outline: 'none', fontFamily: 'DM Sans, sans-serif', background: '#fff', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '6px', display: 'block' };
  const cardStyle = { background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '16px 18px', marginBottom: '12px' };
  const tabStyle = (tab) => ({ flex: 1, padding: '10px', fontSize: '13px', fontWeight: '500', border: 'none', cursor: 'pointer', borderRadius: '8px', background: activeSection === tab ? '#0F2A4A' : 'transparent', color: activeSection === tab ? '#fff' : '#4A5568', fontFamily: 'DM Sans, sans-serif' });

  const severityColor = { high: '#712B13', medium: '#633806', low: '#7A6008', ok: '#27500A' };

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F4F7FB', minHeight: '100vh', padding: '20px', maxWidth: '640px', margin: '0 auto' }}>

      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#185FA5', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
        ← Back to Dashboard
      </button>

      {/* PAGE HEADER */}
      <div style={cardStyle}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#8A9BB0', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Health Profile</div>
        <div style={{ fontSize: '22px', fontWeight: '600', color: '#0F2A4A', marginBottom: '4px' }}>👤 Your Personal Profile</div>
        <div style={{ fontSize: '13px', color: '#4A5568' }}>Your age, weight, height, and conditions personalize every risk assessment in NandiHealth</div>
      </div>

      {/* OVERALL RISK BANNER */}
      {risk && (
        <div style={{ background: risk.overall.color, border: `1px solid ${risk.overall.border}`, borderRadius: '12px', padding: '16px 18px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>{risk.overall.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: risk.overall.badge, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Overall Risk Assessment</div>
              <div style={{ fontSize: '17px', fontWeight: '600', color: '#0F2A4A' }}>{risk.overall.label}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#8A9BB0' }}>Risk score</div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: risk.overall.badge }}>{risk.score}</div>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#4A5568', lineHeight: '1.6' }}>{risk.overall.summary}</div>
        </div>
      )}

      {/* TABS */}
      <div style={{ background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '6px', marginBottom: '12px', display: 'flex', gap: '4px' }}>
        <button style={tabStyle('info')} onClick={() => setActiveSection('info')}>📋 My Information</button>
        <button style={tabStyle('analysis')} onClick={() => setActiveSection('analysis')}>🔬 Risk Analysis</button>
        <button style={tabStyle('recs')} onClick={() => setActiveSection('recs')}>📌 Recommendations</button>
      </div>

      {/* ── MY INFORMATION TAB ── */}
      {activeSection === 'info' && (
        <>
          <div style={cardStyle}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F2A4A', marginBottom: '14px' }}>Basic Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Age</label>
                <input type="number" placeholder="e.g. 58" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Biological Sex</label>
                <select value={profile.sex} onChange={e => setProfile({ ...profile, sex: e.target.value })} style={inputStyle}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Weight</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="number" placeholder="e.g. 175" value={profile.weight} onChange={e => setProfile({ ...profile, weight: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  <select value={profile.weightUnit} onChange={e => setProfile({ ...profile, weightUnit: e.target.value })} style={{ ...inputStyle, width: '68px', padding: '11px 6px' }}>
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Height</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" placeholder={profile.heightUnit === 'ft' ? '5.11' : '180'} value={profile.height} onChange={e => setProfile({ ...profile, height: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  <select value={profile.heightUnit} onChange={e => setProfile({ ...profile, heightUnit: e.target.value })} style={{ ...inputStyle, width: '68px', padding: '11px 6px' }}>
                    <option value="ft">ft</option>
                    <option value="cm">cm</option>
                  </select>
                </div>
                {profile.heightUnit === 'ft' && <div style={{ fontSize: '11px', color: '#8A9BB0', marginTop: '4px' }}>feet.inches — e.g. 5.11</div>}
              </div>
            </div>
            {bmi && (
              <div style={{ background: '#F4F7FB', border: '1px solid #D8E3EF', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#4A5568' }}>Calculated BMI</div>
                  <div style={{ fontSize: '11px', color: '#8A9BB0' }}>{parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Healthy weight' : parseFloat(bmi) < 30 ? 'Overweight' : 'Obese'}</div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: '600', color: parseFloat(bmi) > 30 ? '#712B13' : parseFloat(bmi) > 25 ? '#633806' : '#27500A' }}>{bmi}</div>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F2A4A', marginBottom: '14px' }}>Kidney History</div>
            <label style={labelStyle}>Reason for single kidney</label>
            <select value={profile.kidneyReason} onChange={e => setProfile({ ...profile, kidneyReason: e.target.value })} style={inputStyle}>
              <option value="">Select reason</option>
              <option value="born">Born with one kidney (renal agenesis)</option>
              <option value="donated">Donated a kidney</option>
              <option value="removed_cancer">Kidney removed — cancer</option>
              <option value="removed_injury">Kidney removed — injury or trauma</option>
              <option value="removed_other">Kidney removed — other reason</option>
              <option value="nonfunctional">Second kidney is non-functional</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F2A4A', marginBottom: '4px' }}>Other Health Conditions</div>
            <div style={{ fontSize: '12px', color: '#4A5568', marginBottom: '12px' }}>Select all that apply — these affect your personalized risk score</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {conditions.map(condition => (
                <button key={condition} onClick={() => toggleCondition(condition)} style={{ fontSize: '12px', padding: '7px 14px', borderRadius: '99px', cursor: 'pointer', border: '1px solid', fontFamily: 'DM Sans, sans-serif', background: profile.otherConditions?.includes(condition) ? '#0F2A4A' : '#fff', color: profile.otherConditions?.includes(condition) ? '#fff' : '#4A5568', borderColor: profile.otherConditions?.includes(condition) ? '#0F2A4A' : '#D8E3EF' }}>
                  {profile.otherConditions?.includes(condition) ? '✓ ' : ''}{condition}
                </button>
              ))}
            </div>
          </div>

          <button onClick={saveProfile} style={{ width: '100%', padding: '14px', background: saveStatus === 'saved' ? '#27500A' : '#0F2A4A', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px', fontFamily: 'DM Sans, sans-serif', transition: 'background 0.2s' }}>
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Profile Saved' : 'Save Profile'}
          </button>
        </>
      )}

      {/* ── RISK ANALYSIS TAB ── */}
      {activeSection === 'analysis' && (
        <>
          {!isProfileComplete ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '32px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#0F2A4A', marginBottom: '6px' }}>Complete your profile first</div>
              <div style={{ fontSize: '13px', color: '#4A5568', marginBottom: '16px' }}>Enter your age, weight, height, and sex to see your personalized risk analysis</div>
              <button onClick={() => setActiveSection('info')} style={{ background: '#0F2A4A', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Go to My Information</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '12px', color: '#4A5568', padding: '0 2px', marginBottom: '10px' }}>
                {risk.factors.length} risk factor{risk.factors.length !== 1 ? 's' : ''} identified · Total score: {risk.score}
              </div>
              {risk.factors.map((factor, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #D8E3EF', borderLeft: `3px solid ${severityColor[factor.severity]}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '18px' }}>{factor.icon}</span>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F2A4A' }}>{factor.label}</div>
                    <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '99px', background: factor.severity === 'ok' ? '#EAF3DE' : factor.severity === 'low' ? '#FEF9E7' : factor.severity === 'medium' ? '#FAEEDA' : '#FAECE7', color: severityColor[factor.severity] }}>
                      {factor.severity === 'ok' ? 'No risk' : factor.severity === 'low' ? 'Low risk' : factor.severity === 'medium' ? 'Moderate' : 'High risk'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#4A5568', lineHeight: '1.6' }}>{factor.detail}</div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* ── RECOMMENDATIONS TAB ── */}
      {activeSection === 'recs' && (
        <>
          {!isProfileComplete ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '32px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📌</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#0F2A4A', marginBottom: '6px' }}>Complete your profile first</div>
              <div style={{ fontSize: '13px', color: '#4A5568', marginBottom: '16px' }}>Your recommendations are personalized based on your age, BMI, and health conditions</div>
              <button onClick={() => setActiveSection('info')} style={{ background: '#0F2A4A', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Go to My Information</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '12px', color: '#4A5568', padding: '0 2px', marginBottom: '10px' }}>
                {recommendations.length} personalized recommendations based on your profile
              </div>
              {recommendations.map((rec, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #D8E3EF', borderLeft: `3px solid ${rec.priority === 'high' ? '#712B13' : rec.priority === 'medium' ? '#633806' : '#8A9BB0'}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{rec.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: rec.priority === 'high' ? '#712B13' : rec.priority === 'medium' ? '#633806' : '#8A9BB0', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {rec.priority === 'high' ? 'High priority' : rec.priority === 'medium' ? 'Medium priority' : 'Good practice'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#0F2A4A', lineHeight: '1.6' }}>{rec.text}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      <div style={{ textAlign: 'center', fontSize: '11px', color: '#8A9BB0', lineHeight: '1.6', padding: '8px 0 20px' }}>
        Your data is stored privately on your device · For educational reference only · Not a substitute for medical advice
      </div>

    </div>
  );
}

export default Profile;