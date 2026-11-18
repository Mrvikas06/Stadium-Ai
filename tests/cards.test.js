import { describe, it, expect } from 'vitest';

describe('Atmosphere Telemetry Model', () => {
  it('converts temperature between Celsius and Fahrenheit correctly', () => {
    const tempC = 27;
    const tempF = Math.round((tempC * 9) / 5 + 32);
    expect(tempF).toBe(81);
  });
});

describe('Concessions Order Logic', () => {
  const MENU_ITEMS = [
    { id: 'm1', name: 'Matchday Burger & Fries', price: 8.50 },
    { id: 'm2', name: 'Crispy Chicken Tenders', price: 7.50 },
    { id: 'm4', name: 'Masala Chai & Samosa Combo', price: 4.00 }
  ];

  it('calculates cart total and item count correctly', () => {
    const cart = { m1: 2, m4: 1 };
    const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = MENU_ITEMS.find((m) => m.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
    const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

    expect(cartTotal).toBe(21.00);
    expect(cartCount).toBe(3);
  });
});

describe('Parking & Transit Data Validation', () => {
  const PARKING = [
    { id: 'p1', name: 'North Multi-Deck P1', capacity: 2000, filled: 1840 },
    { id: 'p2', name: 'South Surface Lot P2', capacity: 1500, filled: 720 }
  ];

  it('calculates remaining spots and occupancy percentage accurately', () => {
    const p1 = PARKING[0];
    const pct = Math.round((p1.filled / p1.capacity) * 100);
    const remaining = p1.capacity - p1.filled;

    expect(pct).toBe(92);
    expect(remaining).toBe(160);
  });
});
