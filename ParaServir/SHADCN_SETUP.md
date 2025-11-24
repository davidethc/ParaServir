# 🎨 Configuración de shadcn/ui

## 📦 Instalación

```bash
# 1. Instalar shadcn/ui CLI
npx shadcn@latest init

# 2. Agregar componentes que necesites
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add card
npx shadcn@latest add label
```

## 📁 Estructura después de instalar shadcn/ui

```
src/
└── shared/
    └── ui/
        └── components/
            ├── ui/                      # Componentes de shadcn/ui
            │   ├── button.tsx
            │   ├── input.tsx
            │   ├── form.tsx
            │   ├── card.tsx
            │   └── label.tsx
            │
            └── lib/
                └── utils.ts             # Ya lo creamos (cn function)
```

## 🔧 Configuración de components.json

Cuando ejecutes `npx shadcn@latest init`, se creará `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/shared/ui/components",
    "utils": "@/shared/lib/utils"
  }
}
```

## 📝 Ejemplo de uso con shadcn/ui

```tsx
// RegisterForm.tsx con shadcn/ui
import { Button } from "@/shared/ui/components/ui/button";
import { Input } from "@/shared/ui/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/components/ui/card";
import { Label } from "@/shared/ui/components/ui/label";

export function RegisterForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" type="text" />
          </div>
          <Button type="submit">Registrarse</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## 🎯 Path Alias (tsconfig.json)

Asegúrate de tener esto en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

