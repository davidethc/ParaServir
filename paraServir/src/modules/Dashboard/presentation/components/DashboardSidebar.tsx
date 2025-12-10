import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";
import { useDispatch, useSelector } from "react-redux";
import { AuthStorageService } from "@/shared/services/auth-storage.service";
import {
  LayoutDashboard,
  Home,
  FolderTree,
  FileText,
  MessageSquare,
  HelpCircle,
  Settings,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { logout } from "@/Store/slices/authSlice";
import type { RootState } from "@/Store";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  hasSubmenu?: boolean;
  badge?: number;
}

const mainNavItems: NavItem[] = [
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
    // Limpiar todos los datos de autenticación usando servicio centralizado
    AuthStorageService.clearAuthData();
    dispatch(logout());
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  const toggleSubmenu = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const isActive = (path: string) => {
    if (path === ROUTES.DASHBOARD.HOME) {
      return location.pathname === ROUTES.DASHBOARD.HOME;
    }
    return location.pathname.startsWith(path);
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user?.email) return "Usuario";
    // Extraer el nombre del email (parte antes del @) y capitalizar
    const emailName = user.email.split("@")[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Header con perfil */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={user?.email || "Usuario"} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Bienvenido {getUserDisplayName()}
            </p>
          </div>
        </div>

        {/* Botón Dashboard */}
        <Link to={ROUTES.DASHBOARD.HOME}>
          <Button
            variant={isActive(ROUTES.DASHBOARD.HOME) ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              isActive(ROUTES.DASHBOARD.HOME) && "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const expanded = expandedItems.has(item.label);

          return (
            <div key={item.path}>
              {item.hasSubmenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    {expanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {/* Submenús pueden agregarse aquí */}
                      <Link
                        to={item.path}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                      >
                        Ver todos
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <Link to={item.path}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2",
                      active && "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer con utilidades */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* Centro de Ayuda */}
        <Link to={ROUTES.DASHBOARD.HELP}>
          <Button variant="ghost" className="w-full justify-start gap-2 relative">
            <HelpCircle className="h-4 w-4" />
            Centro de Ayuda
            <Badge
              variant="destructive"
              className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              8
            </Badge>
          </Button>
        </Link>

        {/* Configuración */}
        <Link to={ROUTES.DASHBOARD.SETTINGS}>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </Button>
        </Link>

        {/* Toggle de tema */}
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
          <Button
            variant={theme === "light" ? "default" : "ghost"}
            size="sm"
            onClick={toggleTheme}
            className={cn(
              "flex-1 gap-2",
              theme === "light" && "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            <Sun className="h-4 w-4" />
            Claro
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "ghost"}
            size="sm"
            onClick={toggleTheme}
            className={cn(
              "flex-1 gap-2",
              theme === "dark" && "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            <Moon className="h-4 w-4" />
            Oscuro
          </Button>
        </div>

        {/* Cerrar sesión */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}
