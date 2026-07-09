import api from "../config/api";

/**
 * Fetch all API keys. Can filter by search query matching client name, role, or key prefix.
 * @param {string} search - Optional search query
 */
export const getApiKeys = (search = "") => {
  return api.get("/admin/api-keys", {
    params: { search },
  });
};

/**
 * Generate a new API key.
 * @param {object} payload - { client_name: string, role: "user" | "admin" }
 */
export const generateApiKey = (payload) => {
  return api.post("/admin/api-keys", payload);
};

/**
 * Revoke an API key by ID.
 * @param {string} keyId - The ID of the key to revoke
 */
export const revokeApiKey = (keyId) => {
  return api.put(`/admin/api-keys/${keyId}/revoke`);
};

/**
 * Activate an API key by ID.
 * @param {string} keyId - The ID of the key to activate
 */
export const activateApiKey = (keyId) => {
  return api.put(`/admin/api-keys/${keyId}/activate`);
};
