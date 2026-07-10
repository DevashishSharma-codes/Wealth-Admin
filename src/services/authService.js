/**
 * Hardcoded users database for frontend-only authentication.
 */
export const USERS = [
  {
    username: "keshav",
    password: "wealth@keshav",
    role: "Keshav Malpani",
  },
  {
    username: "kailash",
    password: "wealth@kailash",
    role: "Kailash Malpani",
  },
  {
    username: "team",
    password: "wealth@team",
    role: "Wealth Wisdom Team",
  },
  {
    username: "developer",
    password: "wealth@dev",
    role: "Developer",
  },
];

/**
 * Validates credentials and returns the authenticated user object.
 * @param {string} username 
 * @param {string} password 
 * @returns {object|null} The user object or null if invalid
 */
export const loginUser = (username, password) => {
  if (!username || !password) return null;
  
  const found = USERS.find(
    (u) =>
      u.username.toLowerCase() === username.trim().toLowerCase() &&
      u.password === password
  );
  
  if (found) {
    // Return only public details, no password
    return {
      username: found.username,
      role: found.role,
    };
  }
  return null;
};
