# CAPÍTULO 2: MARCO TEÓRICO Y TECNOLÓGICO

## 2.1 Conceptos Fundamentales

### 2.1.1 Sistema de Gestión

Un sistema de gestión es una aplicación informática que permite administrar, controlar y optimizar los procesos operativos de una organización. En el contexto de este proyecto, integra módulos para la gestión de turnos, habitaciones, inventario y reportes.

### 2.1.2 Aplicación Web

Aplicación de software que se ejecuta en un navegador web, sin necesidad de instalación en el dispositivo del usuario. Ofrece ventajas como:
- Acceso desde cualquier dispositivo con navegador
- Actualizaciones centralizadas
- Compatibilidad multiplataforma
- Menor costo de mantenimiento

### 2.1.3 Arquitectura Cliente-Servidor

Modelo de diseño donde el sistema se divide en:
- **Cliente (Frontend)**: Interfaz de usuario que se ejecuta en el navegador
- **Servidor (Backend)**: Lógica de negocio y acceso a datos
- **Base de Datos**: Almacenamiento persistente de información

Esta separación permite escalabilidad, mantenibilidad y seguridad.

### 2.1.4 API REST

**REST (Representational State Transfer)** es un estilo arquitectónico para diseñar servicios web. Define operaciones mediante métodos HTTP:
- **GET**: Consultar recursos
- **POST**: Crear nuevos recursos
- **PUT/PATCH**: Actualizar recursos existentes
- **DELETE**: Eliminar recursos

### 2.1.5 Single Page Application (SPA)

Aplicación web que carga una única página HTML y actualiza dinámicamente el contenido mediante JavaScript, sin recargar la página completa. Proporciona experiencia de usuario fluida similar a aplicaciones nativas.

## 2.2 Tecnologías del Frontend

### 2.2.1 React.js (v18.2.0)

**¿Qué es?**
Biblioteca de JavaScript desarrollada por Meta (Facebook) para construir interfaces de usuario interactivas mediante componentes reutilizables.

**¿Por qué se eligió?**
- **Componentes**: Modularidad y reutilización de código
- **Virtual DOM**: Renderizado eficiente y rápido
- **Ecosistema**: Amplia comunidad y librerías disponibles
- **Hooks**: Gestión de estado moderna y funcional
- **Reactivo**: Actualizaciones automáticas de UI cuando cambian los datos

**Uso en el proyecto:**
- Creación de componentes para Dashboard, Habitaciones, Caja, Inventario
- Gestión de estado con useState y useContext
- Navegación con React Router
- Formularios interactivos con validación en tiempo real

### 2.2.2 Vite (v5.1.0)

**¿Qué es?**
Herramienta de construcción (build tool) ultrarrápida para proyectos frontend modernos.

**¿Por qué se eligió?**
- **Desarrollo rápido**: Hot Module Replacement (HMR) instantáneo
- **Compilación optimizada**: Bundling eficiente para producción
- **Configuración simple**: Menos complejidad que Webpack
- **Soporte nativo ESM**: Módulos ES6 nativos en desarrollo

**Uso en el proyecto:**
- Servidor de desarrollo local con recarga instantánea
- Compilación optimizada para producción
- Configuración de proxy para API backend

### 2.2.3 TailwindCSS (v3.4.1)

**¿Qué es?**
Framework CSS utility-first que permite construir interfaces mediante clases predefinidas.

**¿Por qué se eligió?**
- **Productividad**: Diseño rápido sin escribir CSS custom
- **Consistencia**: Sistema de diseño uniforme
- **Responsivo**: Clases para diferentes tamaños de pantalla
- **Personalizable**: Configuración de colores y estilos de marca

**Uso en el proyecto:**
- Diseño responsivo de todas las vistas
- Sistema de colores personalizados (naranja #FFA54F para marca)
- Componentes de UI (cards, botones, modales, tablas)
- Gradientes y efectos visuales

### 2.2.4 React Router DOM (v6.22.0)

**¿Qué es?**
Biblioteca para gestionar navegación y rutas en aplicaciones React SPA.

**¿Por qué se eligió?**
- **Navegación declarativa**: Rutas definidas como componentes
- **Rutas protegidas**: Control de acceso por autenticación
- **Parámetros dinámicos**: URLs con IDs de recursos
- **Historial**: Navegación back/forward del navegador

**Uso en el proyecto:**
```jsx
- / → Login
- /dashboard → Página principal
- /habitaciones → Gestión de habitaciones
- /caja → Control de turnos
- /inventario → Administración de productos
- /reportes → Estadísticas y PDFs
- /usuarios → Gestión de usuarios
```

### 2.2.5 Axios (v1.6.7)

**¿Qué es?**
Cliente HTTP basado en promesas para realizar peticiones al backend.

**¿Por qué se eligió?**
- **Interceptores**: Inyección automática de tokens de autenticación
- **Manejo de errores**: Gestión centralizada de errores HTTP
- **Transformación de datos**: Serialización/deserialización automática
- **Cancelación de peticiones**: Evita memory leaks

**Uso en el proyecto:**
- Configuración de base URL del API
- Interceptor para agregar token JWT en headers
- Servicios organizados por módulo (caja.service.js, habitaciones.service.js, etc.)

### 2.2.6 Librerías Complementarias

#### Lucide React (v0.323.0)
- **Propósito**: Iconos SVG modernos y ligeros
- **Uso**: Iconos en menús, botones y dashboard (DollarSign, Home, Package, etc.)

#### date-fns (v3.6.0)
- **Propósito**: Manipulación y formato de fechas
- **Uso**: Formato de fechas en reportes (`dd/MM/yyyy HH:mm`)

#### React Hot Toast (v2.4.1)
- **Propósito**: Notificaciones toast elegantes
- **Uso**: Feedback de operaciones exitosas o errores

#### Chart.js + React Chart.js 2 (v5.2.0)
- **Propósito**: Gráficos interactivos
- **Uso**: Visualización de estadísticas en reportes

#### jsPDF + jsPDF-AutoTable (v2.5.2 / v3.8.2)
- **Propósito**: Generación de documentos PDF en el navegador
- **Uso**: Reportes de turno y estadísticas con logo del motel

## 2.3 Tecnologías del Backend

### 2.3.1 Node.js

**¿Qué es?**
Entorno de ejecución de JavaScript del lado del servidor, construido sobre el motor V8 de Chrome.

**¿Por qué se eligió?**
- **JavaScript full-stack**: Mismo lenguaje en frontend y backend
- **Asíncrono**: Manejo eficiente de múltiples conexiones concurrentes
- **NPM**: Acceso a millones de paquetes
- **Rendimiento**: Ejecución rápida gracias a V8

### 2.3.2 Express.js (v4.18.2)

**¿Qué es?**
Framework minimalista para construir aplicaciones web y APIs en Node.js.

**¿Por qué se eligió?**
- **Simplicidad**: API intuitiva y fácil de aprender
- **Middleware**: Sistema extensible de procesamiento de peticiones
- **Routing**: Definición clara de endpoints
- **Comunidad**: Gran cantidad de plugins y documentación

**Uso en el proyecto:**
- Definición de rutas RESTful (`/api/turnos`, `/api/habitaciones`, etc.)
- Middleware de autenticación para proteger endpoints
- Middleware de validación de datos con express-validator
- Manejo centralizado de errores

### 2.3.3 Middlewares de Seguridad

#### Helmet (v7.1.0)
- **Propósito**: Protección contra vulnerabilidades web comunes
- **Uso**: Headers HTTP seguros (XSS, clickjacking, etc.)

#### CORS (v2.8.5)
- **Propósito**: Control de acceso entre dominios
- **Uso**: Permitir peticiones solo desde frontend autorizado

#### Express Rate Limit (v7.1.5)
- **Propósito**: Prevención de ataques de fuerza bruta
- **Uso**: Límite de peticiones por IP (100 req/15min)

#### Express Validator (v7.0.1)
- **Propósito**: Validación y sanitización de datos de entrada
- **Uso**: Validación de campos en POST/PUT requests

### 2.3.4 Middlewares de Utilidad

#### Morgan (v1.10.0)
- **Propósito**: Logging de peticiones HTTP
- **Uso**: Registro de todas las peticiones para debugging

#### Compression (v1.7.4)
- **Propósito**: Compresión de respuestas HTTP
- **Uso**: Reducción de tamaño de datos transferidos (gzip)

#### dotenv (v16.4.1)
- **Propósito**: Gestión de variables de entorno
- **Uso**: Configuración de URLs, secretos y credenciales

## 2.4 Base de Datos

### 2.4.1 PostgreSQL

**¿Qué es?**
Sistema de gestión de bases de datos relacional (RDBMS) open-source, considerado uno de los más avanzados.

**¿Por qué se eligió?**
- **ACID**: Garantías de consistencia y transacciones
- **Tipos de datos avanzados**: ENUM, JSONB, UUID
- **Rendimiento**: Índices optimizados y consultas complejas
- **Extensiones**: Funciones y triggers personalizados
- **Integridad referencial**: Foreign keys y constraints

**Características usadas:**
- **Tipos ENUM**: `estado_habitacion`, `rol_usuario`, `tipo_habitacion`
- **UUID**: Identificadores únicos para todas las tablas
- **Triggers**: Actualización automática de campos `updated_at`
- **Índices**: Optimización de consultas frecuentes
- **Funciones**: Lógica de cálculo en base de datos

### 2.4.2 Supabase

**¿Qué es?**
Backend-as-a-Service (BaaS) basado en PostgreSQL que proporciona API automática, autenticación y almacenamiento.

**¿Por qué se eligió?**
- **PostgreSQL completo**: Toda la potencia de PostgreSQL
- **API auto-generada**: RESTful API basada en esquema de BD
- **Autenticación integrada**: Sistema de usuarios con JWT
- **Row Level Security (RLS)**: Seguridad a nivel de fila
- **Dashboard visual**: Gestión de BD mediante interfaz web
- **Capa gratuita generosa**: Ideal para desarrollo y producción inicial

**Uso en el proyecto:**
- Hosting de base de datos PostgreSQL
- Cliente JavaScript (`@supabase/supabase-js`) para consultas
- Autenticación de usuarios con roles
- Políticas RLS para proteger datos sensibles

### 2.4.3 Row Level Security (RLS)

**¿Qué es?**
Sistema de PostgreSQL que permite definir políticas de acceso a nivel de fila, controlando qué registros puede ver/modificar cada usuario.

**Implementación en el proyecto:**
```sql
-- Solo el dueño puede crear/modificar usuarios
CREATE POLICY "Dueño gestiona usuarios" ON usuarios
FOR ALL USING (auth.uid() IN (
  SELECT id FROM usuarios WHERE rol = 'dueno'
));

-- Los turnos solo pueden ser vistos por su creador o el dueño
CREATE POLICY "Ver propios turnos" ON turnos
FOR SELECT USING (
  usuario_id = auth.uid() OR
  auth.uid() IN (SELECT id FROM usuarios WHERE rol = 'dueno')
);
```

## 2.5 Control de Versiones

### 2.5.1 Git

Sistema de control de versiones distribuido que permite:
- Historial completo de cambios en el código
- Colaboración entre desarrolladores
- Ramas para desarrollo de features
- Rollback a versiones anteriores

### 2.5.2 Estructura del Repositorio

```
ECLIPSE/
├── backend/          # API Node.js/Express
├── frontend/         # Aplicación React
├── docs/            # Documentación técnica
└── *.sql            # Scripts de base de datos
```

---
