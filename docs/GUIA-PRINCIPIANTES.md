# Guía Para Principiantes - Sistema Eclipse 🎓

## ¡Bienvenido! Esta guía es para ti si nunca has programado o instalado estas herramientas.

---

## 📚 Paso 1: Instalar Node.js (OBLIGATORIO)

Node.js es el programa que permite ejecutar JavaScript en tu computadora.

### ¿Cómo instalarlo?

1. **Abre tu navegador** (Chrome, Edge, Firefox)
2. **Ve a**: https://nodejs.org/
3. **Descarga** la versión **LTS** (botón verde grande que dice algo como "20.11.0 LTS")
4. **Ejecuta el archivo** que descargaste (algo como `node-v20.11.0-x64.msi`)
5. **Sigue el instalador**:
   - Clic en "Next" (Siguiente)
   - Acepta los términos: "I accept..." y "Next"
   - Deja la ubicación por defecto y "Next"
   - **IMPORTANTE**: Marca la casilla "Automatically install the necessary tools..." y "Next"
   - Clic en "Install" (puede pedir permisos de administrador)
   - Espera a que termine (2-3 minutos)
   - Clic en "Finish"

6. **Verifica que se instaló correctamente**:
   - Presiona las teclas `Windows + R` (al mismo tiempo)
   - Escribe: `powershell` y presiona Enter
   - En la ventana que se abre (PowerShell), escribe:
   ```
   node --version
   ```
   - Si ves algo como `v20.11.0` ¡Perfecto! ✅
   - Si dice "no se reconoce", cierra PowerShell, ábrela de nuevo e intenta otra vez

---

## 📚 Paso 2: Instalar Git (Opcional pero recomendado)

Git te permite guardar versiones de tu código y subirlo a GitHub.

### ¿Cómo instalarlo?

1. **Ve a**: https://git-scm.com/download/win
2. **Descarga** la versión para Windows (64-bit)
3. **Ejecuta el instalador**
4. **Sigue el instalador**:
   - Presiona "Next" en todas las pantallas (las opciones por defecto están bien)
   - En "Choosing the default editor", puedes dejar "Vim" o elegir "Nano"
   - Continúa con "Next" hasta "Install"
   - Espera 2-3 minutos
   - Clic en "Finish"

5. **Verifica**:
   - Abre PowerShell (Windows + R, escribe `powershell`)
   - Escribe:
   ```
   git --version
   ```
   - Si ves algo como `git version 2.43.0` ¡Perfecto! ✅

---

## 📚 Paso 3: Crear Cuenta en Supabase (Base de Datos GRATIS)

Supabase será tu base de datos en la nube.

### ¿Cómo crear la cuenta?

1. **Ve a**: https://supabase.com
2. **Clic en** "Start your project" o "Sign up"
3. **Elige**: "Continue with GitHub"
   - Si no tienes GitHub: Primero crea cuenta en https://github.com (es gratis)
   - Usa tu correo personal
4. **Autoriza** Supabase cuando GitHub te lo pida
5. ¡Listo! Ya tienes cuenta en Supabase ✅

---

## 📚 Paso 4: Crear el Proyecto en Supabase

1. **En Supabase**, clic en "New Project"
2. **Completa**:
   - **Name**: `motel-eclipse` (sin espacios)
   - **Database Password**: Crea una contraseña segura y **GUÁRDALA** (la necesitarás)
   - **Region**: Elige "South America (São Paulo)" (más cercano a Colombia)
   - **Pricing Plan**: Selecciona **"Free"** ($0/mes)
3. **Clic en** "Create new project"
4. **Espera 2-3 minutos** mientras Supabase crea tu base de datos
5. Verás un dashboard con tu proyecto ✅

---

## 📚 Paso 5: Configurar la Base de Datos

### 5.1 Obtener tus credenciales (Importante)

1. En Supabase, en el menú izquierdo, clic en el **ícono de tuerca** ⚙️ (Settings)
2. Clic en **"API"**
3. Vas a ver:
   - **URL**: Copia esto (algo como `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public**: Copia esta clave larga
   - **service_role**: Copia esta clave larga (MUY IMPORTANTE: no la compartas)

**GUARDA ESTOS DATOS** en un archivo de texto temporal. Los necesitarás pronto.

### 5.2 Crear las tablas

1. En Supabase, en el menú izquierdo, busca **"SQL Editor"** (ícono de <>)
2. Clic en **"SQL Editor"**
3. Clic en el botón **"+ New query"**
4. Ahora necesitas el archivo `schema.sql`:
   - En VS Code, abre la carpeta del proyecto Eclipse
   - Ve a: `docs/database/schema.sql`
   - **Selecciona TODO** el contenido (Ctrl + A)
   - **Copia** (Ctrl + C)
5. **Regresa a Supabase** y **pega** (Ctrl + V) en el editor SQL
6. **Clic en** el botón **"RUN"** (esquina inferior derecha)
7. Espera 10-15 segundos
8. Verás un mensaje: "Success. No rows returned" ✅
9. Para verificar: En el menú izquierdo, clic en **"Table Editor"**
10. Deberías ver tablas como: `habitaciones`, `usuarios`, `tarifas`, etc. ✅

---

## 📚 Paso 6: Crear tu Usuario Administrador

1. En Supabase, menú izquierdo, busca **"Authentication"** (ícono de persona)
2. Clic en **"Users"**
3. Clic en **"Add user"** → **"Create new user"**
4. Completa:
   - **Email**: `admin@eclipse.com` (o el que prefieras)
   - **Password**: Crea una contraseña (guárdala, es para entrar al sistema)
5. Clic en **"Create user"**
6. **Copia el UUID** del usuario (es un código largo como `a1b2c3d4-e5f6-...`)
7. Ahora regresa a **"SQL Editor"**
8. **Nueva query** y pega esto (reemplaza el UUID):

```sql
INSERT INTO usuarios (id, nombre, email, rol)
VALUES (
  'PEGA-AQUI-EL-UUID-QUE-COPIASTE',
  'Administrador',
  'admin@eclipse.com',
  'dueno'
);
```

9. **Clic en RUN**
10. ¡Usuario creado! ✅

---

## 📚 Paso 7: Configurar el Proyecto en tu Computadora

### 7.1 Abrir PowerShell en la carpeta del proyecto

1. **Abre** el Explorador de Archivos de Windows
2. **Ve a**: `C:\Users\Camilo Velasquez\Desktop\ECLIPSE`
3. En la barra de dirección (arriba), **escribe**: `powershell` y presiona Enter
4. Se abrirá PowerShell en esa carpeta ✅

### 7.2 Instalar las dependencias del proyecto

En PowerShell, **escribe** (o copia y pega):

```powershell
npm install
```

Presiona **Enter** y espera 3-5 minutos. Verás muchos textos pasando. Es normal.

Cuando termine, **escribe**:

```powershell
cd frontend
npm install
```

Espera 2-3 minutos.

Cuando termine, **escribe**:

```powershell
cd ../backend
npm install
```

Espera 1-2 minutos.

Cuando termine, **escribe**:

```powershell
cd ..
```

¡Dependencias instaladas! ✅

---

## 📚 Paso 8: Configurar las Variables de Entorno

### 8.1 Frontend

1. En **VS Code**, abre el proyecto Eclipse
2. Ve a la carpeta: `frontend`
3. Verás un archivo: `.env.example`
4. **Clic derecho** en ese archivo → **"Copy"** (Copiar)
5. **Clic derecho** en la carpeta `frontend` → **"Paste"** (Pegar)
6. **Renombra** el archivo copiado de `.env copy.example` a `.env` (sin el "copy" ni el ".example")
7. **Abre** el archivo `.env`
8. **Reemplaza** con tus datos de Supabase:

```env
VITE_SUPABASE_URL=https://TU-URL-DE-SUPABASE.supabase.co
VITE_SUPABASE_ANON_KEY=TU-ANON-KEY-AQUI
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Motel Eclipse
VITE_APP_VERSION=1.0.0
```

9. **Guarda** el archivo (Ctrl + S)

### 8.2 Backend

1. Ve a la carpeta: `backend`
2. Haz lo mismo: Copia `.env.example` y pégalo como `.env`
3. **Abre** el archivo `.env`
4. **Reemplaza**:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=https://TU-URL-DE-SUPABASE.supabase.co
SUPABASE_SERVICE_ROLE_KEY=TU-SERVICE-ROLE-KEY-AQUI

JWT_SECRET=eclipse-motel-super-secreto-2026-12345678
CORS_ORIGIN=http://localhost:3000

MINUTOS_GRACIA=15
HORAS_BASE=12
```

5. **Guarda** (Ctrl + S)

---

## 📚 Paso 9: ¡Ejecutar el Proyecto!

### Opción A: Ejecutar todo junto (Recomendado)

En **PowerShell** (en la carpeta ECLIPSE), **escribe**:

```powershell
npm run dev
```

Verás dos ventanas iniciándose:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Opción B: Ejecutar por separado

**Terminal 1** (Frontend):
```powershell
cd frontend
npm run dev
```

**Terminal 2** (Backend) - Abre otra PowerShell:
```powershell
cd backend
npm run dev
```

---

## 📚 Paso 10: ¡Usar tu Sistema!

1. **Abre tu navegador**
2. **Ve a**: http://localhost:3000
3. **Inicia sesión** con:
   - Email: `admin@eclipse.com` (o el que creaste)
   - Password: (la contraseña que elegiste)
4. ¡Deberías ver el Dashboard! 🎉

---

## 🆘 ¿Problemas? Soluciones Rápidas

### "npm no se reconoce como comando"
- Cierra PowerShell y ábrela de nuevo
- Si persiste, reinstala Node.js

### "Error al instalar dependencias"
- Verifica tu conexión a internet
- Intenta de nuevo

### "No puedo iniciar sesión"
- Verifica que creaste el usuario en Supabase
- Verifica que ejecutaste el INSERT en usuarios
- Verifica que las credenciales en `.env` son correctas

### El frontend no carga
- Verifica que el backend esté corriendo
- Revisa la consola de PowerShell por errores

---

## 🎓 ¡Felicidades!

Has configurado exitosamente tu primer proyecto de desarrollo web.

**Siguiente**: Ahora podemos empezar a desarrollar los módulos del sistema.

---

**¿Necesitas ayuda?** Pregúntame en cualquier momento.
