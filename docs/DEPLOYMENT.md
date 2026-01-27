# Guía de Despliegue - Sistema Eclipse 🚀

Esta guía te ayudará a desplegar el sistema en producción de forma **100% gratuita**.

## 📦 Stack de Despliegue Gratuito

| Componente | Servicio | Costo |
|------------|----------|-------|
| Frontend | Vercel | $0/mes |
| Backend | Render | $0/mes |
| Base de Datos | Supabase | $0/mes |
| Monitoreo | UptimeRobot | $0/mes |

---

## 1️⃣ Desplegar Base de Datos (Supabase)

### Ya configurado en desarrollo
Si seguiste la guía `SETUP.md`, tu base de datos ya está lista en Supabase. No hay pasos adicionales.

### Consideraciones para producción:
- ✅ Tu proyecto de Supabase ya es accesible públicamente
- ✅ Las credenciales son las mismas para desarrollo y producción
- ⚠️ Asegúrate de tener usuarios creados con los roles correctos

---

## 2️⃣ Desplegar Frontend (Vercel)

### Paso 1: Preparar el repositorio

```bash
# Inicializar Git si no lo has hecho
cd ECLIPSE
git init
git add .
git commit -m "Initial commit - Sistema Eclipse"
```

### Paso 2: Subir a GitHub

1. Ve a [github.com](https://github.com) y crea un repositorio nuevo
2. Nómbralo: `motel-eclipse` (o el nombre que prefieras)
3. Haz el repositorio **privado** (para proteger tu código)
4. Ejecuta:

```bash
git remote add origin https://github.com/tu-usuario/motel-eclipse.git
git branch -M main
git push -u origin main
```

### Paso 3: Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Crea una cuenta con GitHub
3. Haz clic en "Add New..." → "Project"
4. Importa tu repositorio `motel-eclipse`
5. Configura el proyecto:

**Framework Preset**: Vite
**Root Directory**: `frontend`
**Build Command**: `npm run build`
**Output Directory**: `dist`

6. Agrega las **Environment Variables**:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_API_URL=https://tu-app.onrender.com
```

⚠️ **IMPORTANTE**: `VITE_API_URL` será la URL de tu backend en Render (paso 3)

7. Haz clic en "Deploy"
8. Espera 2-3 minutos
9. ¡Tu frontend estará disponible! Recibirás una URL como: `https://motel-eclipse.vercel.app`

### Configurar dominio personalizado (Opcional)

1. En Vercel, ve a Settings → Domains
2. Agrega tu dominio (si tienes uno)
3. Sigue las instrucciones de configuración DNS

---

## 3️⃣ Desplegar Backend (Render)

### Paso 1: Crear Web Service

1. Ve a [render.com](https://render.com)
2. Crea una cuenta gratuita
3. Haz clic en "New +" → "Web Service"
4. Conecta tu repositorio de GitHub
5. Configura:

**Name**: `eclipse-backend`
**Region**: Oregon (US West) o el más cercano
**Branch**: `main`
**Root Directory**: `backend`
**Runtime**: Node
**Build Command**: `npm install`
**Start Command**: `npm start`
**Instance Type**: **Free**

### Paso 2: Configurar Environment Variables

Agrega estas variables en Render:

```env
NODE_ENV=production
PORT=5000

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

JWT_SECRET=tu-jwt-secret-de-64-caracteres

CORS_ORIGIN=https://motel-eclipse.vercel.app
```

⚠️ **IMPORTANTE**: 
- Usa tu URL de Vercel en `CORS_ORIGIN`
- El `JWT_SECRET` debe ser el mismo que en desarrollo

### Paso 3: Deploy

1. Haz clic en "Create Web Service"
2. Espera 5-7 minutos (primera compilación)
3. Tu backend estará en: `https://eclipse-backend.onrender.com`

### Paso 4: Verificar

Visita: `https://eclipse-backend.onrender.com/health`

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2026-01-16T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### Paso 5: Actualizar Frontend con URL del Backend

1. Regresa a Vercel
2. Ve a tu proyecto → Settings → Environment Variables
3. Actualiza `VITE_API_URL` con tu URL de Render:

```env
VITE_API_URL=https://eclipse-backend.onrender.com
```

4. Guarda y **Redeploy** el frontend

---

## 4️⃣ Configurar Keep-Alive (UptimeRobot)

⚠️ **Problema**: El backend en Render se "duerme" después de 15 minutos de inactividad.

**Solución**: Usar UptimeRobot para hacer ping cada 5 minutos.

### Configuración:

1. Ve a [uptimerobot.com](https://uptimerobot.com)
2. Crea una cuenta gratuita
3. Haz clic en "+ Add New Monitor"
4. Configura:

**Monitor Type**: HTTP(s)
**Friendly Name**: Eclipse Backend
**URL**: `https://eclipse-backend.onrender.com/health`
**Monitoring Interval**: 5 minutes

5. Guarda

Ahora tu backend se mantendrá "despierto" 24/7.

---

## 5️⃣ Verificación Final

### Checklist de Despliegue:

- [ ] Frontend desplegado en Vercel
- [ ] Backend desplegado en Render
- [ ] Base de datos activa en Supabase
- [ ] Variables de entorno configuradas
- [ ] UptimeRobot monitoreando
- [ ] Login funciona correctamente
- [ ] Dashboard carga sin errores

### Probar la aplicación:

1. Visita tu URL de Vercel
2. Intenta iniciar sesión
3. Verifica que el dashboard cargue

---

## 🔄 Actualizar la Aplicación

### Actualizar Frontend o Backend:

```bash
# Hacer cambios en tu código
git add .
git commit -m "Descripción de cambios"
git push origin main
```

**Vercel y Render desplegarán automáticamente** los cambios en 2-3 minutos.

### Actualizar Base de Datos:

1. Ve a Supabase → SQL Editor
2. Ejecuta tus consultas SQL
3. Los cambios se aplican instantáneamente

---

## 📊 Monitoreo

### Logs del Backend (Render):

1. Ve a tu servicio en Render
2. Haz clic en "Logs"
3. Verás los logs en tiempo real

### Logs del Frontend (Vercel):

1. Ve a tu proyecto en Vercel
2. Haz clic en "Deployments"
3. Selecciona un deployment → "View Function Logs"

### Monitoreo de Base de Datos (Supabase):

1. Ve a tu proyecto en Supabase
2. "Database" → "Roles" para ver conexiones activas
3. "Reports" para ver uso de recursos

---

## ⚠️ Limitaciones del Plan Gratuito

### Render (Backend):
- ✅ 750 horas/mes (más que suficiente)
- ⚠️ Se duerme tras 15 min (solucionado con UptimeRobot)
- ⚠️ Tarda 30-50s en despertar si falla el monitor
- ✅ Sin límite de peticiones

### Vercel (Frontend):
- ✅ 100 GB ancho de banda/mes
- ✅ Builds ilimitados
- ✅ Sin sleep
- ✅ CDN global

### Supabase (Base de Datos):
- ✅ 500 MB de base de datos (suficiente para 50k+ registros)
- ✅ 50,000 usuarios activos/mes
- ⚠️ Pausa tras 1 semana sin actividad (se reactiva automáticamente)
- ✅ Sin límite de queries razonables

---

## 🆘 Troubleshooting

### "Failed to fetch" en el frontend:
- Verifica que `VITE_API_URL` apunte a Render
- Verifica que `CORS_ORIGIN` en Render incluya tu URL de Vercel
- Revisa los logs del backend

### Backend lento en primera petición:
- Normal si se durmió (30-50s)
- UptimeRobot debería prevenir esto
- Verifica que UptimeRobot esté activo

### Error 503 en Render:
- Backend aún está iniciando (espera 1 minuto)
- Revisa los logs en Render

### Error de autenticación:
- Verifica credenciales de Supabase
- Asegúrate de tener usuarios creados
- Revisa que las políticas RLS estén correctas

---

## 📈 Escalabilidad Futura

Cuando el negocio crezca, puedes migrar a:

- **Render**: Plan pagado ($7/mes) - sin sleep
- **Vercel**: Plan Pro ($20/mes) - más recursos
- **Supabase**: Plan Pro ($25/mes) - 8 GB base de datos

**Costo total escalado**: ~$52/mes (aún muy económico)

---

## ✅ Conclusión

¡Felicidades! Tu sistema está desplegado y funcionando 100% gratis.

**URLs importantes:**
- Frontend: `https://tu-app.vercel.app`
- Backend: `https://tu-app.onrender.com`
- Base de Datos: Panel de Supabase

**Siguiente paso**: Comienza a desarrollar los módulos del sistema 🚀

---

**Última actualización**: 16 de enero de 2026
