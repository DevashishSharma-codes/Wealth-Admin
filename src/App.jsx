import React, { useState } from "react";
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
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <UsersList />;
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
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ToastProvider>
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
      >
        {renderActiveView()}
      </Layout>
    </ToastProvider>
  );
}
