import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";
import { useDispatch, useSelector } from "react-redux";
import { AuthStorageService } from "@/shared/services/auth-storage.service";
import { isWorker, isClient, USER_ROLES } from "@/shared/constants/user-roles.constants";
import {
  LayoutDashboard,
  Home,
  FolderTree,
  FileText,
  MessageSquare,
  Briefcase,
  Bell,
  Settings,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  ChevronUp,
  Heart,
  TrendingUp,
  Wrench,
  Plus,
  Star,
  User,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { logout } from "@/Store/slices/authSlice";
import type { RootState } from "@/Store";
import { getUserAvatar } from "@/shared/utils/avatar-utils";
import { useNotifications } from "@/shared/hooks/useNotifications";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  hasSubmenu?: boolean;
  badge?: number;
}

const userNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: ROUTES.DASHBOARD.HOME },
  { label: "Búsqueda", icon: FolderTree, path: ROUTES.DASHBOARD.CATEGORIES },
  { label: "Solicitudes", icon: FileText, path: ROUTES.DASHBOARD.REQUESTS, hasSubmenu: true },
  { label: "Chats", icon: MessageSquare, path: ROUTES.DASHBOARD.CHATS, hasSubmenu: true },
  { label: "Reseñas", icon: Star, path: ROUTES.DASHBOARD.REVIEWS },
  { label: "Perfil", icon: User, path: ROUTES.DASHBOARD.SETTINGS },
];

const workerNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: ROUTES.DASHBOARD.HOME },
  { label: "Mis servicios", icon: Briefcase, path: ROUTES.DASHBOARD.SERVICES },
  { label: "Solicitudes", icon: FileText, path: ROUTES.DASHBOARD.REQUESTS, hasSubmenu: true },
  { label: "Chats", icon: MessageSquare, path: ROUTES.DASHBOARD.CHATS, hasSubmenu: true },
  { label: "Mis reseñas", icon: Star, path: ROUTES.DASHBOARD.REVIEWS },
  { label: "Plantillas", icon: FileText, path: ROUTES.DASHBOARD.MESSAGE_TEMPLATES },
];

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { unreadCount } = useNotifications();

  const role = user?.role || AuthStorageService.getUserRole() || USER_ROLES.USUARIO;
  const navItems = isWorker(role) ? workerNavItems : userNavItems;

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

  // Generar avatar para el usuario
  const userAvatar = user?.id 
    ? getUserAvatar(user.id, undefined, getUserDisplayName())
    : undefined;

  return (
    <aside className="w-64 bg-[#F1F3FB] border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo y título */}
      <div className="p-4 border-b border-border">
        <Link to={ROUTES.DASHBOARD.HOME} className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-[#58A3B0] rounded-lg">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">ParaServir</h2>
            <p className="text-xs text-muted-foreground">Marketplace de servicios</p>
          </div>
        </Link>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
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
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-accent-soft hover:text-primary"
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
                        className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent-soft rounded-lg transition-colors"
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
                      "w-full justify-start gap-2 font-medium transition-all duration-200",
                      active 
                        ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" 
                        : "text-muted-foreground hover:bg-accent-soft hover:text-primary"
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
      <div className="p-4 border-t border-border space-y-2">
        {/* Notificaciones */}
        <Link to={ROUTES.DASHBOARD.NOTIFICATIONS}>
          <Button variant="ghost" className="w-full justify-start gap-2 relative">
            <Bell className="h-4 w-4" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
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
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <Button
            variant={theme === "light" ? "default" : "ghost"}
            size="sm"
            onClick={toggleTheme}
            className="flex-1 gap-2"
          >
            <Sun className="h-4 w-4" />
            Claro
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "ghost"}
            size="sm"
            onClick={toggleTheme}
            className="flex-1 gap-2"
          >
            <Moon className="h-4 w-4" />
            Oscuro
          </Button>
        </div>

        {/* Cerrar sesión */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive-light"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>

        {/* Botón "Publicar Trabajo" solo para clientes */}
        {isClient(role) && (
          <Button
            className="w-full bg-[#58A3B0] hover:bg-[#58A3B0]/90 text-white gap-2 mt-2"
            onClick={() => navigate(ROUTES.DASHBOARD.REQUESTS_NEW)}
          >
            <Plus className="h-4 w-4" />
            Publicar Trabajo
          </Button>
        )}
      </div>
    </aside>
  );
}
