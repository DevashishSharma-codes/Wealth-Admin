import { useState, useEffect } from "react";
import Layout from "./components/layout/Layout";
import Dashboard from "./modules/dashboard/Dashboard";
import UsersList from "./modules/users/UsersList";
import AssessmentBuilder from "./modules/assessment/AssessmentBuilder";
import ReportsList from "./modules/reports/ReportsList";
import RateConfig from "./modules/rates/RateConfig";
import ExcelUpload from "./modules/upload/ExcelUpload";
import EmailMarketing from "./modules/email/EmailMarketing";
import ApiLogs from "./modules/logs/ApiLogs";
import SettingsPage from "./modules/settings/Settings";
import ServicesAdmin from "./modules/services/ServicesAdmin";
import TestimonialsAdmin from "./modules/testimonials/TestimonialsAdmin";
import AssessmentProvider from "./context/AssessmentContext";
import { ToastProvider } from "./components/UI/Toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./modules/auth/LoginPage";
// import ActivityLogs from "./modules/logs/ActivityLogs";
import "./App.css";

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.target.tagName === "INPUT" && e.target.type === "number") {
        e.preventDefault();
      }
    };
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, []);

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    // Restrict access to developer-only views
    const isDevOnly = activeTab === "logs" || activeTab === "settings";
    if (isDevOnly && currentUser?.role !== "Developer") {
      return <Dashboard />;
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <UsersList globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />;
      case "builder":
        return (
          <AssessmentProvider>
            <AssessmentBuilder />
          </AssessmentProvider>
        );
      case "reports":
        return <ReportsList />;
      case "rates":
        return <RateConfig />;
      case "upload":
        return <ExcelUpload />;
      case "services":
        return <ServicesAdmin />;
      case "testimonials":
        return <TestimonialsAdmin />;
      case "email":
        return <EmailMarketing />;
      case "logs":
        return <ApiLogs />;
      // case "activity-logs":
      //   return <ActivityLogs />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      globalSearch={globalSearch}
      setGlobalSearch={setGlobalSearch}
    >
      {renderActiveView()}
    </Layout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

