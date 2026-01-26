# Variables de Entorno para Producción

Copia estas variables en el dashboard de Vercel: **Settings > Environment Variables**

## Variables Requeridas

```bash
# URL del Backend API (URL de tu backend en Vercel)
# Ejemplo: https://tu-app-backend.vercel.app
VITE_API_URL=https://tu-app-backend.vercel.app
```

## Notas Importantes

- Reemplaza con la URL real de tu backend desplegado
- La variable debe empezar con `VITE_` para que Vite la incluya en el build
- Después de agregar esta variable, necesitas hacer redeploy del frontend
- Si cambias la URL del backend, actualiza esta variable y haz redeploy
