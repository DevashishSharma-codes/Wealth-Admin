import api from "./api";

/**
 * Fetch detailed server readiness health indicators.
 * Includes database checks, engine status, and uptime seconds.
 * Authenticated as admin.
 */
export const getDetailedHealth = () => {
  return api.get("/health/detailed");
};

/**
 * Fetch public liveness check. (Public route, no key required but sent anyway)
 */
export const getPublicHealth = () => {
  return api.get("/health/");
};
