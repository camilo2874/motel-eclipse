# Guía de Configuración - Sistema Eclipse 🏨

Esta guía te ayudará a configurar el proyecto desde cero.

## 📋 Requisitos Previos

- Node.js 18 o superior
- npm o pnpm
- Cuenta de Supabase (gratuita)
- Cuenta de Vercel (gratuita) - para despliegue frontend
- Cuenta de Render (gratuita) - para despliegue backend

## 🚀 Configuración Local

### 1. Instalación de Dependencias

```bash
# En la raíz del proyecto
cd ECLIPSE
npm run install:all
```

Esto instalará las dependencias del proyecto raíz, frontend y backend.

### 2. Configurar Supabase

#### 2.1 Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Haz clic en "New Project"
4. Completa:
   - **Name**: motel-eclipse
   - **Database Password**: (guarda esta contraseña)
   - **Region**: South America (São Paulo) - más cercano a Colombia
   - **Pricing Plan**: Free

#### 2.2 Obtener Credenciales

1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia:
   - **URL**: Algo como `https://xxxxx.supabase.co`
   - **anon public key**: Para el frontend
   - **service_role key**: Para el backend (mantén esto en secreto)

#### 2.3 Ejecutar SQL para Crear Tablas

1. En Supabase, ve a **SQL Editor**
2. Abre el archivo `docs/database/schema.sql` de este proyecto
3. Copia todo el contenido y pégalo en el editor SQL
4. Haz clic en "Run" para ejecutar
5. Verifica que las tablas se crearon en **Table Editor**

### 3. Configurar Variables de Entorno

#### 3.1 Frontend

```bash
cd frontend
cp .env.example .env
```

Edita el archivo `.env` y reemplaza:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_API_URL=http://localhost:5000
```

#### 3.2 Backend

```bash
cd ../backend
cp .env.example .env
```

Edita el archivo `.env` y reemplaza:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

JWT_SECRET=genera-una-clave-aleatoria-segura
CORS_ORIGIN=http://localhost:3000
```

Para generar el `JWT_SECRET` puedes usar:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Crear Usuario Inicial

1. En Supabase, ve a **Authentication** → **Users**
2. Haz clic en "Add user" → "Create new user"
3. Completa:
   - **Email**: admin@eclipse.com (o el que prefieras)
   - **Password**: (elige una contraseña segura)
4. Copia el **UUID** del usuario creado
5. Ve a **SQL Editor** y ejecuta:

```sql
INSERT INTO usuarios (id, nombre, email, rol)
VALUES (
  'uuid-del-usuario-que-copiaste',
  'Administrador',
  'admin@eclipse.com',
  'dueno'
);
```

## ▶️ Ejecutar el Proyecto

### Opción 1: Ejecutar Todo (Recomendado)

```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- Frontend en `http://localhost:3000`
- Backend en `http://localhost:5000`

### Opción 2: Ejecutar por Separado

Terminal 1 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 2 - Backend:
```bash
cd backend
npm run dev
```

## 🌐 Acceder a la Aplicación

1. Abre tu navegador en `http://localhost:3000`
2. Inicia sesión con las credenciales que creaste
3. ¡Listo! Ya puedes empezar a usar el sistema

## 🐛 Solución de Problemas

### Error: "Faltan las credenciales de Supabase"
- Verifica que copiaste correctamente las URLs y keys
- Asegúrate de que los archivos `.env` existen (no `.env.example`)

### Error: "Cannot find module"
- Ejecuta `npm run install:all` de nuevo
- Verifica que estés en la carpeta correcta

### Error al conectar con Supabase
- Verifica que tu proyecto de Supabase esté activo
- Revisa que las credenciales sean correctas
- Verifica tu conexión a internet

### El backend no inicia
- Verifica que el puerto 5000 no esté en uso
- Revisa que todas las variables de entorno estén configuradas

## 📚 Próximos Pasos

1. ✅ Configuración completada
2. 📖 Lee `docs/DEPLOYMENT.md` para desplegar en producción
3. 🏗️ Comienza a desarrollar los módulos

## 🆘 Soporte

Si tienes problemas, revisa:
- Los logs de la consola del navegador (F12)
- Los logs del servidor backend
- La documentación de Supabase: https://supabase.com/docs

---

**Última actualización**: 16 de enero de 2026
