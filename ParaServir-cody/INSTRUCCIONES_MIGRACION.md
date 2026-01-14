# 🚀 Instrucciones para Ejecutar la Migración de Geolocalización

## ⚠️ IMPORTANTE: Los comandos que copiaste son ejemplos, no se ejecutan directamente

Los comandos que viste en la documentación son **ejemplos de uso**, no comandos de terminal. Aquí te explico cómo ejecutarlos correctamente:

---

## 📋 Paso 1: Ejecutar la Migración SQL

### Opción A: Usando el script Node.js (RECOMENDADO - Más fácil)

```bash
# Desde la carpeta ParaServir-cody
npm run migrate:geolocation
```

O directamente:

```bash
node scripts/run-migration-geolocation.js
```

Este script:
- ✅ Usa tu conexión existente a la base de datos
- ✅ No requiere instalar `psql`
- ✅ Muestra mensajes claros de progreso
- ✅ Verifica que todo se haya creado correctamente

---

### Opción B: Usando psql (si lo tienes instalado)

Si tienes PostgreSQL instalado localmente y `psql` en tu PATH:

```bash
# Reemplaza estos valores con los tuyos:
psql -U postgres -d paraservir -f database/migration_add_geolocation.sql
```

**Nota:** Si no tienes `psql` instalado, usa la Opción A.

---

## 📋 Paso 2: Probar los Endpoints

Los comandos `PUT` y `GET` que viste son **ejemplos de HTTP requests**, no comandos de terminal. Aquí te muestro cómo probarlos:

### Opción 1: Usando curl (en terminal)

```bash
# Actualizar ubicación de un trabajador
curl -X PUT http://localhost:3900/api/workers/location \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"address": "Quito, Ecuador"}'

# Buscar trabajadores cercanos
curl "http://localhost:3900/api/workers/nearby?latitude=-0.1807&longitude=-78.4678&radius=10"

# Buscar por ubicación textual
curl "http://localhost:3900/api/workers/search?location=Quito&radius=10"
```

### Opción 2: Usando Postman (más fácil)

1. Abre Postman
2. Crea una nueva request
3. Selecciona el método (PUT o GET)
4. Ingresa la URL: `http://localhost:3900/api/workers/location`
5. En Headers, agrega: `Authorization: Bearer TU_TOKEN`
6. En Body (solo para PUT), selecciona "raw" y "JSON", luego ingresa:
   ```json
   {
     "address": "Quito, Ecuador"
   }
   ```
7. Click en "Send"

### Opción 3: Desde el Frontend (React/TypeScript)

```typescript
// Actualizar ubicación
const updateLocation = async (address: string) => {
  const response = await fetch('http://localhost:3900/api/workers/location', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ address })
  });
  return response.json();
};

// Buscar trabajadores cercanos
const findNearby = async (lat: number, lng: number, radius: number = 10) => {
  const response = await fetch(
    `http://localhost:3900/api/workers/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`
  );
  return response.json();
};
```

---

## ✅ Verificación

Después de ejecutar la migración, verifica que funcionó:

```bash
# El script te mostrará mensajes como:
# ✅ Columnas creadas correctamente
# ✅ Índices creados
# 🎉 ¡Todo listo!
```

---

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Asegúrate de estar en la carpeta correcta
cd ParaServir-cody
npm install  # Si no has instalado las dependencias
```

### Error: "Connection refused" o "Cannot connect to database"
- Verifica que tu servidor de base de datos esté corriendo
- Verifica tu archivo `.env` tiene la configuración correcta de `DATABASE_URL`
- Revisa `GUIA_CONEXION_COMPLETA.md` para más detalles

### Error: "relation 'profiles' does not exist"
- Primero ejecuta `database/db.sql` para crear las tablas base
- Luego ejecuta la migración de geolocalización

---

## 📚 Más Información

- **Documentación completa:** Ver `GUIA_GEOLOCALIZACION.md`
- **Resumen técnico:** Ver `RESUMEN_GEOLOCALIZACION.md`
- **Configuración de BD:** Ver `GUIA_CONEXION_COMPLETA.md`

---

**¿Necesitas ayuda?** Revisa los archivos de documentación o verifica que tu servidor esté corriendo con `npm run dev`
