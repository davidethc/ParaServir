import { useEffect, useState, useMemo } from "react";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { PageHeader } from "@/shared/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { LoadingState } from "@/shared/components/feedback/LoadingState";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { MessageTemplateController } from "@/modules/MessageTemplates/infra/http/controllers/message-template.controller";
import { useAuth } from "@/shared/hooks/useAuth";
import { isWorker } from "@/shared/constants/user-roles.constants";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import type { MessageTemplateDto } from "@/modules/MessageTemplates/application/dto/message-template.dto";

export function DashboardMessageTemplatesPage() {
  const { getToken } = useAuth();
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;

  const [templates, setTemplates] = useState<MessageTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplateDto | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const templateController = useMemo(() => new MessageTemplateController(), []);

  useEffect(() => {
    const loadTemplates = async () => {
      if (!isWorker(role)) {
        setError("Solo los trabajadores pueden gestionar plantillas");
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

        const response = await templateController.getAll(token);
        setTemplates(response.templates || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar plantillas";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void loadTemplates();
  }, [templateController, getToken, role]);

  const handleOpenCreateDialog = () => {
    setFormTitle("");
    setFormContent("");
    setEditingTemplate(null);
    setShowCreateDialog(true);
  };

  const handleOpenEditDialog = (template: MessageTemplateDto) => {
    setFormTitle(template.title);
    setFormContent(template.content);
    setEditingTemplate(template);
    setShowCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setEditingTemplate(null);
    setFormTitle("");
    setFormContent("");
  };

  const handleSaveTemplate = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error("El título y el contenido son requeridos");
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("Sesión expirada. Inicia sesión nuevamente.");
      return;
    }

    setSaving(true);
    try {
      if (editingTemplate) {
        await templateController.update(editingTemplate.id, formTitle.trim(), formContent.trim(), token);
        toast.success("Plantilla actualizada correctamente");
      } else {
        await templateController.create(formTitle.trim(), formContent.trim(), token);
        toast.success("Plantilla creada correctamente");
      }

      // Recargar plantillas
      const response = await templateController.getAll(token);
      setTemplates(response.templates || []);
      handleCloseDialog();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al guardar plantilla";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const token = getToken();
    if (!token) {
      toast.error("Sesión expirada. Inicia sesión nuevamente.");
      return;
    }

    setDeletingId(id);
    try {
      await templateController.delete(id, token);
      toast.success("Plantilla eliminada correctamente");
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar plantilla";
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isWorker(role)) {
    return (
      <PageContainer>
        <PageHeader 
          title="Plantillas de Mensajes" 
          description="Gestiona tus plantillas de mensajes para respuestas rápidas"
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
          title="Plantillas de Mensajes" 
          description="Gestiona tus plantillas de mensajes para respuestas rápidas"
        />
        <LoadingState message="Cargando plantillas..." variant="grid" count={6} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader 
          title="Plantillas de Mensajes" 
          description="Gestiona tus plantillas de mensajes para respuestas rápidas"
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
        <div className="flex items-center justify-between">
          <PageHeader 
            title="Plantillas de Mensajes" 
            description="Crea y gestiona plantillas para responder rápidamente a los clientes"
          />
          <Button onClick={handleOpenCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Plantilla
          </Button>
        </div>

        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={<FileText className="h-12 w-12 text-muted-foreground" />}
                title="No tienes plantillas aún"
                description="Crea plantillas de mensajes para responder rápidamente a los clientes en tus conversaciones"
                action={
                  <Button onClick={handleOpenCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Plantilla
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEditDialog(template)}
                        aria-label="Editar plantilla"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={deletingId === template.id}
                        aria-label="Eliminar plantilla"
                      >
                        {deletingId === template.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-4 whitespace-pre-wrap">
                    {template.content}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-4">
                    Creada {new Date(template.created_at).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para crear/editar plantilla */}
        <Dialog open={showCreateDialog} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Editar Plantilla" : "Nueva Plantilla"}
              </DialogTitle>
              <DialogDescription>
                Crea una plantilla de mensaje que podrás usar en tus conversaciones para responder rápidamente a los clientes
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-title">Título</Label>
                <Input
                  id="template-title"
                  placeholder="Ej: Presupuesto inicial"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  maxLength={200}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  {formTitle.length}/200 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-content">Contenido del mensaje</Label>
                <Textarea
                  id="template-content"
                  placeholder="Escribe aquí el contenido de tu plantilla..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={8}
                  disabled={saving}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTemplate} disabled={saving || !formTitle.trim() || !formContent.trim()}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  editingTemplate ? "Actualizar" : "Crear"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
