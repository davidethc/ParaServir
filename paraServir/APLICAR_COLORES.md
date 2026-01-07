# 🎨 Aplicar Colores - Instrucciones

## ✅ Cambios Realizados

1. **Variables CSS actualizadas** a formato RGB para Tailwind v4
2. **Utilidades personalizadas** agregadas para todos los colores del tema
3. **Compatibilidad** con shadcn/ui mantenida

## 🔥 PASOS CRÍTICOS (HACER EN ORDEN)

### 1. DETENER SERVIDOR COMPLETAMENTE
```bash
# Presiona Ctrl+C o Cmd+C en la terminal
# Espera a que se detenga completamente
```

### 2. LIMPIAR CACHÉ COMPLETAMENTE
```bash
cd paraServir
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite
```

### 3. REINICIAR SERVIDOR
```bash
npm run dev
```

### 4. LIMPIAR CACHÉ DEL NAVEGADOR
- **Chrome/Edge**: `Ctrl+Shift+Delete` → Marcar "Imágenes y archivos en caché" → Limpiar
- **Firefox**: `Ctrl+Shift+Delete` → Marcar "Caché" → Limpiar
- Luego recarga: `Ctrl+Shift+R` o `Cmd+Shift+R`

### 5. VERIFICAR EN DEVTOOLS
Abre DevTools (F12) y verifica:

**En el elemento `<body>`:**
```css
background-color: rgb(249, 250, 254);  /* Debe ser #F9FAFE */
color: rgb(30, 31, 51);  /* Debe ser #1E1F33 */
```

**En un botón con clase `bg-primary`:**
```css
background-color: rgb(111, 106, 232);  /* Debe ser #6F6AE8 */
```

## 🎨 Colores que DEBES ver

- **Fondo de la app**: #F9FAFE (blanco azulado, NO blanco puro)
- **Botones principales**: #6F6AE8 (Soft Indigo - morado suave)
- **Texto principal**: #1E1F33 (azul oscuro, NO negro)
- **Bordes**: #E3E6F4 (gris-azulado)
- **Precios/Éxito**: #2FB8A8 (turquesa)

## ⚠️ Si AÚN NO FUNCIONA

### Verificar variables en consola
Abre la consola (F12 → Console) y ejecuta:
```javascript
getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
```
Debería retornar: `111 106 232`

### Verificar que el CSS se está cargando
1. DevTools (F12) → Pestaña "Network"
2. Recarga la página
3. Busca `index.css`
4. Debe aparecer y tener status 200
5. Click en él → Verifica que tenga las variables `--color-primary`, etc.

## 📝 Nota

Los errores del linter sobre `@theme` y `@apply` son normales - el linter CSS no reconoce las directivas de Tailwind v4. Esto NO afecta la funcionalidad.
