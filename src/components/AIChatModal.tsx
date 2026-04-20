import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  AlertCircle,
  Database,
  RefreshCw,
  LogIn,
} from "lucide-react";
import { Groq } from "groq-sdk";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessageType {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string; // kept for backward-compat; internally we use useAuth
}

interface ShopContext {
  services: any[];
  parts: any[];
  mechanics: any[];
  availability: any[];
  loadedAt: string;
}

interface CustomerContext {
  id: string;           // customers.id
  userId: string;       // users.id
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  vehicles: {
    id: string;
    make: string;
    model: string;
    year: number;
    plate_number: string;
  }[];
  recentAppointments: {
    service_type: string;
    status: string;
    scheduled_date: string;
  }[];
}

// ─── Supabase Fetchers ──────────────────────────────────────────────────────────

async function fetchShopContext(): Promise<ShopContext> {
  const [servicesRes, partsRes, mechanicsRes, availRes] = await Promise.allSettled([
    supabase.from("products").select("name, description, unit_price, category").order("unit_price"),
    supabase.from("parts").select("name, category, quantity_in_stock, unit_price").gt("quantity_in_stock", 0).order("category"),
    supabase.from("users").select("id, name, phone").eq("role", "mechanic"),
    supabase.from("mechanic_availability").select("mechanic_id, day_of_week, start_time, end_time, is_available").eq("is_available", true),
  ]);

  return {
    services: servicesRes.status === "fulfilled" ? (servicesRes.value.data ?? []) : [],
    parts: partsRes.status === "fulfilled" ? (partsRes.value.data ?? []) : [],
    mechanics: mechanicsRes.status === "fulfilled" ? (mechanicsRes.value.data ?? []) : [],
    availability: availRes.status === "fulfilled" ? (availRes.value.data ?? []) : [],
    loadedAt: new Date().toLocaleTimeString("en-PH"),
  };
}

async function fetchCustomerContext(userId: string): Promise<CustomerContext | null> {
  try {
    // Get user info
    const { data: userData } = await supabase
      .from("users")
      .select("id, name, email, phone")
      .eq("id", userId)
      .single();
    if (!userData) return null;

    // Get customer record
    const { data: customerData } = await supabase
      .from("customers")
      .select("id, phone, address")
      .eq("user_id", userId)
      .maybeSingle();
    if (!customerData) return null;

    // Get vehicles
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("id, make, model, year, plate_number")
      .eq("customer_id", customerData.id);

    // Get recent appointments
    const { data: appointments } = await supabase
      .from("appointments")
      .select("service_type, status, scheduled_date")
      .eq("customer_id", customerData.id)
      .order("scheduled_date", { ascending: false })
      .limit(5);

    return {
      id: customerData.id,
      userId: userData.id,
      name: userData.name,
      email: userData.email ?? "",
      phone: customerData.phone ?? userData.phone ?? null,
      address: customerData.address ?? null,
      vehicles: vehicles ?? [],
      recentAppointments: appointments ?? [],
    };
  } catch {
    return null;
  }
}



// ─── System Prompt Builder ──────────────────────────────────────────────────────

function buildSystemPrompt(ctx: ShopContext, customer: CustomerContext | null): string {
  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // --- Shop data blocks ---
  const servicesBlock = ctx.services.length > 0
    ? ctx.services.map((s) => `- ${s.name}: PHP ${Number(s.unit_price).toFixed(2)}${s.description ? ` — ${s.description}` : ""}`).join("\n")
    : "No services listed. Advise customer to call the shop.";

  const partsByCategory: Record<string, any[]> = {};
  for (const p of ctx.parts) {
    const cat = p.category ?? "other";
    if (!partsByCategory[cat]) partsByCategory[cat] = [];
    partsByCategory[cat].push(p);
  }
  const partsBlock = ctx.parts.length > 0
    ? Object.entries(partsByCategory)
        .map(([cat, items]) =>
          `${cat.toUpperCase()}:\n` +
          items.map((p) => `  - ${p.name}: PHP ${Number(p.unit_price).toFixed(2)} (${p.quantity_in_stock} pcs in stock)`).join("\n")
        ).join("\n")
    : "No parts listed. Advise customer to visit the shop.";

  const mechanicsBlock = ctx.mechanics.length > 0
    ? ctx.mechanics.map((m) => {
        const sched = ctx.availability
          .filter((a) => a.mechanic_id === m.id)
          .map((a) => `${a.day_of_week}: ${a.start_time}–${a.end_time}`)
          .join(", ");
        return `- ${m.name}${m.phone ? ` (${m.phone})` : ""}${sched ? ` | Schedule: ${sched}` : ""}`;
      }).join("\n")
    : "No mechanics listed.";

  // --- Customer context block ---
  let customerBlock = "";
  if (customer) {
    const vehicleList = customer.vehicles.length > 0
      ? customer.vehicles.map((v) => `  - ${v.year} ${v.make} ${v.model} (Plate: ${v.plate_number})`).join("\n")
      : "  - No vehicles registered yet.";

    const apptList = customer.recentAppointments.length > 0
      ? customer.recentAppointments.map((a) =>
          `  - ${a.service_type} | ${a.status} | ${new Date(a.scheduled_date).toLocaleDateString("en-PH")}`
        ).join("\n")
      : "  - No recent appointments.";

    customerBlock = `
=== LOGGED-IN CUSTOMER (use this to personalize) ===
Name: ${customer.name}
Email: ${customer.email}
Phone: ${customer.phone ?? "not provided"}
Address: ${customer.address ?? "not provided"}
Registered Vehicles:
${vehicleList}
Recent Appointments:
${apptList}`;
  }



  return `You are MotoMech AI, the 24/7 virtual assistant for JSBM MotoShop.
Today is ${today}. Live shop data loaded at ${ctx.loadedAt}.

=== SHOP SERVICES ===
${servicesBlock}

=== PARTS IN STOCK ===
${partsBlock}

=== MECHANICS & AVAILABILITY ===
${mechanicsBlock}
${customerBlock}

=== YOUR ROLE ===
You are a helpful, professional, and friendly shop assistant.
- Use ONLY the data above to answer questions. NEVER invent prices, schedules, or availability.
- When a customer describes a vehicle problem, suggest relevant parts from the list above.
- Always recommend visiting or calling the shop for complex issues.
- If data lists are empty, honestly say so and ask the customer to contact the shop.
${customer ? `- Address the customer by their first name (${customer.name.split(" ")[0]}) to personalize the experience.` : ""}
- IMPORTANT: At the END of EVERY response, always suggest 2-3 short follow-up questions the customer might want to ask next. Format them as a brief list like:
  "You might also want to ask:
  • [suggestion 1]
  • [suggestion 2]
  • [suggestion 3]"
  This keeps the conversation going and helps the customer explore more options.`;
}

// ─── Component ──────────────────────────────────────────────────────────────────

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();

  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ctxLoading, setCtxLoading] = useState(false);
  const [shopCtx, setShopCtx] = useState<ShopContext | null>(null);
  const [customerCtx, setCustomerCtx] = useState<CustomerContext | null>(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const groqClient = useRef<Groq | null>(null);

  // Derive greeting based on login state
  const buildGreeting = (customer: CustomerContext | null): ChatMessageType => ({
    id: "initial",
    sender: "bot",
    timestamp: new Date(),
    content: customer
      ? `Hello, ${customer.name.split(" ")[0]}! I'm MotoMech AI, your JSBM MotoShop assistant.\n\nI can see you have ${customer.vehicles.length > 0 ? customer.vehicles.map((v) => `a ${v.year} ${v.make} ${v.model}`).join(" and ") : "no registered vehicles yet"}. How can I help you today?\n\n- Service info and pricing\n- Parts availability\n- Mechanic schedules\n- Book an appointment`
      : `Hello! I'm MotoMech AI, JSBM MotoShop's 24/7 assistant. How can I help you today?\n\n- Service info and pricing\n- Parts availability and recommendations\n- Mechanic schedules and availability\n- Book an appointment\n\nTip: Log in for a faster booking experience!`,
  });

  // Init Groq
  useEffect(() => {
    try {
      // @ts-ignore
      const apiKey = import.meta.env.VITE_GROQ_API_KEY as string;
      if (!apiKey || apiKey === "your_groq_api_key_here") {
        setError("Groq API key not configured.");
        return;
      }
      groqClient.current = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    } catch {
      setError("Failed to initialize AI client.");
    }
  }, []);

  // Load all context when modal opens
  const loadContext = useCallback(async () => {
    setCtxLoading(true);
    try {
      const [shop, customer] = await Promise.all([
        fetchShopContext(),
        isAuthenticated && user?.id && user.role === "customer"
          ? fetchCustomerContext(user.id)
          : Promise.resolve(null),
      ]);

      setShopCtx(shop);
      setCustomerCtx(customer);

      // Set personalized greeting
      setMessages([buildGreeting(customer)]);
    } catch {
      setMessages([buildGreeting(null)]);
    } finally {
      setCtxLoading(false);
    }
  }, [isAuthenticated, user?.id, user?.role]);

  useEffect(() => {
    if (isOpen) loadContext();
  }, [isOpen, loadContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);



  // Helper: parse follow-up suggestions from bot response
  const parseSuggestions = (content: string): string[] => {
    const lines = content.split('\n');
    const suggestions: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      // Match lines starting with •, -, or numbered like 1.
      const match = trimmed.match(/^(?:[•\-\*]|\d+[\.\)])\s*(.+)/);
      if (match && match[1]) {
        const text = match[1].replace(/^["']|["']$/g, '').replace(/\*+/g, '').trim();
        // Only treat short lines as suggestions (< 80 chars, likely follow-up questions)
        if (text.length > 5 && text.length < 80 && text.endsWith('?')) {
          suggestions.push(text);
        }
      }
    }
    // Return only the last 2-3 suggestions (the follow-up ones)
    return suggestions.slice(-3);
  };

  // Reusable: send a text message to the AI
  const sendMessageFromText = async (text: string) => {
    if (!text.trim() || !groqClient.current || loading) return;
    if (error) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      // Trigger AI call
      (async () => {
        setInput("");
        setLoading(true);
        try {
          const systemPrompt = shopCtx
            ? buildSystemPrompt(shopCtx, customerCtx)
            : `You are MotoMech AI for JSBM MotoShop. Today is ${new Date().toLocaleDateString("en-PH")}. The database is loading. Advise customers to wait a moment or call the shop.`;
          const history = newMessages
            .filter((m) => m.id !== "initial")
            .map((m) => ({
              role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
              content: m.content,
            }));
          const response = await groqClient.current!.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: systemPrompt }, ...history],
            max_tokens: 1024,
            temperature: 0.5,
          });
          const raw = response.choices[0]?.message?.content ?? "I could not generate a response. Please try again.";
          setMessages((p) => [
            ...p,
            { id: (Date.now() + 1).toString(), content: raw, sender: "bot", timestamp: new Date() },
          ]);
        } catch (err: any) {
          setMessages((p) => [
            ...p,
            { id: (Date.now() + 1).toString(), content: `Sorry, I encountered an error. ${err.message ?? "Please try again."}`, sender: "bot", timestamp: new Date() },
          ]);
        } finally {
          setLoading(false);
        }
      })();
      return newMessages;
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    await sendMessageFromText(input);
  };

  if (!isOpen) return null;

  const isLoggedInCustomer = isAuthenticated && user?.role === "customer";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#0a0a0a] rounded-none border border-[#222] border-t-2 border-t-[#d63a2f] w-full sm:max-w-[820px] h-[95vh] sm:h-[85vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* ── Header ── */}
          <div className="flex items-start justify-between px-6 sm:px-10 py-6 border-b border-[#222] flex-shrink-0 bg-[#111111]">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-[#d63a2f] flex items-center justify-center shrink-0">
                <MessageSquare size={28} className="text-white" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 text-[#d63a2f] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <div className="w-6 h-[1px] bg-[#d63a2f]" /> AI ASSISTANT
                </div>
                <h2 className="font-display text-3xl sm:text-4xl text-white uppercase leading-none tracking-wide">
                  MOTOMECH AI
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  {ctxLoading ? (
                    <><Loader2 size={10} className="text-yellow-400 animate-spin" /><span className="text-yellow-400 text-[10px] font-bold tracking-widest">LOADING DATABASE...</span></>
                  ) : shopCtx ? (
                    <><Database size={10} className="text-[#4ade80]" /><span className="text-[#4ade80] text-[10px] font-bold tracking-widest">LIVE DATABASE</span><span className="text-[#6b6b6b] text-[10px]"> · {shopCtx.loadedAt}</span></>
                  ) : (
                    <><AlertCircle size={10} className="text-yellow-400" /><span className="text-yellow-400 text-[10px] font-bold tracking-widest">OFFLINE MODE</span></>
                  )}
                  {/* Login status */}
                  <span className="text-[#333] text-[10px]">·</span>
                  {isLoggedInCustomer && customerCtx ? (
                    <><User size={10} className="text-[#d63a2f]" /><span className="text-[#d63a2f] text-[10px] font-bold tracking-widest">LOGGED IN</span></>
                  ) : (
                    <><LogIn size={10} className="text-[#6b6b6b]" /><span className="text-[#6b6b6b] text-[10px] tracking-widest">GUEST</span></>
                  )}
                  {shopCtx && !ctxLoading && (
                    <button onClick={loadContext} title="Refresh" className="ml-1 text-[#555] hover:text-white transition">
                      <RefreshCw size={10} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 border border-[#333] hover:bg-[#222] transition text-[#6b6b6b] hover:text-white shrink-0"
            >
              <X size={20} strokeWidth={1} />
            </button>
          </div>

          {/* ── Error Banner ── */}
          {error && (
            <div className="bg-[#221515] border-b border-[#d63a2f]/30 px-6 py-3 flex items-center gap-3 text-[#d63a2f] text-xs font-bold tracking-widest uppercase">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 bg-[#0a0a0a] space-y-6">
            {messages.map((message, idx) => {
              const isLastBotMsg = message.sender === "bot" && idx === messages.length - 1;
              const inlineSuggestions = (message.sender === "bot" && isLastBotMsg && !loading) ? parseSuggestions(message.content) : [];
              return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className={`flex gap-4 max-w-[88%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-10 h-10 shrink-0 flex items-center justify-center border ${
                    message.sender === "user"
                      ? "bg-[#111] border-[#333] text-[#6b6b6b]"
                      : "bg-[#221515] border-[#d63a2f] text-[#d63a2f]"
                  }`}>
                    {message.sender === "user" ? (
                      isLoggedInCustomer && customerCtx
                        ? <span className="text-sm font-black text-[#d63a2f]">{customerCtx.name.charAt(0)}</span>
                        : <User size={18} />
                    ) : <Bot size={18} />}
                  </div>
                  <div className={`p-5 border ${
                    message.sender === "user"
                      ? "bg-[#111] border-[#333] text-white"
                      : "bg-[#0a0a0a] border-[#222] text-[#ccc]"
                  }`}>
                    <div className="text-xs sm:text-sm font-light leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className={`text-[10px] mt-2 opacity-40 ${message.sender === "user" ? "text-right" : "text-left"}`}>
                      {message.timestamp.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                {/* Inline follow-up suggestion buttons */}
                {inlineSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 ml-14">
                    {inlineSuggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessageFromText(s)}
                        disabled={loading}
                        className="px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase border border-[#333] text-[#6b6b6b] hover:border-[#d63a2f] hover:text-[#d63a2f] hover:bg-[#1a1010] transition-colors disabled:opacity-30"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
              );
            })}

            {loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center border bg-[#221515] border-[#d63a2f] text-[#d63a2f]">
                    <Bot size={18} />
                  </div>
                  <div className="p-5 border bg-[#0a0a0a] border-[#222] flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-[#d63a2f]" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#6b6b6b]">THINKING...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ── */}
          <div className="p-6 sm:px-10 border-t border-[#222] bg-[#111111]">
            {/* Quick chips — personalized if logged in */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(isLoggedInCustomer && customerCtx?.vehicles.length
                ? [
                    "What services do you offer?",
                    `Check parts for my ${customerCtx.vehicles[0].make}`,
                    "When are mechanics available?",
                    "Book an appointment",
                  ]
                : [
                    "What services do you offer?",
                    "Check brake pads in stock",
                    "Who are your mechanics?",
                    "Book an appointment",
                  ]
              ).map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessageFromText(chip)}
                  disabled={loading}
                  className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase border border-[#333] text-[#6b6b6b] hover:border-[#d63a2f] hover:text-[#d63a2f] transition-colors disabled:opacity-30 truncate max-w-[200px]"
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleSendMessage()}
                placeholder={
                  error
                    ? "FIX API KEY TO CHAT..."
                    : isLoggedInCustomer
                    ? `Ask me anything, ${customerCtx?.name.split(" ")[0] ?? ""}...`
                    : "ASK ABOUT SERVICES, PARTS, SCHEDULES..."
                }
                disabled={loading || !!error}
                className="flex-1 bg-[#0a0a0a] text-white px-5 py-4 border border-[#333] focus:border-[#d63a2f] focus:outline-none transition text-xs font-bold tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim() || !!error}
                className="w-14 shrink-0 bg-[#d63a2f] hover:bg-[#c0322a] disabled:bg-[#333] disabled:text-[#6b6b6b] text-white flex items-center justify-center transition-colors disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIChatModal;
