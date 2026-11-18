import { describe, it, expect } from 'vitest';
import { calculateSmartRoute } from '../src/App.jsx';
import { detectInputLanguage } from '../src/components/AssistantPanel.jsx';

describe('Smart Route Planner Algorithm', () => {
  it('calculates optimal path to North Stand', () => {
    const res = calculateSmartRoute('Gate 1 (Main)', 'N5-R12-S24');
    expect(res.stand).toBe('North');
    expect(res.path).toContain('Concourse C');
    expect(res.path).toContain('North Stand');
    expect(res.eta).toBe('4 mins');
  });

  it('calculates optimal path to South Stand', () => {
    const res = calculateSmartRoute('Gate 2 (East)', 'South Block S2');
    expect(res.stand).toBe('South');
    expect(res.path).toContain('South Lower Walkway');
    expect(res.eta).toBe('2.5 mins');
  });

  it('calculates optimal path to East Stand', () => {
    const res = calculateSmartRoute('Current Location', 'East Stand Row 5');
    expect(res.stand).toBe('East');
    expect(res.path).toContain('East Stand Escalator 2');
    expect(res.eta).toBe('3.5 mins');
  });

  it('calculates optimal path to West Stand', () => {
    const res = calculateSmartRoute('Gate 4 (West)', 'West Stand W3');
    expect(res.stand).toBe('West');
    expect(res.path).toContain('Gate 4 Breezeway');
    expect(res.eta).toBe('2 mins');
  });
});

describe('Language Heuristic Detection', () => {
  it('detects Hindi in Devanagari script', () => {
    expect(detectInputLanguage('कहाँ है शौचालय?')).toBe('hi');
  });

  it('detects Tamil script', () => {
    expect(detectInputLanguage('உதவி எங்கே கிடைக்கும்?')).toBe('ta');
  });

  it('detects Bengali script', () => {
    expect(detectInputLanguage('গেট কোথায়?')).toBe('bn');
  });

  it('detects Telugu script', () => {
    expect(detectInputLanguage('దారి ఎక్కడ?')).toBe('te');
  });

  it('falls back to default language for standard English', () => {
    expect(detectInputLanguage('Where is the nearest medical booth?', 'en')).toBe('en');
  });
});
