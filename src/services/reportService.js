import axios from "axios";
import api, { API_BASE_URL, ADMIN_API_KEY, API_KEY } from "../config/api";

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

export const downloadClientReport = (assessmentId) => {
  return api.post(`/report/${assessmentId}/download`, {}, {
    responseType: "blob",
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

export const downloadAdminReportWithFilename = async (reportId) => {
  const key = ADMIN_API_KEY || API_KEY;
  const response = await axios.get(`${API_BASE_URL}/admin/reports/${reportId}/download`, {
    responseType: "blob",
    headers: {
      "X-API-Key": key,
      Accept: "application/pdf",
    },
  });

  const disposition = response.headers["content-disposition"];
  let fileName = `report-${reportId}.pdf`;
  if (disposition && disposition.indexOf("attachment") !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      fileName = matches[1].replace(/['"]/g, "");
    }
  }

  return {
    blob: response.data,
    fileName,
  };
};

export const getAdminReports = (params) => {
  return api.get("/admin/reports", { params });
};

