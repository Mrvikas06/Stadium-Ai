import { useEffect, useRef, useState } from 'react';
import { askGemini } from '../lib/gemini';

const CATEGORIZED_PROMPTS = [
  { label: 'Shortest food queue?', prompt: 'Shortest food queue right now?', cat: 'food' },
  { label: 'Least crowded exit?', prompt: 'Which gate has least crowd to exit?', cat: 'exit' },
  { label: 'First aid location?', prompt: 'Where is the first aid station?', cat: 'safety' },
  { label: 'Route to North Stand?', prompt: 'Best low-crowd route to North Stand?', cat: 'route' },
  { label: 'Accessible elevator?', prompt: 'Where are the wheelchair accessible elevators?', cat: 'access' },
  { label: 'Restroom with no line?', prompt: 'Which restroom has the shortest wait time right now?', cat: 'amenity' }
];

export function detectInputLanguage(text, fallback = 'en') {
  const value = (text || '').trim().toLowerCase();
  if (!value) return fallback;

  // Script detection for Indian languages
  if (/[\u0B80-\u0BFF]/.test(value)) return 'ta'; // Tamil
  if (/[\u0C00-\u0C7F]/.test(value)) return 'te'; // Telugu
  if (/[\u0C80-\u0CFF]/.test(value)) return 'kn'; // Kannada
  if (/[\u0D00-\u0D7F]/.test(value)) return 'ml'; // Malayalam
  if (/[\u0A80-\u0AFF]/.test(value)) return 'gu'; // Gujarati
  if (/[\u0A00-\u0A7F]/.test(value)) return 'pa'; // Punjabi (Gurmukhi)
  if (/[\u0B00-\u0B7F]/.test(value)) return 'or'; // Odia

  // Bengali/Assamese script share block
  if (/[\u0980-\u09FF]/.test(value)) {
    if (/[\u09F0\u09F1]/.test(value) || /(মই|কেনেকৈ|কেনেদৰে|ভিৰ)/i.test(value)) return 'as';
    return 'bn';
  }

  // Devanagari shared by Hindi/Marathi
  if (/[\u0900-\u097F]/.test(value)) {
    if (/(आहे|कृपया|कुठे|मदत|धन्यवाद|रांग)/i.test(value)) return 'mr';
    return 'hi';
  }

  // Romanized hints
  if (/\b(kaise|kya|bheed|rasta|madad|stadium)\b/i.test(value)) return 'hi';
  if (/\b(kothay|dhonnobad|gate|line|berono)\b/i.test(value)) return 'bn';
  if (/\b(vanakkam|enga|vazhi|udhavi)\b/i.test(value)) return 'ta';
  if (/\b(namaskaram|ekkada|daari|sahayam)\b/i.test(value)) return 'te';
  if (/\b(namaskara|elli|daari|sahaya)\b/i.test(value)) return 'kn';
  if (/\b(namaskaram|evide|vazhi|sahayam)\b/i.test(value)) return 'ml';
  if (/\b(kasa|kuthe|madat|rang)\b/i.test(value)) return 'mr';
  if (/\b(kem|kyan|madad|line)\b/i.test(value)) return 'gu';
  if (/\b(kiwe|kithon|madad|line)\b/i.test(value)) return 'pa';
  if (/\b(kemiti|kouthi|sahajya|line)\b/i.test(value)) return 'or';
  if (/\b(kenekoi|kune|sahay|bheer)\b/i.test(value)) return 'as';

  return fallback;
}

export default function AssistantPanel({ t, lang }) {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Welcome to StadiumAI Command Assistant. I provide real-time crowd guidance, fastest exit routing, concession wait times, and accessibility support.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([
      {
        role: 'bot',
        text: 'Conversation reset. How can I assist you with stadium directions or operations?'
      }
    ]);
  };

  const sendMessage = async (prompt) => {
    const text = (prompt ?? input).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const detectedLang = detectInputLanguage(text, lang);
      const reply = await askGemini({
        userPrompt: text,
        languageCode: detectedLang,
        systemPrompt: `You are StadiumAI assistant for a world-class stadium.
Give concise and practical recommendations for crowd movement.
Prioritize safety, fast routes, and low-queue options.
Keep reply direct and helpful (2-4 lines).
Always reply in the same language as the user's message.`
      });
      setMessages((prev) => [...prev, { role: 'bot', text: reply || 'No response received. Please try again.' }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', text: error.message || 'Service unavailable.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card assistant desktop-assistant-container" id="assistant">
      <div className="card-title-row">
        <div className="card-title">{t.chatTitle || 'Stadium AI Assistant'}</div>
        <button className="btn-ghost-sm" onClick={clearChat} title="Reset Conversation">
          Clear Chat
        </button>
      </div>

      <div className="chat-box" role="log" aria-live="polite" aria-label="Conversation with stadium assistant">
        {messages.map((msg, idx) => (
          <div key={`${msg.role}-${idx}`} className={`bubble ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="bubble bot dim">{t.typing || 'Analyzing venue telemetry...'}</div>}
        <div ref={chatBottomRef} />
      </div>

      <div className="chat-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={t.chatPlaceholder || 'Ask: shortest queue, fastest exit, medical station...'}
          aria-label="Assistant question input"
        />
        <button onClick={() => sendMessage()} disabled={loading} aria-label="Send message to assistant">
          {t.send || 'Send'}
        </button>
      </div>

      <div className="server-note">
        Connected to venue intelligence engine. Automatic multilingual recognition enabled.
      </div>

      <div className="quick-prompts-section">
        <span className="quick-label">Suggested Inquiries:</span>
        <div className="quick-list">
          {CATEGORIZED_PROMPTS.map((item) => (
            <button key={item.label} className="chip" onClick={() => sendMessage(item.prompt)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
