import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import AccessDenied from "../components/AccessDenied";

interface SettingsPageProps {
  onNavigate?: (page: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  if (!user || user.role !== "owner") {
    return <AccessDenied requestedPage="settings" onNavigate={onNavigate} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white"
      >
        <h1 className="text-4xl font-bold mb-4">System Settings</h1>
        <p className="text-slate-300">
          Owner-only system configuration interface.
        </p>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
