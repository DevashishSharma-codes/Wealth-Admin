import api from "./api";

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
