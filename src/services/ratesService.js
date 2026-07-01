import api from "./api";

/**
 * Fetch current pre/post-retirement inflation and ROI rates.
 */
export const getRates = () => {
  return api.get("/rates/");
};

/**
 * Update rate configurations. (Requires admin API key header, handled by api.js interceptor)
 * @param {object} payload - { inflation_post, roi_post, inflation_pre, roi_pre }
 */
export const updateRates = (payload) => {
  return api.put("/rates/", payload);
};

/**
 * Fetch full audit log of every rate change.
 */
export const getRatesHistory = () => {
  return api.get("/rates/history");
};
