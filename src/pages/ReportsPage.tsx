import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import AccessDenied from "../components/AccessDenied";

interface ReportsPageProps {
  onNavigate?: (page: string) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user || user.role !== "owner") {
    return <AccessDenied requestedPage="reports" onNavigate={onNavigate} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white"
      >
        <h1 className="text-4xl font-bold mb-4">
          {t("reports.title") || "Reports"}
        </h1>
        <p className="text-slate-300">
          Owner-only reporting dashboard for inventory, sales, and performance.
        </p>
      </motion.div>
    </div>
  );
};

export default ReportsPage;
