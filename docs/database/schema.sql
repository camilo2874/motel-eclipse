-- ============================================
-- SCHEMA: Sistema de Gestión Motel Eclipse
-- Versión: 1.0.0
-- Fecha: 16 de enero de 2026
-- ============================================

-- IMPORTANTE: Ejecuta este script en el SQL Editor de Supabase

-- ============================================
-- 1. EXTENSIONES
-- ============================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. ENUMS (Tipos Personalizados)
-- ============================================

-- Tipo de habitación
CREATE TYPE tipo_habitacion AS ENUM ('normal', 'maquina_amor', 'suite');

-- Estado de habitación
CREATE TYPE estado_habitacion AS ENUM ('disponible', 'ocupada', 'limpieza', 'mantenimiento');

-- Rol de usuario
CREATE TYPE rol_usuario AS ENUM ('dueno', 'administrador');

-- Estado de turno
CREATE TYPE estado_turno AS ENUM ('abierto', 'cerrado');

-- ============================================
-- 3. TABLAS PRINCIPALES
-- ============================================

-- Usuarios del sistema
CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'administrador',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tarifas por tipo de habitación
CREATE TABLE tarifas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo tipo_habitacion UNIQUE NOT NULL,
    precio_base DECIMAL(10,2) NOT NULL, -- Precio por 12 horas
    precio_hora_extra DECIMAL(10,2) NOT NULL,
    horas_base INTEGER DEFAULT 12,
    minutos_gracia INTEGER DEFAULT 15,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habitaciones
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

-- Turnos de caja
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

-- Registros de check-in/check-out
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

-- Inventario de productos
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

-- Consumos de clientes
CREATE TABLE consumos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registro_id UUID REFERENCES registros(id) ON DELETE CASCADE NOT NULL,
    producto_id UUID REFERENCES inventario(id) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Movimientos de inventario
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

-- Consignaciones a caja fuerte
CREATE TABLE consignaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turno_id UUID REFERENCES turnos(id) NOT NULL,
    usuario_id UUID REFERENCES usuarios(id) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log de auditoría
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

-- ============================================
-- 4. ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX idx_habitaciones_estado ON habitaciones(estado);
CREATE INDEX idx_habitaciones_numero ON habitaciones(numero);
CREATE INDEX idx_registros_habitacion ON registros(habitacion_id);
CREATE INDEX idx_registros_turno ON registros(turno_id);
CREATE INDEX idx_registros_fecha_entrada ON registros(fecha_entrada);
CREATE INDEX idx_registros_finalizado ON registros(finalizado);
CREATE INDEX idx_turnos_estado ON turnos(estado);
CREATE INDEX idx_turnos_fecha ON turnos(fecha_apertura);
CREATE INDEX idx_consumos_registro ON consumos(registro_id);
CREATE INDEX idx_inventario_stock ON inventario(stock_actual);
CREATE INDEX idx_auditoria_tabla ON auditoria(tabla);
CREATE INDEX idx_auditoria_fecha ON auditoria(created_at);

-- ============================================
-- 5. FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarifas_updated_at BEFORE UPDATE ON tarifas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habitaciones_updated_at BEFORE UPDATE ON habitaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registros_updated_at BEFORE UPDATE ON registros
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventario_updated_at BEFORE UPDATE ON inventario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar stock automáticamente al registrar consumo
CREATE OR REPLACE FUNCTION actualizar_stock_consumo()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE inventario
    SET stock_actual = stock_actual - NEW.cantidad
    WHERE id = NEW.producto_id;
    
    -- Registrar movimiento
    INSERT INTO movimientos_inventario (
        producto_id,
        usuario_id,
        tipo,
        cantidad,
        motivo,
        stock_anterior,
        stock_nuevo
    )
    SELECT 
        NEW.producto_id,
        r.usuario_id,
        'salida',
        NEW.cantidad,
        'Consumo en habitación',
        i.stock_actual + NEW.cantidad,
        i.stock_actual
    FROM inventario i
    JOIN registros r ON r.id = NEW.registro_id
    WHERE i.id = NEW.producto_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_stock_consumo
    AFTER INSERT ON consumos
    FOR EACH ROW EXECUTE FUNCTION actualizar_stock_consumo();

-- Función para calcular subtotal de consumo
CREATE OR REPLACE FUNCTION calcular_subtotal_consumo()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal = NEW.cantidad * NEW.precio_unitario;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_subtotal_consumo
    BEFORE INSERT ON consumos
    FOR EACH ROW EXECUTE FUNCTION calcular_subtotal_consumo();

-- ============================================
-- 6. DATOS INICIALES
-- ============================================

-- Insertar tarifas
INSERT INTO tarifas (tipo, precio_base, precio_hora_extra, horas_base, minutos_gracia) VALUES
    ('normal'::tipo_habitacion, 45000.00, 5000.00, 12, 15),
    ('maquina_amor'::tipo_habitacion, 50000.00, 5000.00, 12, 15),
    ('suite'::tipo_habitacion, 75000.00, 10000.00, 12, 15);

-- Insertar habitaciones
INSERT INTO habitaciones (numero, tipo, tarifa_id) 
SELECT 1, 'normal'::tipo_habitacion, id FROM tarifas WHERE tipo = 'normal'::tipo_habitacion
UNION ALL
SELECT 2, 'normal'::tipo_habitacion, id FROM tarifas WHERE tipo = 'normal'::tipo_habitacion
UNION ALL
SELECT 3, 'normal'::tipo_habitacion, id FROM tarifas WHERE tipo = 'normal'::tipo_habitacion
UNION ALL
SELECT 4, 'normal'::tipo_habitacion, id FROM tarifas WHERE tipo = 'normal'::tipo_habitacion
UNION ALL
SELECT 5, 'maquina_amor'::tipo_habitacion, id FROM tarifas WHERE tipo = 'maquina_amor'::tipo_habitacion
UNION ALL
SELECT 6, 'maquina_amor'::tipo_habitacion, id FROM tarifas WHERE tipo = 'maquina_amor'::tipo_habitacion
UNION ALL
SELECT 7, 'normal'::tipo_habitacion, id FROM tarifas WHERE tipo = 'normal'::tipo_habitacion
UNION ALL
SELECT 8, 'normal'::tipo_habitacion, id FROM tarifas WHERE tipo = 'normal'::tipo_habitacion
UNION ALL
SELECT 9, 'normal'::tipo_habitacion, id FROM tarifas WHERE tipo = 'normal'::tipo_habitacion
UNION ALL
SELECT 10, 'normal'::tipo_habitacion, id FROM tarifas WHERE tipo = 'normal'::tipo_habitacion
UNION ALL
SELECT 11, 'suite'::tipo_habitacion, id FROM tarifas WHERE tipo = 'suite'::tipo_habitacion;

-- ============================================
-- 7. POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo para usuarios autenticados por ahora)
-- En producción, deberías refinar estas políticas según los roles

CREATE POLICY "Permitir lectura a usuarios autenticados" ON usuarios
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todo en habitaciones" ON habitaciones
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todo en registros" ON registros
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todo en turnos" ON turnos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todo en inventario" ON inventario
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir todo en consumos" ON consumos
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 8. VISTAS ÚTILES
-- ============================================

-- Vista de habitaciones con información completa
CREATE VIEW v_habitaciones_completas AS
SELECT 
    h.id,
    h.numero,
    h.tipo,
    h.estado,
    t.precio_base,
    t.precio_hora_extra,
    t.horas_base,
    r.id as registro_activo_id,
    r.fecha_entrada,
    CASE 
        WHEN r.id IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (NOW() - r.fecha_entrada)) / 3600
        ELSE 0
    END as horas_transcurridas
FROM habitaciones h
LEFT JOIN tarifas t ON h.tarifa_id = t.id
LEFT JOIN registros r ON h.id = r.habitacion_id AND r.finalizado = false;

-- Vista de ocupación actual
CREATE VIEW v_ocupacion_actual AS
SELECT 
    COUNT(*) FILTER (WHERE estado = 'ocupada') as ocupadas,
    COUNT(*) FILTER (WHERE estado = 'disponible') as disponibles,
    COUNT(*) FILTER (WHERE estado = 'limpieza') as en_limpieza,
    COUNT(*) as total,
    ROUND(COUNT(*) FILTER (WHERE estado = 'ocupada')::NUMERIC / COUNT(*)::NUMERIC * 100, 2) as porcentaje_ocupacion
FROM habitaciones WHERE activo = true;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Verificar que todo se creó correctamente
SELECT 'Tablas creadas exitosamente' as resultado;
SELECT COUNT(*) as total_habitaciones FROM habitaciones;
SELECT COUNT(*) as total_tarifas FROM tarifas;
