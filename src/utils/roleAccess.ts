import { UserRole } from "../types";

export type AppPage =
  | "landing"
  | "dashboard"
  | "inventory"
  | "update-parts"
  | "appointments"
  | "customers"
  | "customer-portal"
  | "browse-parts"
  | "mechanic-portal"
  | "mechanic-dashboard"
  | "mechanic-availability"
  | "services"
  | "settings"
  | "ai-inquiries";

// Role-based mapping (central source of truth for allowed pages per role)
export const rolePagesMapping: Record<UserRole, AppPage[]> = {
  customer: ["landing"],
  mechanic: [
    "mechanic-dashboard",
    "appointments",
    "inventory",
    "mechanic-portal",
  ],
  owner: [
    "dashboard",
    "inventory",
    "update-parts",
    "appointments",
    "customers",
    "services",
    "mechanic-availability",
    "settings",
    "ai-inquiries",
  ],
};

export const getPagesByRole = (role?: string): AppPage[] => {
  if (!role) return [];
  return rolePagesMapping[role as UserRole] || [];
};

export const getDefaultPageByRole = (role?: string): AppPage => {
  const pages = getPagesByRole(role);
  return pages.length > 0 ? pages[0] : "landing";
};

export const isPageAllowedForRole = (page: AppPage, role?: string): boolean => {
  const allowed = getPagesByRole(role);
  return allowed.includes(page);
};
