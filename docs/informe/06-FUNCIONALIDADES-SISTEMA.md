# CAPÍTULO 5: FUNCIONALIDADES DEL SISTEMA

## 5.1 Módulo de Autenticación

### 5.1.1 Descripción

Sistema de inicio de sesión seguro que controla el acceso al sistema mediante credenciales de usuario y autenticación basada en tokens JWT.

### 5.1.2 Funcionalidades

**Login (Inicio de Sesión)**
- Validación de email y contraseña
- Generación de token JWT
- Almacenamiento seguro de sesión
- Redirección automática al dashboard

**Protección de Rutas**
- Verificación de autenticación antes de acceder a vistas
- Redirección a login si no hay sesión activa
- Validación de token en cada petición al backend

**Control de Roles**
- Diferenciación entre "dueño" y "administrador"
- Restricción de acceso a gestión de usuarios (solo dueño)
- Menú dinámico según rol del usuario

### 5.1.3 Flujo de Usuario

```
1. Usuario ingresa email y contraseña
2. Sistema valida credenciales con Supabase Auth
3. Si es válido:
   a. Se genera token JWT
   b. Se obtiene perfil del usuario (nombre, rol)
   c. Se almacena en AuthContext y localStorage
   d. Redirección a /dashboard
4. Si es inválido:
   a. Mostrar mensaje de error
   b. Mantener en página de login
```

### 5.1.4 Tecnologías Utilizadas

- **Supabase Auth**: Sistema de autenticación
- **React Context API**: Estado global de sesión
- **localStorage**: Persistencia de token
- **JWT**: Tokens de acceso

## 5.2 Módulo Dashboard

### 5.2.1 Descripción

Vista principal del sistema que muestra métricas clave en tiempo real para toma de decisiones operativas.

### 5.2.2 Métricas Visualizadas

**1. Estado del Turno**
- Indicador visual: turno abierto (verde) o cerrado (rojo)
- Información: responsable del turno activo
- Acción rápida: abrir turno desde el dashboard

**2. Ocupación de Habitaciones**
- Total de habitaciones ocupadas vs disponibles
- Porcentaje de ocupación con barra de progreso
- Código de colores: >80% (verde), 50-80% (amarillo), <50% (rojo)

**3. Ingresos del Turno Actual**
- Monto total generado en el turno abierto
- Desglose: ingresos por habitaciones + consumos
- Visualización destacada con gradiente verde

**4. Productos con Stock Bajo**
- Cantidad de productos bajo stock mínimo
- Alerta visual cuando hay productos críticos
- Link directo a vista de inventario

**5. Total de Ventas Hoy**
- Suma de todas las transacciones del día
- Comparación con días anteriores (opcional)
- Incluye habitaciones y productos

### 5.2.3 Diseño de Interfaz

```
┌─────────────────────────────────────────────────────────┐
│  DASHBOARD - Motel Eclipse                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ Turno    │  │Ocupación │  │   Ingresos Turno     │ │
│  │ ABIERTO  │  │  7/11    │  │                      │ │
│  │ ✓        │  │  64%     │  │   $1,245,000        │ │
│  │          │  │ ████░    │  │                      │ │
│  └──────────┘  └──────────┘  └──────────────────────┘ │
│                                                         │
│  ┌──────────┐  ┌──────────────────────────────────┐  │
│  │Stock Bajo│  │   Total Ventas Hoy              │  │
│  │    3     │  │                                  │  │
│  │   ⚠️     │  │        $3,850,000               │  │
│  └──────────┘  └──────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2.4 Actualización de Datos

- **Carga inicial**: Al ingresar al dashboard
- **Refetch automático**: Cada 30 segundos
- **Actualización manual**: Botón de recarga
- **Tiempo real**: WebSockets (futuro enhancement)

## 5.3 Módulo de Habitaciones

### 5.3.1 Descripción

Gestión completa del ciclo de vida de ocupación de habitaciones, desde check-in hasta check-out.

### 5.3.2 Funcionalidades Principales

#### A. Visualización de Habitaciones

**Vista de cuadrícula:**
- 11 tarjetas (una por habitación)
- Código de colores por estado:
  - **Verde**: Disponible
  - **Rojo**: Ocupada
  - **Amarillo**: En limpieza
  - **Gris**: En mantenimiento
- Información visible:
  - Número de habitación
  - Tipo (Normal, Máquina del Amor, Suite)
  - Precio base
  - Estado actual

#### B. Check-in (Ingreso de Cliente)

**Proceso:**
```
1. Usuario selecciona habitación disponible
2. Sistema abre modal de check-in
3. Datos capturados:
   - Hora de entrada (automática o manual)
   - Observaciones (opcional)
4. Sistema registra:
   - Asocia registro al turno activo
   - Cambia estado de habitación a "ocupada"
   - Guarda usuario responsable
5. Confirmación visual con toast
```

**Validaciones:**
- Solo habitaciones disponibles permiten check-in
- Debe existir un turno abierto
- Fecha/hora de entrada no puede ser futura

#### C. Gestión de Consumos Durante Estadía

**Agregar productos:**
```
1. Usuario abre registro activo
2. Selecciona productos del inventario
3. Indica cantidad
4. Sistema:
   - Calcula subtotal (cantidad × precio)
   - Reduce stock del producto
   - Suma al subtotal_consumos del registro
5. Actualiza total en tiempo real
```

**Eliminar consumos:**
- Permite corregir errores antes del checkout
- Restaura stock al inventario
- Recalcula totales automáticamente

#### D. Check-out (Salida de Cliente)

**Proceso:**
```
1. Usuario selecciona habitación ocupada
2. Sistema muestra modal de check-out con:
   - Hora de entrada original
   - Hora de salida (actual o personalizada)
   - Tiempo total de ocupación
   - Cálculo automático de tarifa
   - Lista de consumos
   - Total a pagar
3. Usuario confirma y registra pago
4. Sistema:
   - Marca registro como finalizado
   - Cambia habitación a estado "limpieza"
   - Suma ingreso al turno activo
   - Genera comprobante
```

**Cálculo de Tarifa:**
```javascript
const horasOcupadas = (fechaSalida - fechaEntrada) / 3600000;
const horasBase = 12;
const minutosGracia = 15;

if (horasOcupadas <= horasBase + (minutosGracia / 60)) {
  subtotalHabitacion = precioBase;
} else {
  const horasExtra = horasOcupadas - horasBase - (minutosGracia / 60);
  subtotalHabitacion = precioBase + (horasExtra * precioHoraExtra);
}

totalPagar = subtotalHabitacion + subtotalConsumos;
```

#### E. Cambio Manual de Estado

**Casos de uso:**
- **Limpieza → Disponible**: Al completar limpieza de habitación
- **Disponible → Mantenimiento**: Cuando se detecta problema
- **Mantenimiento → Disponible**: Tras reparación

### 5.3.3 Interfaz de Usuario

```
┌─────────────────────────────────────────────────────────┐
│  HABITACIONES                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐      │
│  │  #1    │  │  #2    │  │  #3    │  │  #4    │      │
│  │ Normal │  │ Normal │  │ Suite  │  │  M.A.  │      │
│  │ $80K   │  │ $80K   │  │ $120K  │  │ $100K  │      │
│  │ ✓ DISP │  │ × OCUP │  │ ◷ LIMP │  │ ⚠ MANT │      │
│  │[Check] │  │[Salida]│  │[Cambio]│  │[Cambio]│      │
│  └────────┘  └────────┘  └────────┘  └────────┘      │
│  ... (habitaciones 5-11) ...                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 5.4 Módulo de Caja (Turnos)

### 5.4.1 Descripción

Control de turnos de trabajo con gestión de caja y registro de movimientos financieros.

### 5.4.2 Funcionalidades Principales

#### A. Abrir Turno

**Opciones de apertura:**

1. **Heredar saldo anterior:**
   - Sistema obtiene saldo final del último turno cerrado
   - Se muestra el monto heredable
   - Usuario puede aceptar o personalizar

2. **Saldo personalizado:**
   - Usuario ingresa monto específico
   - Sistema calcula diferencia con saldo heredado
   - Si hay diferencia:
     - Se crea consignación automática
     - Tipo: "retiro" (si nuevo < heredado) o "ingreso" (si nuevo > heredado)
     - Observación detallada del ajuste

**Proceso:**
```
1. Usuario hace clic en "Abrir Turno"
2. Sistema verifica que no hay turno abierto
3. Modal muestra:
   - Saldo heredado: $XXX
   - Input para saldo inicial
   - Alerta si hay diferencia
4. Al confirmar:
   - Crea registro en tabla turnos
   - Si hay ajuste, crea consignación
   - Activa el turno para el usuario
```

#### B. Registrar Consignación Manual

**Cuándo usar:**
- Caja tiene mucho efectivo y se necesita guardar en caja fuerte
- Retiro programado por política del negocio

**Proceso:**
```
1. Usuario ingresa monto a consignar
2. Opcionalmente agrega observaciones
3. Sistema:
   - Registra consignación asociada al turno
   - Suma al total_consignaciones del turno
   - Reduce saldo efectivo disponible
4. Toast de confirmación
```

#### C. Cerrar Turno

**Proceso:**
```
1. Usuario hace clic en "Cerrar Turno"
2. Sistema calcula:
   - total_ingresos: SUM(registros.total_pagado) del turno
   - total_consignaciones: SUM(consignaciones.monto) del turno
   - saldo_final: saldo_inicial + total_ingresos - total_consignaciones
3. Actualiza registro del turno:
   - fecha_cierre = NOW()
   - estado = 'cerrado'
   - Guarda totales calculados
4. Genera reporte de cierre en modal
5. Opción de descargar PDF
```

#### D. Reporte de Cierre de Turno

**Información incluida:**
- Datos del turno:
  - Responsable
  - Fecha/hora apertura y cierre
  - Duración del turno
- Resumen financiero:
  - Saldo inicial
  - Total ingresos
  - Total consignaciones
  - Saldo final
- Detalle de habitaciones usadas:
  - Tabla con todos los check-ins/check-outs
  - Subtotales por habitación y consumos
- Productos vendidos:
  - Lista consolidada con cantidades
  - Total por producto
- Consignaciones realizadas:
  - Hora, usuario, monto, observaciones

**Formato:**
- Vista en modal (HTML)
- Exportable a PDF personalizado con logo
- Opción de imprimir
- Función copiar a portapapeles (texto plano)

### 5.4.3 Interfaz de Usuario

```
┌─────────────────────────────────────────────────────────┐
│  CAJA - CONTROL DE TURNOS                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Estado Actual: TURNO ABIERTO                          │
│  Responsable: Juan Pérez                               │
│  Apertura: 22/01/2026 07:00 AM                        │
│                                                         │
│  ┌───────────────────────────────────────────┐         │
│  │  Saldo Inicial:        $500,000          │         │
│  │  + Ingresos:         $1,245,000          │         │
│  │  - Consignaciones:     $800,000          │         │
│  │  ─────────────────────────────────        │         │
│  │  = Saldo Actual:       $945,000          │         │
│  └───────────────────────────────────────────┘         │
│                                                         │
│  [Consignar Efectivo]  [Cerrar Turno]                 │
│                                                         │
│  ── Historial de Turnos ──                            │
│  [Tabla con turnos anteriores...]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 5.5 Módulo de Inventario

### 5.5.1 Descripción

Gestión completa de productos disponibles para venta, control de stock y movimientos de inventario.

### 5.5.2 Funcionalidades Principales

#### A. Listado de Productos

**Vista de tabla con:**
- Nombre del producto
- Categoría (bebidas, snacks, higiénicos, etc.)
- Precio de venta
- Stock actual
- Stock mínimo
- Indicador visual de alerta (rojo si stock <= mínimo)
- Acciones: editar, eliminar, agregar stock

**Filtros:**
- Por categoría
- Solo con stock bajo
- Productos activos/inactivos

#### B. Crear Producto

**Datos requeridos:**
- Nombre
- Descripción (opcional)
- Categoría
- Precio de venta
- Stock inicial
- Stock mínimo (umbral de alerta)

**Validaciones:**
- Nombre no vacío
- Precio > 0
- Stock >= 0
- Stock mínimo >= 0

#### C. Editar Producto

**Campos editables:**
- Nombre
- Descripción
- Categoría
- Precio de venta
- Stock mínimo
- Estado (activo/inactivo)

**Restricciones:**
- No se puede editar stock directamente (usar movimientos)
- Productos con consumos no pueden eliminarse

#### D. Movimientos de Inventario

**Tipos de movimiento:**

1. **Entrada** (compra/reabastecimiento):
   ```
   - Usuario ingresa cantidad
   - Motivo: "Compra a proveedor X"
   - stock_nuevo = stock_actual + cantidad
   ```

2. **Salida** (consumo interno/merma):
   ```
   - Usuario ingresa cantidad
   - Motivo: "Producto dañado" / "Consumo interno"
   - stock_nuevo = stock_actual - cantidad
   ```

3. **Ajuste** (corrección de inventario):
   ```
   - Usuario ingresa cantidad (positiva o negativa)
   - Motivo: "Corrección por conteo físico"
   - stock_nuevo = stock_actual + cantidad
   ```

**Registro de auditoría:**
- Cada movimiento queda registrado en tabla movimientos_inventario
- Incluye: usuario, fecha, tipo, cantidad, stock anterior, stock nuevo, motivo
- Historial completo inmutable

#### E. Alertas de Stock Bajo

**Dashboard y listado de inventario muestran:**
- Número de productos con stock <= stock_mínimo
- Lista detallada de productos críticos
- Indicador visual (ícono de alerta, color rojo)

**Acciones sugeridas:**
- Link directo para agregar entrada de stock
- Notificación visual al abrir el sistema

### 5.5.3 Interfaz de Usuario

```
┌─────────────────────────────────────────────────────────┐
│  INVENTARIO                     [+ Nuevo Producto]      │
├─────────────────────────────────────────────────────────┤
│  Filtrar: [Todas las categorías ▼] [Stock bajo ☐]     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Nombre      │ Cat.   │ Precio │ Stock │ Acciones│   │
│  ├─────────────────────────────────────────────────┤   │
│  │ Coca-Cola   │Bebidas │ $3,000 │  45   │ [Editar]│   │
│  │ Cerveza     │Bebidas │ $4,500 │  12   │ [Stock] │   │
│  │ Condones ⚠️ │Higiéni.│ $2,500 │   3   │ [Stock] │   │
│  │ Papas       │Snacks  │ $2,000 │  28   │ [Editar]│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ⚠️ 3 productos requieren reabastecimiento             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 5.6 Módulo de Reportes

### 5.6.1 Descripción

Generación de estadísticas y análisis del negocio con exportación a PDF personalizado.

### 5.6.2 Tipos de Reportes

#### A. Reporte de Turno (Individual)

**Generado al cerrar turno**
- Información del turno y responsable
- Resumen financiero completo
- Detalle de todas las habitaciones usadas
- Productos vendidos durante el turno
- Consignaciones realizadas
- Logo del motel en encabezado

#### B. Estadísticas por Periodo

**Selección de rango de fechas:**
- Presets: hoy, esta semana, este mes, personalizado
- Calendario para selección manual

**Métricas incluidas:**

1. **Resumen General:**
   - Total ingresos del periodo
   - Promedio de ingresos diarios
   - Número de turnos
   - Número de clientes atendidos

2. **Ocupación por Habitación:**
   - Tabla con cada habitación
   - Número de veces usada
   - Horas totales ocupadas
   - Ingreso total generado
   - Ingreso promedio por uso

3. **Productos Más Vendidos:**
   - Top 10 productos
   - Cantidad vendida
   - Ingreso generado
   - Gráfico de barras

4. **Ingresos por Día:**
   - Gráfico de líneas temporal
   - Tabla día por día
   - Identificación de picos y valles

5. **Habitaciones Más Usadas:**
   - Ranking de habitaciones
   - Porcentaje de uso
   - Análisis de rentabilidad

**Formato de exportación:**
- PDF profesional con logo
- Diseño en colores corporativos (naranja/negro/blanco)
- Tablas auto-ajustables
- Gráficos estadísticos
- Paginación automática

### 5.6.3 Características del PDF

**Encabezado personalizado:**
```
┌─────────────────────────────────────────────────┐
│  [LOGO]              MOTEL ECLIPSE              │
│         Reporte de Estadísticas                 │
│         Periodo: 01/01/2026 - 31/01/2026       │
└─────────────────────────────────────────────────┘
```

**Estilo profesional:**
- Fondo gris (#323232) en headers
- Texto negro para valores numéricos (legibilidad)
- Bordes sutiles en tablas
- Márgenes equilibrados
- Pie de página con fecha de generación

## 5.7 Módulo de Usuarios (Solo Dueño)

### 5.7.1 Descripción

Administración de usuarios del sistema con control de roles y permisos.

### 5.7.2 Funcionalidades Principales

#### A. Listar Usuarios

**Información mostrada:**
- Nombre completo
- Email
- Rol (Dueño / Administrador)
- Estado (Activo / Inactivo)
- Fecha de creación
- Acciones disponibles

#### B. Crear Usuario

**Datos requeridos:**
- Nombre completo
- Email (único)
- Contraseña
- Rol (dueño o administrador)

**Proceso:**
```
1. Se crea usuario en Supabase Auth
2. Se crea registro en tabla usuarios
3. Email de bienvenida (opcional)
4. Usuario puede iniciar sesión inmediatamente
```

#### C. Editar Usuario

**Campos editables:**
- Nombre
- Rol
- Estado (activar/desactivar)

**Restricciones:**
- No se puede editar email (identificador único)
- No se puede desactivar al último dueño
- No se puede cambiar propio rol

#### D. Desactivar/Reactivar Usuario

**Desactivar:**
- Usuario no puede iniciar sesión
- Sesiones activas se invalidan
- Turnos abiertos se mantienen (para auditoría)

**Reactivar:**
- Usuario recupera acceso
- Permisos según su rol

#### E. Cambiar Contraseña

**Opciones:**
- Usuario cambia su propia contraseña (desde perfil)
- Dueño resetea contraseña de otros usuarios
- Link de recuperación por email

---
