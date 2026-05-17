import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = 'https://u8qvvaw7ek.execute-api.us-east-1.amazonaws.com';
const SUGGESTED_QUESTIONS = [
  "Is it safe to take ibuprofen with one kidney?",
  "How much water should I drink daily with one kidney?",
  "What foods should I avoid with one kidney?",
  "Can I exercise normally with one kidney?",
  "What are the signs of kidney stress I should watch for?",
  "Is creatine safe with one kidney?",
  "Can I drink alcohol with one kidney?",
  "What blood tests should I get regularly with one kidney?",
  "Can I take aspirin with one kidney?",
  "What supplements are safe with one kidney?",
];

function HealthAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchAuthSession().then(session => {
      const id = session.tokens?.idToken?.payload?.email || 'user';
      const saved = localStorage.getItem(`nandihealth-profile-${id}`);
      if (saved) setProfile(JSON.parse(saved));
    });

    setMessages([{
      role: 'assistant',
      content: "Hello! I'm your NandiHealth assistant, specialized in kidney health for single-kidney patients. I can answer questions about medications, diet, hydration, exercise, and lifestyle. What would you like to know?"
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildSystemPrompt = () => {
    let prompt = `You are NandiHealth Assistant, a specialized health education AI focused exclusively on kidney health for people living with one kidney.

Your role is to provide clear, accurate, and personalized health education. You are NOT a doctor and always remind users to consult their healthcare provider for medical decisions.

Key guidelines:
- Always prioritize kidney safety in your answers
- Be specific about single-kidney considerations
- Use plain, clear language — avoid overly technical jargon
- Always recommend consulting a doctor for specific medical decisions
- Flag any medications or substances that are dangerous for single-kidney patients
- Be warm, supportive, and encouraging
- Keep responses focused and practical
- Format responses clearly with short paragraphs
- Always include a brief disclaimer when discussing medications or treatments`;

    if (profile?.age) {
      prompt += `\n\nUser profile:
- Age: ${profile.age}
- Sex: ${profile.sex || 'not specified'}
- Weight: ${profile.weight} ${profile.weightUnit || 'lbs'}
- Height: ${profile.height} ${profile.heightUnit || 'ft'}
- Kidney reason: ${profile.kidneyReason || 'not specified'}
- Other conditions: ${profile.otherConditions?.join(', ') || 'none specified'}

Personalize your responses based on this profile when relevant.`;
    }

    return prompt;
  };

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;

    setInput('');
    setLoading(true);

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: buildSystemPrompt(),
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'I apologize, I had trouble generating a response. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I had trouble connecting. Please check your connection and try again.' }]);
    }

    setLoading(false);
  };

  const cardStyle = { background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '16px 18px', marginBottom: '12px' };

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F4F7FB', minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '640px', margin: '0 auto', padding: '20px' }}>

      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#185FA5', fontSize: '14px', cursor: 'pointer', marginBottom: '20px', textAlign: 'left' }}>
        ← Back to Dashboard
      </button>

      <div style={cardStyle}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#8A9BB0', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Health Assistant</div>
        <div style={{ fontSize: '22px', fontWeight: '600', color: '#0F2A4A', marginBottom: '4px' }}>💬 AI Health Assistant</div>
        <div style={{ fontSize: '13px', color: '#4A5568' }}>
          Ask any question about living with one kidney
          {profile?.age && <span style={{ color: '#185FA5' }}> · Personalized for your profile</span>}
        </div>
      </div>

      {messages.length <= 1 && (
        <div style={cardStyle}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#4A5568', marginBottom: '10px' }}>Suggested questions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                style={{ textAlign: 'left', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D8E3EF', background: '#F4F7FB', fontSize: '13px', color: '#0F2A4A', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', lineHeight: '1.4' }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: msg.role === 'user' ? '#0F2A4A' : '#fff',
              border: msg.role === 'user' ? 'none' : '1px solid #D8E3EF',
              fontSize: '13px',
              color: msg.role === 'user' ? '#fff' : '#0F2A4A',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.role === 'assistant' && (
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#8A9BB0', marginBottom: '6px', letterSpacing: '0.04em' }}>NANDI ASSISTANT</div>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '12px 16px', borderRadius: '12px 12px 12px 2px', background: '#fff', border: '1px solid #D8E3EF' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#8A9BB0', marginBottom: '6px' }}>NANDI ASSISTANT</div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D8E3EF' }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ background: '#fff', border: '1px solid #D8E3EF', borderRadius: '12px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask anything about living with one kidney..."
          rows={2}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', color: '#0F2A4A', resize: 'none', background: 'transparent', lineHeight: '1.5' }}
        />
        <button onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ background: loading || !input.trim() ? '#D8E3EF' : '#0F2A4A', color: loading || !input.trim() ? '#8A9BB0' : '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '500', cursor: loading || !input.trim() ? 'default' : 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
          Send →
        </button>
      </div>

      <div style={{ textAlign: 'center', fontSize: '11px', color: '#8A9BB0', lineHeight: '1.6', padding: '10px 0 0' }}>
        For educational reference only · Not a substitute for medical advice · Always consult your doctor
      </div>

    </div>
  );
}

export default HealthAssistant;