-- DIAGNÓSTICO DE TURNOS
-- Ejecutar en Supabase SQL Editor para verificar el estado de los turnos

-- 1. Ver todos los turnos (abiertos y cerrados)
SELECT 
  t.id,
  t.usuario_id,
  u.nombre as usuario_nombre,
  t.fecha_apertura,
  t.fecha_cierre,
  t.saldo_inicial,
  t.saldo_final,
  CASE 
    WHEN t.fecha_cierre IS NULL THEN 'abierto'
    ELSE 'cerrado'
  END as estado
FROM turnos t
LEFT JOIN usuarios u ON t.usuario_id = u.id
ORDER BY t.fecha_apertura DESC
LIMIT 10;

-- 2. Ver solo turnos abiertos (esto es lo que busca la app)
SELECT 
  t.id,
  t.usuario_id,
  u.nombre as usuario_nombre,
  u.email,
  t.fecha_apertura,
  t.saldo_inicial
FROM turnos t
LEFT JOIN usuarios u ON t.usuario_id = u.id
WHERE t.fecha_cierre IS NULL;  -- Turnos sin fecha de cierre = abiertos

-- 3. Si hay múltiples turnos abiertos (problema), cerrar todos excepto el más reciente
-- ⚠️ SOLO EJECUTAR SI EL PASO 2 MUESTRA MÚLTIPLES TURNOS ABIERTOS
/*
UPDATE turnos
SET fecha_cierre = NOW(),
    observaciones = 'Cerrado automáticamente por corrección'
WHERE fecha_cierre IS NULL
  AND id NOT IN (
    SELECT id FROM turnos 
    WHERE fecha_cierre IS NULL 
    ORDER BY fecha_apertura DESC 
    LIMIT 1
  );
*/

-- 4. Si NO hay turnos abiertos pero necesitas uno, abrir turno manualmente
-- ⚠️ REEMPLAZA EL UUID CON EL ID DEL USUARIO QUE DEBE ABRIR TURNO
/*
INSERT INTO turnos (usuario_id, saldo_inicial, fecha_apertura)
VALUES (
  '8d06c8f2-b2ed-4e30-963f-a969f48e8f93',  -- ⚠️ REEMPLAZA CON UUID DEL USUARIO
  0,                                         -- Saldo inicial
  NOW()
);
*/
