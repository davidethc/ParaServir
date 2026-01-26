import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { useFavorites } from "@/shared/hooks/useFavorites";
import { ReviewController } from "@/modules/Reviews/infra/http/controllers/review.controller";
import { useAuth } from "@/shared/hooks/useAuth";
import { 
  MapPin, 
  CheckCircle2,
  AlertCircle,
  Heart,
  Star
} from "lucide-react";
import { ReviewRating } from "@/modules/Reviews/presentation/components/ReviewRating";
import { getWorkerAvatar } from "@/shared/utils/avatar-utils";
import { formatDistance } from "@/shared/utils/distance-utils";
import { ROUTES } from "@/shared/constants/routes.constants";
import { isClient } from "@/shared/constants/user-roles.constants";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { toast } from "sonner";

export function DashboardFavoritesPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;

  const { favorites, removeFavorite, toggleFavorite, loading, error, reloadFavorites } = useFavorites();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const reviewController = new ReviewController();

  // Verificar que el usuario sea cliente
  useEffect(() => {
    if (role && !isClient(role)) {
      navigate(ROUTES.DASHBOARD.HOME);
    }
  }, [role, navigate]);

  // Cargar ratings de cada trabajador favorito
  useEffect(() => {
    const loadRatings = async () => {
      if (favorites.length === 0) return;

      const ratingsMap: Record<string, number> = {};
      for (const favorite of favorites) {
        try {
          const reviews = await reviewController.getWorkerReviews(favorite.worker_id);
          ratingsMap[favorite.worker_id] = reviews.average_rating;
        } catch {
          ratingsMap[favorite.worker_id] = 0;
        }
      }
      setRatings(ratingsMap);
    };

    void loadRatings();
  }, [favorites, reviewController]);

  const handleRemoveFavorite = async (workerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovingIds(prev => new Set([...prev, workerId]));

    try {
      await removeFavorite(workerId);
      toast.success("Eliminado de favoritos");
      await reloadFavorites();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar favorito";
      toast.error(errorMessage);
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(workerId);
        return newSet;
      });
    }
  };

  if (!isClient(role)) {
    return (
      <PageContainer>
        <PageHeader 
          title="Mis Favoritos" 
          description="Trabajadores que has guardado como favoritos"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta página solo está disponible para clientes
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader 
          title="Mis Favoritos" 
          description="Trabajadores que has guardado como favoritos"
        />
        <LoadingState message="Cargando favoritos..." variant="grid" count={6} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader 
          title="Mis Favoritos" 
          description="Trabajadores que has guardado como favoritos"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader 
          title="Mis Favoritos" 
          description={`Tienes ${favorites.length} ${favorites.length === 1 ? 'trabajador favorito' : 'trabajadores favoritos'}`}
        />

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={<Heart className="h-12 w-12 text-muted-foreground" />}
                title="No tienes favoritos aún"
                description="Agrega trabajadores a tus favoritos para encontrarlos fácilmente más tarde"
                action={
                  <Button onClick={() => navigate("/workers")}>
                    Buscar Trabajadores
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((favorite) => {
              const fullName = `${favorite.first_name} ${favorite.last_name}`;
              const initials = `${favorite.first_name[0]}${favorite.last_name[0]}`.toUpperCase();
              const rating = ratings[favorite.worker_id] || 0;
              const isRemoving = removingIds.has(favorite.worker_id);

              return (
                <Card 
                  key={favorite.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow relative"
                  onClick={() => navigate(`/worker/${favorite.worker_id}`)}
                >
                  <CardContent className="p-6">
                    {/* Botón de eliminar favorito - esquina superior derecha */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 h-8 w-8 z-10"
                      onClick={(e) => handleRemoveFavorite(favorite.worker_id, e)}
                      disabled={isRemoving}
                      aria-label="Eliminar de favoritos"
                    >
                      <Heart 
                        className="h-4 w-4 fill-red-500 text-red-500"
                      />
                    </Button>
                    
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage 
                          src={getWorkerAvatar(
                            favorite.worker_id, 
                            favorite.avatar_url, 
                            favorite.first_name, 
                            favorite.last_name
                          )} 
                          alt={fullName} 
                        />
                        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{fullName}</h3>
                          {favorite.verification_status === "verified" && (
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        {rating > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <ReviewRating rating={rating} size="sm" showValue />
                            <span className="text-xs text-muted-foreground">
                              ({rating.toFixed(1)})
                            </span>
                          </div>
                        )}
                        {(favorite.location || favorite.distance_km) && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
                            {favorite.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{favorite.location}</span>
                              </div>
                            )}
                            {favorite.distance_km && formatDistance(favorite.distance_km) && (
                              <>
                                {favorite.location && <span className="text-muted-foreground/50">•</span>}
                                <span className="text-primary font-medium">
                                  {formatDistance(favorite.distance_km)}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {favorite.years_experience && (
                        <div className="text-sm text-muted-foreground">
                          {favorite.years_experience} años de experiencia
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {favorite.verification_status === "verified" && (
                          <Badge variant="default" className="text-xs">Verificado</Badge>
                        )}
                        {favorite.is_active && (
                          <Badge variant="secondary" className="text-xs">Disponible</Badge>
                        )}
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-4" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/worker/${favorite.worker_id}`);
                      }}
                    >
                      Ver Perfil
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
