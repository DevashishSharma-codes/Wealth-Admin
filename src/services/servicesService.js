import api from "../config/api";

/**
 * Fetch all services from admin API endpoint.
 */
export const getServices = () => {
  return api.get("/admin/services");
};

/**
 * Create a new service.
 * @param {object} payload - { title: string, description: string, active: boolean }
 */
export const createService = (payload) => {
  return api.post("/admin/services", payload);
};

/**
 * Update an existing service by ID.
 * @param {string|number} id - The ID of the service to update
 * @param {object} payload - { title: string, description: string, active: boolean }
 */
export const updateService = (id, payload) => {
  return api.put(`/admin/services/${id}`, payload);
};

/**
 * Delete a service by ID.
 * @param {string|number} id - The ID of the service to delete
 */
export const deleteService = (id) => {
  return api.delete(`/admin/services/${id}`);
};
