-- LIMPIAR DATOS DE PRUEBA
-- Ejecutar en Supabase SQL Editor para eliminar datos de ejemplo

-- ⚠️ ADVERTENCIA: Esto eliminará todos los consumos y productos
-- Solo ejecuta esto si estás seguro de que son datos de prueba

-- PASO 1: Eliminar todos los consumos (esto libera los productos)
DELETE FROM consumos;

-- PASO 2: Eliminar todos los productos del inventario
DELETE FROM inventario;

-- PASO 3: (OPCIONAL) Si quieres limpiar también registros de habitaciones
-- Descomenta las siguientes líneas solo si quieres borrar TODO:
/*
DELETE FROM registros;
DELETE FROM consignaciones;
DELETE FROM turnos;
*/

-- PASO 4: Verificar que quedó limpio
SELECT COUNT(*) as total_consumos FROM consumos;
SELECT COUNT(*) as total_productos FROM inventario;
SELECT COUNT(*) as total_registros FROM registros;

-- Ahora puedes agregar tus productos reales desde la interfaz
