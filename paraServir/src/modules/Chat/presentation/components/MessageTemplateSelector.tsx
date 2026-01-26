import { useState, useEffect, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { MessageTemplateController } from "@/modules/MessageTemplates/infra/http/controllers/message-template.controller";
import { useAuth } from "@/shared/hooks/useAuth";
import { FileText, Loader2 } from "lucide-react";
import { isWorker } from "@/shared/constants/user-roles.constants";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import type { MessageTemplateDto } from "@/modules/MessageTemplates/application/dto/message-template.dto";

interface MessageTemplateSelectorProps {
  onSelectTemplate: (content: string) => void;
  disabled?: boolean;
}

export function MessageTemplateSelector({ onSelectTemplate, disabled = false }: MessageTemplateSelectorProps) {
  const { getToken } = useAuth();
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role;
  const [templates, setTemplates] = useState<MessageTemplateDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const templateController = useMemo(() => new MessageTemplateController(), []);

  useEffect(() => {
    const loadTemplates = async () => {
      if (!isWorker(role) || !open) return;

      const token = getToken();
      if (!token) return;

      setLoading(true);
      try {
        const response = await templateController.getAll(token);
        setTemplates(response.templates || []);
      } catch (err) {
        console.error("Error loading templates:", err);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    void loadTemplates();
  }, [open, templateController, getToken, role]);

  // Solo mostrar para trabajadores
  if (!isWorker(role)) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          disabled={disabled}
          aria-label="Seleccionar plantilla"
          title="Seleccionar plantilla de mensaje"
        >
          <FileText className="h-5 w-5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Plantillas de Mensajes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <DropdownMenuItem disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Cargando...
          </DropdownMenuItem>
        ) : templates.length === 0 ? (
          <DropdownMenuItem disabled>
            No hay plantillas disponibles
          </DropdownMenuItem>
        ) : (
          templates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => {
                onSelectTemplate(template.content);
                setOpen(false);
              }}
              className="cursor-pointer"
            >
              <div className="flex flex-col gap-1 w-full">
                <span className="font-medium truncate">{template.title}</span>
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {template.content}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
