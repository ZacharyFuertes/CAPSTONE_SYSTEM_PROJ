import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import AccessDenied from "../components/AccessDenied";
import AddMechanicModal from "../components/AddMechanicModal";
import { Users } from "lucide-react";

interface SettingsPageProps {
  onNavigate?: (page: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = React.useState(false);

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
        <p className="text-slate-300 mb-8">
          Owner-only system configuration interface.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Management Card */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition cursor-pointer" onClick={() => setShowInviteModal(true)}>
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Staff Management</h3>
            <p className="text-slate-400 text-sm">
              Invite mechanics to join the system and manage their access.
            </p>
          </div>
        </div>
      </motion.div>

      <AddMechanicModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
      />
    </div>
  );
};

export default SettingsPage;
