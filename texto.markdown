# Documento de Planificación del Proyecto Web

## 1. Información General

- **Nombre del Proyecto:** Para Servir
- **Integrantes del grupo:** Cody Cabrera, Davide Manotoa
- **Fecha de entrega:** 28/10/2025
- **Tutor/a:** _Pendiente_

---

## 2. Descripción General del Proyecto

En la ciudad de Loja y otras regiones del país, las personas que requieren servicios domésticos, técnicos o profesionales (plomería, electricidad, reparación de electrodomésticos, asistencia informática, limpieza, etc.) enfrentan dificultades para encontrar proveedores confiables y disponibles de manera rápida.

Actualmente la búsqueda se realiza mediante recomendaciones informales, redes sociales o grupos comunitarios. Esto presenta limitaciones como:

- Información poco clara sobre reputación y experiencia
- Falta de verificación de identidad y antecedentes
- Tiempos de respuesta inciertos
- Alta informalidad en acuerdos de servicio
- Dificultad para comparar precios/opciones
- Falta de canal unificado de comunicación y seguimiento

**Para Servir** es una aplicación web y móvil que conecta clientes con trabajadores calificados y disponibles en su zona, ofreciendo un canal directo y humano.

### Diferenciadores

- Red local de ayuda inmediata
- Contacto directo (chat, llamada o WhatsApp)
- Sin intermediarios ni tiempos de espera
- Ideal para emergencias y servicios urgentes

El sistema promueve inclusión de profesionales titulados y autodidactas basándose en reputación, resultados y comunidad.

La plataforma garantiza confianza mediante:

- Verificación manual de perfiles
- Sistema de calificaciones y reseñas públicas
- Canales de comunicación directos

---

## 3. Alcance del Proyecto

### Funcionalidades Principales

#### Para Clientes

- Registro e inicio de sesión
- Perfil propio editable
- Búsqueda por categoría y ubicación
- Visualización de perfiles de trabajadores
- Contacto directo vía:
  - Chat interno
  - WhatsApp
  - Llamada (opcional)
- Recepción de notificaciones
- Reseñas y calificación

#### Para Trabajadores

- Registro + creación de perfil profesional
- Envío de documentos para verificación
- Gestión de solicitud y chats
- Notificaciones
- Reputación (reseñas + rating)
- Visibilidad por zona

#### Sistema / Administrador

- Verificación de perfiles
- Moderación de contenido y reseñas
- Gestión de categorías
- Alertas internas

### Capacidades Transversales

- Mapa/referencia geográfica
- Seguridad y privacidad
- Comunicación instantánea
- Plataforma web + móvil
- Auditoría básica

### Límites del Proyecto (Incluye)

- Registro + verificación
- Contacto directo
- Chats + notificaciones
- Reseñas públicas
- Geolocalización básica

### Fuera de Alcance (No incluye aún)

- Pasarela de pagos interna
- Tracking GPS en tiempo real
- Algoritmos avanzados de recomendación
- Garantías/seguros
- Verificación automática

---

## 4. Actores y Roles

- **Líder de proyecto / Coordinador:** Davide Manotoa
- **Dev Front-end:** Davide Manotoa
- **Dev Back-end:** Cody Cabrera
- **Diseño / Funcional:** Davide Manotoa + Cody Cabrera

---

## 5. Requisitos del Proyecto

### 5.1 Requisitos Funcionales

Tabla resumida:

| Código | Requisito | Rol |
|--------|-----------|-----|
| RF01 | Registro con Google | Cliente/Trabajador |
| RF02 | Registro con Email | Cliente/Trabajador |
| RF03 | Iniciar/Cerrar sesión | Ambos |
| RF04 | Editar perfil | Ambos |
| RF05 | Elegir rol (cliente, trabajador o ambos) | Ambos |
| RF06 | Datos profesionales adicionales | Trabajador |
| RF07 | Subir documentos para verificación | Trabajador |
| RF08 | Consultar estado de verificación | Trabajador |
| RF09 | Aprobar/Rechazar verificaciones | Admin |
| RF10 | Crear servicios (máx. 3) | Trabajador |
| RF11 | Editar/eliminar servicios | Trabajador |
| RF12 | Activar/Desactivar servicios | Trabajador |
| RF13 | Buscar servicios | Cliente |
| RF14 | Ver perfiles | Cliente |
| RF15 | Servicios populares/recomendados | Cliente |
| RF16 | Iniciar chats | Ambos |
| RF17 | Enviar/recibir mensajes | Ambos |
| RF18 | Abrir WhatsApp | Ambos |
| RF19 | Calificar y reseñar | Cliente |
| RF20 | Ver reseñas/calificaciones | Ambos |
| RF21 | Promedio de calificaciones | Sistema |
| RF22 | Registrar ubicación | Usuario |
| RF23 | Calcular distancia | Sistema |
| RF24 | Notificar eventos | Sistema |
| RF25 | Gestionar denuncias | Admin |

### 5.2 Requisitos No Funcionales

- **Seguridad:** Supabase Auth + JWT + roles
- **Rendimiento:** Respuesta < 1s en operaciones básicas
- **Compatibilidad:** Web + móvil responsive
- **Escalabilidad:** Next.js + Supabase Modular
- **Mantenibilidad:** ESLint + Prettier + Git Flow
- **Disponibilidad:** Supabase + Vercel 99% uptime
- **Usabilidad:** UI intuitiva + accesible

---

## 6. Tecnologías

- **Front-end:** React + Next.js
- **Back-end:** Node.js (API Routes)
- **BD:** Supabase (PostgreSQL)
- **Repos:** GitHub
- **Herramientas:** Figma, Jira, Notion

---

## 7. Cronograma Tentativo (Sprints)

| Semana | Actividad | Entregable |
|--------|-----------|------------|
| 1 | Requerimientos y alcance | Documento |
| 2 | Arquitectura + UML + ERD | Diagramas |
| 3 | Setup del entorno | Proyecto base |
| 4 | Módulo usuarios | Login + Roles |
| 5 | Perfiles | Perfil funcional |
| 6 | Servicios | Módulo servicios |
| 7-8 | Chat + WhatsApp + Notificaciones | Módulo comunicación |

---

## 8. Riesgos y Mitigación

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Falta de tiempo | Alto | Sprints + Jira |
| Integraciones fallidas | Medio | Pruebas iniciales |
| Despliegue | Medio | Dev/Prod separados |
| Errores BD | Alto | Backups + Tests |
| Descoordinación | Alto | Reuniones + Notion |

---

## 9. Conclusión

Para Servir conecta de forma rápida y segura a clientes con trabajadores locales calificados, digitalizando un mercado que actualmente funciona de manera informal y poco confiable. La plataforma facilita comunicación, reputación y visibilidad, impulsando desarrollo económico local mediante una solución tecnológica simple, directa y humana.

