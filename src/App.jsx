import { useEffect, useMemo, useState } from 'react';
import HeatmapCanvas from './components/HeatmapCanvas';
import AssistantPanel from './components/AssistantPanel';
import { defaultTranslations, loadTranslations } from './lib/i18n';

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'অসমীয়া' }
];

const SUPPORTED_LANGUAGE_CODES = new Set(LANGUAGE_OPTIONS.map((item) => item.code));

function sanitizeLanguage(code) {
  return SUPPORTED_LANGUAGE_CODES.has(code) ? code : 'en';
}

export const SCENARIOS = {
  live: {
    id: 'live',
    label: 'Standard Match Play',
    attendees: '68,420',
    occupancyPct: 91,
    wait: 4.2,
    noiseDb: 92,
    density: { N: 0.95, S: 0.66, E: 0.44, W: 0.62, NE: 0.79, NW: 0.82, SE: 0.53, SW: 0.39 },
    ticker: 'Live Match in progress • Gate 4 fastest exit • North Stand high volume • Concourse C monitored',
    queues: [
      { name: 'Food Court A', wait: 18, level: 'high' },
      { name: 'Food Court B', wait: 4, level: 'low' },
      { name: 'Restroom Block 1', wait: 9, level: 'medium' },
      { name: 'Restroom Block 2', wait: 2, level: 'low' },
      { name: 'Gate 1 (Main Entry)', wait: 14, level: 'high' },
      { name: 'Gate 4 (West Exit)', wait: 1, level: 'low' }
    ],
    alerts: [
      { id: 1, tone: 'danger', text: 'North Stand N3-N7 above 95% occupancy.' },
      { id: 2, tone: 'warn', text: 'Food Court A exceeds 15 min wait time.' },
      { id: 3, tone: 'safe', text: 'Corridor C2 congestion resolved successfully.' }
    ]
  },
  ingress: {
    id: 'ingress',
    label: 'Gates Opening (Ingress)',
    attendees: '41,850',
    occupancyPct: 56,
    wait: 8.5,
    noiseDb: 78,
    density: { N: 0.45, S: 0.38, E: 0.30, W: 0.35, NE: 0.85, NW: 0.88, SE: 0.40, SW: 0.35 },
    ticker: 'Entry Gates Open • Gate 1 experiencing surge (16m wait) • Recommend Gate 3 and Gate 4 for expedited bag check',
    queues: [
      { name: 'Gate 1 (Main Entry)', wait: 16, level: 'high' },
      { name: 'Gate 2 (East Concourse)', wait: 11, level: 'medium' },
      { name: 'Gate 3 (South Concourse)', wait: 3, level: 'low' },
      { name: 'Gate 4 (West Concourse)', wait: 2, level: 'low' },
      { name: 'Food Court A', wait: 3, level: 'low' },
      { name: 'Restroom Block 1', wait: 1, level: 'low' }
    ],
    alerts: [
      { id: 101, tone: 'warn', text: 'Gate 1 turnstile queue exceeding 15 minutes. Diverting fans to Gate 4.' },
      { id: 102, tone: 'safe', text: 'Security bag scanners operating at 100% capacity across all gates.' }
    ]
  },
  halftime: {
    id: 'halftime',
    label: 'Halftime Rush (Peak Concessions)',
    attendees: '73,200',
    occupancyPct: 97,
    wait: 12.8,
    noiseDb: 89,
    density: { N: 0.88, S: 0.84, E: 0.82, W: 0.79, NE: 0.94, NW: 0.96, SE: 0.89, SW: 0.75 },
    ticker: 'Halftime Intermission • Heavy rush at Food Court A (24m wait) • Use Food Court B or Level 2 express stations',
    queues: [
      { name: 'Food Court A', wait: 24, level: 'high' },
      { name: 'Food Court B', wait: 8, level: 'medium' },
      { name: 'Restroom Block 1', wait: 15, level: 'high' },
      { name: 'Restroom Block 2', wait: 9, level: 'medium' },
      { name: 'Concourse C Breezeway', wait: 6, level: 'medium' },
      { name: 'Gate 4 Concourse', wait: 2, level: 'low' }
    ],
    alerts: [
      { id: 201, tone: 'danger', text: 'Food Court A congestion exceeds 20 minutes. Additional staff deployed.' },
      { id: 202, tone: 'warn', text: 'Restroom Block 1 line extending into concourse walkway.' }
    ]
  },
  egress: {
    id: 'egress',
    label: 'Match Finished (Rapid Egress)',
    attendees: '62,100',
    occupancyPct: 83,
    wait: 5.1,
    noiseDb: 96,
    density: { N: 0.70, S: 0.55, E: 0.40, W: 0.45, NE: 0.65, NW: 0.72, SE: 0.50, SW: 0.35 },
    ticker: 'Match Concluded • All 4 perimeter exit gates unlocked • Gate 4 West offers quickest access to shuttle transit',
    queues: [
      { name: 'Gate 1 Egress', wait: 12, level: 'high' },
      { name: 'Gate 2 Egress', wait: 6, level: 'medium' },
      { name: 'Gate 3 Egress', wait: 4, level: 'low' },
      { name: 'Gate 4 West (Express)', wait: 1, level: 'low' },
      { name: 'Taxi / Rideshare Pickup', wait: 18, level: 'high' },
      { name: 'Train Station Walkway', wait: 7, level: 'medium' }
    ],
    alerts: [
      { id: 301, tone: 'safe', text: 'Emergency egress corridors fully open. Gate 4 flowing at 180 spectators/min.' },
      { id: 302, tone: 'warn', text: 'Rideshare lot queue active. Public transit metro running extra trains.' }
    ]
  }
};

const SvgIcon = ({ d, viewBox = "0 0 24 24" }) => (
  <svg viewBox={viewBox} className="icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

function StatCard({ label, value, sub, tone }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <div className={`stat-value ${tone}`}>{value}</div>
      <span className="stat-sub">{sub}</span>
    </div>
  );
}

function AccordionItem({ title, data, renderItem, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`accordion ${open ? 'open' : ''}`}>
      <div className="accordion-header" onClick={() => setOpen(!open)}>
        <h3>{title}</h3>
        <svg style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
      </div>
      <div className="accordion-body">
        <div className="accordion-content">
          {data.map(renderItem)}
        </div>
      </div>
    </div>
  );
}

export function calculateSmartRoute(fromLocation, targetSeat) {
  const seatUpper = (targetSeat || '').toUpperCase().trim();
  let stand = 'North';
  if (seatUpper.includes('SOUTH') || seatUpper.startsWith('S')) stand = 'South';
  else if (seatUpper.includes('EAST') || seatUpper.startsWith('E')) stand = 'East';
  else if (seatUpper.includes('WEST') || seatUpper.startsWith('W')) stand = 'West';
  else if (seatUpper.includes('NORTH') || seatUpper.startsWith('N')) stand = 'North';

  let path = '';
  let eta = '3 mins';
  let status = 'Optimal route computed.';

  switch (stand) {
    case 'South':
      path = `${fromLocation} → Concourse A → South Lower Walkway → South Stand`;
      eta = '2.5 mins';
      status = 'Low crowd zone. Rapid transit via Concourse A.';
      break;
    case 'East':
      path = `${fromLocation} → Concourse B → East Stand Escalator 2 → East Stand`;
      eta = '3.5 mins';
      status = 'Bypasses Food Court A congestion via Level 2 breezeway.';
      break;
    case 'West':
      path = `${fromLocation} → Concourse D → Gate 4 Breezeway → West Stand`;
      eta = '2 mins';
      status = 'Fastest flow path. West concourse has minimum queue.';
      break;
    case 'North':
    default:
      path = `${fromLocation} → Concourse C → Ramp N2 → North Stand`;
      eta = '4 mins';
      status = 'North concourse active (>95%). Ramp N2 avoids central stairway bottleneck.';
      break;
  }

  return { path, eta, status, stand };
}

export default function App() {
  const [lang, setLang] = useState(() => sanitizeLanguage(localStorage.getItem('stadium_lang')));
  const [dict, setDict] = useState(defaultTranslations.en);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scenarioKey, setScenarioKey] = useState('live');
  const [fromLocation, setFromLocation] = useState('Current Location');
  const [seatInput, setSeatInput] = useState('');
  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const scenario = SCENARIOS[scenarioKey] || SCENARIOS.live;
  const [alerts, setAlerts] = useState(scenario.alerts);

  useEffect(() => {
    setAlerts(scenario.alerts);
  }, [scenarioKey]);

  function handleRoutePlanner(e) {
    e.preventDefault();
    if (!seatInput.trim()) return;
    setRouteLoading(true);
    setRouteResult(null);

    setTimeout(() => {
      setRouteLoading(false);
      const computed = calculateSmartRoute(fromLocation, seatInput);
      setRouteResult({
        path: computed.path,
        eta: computed.eta,
        status: computed.status,
        stand: computed.stand,
        seat: seatInput.trim()
      });
    }, 500);
  }

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter(a => a.id !== id));
  };

  useEffect(() => {
    let mounted = true;
    loadTranslations(lang).then((tr) => {
      if (!mounted) return;
      setDict({ ...defaultTranslations.en, ...tr });
      localStorage.setItem('stadium_lang', lang);
    });
    return () => {
      mounted = false;
    };
  }, [lang]);

  const t = useMemo(() => ({ ...defaultTranslations.en, ...dict }), [dict]);

  return (
    <div className="app-shell pb-nav">
      {/* Sticky Header with Desktop & Mobile Navigation */}
      <header className="topbar">
        <div className="topbar-content">
          <div className="brand-section">
            <h1 className="brand-title">{t.title || 'StadiumAI Operations Hub'}</h1>
            <span className="brand-badge">Command Center</span>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="desktop-nav" role="tablist" aria-label="Desktop main navigation">
            <button
              className={`desktop-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              role="tab"
              aria-selected={activeTab === 'dashboard'}
            >
              <SvgIcon d="M3 3v18h18 M9 15l3-3 4 4 5-5" />
              <span>{t.dashboard || 'Dashboard'}</span>
            </button>
            <button
              className={`desktop-nav-btn ${activeTab === 'navigate' ? 'active' : ''}`}
              onClick={() => setActiveTab('navigate')}
              role="tab"
              aria-selected={activeTab === 'navigate'}
            >
              <SvgIcon d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
              <span>{t.navigate || 'Navigate'}</span>
            </button>
            <button
              className={`desktop-nav-btn ${activeTab === 'assistant' ? 'active' : ''}`}
              onClick={() => setActiveTab('assistant')}
              role="tab"
              aria-selected={activeTab === 'assistant'}
            >
              <SvgIcon d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              <span>{t.assistant || 'AI Assistant'}</span>
            </button>
          </nav>

          <div className="topbar-right">
            <select
              className="select-input"
              value={lang}
              onChange={(e) => setLang(sanitizeLanguage(e.target.value))}
              aria-label="Language selection"
            >
              {LANGUAGE_OPTIONS.map((item) => (
                <option key={item.code} value={item.code}>{item.label}</option>
              ))}
            </select>
            <span className="live-pill" role="status" aria-live="polite">● {t.live || 'Live'}</span>
          </div>
        </div>
      </header>

      {/* Info Ticker */}
      <div className="ticker-wrapper">
        <div className="marquee-text">
          <span>{scenario.ticker}</span>
        </div>
      </div>

      <main className="main-content">
        {/* INTERACTIVE SCENARIO SIMULATOR STRIP */}
        <section className="scenario-bar" aria-label="Event scenario simulator">
          <span className="scenario-label">Scenario Mode:</span>
          <div className="scenario-pills">
            {Object.values(SCENARIOS).map((s) => (
              <button
                key={s.id}
                className={`scenario-pill ${scenarioKey === s.id ? 'active' : ''}`}
                onClick={() => setScenarioKey(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="tab-view fade-slide-in">
            <section className="stats-grid">
              <StatCard label="Total Attendees" value={scenario.attendees} sub={`of 75,000 capacity (${scenario.occupancyPct}%)`} tone="ok" />
              <StatCard label="Avg Concourse Wait" value={`${scenario.wait}m`} sub="dynamic live sensor" tone={scenario.wait > 10 ? 'danger' : scenario.wait > 5 ? 'warn' : 'ok'} />
              <StatCard label="Stadium Sound Level" value={`${scenario.noiseDb} dB`} sub={scenario.noiseDb > 90 ? 'High Crowd Energy' : 'Moderate Volume'} tone="accent" />
              <StatCard label="Active Alerts" value={String(alerts.length)} sub="real-time safety feed" tone={alerts.length > 2 ? 'danger' : 'warn'} />
            </section>

            <div className="desktop-two-col">
              {/* Left Column: Live Interactive Density Map */}
              <article className="card map-card">
                <div className="title-row">
                  <h2>{t.densityMap || 'Live Crowd Density Map'}</h2>
                  <span className="live-text">Real-Time Sensor Feed</span>
                </div>
                <HeatmapCanvas densityData={scenario.density} activeRoute={routeResult} />
                <div className="legend">
                  <span><i className="low" /> Low (&lt;40%)</span>
                  <span><i className="med" /> Medium (40-70%)</span>
                  <span><i className="high" /> High (&gt;70%)</span>
                  <span><i className="gate" /> Turnstiles</span>
                </div>
              </article>

              {/* Right Column: Venue Occupancy + Queues + Alerts */}
              <div>
                <article className="card occupancy-card">
                  <h2>{t.occupancy || 'Venue Occupancy & Stand Flow'}</h2>
                  <div className="ring-wrap">
                    <div className="ring-border">
                      <span className="ring-val">{scenario.occupancyPct}<small>%</small></span>
                    </div>
                  </div>
                  <div className="pill-grid">
                    <span className={`pill ${scenario.density.N > 0.7 ? 'high' : scenario.density.N > 0.4 ? 'med' : 'low'}`}>
                      North Stand {Math.round(scenario.density.N * 100)}%
                    </span>
                    <span className={`pill ${scenario.density.S > 0.7 ? 'high' : scenario.density.S > 0.4 ? 'med' : 'low'}`}>
                      South Stand {Math.round(scenario.density.S * 100)}%
                    </span>
                    <span className={`pill ${scenario.density.E > 0.7 ? 'high' : scenario.density.E > 0.4 ? 'med' : 'low'}`}>
                      East Stand {Math.round(scenario.density.E * 100)}%
                    </span>
                    <span className={`pill ${scenario.density.W > 0.7 ? 'high' : scenario.density.W > 0.4 ? 'med' : 'low'}`}>
                      West Stand {Math.round(scenario.density.W * 100)}%
                    </span>
                  </div>
                </article>

                <article className="card mt-3">
                  <AccordionItem
                    title={t.queueTimes || 'Real-Time Concourse Queues'}
                    data={scenario.queues}
                    renderItem={(q) => (
                      <div className="queue-row" key={q.name}>
                        <span className="queue-name">{q.name}</span>
                        <div className="bar">
                          <div className={`fill ${q.level}`} style={{ width: `${Math.min(100, q.wait * 5)}%` }} />
                        </div>
                        <strong>{q.wait}m</strong>
                      </div>
                    )}
                  />
                </article>

                <article className="card mt-3">
                  <AccordionItem
                    title={`${t.alerts || 'Active Safety Alerts'} (${alerts.length})`}
                    data={alerts}
                    renderItem={(a) => (
                      <div key={a.id} className={`alert ${a.tone}`} style={{ justifyContent: 'space-between' }}>
                        <span>{a.text}</span>
                        <button
                          className="btn-ghost-sm"
                          style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                          onClick={() => dismissAlert(a.id)}
                          title="Acknowledge alert"
                        >
                          Acknowledge
                        </button>
                      </div>
                    )}
                  />
                </article>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATE (OCCUPANCY & ROUTE) TAB */}
        {activeTab === 'navigate' && (
          <div className="tab-view fade-slide-in">
            <div className="desktop-two-col">
              {/* Left Column: Smart Route Planner */}
              <div>
                <article className="card">
                  <h2>{t.routePlanner || 'Smart Crowd-Aware Route Planner'}</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Calculates optimal stadium concourse transit by continuously factoring live gate bottlenecks and stand congestion.
                  </p>
                  <form className="route-form" onSubmit={handleRoutePlanner}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Starting Point:</label>
                      <select
                        className="input-field"
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                      >
                        <option value="Current Location">From: Current Location</option>
                        <option value="Gate 1 (Main)">From: Gate 1 (Main Concourse)</option>
                        <option value="Gate 2 (East)">From: Gate 2 (East Concourse)</option>
                        <option value="Gate 3 (South)">From: Gate 3 (South Concourse)</option>
                        <option value="Gate 4 (West)">From: Gate 4 (West Concourse)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Destination Seat / Stand Block:</label>
                      <input
                        className="input-field"
                        placeholder="e.g. North Stand N5, South S2, West W4-R10, East E1"
                        value={seatInput}
                        onChange={(e) => setSeatInput(e.target.value)}
                        required
                      />
                    </div>

                    <button className="btn-primary" type="submit" disabled={routeLoading}>
                      {routeLoading ? 'Optimizing route path...' : (t.routePlanner || "Calculate Optimal Route")}
                    </button>
                  </form>

                  {routeResult && (
                    <div className="alert safe" style={{ marginTop: '16px', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '1.05rem' }}>Estimated Time: {routeResult.eta}</strong>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46' }}>Target: {routeResult.stand} Stand</span>
                      </div>
                      <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.85)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)', width: '100%', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
                        {routeResult.path}
                      </div>
                      <small style={{ fontWeight: 600, color: '#047857' }}>{routeResult.status} (Visualized on map)</small>
                    </div>
                  )}
                </article>

                <article className="card mt-3">
                  <h2>Accessibility & Wayfinding Guide</h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div><strong>Wheelchair Access:</strong> Elevator 2 (East Concourse) and Ramp S1 (South Stand) provide barrier-free transit.</div>
                    <div><strong>First Aid:</strong> Station 1 located at Concourse Level 1 near Gate 2. Paramedics stationed at North Stand aisle 4.</div>
                    <div><strong>Concessions:</strong> Food Court B has 4-minute wait times vs 18 minutes at Food Court A.</div>
                  </div>
                </article>
              </div>

              {/* Right Column: Interactive Map with Pathfinding visualizer */}
              <div>
                <article className="card map-card">
                  <div className="title-row">
                    <h2>Route Map Navigation</h2>
                    <span className="live-text">Live Wayfinding</span>
                  </div>
                  <HeatmapCanvas densityData={scenario.density} activeRoute={routeResult} />
                </article>

                <article className="card mt-3">
                  <AccordionItem
                    title={t.queueTimes || 'Turnstile & Concession Times'}
                    data={scenario.queues}
                    renderItem={(q) => (
                      <div className="queue-row" key={q.name}>
                        <span className="queue-name">{q.name}</span>
                        <div className="bar">
                          <div className={`fill ${q.level}`} style={{ width: `${Math.min(100, q.wait * 5)}%` }} />
                        </div>
                        <strong>{q.wait}m</strong>
                      </div>
                    )}
                  />
                </article>
              </div>
            </div>
          </div>
        )}

        {/* ASSISTANT AGENT TAB */}
        {activeTab === 'assistant' && (
          <div className="tab-view fade-slide-in">
            <div className="desktop-assistant-col">
              {/* Left Column: Telemetry & Assistance Shortcuts */}
              <div className="card">
                <h2>Operations Support</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Fastest Exit:</strong>
                    <span>Gate 4 (West Concourse) - Under 1 min delay</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Fast Dining:</strong>
                    <span>Food Court B (4 min queue)</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Emergency Station:</strong>
                    <span>First Aid 1 at Gate 2 Concourse</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Current Scenario:</strong>
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{scenario.label}</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Multilingual Engine:</strong>
                    <span>Supports 13 languages with automated script recognition.</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Full Chat Interface */}
              <AssistantPanel t={t} lang={lang} />
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Nav for Mobile Screens */}
      <nav className="bottom-nav glass-nav" role="tablist" aria-label="Mobile navigation tabs">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          role="tab"
          aria-selected={activeTab === 'dashboard'}
          aria-label="Dashboard Tab"
        >
          <SvgIcon d="M3 3v18h18 M9 15l3-3 4 4 5-5" />
          <span>Dashboard</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'navigate' ? 'active' : ''}`}
          onClick={() => setActiveTab('navigate')}
          role="tab"
          aria-selected={activeTab === 'navigate'}
          aria-label="Navigate Tab"
        >
          <SvgIcon d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
          <span>Navigate</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'assistant' ? 'active' : ''}`}
          onClick={() => setActiveTab('assistant')}
          role="tab"
          aria-selected={activeTab === 'assistant'}
          aria-label="AI Assistant Tab"
        >
          <SvgIcon d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          <span>Agent</span>
        </button>
      </nav>
    </div>
  );
}
