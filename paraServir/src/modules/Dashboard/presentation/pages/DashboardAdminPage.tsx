import { useEffect, useState } from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { 
  Users, 
  Briefcase, 
  FileText, 
  Star, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import { HttpClientService } from "@/shared/services/http-client.service";
import { API_CONFIG } from "@/modules/Reviews/infra/http/api.config";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";

interface AdminStats {
  total_users: number;
  total_workers: number;
  total_requests: number;
  pending_verifications: number;
  total_reviews: number;
}

interface PendingWorker {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  verification_status: string;
  certification_url: string | null;
  years_experience: number;
  profile_created_at: string;
}

export function DashboardAdminPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingWorkers, setPendingWorkers] = useState<PendingWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);

  const httpClient = new HttpClientService({ baseUrl: API_CONFIG.baseUrl });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = getToken();
    if (!token) {
      setError("Sesión expirada");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [statsRes, workersRes] = await Promise.all([
        httpClient.get<{ status: string; stats: AdminStats }>(
          '/admin/dashboard',
          { Authorization: `Bearer ${token}` }
        ),
        httpClient.get<{ status: string; workers: PendingWorker[] }>(
          '/admin/workers/pending',
          { Authorization: `Bearer ${token}` }
        )
      ]);

      setStats(statsRes.stats);
      setPendingWorkers(workersRes.workers || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar datos";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (workerId: string, action: 'approve' | 'reject') => {
    const token = getToken();
    if (!token) return;

    setVerifying(workerId);
    setError(null);

    try {
      await httpClient.put(
        `/admin/workers/${workerId}/verify`,
        { action },
        { Authorization: `Bearer ${token}` }
      );

      // Recargar datos
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al procesar verificación";
      setError(errorMessage);
    } finally {
      setVerifying(null);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Panel de Administración" />
        <LoadingState message="Cargando datos del administrador..." variant="list" count={3} />
      </PageContainer>
    );
  }

  if (error && !stats) {
    return (
      <PageContainer>
        <PageHeader title="Panel de Administración" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Panel de Administración" 
        description="Gestiona verificaciones y estadísticas del sistema"
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{stats.total_users}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Trabajadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{stats.total_workers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Solicitudes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{stats.total_requests}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-2xl font-bold">{stats.pending_verifications}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Reseñas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{stats.total_reviews}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trabajadores pendientes */}
        <Card>
          <CardHeader>
            <CardTitle>Trabajadores Pendientes de Verificación</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingWorkers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay trabajadores pendientes de verificación
              </p>
            ) : (
              <div className="space-y-4">
                {pendingWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar>
                        <AvatarFallback>
                          {worker.first_name[0]}{worker.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {worker.first_name} {worker.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{worker.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {worker.years_experience} años de experiencia
                          </span>
                          {worker.certification_url && (
                            <a
                              href={worker.certification_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Ver certificación
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleVerify(worker.id, 'approve')}
                        disabled={verifying === worker.id}
                      >
                        {verifying === worker.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Aprobar
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerify(worker.id, 'reject')}
                        disabled={verifying === worker.id}
                      >
                        {verifying === worker.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
