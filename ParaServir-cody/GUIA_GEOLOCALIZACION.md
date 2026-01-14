# Guía de Geolocalización - ParaServir

## 📍 Descripción General

Sistema de geolocalización **100% GRATUITO** implementado usando Nominatim (OpenStreetMap) que permite:

- Actualizar ubicación de trabajadores mediante dirección o coordenadas
- Buscar trabajadores cercanos por radio de distancia
- Buscar trabajadores por categoría y ubicación
- Geocodificación automática (dirección → coordenadas)

---

## 🗄️ Migración de Base de Datos

**IMPORTANTE:** Antes de usar los endpoints, ejecuta la migración SQL:

```sql
-- Ejecutar: database/migration_add_geolocation.sql
```

O manualmente:

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

CREATE INDEX IF NOT EXISTS idx_profiles_coords ON profiles(latitude, longitude);
```

---

## 🔌 Endpoints Disponibles

### 1. Actualizar Ubicación del Trabajador

**Endpoint:** `PUT /api/workers/location`  
**Autenticación:** Requerida  
**Rol:** Cualquier usuario autenticado

#### Opción A: Enviar dirección (geocodificación automática)

```json
PUT /api/workers/location
Headers: {
  "Authorization": "Bearer <token>"
}
Body: {
  "address": "Quito, Ecuador"
}
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Ubicación actualizada correctamente",
  "location": {
    "address": "Quito, Pichincha, Ecuador",
    "latitude": -0.1807,
    "longitude": -78.4678
  }
}
```

#### Opción B: Enviar coordenadas directamente

```json
PUT /api/workers/location
Body: {
  "latitude": -0.1807,
  "longitude": -78.4678
}
```

**Respuesta:** Incluye la dirección obtenida automáticamente mediante geocodificación inversa.

#### Opción C: Enviar ambos (dirección + coordenadas)

```json
PUT /api/workers/location
Body: {
  "address": "Loja, Ecuador",
  "latitude": -4.0079,
  "longitude": -79.2113
}
```

---

### 2. Buscar Trabajadores Cercanos (por coordenadas)

**Endpoint:** `GET /api/workers/nearby`  
**Autenticación:** Opcional  
**Rol:** Público

#### Parámetros de Query:

- `latitude` (requerido): Latitud del punto de búsqueda
- `longitude` (requerido): Longitud del punto de búsqueda
- `radius` (opcional): Radio de búsqueda en km (default: 10, máximo: 1000)
- `category_id` (opcional): Filtrar por categoría de servicio

#### Ejemplo 1: Buscar trabajadores en un radio de 10km

```http
GET /api/workers/nearby?latitude=-0.1807&longitude=-78.4678&radius=10
```

**Respuesta:**
```json
{
  "status": "success",
  "search_location": {
    "latitude": -0.1807,
    "longitude": -78.4678,
    "radius_km": 10
  },
  "workers": [
    {
      "id": "uuid-del-trabajador",
      "first_name": "Juan",
      "last_name": "Pérez",
      "location": "Quito, Ecuador",
      "latitude": -0.1807,
      "longitude": -78.4678,
      "distance_km": "0.5",
      "years_experience": 5,
      "verification_status": "approved",
      "is_active": true
    }
  ],
  "count": 1
}
```

#### Ejemplo 2: Buscar plomeros cercanos

```http
GET /api/workers/nearby?latitude=-0.1807&longitude=-78.4678&radius=5&category_id=uuid-categoria-plomeria
```

---

### 3. Buscar Trabajadores por Ubicación Textual

**Endpoint:** `GET /api/workers/search`  
**Autenticación:** Opcional  
**Rol:** Público

#### Parámetros de Query:

- `location` (requerido): Dirección o ciudad (ej: "Quito", "Loja, Ecuador")
- `radius` (opcional): Radio de búsqueda en km (default: 10)
- `category_id` (opcional): Filtrar por categoría de servicio

#### Ejemplo 1: Buscar trabajadores en Quito

```http
GET /api/workers/search?location=Quito&radius=10
```

#### Ejemplo 2: Buscar electricistas en Loja

```http
GET /api/workers/search?location=Loja, Ecuador&radius=15&category_id=uuid-categoria-electricidad
```

**Respuesta:** Similar a `/nearby`, pero con geocodificación automática de la ubicación.

---

## 📊 Estructura de Datos

### Campos de Geolocalización en `profiles`:

```sql
location TEXT,           -- Dirección textual
latitude DECIMAL(10, 8), -- Latitud (-90 a 90)
longitude DECIMAL(11, 8) -- Longitud (-180 a 180)
```

### Respuesta de Trabajador:

```json
{
  "id": "uuid",
  "first_name": "Juan",
  "last_name": "Pérez",
  "location": "Quito, Ecuador",
  "latitude": -0.1807,
  "longitude": -78.4678,
  "distance_km": "5.2",  // Solo en búsquedas cercanas
  "years_experience": 5,
  "verification_status": "approved",
  "is_active": true
}
```

---

## 🔧 Servicio de Geocodificación

El servicio usa **Nominatim (OpenStreetMap)** - 100% gratuito:

- **Geocodificación:** Dirección → Coordenadas
- **Geocodificación Inversa:** Coordenadas → Dirección
- **Sin API Key:** No requiere configuración adicional
- **Límite:** 1 request/segundo (suficiente para la mayoría de casos)

**Archivo:** `src/services/geocoding.service.js`

---

## 📝 Ejemplos de Uso

### Frontend: Actualizar ubicación del trabajador

```javascript
// Opción 1: Usando dirección
const updateLocation = async (address) => {
  const response = await fetch('/api/workers/location', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ address })
  });
  return response.json();
};

// Opción 2: Usando geolocalización del navegador
const updateLocationFromBrowser = async () => {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const response = await fetch('/api/workers/location', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ latitude, longitude })
    });
    return response.json();
  });
};
```

### Frontend: Buscar trabajadores cercanos

```javascript
// Buscar trabajadores cercanos a una ubicación
const findNearbyWorkers = async (lat, lng, radius = 10, categoryId = null) => {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    radius: radius.toString()
  });
  
  if (categoryId) {
    params.append('category_id', categoryId);
  }
  
  const response = await fetch(`/api/workers/nearby?${params}`);
  return response.json();
};

// Buscar por dirección textual
const searchByLocation = async (location, radius = 10, categoryId = null) => {
  const params = new URLSearchParams({
    location,
    radius: radius.toString()
  });
  
  if (categoryId) {
    params.append('category_id', categoryId);
  }
  
  const response = await fetch(`/api/workers/search?${params}`);
  return response.json();
};
```

---

## ⚠️ Notas Importantes

1. **Migración requerida:** Ejecuta la migración SQL antes de usar los endpoints
2. **Límite de Nominatim:** Máximo 1 request por segundo (respetar uso razonable)
3. **Coordenadas válidas:** 
   - Latitud: -90 a 90
   - Longitud: -180 a 180
4. **Radio máximo:** 1000 km
5. **Trabajadores activos:** Solo se muestran trabajadores con `is_active = true`
6. **Coordenadas requeridas:** Los trabajadores deben tener `latitude` y `longitude` para aparecer en búsquedas cercanas

---

## 🚀 Próximos Pasos

1. Ejecutar migración SQL
2. Actualizar ubicación de trabajadores existentes (opcional)
3. Integrar en el frontend para mostrar trabajadores en mapa
4. Agregar funcionalidad de "Usar mi ubicación actual" en el frontend

---

## 📚 Referencias

- [Nominatim API Documentation](https://nominatim.org/release-docs/latest/api/Overview/)
- [Fórmula de Haversine](https://en.wikipedia.org/wiki/Haversine_formula) (cálculo de distancia)

---

**Fecha de implementación:** 13 de enero, 2026  
**Versión:** 1.0.0
