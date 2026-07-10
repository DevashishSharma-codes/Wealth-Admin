/**
 * Shared helper function to log actions directly under the key 'ADMIN_ACTIVITY_LOGS'.
 * Requirement 5 & 6: Always fetches latest logs, prepends, and saves in the requested format.
 */
export const addLog = (user, action) => {
  try {
    const rawLogs = localStorage.getItem("ADMIN_ACTIVITY_LOGS");
    const logs = rawLogs ? JSON.parse(rawLogs) : [];

    const newLog = {
      user: user || "System/Guest",
      action: action || "",
      timestamp: new Date().toISOString(),
    };

    logs.unshift(newLog); // Prepend so it is sorted latest first
    localStorage.setItem("ADMIN_ACTIVITY_LOGS", JSON.stringify(logs));

    // Dispatch custom storage event for dynamic tab synchronization
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error("addLog failed:", err);
  }
};

/**
 * Backwards compatibility helper wrapper for logging from context/modules
 */
export const logAction = (actionPerformed) => {
  try {
    const userSession = localStorage.getItem("wealth_admin_user") || sessionStorage.getItem("wealth_admin_user");
    let userDisplay = "System/Guest";
    if (userSession) {
      const user = JSON.parse(userSession);
      userDisplay = user.role;
    }

    // Map profile names to standard user roles requested in prompt
    let shortUser = userDisplay;
    if (userDisplay === "Keshav Malpani") shortUser = "Keshav";
    else if (userDisplay === "Kailash Malpani") shortUser = "Kailash";
    else if (userDisplay === "Wealth Wisdom Team") shortUser = "Team";
    else if (userDisplay === "Developer") shortUser = "Developer";

    addLog(shortUser, actionPerformed);
  } catch (err) {
    console.error("logAction failed:", err);
  }
};

/**
 * Retrieves the local cache of activity logs sorted by latest first.
 */
export const getActivityLogs = () => {
  try {
    const logsStr = localStorage.getItem("ADMIN_ACTIVITY_LOGS");
    const logs = logsStr ? JSON.parse(logsStr) : [];
    // Sort latest first (timestamp desc) as requested
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (err) {
    console.error("Failed to read local activity logs:", err);
    return [];
  }
};

/**
 * Clears the audit logs locally.
 */
export const clearActivityLogs = () => {
  try {
    localStorage.removeItem("ADMIN_ACTIVITY_LOGS");
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error("Failed to clear local logs:", err);
  }
};
