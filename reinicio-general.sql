-- REINICIO GENERAL DEL SISTEMA
-- Ejecutar en Supabase SQL Editor para hacer inventario y empezar de cero

-- ⚠️⚠️⚠️ ADVERTENCIA CRÍTICA ⚠️⚠️⚠️
-- Esta operación eliminará TODO el historial de operaciones
-- Solo se mantendrá la configuración base (inventario, habitaciones, usuarios)
-- NO SE PUEDE DESHACER

-- =========================================
-- PASO 1: VERIFICAR DATOS ANTES DE BORRAR
-- =========================================

-- Ver resumen de lo que se va a eliminar:
SELECT 
  (SELECT COUNT(*) FROM consumos) as total_consumos,
  (SELECT COUNT(*) FROM registros) as total_registros,
  (SELECT COUNT(*) FROM consignaciones) as total_consignaciones,
  (SELECT COUNT(*) FROM turnos) as total_turnos;

-- Ver total de ingresos que se borrarán:
SELECT 
  SUM(total_ingresos) as ingresos_totales,
  SUM(saldo_final) as saldo_acumulado
FROM turnos
WHERE fecha_cierre IS NOT NULL;

-- =========================================
-- PASO 2: EJECUTAR REINICIO (SI ESTÁS SEGURO)
-- =========================================
-- ⚠️ Descomenta las siguientes líneas SOLO si estás completamente seguro

/*

-- 1. Eliminar consumos (productos vendidos)
DELETE FROM consumos;

-- 2. Eliminar consignaciones (retiros de efectivo)
DELETE FROM consignaciones;

-- 3. Eliminar registros de habitaciones
DELETE FROM registros;

-- 4. Eliminar turnos (caja)
DELETE FROM turnos;

*/

-- =========================================
-- PASO 3: VERIFICAR QUE QUEDÓ LIMPIO
-- =========================================

-- Debe mostrar todo en 0:
SELECT 
  (SELECT COUNT(*) FROM consumos) as consumos,
  (SELECT COUNT(*) FROM registros) as registros,
  (SELECT COUNT(*) FROM consignaciones) as consignaciones,
  (SELECT COUNT(*) FROM turnos) as turnos;

-- Verificar que lo demás sigue intacto:
SELECT 
  (SELECT COUNT(*) FROM inventario) as productos,
  (SELECT COUNT(*) FROM habitaciones) as habitaciones,
  (SELECT COUNT(*) FROM usuarios) as usuarios;

-- =========================================
-- NOTAS IMPORTANTES
-- =========================================
-- ✅ SE MANTIENE:
--    - Inventario (productos y cantidades)
--    - Habitaciones
--    - Usuarios
--
-- ❌ SE ELIMINA:
--    - Todo el historial de operaciones
--    - Todos los registros financieros
--    - Todas las ventas de productos
--
-- 💡 RECOMENDACIÓN:
--    - Exporta los PDFs de reportes ANTES de ejecutar esto
--    - Usa esto solo cuando hagas inventario físico completo
--    - Ideal para empezar un nuevo período contable
