import { useState } from 'react';

const INITIAL_PARKING = [
  { id: 'p1', name: 'North Multi-Deck P1', capacity: 2000, filled: 1840, status: 'Nearly Full' },
  { id: 'p2', name: 'South Surface Lot P2', capacity: 1500, filled: 720, status: 'Open / Flowing' },
  { id: 'p3', name: 'West Accessible & VIP P3', capacity: 350, filled: 280, status: 'Spots Limited' }
];

const INITIAL_TRANSIT = [
  { id: 't1', route: 'Metro Blue Line (Platform 1)', eta: '3 mins', frequency: 'Every 5 mins', status: 'On Time' },
  { id: 't2', route: 'Stadium Express Bus (Gate 4 Bay)', eta: '2 mins', frequency: 'Continuous Shuttle', status: 'Boarding' },
  { id: 't3', route: 'Rideshare Pickup (Bay 2 West)', eta: '7-9 mins', frequency: 'On Demand', status: 'Active Queue' }
];

export default function ParkingTransitCard() {
  const [parking, setParking] = useState(INITIAL_PARKING);
  const [transit] = useState(INITIAL_TRANSIT);
  const [refreshed, setRefreshed] = useState(false);

  const handleRefresh = () => {
    setRefreshed(true);
    setParking((prev) =>
      prev.map((p) => {
        const change = Math.floor((Math.random() - 0.5) * 15);
        const newFilled = Math.max(100, Math.min(p.capacity - 10, p.filled + change));
        return {
          ...p,
          filled: newFilled,
          status: newFilled / p.capacity > 0.85 ? 'Nearly Full' : 'Open / Flowing'
        };
      })
    );
    setTimeout(() => setRefreshed(false), 800);
  };

  return (
    <article className="card parking-transit-card">
      <div className="card-title-row">
        <h2>Parking Decks & Public Transit</h2>
        <button className="btn-ghost-sm" onClick={handleRefresh} disabled={refreshed}>
          {refreshed ? 'Updating...' : 'Refresh Sensors'}
        </button>
      </div>

      <div className="parking-section">
        <h4 className="subcard-title">Live Parking Deck Capacity</h4>
        <div className="parking-grid">
          {parking.map((p) => {
            const pct = Math.round((p.filled / p.capacity) * 100);
            const remaining = p.capacity - p.filled;
            const isHigh = pct >= 85;
            return (
              <div key={p.id} className="parking-item">
                <div className="parking-header">
                  <span className="parking-name">{p.name}</span>
                  <span className={`parking-badge ${isHigh ? 'high' : 'ok'}`}>{pct}% Full</span>
                </div>
                <div className="bar mt-2">
                  <div
                    className={`fill ${isHigh ? 'high' : pct > 60 ? 'medium' : 'low'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="parking-footer">
                  <span><strong>{remaining}</strong> spots remaining</span>
                  <small>{p.status}</small>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="transit-section mt-3">
        <h4 className="subcard-title">Shuttle & Transit Departures</h4>
        <div className="transit-list">
          {transit.map((t) => (
            <div key={t.id} className="transit-row">
              <div className="transit-info">
                <span className="transit-name">{t.route}</span>
                <span className="transit-sub">{t.frequency}</span>
              </div>
              <div className="transit-eta-box">
                <span className="transit-eta">{t.eta}</span>
                <span className="transit-status">{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
