import { UserRole } from "../types";

export type AppPage =
  | "landing"
  | "dashboard"
  | "inventory"
  | "appointments"
  | "customers"
  | "customer-portal"
  | "browse-parts"
  | "products"
  | "mechanic-portal"
  | "mechanic-dashboard"
  | "mechanic-availability"
  | "reports"
  | "settings";

// Role-based mapping (central source of truth for allowed pages per role)
export const rolePagesMapping: Record<UserRole, AppPage[]> = {
  customer: ["landing", "customer-portal"],
  mechanic: [
    "mechanic-dashboard",
    "appointments",
    "inventory",
    "mechanic-portal",
  ],
  owner: [
    "dashboard",
    "inventory",
    "appointments",
    "customers",
    "products",
    "mechanic-availability",
    "reports",
    "settings",
  ],
  // Admin behaves like owner for now (future extension)
  admin: [
    "dashboard",
    "inventory",
    "appointments",
    "customers",
    "products",
    "mechanic-availability",
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
