export const formatCurrency = (value) => {
  if (value === undefined || value === null) return "₹0";
  const num = parseFloat(value);
  if (isNaN(num)) return `₹${value}`;
  return `₹${num.toLocaleString("en-IN")}`;
};

export const calculateCorpus = (formData) => {
  const years = parseInt(formData.yearsUntilRetirement, 10) || 30;
  const baseCorpus = (parseFloat(formData.requiredAnnualIncome) * 20) / 10000000 || 4.2;
  return Math.max(1.2, parseFloat(baseCorpus.toFixed(2)));
};

export const calculateReadinessScore = (formData) => {
  const totalSavings =
    (parseFloat(formData.epfTotalCorpus) || 0) +
    (parseFloat(formData.npsTotalCorpus) || 0) +
    (parseFloat(formData.superTotalCorpus) || 0);
  const scoreVal = Math.min(100, Math.round((totalSavings / 5000000) * 100));
  return scoreVal > 0 ? scoreVal : 72;
};

export const buildCalcPayload = (formData) => {
  const hasSpouse = !!(formData.spouseName && formData.spouseName.trim());
  const totalIncomeReq = parseFloat(formData.requiredAnnualIncome) || 1200000;

  const clientEpfAnnual = (
    (parseFloat(formData.epfEmployerShare) || 0) +
    (parseFloat(formData.epfEmployeeShare) || 0) +
    (parseFloat(formData.npsEmployerShare) || 0) +
    (parseFloat(formData.npsEmployeeShare) || 0) +
    (parseFloat(formData.superEmployerShare) || 0)
  ) * 12;

  const clientEpfAccum = (
    (parseFloat(formData.epfTotalCorpus) || 0) +
    (parseFloat(formData.npsTotalCorpus) || 0) +
    (parseFloat(formData.superTotalCorpus) || 0)
  );

  return {
    client_epf_annual: clientEpfAnnual,
    client_epf_accum: clientEpfAccum,
    client_annual_ret_reqd: hasSpouse ? totalIncomeReq * 0.6 : totalIncomeReq,
    spouse_epf_annual: hasSpouse ? 7200 : 0,
    spouse_epf_accum: 0,
    spouse_annual_ret_reqd: hasSpouse ? totalIncomeReq * 0.4 : 0,
    household_monthly: parseFloat(formData.monthlyExpense) || 30000,
  };
};
