import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  {
    id: 'exercise',
    icon: '🏃',
    title: 'Exercise & Physical Activity',
    color: '#EAF3DE',
    border: '#27500A',
    tips: [
      { title: 'Exercise is safe and encouraged', body: 'Having one kidney does not mean you need to avoid exercise. Regular physical activity is beneficial for blood pressure control, weight management, and overall kidney health.' },
      { title: 'Avoid contact sports', body: 'High-contact sports like football, boxing, hockey, or martial arts carry a risk of kidney injury. With one kidney, a blow to the remaining kidney is significantly more dangerous. Wear protective gear if participating in any contact activity.' },
      { title: 'Stay hydrated during exercise', body: 'Dehydration during exercise is one of the most common preventable causes of acute kidney injury. Drink water before, during, and after exercise. Avoid exercising in extreme heat without adequate fluid intake.' },
      { title: 'Best exercises for one kidney', body: 'Swimming, cycling, walking, jogging, yoga, and strength training are all excellent choices. These provide cardiovascular benefits without kidney injury risk.' },
      { title: 'Avoid creatine supplements', body: 'Creatine supplements are popular in gyms but significantly increase kidney filtration demand. Most nephrologists advise against creatine use with one kidney.' },
    ]
  },
  {
    id: 'hydration',
    icon: '💧',
    title: 'Hydration & Kidney Health',
    color: '#E6F1FB',
    border: '#185FA5',
    tips: [
      { title: 'Your kidney filters 200 liters of blood daily', body: 'Your single remaining kidney does the work of two. Staying well hydrated keeps blood flowing efficiently and prevents waste buildup in the bloodstream.' },
      { title: 'Target 6–8 glasses of water daily', body: 'Unless your doctor has advised fluid restriction, aim for 6–8 glasses of water per day. More may be needed in hot weather or during exercise.' },
      { title: 'Watch for signs of dehydration', body: 'Dark yellow urine, infrequent urination, dizziness, and fatigue are signs of dehydration. These are more serious with one kidney and should be addressed immediately by drinking water.' },
      { title: 'Limit alcohol', body: 'Alcohol is a diuretic — it causes your body to lose more fluid than you take in. Limit alcohol and always drink water alongside it.' },
      { title: 'Caffeine in moderation', body: 'One to two cups of coffee or tea daily is generally fine. Excessive caffeine can increase blood pressure and mildly dehydrate you.' },
    ]
  },
  {
    id: 'medications',
    icon: '💊',
    title: 'Medication Safety',
    color: '#FAECE7',
    border: '#712B13',
    tips: [
      { title: 'Never take NSAIDs without doctor approval', body: 'Ibuprofen (Advil, Motrin), naproxen (Aleve), and aspirin reduce blood flow to the kidneys. With one kidney, even occasional use can cause significant damage. Use acetaminophen (Tylenol) instead.' },
      { title: 'Always disclose your single kidney status', body: 'Tell every doctor, dentist, surgeon, radiologist, and pharmacist that you have one kidney. Many medications and procedures require dose adjustments.' },
      { title: 'Be cautious with contrast dye', body: 'IV contrast dye used in CT scans and cardiac procedures can damage kidney function. Always inform your doctor before any imaging procedure that you have one kidney.' },
      { title: 'Herbal supplements can be dangerous', body: 'Many herbal supplements are processed by the kidneys and can be toxic. St. John\'s Wort, licorice root, creatine, and high-dose vitamin C can all stress the kidneys. Consult your doctor before taking any supplement.' },
      { title: 'Antibiotics may need dose adjustment', body: 'Many antibiotics are cleared by the kidneys. When prescribed antibiotics, remind your doctor you have one kidney so they can adjust the dose if needed.' },
    ]
  },
  {
    id: 'monitoring',
    icon: '🧪',
    title: 'Health Monitoring',
    color: '#FAEEDA',
    border: '#633806',
    tips: [
      { title: 'Get annual kidney function tests', body: 'At minimum, get your eGFR (estimated glomerular filtration rate) and creatinine tested once a year. These are the key indicators of how well your kidney is functioning.' },
      { title: 'Monitor blood pressure closely', body: 'Hypertension is the leading cause of kidney decline. Target blood pressure below 130/80 mmHg. Check it regularly — many pharmacies offer free readings.' },
      { title: 'Test for urine protein annually', body: 'Protein in the urine (proteinuria) is an early warning sign of kidney stress. A simple urine test can detect this — ask your doctor to include it in annual checkups.' },
      { title: 'Track your weight', body: 'Sudden weight gain (2+ lbs overnight) can indicate fluid retention, which may signal kidney stress. If this happens, contact your doctor.' },
      { title: 'Know your numbers', body: 'Learn your baseline eGFR, creatinine, blood pressure, and urine protein levels. Tracking trends over time is more valuable than any single reading.' },
    ]
  },
  {
    id: 'diet',
    icon: '🥗',
    title: 'Diet & Nutrition',
    color: '#EAF3DE',
    border: '#27500A',
    tips: [
      { title: 'Limit sodium to under 2,300mg daily', body: 'Excess sodium raises blood pressure and increases kidney workload. Avoid processed foods, canned soups, fast food, and adding extra salt to meals.' },
      { title: 'Moderate protein intake', body: 'Very high protein diets increase kidney filtration demand. A moderate protein intake from whole foods (chicken, fish, eggs) is preferable to protein supplements or powders.' },
      { title: 'Watch potassium with reduced kidney function', body: 'If your eGFR is below 60, your doctor may advise limiting high-potassium foods like bananas, avocados, potatoes, and spinach. If your kidney function is normal, potassium restriction is usually not necessary.' },
      { title: 'Maintain a healthy weight', body: 'Obesity causes hyperfiltration — where the kidney overworks to filter for excess body mass. Even a 5–10% weight reduction meaningfully reduces kidney stress.' },
      { title: 'Stay away from dark colas', body: 'Dark sodas like Coke and Pepsi contain phosphoric acid, which puts a direct phosphorus load on the kidneys. Choose water, herbal tea, or lighter beverages instead.' },
    ]
  },
  {
    id: 'travel',
    icon: '✈️',
    title: 'Travel & Daily Life',
    color: '#EEEDFE',
    border: '#3C3489',
    tips: [
      { title: 'Carry a medical ID', body: 'Wear a medical bracelet or carry a card that states you have one kidney. In an emergency, this information can prevent medical staff from administering harmful medications.' },
      { title: 'Stay hydrated when flying', body: 'Airplane cabins are very dry and dehydrating. Drink extra water when flying and avoid alcohol on long flights.' },
      { title: 'Be careful with travel vaccinations', body: 'Some travel vaccines interact with kidney function or immunosuppressive medications. Consult your doctor before international travel.' },
      { title: 'Bring medication documentation', body: 'When traveling internationally, carry documentation of all your medications and your single kidney status in case of a medical emergency abroad.' },
      { title: 'Avoid extreme heat without hydration', body: 'Prolonged exposure to heat causes dehydration and can trigger acute kidney injury. Stay in cool environments and drink extra water in hot climates.' },
    ]
  },
];

function LifestyleGuide() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState('exercise');

  const cardStyle = { background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '16px 18px', marginBottom: '12px' };

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F4F7FB', minHeight: '100vh', padding: '20px', maxWidth: '640px', margin: '0 auto' }}>

      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#185FA5', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
        ← Back to Dashboard
      </button>

      <div style={cardStyle}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#8A9BB0', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Lifestyle Guide</div>
        <div style={{ fontSize: '22px', fontWeight: '600', color: '#0F2A4A', marginBottom: '4px' }}>📖 One Kidney Living Guide</div>
        <div style={{ fontSize: '13px', color: '#4A5568' }}>Evidence-based guidance for living well with one kidney</div>
      </div>

      {SECTIONS.map(section => (
        <div key={section.id} style={{ marginBottom: '10px' }}>
          <div
            onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
            style={{ background: openSection === section.id ? section.color : '#fff', border: `1px solid ${openSection === section.id ? section.border : '#D8E3EF'}`, borderRadius: openSection === section.id ? '12px 12px 0 0' : '12px', padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>{section.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F2A4A' }}>{section.title}</span>
            </div>
            <span style={{ fontSize: '18px', color: '#8A9BB0', transition: 'transform 0.2s', transform: openSection === section.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>⌄</span>
          </div>

          {openSection === section.id && (
            <div style={{ border: `1px solid ${section.border}`, borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
              {section.tips.map((tip, i) => (
                <div key={i} style={{ padding: '14px 16px', borderBottom: i < section.tips.length - 1 ? '1px solid #D8E3EF' : 'none', background: '#fff' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F2A4A', marginBottom: '4px' }}>{tip.title}</div>
                  <div style={{ fontSize: '13px', color: '#4A5568', lineHeight: '1.6' }}>{tip.body}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{ textAlign: 'center', fontSize: '11px', color: '#8A9BB0', lineHeight: '1.6', padding: '8px 0 20px' }}>
        For educational reference only · Not a substitute for medical advice · Always consult your doctor
      </div>

    </div>
  );
}

export default LifestyleGuide;