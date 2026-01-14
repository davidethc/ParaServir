import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Mail, Phone, MapPin, User, Calendar, CheckCircle2, XCircle } from "lucide-react";
import type { UserDto } from "../../application/dto/user.dto";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getUserAvatar } from "@/shared/utils/avatar-utils";

interface UserProfileCardProps {
  user: UserDto;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  // Validar que first_name y last_name existan antes de acceder a sus índices
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Usuario sin nombre";
  
  // Generar iniciales de forma segura
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (lastName) {
      return lastName[0].toUpperCase();
    }
    return "U";
  };
  
  const initials = getInitials();
  const formattedDate = format(new Date(user.created_at), "dd 'de' MMMM, yyyy", { locale: es });

  // Generar avatar si no existe
  const displayAvatar = getUserAvatar(user.id, user.avatar_url, fullName);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={displayAvatar} alt={fullName} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{fullName}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Badge variant={user.role === 'trabajador' ? 'default' : 'secondary'}>
                {user.role === 'trabajador' ? 'Trabajador' : user.role === 'admin' ? 'Administrador' : 'Cliente'}
              </Badge>
              {user.is_verified ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <XCircle className="h-3 w-3 mr-1" />
                  No verificado
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
              <p className="text-sm">{user.phone || 'No especificado'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
              <p className="text-sm">{user.location || 'No especificada'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cédula</p>
              <p className="text-sm">{user.cedula}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Miembro desde</p>
              <p className="text-sm">{formattedDate}</p>
            </div>
          </div>
        </div>

        {user.role === 'trabajador' && user.worker_profile && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold mb-3">Información Profesional</h4>
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

