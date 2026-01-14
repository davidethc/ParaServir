import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { UserProfileCard } from "@/modules/Users/presentation/components/UserProfileCard";
import { EditUserForm } from "@/modules/Users/presentation/components/EditUserForm";
import { DeleteAccountModal } from "@/modules/Users/presentation/components/DeleteAccountModal";
import { WorkerReviewsList } from "@/modules/Reviews/presentation/components/WorkerReviewsList";
import { ClientReviewsList } from "@/modules/Reviews/presentation/components/ClientReviewsList";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { useMe } from "@/shared/hooks/useMe";
import { AlertCircle } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { useState } from "react";
import type { UserDto } from "@/modules/Users/application/dto/user.dto";
import { useAuth } from "@/shared/hooks/useAuth";
import { useDispatch } from "react-redux";
import { logout } from "@/Store/slices/authSlice";
import { AuthStorageService } from "@/shared/services/auth-storage.service";
import { Trash2 } from "lucide-react";
import { isWorker, isClient } from "@/shared/constants/user-roles.constants";
import { ROUTES } from "@/shared/constants/routes.constants";
import { useNavigate } from "react-router-dom";

export function DashboardSettingsPage() {
  const { user, loading, error, refetch } = useMe();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title="Configuración"
          description="Gestiona tu cuenta y preferencias"
        />
        <LoadingState message="Cargando información del perfil..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader
          title="Configuración"
          description="Gestiona tu cuenta y preferencias"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <PageHeader
          title="Configuración"
          description="Gestiona tu cuenta y preferencias"
        />
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No se pudo cargar la información del perfil</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Configuración"
        description="Gestiona tu cuenta y preferencias"
      />
      <div className="space-y-6">
        <UserProfileCard user={user} />
        
        <Separator />
        
        {/* Formulario de edición de perfil personal */}
        {editing ? (
          <EditUserForm
            user={user}
            onSuccess={async (updatedUser: UserDto) => {
              await refetch();
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold mb-1">Perfil Personal</h3>
              <p className="text-sm text-muted-foreground">
                Edita tu información personal (nombre, email, teléfono, ubicación)
              </p>
            </div>
            <Button onClick={() => setEditing(true)} variant="outline">
              Editar Perfil Personal
            </Button>
          </div>
        )}

        {/* Perfil profesional para trabajadores */}
        {isWorker(user.role) && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
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
              <CardContent>
                {user.worker_profile ? (
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
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Completa tu perfil profesional para comenzar a recibir solicitudes de servicios.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
        
        {/* Mostrar reseñas recibidas si es trabajador */}
        {isWorker(user.role) && user.id && (
          <>
            <Separator />
            <div>
              <h2 className="text-2xl font-semibold mb-4">Reseñas Recibidas</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Reseñas que los clientes han dejado sobre tus servicios
              </p>
              <WorkerReviewsList workerId={user.id} showAverage={true} />
            </div>
          </>
        )}

        {/* Mostrar reseñas creadas si es cliente */}
        {isClient(user.role) && (
          <>
            <Separator />
            <div>
              <h2 className="text-2xl font-semibold mb-4">Mis Reseñas</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Reseñas que has creado sobre los servicios recibidos
              </p>
              <ClientReviewsList showAverage={true} />
            </div>
          </>
        )}

        {/* Zona de peligro - Eliminar cuenta */}
        <Separator />
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
            <CardDescription>
              Acciones irreversibles relacionadas con tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Eliminar Cuenta</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.
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
      </div>

      {/* Modal para eliminar cuenta */}
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
                setDeleteError("Sesión expirada. Inicia sesión nuevamente.");
                return;
              }

              const useCase = new DeleteUserUseCase();
              await useCase.execute(user.id, token);

              // Limpiar datos de autenticación
              AuthStorageService.clearAuthData();
              dispatch(logout());

              // Redirigir al login
              navigate(ROUTES.PUBLIC.LOGIN, { replace: true });
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : "Error al eliminar la cuenta";
              setDeleteError(errorMessage);
            } finally {
              setDeleting(false);
            }
          }}
          loading={deleting}
          userEmail={user.email}
        />
      )}
    </PageContainer>
  );
}
