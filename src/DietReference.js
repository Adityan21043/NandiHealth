import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';

// ─── DATA ────────────────────────────────────────────────────────────────────

const FOODS = {
  enjoy: [
    { name: 'Cauliflower', note: 'Low potassium, low phosphorus — excellent kidney-safe vegetable' },
    { name: 'Cabbage', note: 'Low in potassium and phosphorus, high in vitamin K and C' },
    { name: 'Garlic', note: 'Natural anti-inflammatory, adds flavor without sodium' },
    { name: 'Onions', note: 'Low potassium, great flavor substitute for salt' },
    { name: 'Bell peppers', note: 'Low potassium, high in vitamins A and C' },
    { name: 'Blueberries', note: 'Low potassium, high antioxidants — one of the best kidney-safe fruits' },
    { name: 'Strawberries', note: 'Low potassium, anti-inflammatory properties' },
    { name: 'Cranberries', note: 'Supports urinary tract health, low potassium' },
    { name: 'Pineapple', note: 'Lower potassium than many fruits, good alternative to bananas' },
    { name: 'Apple', note: 'Low potassium, high fiber — a kidney-safe snack' },
    { name: 'Egg whites', note: 'High quality protein with less phosphorus than egg yolks' },
    { name: 'Chicken breast', note: 'Lean protein — preferable over processed meats' },
    { name: 'Fish (cod, tilapia)', note: 'Omega-3 fatty acids reduce inflammation and support kidney health' },
    { name: 'White rice', note: 'Lower phosphorus and potassium than brown rice' },
    { name: 'White bread', note: 'Lower phosphorus than whole wheat — better for kidney patients' },
    { name: 'Olive oil', note: 'Heart-healthy fat, anti-inflammatory, kidney-safe' },
    { name: 'Water', note: 'The single best thing for kidney health — stay hydrated' },
  ],
  limit: [
    { name: 'Red meat', note: 'High in protein and phosphorus — limit to 2–3 servings per week' },
    { name: 'Whole wheat bread', note: 'Higher phosphorus than white bread — occasional consumption is fine' },
    { name: 'Brown rice', note: 'Higher phosphorus and potassium than white rice — limit portions' },
    { name: 'Dairy (milk, cheese)', note: 'High in phosphorus and potassium — limit to small amounts daily' },
    { name: 'Nuts and seeds', note: 'High in phosphorus and potassium — limit to small handfuls' },
    { name: 'Legumes (beans, lentils)', note: 'High potassium and phosphorus — limit portions, rinse canned beans' },
    { name: 'Oranges and orange juice', note: 'High potassium — limit or choose lower potassium fruits instead' },
    { name: 'Potatoes', note: 'Very high potassium — leach by peeling, dicing, soaking in water before cooking' },
    { name: 'Tomatoes', note: 'High potassium — use in small amounts as a condiment rather than a base' },
    { name: 'Alcohol', note: 'Dehydrates the body and stresses the kidney — limit to occasional use' },
    { name: 'Caffeine', note: 'Mild diuretic — moderate consumption (1–2 cups coffee) is generally fine' },
    { name: 'Salt substitutes', note: 'Often contain potassium chloride — can raise potassium to dangerous levels' },
  ],
  avoid: [
    { name: 'Ibuprofen / NSAIDs taken with food', note: 'NSAIDs reduce kidney blood flow — even taken with food this does not reduce kidney risk' },
    { name: 'Processed meats (bacon, sausage, deli meat)', note: 'Very high sodium and phosphorus additives — significantly increases kidney workload' },
    { name: 'Dark colas (Pepsi, Coke)', note: 'Contain phosphoric acid — high phosphorus load directly absorbed into bloodstream' },
    { name: 'Canned soups', note: 'Extremely high sodium — a single can can exceed the daily recommended limit' },
    { name: 'Frozen dinners', note: 'High sodium and phosphorus preservatives — avoid regularly' },
    { name: 'Bananas', note: 'Very high potassium — one of the highest potassium fruits, avoid with one kidney' },
    { name: 'Avocados', note: 'Very high potassium — a single avocado can significantly raise potassium levels' },
    { name: 'Spinach and kale (raw)', note: 'Very high potassium and oxalate — cooking reduces potassium somewhat' },
    { name: 'Creatine supplements', note: 'Directly increases kidney filtration demand and raises creatinine levels' },
    { name: 'High-dose vitamin C supplements', note: 'Excess vitamin C is converted to oxalate, which can form kidney stones' },
    { name: 'Herbal supplements (St. Johns Wort, licorice root)', note: 'Many herbal supplements are processed by the kidneys and can be toxic — consult your doctor before use' },
  ]
};

const CATEGORY_META = {
  enjoy: { label: 'Enjoy freely', icon: '✅', color: '#EAF3DE', border: '#B5D89A', badge: '#27500A', desc: 'These foods are safe and beneficial for single-kidney patients' },
  limit: { label: 'Limit intake', icon: '⚠️', color: '#FAEEDA', border: '#F0C08A', badge: '#633806', desc: 'These foods are fine occasionally but should not be eaten in large amounts daily' },
  avoid: { label: 'Avoid', icon: '⛔', color: '#FAECE7', border: '#E8A090', badge: '#712B13', desc: 'These foods or supplements put significant stress on your remaining kidney' },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

function DietReference() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('hydration');
  const [foodFilter, setFoodFilter] = useState('all');
  const [foodSearch, setFoodSearch] = useState('');
  const [glasses, setGlasses] = useState(0);
  const [hydrationLog, setHydrationLog] = useState({});
  const [target, setTarget] = useState(8);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchAuthSession().then(session => {
      const id = session.tokens?.idToken?.payload?.email || 'user';
      setUserId(id);
      const log = localStorage.getItem(`nandihealth-hydration-${id}`);
      if (log) {
        const parsed = JSON.parse(log);
        setHydrationLog(parsed);
        setGlasses(parsed[today] || 0);
      }
    });
  }, []);

  const saveGlasses = (count) => {
    const updated = { ...hydrationLog, [today]: count };
    setGlasses(count);
    setHydrationLog(updated);
    if (userId) localStorage.setItem(`nandihealth-hydration-${userId}`, JSON.stringify(updated));
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const maxGlasses = Math.max(...last7Days.map(d => hydrationLog[d] || 0), target);

  const filteredFoods = Object.entries(FOODS).flatMap(([cat, items]) =>
    items.map(item => ({ ...item, category: cat }))
  ).filter(item => {
    const matchesFilter = foodFilter === 'all' || item.category === foodFilter;
    const matchesSearch = item.name.toLowerCase().includes(foodSearch.toLowerCase()) || item.note.toLowerCase().includes(foodSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const tabStyle = (tab) => ({
    flex: 1, padding: '10px', fontSize: '13px', fontWeight: '500',
    border: 'none', cursor: 'pointer', borderRadius: '8px',
    background: activeTab === tab ? '#0F2A4A' : 'transparent',
    color: activeTab === tab ? '#fff' : '#4A5568',
    fontFamily: 'DM Sans, sans-serif',
  });

  const cardStyle = { background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '16px 18px', marginBottom: '12px' };

  const pct = Math.min((glasses / target) * 100, 100);
  const pctColor = pct >= 100 ? '#27500A' : pct >= 60 ? '#185FA5' : pct >= 30 ? '#633806' : '#712B13';

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F4F7FB', minHeight: '100vh', padding: '20px', maxWidth: '640px', margin: '0 auto' }}>

      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#185FA5', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
        ← Back to Dashboard
      </button>

      <div style={cardStyle}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#8A9BB0', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Diet & Hydration</div>
        <div style={{ fontSize: '22px', fontWeight: '600', color: '#0F2A4A', marginBottom: '4px' }}>🥗 Diet & Hydration Tracker</div>
        <div style={{ fontSize: '13px', color: '#4A5568' }}>Track your water intake and learn what foods support your remaining kidney</div>
      </div>

      {/* TABS */}
      <div style={{ background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '6px', marginBottom: '12px', display: 'flex', gap: '4px' }}>
        <button style={tabStyle('hydration')} onClick={() => setActiveTab('hydration')}>💧 Hydration</button>
        <button style={tabStyle('foods')} onClick={() => setActiveTab('foods')}>🥗 Food Guide</button>
      </div>

      {/* ── HYDRATION TAB ── */}
      {activeTab === 'hydration' && (
        <>
          {/* TODAY */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F2A4A' }}>Today's hydration</div>
                <div style={{ fontSize: '12px', color: '#8A9BB0' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: '600', color: pctColor }}>{glasses}</div>
                <div style={{ fontSize: '11px', color: '#8A9BB0' }}>of {target} glasses</div>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div style={{ height: '8px', background: '#F4F7FB', borderRadius: '4px', marginBottom: '6px', overflow: 'hidden' }}>
              <div style={{ height: '8px', width: `${pct}%`, background: pctColor === '#27500A' ? '#27500A' : '#378ADD', borderRadius: '4px', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: '11px', color: '#8A9BB0', marginBottom: '16px' }}>
              {pct >= 100 ? '🎉 Daily target reached!' : `${target - glasses} more glass${target - glasses !== 1 ? 'es' : ''} to reach your target`}
            </div>

            {/* GLASS BUTTONS */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {Array.from({ length: target }, (_, i) => (
                <button key={i} onClick={() => saveGlasses(i + 1 === glasses ? i : i + 1)}
                  style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid', fontSize: '18px', cursor: 'pointer', background: i < glasses ? '#E6F1FB' : '#F4F7FB', borderColor: i < glasses ? '#378ADD' : '#D8E3EF', transition: 'all 0.15s' }}>
                  {i < glasses ? '💧' : '○'}
                </button>
              ))}
            </div>

            {/* CONTROLS */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => saveGlasses(Math.max(0, glasses - 1))}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #D8E3EF', background: '#fff', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#4A5568' }}>
                − Remove glass
              </button>
              <button onClick={() => saveGlasses(Math.min(target + 4, glasses + 1))}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#185FA5', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#fff', fontWeight: '500' }}>
                + Add glass
              </button>
            </div>
          </div>

          {/* TARGET */}
          <div style={cardStyle}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F2A4A', marginBottom: '10px' }}>Daily target</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[6, 7, 8, 9, 10, 12].map(t => (
                <button key={t} onClick={() => setTarget(t)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', background: target === t ? '#0F2A4A' : '#fff', color: target === t ? '#fff' : '#4A5568', borderColor: target === t ? '#0F2A4A' : '#D8E3EF' }}>
                  {t}
                </button>
              ))}
              <span style={{ fontSize: '12px', color: '#8A9BB0' }}>glasses/day</span>
            </div>
          </div>

          {/* 7 DAY CHART */}
          <div style={cardStyle}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F2A4A', marginBottom: '14px' }}>Last 7 days</div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '80px' }}>
              {last7Days.map((day, i) => {
                const count = hydrationLog[day] || 0;
                const height = maxGlasses > 0 ? Math.max((count / maxGlasses) * 70, count > 0 ? 8 : 2) : 2;
                const isToday = day === today;
                const metTarget = count >= target;
                return (
                  <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '10px', color: metTarget ? '#27500A' : '#8A9BB0', fontWeight: metTarget ? '600' : '400' }}>{count || ''}</div>
                    <div style={{ width: '100%', height: `${height}px`, background: isToday ? '#185FA5' : metTarget ? '#27500A' : count > 0 ? '#B5D89A' : '#D8E3EF', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
                    <div style={{ fontSize: '10px', color: isToday ? '#185FA5' : '#8A9BB0', fontWeight: isToday ? '600' : '400' }}>
                      {new Date(day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#185FA5' }} /><span style={{ fontSize: '11px', color: '#8A9BB0' }}>Today</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#27500A' }} /><span style={{ fontSize: '11px', color: '#8A9BB0' }}>Target met</span></div>
            </div>
          </div>

          {/* WHY HYDRATION MATTERS */}
          <div style={{ background: '#E6F1FB', border: '1px solid #B5D4F4', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0C447C', marginBottom: '6px' }}>💡 Why hydration matters with one kidney</div>
            <div style={{ fontSize: '12px', color: '#185FA5', lineHeight: '1.6' }}>
              Your remaining kidney filters all of your blood — typically 200 liters per day. Staying hydrated keeps blood flowing efficiently through the kidney, prevents waste buildup, and significantly reduces the risk of kidney stones. Dehydration is one of the most common and preventable causes of acute kidney injury in single-kidney patients.
            </div>
          </div>
        </>
      )}

      {/* ── FOOD GUIDE TAB ── */}
      {activeTab === 'foods' && (
        <>
          {/* SEARCH */}
          <div style={cardStyle}>
            <input type="text" placeholder="Search foods or supplements..." value={foodSearch}
              onChange={e => setFoodSearch(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #D8E3EF', fontSize: '14px', color: '#0F2A4A', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
              {['all', 'enjoy', 'limit', 'avoid'].map(f => (
                <button key={f} onClick={() => setFoodFilter(f)}
                  style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '99px', border: '1px solid', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', background: foodFilter === f ? '#0F2A4A' : '#fff', color: foodFilter === f ? '#fff' : '#4A5568', borderColor: foodFilter === f ? '#0F2A4A' : '#D8E3EF' }}>
                  {f === 'all' ? 'All foods' : `${CATEGORY_META[f].icon} ${CATEGORY_META[f].label}`}
                </button>
              ))}
            </div>
          </div>

          {/* RESULTS */}
          {foodFilter === 'all' && !foodSearch ? (
            Object.entries(FOODS).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: '16px' }}>
                <div style={{ background: CATEGORY_META[cat].color, border: `1px solid ${CATEGORY_META[cat].border}`, borderRadius: '12px', padding: '12px 16px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#0F2A4A', marginBottom: '2px' }}>{CATEGORY_META[cat].icon} {CATEGORY_META[cat].label}</div>
                  <div style={{ fontSize: '12px', color: '#4A5568' }}>{CATEGORY_META[cat].desc}</div>
                </div>
                {items.map((item, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #D8E3EF', borderLeft: `3px solid ${CATEGORY_META[cat].badge}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '6px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F2A4A', marginBottom: '2px' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#4A5568', lineHeight: '1.5' }}>{item.note}</div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div>
              <div style={{ fontSize: '12px', color: '#4A5568', marginBottom: '10px', padding: '0 2px' }}>{filteredFoods.length} result{filteredFoods.length !== 1 ? 's' : ''}</div>
              {filteredFoods.map((item, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #D8E3EF', borderLeft: `3px solid ${CATEGORY_META[item.category].badge}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F2A4A' }}>{item.name}</span>
                    <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '99px', background: CATEGORY_META[item.category].color, color: CATEGORY_META[item.category].badge }}>
                      {CATEGORY_META[item.category].icon} {CATEGORY_META[item.category].label}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#4A5568', lineHeight: '1.5' }}>{item.note}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ textAlign: 'center', fontSize: '11px', color: '#8A9BB0', lineHeight: '1.6', padding: '8px 0 20px' }}>
        For educational reference only · Not a substitute for medical or dietary advice
      </div>
    </div>
  );
}

export default DietReference;