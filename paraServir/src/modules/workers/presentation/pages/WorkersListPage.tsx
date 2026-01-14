import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { ListWorkersUseCase } from "../../application/use-cases/list-workers.use-case";
import { ReviewController } from "@/modules/Reviews/infra/http/controllers/review.controller";
import { useCategories } from "@/shared/hooks/useCategories";
import type { WorkerProfileDto } from "../../application/dto/worker-profile.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { 
  MapPin, 
  Search,
  Star,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { ReviewRating } from "@/modules/Reviews/presentation/components/ReviewRating";
import { getWorkerAvatar } from "@/shared/utils/avatar-utils";

export function WorkersListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getToken } = useAuth();
  const { categories } = useCategories();

  const [workers, setWorkers] = useState<WorkerProfileDto[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerProfileDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "all");
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const listWorkersUseCase = useMemo(() => new ListWorkersUseCase(), []);
  const reviewController = useMemo(() => new ReviewController(), []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getToken();
        const workersData = await listWorkersUseCase.execute(token || undefined);
        
        // Filtrar solo trabajadores activos
        const activeWorkers = workersData.filter(w => w.is_active);
        setWorkers(activeWorkers);

        // Cargar ratings de cada trabajador
        const ratingsMap: Record<string, number> = {};
        for (const worker of activeWorkers) {
          try {
            const reviews = await reviewController.getWorkerReviews(worker.id);
            ratingsMap[worker.id] = reviews.average_rating;
          } catch {
            ratingsMap[worker.id] = 0;
          }
        }
        setRatings(ratingsMap);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar trabajadores";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [listWorkersUseCase, reviewController, getToken]);

  // Actualizar URL cuando cambian los filtros
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedCategory, setSearchParams]);

  // Filtrar trabajadores
  useEffect(() => {
    let filtered = [...workers];

    // Filtro por búsqueda (nombre, ubicación)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(worker => 
        worker.first_name.toLowerCase().includes(term) ||
        worker.last_name.toLowerCase().includes(term) ||
        worker.location?.toLowerCase().includes(term) ||
        `${worker.first_name} ${worker.last_name}`.toLowerCase().includes(term)
      );
    }

    // Filtro por categoría (esto requeriría servicios, por ahora lo dejamos)
    // TODO: Filtrar por categoría cuando se carguen servicios

    setFilteredWorkers(filtered);
  }, [workers, searchTerm, selectedCategory]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader 
          title="Buscar Trabajadores" 
          description="Encuentra profesionales para tus necesidades"
        />
        <LoadingState message="Cargando trabajadores..." variant="grid" count={6} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader 
          title="Buscar Trabajadores" 
          description="Encuentra profesionales para tus necesidades"
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
          title="Buscar Trabajadores" 
          description="Encuentra profesionales para tus necesidades"
        />

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de trabajadores */}
        {filteredWorkers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? "No se encontraron trabajadores con esos criterios" : "No hay trabajadores disponibles"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.map((worker) => {
              const fullName = `${worker.first_name} ${worker.last_name}`;
              const initials = `${worker.first_name[0]}${worker.last_name[0]}`.toUpperCase();
              const rating = ratings[worker.id] || 0;

              return (
                <Card 
                  key={worker.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/worker/${worker.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage 
                          src={getWorkerAvatar(worker.id, worker.avatar_url, worker.first_name, worker.last_name)} 
                          alt={fullName} 
                        />
                        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{fullName}</h3>
                          {worker.verification_status === "verified" && (
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
                        {worker.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{worker.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {worker.years_experience && (
                        <div className="text-sm text-muted-foreground">
                          {worker.years_experience} años de experiencia
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {worker.verification_status === "verified" && (
                          <Badge variant="default" className="text-xs">Verificado</Badge>
                        )}
                        {worker.is_active && (
                          <Badge variant="secondary" className="text-xs">Disponible</Badge>
                        )}
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-4" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/worker/${worker.id}`);
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

