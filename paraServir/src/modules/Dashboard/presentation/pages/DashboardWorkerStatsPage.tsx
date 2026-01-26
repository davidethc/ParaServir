import { useEffect, useState, useMemo } from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { WorkerStatsController } from "@/modules/WorkerStats/infra/http/controllers/worker-stats.controller";
import { useAuth } from "@/shared/hooks/useAuth";
import { isWorker } from "@/shared/constants/user-roles.constants";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { 
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Star,
  Briefcase,
  FileText
} from "lucide-react";
import type { WorkerStatsDto } from "@/modules/WorkerStats/application/dto/worker-stats.dto";

export function DashboardWorkerStatsPage() {
  const { getToken } = useAuth();
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;

  const [stats, setStats] = useState<WorkerStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statsController = useMemo(() => new WorkerStatsController(), []);

  useEffect(() => {
    const loadStats = async () => {
      if (!isWorker(role)) {
        setError("Solo los trabajadores pueden ver estadísticas");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = getToken();
        if (!token) {
          setError("Sesión expirada. Inicia sesión nuevamente.");
          return;
        }

        const response = await statsController.getStats(token);
        setStats(response.stats);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar estadísticas";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, [statsController, getToken, role]);

  if (!isWorker(role)) {
    return (
      <PageContainer>
        <PageHeader 
          title="Estadísticas" 
          description="Estadísticas de tu desempeño como trabajador"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta página solo está disponible para trabajadores
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader 
          title="Estadísticas" 
          description="Estadísticas de tu desempeño como trabajador"
        />
        <LoadingState message="Cargando estadísticas..." variant="grid" count={6} />
      </PageContainer>
    );
  }

  if (error || !stats) {
    return (
      <PageContainer>
        <PageHeader 
          title="Estadísticas" 
          description="Estadísticas de tu desempeño como trabajador"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Error al cargar estadísticas"}</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader 
          title="Mis Estadísticas" 
          description="Resumen de tu desempeño y actividad como trabajador"
        />

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Solicitudes Totales
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.requests.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.requests.completed} completadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rating Promedio
              </CardTitle>
              <Star className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reviews.average_rating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.reviews.total_reviews} {stats.reviews.total_reviews === 1 ? "reseña" : "reseñas"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ingresos Estimados
              </CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${parseFloat(stats.earnings.estimated_earnings).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                De servicios completados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Servicios Activos
              </CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.services.active_services}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Disponibles actualmente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Solicitudes por Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Solicitudes por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <Clock className="h-8 w-8 text-yellow-500 mb-2" />
                <div className="text-2xl font-bold">{stats.requests.pending}</div>
                <div className="text-xs text-muted-foreground mt-1">Pendientes</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold">{stats.requests.accepted}</div>
                <div className="text-xs text-muted-foreground mt-1">Aceptadas</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                <div className="text-2xl font-bold">{stats.requests.in_progress}</div>
                <div className="text-xs text-muted-foreground mt-1">En Progreso</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-success mb-2" />
                <div className="text-2xl font-bold">{stats.requests.completed}</div>
                <div className="text-xs text-muted-foreground mt-1">Completadas</div>
              </div>
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <XCircle className="h-8 w-8 text-destructive mb-2" />
                <div className="text-2xl font-bold">{stats.requests.cancelled}</div>
                <div className="text-xs text-muted-foreground mt-1">Canceladas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasas de Aceptación y Completitud */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tasa de Aceptación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">
                {stats.rates.acceptance_rate}%
              </div>
              <p className="text-sm text-muted-foreground">
                Solicitudes aceptadas de {stats.requests.total} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Tasa de Completitud
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-success mb-2">
                {stats.rates.completion_rate}%
              </div>
              <p className="text-sm text-muted-foreground">
                Solicitudes completadas de {stats.requests.accepted} aceptadas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
