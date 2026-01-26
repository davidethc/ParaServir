import { useMemo, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { isClient, isWorker } from "@/shared/constants/user-roles.constants";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes.constants";
import { useMe } from "@/shared/hooks/useMe";
import { useAuth } from "@/shared/hooks/useAuth";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { ServiceRequestController } from "@/modules/ServiceRequests/infra/http/controllers/service-request.controller";
import { AdvancedSearchWorkersUseCase } from "@/modules/workers/application/use-cases/advanced-search-workers.use-case";
import { ChatController } from "@/modules/Chat/infra/http/controllers/chat.controller";
import { ReviewController } from "@/modules/Reviews/infra/http/controllers/review.controller";
import { WorkerStatsController } from "@/modules/WorkerStats/infra/http/controllers/worker-stats.controller";
import type { WorkerStatsDto } from "@/modules/WorkerStats/application/dto/worker-stats.dto";
import type { ServiceRequestDto } from "@/modules/ServiceRequests/application/dto/service-request.dto";
import type { WorkerProfileDto } from "@/modules/workers/application/dto/worker-profile.dto";
import type { ConversationDto } from "@/modules/Chat/application/dto/conversation.dto";
import type { AdvancedSearchFiltersState } from "@/modules/workers/presentation/components/AdvancedSearchFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { 
  Search, 
  Bell, 
  CheckCircle2, 
  MessageSquare, 
  DollarSign, 
  Clipboard, 
  Wrench, 
  Leaf,
  ArrowRight,
  Eye,
  MapPin,
  Star,
  Shield,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Send,
  Briefcase,
  TrendingUp,
  Clock,
  XCircle,
  FileText,
  Percent,
  Plus
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { getWorkerAvatar } from "@/shared/utils/avatar-utils";
import { formatDistance } from "@/shared/utils/distance-utils";
import { ReviewRating } from "@/modules/Reviews/presentation/components/ReviewRating";
import { NotificationBell } from "@/modules/Notifications/presentation/components/NotificationBell";
import { SimpleSearchBar } from "@/modules/workers/presentation/components/SimpleSearchBar";
import { useCategories } from "@/shared/hooks/useCategories";
import { useFavorites } from "@/shared/hooks/useFavorites";
import { Heart } from "lucide-react";

export function DashboardHomePage() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useMe();
  const { getToken } = useAuth();
  const { unreadCount: notificationUnreadCount } = useNotifications();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const role = authUser?.role || user?.role;
  const { categories } = useCategories();
  const { favorites } = useFavorites();

  // State
  const [activeRequests, setActiveRequests] = useState<ServiceRequestDto[]>([]);
  const [recommendedWorkers, setRecommendedWorkers] = useState<WorkerProfileDto[]>([]);
  const [recentConversations, setRecentConversations] = useState<ConversationDto[]>([]);
  const [workerRatings, setWorkerRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [completedRequests, setCompletedRequests] = useState(0);
  const [workerStats, setWorkerStats] = useState<WorkerStatsDto | null>(null);

  // Controllers
  const requestController = useMemo(() => new ServiceRequestController(), []);
  const workerSearchUseCase = useMemo(() => new AdvancedSearchWorkersUseCase(), []);
  const chatController = useMemo(() => new ChatController(), []);
  const reviewController = useMemo(() => new ReviewController(), []);
  const workerStatsController = useMemo(() => new WorkerStatsController(), []);

  // Get user display name
  const getUserDisplayName = () => {
    if (!user?.email) return "Usuario";
    const emailName = user.email.split("@")[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  };

  // Get greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  // Load active requests
  const loadActiveRequests = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const params = {
        status: undefined, // Get all for counting
        as_client: isClient(role),
        as_worker: !isClient(role),
      };

      const allRequests = await requestController.list(params, token);
      
      // Filter active requests (pending, accepted, in_progress)
      const active = allRequests.filter(r => 
        ['pending', 'accepted', 'in_progress'].includes(r.status || '')
      );
      setActiveRequests(active.slice(0, 2)); // Show only first 2

      // Calculate total spent from completed requests
      const completed = allRequests.filter(r => r.status === 'completed');
      setCompletedRequests(completed.length);
      const spent = completed.reduce((sum, req) => {
        // Try to get price from request, default to 0
        const price = (req as any).total_price || (req as any).price || 0;
        return sum + (typeof price === 'number' ? price : 0);
      }, 0);
      setTotalSpent(spent);
    } catch (err) {
      console.error("Error loading requests:", err);
    }
  }, [getToken, requestController, role]);

  // Load recommended workers
  const loadRecommendedWorkers = useCallback(async () => {
    try {
      const token = getToken();
      
      const filters: AdvancedSearchFiltersState = {
        searchTerm: "",
        categoryId: "all",
        location: "",
        latitude: null,
        longitude: null,
        radius: 50,
        minPrice: null,
        maxPrice: null,
        minRating: null,
        minExperience: null,
        sortBy: "rating_desc", // Sort by rating for recommendations
      };

      const workers = await workerSearchUseCase.execute(filters, token || undefined);
      const validWorkers = workers.filter(w => w.first_name && w.first_name.trim() !== '').slice(0, 3);
      setRecommendedWorkers(validWorkers);

      // Load ratings
      const ratingsMap: Record<string, number> = {};
      for (const worker of validWorkers) {
        try {
          const reviews = await reviewController.getWorkerReviews(worker.id);
          ratingsMap[worker.id] = reviews.average_rating;
        } catch {
          ratingsMap[worker.id] = 0;
        }
      }
      setWorkerRatings(ratingsMap);
    } catch (err) {
      console.error("Error loading workers:", err);
    }
  }, [getToken, workerSearchUseCase, reviewController]);

  // Load recent conversations
  const loadConversations = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await chatController.getConversations(token);
      const conversations = response.conversations || [];
      setRecentConversations(conversations.slice(0, 3)); // Show only first 3
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  }, [getToken, chatController]);

  // Load worker stats
  const loadWorkerStats = useCallback(async () => {
    if (!isWorker(role)) return;
    
    try {
      const token = getToken();
      if (!token) return;

      const response = await workerStatsController.getStats(token);
      setWorkerStats(response.stats);
    } catch (err) {
      console.error("Error loading worker stats:", err);
    }
  }, [getToken, workerStatsController, role]);

  // Load all data
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      const promises = [
        loadActiveRequests(),
      ];

      if (isWorker(role)) {
        promises.push(loadWorkerStats());
      } else {
        promises.push(loadConversations());
      }

      await Promise.all(promises);
      setLoading(false);
    };

    void loadAll();
  }, [loadActiveRequests, loadConversations, loadWorkerStats, role]);

  // Get status badge color
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-[#5877B0] text-white text-xs font-semibold px-2.5 py-1 rounded-md">IN PROGRESS</Badge>;
      case 'pending':
        return <Badge className="bg-[#F4B840] text-white text-xs font-semibold px-2.5 py-1 rounded-md">PENDING APPROVAL</Badge>;
      case 'accepted':
        return <Badge className="bg-[#5877B0] text-white text-xs font-semibold px-2.5 py-1 rounded-md">ACCEPTED</Badge>;
      default:
        return null;
    }
  };

  // Get status progress percentage
  const getStatusProgress = (status?: string) => {
    switch (status) {
      case 'in_progress': return 60;
      case 'pending': return 30;
      case 'accepted': return 50;
      default: return 0;
    }
  };

  // Get service icon
  const getServiceIcon = (categoryName?: string) => {
    if (!categoryName) return <Wrench className="h-5 w-5" />;
    const lower = categoryName.toLowerCase();
    if (lower.includes('jardín') || lower.includes('planta') || lower.includes('césped')) {
      return <Leaf className="h-5 w-5" />;
    }
    return <Wrench className="h-5 w-5" />;
  };

  if (userLoading || loading) {
    return (
      <div className="h-screen bg-[#F9FAFE] flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  const activeRequestsCount = activeRequests.length;
  const unreadMessagesCount = recentConversations.filter(c => !c.last_message?.is_read).length || notificationUnreadCount;

  return (
    <div className="min-h-screen bg-[#F9FAFE]">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Dashboard Title */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isWorker(role) ? "Resumen de tu desempeño y actividad" : "Overview"}
              </p>
            </div>

            {/* Center: Search Bar - Solo para clientes */}
            {!isWorker(role) && (
              <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar servicios o profesionales..." 
                    className="pl-11 pr-4 bg-[#F1F3FB] border-0 h-12 rounded-xl text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate(`/workers?search=${encodeURIComponent(e.currentTarget.value)}`);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Right: Notifications & Avatar */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <NotificationBell />
              <Avatar 
                className="h-10 w-10 cursor-pointer hover:ring-2 ring-[#58A3B0] ring-offset-2 transition-all"
                onClick={() => navigate(ROUTES.DASHBOARD.SETTINGS)}
              >
                <AvatarImage src={user?.id ? getWorkerAvatar(user.id, undefined, getUserDisplayName()) : undefined} />
                <AvatarFallback className="bg-[#58A3B0] text-white font-semibold text-sm">
                  {getUserDisplayName().charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex gap-6 p-8">
        {/* Left Content - Main */}
        <div className="flex-1 space-y-8 min-w-0">
          {/* BUSCADOR PRINCIPAL - Solo para clientes */}
          {!isWorker(role) && (
            <SimpleSearchBar
              onSearch={(filters) => {
                const params = new URLSearchParams();
                if (filters.categoryId) params.set("category", filters.categoryId);
                if (filters.location) params.set("location", filters.location);
                if (filters.minRating) params.set("minRating", filters.minRating.toString());
                navigate(`/workers?${params.toString()}`);
              }}
              initialCategory="all"
              initialLocation=""
            />
          )}

          {/* Greeting */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-foreground leading-tight">
                {getGreeting()}, {getUserDisplayName()}
              </h2>
              <p className="text-muted-foreground mt-2 text-base">
                {isWorker(role) 
                  ? "Resumen de tus métricas principales y solicitudes activas."
                  : "Resumen de tus métricas principales, solicitudes y trabajadores favoritos."
                }
              </p>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap pt-1">
              {format(new Date(), "MMMM d, yyyy", { locale: es })}
            </div>
          </div>

          {/* Summary Cards - Different for Workers vs Clients */}
          {isWorker(role) && workerStats ? (
            <>
              {/* Métricas Principales - Solo las esenciales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Solicitudes Pendientes - La más importante para acción inmediata */}
                <Card className="bg-[#F4B840] text-white border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <Clock className="h-7 w-7 opacity-90" />
                      <Clock className="h-16 w-16 opacity-10 absolute -top-2 -right-2" />
                    </div>
                    <div className="text-4xl font-bold mb-2">{workerStats.requests.pending}</div>
                    <div className="text-base font-semibold opacity-95 mb-1">Pendientes</div>
                    <div className="text-xs opacity-80">Requieren tu atención</div>
                  </CardContent>
                </Card>

                {/* Rating Promedio */}
                <Card className="bg-[#58A3B0] text-white border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <Star className="h-7 w-7 opacity-90 fill-white" />
                      <Star className="h-16 w-16 opacity-10 absolute -top-2 -right-2" />
                    </div>
                    <div className="text-4xl font-bold mb-2">{workerStats.reviews.average_rating.toFixed(1)}</div>
                    <div className="text-base font-semibold opacity-95 mb-1">Rating</div>
                    <div className="text-xs opacity-80">{workerStats.reviews.total_reviews} {workerStats.reviews.total_reviews === 1 ? "reseña" : "reseñas"}</div>
                  </CardContent>
                </Card>

                {/* Ingresos Estimados */}
                <Card className="bg-[#6558B0] text-white border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign className="h-7 w-7 opacity-90" />
                      <DollarSign className="h-16 w-16 opacity-10 absolute -top-2 -right-2" />
                    </div>
                    <div className="text-4xl font-bold mb-2">${parseFloat(workerStats.earnings.estimated_earnings).toFixed(0)}</div>
                    <div className="text-base font-semibold opacity-95 mb-1">Ingresos</div>
                    <div className="text-xs opacity-80">De servicios completados</div>
                  </CardContent>
                </Card>

                {/* Servicios Activos */}
                <Card className="bg-[#2FB8A8] text-white border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <Briefcase className="h-7 w-7 opacity-90" />
                      <Briefcase className="h-16 w-16 opacity-10 absolute -top-2 -right-2" />
                    </div>
                    <div className="text-4xl font-bold mb-2">{workerStats.services.active_services}</div>
                    <div className="text-base font-semibold opacity-95 mb-1">Servicios</div>
                    <div className="text-xs opacity-80">Publicados activamente</div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Solicitudes Activas - Lo más importante para clientes */}
              <Card className="bg-[#58A3B0] text-white border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <Clipboard className="h-7 w-7 opacity-90" />
                    <Clipboard className="h-16 w-16 opacity-10 absolute -top-2 -right-2" />
                  </div>
                  <div className="text-4xl font-bold mb-2">{activeRequestsCount}</div>
                  <div className="text-base font-semibold opacity-95 mb-1">Solicitudes Activas</div>
                  <div className="text-xs opacity-80">Requieren seguimiento</div>
                </CardContent>
              </Card>

              {/* Solicitudes Completadas */}
              <Card className="bg-[#2FB8A8] text-white border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle2 className="h-7 w-7 opacity-90" />
                    <CheckCircle2 className="h-16 w-16 opacity-10 absolute -top-2 -right-2" />
                  </div>
                  <div className="text-4xl font-bold mb-2">{completedRequests}</div>
                  <div className="text-base font-semibold opacity-95 mb-1">Completadas</div>
                  <div className="text-xs opacity-80">Servicios finalizados</div>
                </CardContent>
              </Card>

              {/* Total Gastado */}
              <Card className="bg-[#6558B0] text-white border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="h-7 w-7 opacity-90" />
                    <DollarSign className="h-16 w-16 opacity-10 absolute -top-2 -right-2" />
                  </div>
                  <div className="text-4xl font-bold mb-2">${totalSpent.toFixed(0)}</div>
                  <div className="text-base font-semibold opacity-95 mb-1">Total Gastado</div>
                  <div className="text-xs opacity-80">En servicios completados</div>
                </CardContent>
              </Card>

              {/* Trabajadores Favoritos */}
              <Card className="bg-[#F4B840] text-white border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <Heart className="h-7 w-7 opacity-90 fill-white" />
                    <Heart className="h-16 w-16 opacity-10 absolute -top-2 -right-2" />
                  </div>
                  <div className="text-4xl font-bold mb-2">{favorites.length}</div>
                  <div className="text-base font-semibold opacity-95 mb-1">Favoritos</div>
                  <div className="text-xs opacity-80">Trabajadores guardados</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Active Requests Section - Solo para trabajadores */}
          {isWorker(role) && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Clipboard className="h-5 w-5 text-[#58A3B0]" />
                  <h3 className="text-2xl font-bold text-foreground">
                    Solicitudes Activas
                  </h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-[#58A3B0] hover:text-[#58A3B0] hover:bg-[#58A3B0]/10 text-sm font-medium"
                  onClick={() => navigate(ROUTES.DASHBOARD.REQUESTS)}
                >
                  Ver todas <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>

              <div className="space-y-4">
                {activeRequests.length === 0 ? (
                  <Card className="rounded-xl border border-dashed">
                    <CardContent className="p-12 text-center">
                      <Clipboard className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground font-medium">No hay solicitudes activas</p>
                      <p className="text-sm text-muted-foreground mt-2">Las nuevas solicitudes aparecerán aquí</p>
                    </CardContent>
                  </Card>
                ) : (
                  activeRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-lg transition-all rounded-xl border overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-5">
                        <div className="p-3.5 rounded-full bg-[#F4B840]/10 flex-shrink-0">
                          {getServiceIcon(request.category_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3 gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground text-lg mb-1">{request.description || request.category_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {request.scheduled_date 
                                  ? `Scheduled for ${format(new Date(request.scheduled_date), "MMMM d, 'at' h:mm a", { locale: es })}`
                                  : `Requested for ${format(new Date(request.created_at || new Date()), "MMM d", { locale: es })}`
                                }
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {getStatusBadge(request.status)}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 rounded-lg"
                                onClick={() => navigate(`${ROUTES.DASHBOARD.REQUESTS}/${request.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-9 w-9 rounded-lg"
                                onClick={() => navigate(`${ROUTES.DASHBOARD.CHATS}?conversation=${request.id}`)}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2.5 mt-4">
                            <div className="h-2 bg-[#F1F3FB] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#5877B0] transition-all rounded-full"
                                style={{ width: `${getStatusProgress(request.status)}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                              {request.status === 'in_progress' ? 'Pro confirmed' : request.status === 'pending' ? 'Waiting for response' : 'Pro confirmed'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Active Requests Section - Para clientes */}
          {!isWorker(role) && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Clipboard className="h-5 w-5 text-[#58A3B0]" />
                  <h3 className="text-2xl font-bold text-foreground">
                    Mis Solicitudes
                  </h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-[#58A3B0] hover:text-[#58A3B0] hover:bg-[#58A3B0]/10 text-sm font-medium"
                  onClick={() => navigate(ROUTES.DASHBOARD.REQUESTS)}
                >
                  Ver todas <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>

              <div className="space-y-4">
                {activeRequests.length === 0 ? (
                  <Card className="rounded-xl border border-dashed">
                    <CardContent className="p-12 text-center">
                      <Clipboard className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground font-medium">No tienes solicitudes activas</p>
                      <p className="text-sm text-muted-foreground mt-2">Publica una solicitud para encontrar trabajadores</p>
                      <Button 
                        className="mt-4 bg-[#58A3B0] hover:bg-[#58A3B0]/90 text-white"
                        onClick={() => navigate(ROUTES.DASHBOARD.REQUESTS_NEW)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Publicar Solicitud
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  activeRequests.map((request) => (
                    <Card key={request.id} className="hover:shadow-lg transition-all rounded-xl border overflow-hidden">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-5">
                          <div className="p-3.5 rounded-full bg-[#F4B840]/10 flex-shrink-0">
                            {getServiceIcon(request.category_name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3 gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground text-lg mb-1">{request.description || request.category_name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {request.scheduled_date 
                                    ? `Programado para ${format(new Date(request.scheduled_date), "d 'de' MMMM 'a las' h:mm a", { locale: es })}`
                                    : `Solicitado el ${format(new Date(request.created_at || new Date()), "d 'de' MMM", { locale: es })}`
                                  }
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {getStatusBadge(request.status)}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-9 w-9 rounded-lg"
                                  onClick={() => navigate(`${ROUTES.DASHBOARD.REQUESTS}/${request.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-9 w-9 rounded-lg"
                                  onClick={() => navigate(`${ROUTES.DASHBOARD.CHATS}?conversation=${request.id}`)}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar */}
        <aside className="w-80 space-y-6 flex-shrink-0">
          {/* Messages Section */}
          <Card className="rounded-xl border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Messages</CardTitle>
                {unreadMessagesCount > 0 && (
                  <Badge variant="destructive" className="text-xs h-5 px-2 font-semibold">
                    {unreadMessagesCount} New
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4">
              {recentConversations.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No recent messages
                </div>
              ) : (
                recentConversations.map((conversation) => (
                  <div 
                    key={conversation.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F1F3FB] cursor-pointer transition-colors"
                    onClick={() => navigate(`${ROUTES.DASHBOARD.CHATS}?conversation=${conversation.id}`)}
                  >
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={getWorkerAvatar(
                        conversation.other_user?.id || '',
                        conversation.other_user?.avatar_url,
                        conversation.other_user?.first_name || '',
                        conversation.other_user?.last_name || ''
                      )} />
                      <AvatarFallback className="bg-[#58A3B0] text-white text-xs font-semibold">
                        {(conversation.other_user?.first_name?.charAt(0) || 'U')}
                        {(conversation.other_user?.last_name?.charAt(0) || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {conversation.other_user?.first_name} {conversation.other_user?.last_name}
                        </p>
                        {conversation.last_message?.created_at && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(conversation.last_message.created_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate leading-relaxed">
                        {conversation.last_message?.content || 'No messages'}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full text-[#58A3B0] hover:text-[#58A3B0] hover:bg-[#58A3B0]/10 text-sm font-medium mt-2"
                onClick={() => navigate(ROUTES.DASHBOARD.CHATS)}
              >
                View All Messages
              </Button>
            </CardContent>
          </Card>

          {/* Promotional Card */}
          <Card className="bg-[#58A3B0] text-white border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-5">
                <Shield className="h-14 w-14 opacity-95" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Get ParaServir Plus</h3>
              <p className="text-sm opacity-95 text-center mb-6 leading-relaxed">
                Priority booking and 0% service fees on your next 3 jobs.
              </p>
              <Button 
                className="w-full bg-[#6558B0] hover:bg-[#6558B0]/90 text-white h-11 font-semibold rounded-lg shadow-md"
                onClick={() => {
                  // Navigate to upgrade page or show modal
                  console.log("Upgrade to Plus");
                }}
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
