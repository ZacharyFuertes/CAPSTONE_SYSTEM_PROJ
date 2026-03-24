import React, { createContext, useContext, useState } from "react";
import { Language } from "../types";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Translation keys for bilingual support
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.inventory": "Inventory",
    "nav.appointments": "Appointments",
    "nav.reports": "Reports",
    "nav.admin": "Admin",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "nav.language": "Language",

    // Dashboard
    "dashboard.title": "Shop Dashboard",
    "dashboard.today_jobs": "Today's Jobs",
    "dashboard.pending": "Pending Appointments",
    "dashboard.revenue": "Total Revenue",
    "dashboard.low_stock": "Low Stock Alert",
    "dashboard.avg_job": "Average Job Value",
    "dashboard.satisfaction": "Satisfaction Score",

    // Inventory
    "inventory.title": "Inventory Management",
    "inventory.add_part": "Add New Part",
    "inventory.search": "Search parts...",
    "inventory.part_name": "Part Name",
    "inventory.category": "Category",
    "inventory.price": "Price",
    "inventory.stock": "In Stock",
    "inventory.reorder": "Reorder Level",
    "inventory.low_stock": "Low Stock",

    // Appointments
    "appointments.title": "Appointment Calendar",
    "appointments.new": "New Appointment",
    "appointments.date": "Date",
    "appointments.time": "Time",
    "appointments.service": "Service Type",
    "appointments.customer": "Customer",
    "appointments.vehicle": "Vehicle",
    "appointments.status": "Status",
    "appointments.confirm": "Confirm",
    "appointments.cancel": "Cancel",

    // Chat
    "chat.title": "AI Assistant",
    "chat.placeholder":
      "Ask me about services, parts, or book an appointment...",
    "chat.send": "Send",
    "chat.type_message": "Type your message...",

    // Forms
    "form.name": "Name",
    "form.email": "Email",
    "form.phone": "Phone",
    "form.submit": "Submit",
    "form.cancel": "Cancel",
    "form.save": "Save",
    "form.delete": "Delete",
    "form.edit": "Edit",

    // Messages
    "msg.success": "Success!",
    "msg.error": "Error",
    "msg.loading": "Loading...",
    "msg.confirm_delete": "Are you sure?",
  },
  tl: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.inventory": "Inventory",
    "nav.appointments": "Mga Appointment",
    "nav.reports": "Mga Ulat",
    "nav.admin": "Admin",
    "nav.profile": "Profil",
    "nav.logout": "Logout",
    "nav.language": "Wika",

    // Dashboard
    "dashboard.title": "Dashboard ng Shop",
    "dashboard.today_jobs": "Mga Trabaho Ngayong Araw",
    "dashboard.pending": "Naghihintay na Mga Appointment",
    "dashboard.revenue": "Kabuuang Kita",
    "dashboard.low_stock": "Low Stock Alert",
    "dashboard.avg_job": "Average na Halaga ng Job",
    "dashboard.satisfaction": "Satisfaction Score",

    // Inventory
    "inventory.title": "Inventory Management",
    "inventory.add_part": "Magdagdag ng Bagong Parte",
    "inventory.search": "Maghanap ng mga parte...",
    "inventory.part_name": "Pangalan ng Parte",
    "inventory.category": "Kategorya",
    "inventory.price": "Presyo",
    "inventory.stock": "Stock",
    "inventory.reorder": "Reorder Level",
    "inventory.low_stock": "Mababang Stock",

    // Appointments
    "appointments.title": "Appointment Calendar",
    "appointments.new": "Bagong Appointment",
    "appointments.date": "Petsa",
    "appointments.time": "Oras",
    "appointments.service": "Uri ng Serbisyo",
    "appointments.customer": "Customer",
    "appointments.vehicle": "Sasakyan",
    "appointments.status": "Status",
    "appointments.confirm": "Kumpirma",
    "appointments.cancel": "Kanselahin",

    // Chat
    "chat.title": "AI Assistant",
    "chat.placeholder":
      "Magtanong tungkol sa serbisyo, mga parte, o mag-book ng appointment...",
    "chat.send": "Magpadala",
    "chat.type_message": "I-type ang iyong mensahe...",

    // Forms
    "form.name": "Pangalan",
    "form.email": "Email",
    "form.phone": "Telepono",
    "form.submit": "Magpadala",
    "form.cancel": "Kanselahin",
    "form.save": "I-save",
    "form.delete": "Tanggalin",
    "form.edit": "I-edit",

    // Messages
    "msg.success": "Tagumpay!",
    "msg.error": "Error",
    "msg.loading": "Naglo-load...",
    "msg.confirm_delete": "Sigurado ka ba?",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("shop_language");
    return (saved as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("shop_language", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
