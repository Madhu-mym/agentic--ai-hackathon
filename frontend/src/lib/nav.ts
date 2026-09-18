import {
  LayoutDashboard,
  ListChecks,
  BookOpen,
  MessageSquare,
  Users,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: ListChecks },
  { name: "Knowledge", href: "/knowledge", icon: BookOpen },
  { name: "AI Assistant", href: "/chat", icon: MessageSquare, badge: "RAG" },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Access Request", href: "/requests", icon: KeyRound },
];
