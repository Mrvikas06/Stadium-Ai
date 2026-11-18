import { useState } from 'react';

const MENU_ITEMS = [
  { id: 'm1', name: 'Matchday Burger & Fries', price: 8.50, stall: 'Food Court B', wait: '4 min (Fastest)', popular: true },
  { id: 'm2', name: 'Crispy Chicken Tenders', price: 7.50, stall: 'Food Court B', wait: '3 min', popular: false },
  { id: 'm3', name: 'Wood-Fired Pizza Slice', price: 5.50, stall: 'Food Court A', wait: '18 min (High)', popular: false },
  { id: 'm4', name: 'Masala Chai & Samosa Combo', price: 4.00, stall: 'Food Court B Express', wait: '2 min', popular: true },
  { id: 'm5', name: 'Cold Pressed Lemonade', price: 3.50, stall: 'Express Kiosk 3', wait: 'Instant', popular: false }
];

export default function ConcessionsCard() {
  const [cart, setCart] = useState({});
  const [activeOrder, setActiveOrder] = useState(null);

  const addToCart = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 1) {
        next[id] -= 1;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = MENU_ITEMS.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const placeOrder = () => {
    if (cartCount === 0) return;
    const orderNum = Math.floor(100 + Math.random() * 900);
    setActiveOrder({
      id: `STAD-${orderNum}`,
      eta: '4-6 mins',
      pickupLocation: 'Food Court B - Express Counter 2 (Concourse Level 1, near Gate 4)',
      total: cartTotal.toFixed(2),
      itemsCount: cartCount
    });
    setCart({});
  };

  return (
    <article className="card concessions-card">
      <div className="card-title-row">
        <h2>Express Mobile Concession Ordering</h2>
        <span className="live-text">Live Kitchen Feed</span>
      </div>
      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
        Skip concourse lines by placing mobile pre-orders directly for express pickup counters.
      </p>

      {activeOrder ? (
        <div className="order-confirmation-card">
          <div className="order-badge">Order Confirmed</div>
          <h3 className="order-number">Order #{activeOrder.id}</h3>
          <p className="order-eta">Estimated Ready Time: <strong>{activeOrder.eta}</strong></p>
          <div className="order-pickup-box">
            <span className="pickup-label">Pickup Point:</span>
            <span className="pickup-val">{activeOrder.pickupLocation}</span>
          </div>
          <div className="order-summary-row">
            <span>Total Paid: ${activeOrder.total} ({activeOrder.itemsCount} items)</span>
            <button className="btn-ghost-sm" onClick={() => setActiveOrder(null)}>
              New Order
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="menu-list">
            {MENU_ITEMS.map((item) => {
              const qty = cart[item.id] || 0;
              return (
                <div key={item.id} className="menu-row">
                  <div className="menu-info">
                    <span className="menu-name">
                      {item.name}
                      {item.popular && <span className="popular-badge">Fast-Lane</span>}
                    </span>
                    <span className="menu-sub">
                      ${item.price.toFixed(2)} • {item.stall} • <strong style={{ color: item.wait.includes('Fast') ? 'var(--ok)' : item.wait.includes('High') ? 'var(--danger)' : 'var(--warn)' }}>{item.wait}</strong>
                    </span>
                  </div>

                  <div className="menu-actions">
                    {qty > 0 ? (
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => removeFromCart(item.id)}>−</button>
                        <span className="qty-val">{qty}</span>
                        <button className="qty-btn" onClick={() => addToCart(item.id)}>+</button>
                      </div>
                    ) : (
                      <button className="btn-add-item" onClick={() => addToCart(item.id)}>
                        Add +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {cartCount > 0 && (
            <div className="cart-checkout-bar">
              <div>
                <span className="cart-summary-text">{cartCount} items selected</span>
                <strong className="cart-total-text">Total: ${cartTotal.toFixed(2)}</strong>
              </div>
              <button className="btn-primary" onClick={placeOrder}>
                Place Mobile Pre-Order
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
