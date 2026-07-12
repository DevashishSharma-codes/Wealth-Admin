import { validateStep1, validateStep2, validateStep3, validateStep4 } from './validators';

describe('validators - Wealth-Admin', () => {
  test('validateStep1 should return true', () => {
    expect(validateStep1({})).toBe(true);
    expect(validateStep1({ name: 'John' })).toBe(true);
  });

  test('validateStep2 should return true', () => {
    expect(validateStep2({})).toBe(true);
    expect(validateStep2({ income: 50000 })).toBe(true);
  });

  test('validateStep3 should return true', () => {
    expect(validateStep3([], 0)).toBe(true);
    expect(validateStep3([{ name: 'Kid' }], 1)).toBe(true);
  });

  test('validateStep4 should return true', () => {
    expect(validateStep4([])).toBe(true);
    expect(validateStep4(['Goal1', 'Goal2'])).toBe(true);
  });
});
