import { useState } from 'react';

export default function AtmosphereCard() {
  const [unit, setUnit] = useState('C');

  const tempC = 27;
  const tempF = Math.round((tempC * 9) / 5 + 32);

  return (
    <article className="card atmosphere-card">
      <div className="card-title-row">
        <h2>Stadium Atmosphere & Weather</h2>
        <button
          className="btn-ghost-sm"
          onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
          title="Toggle Temperature Unit"
        >
          °{unit === 'C' ? 'F' : 'C'}
        </button>
      </div>

      <div className="atmosphere-grid">
        <div className="atmosphere-item primary">
          <span className="atmo-label">Ambient Temp</span>
          <div className="atmo-val">
            {unit === 'C' ? `${tempC}°C` : `${tempF}°F`}
            <span className="atmo-sub">Partly Clear</span>
          </div>
        </div>

        <div className="atmosphere-item">
          <span className="atmo-label">Pitch Wind</span>
          <div className="atmo-val-sm">14 km/h</div>
          <span className="atmo-sub">NW Cross-Breeze</span>
        </div>

        <div className="atmosphere-item">
          <span className="atmo-label">Humidity</span>
          <div className="atmo-val-sm">54%</div>
          <span className="atmo-sub">Optimal Comfort</span>
        </div>

        <div className="atmosphere-item">
          <span className="atmo-label">UV Index</span>
          <div className="atmo-val-sm text-warn">6 (Moderate)</div>
          <span className="atmo-sub">East Stand Sunlit</span>
        </div>

        <div className="atmosphere-item">
          <span className="atmo-label">Air Quality</span>
          <div className="atmo-val-sm text-ok">AQI 36</div>
          <span className="atmo-sub">Good / Clean</span>
        </div>

        <div className="atmosphere-item">
          <span className="atmo-label">Retractable Roof</span>
          <div className="atmo-val-sm text-accent">Open (100%)</div>
          <span className="atmo-sub">Natural Ventilation</span>
        </div>
      </div>

      <div className="atmosphere-advisory">
        <strong>Fan Comfort Advisory:</strong> Hydration stations in Concourse C offer complimentary ice water. Sunscreen available at First Aid Stations 1 & 2.
      </div>
    </article>
  );
}
