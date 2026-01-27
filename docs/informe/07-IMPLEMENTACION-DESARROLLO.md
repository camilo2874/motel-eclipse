# CAPÍTULO 6: IMPLEMENTACIÓN Y DESARROLLO

## 6.1 Configuración del Entorno de Desarrollo

### 6.1.1 Requisitos del Sistema

**Software necesario:**
- Node.js v18+ (runtime JavaScript)
- npm v9+ o pnpm (gestor de paquetes)
- Git (control de versiones)
- Editor de código (VS Code recomendado)
- Navegador moderno (Chrome, Firefox, Edge)

**Servicios externos:**
- Cuenta de Supabase (base de datos y autenticación)
- PostgreSQL v14+ (provisto por Supabase)

### 6.1.2 Estructura del Proyecto

```
ECLIPSE/
├── backend/                    # API Node.js/Express
│   ├── src/
│   │   ├── config/            # Configuraciones
│   │   │   ├── supabase.js    # Cliente Supabase
│   │   │   └── constants.js   # Constantes
│   │   ├── routes/            # Rutas RESTful
│   │   │   ├── auth.routes.js
│   │   │   ├── caja.routes.js
│   │   │   ├── habitaciones.routes.js
│   │   │   ├── inventario.routes.js
│   │   │   ├── registros.routes.js
│   │   │   └── reportes.routes.js
│   │   └── server.js          # Punto de entrada
│   ├── .env                    # Variables de entorno
│   └── package.json           # Dependencias backend
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Vistas principales
│   │   ├── services/          # Clientes API
│   │   ├── contexts/          # Estado global
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utilidades
│   │   ├── lib/               # Configuraciones
│   │   ├── App.jsx            # Componente raíz
│   │   └── main.jsx           # Entry point
│   ├── public/
│   │   └── logo.png           # Logo del motel
│   ├── .env                    # Variables de entorno
│   ├── package.json           # Dependencias frontend
│   ├── vite.config.js         # Configuración Vite
│   └── tailwind.config.js     # Configuración TailwindCSS
│
├── docs/                       # Documentación
│   ├── database/
│   │   └── schema.sql         # Esquema de base de datos
│   └── informe/               # Documentación del proyecto
│
├── *.sql                       # Scripts de base de datos
├── README.md                   # Documentación principal
└── package.json               # Scripts del workspace
```

### 6.1.3 Instalación y Configuración

**1. Clonar repositorio (si aplica):**
```bash
git clone <url-repositorio>
cd ECLIPSE
```

**2. Instalar dependencias del backend:**
```bash
cd backend
npm install
```

**3. Configurar variables de entorno del backend:**
```env
# backend/.env
PORT=3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_KEY=tu_clave_servicio
NODE_ENV=development
```

**4. Instalar dependencias del frontend:**
```bash
cd ../frontend
npm install
```

**5. Configurar variables de entorno del frontend:**
```env
# frontend/.env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
VITE_API_URL=http://localhost:3000/api
```

**6. Inicializar base de datos:**
```bash
# Ejecutar schema.sql en SQL Editor de Supabase
# Ejecutar scripts de datos iniciales si existen
```

### 6.1.4 Ejecución en Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Servidor corriendo en http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Aplicación corriendo en http://localhost:5173
```

## 6.2 Desarrollo del Backend

### 6.2.1 Configuración de Express

```javascript
// backend/src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
});
app.use('/api/', limiter);

// Middlewares de utilidad
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
import authRoutes from './routes/auth.routes.js';
import cajaRoutes from './routes/caja.routes.js';
import habitacionesRoutes from './routes/habitaciones.routes.js';
import registrosRoutes from './routes/registros.routes.js';
import inventarioRoutes from './routes/inventario.routes.js';
import reportesRoutes from './routes/reportes.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/reportes', reportesRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
```

### 6.2.2 Configuración de Supabase Client

```javascript
// backend/src/config/supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

### 6.2.3 Ejemplo de Ruta: Turnos (Caja)

```javascript
// backend/src/routes/caja.routes.js
import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Middleware de autenticación
async function autenticar(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  req.user = user;
  next();
}

// Obtener turno actual del usuario
router.get('/turno-actual', autenticar, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('turnos')
      .select(`
        *,
        usuario:usuarios(nombre, email)
      `)
      .eq('usuario_id', req.user.id)
      .eq('estado', 'abierto')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({ turno: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Abrir nuevo turno
router.post('/abrir', autenticar, async (req, res) => {
  try {
    const { saldoInicial, saldoHeredado } = req.body;

    // Verificar que no hay turno abierto
    const { data: turnoExistente } = await supabase
      .from('turnos')
      .select('id')
      .eq('usuario_id', req.user.id)
      .eq('estado', 'abierto')
      .single();

    if (turnoExistente) {
      return res.status(400).json({ 
        error: 'Ya tienes un turno abierto' 
      });
    }

    // Crear turno
    const { data: turno, error } = await supabase
      .from('turnos')
      .insert({
        usuario_id: req.user.id,
        saldo_inicial: saldoInicial || saldoHeredado || 0,
        estado: 'abierto'
      })
      .select()
      .single();

    if (error) throw error;

    // Si hay diferencia, crear consignación
    if (saldoInicial && saldoHeredado && saldoInicial !== saldoHeredado) {
      const diferencia = saldoHeredado - saldoInicial;
      const tipo = diferencia > 0 ? 'Retiro' : 'Ingreso';
      
      await supabase
        .from('consignaciones')
        .insert({
          turno_id: turno.id,
          usuario_id: req.user.id,
          monto: Math.abs(diferencia),
          observaciones: `Ajuste automático de apertura: ${tipo} por diferencia entre saldo heredado ($${saldoHeredado}) y base personalizada ($${saldoInicial})`
        });
    }

    res.json({ success: true, turno });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cerrar turno
router.post('/cerrar', autenticar, async (req, res) => {
  try {
    const { observaciones } = req.body;

    // Obtener turno actual
    const { data: turno } = await supabase
      .from('turnos')
      .select('*')
      .eq('usuario_id', req.user.id)
      .eq('estado', 'abierto')
      .single();

    if (!turno) {
      return res.status(400).json({ error: 'No hay turno abierto' });
    }

    // Calcular totales
    const { data: registros } = await supabase
      .from('registros')
      .select('total_pagado')
      .eq('turno_id', turno.id);

    const totalIngresos = registros.reduce((sum, r) => 
      sum + Number(r.total_pagado || 0), 0
    );

    const { data: consignaciones } = await supabase
      .from('consignaciones')
      .select('monto')
      .eq('turno_id', turno.id);

    const totalConsignaciones = consignaciones.reduce((sum, c) => 
      sum + Number(c.monto), 0
    );

    const saldoFinal = turno.saldo_inicial + totalIngresos - totalConsignaciones;

    // Actualizar turno
    const { data: turnoCerrado, error } = await supabase
      .from('turnos')
      .update({
        fecha_cierre: new Date().toISOString(),
        total_ingresos: totalIngresos,
        total_consignaciones: totalConsignaciones,
        saldo_final: saldoFinal,
        estado: 'cerrado',
        observaciones
      })
      .eq('id', turno.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, turno: turnoCerrado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

## 6.3 Desarrollo del Frontend

### 6.3.1 Configuración de Vite

```javascript
// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

### 6.3.2 Configuración de TailwindCSS

```javascript
// frontend/tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FFA54F', // Color principal (naranja del logo)
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      }
    },
  },
  plugins: [],
}
```

### 6.3.3 Context de Autenticación

```jsx
// frontend/src/contexts/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión al cargar
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Obtener datos del usuario
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUser({ ...session.user, ...userData });
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Obtener datos del usuario
    const { data: userData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();

    setUser({ ...data.user, ...userData });
    
    return data;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 6.3.4 Ejemplo de Servicio: Caja

```javascript
// frontend/src/services/caja.service.js
import axios from '../lib/axios';

export const cajaService = {
  async getTurnoActual() {
    const response = await axios.get('/caja/turno-actual');
    return response.data;
  },

  async abrirTurno(saldoInicial, saldoHeredado) {
    const response = await axios.post('/caja/abrir', {
      saldoInicial,
      saldoHeredado
    });
    return response.data;
  },

  async cerrarTurno(observaciones) {
    const response = await axios.post('/caja/cerrar', {
      observaciones
    });
    return response.data;
  },

  async registrarConsignacion(turnoId, monto, observaciones) {
    const response = await axios.post('/caja/consignacion', {
      turnoId,
      monto,
      observaciones
    });
    return response.data;
  },

  async getHistorial(limite = 10) {
    const response = await axios.get('/caja/historial', {
      params: { limite }
    });
    return response.data;
  }
};
```

### 6.3.5 Ejemplo de Página: Dashboard

```jsx
// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { DollarSign, Home, Package, TrendingUp } from 'lucide-react';
import { cajaService } from '../services/caja.service';
import { habitacionesService } from '../services/habitaciones.service';
import { inventarioService } from '../services/inventario.service';

export default function Dashboard() {
  const [stats, setStats] = useState({
    turno: null,
    ocupacion: { ocupadas: 0, total: 11 },
    ingresosTurno: 0,
    stockBajo: 0,
    ventasHoy: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [turno, habitaciones, productos] = await Promise.all([
        cajaService.getTurnoActual(),
        habitacionesService.getAll(),
        inventarioService.getAll()
      ]);

      const ocupadas = habitaciones.filter(h => h.estado === 'ocupada').length;
      const stockBajo = productos.filter(p => 
        p.stock_actual <= p.stock_minimo
      ).length;

      setStats({
        turno: turno.turno,
        ocupacion: { ocupadas, total: 11 },
        ingresosTurno: turno.turno?.total_ingresos || 0,
        stockBajo,
        ventasHoy: 0 // Calcular según reporte del día
      });
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    }
  }

  const porcentajeOcupacion = Math.round(
    (stats.ocupacion.ocupadas / stats.ocupacion.total) * 100
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Turno Actual */}
        <div className="card border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Estado del Turno</p>
              {stats.turno ? (
                <div>
                  <p className="text-2xl font-bold text-green-600">ABIERTO</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.turno.usuario?.nombre}
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-red-600">CERRADO</p>
              )}
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Ocupación */}
        <div className="card border-l-4 border-l-purple-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Ocupación</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.ocupacion.ocupadas}/{stats.ocupacion.total}
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${porcentajeOcupacion}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {porcentajeOcupacion}% ocupado
                </p>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Ingresos del Turno */}
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-green-100">Ingresos del Turno</p>
              <p className="text-3xl font-bold">
                ${stats.ingresosTurno.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Stock Bajo */}
        <div className={`card border-l-4 ${
          stats.stockBajo > 0 ? 'border-l-red-500' : 'border-l-green-500'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Productos Stock Bajo</p>
              <p className={`text-2xl font-bold ${
                stats.stockBajo > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {stats.stockBajo}
              </p>
              {stats.stockBajo > 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Requieren reabastecimiento
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${
              stats.stockBajo > 0 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <Package className={`w-6 h-6 ${
                stats.stockBajo > 0 ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 6.4 Generación de PDFs

### 6.4.1 Utilidad de Generación

```javascript
// frontend/src/utils/generarPDF.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

const primaryColor = [255, 165, 79]; // Naranja
const darkText = [30, 30, 30];      // Negro
const mediumText = [100, 100, 100]; // Gris

export function generarPDFTurno(datosReporte) {
  const doc = new jsPDF();
  
  // Cargar logo
  const logoImg = new Image();
  logoImg.src = '/logo.png';
  
  try {
    doc.addImage(logoImg, 'PNG', 162, 5, 35, 35);
  } catch (error) {
    console.warn('No se pudo cargar el logo');
  }

  // Header con fondo gris
  doc.setFillColor(50, 50, 50);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('MOTEL ECLIPSE', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Reporte de Cierre de Turno', 105, 30, { align: 'center' });

  // Información del turno
  let yPos = 50;
  doc.setTextColor(...darkText);
  doc.setFontSize(10);
  
  doc.text(`Responsable: ${datosReporte.turno.usuario.nombre}`, 20, yPos);
  yPos += 6;
  doc.text(
    `Fecha: ${format(new Date(datosReporte.turno.fecha_cierre), 'dd/MM/yyyy HH:mm')}`,
    20,
    yPos
  );

  // Resumen financiero
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Resumen Financiero', 20, yPos);
  
  yPos += 10;
  doc.autoTable({
    startY: yPos,
    head: [['Concepto', 'Monto']],
    body: [
      ['Saldo Inicial', `$${datosReporte.turno.saldo_inicial.toLocaleString()}`],
      ['Ingresos', `$${datosReporte.turno.total_ingresos.toLocaleString()}`],
      ['Consignaciones', `$${datosReporte.turno.total_consignaciones.toLocaleString()}`],
      ['Saldo Final', `$${datosReporte.turno.saldo_final.toLocaleString()}`]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255]
    },
    bodyStyles: {
      textColor: darkText
    }
  });

  // Guardar PDF
  doc.save(`Turno_${datosReporte.turno.id}_${Date.now()}.pdf`);
}
```

---
