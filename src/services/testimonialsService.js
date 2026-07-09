import api from "../config/api";

/**
 * Fetch all testimonials.
 */
export const getTestimonials = () => {
  return api.get("/admin/testimonials");
};

/**
 * Create a new testimonial.
 * @param {object} payload - { name: string, message: string, visible: boolean, avatar?: string }
 */
export const createTestimonial = (payload) => {
  return api.post("/admin/testimonials", payload);
};

/**
 * Update an existing testimonial by ID.
 * @param {string} id - The ID of the testimonial to update
 * @param {object} payload - { name: string, message: string, visible: boolean, avatar?: string }
 */
export const updateTestimonial = (id, payload) => {
  return api.put(`/admin/testimonials/${id}`, payload);
};

/**
 * Delete a testimonial by ID.
 * @param {string} id - The ID of the testimonial to delete
 */
export const deleteTestimonial = (id) => {
  return api.delete(`/admin/testimonials/${id}`);
};
