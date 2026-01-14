# 📸 Sistema de Imágenes de Categorías

## ✅ ¿Cómo funciona?

Las imágenes están en `src/shared/Assets/` y se importan directamente en el código. **NO necesitas subirlas a ningún servicio externo**. Vite las optimiza automáticamente durante el build.

## 🎯 Uso

### En Componentes

```typescript
import { getCategoryImage } from "@/shared/utils/category-images";

// Obtener imagen de una categoría
const imageUrl = getCategoryImage("Carpintería");

// Usar en un componente
{imageUrl && (
  <img src={imageUrl} alt="Carpintería" />
)}
```

### Componentes que ya usan las imágenes

- ✅ `CategoryCard` - Muestra imagen en las cards de categorías
- ✅ `ServiceCard` - Muestra imagen de categoría en las cards de servicios
- ✅ `DashboardCategoryDetailPage` - Muestra imagen en el header de la página de detalle

## 📝 Agregar nuevas imágenes

1. **Agrega la imagen** a `src/shared/Assets/` (ej: `NuevaCategoria.png`)

2. **Importa la imagen** en `category-images.ts`:
```typescript
import NuevaCategoriaImg from "@/shared/Assets/NuevaCategoria.png";
```

3. **Agrega el mapeo** en `categoryImageMap`:
```typescript
const categoryImageMap: Record<string, string> = {
  // ... otros mapeos
  "nueva categoría": NuevaCategoriaImg,
  "nueva categoria": NuevaCategoriaImg, // Sin acentos
  "nueva": NuevaCategoriaImg, // Variación corta
};
```

4. **¡Listo!** La imagen se usará automáticamente en todos los componentes.

## 🔍 Matching de nombres

El sistema normaliza los nombres para hacer matching:
- Convierte a minúsculas
- Elimina acentos (á → a, ñ → n)
- Elimina espacios extra

Ejemplos que funcionan:
- "Carpintería" → encuentra `Carpintero.png`
- "carpinteria" → encuentra `Carpintero.png`
- "CARPINTERÍA" → encuentra `Carpintero.png`

## 📦 Imágenes disponibles

- ✅ Albanil.png - Albañilería
- ✅ Asesoria.png - Asesoría Legal
- ✅ Carpintero.png - Carpintería
- ✅ Cerrajero.png - Cerrajería
- ✅ Clases.png - Clases Particulares
- ✅ Cocina.png - Cocina
- ✅ Conduccion.png - Conducción
- ✅ CuidadoAdultos.png - Cuidado de Adultos Mayores
- ✅ CuidadoNiños.png - Cuidado de Niños
- ✅ Electricista.png - Electricidad
- ✅ Electronica.png - Electrónica
- ✅ EntrenadorPersonal.png - Entrenador Personal
- ✅ Estetica.png - Estética
- ✅ Fontaneria.png - Fontanería
- ✅ Fotografo.png - Fotografía
- ✅ Jardinero.png - Jardinería
- ✅ Limpieza.png - Limpieza
- ✅ LimpiezaProfunda.png - Limpieza Profunda
- ✅ Mudanza.png - Mudanza
- ✅ Pintor.png - Pintura
- ✅ Plomero.png - Plomería
- ✅ Refrigeracion.png - Refrigeración

## ⚠️ Notas importantes

1. **No subir a servicios externos**: Las imágenes se sirven desde el build de Vite, son parte del bundle.

2. **Optimización automática**: Vite optimiza las imágenes durante el build (compresión, formato moderno, etc.)

3. **Fallback**: Si no se encuentra una imagen, se muestra el placeholder con el icono/letra.

4. **Performance**: Las imágenes se cargan bajo demanda, no todas a la vez.

## 🐛 Debugging

Si una imagen no aparece:

1. Verifica que el nombre de la categoría coincida con el mapeo
2. Verifica que la imagen esté en `src/shared/Assets/`
3. Verifica que la imagen esté importada en `category-images.ts`
4. Usa `getAllCategoryImages()` para ver todos los mapeos disponibles

