import api from "../config/api";

/**
 * Fetch all email templates.
 * GET /api/v1/admin/email-templates
 */
export const getEmailTemplates = () => {
  return api.get("/admin/email-templates");
};

/**
 * Fetch a specific email template by key (e.g. 'report_delivery').
 * GET /api/v1/admin/email-templates/:key
 */
export const getEmailTemplate = (templateKey = "report_delivery") => {
  return api.get(`/admin/email-templates/${templateKey}`);
};

/**
 * Update an email template by key.
 * PUT /api/v1/admin/email-templates/:key
 * @param {string} templateKey
 * @param {{ subject?: string, body?: string }} payload
 */
export const updateEmailTemplate = (templateKey = "report_delivery", payload) => {
  return api.put(`/admin/email-templates/${templateKey}`, payload);
};

/**
 * Reset an email template to default values.
 * POST /api/v1/admin/email-templates/:key/reset
 */
export const resetEmailTemplate = (templateKey = "report_delivery") => {
  return api.post(`/admin/email-templates/${templateKey}/reset`);
};
