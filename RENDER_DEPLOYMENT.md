# 🚀 Guía Completa de Deployment en Render con Neon

## ⚡ FIX CRÍTICO APLICADO

**Problemas resueltos:** Errores de build en Render por paquetes faltantes

**Solución:** Movimos las herramientas de build de `devDependencies` a `dependencies` en `package.json` porque Render solo instala dependencias de producción durante el build.

**Paquetes movidos a `dependencies`:**
- ✅ `drizzle-kit` - Para migraciones de BD
- ✅ `vite` - Para buildear el frontend
- ✅ `esbuild` - Para bundlear el backend
- ✅ `typescript` - Compilador TypeScript
- ✅ `tailwindcss`, `postcss`, `autoprefixer` - Para CSS
- ✅ `@tailwindcss/typography` - Plugin de Tailwind (requerido por tailwind.config.ts)
- ✅ `@vitejs/plugin-react`, `@tailwindcss/vite` - Plugins de build

**Plugins de Replit condicionados (solo desarrollo):**
- ✅ `vite.config.ts` modificado para cargar plugins de Replit solo en desarrollo
- ✅ Los plugins `@replit/vite-plugin-*` permanecen en `devDependencies`
- ✅ Esto evita errores de "Cannot find package" en Render

✅ **Este repositorio ya tiene todos los fixes aplicados.** Solo necesitas seguir los pasos de configuración abajo.

---

## ✅ Lo que acabas de arreglar en Replit

Tu base de datos ya está 100% sincronizada con el schema. Las siguientes columnas y tablas fueron creadas:

- ✅ Tabla `companies`
- ✅ Columna `loading_status` en `daily_assignments`
- ✅ Columna `loading_status_data` en `templates`
- ✅ Columna `selected_company_id` en `users`
- ✅ **`drizzle-kit` movido a `dependencies`** para deployments en producción

## 📋 Pasos para Deployar en Render

### 1️⃣ Obtén tu Connection String de Neon (con Pooling)

1. Ve a [Neon Console](https://console.neon.tech)
2. Selecciona tu proyecto
3. Click en botón **"Connect"**
4. **IMPORTANTE:** Activa el toggle **"Connection pooling"**
5. Copia la **Pooled connection string**

**Debe verse así (con `-pooler` y `?sslmode=require`):**
```
postgresql://neondb_owner:password@ep-cool-name-123-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

⚠️ **CRÍTICO:** La URL DEBE tener:
- `-pooler` en el hostname
- `?sslmode=require` al final

---

### 2️⃣ Crear Web Service en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Conecta tu repositorio (GitHub/GitLab)
4. Configura lo siguiente:

**Name:** Tu nombre del proyecto (ej: `logistica-app`)

**Build Command:**
```bash
npm install; npm run db:push -- --force; npm run build
```

**Start Command:**
```bash
npm start
```

---

### 3️⃣ Configurar Variables de Entorno (CRÍTICO)

**En la pestaña "Environment" de tu servicio:**

Agrega estas 3 variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DATABASE_URL` | Tu Neon Pooled URL completa | Conexión a la base de datos |
| `NODE_ENV` | `production` | Habilita SSL y optimizaciones |
| `SESSION_SECRET` | String aleatorio largo | Para seguridad de sesiones |

**Ejemplo:**
```bash
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require
NODE_ENV=production
SESSION_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Para generar SESSION_SECRET:**
```bash
# En tu terminal local ejecuta:
openssl rand -base64 32
# Copia el resultado
```

---

### 4️⃣ PASO CRÍTICO: Variables durante Build

Render necesita `DATABASE_URL` **durante el build** para ejecutar `npm run db:push`.

**Opción A - Verificar que esté disponible:**
1. En Render, ve a tu servicio → **Settings**
2. Busca **"Build Command Environment Variables"**
3. Si existe, asegúrate de que `DATABASE_URL` esté ahí
4. Si no existe, continúa con Opción B

**Opción B - Usar script alternativo:**

Si Render no permite variables de entorno durante el build, modifica el **Build Command** a:

```bash
npm install && npm run build
```

Y luego crea un **"Deploy Hook"** o ejecuta `npm run db:push -- --force` manualmente desde la **Shell** de Render la primera vez:

1. Ve a tu servicio → **Shell** (pestaña superior)
2. Ejecuta:
```bash
npm run db:push -- --force
```
3. Después de eso, cada deploy solo ejecutará `npm run build`

---

### 5️⃣ Configuración Avanzada (Opcional)

**Auto-Deploy:** Yes (para deployments automáticos desde GitHub)

**Health Check Path:** `/` (opcional, para monitoreo)

---

### 6️⃣ Deploy

1. Haz click en **"Create Web Service"**
2. Render ejecutará el build automáticamente
3. Observa los logs en la pestaña **"Logs"**

**Deberías ver:**
```
Building...
✓ npm install
✓ npm run db:push -- --force
  [✓] Pulling schema from database...
  [✓] Changes applied
✓ npm run build
Starting...
Your service is live at https://tu-app.onrender.com
```

---

## 🔍 Verificación

Una vez deployado:

1. Visita tu URL de Render (ej: `https://tu-app.onrender.com`)
2. Deberías ver la página de login
3. Intenta registrarte
4. Intenta guardar una planificación
5. ✅ Todo debería funcionar

---

## 🐛 Troubleshooting

### Error: "drizzle-kit: not found" o "vite: not found" durante build

**Causa:** Herramientas de build estaban en `devDependencies` en lugar de `dependencies`

**Solución:**
✅ **Ya está arreglado en este repositorio.**

Si lo ves en tu propio proyecto, mueve estos paquetes a `dependencies`:
- `drizzle-kit`
- `vite`
- `esbuild`
- `typescript`
- `tailwindcss`, `postcss`, `autoprefixer`
- `@tailwindcss/typography` (si se usa en tailwind.config.ts)
- `@vitejs/plugin-react`, `@tailwindcss/vite`

Render solo instala `dependencies` en producción, no `devDependencies`

---

### Error: "column 'loading_status' does not exist" en Producción

**Síntoma:**
```
5:30:49 PM [express] DELETE /api/daily-assignments/by-date/2025-10-31 500
5:30:55 PM [express] POST /api/templates 500 :: {"message":"column \"loading_status_data\" o…
```

**Causa:** La base de datos de producción en Render no tiene las columnas/tablas más recientes porque:
- El deploy inicial no ejecutó `npm run db:push -- --force`
- O se usó una BD diferente entre desarrollo y producción

**Solución:**

**Paso 1: Verificar Variables de Entorno**

Antes de redeploy, confirma que `DATABASE_URL` está configurada:
1. Ve a Render Dashboard → tu servicio → pestaña **"Environment"**
2. Verifica que existe `DATABASE_URL` con la Pooled Connection String
3. Formato correcto: `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require`
4. ⚠️ **CRÍTICO:** Sin `DATABASE_URL`, el build no puede ejecutar `npm run db:push`

**Paso 2: Forzar Redeploy**

1. **Ve a Render Dashboard** → tu servicio web
2. Click en **"Manual Deploy"** → **"Clear build cache & deploy"**
3. Esto forzará la ejecución de `npm run db:push -- --force`

**Paso 3: Verificar Build Logs**

Durante el build, busca esta sección:
```
> npm run db:push -- --force

✓ Applying changes...
✓ Table 'companies' created
✓ Column 'loading_status' added to 'daily_assignments'
✓ Column 'loading_status_data' added to 'templates'
✓ Column 'selected_company_id' added to 'users'
```

**Si ves errores en `db:push`:**

**Error común:** `Error: connect ENOTFOUND`
- **Causa:** DATABASE_URL no está definida o es incorrecta
- **Solución:** Vuelve al Paso 1, corrige DATABASE_URL

**Error común:** `SSL connection error`
- **Causa:** Falta `?sslmode=require` en DATABASE_URL
- **Solución:** Agrega `?sslmode=require` al final de la URL

**Error común:** `authentication failed`
- **Causa:** Credenciales incorrectas en DATABASE_URL
- **Solución:** Regenera la Pooled Connection String en Neon Console

**Paso 4: Procedimiento de Emergencia (si el build falla repetidamente)**

Si `npm run db:push` sigue fallando durante el build:

1. Ve a Render Dashboard → tu servicio → pestaña **"Shell"**
2. Click en **"Connect to Shell"** (esto abre una terminal en tu servicio)
3. Ejecuta manualmente:
   ```bash
   npm run db:push -- --force
   ```
4. Verifica el output y corrige cualquier error
5. Una vez exitoso, redeploy normalmente

**Paso 5: Probar la App**

Una vez completado el deploy exitosamente:
1. Visita tu URL de producción
2. Prueba crear templates, daily assignments
3. Verifica que no haya errores 500 en los logs

**⚠️ NO Ejecutes SQL Manualmente:**
Aunque sea tentador copiar/pegar SQL en Neon Console, esto puede causar:
- Inconsistencias entre el schema de Drizzle y la BD real
- Problemas con futuras migraciones
- Errores difíciles de debuggear

**Usa siempre el proceso automatizado de Drizzle vía deploy en Render.**

---

### Error: "Cannot find module '@tailwindcss/typography'"

**Causa:** El plugin `@tailwindcss/typography` está en `devDependencies` pero es requerido por `tailwind.config.ts` durante el build

**Solución:**
✅ **Ya está arreglado en este repositorio.**

Si lo ves en tu propio proyecto:
1. Verifica tu `tailwind.config.ts` - ¿usa `require("@tailwindcss/typography")`?
2. Si es así, mueve `@tailwindcss/typography` de `devDependencies` a `dependencies`
3. Cualquier plugin usado en `tailwind.config.ts` debe estar en `dependencies`

---

### Error: "Cannot find package '@replit/vite-plugin-*'" durante build

**Causa:** `vite.config.ts` importa plugins de Replit que están en `devDependencies`

**Solución:**
✅ **Ya está arreglado en este repositorio.**

Los plugins de Replit solo se necesitan en desarrollo. Modifica `vite.config.ts` para cargarlos condicionalmente:

```typescript
plugins: [
  react(),
  ...(process.env.NODE_ENV !== "production" &&
  process.env.REPL_ID !== undefined
    ? [
        await import("@replit/vite-plugin-runtime-error-modal").then((m) =>
          m.default(),
        ),
        // ... otros plugins de Replit
      ]
    : []),
],
```

Esto evita que Vite intente cargar plugins de Replit en producción

---

### Error: "column does not exist" o "relation does not exist"

**Causa:** `npm run db:push` no se ejecutó durante el build

**Solución:**
1. Ve a Render → Tu servicio → **Shell**
2. Ejecuta manualmente:
   ```bash
   npm run db:push -- --force
   ```
3. Reinicia el servicio

---

### Error: "ENOTFOUND base" o "invalid url"

**Causa:** `DATABASE_URL` no está configurada o está mal formateada

**Solución:**
1. Verifica que `DATABASE_URL` esté en **Environment** tab
2. Verifica que tenga `-pooler` y `?sslmode=require`
3. Ejemplo correcto:
   ```
   postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require
   ```

---

### Error: "Connection timeout"

**Causa:** Neon está en "cold start" (escala a cero)

**Solución:**
- Espera 30 segundos y reintenta
- El timeout ya está configurado a 30s en el código
- Considera Neon Scale tier para evitar cold starts

---

### Error: "SSL required"

**Causa:** Falta SSL en la conexión

**Solución:**
- Verifica que `NODE_ENV=production` esté configurado
- El código maneja SSL automáticamente en producción

---

## 📝 Checklist Pre-Deploy

Antes de hacer deploy, verifica:

- [ ] Tienes la **Pooled connection string** de Neon (con `-pooler`)
- [ ] La URL termina con `?sslmode=require`
- [ ] `DATABASE_URL` está en Environment tab de Render
- [ ] `NODE_ENV=production` está configurado
- [ ] `SESSION_SECRET` está configurado (32+ caracteres)
- [ ] Build command: `npm install; npm run db:push -- --force; npm run build`
- [ ] Start command: `npm start`

---

## 🔄 Sincronizar Schema en Producción

### ⚠️ IMPORTANTE: Bases de Datos Separadas

**Desarrollo (Replit) y Producción (Render) usan bases de datos DIFERENTES:**

- **Replit:** DATABASE_URL apunta a una BD de desarrollo
- **Render:** DATABASE_URL apunta a una BD de producción (separada)

**Esto significa:**
- Cambios de schema en Replit solo afectan la BD de desarrollo
- Para sincronizar producción, debes forzar un nuevo deploy en Render

### ✅ Cómo Sincronizar la BD de Producción

**Requisito Previo:**
⚠️ **DATABASE_URL debe estar configurada en Environment variables** para que `npm run db:push` funcione durante el build. Sin esto, el schema no se sincronizará.

**Opción 1: Manual Trigger (Recomendado)**

1. **Verifica DATABASE_URL:** Render Dashboard → Environment tab → confirma que existe
2. Ve a tu servicio en Render Dashboard
3. Click en **"Manual Deploy"** → **"Clear build cache & deploy"**
4. Esto ejecutará `npm run db:push -- --force` durante el build
5. **Verifica los logs del build** - busca "Applying changes..." para confirmar éxito

**Opción 2: Git Push (Automático)**

1. **Verifica DATABASE_URL:** Render Dashboard → Environment tab → confirma que existe
2. Haz cualquier commit pequeño (puede ser un comentario)
3. Push a tu repositorio
4. Render detectará el cambio y hará un nuevo deploy automáticamente
5. **Verifica los logs del build** para confirmar que el schema se aplicó

**⚠️ NO Ejecutes SQL Manualmente**

Evita ejecutar SQL directamente en Neon Console porque:
- ❌ Puede crear inconsistencias entre Drizzle schema y BD
- ❌ No se rastrea en control de versiones
- ❌ Puede romper migraciones futuras
- ✅ Usa **siempre** `npm run db:push -- --force` vía deploy en Render

---

## 🔄 Actualizaciones Futuras del Schema

Cuando agregues nuevas columnas o tablas al schema en el futuro:

### En Replit (desarrollo):
```bash
npm run db:push -- --force
```

### En Render (producción):

**Opción A - Automático:**
Si configuraste bien las variables de entorno durante build, cada deploy ejecutará `db:push` automáticamente.

**Opción B - Manual:**
1. Ve a Render → Tu servicio → **Shell**
2. Ejecuta: `npm run db:push -- --force`
3. Reinicia el servicio

---

## 💡 Tips Adicionales

1. **Migraciones:** Ya no necesitas escribir SQL manual. Solo edita `shared/schema.ts` y ejecuta `db:push`

2. **Logs:** Usa Render Logs para debugging. Si hay errores de BD, aparecerán ahí

3. **Backup:** Neon hace backups automáticos, pero considera exportar datos importantes periódicamente

4. **Escalado:** Si tienes mucho tráfico, considera:
   - Neon Scale tier (evita cold starts)
   - Render Standard plan (más recursos)

---

## ✅ Estado Final

Tu aplicación ahora está lista para:

- ✅ Deployment automático en Render
- ✅ Sincronización automática de schema con Neon
- ✅ Guardar planificaciones y plantillas correctamente
- ✅ Multi-empresa (companies)
- ✅ Sistema de aprobación de usuarios
- ✅ Persistencia completa en PostgreSQL

---

## 🆘 Si algo falla

1. Revisa los logs de Render
2. Verifica que todas las variables de entorno estén configuradas
3. Ejecuta `npm run db:push -- --force` manualmente desde Shell
4. Si el problema persiste, revisa la sección de Troubleshooting arriba

---

**¡Tu aplicación está lista para producción! 🚀**
