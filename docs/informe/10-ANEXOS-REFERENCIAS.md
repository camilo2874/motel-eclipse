# ANEXOS Y REFERENCIAS

## ANEXO A: Glosario de Términos

**API (Application Programming Interface):** Conjunto de definiciones y protocolos que permite la comunicación entre aplicaciones software.

**Backend:** Parte del sistema que se ejecuta en el servidor y maneja la lógica de negocio y acceso a datos.

**Bundle:** Archivo JavaScript compilado que contiene todo el código de la aplicación frontend.

**CRUD:** Create, Read, Update, Delete - Operaciones básicas de gestión de datos.

**CSRF (Cross-Site Request Forgery):** Ataque que fuerza a un usuario autenticado a ejecutar acciones no deseadas.

**Frontend:** Parte del sistema que se ejecuta en el navegador y presenta la interfaz de usuario.

**JWT (JSON Web Token):** Estándar abierto para transmitir información de forma segura entre partes como objeto JSON.

**Middleware:** Función que procesa peticiones antes de llegar al controlador final.

**PostgreSQL:** Sistema de gestión de bases de datos relacional open-source.

**React:** Biblioteca JavaScript para construir interfaces de usuario mediante componentes.

**REST (Representational State Transfer):** Estilo arquitectónico para diseñar servicios web.

**RLS (Row Level Security):** Sistema de PostgreSQL para controlar acceso a nivel de fila.

**SPA (Single Page Application):** Aplicación web que carga una sola página HTML y actualiza dinámicamente.

**Supabase:** Plataforma Backend-as-a-Service basada en PostgreSQL.

**TailwindCSS:** Framework CSS utility-first para diseño rápido.

**Token:** Cadena de caracteres que representa credenciales de autenticación.

**Vite:** Herramienta de construcción rápida para proyectos frontend.

**XSS (Cross-Site Scripting):** Vulnerabilidad que permite inyectar scripts maliciosos en páginas web.

---

## ANEXO B: Diagramas Complementarios

### Diagrama de Flujo: Check-in de Cliente

```
Inicio
  ↓
Usuario selecciona habitación disponible
  ↓
Sistema abre modal de check-in
  ↓
Usuario ingresa datos (hora entrada, observaciones)
  ↓
¿Hay turno abierto?
  ├─ NO → Mostrar error "Debe abrir turno primero" → Fin
  └─ SÍ → Continuar
          ↓
      Crear registro en BD
          ↓
      Cambiar estado habitación a "ocupada"
          ↓
      Mostrar toast de confirmación
          ↓
      Actualizar vista de habitaciones
          ↓
         Fin
```

### Diagrama de Flujo: Cierre de Turno

```
Inicio
  ↓
Usuario hace clic en "Cerrar Turno"
  ↓
¿Hay turno abierto?
  ├─ NO → Mostrar error → Fin
  └─ SÍ → Continuar
          ↓
      Calcular totales:
      - SUM(registros.total_pagado) → total_ingresos
      - SUM(consignaciones.monto) → total_consignaciones
      - saldo_final = saldo_inicial + total_ingresos - total_consignaciones
          ↓
      Actualizar registro turno:
      - fecha_cierre = NOW()
      - estado = 'cerrado'
      - Guardar totales
          ↓
      Obtener datos para reporte:
      - Habitaciones usadas
      - Productos vendidos
      - Consignaciones
          ↓
      Mostrar modal con reporte completo
          ↓
      Usuario puede:
      - Ver reporte en pantalla
      - Descargar PDF
      - Imprimir
      - Copiar texto
          ↓
      Usuario hace clic en "Cerrar" modal
          ↓
         Fin
```

---

## ANEXO C: Capturas de Pantalla

*Nota: En el documento final de Word, incluir aquí capturas de pantalla reales de:*

1. **Pantalla de Login**
   - Formulario de acceso
   - Campos: email, contraseña
   - Botón "Iniciar Sesión"

2. **Dashboard Principal**
   - Tarjetas de métricas
   - Estado del turno
   - Ocupación de habitaciones
   - Ingresos del turno
   - Alertas de stock

3. **Vista de Habitaciones**
   - Cuadrícula de 11 habitaciones
   - Diferentes estados (colores)
   - Botones de acción por habitación

4. **Modal de Check-out**
   - Información del registro
   - Cálculo de tarifa
   - Lista de consumos
   - Total a pagar

5. **Vista de Caja**
   - Información del turno actual
   - Resumen financiero
   - Botones de consignación y cierre

6. **Inventario de Productos**
   - Tabla con productos
   - Indicadores de stock bajo
   - Filtros por categoría

7. **Reportes Estadísticos**
   - Selector de periodo
   - Gráficos de ocupación
   - Tabla de productos más vendidos

8. **Ejemplo de PDF Generado**
   - Reporte de cierre de turno
   - Logo en encabezado
   - Tablas con datos financieros

9. **Gestión de Usuarios (Dueño)**
   - Listado de usuarios
   - Roles y estados
   - Opciones de edición

---

## ANEXO D: Scripts SQL Importantes

### D.1 Creación de Usuario Administrador Inicial

```sql
-- Ejecutar después de crear usuario en Supabase Auth
INSERT INTO usuarios (id, nombre, email, rol, activo)
VALUES (
  'uuid-del-usuario-auth', -- ID del usuario creado en Auth
  'Administrador Principal',
  'admin@moteleclipse.com',
  'dueno',
  true
);
```

### D.2 Inserción de Tarifas Iniciales

```sql
INSERT INTO tarifas (tipo, precio_base, precio_hora_extra, horas_base, minutos_gracia) VALUES
('normal', 80000, 7000, 12, 15),
('maquina_amor', 100000, 8500, 12, 15),
('suite', 120000, 10000, 12, 15);
```

### D.3 Creación de Habitaciones (1-11)

```sql
INSERT INTO habitaciones (numero, tipo, estado, tarifa_id)
SELECT 
  num,
  CASE 
    WHEN num IN (1,2,3,4,5,6) THEN 'normal'::tipo_habitacion
    WHEN num IN (7,8,9) THEN 'maquina_amor'::tipo_habitacion
    ELSE 'suite'::tipo_habitacion
  END,
  'disponible'::estado_habitacion,
  (SELECT id FROM tarifas WHERE tipo = 
    CASE 
      WHEN num IN (1,2,3,4,5,6) THEN 'normal'::tipo_habitacion
      WHEN num IN (7,8,9) THEN 'maquina_amor'::tipo_habitacion
      ELSE 'suite'::tipo_habitacion
    END
  )
FROM generate_series(1, 11) AS num;
```

### D.4 Script de Reinicio General (Desarrollo)

```sql
-- ⚠️ CUIDADO: Elimina todos los datos (solo para desarrollo)

-- Deshabilitar triggers temporalmente
SET session_replication_role = 'replica';

-- Eliminar datos en orden (respetando foreign keys)
TRUNCATE TABLE auditoria CASCADE;
TRUNCATE TABLE movimientos_inventario CASCADE;
TRUNCATE TABLE consignaciones CASCADE;
TRUNCATE TABLE consumos CASCADE;
TRUNCATE TABLE registros CASCADE;
TRUNCATE TABLE turnos CASCADE;
TRUNCATE TABLE inventario CASCADE;

-- Reiniciar habitaciones a estado disponible
UPDATE habitaciones SET estado = 'disponible';

-- Habilitar triggers nuevamente
SET session_replication_role = 'origin';

-- Mensaje de confirmación
SELECT 'Base de datos reiniciada exitosamente' AS status;
```

---

## REFERENCIAS BIBLIOGRÁFICAS

### Documentación Oficial

1. **React Documentation** (2024). *React – A JavaScript library for building user interfaces*. Recuperado de: https://react.dev/

2. **Express.js Documentation** (2024). *Express - Fast, unopinionated, minimalist web framework for Node.js*. Recuperado de: https://expressjs.com/

3. **PostgreSQL Documentation** (2024). *PostgreSQL: The World's Most Advanced Open Source Relational Database*. Recuperado de: https://www.postgresql.org/docs/

4. **Supabase Documentation** (2024). *Supabase | The Open Source Firebase Alternative*. Recuperado de: https://supabase.com/docs

5. **TailwindCSS Documentation** (2024). *Rapidly build modern websites without ever leaving your HTML*. Recuperado de: https://tailwindcss.com/docs

6. **Vite Documentation** (2024). *Vite | Next Generation Frontend Tooling*. Recuperado de: https://vitejs.dev/

7. **jsPDF Documentation** (2024). *Client-side JavaScript PDF generation for everyone*. Recuperado de: https://github.com/parallax/jsPDF

### Artículos y Recursos Técnicos

8. Mozilla Developer Network (2024). *MDN Web Docs - HTTP*. Recuperado de: https://developer.mozilla.org/en-US/docs/Web/HTTP

9. OWASP Foundation (2024). *OWASP Top Ten*. Recuperado de: https://owasp.org/www-project-top-ten/

10. Martin Fowler (2014). *Microservices*. Recuperado de: https://martinfowler.com/articles/microservices.html

11. Roy Fielding (2000). *Architectural Styles and the Design of Network-based Software Architectures*. Doctoral dissertation, University of California, Irvine.

### Libros

12. Flanagan, D. (2020). *JavaScript: The Definitive Guide* (7th ed.). O'Reilly Media.

13. Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly Media.

14. Hunt, A., & Thomas, D. (1999). *The Pragmatic Programmer: From Journeyman to Master*. Addison-Wesley.

15. Sommerville, I. (2015). *Software Engineering* (10th ed.). Pearson.

### Estándares Web

16. W3C (2021). *Web Content Accessibility Guidelines (WCAG) 2.1*. Recuperado de: https://www.w3.org/WAI/WCAG21/quickref/

17. IETF (2015). *RFC 7519: JSON Web Token (JWT)*. Recuperado de: https://datatracker.ietf.org/doc/html/rfc7519

18. IETF (2014). *RFC 7231: HTTP/1.1 Semantics and Content*. Recuperado de: https://datatracker.ietf.org/doc/html/rfc7231

### Repositorios y Herramientas

19. **GitHub - React**: https://github.com/facebook/react

20. **GitHub - Express**: https://github.com/expressjs/express

21. **GitHub - Supabase**: https://github.com/supabase/supabase

22. **npm Registry**: https://www.npmjs.com/

---

## ANEXO E: Estructura de Archivos del Proyecto

```
ECLIPSE/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── supabase.js
│   │   │   └── constants.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── caja.routes.js
│   │   │   ├── habitaciones.routes.js
│   │   │   ├── inventario.routes.js
│   │   │   ├── registros.routes.js
│   │   │   └── reportes.routes.js
│   │   └── server.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── logo.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── ReporteTurno.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── lib/
│   │   │   ├── axios.js
│   │   │   └── supabase.js
│   │   ├── pages/
│   │   │   ├── Caja.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Habitaciones.jsx
│   │   │   ├── Inventario.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Reportes.jsx
│   │   │   └── Usuarios.jsx
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── caja.service.js
│   │   │   ├── habitaciones.service.js
│   │   │   ├── inventario.service.js
│   │   │   └── reportes.service.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── generarPDF.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── docs/
│   ├── database/
│   │   └── schema.sql
│   ├── informe/
│   │   ├── 01-PORTADA-Y-RESUMEN.md
│   │   ├── 02-INTRODUCCION-Y-OBJETIVOS.md
│   │   ├── 03-MARCO-TEORICO-TECNOLOGICO.md
│   │   ├── 04-ARQUITECTURA-SISTEMA.md
│   │   ├── 05-DISENO-BASE-DATOS.md
│   │   ├── 06-FUNCIONALIDADES-SISTEMA.md
│   │   ├── 07-IMPLEMENTACION-DESARROLLO.md
│   │   ├── 08-PRUEBAS-VALIDACION.md
│   │   ├── 09-CONCLUSIONES-RECOMENDACIONES.md
│   │   └── 10-ANEXOS-REFERENCIAS.md
│   ├── DEPLOYMENT.md
│   ├── GUIA-PRINCIPIANTES.md
│   └── SETUP.md
│
├── crear-administrador.sql
├── diagnostico-turnos.sql
├── disable-rls-usuarios.sql
├── fix-usuarios-rls.sql
├── limpiar-datos-prueba.sql
├── reinicio-general.sql
├── supabase-rls-policies.sql
├── .gitignore
├── COMANDOS.md
├── package.json
├── README.md
└── TODO.md
```

---

## ANEXO F: Variables de Entorno

### Backend (.env)

```env
# Puerto del servidor
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima_aqui
SUPABASE_SERVICE_KEY=tu_clave_servicio_aqui

# Environment
NODE_ENV=development

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# API Backend URL
VITE_API_URL=http://localhost:3000/api
```

---

## ANEXO G: Comandos Útiles

### Instalación

```bash
# Instalar dependencias backend
cd backend
npm install

# Instalar dependencias frontend
cd frontend
npm install
```

### Desarrollo

```bash
# Iniciar backend (dev con nodemon)
cd backend
npm run dev

# Iniciar frontend (dev con Vite)
cd frontend
npm run dev
```

### Producción

```bash
# Build frontend
cd frontend
npm run build

# Iniciar backend en producción
cd backend
npm start
```

### Base de Datos

```bash
# Conectar a PostgreSQL (Supabase)
psql postgres://postgres:[PASSWORD]@[HOST]:5432/postgres

# Ejecutar script SQL
psql -f schema.sql

# Backup de base de datos
pg_dump -h [HOST] -U postgres -d postgres > backup.sql

# Restaurar backup
psql -h [HOST] -U postgres -d postgres < backup.sql
```

---

## CONTACTO Y SOPORTE

**Desarrollador:** [Tu nombre]  
**Email:** [tu_email@ejemplo.com]  
**Institución:** [Nombre de tu institución]  
**Fecha:** Enero 2026

**Repositorio:** [URL del repositorio Git si aplica]  
**Documentación Online:** [URL si aplica]

---

**FIN DEL INFORME**

---

*Este documento fue generado como parte del proyecto de grado para el Sistema de Gestión Integral del Motel Eclipse. Todos los derechos reservados © 2026.*
