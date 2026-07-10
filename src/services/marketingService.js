import api from "../config/api";

/**
 * Dispatch an email marketing campaign.
 * Uses multipart/form-data for attachments.
 * @param {string} subject - Campaign subject line
 * @param {string} body - Email body content (HTML or plain text)
 * @param {Array<File>} files - Campaign file attachments
 */
export const sendCampaign = (subject, body, files, recipients = "") => {
  const formData = new FormData();
  formData.append("subject", subject);
  formData.append("body", body);
  formData.append("body_format", "html");
  if (recipients && recipients.trim()) {
    formData.append("recipients", recipients);
  }
  files.forEach((file) => {
    formData.append("files", file);
  });

  return api.post("/admin/marketing/campaign", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Fetch all registered campaign recipients (optional).
 */
export const getRecipients = () => {
  return api.get("/admin/marketing/recipients");
};
