import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = 'https://u8qvvaw7ek.execute-api.us-east-1.amazonaws.com';

const KIDNEY_RISKS = {
  high: {
    drugs: [
      { names: ['ibuprofen', 'advil', 'motrin', 'nurofen'], alternative: { drug: 'Acetaminophen (Tylenol)', reason: 'Acetaminophen does not affect kidney blood flow and is the preferred pain reliever for single-kidney patients.' }},
      { names: ['naproxen', 'aleve', 'naprosyn'], alternative: { drug: 'Acetaminophen (Tylenol)', reason: 'Acetaminophen is safer for kidney function than naproxen at recommended doses.' }},
      { names: ['aspirin', 'bayer', 'ecotrin'], alternative: { drug: 'Acetaminophen (Tylenol)', reason: 'For pain relief, acetaminophen is safer. If aspirin is prescribed for heart health, consult your doctor before stopping.' }},
      { names: ['diclofenac', 'voltaren'], alternative: { drug: 'Acetaminophen (Tylenol)', reason: 'Acetaminophen is the recommended alternative for pain that does not require an anti-inflammatory.' }},
      { names: ['celecoxib', 'celebrex'], alternative: { drug: 'Acetaminophen (Tylenol)', reason: 'Acetaminophen is safer for kidney function for general pain relief.' }},
      { names: ['meloxicam', 'mobic'], alternative: { drug: 'Acetaminophen (Tylenol)', reason: 'Acetaminophen does not carry the same kidney risk as meloxicam.' }},
      { names: ['indomethacin', 'indocin'], alternative: { drug: 'Acetaminophen (Tylenol)', reason: 'Acetaminophen is significantly safer for kidney function.' }},
      { names: ['ketorolac', 'toradol'], alternative: { drug: 'Acetaminophen (Tylenol)', reason: 'Ketorolac is one of the most kidney-damaging NSAIDs — acetaminophen is a much safer choice.' }},
      { names: ['piroxicam', 'feldene'], alternative: { drug: 'Acetaminophen (Tylenol)', reason: 'Acetaminophen is the recommended alternative for single-kidney patients.' }},
      { names: ['contrast dye', 'iodine contrast', 'gadolinium'], alternative: { drug: 'Discuss with your doctor', reason: 'IV contrast dye can cause contrast-induced nephropathy. Always inform your radiologist you have one kidney — they may use a lower dose or alternative imaging.' }},
    ],
    level: 'avoid',
    color: '#FAECE7',
    border: '#E8A090',
    badge: '#712B13',
    icon: '⛔',
    label: 'Avoid with one kidney',
    reason: 'This medication significantly reduces blood flow to the kidney or is directly toxic to kidney tissue. With only one kidney, even short-term use carries serious risk.',
  },
  medium: {
    drugs: [
      { names: ['lisinopril', 'zestril', 'prinivil'], alternative: { drug: 'Discuss dosage with your doctor', reason: 'ACE inhibitors like lisinopril can be beneficial for kidney protection but require careful monitoring of kidney function and potassium levels.' }},
      { names: ['losartan', 'cozaar'], alternative: { drug: 'Discuss dosage with your doctor', reason: 'ARBs like losartan require dose adjustment and regular kidney function monitoring in single-kidney patients.' }},
      { names: ['valsartan', 'diovan'], alternative: { drug: 'Discuss dosage with your doctor', reason: 'Requires careful kidney function monitoring — dose may need adjustment.' }},
      { names: ['enalapril', 'vasotec'], alternative: { drug: 'Discuss dosage with your doctor', reason: 'ACE inhibitors require regular creatinine and potassium monitoring with one kidney.' }},
      { names: ['ramipril', 'altace'], alternative: { drug: 'Discuss dosage with your doctor', reason: 'Dose adjustment likely needed — regular kidney function tests required.' }},
      { names: ['metformin', 'glucophage'], alternative: { drug: 'Discuss dosage with your doctor', reason: 'Metformin is generally avoided or dose-reduced when kidney function is below a certain threshold. Regular eGFR monitoring is essential.' }},
      { names: ['furosemide', 'lasix'], alternative: { drug: 'Discuss dosage with your doctor', reason: 'Diuretics can cause dehydration which stresses the remaining kidney. Adequate hydration is critical.' }},
      { names: ['hydrochlorothiazide', 'hctz', 'microzide'], alternative: { drug: 'Discuss dosage with your doctor', reason: 'Can cause electrolyte imbalances. Regular monitoring of kidney function and electrolytes needed.' }},
      { names: ['spironolactone', 'aldactone'], alternative: { drug: 'Discuss dosage with your doctor', reason: 'Can raise potassium levels dangerously in single-kidney patients. Requires regular blood tests.' }},
      { names: ['lithium', 'lithobid'], alternative: { drug: 'Discuss with your doctor', reason: 'Lithium is directly toxic to the kidneys over time. Regular kidney function tests and lithium level monitoring are essential.' }},
      { names: ['cyclosporine', 'sandimmune'], alternative: { drug: 'Discuss with your transplant team', reason: 'Cyclosporine is nephrotoxic — kidney function must be closely monitored.' }},
      { names: ['tacrolimus', 'prograf'], alternative: { drug: 'Discuss with your transplant team', reason: 'Requires careful dose monitoring to avoid kidney toxicity.' }},
      { names: ['vancomycin', 'vancocin'], alternative: { drug: 'Discuss with your doctor', reason: 'Vancomycin requires dose adjustment based on kidney function and regular drug level monitoring.' }},
      { names: ['gentamicin', 'garamycin'], alternative: { drug: 'Discuss with your doctor', reason: 'Aminoglycosides are directly toxic to kidney cells — requires careful dosing and monitoring.' }},
      { names: ['acyclovir', 'zovirax'], alternative: { drug: 'Discuss dosage with your doctor', reason: 'Requires dose reduction in patients with reduced kidney function. Stay well hydrated.' }},
      { names: ['trimethoprim', 'bactrim', 'septra'], alternative: { drug: 'Discuss with your doctor', reason: 'Can raise creatinine levels and affect kidney function — requires monitoring.' }},
      { names: ['creatine'], alternative: { drug: 'Discuss with your doctor', reason: 'Creatine supplements raise creatinine levels and may stress the remaining kidney. Most nephrologists advise against use with one kidney.' }},
      { names: ['protein powder', 'whey protein'], alternative: { drug: 'Whole food protein sources', reason: 'High protein intake increases kidney workload. Whole food sources like chicken, fish, and eggs are preferable to concentrated supplements.' }},
    ],
    level: 'caution',
    color: '#FAEEDA',
    border: '#F0C08A',
    badge: '#633806',
    icon: '⚠️',
    label: 'Use with caution',
    reason: 'This medication affects kidney function or is processed by the kidneys. With one kidney, dosage adjustments and regular monitoring are often required.',
  }
};

const DANGEROUS_COMBOS = [
  { drugs: ['lisinopril', 'losartan', 'valsartan', 'enalapril', 'ramipril'], warning: 'Combining multiple blood pressure medications that affect the kidney (ACE inhibitors + ARBs) can significantly reduce kidney function.' },
  { drugs: ['ibuprofen', 'advil', 'naproxen', 'aleve', 'aspirin'], warning: 'Combining multiple NSAIDs dramatically increases the risk of acute kidney injury.' },
  { drugs: ['furosemide', 'lasix', 'hydrochlorothiazide', 'hctz', 'spironolactone'], warning: 'Combining diuretics can cause dehydration, which is especially dangerous with one kidney.' },
  { drugs: ['metformin', 'ibuprofen', 'advil', 'naproxen', 'aleve'], warning: 'NSAIDs combined with metformin can increase the risk of lactic acidosis and kidney stress.' },
];

function getRiskInfo(drugName) {
  const name = drugName.toLowerCase().trim();

  for (const entry of KIDNEY_RISKS.high.drugs) {
    if (entry.names.some(d => name.includes(d) || d.includes(name))) {
      return {
        ...KIDNEY_RISKS.high,
        drug: drugName,
        alternative: entry.alternative,
        reason: KIDNEY_RISKS.high.reason,
      };
    }
  }

  for (const entry of KIDNEY_RISKS.medium.drugs) {
    if (entry.names.some(d => name.includes(d) || d.includes(name))) {
      return {
        ...KIDNEY_RISKS.medium,
        drug: drugName,
        alternative: entry.alternative,
        reason: KIDNEY_RISKS.medium.reason,
      };
    }
  }

  return {
    level: 'safe',
    color: '#EAF3DE',
    border: '#B5D89A',
    badge: '#27500A',
    icon: '✅',
    label: 'Generally safe',
    drug: drugName,
    reason: 'This medication is not flagged as high risk for single-kidney patients at normal doses. However, always inform your doctor or pharmacist that you have one kidney.',
    alternative: { drug: null, reason: 'Always inform your doctor that you have one kidney when starting any new medication or supplement.' },
  };
}

function checkCombinations(medList) {
  const names = medList.map(m => m.name.toLowerCase());
  const warnings = [];
  DANGEROUS_COMBOS.forEach(combo => {
    const matches = combo.drugs.filter(d => names.some(n => n.includes(d) || d.includes(n)));
    if (matches.length >= 2) {
      warnings.push({ drugs: matches, warning: combo.warning });
    }
  });
  return warnings;
}

function MedicationChecker() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myMeds, setMyMeds] = useState([]);
  const [comboWarnings, setComboWarnings] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchAuthSession().then(session => {
      const id = session.tokens?.idToken?.payload?.email || 'user';
      setUserId(id);
      const saved = localStorage.getItem(`nandihealth-meds-${id}`);
      if (saved) {
        const meds = JSON.parse(saved);
        setMyMeds(meds);
        setComboWarnings(checkCombinations(meds));
      }
    });
  }, []);

  const saveMeds = (meds) => {
    setMyMeds(meds);
    setComboWarnings(checkCombinations(meds));
    if (userId) localStorage.setItem(`nandihealth-meds-${userId}`, JSON.stringify(meds));
  };

  const checkMedication = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearchResult(null);
    const risk = getRiskInfo(query);
    try {
      const res = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${query}"&limit=1`);
      const data = await res.json();
      if (data.results?.[0]) risk.fdaData = data.results[0];
    } catch (e) {}
    setSearchResult(risk);
    setLoading(false);
  };

  const addToMyMeds = (med) => {
    if (myMeds.find(m => m.name.toLowerCase() === med.drug.toLowerCase())) return;
    const newMeds = [...myMeds, { name: med.drug, level: med.level, addedAt: new Date().toISOString() }];
    saveMeds(newMeds);
    setActiveTab('mylist');
  };

  const removeMed = (name) => {
    saveMeds(myMeds.filter(m => m.name !== name));
  };

  const tabStyle = (tab) => ({
    flex: 1, padding: '10px', fontSize: '13px', fontWeight: '500',
    border: 'none', cursor: 'pointer', borderRadius: '8px',
    background: activeTab === tab ? '#0F2A4A' : 'transparent',
    color: activeTab === tab ? '#fff' : '#4A5568',
  });

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F4F7FB', minHeight: '100vh', padding: '20px' }}>

      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#185FA5', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
        ← Back to Dashboard
      </button>

      <div style={{ background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '16px 18px', marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#8A9BB0', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Medication Checker</div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#0F2A4A' }}>💊 Is this safe for one kidney?</div>
        <div style={{ fontSize: '13px', color: '#4A5568', marginTop: '4px' }}>Search medications and build your personal medication list</div>
      </div>

      {/* COMBO WARNING BANNER */}
      {comboWarnings.length > 0 && (
        <div style={{ background: '#FAECE7', border: '1px solid #E8A090', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#712B13', marginBottom: '6px' }}>⛔ Combination Risk Detected</div>
          {comboWarnings.map((w, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#712B13', lineHeight: '1.6', marginBottom: '4px' }}>
              <strong>{w.drugs.join(' + ')}:</strong> {w.warning}
            </div>
          ))}
        </div>
      )}

      {/* TABS */}
      <div style={{ background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '6px', marginBottom: '16px', display: 'flex', gap: '4px' }}>
        <button style={tabStyle('search')} onClick={() => setActiveTab('search')}>🔍 Check a Medication</button>
        <button style={tabStyle('mylist')} onClick={() => setActiveTab('mylist')}>
          📋 My Medications {myMeds.length > 0 && `(${myMeds.length})`}
        </button>
      </div>

      {/* SEARCH TAB */}
      {activeTab === 'search' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkMedication()}
                placeholder="e.g. Advil, ibuprofen, Tylenol..."
                style={{ flex: 1, padding: '12px 14px', borderRadius: '8px', border: '1px solid #D8E3EF', fontSize: '14px', color: '#0F2A4A', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
              />
              <button onClick={checkMedication} disabled={loading} style={{ background: '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 20px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                {loading ? 'Checking...' : 'Check'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: '#8A9BB0' }}>Try:</div>
              {['Advil', 'Tylenol', 'Lisinopril', 'Aspirin', 'Metformin'].map(med => (
                <button key={med} onClick={() => setQuery(med)} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '99px', border: '1px solid #D8E3EF', background: '#F4F7FB', color: '#4A5568', cursor: 'pointer' }}>
                  {med}
                </button>
              ))}
            </div>
          </div>

          {searchResult && (
            <div style={{ background: searchResult.color, border: `1px solid ${searchResult.border}`, borderRadius: '12px', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px' }}>{searchResult.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: searchResult.badge, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Kidney Safety Rating</div>
                  <div style={{ fontSize: '17px', fontWeight: '600', color: '#0F2A4A' }}>{searchResult.label}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '99px', background: searchResult.badge, color: '#fff' }}>{searchResult.drug}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#0F2A4A', lineHeight: '1.6', marginBottom: '10px' }}>
                <strong>Why:</strong> {searchResult.reason}
              </div>
              <div style={{ fontSize: '13px', color: '#0F2A4A', lineHeight: '1.6', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
  💡 <strong>Recommendation:</strong> {searchResult.alternative.reason}
  {searchResult.alternative.drug && searchResult.alternative.drug !== 'Discuss with your doctor' && searchResult.alternative.drug !== 'Discuss dosage with your doctor' && searchResult.alternative.drug !== 'Discuss with your transplant team' && (
    <button
      onClick={() => addToMyMeds(getRiskInfo(searchResult.alternative.drug))}
      style={{ display: 'block', marginTop: '10px', width: '100%', padding: '8px', background: '#27500A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
      + Add {searchResult.alternative.drug} to My Medication List
    </button>
  )}
</div>
              <button onClick={() => addToMyMeds(searchResult)} style={{ width: '100%', padding: '10px', background: '#0F2A4A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                + Add to My Medication List
              </button>
            </div>
          )}
        </div>
      )}

      {/* MY MEDS TAB */}
      {activeTab === 'mylist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {myMeds.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💊</div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#0F2A4A', marginBottom: '6px' }}>No medications added yet</div>
              <div style={{ fontSize: '13px', color: '#4A5568' }}>Search for a medication and tap "Add to My Medication List"</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '12px', color: '#4A5568', padding: '0 2px' }}>
                {myMeds.length} medication{myMeds.length > 1 ? 's' : ''} tracked · {comboWarnings.length > 0 ? `⛔ ${comboWarnings.length} combination risk${comboWarnings.length > 1 ? 's' : ''}` : '✅ No combination risks detected'}
              </div>
              {myMeds.map((med, i) => {
                const risk = getRiskInfo(med.name);
                return (
                  <div key={i} style={{ background: '#fff', border: `1px solid ${risk.border}`, borderLeft: `3px solid ${risk.badge}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{risk.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F2A4A' }}>{med.name}</div>
                      <div style={{ fontSize: '12px', color: risk.badge, fontWeight: '500' }}>{risk.label}</div>
                    </div>
                    <button onClick={() => removeMed(med.name)} style={{ background: 'none', border: '1px solid #D8E3EF', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: '#8A9BB0', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      <div style={{ textAlign: 'center', fontSize: '11px', color: '#8A9BB0', lineHeight: '1.6', padding: '20px 8px 0' }}>
        ⚕️ For educational reference only · Always consult your doctor before taking any medication
      </div>

    </div>
  );
}

export default MedicationChecker;