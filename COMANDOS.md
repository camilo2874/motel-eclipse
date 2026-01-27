# Comandos para Ejecutar - Sistema Eclipse

## 📋 Ejecuta estos comandos en PowerShell paso a paso

### 1. Navega a la carpeta del proyecto
```powershell
cd "c:\Users\Camilo Velasquez\Desktop\ECLIPSE"
```

### 2. Instala dependencias del proyecto raíz
```powershell
npm install
```
⏱️ Espera 1-2 minutos

### 3. Instala dependencias del frontend
```powershell
cd frontend
npm install
```
⏱️ Espera 2-3 minutos

### 4. Instala dependencias del backend
```powershell
cd ../backend
npm install
```
⏱️ Espera 1-2 minutos

### 5. Regresa a la raíz
```powershell
cd ..
```

---

## ✅ Después de instalar las dependencias:

### Para ejecutar el proyecto completo:
```powershell
npm run dev
```

Esto iniciará:
- Frontend en: http://localhost:3000
- Backend en: http://localhost:5000

---

## 🔧 Si quieres ejecutarlos por separado:

### Terminal 1 - Frontend:
```powershell
cd frontend
npm run dev
```

### Terminal 2 - Backend (abre otra PowerShell):
```powershell
cd backend
npm run dev
```

---

## ⚠️ IMPORTANTE: Antes de ejecutar necesitas:

1. ✅ Tener Node.js instalado (verifica con: `node --version`)
2. ✅ Crear cuenta en Supabase (https://supabase.com)
3. ✅ Configurar variables de entorno (.env)

**Siguiente paso**: Te ayudaré a configurar Supabase y las variables de entorno.
