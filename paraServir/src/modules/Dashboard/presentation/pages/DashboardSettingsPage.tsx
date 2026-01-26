import { useState, useEffect, useMemo, useCallback } from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { UserProfileCard } from "@/modules/Users/presentation/components/UserProfileCard";
import { EditUserForm } from "@/modules/Users/presentation/components/EditUserForm";
import { DeleteAccountModal } from "@/modules/Users/presentation/components/DeleteAccountModal";
import { WorkerReviewsList } from "@/modules/Reviews/presentation/components/WorkerReviewsList";
import { ClientReviewsList } from "@/modules/Reviews/presentation/components/ClientReviewsList";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { useMe } from "@/shared/hooks/useMe";
import { AlertCircle, CheckCircle2, Mail, Calendar, Settings, Star, Activity, Trash2, Briefcase, FileText, DollarSign, MapPin, User } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import type { UserDto } from "@/modules/Users/application/dto/user.dto";
import { DeleteUserUseCase } from "@/modules/Users/application/use-cases/delete-user.use-case";
import { useAuth } from "@/shared/hooks/useAuth";
import { useDispatch } from "react-redux";
import { logout } from "@/Store/slices/authSlice";
import { AuthStorageService } from "@/shared/services/auth-storage.service";
import { isWorker, isClient } from "@/shared/constants/user-roles.constants";
import { ROUTES } from "@/shared/constants/routes.constants";
import { useNavigate } from "react-router-dom";
import { UpdateLocationForm } from "@/modules/Geolocation/presentation/components/UpdateLocationForm";
import { AvailabilityCalendar } from "@/modules/workers/presentation/components/AvailabilityCalendar";
import { WorkerStatsController } from "@/modules/WorkerStats/infra/http/controllers/worker-stats.controller";
import type { WorkerStatsDto } from "@/modules/WorkerStats/application/dto/worker-stats.dto";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { getUserAvatar } from "@/shared/utils/avatar-utils";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function DashboardSettingsPage() {
  const { user, loading, error, refetch } = useMe();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [workerStats, setWorkerStats] = useState<WorkerStatsDto | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const workerStatsController = useMemo(() => new WorkerStatsController(), []);

  // Load worker stats if worker
  useEffect(() => {
    const loadWorkerStats = async () => {
      if (!user || !isWorker(user.role)) return;
      
      setLoadingStats(true);
      try {
        const token = getToken();
        if (!token) return;

        const response = await workerStatsController.getStats(token);
        setWorkerStats(response.stats);
      } catch (err) {
        console.error("Error loading worker stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    void loadWorkerStats();
  }, [user, getToken, workerStatsController]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] bg-[#F9FAFE] flex items-center justify-center">
        <LoadingState message="Cargando perfil..." variant="list" count={3} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="h-[calc(100vh-64px)] bg-[#F9FAFE] p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "No se pudo cargar la información del perfil"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (lastName) return lastName[0].toUpperCase();
    return "U";
  };
  const initials = getInitials();
  const displayAvatar = getUserAvatar(user.id, user.avatar_url, fullName);
  const formattedDate = format(new Date(user.created_at), "MMM d, yyyy", { locale: enUS });

  return (
    <div className="h-[calc(100vh-64px)] bg-[#F9FAFE] flex flex-col overflow-hidden">
      {/* Header with Profile Info */}
      <div className="bg-white border-b border-border px-8 py-8 shadow-sm">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={displayAvatar} alt={fullName} />
              <AvatarFallback className="bg-[#58A3B0] text-white text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {user.is_verified && (
              <div className="absolute bottom-0 right-0 bg-[#2FB8A8] rounded-full p-1.5 border-4 border-white">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{fullName}</h1>
              {isWorker(user.role) && (
                <Badge className="bg-[#58A3B0] text-white px-3 py-1 text-sm font-semibold">
                  Profesional
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Miembro desde {formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-border px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent h-14 p-0 gap-6">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#58A3B0] data-[state=active]:bg-transparent rounded-none pb-2 px-0 text-base font-medium"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#58A3B0] data-[state=active]:bg-transparent rounded-none pb-2 px-0 text-base font-medium"
            >
              Actividad
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-[#58A3B0] data-[state=active]:bg-transparent rounded-none pb-2 px-0 text-base font-medium"
            >
              Configuración
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isWorker(user.role) ? (
                <>
                  <Card className="border border-border rounded-xl shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Total Proyectos</p>
                        <Briefcase className="h-5 w-5 text-[#58A3B0]" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">
                        {loadingStats ? "..." : workerStats?.requests.total || 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-border rounded-xl shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Completados</p>
                        <CheckCircle2 className="h-5 w-5 text-[#2FB8A8]" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">
                        {loadingStats ? "..." : workerStats?.requests.completed || 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-border rounded-xl shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Proyectos Activos</p>
                        <FileText className="h-5 w-5 text-[#F4B840]" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">
                        {loadingStats ? "..." : (workerStats?.requests.in_progress || 0) + (workerStats?.requests.accepted || 0)}
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="border border-border rounded-xl shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Total Solicitudes</p>
                        <FileText className="h-5 w-5 text-[#58A3B0]" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">-</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-border rounded-xl shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Completados</p>
                        <CheckCircle2 className="h-5 w-5 text-[#2FB8A8]" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">-</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-border rounded-xl shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Solicitudes Activas</p>
                        <Briefcase className="h-5 w-5 text-[#F4B840]" />
                      </div>
                      <p className="text-3xl font-bold text-foreground">-</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Profile Information */}
            <Card className="border border-border rounded-xl shadow-sm bg-white">
              <CardHeader>
                <CardTitle>Información del Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Correo</p>
                    <p className="text-sm text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Teléfono</p>
                    <p className="text-sm text-foreground">{user.phone || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Ubicación</p>
                    <p className="text-sm text-foreground">{user.location || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Miembro desde</p>
                    <p className="text-sm text-foreground">{formattedDate}</p>
                  </div>
                </div>
                {isWorker(user.role) && user.worker_profile && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold mb-3">Información Profesional</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Años de Experiencia</p>
                          <p className="text-sm text-foreground">{user.worker_profile.years_experience || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Estado de Verificación</p>
                          <Badge variant={
                            user.worker_profile.verification_status === 'verified' ? 'default' :
                            user.worker_profile.verification_status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {user.worker_profile.verification_status === 'verified' ? 'Verificado' :
                             user.worker_profile.verification_status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6 space-y-6">
            {/* Reviews Section */}
            {isWorker(user.role) && user.id ? (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Reseñas</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Reseñas que has recibido de clientes
                </p>
                <WorkerReviewsList workerId={user.id} showAverage={true} />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Mis Reseñas</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Reseñas que has escrito para trabajadores
                </p>
                <ClientReviewsList showAverage={true} />
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Edit Personal Profile */}
            <Card className="border border-border rounded-xl shadow-sm bg-white transition-all duration-300 hover:shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-1">Perfil Personal</CardTitle>
                      <CardDescription className="text-sm">
                        Gestiona tu información personal: nombre, correo, teléfono y otros datos de contacto
                      </CardDescription>
                    </div>
                  </div>
                  {!editing && (
                    <Button 
                      onClick={() => setEditing(true)} 
                      variant="outline"
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Editar Perfil
                    </Button>
                  )}
                </div>
              </CardHeader>
              {editing ? (
                <CardContent className="pt-6 animate-in slide-in-from-top-2 duration-300">
                  <EditUserForm
                    user={user}
                    onSuccess={async (updatedUser: UserDto) => {
                      await refetch();
                      setEditing(false);
                    }}
                    onCancel={() => setEditing(false)}
                  />
                </CardContent>
              ) : (
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Nombre completo</p>
                      <p className="text-sm font-semibold">{fullName}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Correo electrónico</p>
                      <p className="text-sm font-semibold">{user.email}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Teléfono</p>
                      <p className="text-sm font-semibold">{user.phone || "No especificado"}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Ubicación</p>
                      <p className="text-sm font-semibold">{user.location || "No especificado"}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Location for Workers */}
            {isWorker(user.role) && (
              <Card className="border border-border rounded-xl shadow-sm bg-white overflow-hidden transition-all duration-300 hover:shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#58A3B0]/5 to-[#2FB8A8]/5 border-b border-border">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#58A3B0] rounded-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">Ubicación de Trabajo</CardTitle>
                      <CardDescription className="text-sm">
                        Actualiza tu ubicación para que los clientes puedan encontrarte más fácilmente cuando buscan servicios cerca de su área
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <UpdateLocationForm />
                </CardContent>
              </Card>
            )}

            {/* Professional Profile for Workers */}
            {isWorker(user.role) && (
              <Card className="border border-border rounded-xl shadow-sm bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Perfil Profesional</CardTitle>
                      <CardDescription>
                        Gestiona tu información profesional, experiencia y servicios
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => navigate(ROUTES.WORKER.COMPLETE_PROFILE)}
                      variant="outline"
                    >
                      {user.worker_profile ? "Actualizar Perfil Profesional" : "Completar Perfil Profesional"}
                    </Button>
                  </div>
                </CardHeader>
                {user.worker_profile ? (
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Años de experiencia</p>
                        <p className="text-sm">{user.worker_profile.years_experience || 'No especificado'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Estado de verificación</p>
                        <Badge variant={
                          user.worker_profile.verification_status === 'verified' ? 'default' :
                          user.worker_profile.verification_status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {user.worker_profile.verification_status === 'verified' ? 'Verificado' :
                           user.worker_profile.verification_status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Estado</p>
                        <Badge variant={user.worker_profile.is_active ? 'default' : 'secondary'}>
                          {user.worker_profile.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                ) : null}
              </Card>
            )}

            {/* Availability for Workers */}
            {isWorker(user.role) && (
              <Card className="border border-border rounded-xl shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                  <CardDescription>
                    Set your weekly working schedule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AvailabilityCalendar readonly={false} onSave={refetch} />
                </CardContent>
              </Card>
            )}

            {/* Danger Zone */}
            <Card className="border-destructive/50 border rounded-xl shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions related to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Eliminar Cuenta</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    {deleteError && (
                      <Alert variant="destructive" className="mb-4">
                        {deleteError}
                      </Alert>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={deleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar Mi Cuenta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Account Modal */}
      {user && (
        <DeleteAccountModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          onConfirm={async () => {
            setDeleting(true);
            setDeleteError(null);

            try {
              const token = getToken();
              if (!token) {
                setDeleteError("Session expired. Please log in again.");
                return;
              }

              const useCase = new DeleteUserUseCase();
              await useCase.execute(user.id, token);

              // Clear auth data
              AuthStorageService.clearAuthData();
              dispatch(logout());

              // Redirect to login
              navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : "Error deleting account";
              setDeleteError(errorMessage);
            } finally {
              setDeleting(false);
            }
          }}
          loading={deleting}
          userEmail={user.email}
        />
      )}
    </div>
  );
}
