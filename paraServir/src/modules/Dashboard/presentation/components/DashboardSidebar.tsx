import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { ROUTES } from "@/shared/constants/routes.constants";
import { AuthStorageService } from "@/shared/services/auth-storage.service";
import { logout } from "@/Store/slices/authSlice";
import type { RootState } from "@/Store";

import {
  Home,
  FolderTree,
  FileText,
  MessageSquare,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import { getUserAvatar } from "@/shared/utils/avatar-utils";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  hasSubmenu?: boolean;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Inicio", icon: Home, path: ROUTES.DASHBOARD.HOME },
  {
    label: "Categorías",
    icon: FolderTree,
    path: ROUTES.DASHBOARD.CATEGORIES,
    hasSubmenu: true,
  },
  {
    label: "Solicitudes",
    icon: FileText,
    path: ROUTES.DASHBOARD.REQUESTS,
    hasSubmenu: true,
  },
  {
    label: "Chats",
    icon: MessageSquare,
    path: ROUTES.DASHBOARD.CHATS,
    hasSubmenu: true,
  },
];

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleLogout = () => {
    AuthStorageService.clearAuthData();
    dispatch(logout());
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  const toggleSubmenu = (label: string) => {
    const next = new Set(expandedItems);
    next.has(label) ? next.delete(label) : next.add(label);
    setExpandedItems(next);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const isActive = (path: string) =>
    path === ROUTES.DASHBOARD.HOME
      ? location.pathname === path
      : location.pathname.startsWith(path);

  const userAvatar = user?.id
    ? getUserAvatar(user.id, undefined, user.email)
    : undefined;

  return (
    <aside className="w-64 bg-card border-r flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatar} />
            <AvatarFallback>{user?.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium truncate">
            Bienvenido {user?.email ?? "Usuario"}
          </p>
        </div>

        <Link to={ROUTES.DASHBOARD.HOME}>
          <Button
            className={cn(
              "w-full justify-start gap-2",
              isActive(ROUTES.DASHBOARD.HOME) && "bg-blue-600 text-white"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const expanded = expandedItems.has(item.label);

          return (
            <div key={item.label}>
              {item.hasSubmenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={cn(
                      "w-full flex justify-between px-3 py-2 rounded-lg",
                      active && "bg-primary/10"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {expanded ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </>
              ) : (
                <Link to={item.path}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Button variant="ghost" onClick={toggleTheme} className="w-full gap-2">
          {theme === "light" ? <Sun /> : <Moon />}
          Cambiar tema
        </Button>

        <Button
          variant="ghost"
          className="w-full gap-2 text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
