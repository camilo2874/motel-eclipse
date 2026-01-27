# 🚀 Guía de Despliegue - Motel Eclipse

## Despliegue en Vercel (Frontend)

### 📋 Pre-requisitos
- Cuenta de GitHub (✅)
- Cuenta de Vercel (crear en vercel.com)
- Credenciales de Supabase

---

## 🔧 Paso 1: Subir el código a GitHub

### Opción A: Desde la Terminal (Recomendado)

```bash
# 1. Navega a la carpeta del proyecto
cd "C:\Users\Camilo Velasquez\Desktop\ECLIPSE"

# 2. Inicializar Git (si no está inicializado)
git init

# 3. Agregar todos los archivos
git add .

# 4. Hacer el primer commit
git commit -m "Initial commit - Motel Eclipse System"

# 5. Crear repositorio en GitHub y conectar
# Ve a github.com y crea un nuevo repositorio llamado "motel-eclipse"
# Luego ejecuta estos comandos (reemplaza TU_USUARIO con tu usuario de GitHub):

git branch -M main
git remote add origin https://github.com/TU_USUARIO/motel-eclipse.git
git push -u origin main
```

### Opción B: Desde GitHub Desktop
1. Abre GitHub Desktop
2. File → Add Local Repository
3. Selecciona la carpeta: `C:\Users\Camilo Velasquez\Desktop\ECLIPSE`
4. Publish repository

---

## 🌐 Paso 2: Desplegar en Vercel

### Método 1: Desde la Web (Más Fácil)

1. **Ir a Vercel**
   - Visita: https://vercel.com
   - Haz clic en "Sign Up" o "Login"
   - Conecta con tu cuenta de GitHub

2. **Importar Proyecto**
   - Haz clic en "Add New..." → "Project"
   - Busca tu repositorio "motel-eclipse"
   - Haz clic en "Import"

3. **Configurar el Proyecto**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (⚠️ MUY IMPORTANTE)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Agregar Variables de Entorno**
   - En la sección "Environment Variables", agrega:
   
   ```
   VITE_SUPABASE_URL = tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY = tu_anon_key
   ```

5. **Deploy**
   - Haz clic en "Deploy"
   - Espera 1-2 minutos
   - ¡Listo! Tu app estará en: `https://tu-proyecto.vercel.app`

---

### Método 2: Desde la Terminal (Avanzado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Navegar a la carpeta frontend
cd frontend

# 3. Iniciar sesión en Vercel
vercel login

# 4. Desplegar
vercel

# 5. Configurar variables de entorno
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 6. Deploy a producción
vercel --prod
```

---

## ✅ Verificación Post-Despliegue

Después del deploy, verifica:

1. **Login funciona** ✓
   - Prueba iniciar sesión con un usuario

2. **Dashboard carga** ✓
   - Verifica que los datos se muestren correctamente

3. **Habitaciones** ✓
   - Prueba ver el estado de las habitaciones

4. **Caja** ✓
   - Verifica turnos y movimientos

5. **Inventario** ✓
   - Revisa que los productos se carguen

6. **Reportes** ✓
   - Genera reportes y PDFs

7. **Usuarios** ✓
   - Cambia contraseña de prueba

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
# 1. Hacer commit de los cambios
git add .
git commit -m "Descripción de los cambios"
git push

# 2. Vercel detectará automáticamente y desplegará
# ¡No necesitas hacer nada más! 🎉
```

---

## 🐛 Solución de Problemas

### Error: "Environment variables not found"
**Solución**: Ve a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
- Agrega las variables
- Redeploy el proyecto

### Error: "404 Not Found" en rutas
**Solución**: Asegúrate de que existe el archivo `vercel.json` en la carpeta frontend

### Error: "Build failed"
**Solución**: 
1. Verifica que Root Directory esté en `frontend`
2. Prueba build local: `npm run build`
3. Revisa los logs en Vercel

### Error: "Cannot connect to Supabase"
**Solución**:
1. Verifica las URLs en Vercel Environment Variables
2. Asegúrate de que RLS esté configurado en Supabase
3. Verifica que las políticas permitan acceso anónimo a la tabla `usuarios`

---

## 📱 Compartir con el Cliente

Una vez desplegado, comparte:

**URL de Producción**: `https://tu-proyecto.vercel.app`

**Credenciales de Prueba**:
- Email: (tu email de prueba)
- Contraseña: (tu contraseña)

**Instrucciones**:
1. Abrir la URL en cualquier navegador
2. Iniciar sesión
3. Probar todas las funcionalidades
4. Reportar cualquier error o mejora necesaria

---

## 🎉 ¡Felicidades!

Tu sistema está desplegado y listo para ser probado por el cliente.

**Próximos pasos**:
1. Cliente prueba el sistema
2. Recoge feedback
3. Implementa mejoras
4. Push a GitHub → Auto-deploy en Vercel

---

## 📞 Soporte

Si tienes problemas durante el despliegue, verifica:
- Logs en Vercel Dashboard
- Console del navegador (F12)
- Estado de Supabase
