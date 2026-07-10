import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser } from "../services/authService";
import { logAction } from "../utils/activityLogger";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on load
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("wealth_admin_user") || localStorage.getItem("wealth_admin_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to restore auth session:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (username, password, rememberMe = true) => {
    const userObj = loginUser(username, password);
    
    if (userObj) {
      setCurrentUser(userObj);
      const userStr = JSON.stringify(userObj);
      
      if (rememberMe) {
        localStorage.setItem("wealth_admin_user", userStr);
      } else {
        sessionStorage.setItem("wealth_admin_user", userStr);
      }
      
      // Log login action
      // Because logAction checks localStorage, and we just set it, it will pick up this user.
      logAction(`User logged in successfully`);
      return { success: true, user: userObj };
    }
    
    return { success: false, error: "Invalid username or password" };
  };

  const logout = () => {
    if (currentUser) {
      logAction(`User logged out`);
    }
    setCurrentUser(null);
    localStorage.removeItem("wealth_admin_user");
    sessionStorage.removeItem("wealth_admin_user");
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
