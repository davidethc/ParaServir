/**
 * DTOs para el módulo de Plantillas de Mensajes
 */

export interface MessageTemplateDto {
  id: string;
  worker_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplatesResponse {
  status: string;
  templates: MessageTemplateDto[];
  count: number;
}

export interface MessageTemplateActionResponse {
  status: string;
  message: string;
  template?: MessageTemplateDto;
}
