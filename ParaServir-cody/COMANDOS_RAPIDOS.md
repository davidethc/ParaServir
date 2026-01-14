# ⚡ Comandos Rápidos - Geolocalización

## 🎯 Ejecutar Migración (COPIA Y PEGA ESTO)

```bash
cd ParaServir-cody
npm run migrate:geolocation
```

**Eso es todo.** El script hará todo automáticamente.

---

## 🧪 Probar Endpoints (desde terminal con curl)

### 1. Actualizar ubicación
```bash
curl -X PUT http://localhost:3900/api/workers/location \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"address": "Quito, Ecuador"}'
```

### 2. Buscar trabajadores cercanos
```bash
curl "http://localhost:3900/api/workers/nearby?latitude=-0.1807&longitude=-78.4678&radius=10"
```

### 3. Buscar por ubicación
```bash
curl "http://localhost:3900/api/workers/search?location=Quito&radius=10"
```

---

## 📝 Notas Importantes

- ✅ Los comandos `PUT` y `GET` que viste antes son **ejemplos HTTP**, no comandos de terminal
- ✅ Usa `curl` o Postman para probar los endpoints HTTP
- ✅ El script de migración usa tu conexión existente, no necesitas `psql`

---

**¿Problemas?** Lee `INSTRUCCIONES_MIGRACION.md` para más detalles.
