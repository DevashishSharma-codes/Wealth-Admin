import api, { API_BASE_URL, ADMIN_API_KEY, API_KEY } from "./api";

export const generateReport = (assessmentId) => {
  return api.post(`/report/${assessmentId}/generate`);
};

export const getDownloadUrl = (assessmentId, reportId) => {
  const key = ADMIN_API_KEY || API_KEY;
  return `${API_BASE_URL}/report/${assessmentId}/download/${reportId}?api_key=${key}`;
};

export const downloadGeneratedReport = (assessmentId, reportId) => {
  return api.get(`/report/${assessmentId}/download/${reportId}`, {
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  });
};

export const checkReportStatus = (assessmentId, jobId) => {
  return api.get(`/report/${assessmentId}/status/${jobId}`);
};

export const createReportDownload = (reportBlob, assessmentId) => {
  const url = URL.createObjectURL(reportBlob);
  return {
    url,
    fileName: `wealth-wisdom-report-${assessmentId}.pdf`,
  };
};

export const downloadAdminReport = (reportId) => {
  return api.get(`/admin/reports/${reportId}/download`, {
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  });
};

export const getAdminReports = (params) => {
  return api.get("/admin/reports", { params });
};
