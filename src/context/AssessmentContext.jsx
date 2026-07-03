import React, { createContext, useState, useContext } from "react";
import * as assessmentService from "../services/assessmentService";
import * as reportService from "../services/reportService";
import { buildCalcPayload } from "../utils/formatters";

export const AssessmentContext = createContext(null);

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
};

const initialFormData = {
  mobile: "",
  email: "",
  spouseMobile: "",
  spouseEmail: "",
  address: "",
  consent: false,
  name: "",
  occupation: "",
  designation: "",
  companyName: "",
  dob: "",
  monthlyExpense: "",
  spouseName: "",
  spouseOccupation: "",
  spouseDesignation: "",
  spouseCompanyName: "",
  spouseDob: "",
  targetRetireAge: "60",
  yearsUntilRetirement: "19",
  requiredAnnualIncome: "",
  epfEmployerShare: "",
  epfEmployeeShare: "",
  epfTotalCorpus: "",
  npsEmployerShare: "",
  npsEmployeeShare: "",
  npsTotalCorpus: "",
  superEmployerShare: "",
  superTotalCorpus: "",
};

const initialChildren = [
  { name: "", occupation: "", dependent: "Yes", dob: "", age: "", goalType: "", targetYear: "", todaysCost: "" },
  { name: "", occupation: "", dependent: "Yes", dob: "", age: "", goalType: "", targetYear: "", todaysCost: "" },
  { name: "", occupation: "", dependent: "Yes", dob: "", age: "", goalType: "", targetYear: "", todaysCost: "" },
  { name: "", occupation: "", dependent: "Yes", dob: "", age: "", goalType: "", targetYear: "", todaysCost: "" },
];

const initialGoals = [];

export default function AssessmentProvider({ children }) {
  const [step, setStep] = useState(1);
  const [assessmentId, setAssessmentId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [childrenCount, setChildrenCountState] = useState(0);
  const [childrenData, setChildrenData] = useState(initialChildren);
  const [activeGoals, setActiveGoals] = useState(initialGoals);
  const [calculationResult, setCalculationResult] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [apiError, setApiError] = useState(null);

  const resetAssessment = () => {
    setStep(1);
    setAssessmentId(null);
    setFormData(initialFormData);
    setChildrenCountState(0);
    setChildrenData(initialChildren);
    setActiveGoals(initialGoals);
    setCalculationResult(null);
    setReportId(null);
    setShowReport(false);
    setApiError(null);
  };

  const updateFormData = (fields) => {
    setFormData((prev) => {
      const updated = { ...prev, ...fields };

      // Auto calculate years until retirement when targetRetireAge or dob changes
      if (fields.hasOwnProperty("targetRetireAge") || fields.hasOwnProperty("dob")) {
        const retireAgeVal = parseInt(updated.targetRetireAge, 10);
        if (updated.dob) {
          const parts = updated.dob.split("/");
          if (parts.length === 3) {
            const birthYear = parseInt(parts[2], 10);
            const currentYear = new Date().getFullYear();
            const currentAge = currentYear - birthYear;
            if (!isNaN(retireAgeVal) && !isNaN(currentAge)) {
              updated.yearsUntilRetirement = String(Math.max(0, retireAgeVal - currentAge));
            }
          }
        }
      }
      return updated;
    });
  };

  const updateChild = (index, fields) => {
    setChildrenData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...fields };

      if (fields.hasOwnProperty("dob") && fields.dob) {
        const parts = fields.dob.split("/");
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          const currentYear = new Date().getFullYear();
          if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900 && year <= currentYear) {
            const birthDate = new Date(year, month, day);
            const today = new Date();
            let ageVal = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              ageVal--;
            }
            updated[index].age = ageVal >= 0 ? `${ageVal} Years` : "0 Years";
          } else {
            updated[index].age = "";
          }
        } else {
          updated[index].age = "";
        }
      }
      return updated;
    });
  };

  const setChildrenCount = (n) => {
    setChildrenCountState(n);
  };

  const addGoal = (type) => {
    const newGoal = {
      id: Date.now() + Math.random(),
      type,
      targetYear: "",
      todaysCost: "",
    };
    setActiveGoals((prev) => [...prev, newGoal]);
  };

  const removeGoal = (id) => {
    setActiveGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const updateGoal = (id, fields) => {
    setActiveGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...fields } : g))
    );
  };

  const goToStep = (n) => {
    setStep(n);
    if (n < 5) {
      setShowReport(false);
      setReportId(null);
    }
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const ensureAssessmentId = async () => {
    let currentId = assessmentId;
    if (!currentId) {
      try {
        const createRes = await assessmentService.createAssessment();
        currentId = createRes.data?.assessment_id || createRes.assessment_id;
        setAssessmentId(currentId);
      } catch (e) {
        console.error("createAssessment failed:", e);
        throw new Error("Failed to initialize assessment on the server. Please check connection.");
      }
    }
    return currentId;
  };

  const submitStep1 = async () => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const currentId = await ensureAssessmentId();
      const payload = {
        mobile: formData.mobile || "",
        email: formData.email || "",
        consent: !!formData.consent,
      };
      if (formData.spouseMobile && formData.spouseMobile.trim()) {
        payload.spouse_mobile = formData.spouseMobile;
      }
      if (formData.spouseEmail && formData.spouseEmail.trim()) {
        payload.spouse_email = formData.spouseEmail;
      }
      if (formData.address && formData.address.trim()) {
        payload.residential_address = formData.address;
      }
      await assessmentService.submitFlow1(currentId, payload);
      nextStep();
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Failed to save step 1 details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStep2 = async () => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const currentId = await ensureAssessmentId();
      const payload = {
        client_name: formData.name || "",
        client_occupation: formData.occupation || "",
        client_designation: formData.designation || "",
        client_company: formData.companyName || "",
        client_dob: formData.dob || "",
        client_retirement_age: parseInt(formData.targetRetireAge) || 60,
        spouse_retirement_age: 55,
      };
      if (formData.spouseName && formData.spouseName.trim()) {
        payload.spouse_name = formData.spouseName;
      }
      if (formData.spouseOccupation && formData.spouseOccupation.trim()) {
        payload.spouse_occupation = formData.spouseOccupation;
      }
      if (formData.spouseDesignation && formData.spouseDesignation.trim()) {
        payload.spouse_designation = formData.spouseDesignation;
      }
      if (formData.spouseCompanyName && formData.spouseCompanyName.trim()) {
        payload.spouse_company = formData.spouseCompanyName;
      }
      if (formData.spouseDob && formData.spouseDob.trim()) {
        payload.spouse_dob = formData.spouseDob;
      }
      await assessmentService.submitFlow2(currentId, payload);
      nextStep();
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Failed to save step 2 details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStep3 = async () => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const currentId = await ensureAssessmentId();
      const activeChildren = childrenData.slice(0, childrenCount).map((c, idx) => {
        const childObj = {
          child_number: idx + 1,
          full_name: c.name || "",
          financially_dependent: c.dependent === "Yes",
        };
        if (c.occupation && c.occupation.trim()) {
          childObj.occupation = c.occupation;
        }
        if (c.dob && c.dob.trim()) {
          childObj.date_of_birth = c.dob;
        }
        return childObj;
      });
      const res = await assessmentService.submitFlow3(currentId, {
        number_of_children: childrenCount,
        children: activeChildren,
      });

      const resData = res.data || res;
      if (resData && resData.children) {
        setChildrenData((prev) => {
          const updated = [...prev];
          resData.children.forEach((savedChild) => {
            const idx = savedChild.child_number - 1;
            if (updated[idx]) {
              updated[idx].id = savedChild.id;
            }
          });
          return updated;
        });
      }

      nextStep();
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Failed to save step 3 details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStep4 = async () => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      const currentId = await ensureAssessmentId();
      const apiGoals = [];

      // Child education goals
      childrenData.slice(0, childrenCount).forEach((c) => {
        if (c.goalType && c.targetYear && c.todaysCost) {
          const mappedType =
            c.goalType === "Higher Education"
              ? "Graduation"
              : c.goalType === "Marriage"
              ? "Marriage"
              : "Other";
          const goalObj = {
            category: "child_goal",
            goal_type: mappedType,
            target_year: parseInt(c.targetYear) || 2035,
            today_cost: parseFloat(c.todaysCost) || 0,
            inflation_rate: 0.06,
          };
          if (c.id) {
            goalObj.child_id = c.id;
          }
          apiGoals.push(goalObj);
        }
      });

      // Lifestyle goals
      activeGoals.forEach((g) => {
        if (g.type && g.targetYear && g.todaysCost) {
          let mappedType = g.type;
          if (mappedType === "Estate for Children") {
            mappedType = "Estate For Children";
          } else if (mappedType === "Others" || mappedType === "Other") {
            mappedType = "Other";
          }
          apiGoals.push({
            category: "lifestyle",
            goal_type: mappedType,
            target_year: parseInt(g.targetYear) || 2035,
            today_cost: parseFloat(g.todaysCost) || 0,
            inflation_rate: 0.06,
          });
        }
      });

      // Submit goals if any exist
      if (apiGoals.length > 0) {
        await assessmentService.submitFlow4(currentId, {
          goals: apiGoals,
        });
      }
      nextStep();
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Failed to save step 4 details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStep5 = async () => {
    setApiError(null);
    setIsCalculating(true);

    let finalFormData = { ...formData };
    const numericFields = [
      'targetRetireAge', 'yearsUntilRetirement', 'requiredAnnualIncome',
      'epfEmployerShare', 'epfEmployeeShare', 'epfTotalCorpus',
      'npsEmployerShare', 'npsEmployeeShare', 'npsTotalCorpus',
      'superEmployerShare', 'superTotalCorpus',
    ];
    numericFields.forEach((field) => {
      if (!finalFormData[field] || !finalFormData[field].toString().trim()) {
        finalFormData[field] = "0";
      }
    });

    setFormData(finalFormData);

    try {
      const currentId = await ensureAssessmentId();
      // 1. Re-submit Step 2 with final retirement age
      const flow2Payload = {
        client_name: finalFormData.name || "",
        client_occupation: finalFormData.occupation || "",
        client_designation: finalFormData.designation || "",
        client_company: finalFormData.companyName || "",
        client_dob: finalFormData.dob || "",
        client_retirement_age: parseInt(finalFormData.targetRetireAge) || 60,
        spouse_retirement_age: 55,
      };
      if (finalFormData.spouseName && finalFormData.spouseName.trim()) {
        flow2Payload.spouse_name = finalFormData.spouseName;
      }
      if (finalFormData.spouseOccupation && finalFormData.spouseOccupation.trim()) {
        flow2Payload.spouse_occupation = finalFormData.spouseOccupation;
      }
      if (finalFormData.spouseDesignation && finalFormData.spouseDesignation.trim()) {
        flow2Payload.spouse_designation = finalFormData.spouseDesignation;
      }
      if (finalFormData.spouseCompanyName && finalFormData.spouseCompanyName.trim()) {
        flow2Payload.spouse_company = finalFormData.spouseCompanyName;
      }
      if (finalFormData.spouseDob && finalFormData.spouseDob.trim()) {
        flow2Payload.spouse_dob = finalFormData.spouseDob;
      }
      await assessmentService.submitFlow2(currentId, flow2Payload);

      // 2. Perform calculation
      const calcPayload = buildCalcPayload(finalFormData);
      const calcRes = await assessmentService.calculateRetirement(currentId, calcPayload);
      setCalculationResult(calcRes.data || calcRes);
      setShowReport(true);

      // 3. Generate PDF Report in background
      try {
        const reportRes = await reportService.generateReport(currentId);
        const reportData = reportRes.data || reportRes;
        if (reportData && reportData.job_id) {
          const jobId = reportData.job_id;
          
          // Poll async
          (async () => {
            let reportDone = false;
            let checkCount = 0;
            const maxChecks = 45;
            
            while (!reportDone && checkCount < maxChecks) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              checkCount++;
              try {
                const statusRes = await reportService.checkReportStatus(currentId, jobId);
                const statusData = statusRes.data || statusRes;
                if (statusRes.status === "success" && statusData.status === "completed") {
                  setReportId(statusData.report_id || statusData.id);
                  reportDone = true;
                } else if (statusRes.status === "failed") {
                  console.error("Report PDF failed.");
                  break;
                }
              } catch (pollErr) {
                console.error("Error checking report status:", pollErr);
              }
            }
          })();
        }
      } catch (reportErr) {
        console.error("Failed to generate PDF:", reportErr);
      }
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Failed to calculate retirement plan. Verify numbers.");
    } finally {
      setIsCalculating(false);
    }
  };

  const downloadReport = async () => {
    if (!assessmentId || !reportId) {
      alert("PDF report is still generating in the background. Please wait a few seconds and try again.");
      return;
    }
    try {
      const reportBlob = await reportService.downloadGeneratedReport(assessmentId, reportId);
      const download = reportService.createReportDownload(reportBlob, assessmentId);
      const link = document.createElement("a");
      link.href = download.url;
      link.download = download.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Failed to download PDF report. Please try again.");
    }
  };

  return (
    <AssessmentContext.Provider
      value={{
        step,
        assessmentId,
        formData,
        childrenCount,
        childrenData,
        activeGoals,
        calculationResult,
        reportId,
        showReport,
        isSubmitting,
        isCalculating,
        apiError,
        updateFormData,
        updateChild,
        setChildrenCount,
        addGoal,
        removeGoal,
        updateGoal,
        goToStep,
        nextStep,
        prevStep,
        setApiError,
        submitStep1,
        submitStep2,
        submitStep3,
        submitStep4,
        submitStep5,
        downloadReport,
        resetAssessment
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}
