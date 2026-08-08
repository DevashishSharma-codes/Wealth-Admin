import api, { API_BASE_URL, ADMIN_API_KEY, API_KEY } from "../config/api";

export const createAssessment = () => {
  return api.post("/assessment/");
};

export const submitFlow1 = (assessmentId, payload) => {
  return api.post(`/assessment/${assessmentId}/flow1`, payload);
};

export const submitFlow2 = (assessmentId, payload) => {
  return api.post(`/assessment/${assessmentId}/flow2`, payload);
};

export const submitFlow3 = (assessmentId, payload) => {
  return api.post(`/assessment/${assessmentId}/flow3`, payload);
};

export const submitFlow4 = (assessmentId, payload) => {
  return api.post(`/assessment/${assessmentId}/flow4`, payload);
};

export const calculateRetirement = (assessmentId, payload) => {
  return api.post(`/calculate/${assessmentId}`, payload);
};

export const getAdminUsers = (params) => {
  return api.get("/admin/users", { params });
};

export const getAdminLeads = (params) => {
  return api.get("/admin/leads", { params });
};

export const getAdminAssessments = (params) => {
  return api.get("/admin/assessments", { params });
};

export const getAssessment = (assessmentId) => {
  return api.get(`/assessment/${assessmentId}`);
};

export const exportAdminAssessment = (assessmentId) => {
  return api.get(`/admin/assessments/${assessmentId}/export`, {
    responseType: "blob",
  });
};

export const exportAdminUsers = () => {
  return api.get("/admin/users/export", {
    responseType: "blob",
  });
};

export const exportAdminAssessments = () => {
  return api.get("/admin/assessments/export", {
    responseType: "blob",
  });
};

export const convertExcelToPdf = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/admin/upload/convert-pdf", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    responseType: "blob",
  });
};

export const downloadClientTemplate = async () => {
  const adminApiKey = ADMIN_API_KEY || API_KEY;
  let baseUrl = API_BASE_URL;
  if (baseUrl.endsWith("/api/v1")) {
    baseUrl = baseUrl.replace(/\/api\/v1$/, "");
  }
  const endpoint = `${baseUrl}/api/v1/admin/upload/import-template`;

  const res = await fetch(endpoint, {
    headers: { "X-API-Key": adminApiKey },
  });

  if (!res.ok) {
    throw new Error(`Failed to download template (Status ${res.status})`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "client-assessment-template.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};


