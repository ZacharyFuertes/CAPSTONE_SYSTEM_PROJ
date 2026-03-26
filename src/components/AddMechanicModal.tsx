import React, { useState, useEffect } from "react";
import { X, Mail, Plus, User, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { createMechanicAccount, getMechanics } from "../services/staffService";
import { useAuth } from "../contexts/AuthContext";

interface AddMechanicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMechanicModal: React.FC<AddMechanicModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadMechanics();
    } else {
      setFormData({ name: "", email: "", password: "" });
      setStatusMsg({ text: "", type: "" });
    }
  }, [isOpen]);

  const loadMechanics = async () => {
    setLoading(true);
    try {
      const data = await getMechanics();
      setMechanics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name || !user?.id) return;

    setStatusMsg({ text: "", type: "" });
    setLoading(true);
    
    try {
      await createMechanicAccount(formData.name, formData.email, formData.password, user.id);
      setStatusMsg({ text: "Mechanic account created successfully!", type: "success" });
      setFormData({ name: "", email: "", password: "" });
      loadMechanics();
    } catch (err: any) {
      let errorMessage = err.message || "Failed to create mechanic";
      if (errorMessage.includes("User already registered")) {
        errorMessage = "This email is already registered.";
      }
      setStatusMsg({ text: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="text-blue-400" /> Manage Mechanics
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          {/* Status Message */}
          {statusMsg.text && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                statusMsg.type === "error"
                  ? "bg-red-500/10 border border-red-500/30 text-red-400"
                  : "bg-green-500/10 border border-green-500/30 text-green-400"
              }`}
            >
              {statusMsg.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              <span className="text-sm font-medium">{statusMsg.text}</span>
            </div>
          )}

          {/* Create Form */}
          <form onSubmit={handleCreate} className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Add New Mechanic
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="mechanic@motoshop.com"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Temporary Password</label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !formData.email || !formData.password || !formData.name}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition flex items-center gap-2"
                  >
                    <Plus size={18} /> Create
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Minimum 6 characters. Provide this password to the mechanic.</p>
              </div>
            </div>
          </form>

          {/* Mechanics List */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Active Mechanics
            </h3>
            <div className="space-y-3">
              {loading && mechanics.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Loading...</div>
              ) : mechanics.length === 0 ? (
                <div className="text-center py-8 bg-slate-800/50 rounded-lg border border-slate-700 border-dashed text-slate-500">
                  No mechanics found
                </div>
              ) : (
                mechanics.map((mech) => (
                  <div key={mech.id} className="flex items-center justify-between p-4 bg-slate-800/80 border border-slate-700 rounded-lg gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-bold uppercase">
                        {mech.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{mech.name}</div>
                        <div className="text-sm text-slate-400">{mech.email}</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-500/20">
                      Mechanic
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMechanicModal;
