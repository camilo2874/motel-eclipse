# Sistema de Gestión Motel Eclipse

Proyecto para digitalizar las operaciones del Motel Eclipse.

## Estado del Proyecto

### ✅ Completado: Módulo 0 - Infraestructura Base

**Lo que se ha implementado:**

1. **Estructura del Proyecto**
   - Monorepo con frontend y backend separados
   - Configuración completa de desarrollo
   - Sistema de variables de entorno

2. **Frontend (React + Vite + Tailwind CSS)**
   - ✅ Configuración de Vite
   - ✅ Tailwind CSS con tema personalizado
   - ✅ React Router configurado
   - ✅ Sistema de autenticación con Supabase Auth
   - ✅ Rutas protegidas
   - ✅ Layout responsive con sidebar
   - ✅ Páginas base (Dashboard, Habitaciones, Caja, Inventario, Reportes)
   - ✅ Componentes reutilizables
   - ✅ Integración con react-hot-toast para notificaciones

3. **Backend (Node.js + Express)**
   - ✅ Servidor Express configurado
   - ✅ Middleware de seguridad (Helmet, CORS, Rate Limiting)
   - ✅ Estructura de rutas modular
   - ✅ Conexión con Supabase
   - ✅ Health check endpoint para monitoreo
   - ✅ Manejo centralizado de errores

4. **Base de Datos (Supabase)**
   - ✅ Schema completo de base de datos
   - ✅ 8 tablas principales
   - ✅ Triggers y funciones automatizadas
   - ✅ Políticas de seguridad (RLS)
   - ✅ Vistas para consultas comunes
   - ✅ Datos iniciales (11 habitaciones, 3 tarifas)

5. **Documentación**
   - ✅ README principal
   - ✅ Guía de configuración (SETUP.md)
   - ✅ Guía de despliegue (DEPLOYMENT.md)
   - ✅ Schema SQL documentado

6. **Stack de Despliegue Gratuito**
   - Frontend: Vercel
   - Backend: Render + UptimeRobot
   - Base de Datos: Supabase
   - Costo total: $0/mes

---

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm run install:all
```

### 2. Configurar Supabase

Sigue la guía en [docs/SETUP.md](docs/SETUP.md)

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Esto iniciará:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 📋 Próximos Módulos

### Módulo 1: Gestión de Habitaciones (Próximo)
- [ ] Dashboard con mapa de 11 habitaciones
- [ ] Estados en tiempo real (Supabase Realtime)
- [ ] Check-in automático
- [ ] Contador de tiempo en vivo
- [ ] Cálculo automático de cobros

### Módulo 2: Check-in/Check-out y Consumos
- [ ] Flujo completo de entrada
- [ ] Interfaz POS para consumos
- [ ] Resumen de cuenta
- [ ] Check-out con cálculo total

### Módulo 3: Sistema de Caja y Turnos
- [ ] Apertura/cierre de turno
- [ ] Consignaciones
- [ ] Reportes de caja en PDF
- [ ] Cuadre automático

### Módulo 4: Inventario
- [ ] CRUD de productos
- [ ] Control de stock
- [ ] Alertas de bajo stock
- [ ] Historial de movimientos

### Módulo 5: Reportes y Auditoría
- [ ] Dashboard del dueño
- [ ] Gráficas de ocupación
- [ ] Productos más vendidos
- [ ] Log de auditoría
- [ ] Exportación de reportes

---

## 📁 Estructura del Proyecto

```
ECLIPSE/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── contexts/        # Context API (Auth, etc.)
│   │   ├── lib/            # Utilidades y configuración
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── App.jsx         # Componente principal
│   │   └── main.jsx        # Punto de entrada
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                  # API REST Node.js
│   ├── src/
│   │   ├── config/         # Configuración (Supabase)
│   │   ├── routes/         # Rutas de la API
│   │   ├── middleware/     # Middleware personalizado
│   │   ├── controllers/    # Lógica de negocio
│   │   └── server.js       # Servidor Express
│   └── package.json
│
├── docs/                     # Documentación
│   ├── database/
│   │   └── schema.sql      # Schema de base de datos
│   ├── SETUP.md            # Guía de configuración
│   └── DEPLOYMENT.md       # Guía de despliegue
│
├── package.json              # Configuración del workspace
└── README.md                 # Este archivo
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18
- Vite 5
- Tailwind CSS 3
- React Router 6
- Supabase Client
- Chart.js (para gráficas)
- React Hot Toast (notificaciones)
- Lucide React (íconos)

### Backend
- Node.js 18+
- Express 4
- Supabase (PostgreSQL)
- Helmet (seguridad)
- CORS
- Express Rate Limit
- Morgan (logs)

### Base de Datos
- PostgreSQL (via Supabase)
- Row Level Security (RLS)
- Realtime Subscriptions
- Supabase Auth

---

## 🎯 Características Principales

### Para Administradores:
- ✅ Gestión de check-in/check-out
- ✅ Registro de consumos
- ✅ Apertura y cierre de turnos
- ✅ Visualización de disponibilidad

### Para Dueño:
- ✅ Todo lo del administrador +
- ✅ Modificación de precios
- ✅ Gestión de inventario
- ✅ Reportes financieros
- ✅ Auditoría de operaciones

### Automatizaciones:
- Cálculo automático de horas y cobros
- Actualización de stock al registrar consumos
- Cierre automático de turno con balance
- Alertas de bajo inventario

---

## 📞 Soporte

Para problemas o dudas:
1. Revisa [docs/SETUP.md](docs/SETUP.md)
2. Revisa [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
3. Revisa los logs de consola
4. Verifica la documentación de Supabase

---

## 📄 Licencia

Proyecto privado - Motel Eclipse © 2026

---

## 🎉 Siguiente Paso

**Estás listo para comenzar el desarrollo de los módulos!**

Sigue la guía en [docs/SETUP.md](docs/SETUP.md) para configurar tu entorno de desarrollo.
