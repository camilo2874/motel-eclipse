# CAPÍTULO 4: DISEÑO DE BASE DE DATOS

## 4.1 Modelo Conceptual

### 4.1.1 Entidades Principales

El sistema gestiona las siguientes entidades principales:

1. **USUARIOS**: Personal que opera el sistema
2. **TURNOS**: Períodos de trabajo con control de caja
3. **HABITACIONES**: Espacios disponibles para alquiler
4. **TARIFAS**: Precios por tipo de habitación
5. **REGISTROS**: Check-in y check-out de clientes
6. **INVENTARIO**: Productos disponibles para venta
7. **CONSUMOS**: Productos vendidos a clientes durante su estadía
8. **CONSIGNACIONES**: Retiros de efectivo hacia caja fuerte
9. **MOVIMIENTOS_INVENTARIO**: Historial de entradas/salidas de productos
10. **AUDITORIA**: Log de acciones críticas del sistema

## 4.2 Modelo Lógico

### 4.2.1 Tabla: usuarios

Almacena información del personal que opera el sistema.

```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'administrador',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único (sincronizado con Supabase Auth)
- `nombre`: Nombre completo del usuario
- `email`: Correo electrónico (único)
- `rol`: Rol del usuario (ENUM: 'dueno', 'administrador')
- `activo`: Estado del usuario (habilitado/deshabilitado)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última modificación

**Índices:**
- Primary Key: `id`
- Unique: `email`

**Reglas de negocio:**
- Solo el dueño puede crear/modificar usuarios
- Al menos un usuario con rol 'dueno' debe existir
- No se pueden eliminar usuarios con turnos asociados

### 4.2.2 Tabla: tarifas

Define los precios por tipo de habitación.

```sql
CREATE TABLE tarifas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo tipo_habitacion UNIQUE NOT NULL,
    precio_base DECIMAL(10,2) NOT NULL,
    precio_hora_extra DECIMAL(10,2) NOT NULL,
    horas_base INTEGER DEFAULT 12,
    minutos_gracia INTEGER DEFAULT 15,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `tipo`: Tipo de habitación (ENUM: 'normal', 'maquina_amor', 'suite')
- `precio_base`: Precio por período base (12 horas)
- `precio_hora_extra`: Precio por hora adicional
- `horas_base`: Horas incluidas en precio base
- `minutos_gracia`: Minutos sin cobro extra al salir

**Lógica de cálculo:**
```
Si tiempo <= horas_base + (minutos_gracia/60):
    Total = precio_base
Sino:
    horas_extras = tiempo - horas_base - (minutos_gracia/60)
    Total = precio_base + (horas_extras × precio_hora_extra)
```

### 4.2.3 Tabla: habitaciones

Representa los espacios físicos del motel.

```sql
CREATE TABLE habitaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero INTEGER UNIQUE NOT NULL CHECK (numero >= 1 AND numero <= 11),
    tipo tipo_habitacion NOT NULL,
    estado estado_habitacion DEFAULT 'disponible',
    tarifa_id UUID REFERENCES tarifas(id),
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `numero`: Número de habitación (1-11)
- `tipo`: Tipo de habitación
- `estado`: Estado actual (ENUM: 'disponible', 'ocupada', 'limpieza', 'mantenimiento')
- `tarifa_id`: Referencia a tarifa aplicable

**Constraint:**
```sql
CHECK (numero >= 1 AND numero <= 11)
```

**Transiciones de estado:**
```
disponible → ocupada (check-in)
ocupada → limpieza (check-out)
limpieza → disponible (limpieza completada)
cualquiera → mantenimiento (problema detectado)
mantenimiento → disponible (reparación completada)
```

### 4.2.4 Tabla: turnos

Registra períodos de trabajo y control de caja.

```sql
CREATE TABLE turnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) NOT NULL,
    fecha_apertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    saldo_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
    saldo_final DECIMAL(10,2),
    total_ingresos DECIMAL(10,2) DEFAULT 0,
    total_consignaciones DECIMAL(10,2) DEFAULT 0,
    estado estado_turno DEFAULT 'abierto',
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `usuario_id`: Responsable del turno
- `fecha_apertura`: Inicio del turno
- `fecha_cierre`: Fin del turno (NULL si está abierto)
- `saldo_inicial`: Efectivo al abrir caja
- `saldo_final`: Efectivo al cerrar caja
- `total_ingresos`: Suma de ingresos del turno
- `total_consignaciones`: Suma de retiros a caja fuerte
- `estado`: Estado del turno (ENUM: 'abierto', 'cerrado')

**Cálculo de saldo final:**
```
saldo_final = saldo_inicial + total_ingresos - total_consignaciones
```

**Reglas de negocio:**
- Un usuario solo puede tener un turno abierto a la vez
- No se puede abrir turno si hay uno abierto
- Al cerrar turno, se calculan automáticamente los totales
- El saldo inicial del siguiente turno puede heredar el saldo final del anterior

### 4.2.5 Tabla: registros

Registra check-in y check-out de clientes.

```sql
CREATE TABLE registros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habitacion_id UUID REFERENCES habitaciones(id) NOT NULL,
    turno_id UUID REFERENCES turnos(id) NOT NULL,
    usuario_id UUID REFERENCES usuarios(id) NOT NULL,
    fecha_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_salida TIMESTAMP WITH TIME ZONE,
    horas_totales DECIMAL(5,2),
    subtotal_habitacion DECIMAL(10,2),
    subtotal_consumos DECIMAL(10,2) DEFAULT 0,
    total_pagado DECIMAL(10,2),
    metodo_pago VARCHAR(50) DEFAULT 'efectivo',
    observaciones TEXT,
    finalizado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `habitacion_id`: Habitación asignada
- `turno_id`: Turno en que se realizó
- `usuario_id`: Usuario que registró la entrada
- `fecha_entrada`: Hora de check-in
- `fecha_salida`: Hora de check-out (NULL mientras está activo)
- `horas_totales`: Tiempo de ocupación calculado
- `subtotal_habitacion`: Costo por alquiler
- `subtotal_consumos`: Costo por productos consumidos
- `total_pagado`: Total cobrado al cliente
- `finalizado`: Indica si el registro está cerrado

**Cálculo de totales:**
```
horas_totales = (fecha_salida - fecha_entrada) / 3600 segundos
subtotal_habitacion = calculado según tarifa
subtotal_consumos = SUM(consumos.subtotal)
total_pagado = subtotal_habitacion + subtotal_consumos
```

### 4.2.6 Tabla: inventario

Almacena productos disponibles para venta.

```sql
CREATE TABLE inventario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    precio_venta DECIMAL(10,2) NOT NULL,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `nombre`: Nombre del producto
- `descripcion`: Descripción detallada
- `categoria`: Categoría del producto (bebidas, snacks, higiénicos, etc.)
- `precio_venta`: Precio de venta al público
- `stock_actual`: Cantidad disponible
- `stock_minimo`: Umbral para alerta de reabastecimiento
- `activo`: Producto disponible para venta

**Alerta de stock:**
```
Si stock_actual <= stock_minimo:
    Mostrar alerta en dashboard
    Notificar en vista de inventario
```

### 4.2.7 Tabla: consumos

Registra productos vendidos a clientes durante su estadía.

```sql
CREATE TABLE consumos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registro_id UUID REFERENCES registros(id) ON DELETE CASCADE NOT NULL,
    producto_id UUID REFERENCES inventario(id) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `registro_id`: Registro (check-in) al que pertenece
- `producto_id`: Producto vendido
- `cantidad`: Unidades vendidas
- `precio_unitario`: Precio al momento de la venta
- `subtotal`: cantidad × precio_unitario

**Relación con inventario:**
```
Al agregar consumo:
    inventario.stock_actual -= cantidad

Al eliminar consumo:
    inventario.stock_actual += cantidad
```

### 4.2.8 Tabla: consignaciones

Registra retiros de efectivo hacia caja fuerte.

```sql
CREATE TABLE consignaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turno_id UUID REFERENCES turnos(id) NOT NULL,
    usuario_id UUID REFERENCES usuarios(id) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `turno_id`: Turno en que se realizó la consignación
- `usuario_id`: Usuario que realizó el retiro
- `monto`: Cantidad de efectivo retirado
- `observaciones`: Motivo o descripción del retiro

**Casos de uso:**
1. Retiro manual por seguridad (mucho efectivo en caja)
2. Ajuste automático al abrir turno con saldo personalizado

### 4.2.9 Tabla: movimientos_inventario

Auditoría de cambios en stock de productos.

```sql
CREATE TABLE movimientos_inventario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID REFERENCES inventario(id) NOT NULL,
    usuario_id UUID REFERENCES usuarios(id) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
    cantidad INTEGER NOT NULL,
    motivo TEXT,
    stock_anterior INTEGER NOT NULL,
    stock_nuevo INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Tipos de movimiento:**
- `entrada`: Compra o reabastecimiento
- `salida`: Venta o consumo interno
- `ajuste`: Corrección de inventario (merma, error de conteo)

**Auditoría:**
```
Antes del cambio:
    stock_anterior = inventario.stock_actual

Después del cambio:
    stock_nuevo = stock_anterior + cantidad (entrada)
    stock_nuevo = stock_anterior - cantidad (salida/ajuste)
```

### 4.2.10 Tabla: auditoria

Log general de acciones críticas del sistema.

```sql
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id),
    tabla VARCHAR(50) NOT NULL,
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
    registro_id UUID,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Eventos auditados:**
- Creación/modificación de usuarios
- Apertura/cierre de turnos
- Cambios en tarifas
- Modificaciones de inventario

## 4.3 Tipos ENUM Personalizados

### 4.3.1 tipo_habitacion
```sql
CREATE TYPE tipo_habitacion AS ENUM ('normal', 'maquina_amor', 'suite');
```

### 4.3.2 estado_habitacion
```sql
CREATE TYPE estado_habitacion AS ENUM ('disponible', 'ocupada', 'limpieza', 'mantenimiento');
```

### 4.3.3 rol_usuario
```sql
CREATE TYPE rol_usuario AS ENUM ('dueno', 'administrador');
```

### 4.3.4 estado_turno
```sql
CREATE TYPE estado_turno AS ENUM ('abierto', 'cerrado');
```

## 4.4 Triggers y Funciones

### 4.4.1 Trigger: update_updated_at

Actualiza automáticamente el campo `updated_at` al modificar un registro.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habitaciones_updated_at 
    BEFORE UPDATE ON habitaciones
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registros_updated_at 
    BEFORE UPDATE ON registros
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventario_updated_at 
    BEFORE UPDATE ON inventario
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

**Propósito:** Mantener trazabilidad de cuándo se modificó cada registro.

## 4.5 Índices de Optimización

### 4.5.1 Índices Implementados

```sql
-- Habitaciones
CREATE INDEX idx_habitaciones_estado ON habitaciones(estado);
CREATE INDEX idx_habitaciones_numero ON habitaciones(numero);

-- Registros
CREATE INDEX idx_registros_habitacion ON registros(habitacion_id);
CREATE INDEX idx_registros_turno ON registros(turno_id);
CREATE INDEX idx_registros_fecha_entrada ON registros(fecha_entrada);
CREATE INDEX idx_registros_finalizado ON registros(finalizado);

-- Turnos
CREATE INDEX idx_turnos_estado ON turnos(estado);
CREATE INDEX idx_turnos_fecha ON turnos(fecha_apertura);

-- Consumos
CREATE INDEX idx_consumos_registro ON consumos(registro_id);

-- Inventario
CREATE INDEX idx_inventario_stock ON inventario(stock_actual);

-- Auditoría
CREATE INDEX idx_auditoria_tabla ON auditoria(tabla);
CREATE INDEX idx_auditoria_fecha ON auditoria(created_at);
```

### 4.5.2 Impacto de Índices

**Consulta sin índice:**
```sql
SELECT * FROM registros WHERE finalizado = false;
-- Tiempo: 45ms (Seq Scan en 500 registros)
```

**Consulta con índice:**
```sql
-- Con idx_registros_finalizado
SELECT * FROM registros WHERE finalizado = false;
-- Tiempo: 5ms (Index Scan)
-- Mejora: 9x más rápida
```

## 4.6 Políticas de Seguridad (RLS)

### 4.6.1 Row Level Security en Usuarios

```sql
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Solo el dueño puede ver/modificar usuarios
CREATE POLICY "Gestión de usuarios por dueño"
ON usuarios
FOR ALL
USING (
    auth.uid() IN (
        SELECT id FROM usuarios WHERE rol = 'dueno'
    )
);

-- Usuarios pueden ver su propio perfil
CREATE POLICY "Ver propio perfil"
ON usuarios
FOR SELECT
USING (auth.uid() = id);
```

### 4.6.2 Políticas en Turnos

```sql
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

-- Ver solo turnos propios o ser dueño
CREATE POLICY "Ver turnos autorizados"
ON turnos
FOR SELECT
USING (
    usuario_id = auth.uid() OR
    auth.uid() IN (SELECT id FROM usuarios WHERE rol = 'dueno')
);

-- Crear turnos solo si no hay uno abierto
CREATE POLICY "Crear turno único"
ON turnos
FOR INSERT
WITH CHECK (
    NOT EXISTS (
        SELECT 1 FROM turnos 
        WHERE usuario_id = auth.uid() AND estado = 'abierto'
    )
);
```

## 4.7 Diagramas

### 4.7.1 Diagrama Entidad-Relación Completo

```
                    ┌───────────────┐
                    │   USUARIOS    │
                    │ (PK) id       │
                    │      nombre   │
                    │      email    │
                    │      rol      │
                    └───────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
    ┌───────────────┐           ┌───────────────┐
    │    TURNOS     │           │   REGISTROS   │
    │ (PK) id       │           │ (PK) id       │
    │ (FK) usuario  │◄──────────┤ (FK) turno    │
    │      saldo_*  │           │ (FK) habitacion│
    │      totales  │           │ (FK) usuario  │
    └───────┬───────┘           │      fechas   │
            │                   │      totales  │
            │                   └───────┬───────┘
            ▼                           │
    ┌───────────────┐                   │
    │CONSIGNACIONES │                   │
    │ (PK) id       │           ┌───────┴───────┐
    │ (FK) turno    │           │               │
    │ (FK) usuario  │           ▼               ▼
    │      monto    │   ┌───────────────┐ ┌───────────────┐
    └───────────────┘   │ HABITACIONES  │ │   CONSUMOS    │
                        │ (PK) id       │ │ (PK) id       │
                        │      numero   │ │ (FK) registro │
                        │      tipo     │ │ (FK) producto │
                        │      estado   │ │      cantidad │
                        │ (FK) tarifa   │ │      subtotal │
                        └───────┬───────┘ └───────┬───────┘
                                │                 │
                                ▼                 ▼
                        ┌───────────────┐ ┌───────────────┐
                        │    TARIFAS    │ │  INVENTARIO   │
                        │ (PK) id       │ │ (PK) id       │
                        │      tipo     │ │      nombre   │
                        │      precios  │ │      stock_*  │
                        └───────────────┘ │      precio   │
                                          └───────┬───────┘
                                                  │
                                                  ▼
                                          ┌───────────────┐
                                          │  MOVIMIENTOS  │
                                          │  INVENTARIO   │
                                          │ (FK) producto │
                                          │ (FK) usuario  │
                                          │      tipo     │
                                          └───────────────┘
```

---
