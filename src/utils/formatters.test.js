import { formatCurrency, calculateCorpus, calculateReadinessScore, buildCalcPayload } from './formatters';

describe('formatters - Wealth-Admin', () => {
  describe('formatCurrency', () => {
    test('should return ₹0 when value is undefined or null', () => {
      expect(formatCurrency(undefined)).toBe('₹0');
      expect(formatCurrency(null)).toBe('₹0');
    });

    test('should return input prefixed with ₹ when input is not a number', () => {
      expect(formatCurrency('abc')).toBe('₹abc');
    });

    test('should format numbers according to en-IN locale format', () => {
      expect(formatCurrency(100000)).toBe('₹1,00,000');
      expect(formatCurrency('2500000')).toBe('₹25,00,000');
      expect(formatCurrency(500)).toBe('₹500');
    });
  });

  describe('calculateCorpus', () => {
    test('should calculate correct corpus when values are provided', () => {
      const formData = {
        yearsUntilRetirement: '25',
        requiredAnnualIncome: '1500000',
      };
      // (1,500,000 * 20) / 10,000,000 = 3.0
      expect(calculateCorpus(formData)).toBe(3);
    });

    test('should return default fallback value of 4.2 when form data is empty', () => {
      expect(calculateCorpus({})).toBe(4.2);
    });

    test('should clamp the corpus to a minimum of 1.2', () => {
      const formData = {
        yearsUntilRetirement: '30',
        requiredAnnualIncome: '200000', // (200,000 * 20) / 10,000,000 = 0.4
      };
      expect(calculateCorpus(formData)).toBe(1.2);
    });
  });

  describe('calculateReadinessScore', () => {
    test('should calculate readiness score correctly based on total savings', () => {
      const formData = {
        epfTotalCorpus: '1000000',
        npsTotalCorpus: '1000000',
        superTotalCorpus: '500000',
      }; // total = 2.5M. score = (2.5M / 5M) * 100 = 50
      expect(calculateReadinessScore(formData)).toBe(50);
    });

    test('should cap readiness score at 100', () => {
      const formData = {
        epfTotalCorpus: '4000000',
        npsTotalCorpus: '2000000',
        superTotalCorpus: '0',
      }; // total = 6M. score capped at 100
      expect(calculateReadinessScore(formData)).toBe(100);
    });

    test('should default to 72 if score calculation is 0', () => {
      expect(calculateReadinessScore({})).toBe(72);
    });
  });

  describe('buildCalcPayload', () => {
    test('should construct correct payload without a spouse', () => {
      const formData = {
        requiredAnnualIncome: '1000000',
        epfEmployerShare: '5000',
        epfEmployeeShare: '5000',
        npsEmployerShare: '2000',
        npsEmployeeShare: '2000',
        superEmployerShare: '1000',
        epfTotalCorpus: '500000',
        npsTotalCorpus: '300000',
        superTotalCorpus: '200000',
        monthlyExpense: '40000',
      };

      const expected = {
        client_epf_annual: (5000 + 5000 + 2000 + 2000 + 1000) * 12, // 15000 * 12 = 180000
        client_epf_accum: 500000 + 300000 + 200000, // 1000000
        client_annual_ret_reqd: 1000000,
        spouse_epf_annual: 0,
        spouse_epf_accum: 0,
        spouse_annual_ret_reqd: 0,
        household_monthly: 40000,
      };

      expect(buildCalcPayload(formData)).toEqual(expected);
    });

    test('should construct correct payload with a spouse', () => {
      const formData = {
        spouseName: 'Jane Doe',
        requiredAnnualIncome: '1000000',
        epfEmployerShare: '5000',
        epfEmployeeShare: '5000',
        epfTotalCorpus: '500000',
        monthlyExpense: '40000',
      };

      const expected = {
        client_epf_annual: (5000 + 5000) * 12, // 120000
        client_epf_accum: 500000,
        client_annual_ret_reqd: 1000000 * 0.6, // 600000
        spouse_epf_annual: 7200,
        spouse_epf_accum: 0,
        spouse_annual_ret_reqd: 1000000 * 0.4, // 400000
        household_monthly: 40000,
      };

      expect(buildCalcPayload(formData)).toEqual(expected);
    });

    test('should use fallbacks when formData properties are missing', () => {
      const payload = buildCalcPayload({});
      expect(payload.client_annual_ret_reqd).toBe(1200000);
      expect(payload.household_monthly).toBe(30000);
      expect(payload.spouse_epf_annual).toBe(0);
    });
  });
});
