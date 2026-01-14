-- Migración: Sistema de Notificaciones
-- Fecha: 2026-01-13
-- Descripción: Agrega tabla de notificaciones para eventos del sistema

BEGIN;

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'message', 'request_accepted', 'request_completed', 'review_received', 'verification_status'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_id UUID, -- ID relacionado (request_id, message_id, review_id, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Comentarios
COMMENT ON TABLE notifications IS 'Notificaciones del sistema para usuarios';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificación: message, request_accepted, request_completed, review_received, verification_status';
COMMENT ON COLUMN notifications.related_id IS 'ID del recurso relacionado (request_id, message_id, review_id, etc.)';

COMMIT;
