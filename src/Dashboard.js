import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard({ signOut, user }) {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F4F7FB', minHeight: '100vh', padding: '0 0 80px' }}>

      {/* TOP BAR */}
      <div style={{ background: '#fff', borderBottom: '1px solid #D8E3EF', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#0F2A4A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#E6F1FB', fontSize: '16px' }}>♡</span>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#0F2A4A' }}>NandiHealth</div>
            <div style={{ fontSize: '11px', color: '#8A9BB0' }}>Single kidney management</div>
          </div>
        </div>
        <button onClick={signOut} style={{ fontSize: '12px', color: '#8A9BB0', background: 'none', border: '1px solid #D8E3EF', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }}>Sign out</button>
        <button onClick={() => navigate('/profile')} style={{ fontSize: '12px', color: '#185FA5', background: 'none', border: '1px solid #D8E3EF', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', marginRight: '8px' }}> 👤 Profile</button>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { val: '1', lbl: 'Active kidney', tag: 'Monitored', tagColor: '#EAF3DE', tagText: '#27500A' },
            { val: '5/8', lbl: 'Glasses today', tag: '3 remaining', tagColor: '#E6F1FB', tagText: '#0C447C' },
            { val: '0', lbl: 'Flags today', tag: 'All clear', tagColor: '#EAF3DE', tagText: '#27500A' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '14px 12px' }}>
              <div style={{ fontSize: '22px', fontWeight: '600', color: '#0F2A4A', marginBottom: '2px' }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: '#4A5568', marginBottom: '6px' }}>{s.lbl}</div>
              <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 8px', borderRadius: '99px', background: s.tagColor, color: s.tagText }}>{s.tag}</span>
            </div>
          ))}
        </div>

        {/* ADVISORY */}
        <div style={{ background: '#fff', border: '1px solid #D8E3EF', borderLeft: '3px solid #378ADD', borderRadius: '12px', padding: '13px 15px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F2A4A', marginBottom: '4px' }}>Daily Advisory</div>
          <div style={{ fontSize: '12px', color: '#4A5568', lineHeight: '1.55' }}>NSAIDs such as ibuprofen reduce renal blood flow and should be avoided with one kidney. Use acetaminophen as a safer alternative.</div>
        </div>

        {/* HYDRATION */}
        <div style={{ background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#0F2A4A' }}>💧 Hydration log</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#185FA5' }}>62% of daily target</span>
          </div>
          <div style={{ height: '6px', background: '#F4F7FB', borderRadius: '3px', marginBottom: '8px' }}>
            <div style={{ height: '6px', width: '62.5%', background: '#378ADD', borderRadius: '3px' }}></div>
          </div>
          <div style={{ fontSize: '11px', color: '#8A9BB0' }}>Target: 8 glasses · Logged: 5 · Remaining: 3</div>
        </div>

        {/* TOOLS */}
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#8A9BB0', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0 2px' }}>Tools</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { icon: '💊', title: 'Medication Checker', desc: 'Verify kidney safety of any drug', color: '#FAECE7', route: '/medication' },
            { icon: '🥗', title: 'Diet Reference', desc: 'Renal-safe foods and what to avoid', color: '#EAF3DE', route: '/diet' },
            { icon: '💬', title: 'Health Assistant', desc: 'AI answers to kidney questions', color: '#EEEDFE', route: '/assistant' },
            { icon: '📖', title: 'Lifestyle Guide', desc: 'Evidence-based one-kidney living', color: '#E6F1FB', route: '/lifestyle' },
          ].map((tool, i) => (
            <div key={i} onClick={() => navigate(tool.route)} style={{ background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '14px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: tool.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{tool.icon}</div>
                <span style={{ color: '#8A9BB0', fontSize: '16px' }}>→</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F2A4A', marginBottom: '3px' }}>{tool.title}</div>
              <div style={{ fontSize: '11px', color: '#4A5568', lineHeight: '1.4' }}>{tool.desc}</div>
            </div>
          ))}
        </div>

        {/* DISCLAIMER */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#8A9BB0', lineHeight: '1.5', padding: '8px' }}>
          For educational reference only · Not a substitute for medical advice
        </div>

      </div>
    </div>
  );
}

export default Dashboard;