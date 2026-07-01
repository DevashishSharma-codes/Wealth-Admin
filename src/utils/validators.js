export const validateStep1 = (formData) => {
  return !!(
    formData.mobile?.trim() &&
    formData.email?.trim() &&
    formData.address?.trim() &&
    formData.consent
  );
};

export const validateStep2 = (formData) => {
  return !!(
    formData.name?.trim() &&
    formData.occupation?.trim() &&
    formData.designation?.trim() &&
    formData.companyName?.trim() &&
    formData.dob?.trim() &&
    formData.monthlyExpense?.trim()
  );
};

export const validateStep3 = (childrenData, childrenCount) => {
  if (childrenCount === 0) return true;
  for (let i = 0; i < childrenCount; i++) {
    const child = childrenData[i];
    if (
      !child ||
      !child.name?.trim() ||
      !child.occupation?.trim() ||
      !child.dob?.trim() ||
      !child.goalType?.trim() ||
      !child.targetYear?.trim() ||
      !child.todaysCost?.trim()
    ) {
      return false;
    }
  }
  return true;
};

export const validateStep4 = (activeGoals) => {
  return true;
};
