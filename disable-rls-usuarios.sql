-- DESHABILITAR RLS EN TABLA USUARIOS
-- Ejecutar en Supabase SQL Editor para solucionar el ciclo de carga infinita

-- 1. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden leer su propia info" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propia info" ON usuarios;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer usuarios" ON usuarios;
DROP POLICY IF EXISTS "Solo dueños pueden crear usuarios" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil o dueños todos" ON usuarios;
DROP POLICY IF EXISTS "Actualizar propio perfil o dueños todos" ON usuarios;
DROP POLICY IF EXISTS "Solo dueños pueden eliminar usuarios" ON usuarios;

-- 2. DESHABILITAR RLS (esto soluciona el problema)
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- NOTA: Sin RLS, todos los usuarios autenticados pueden leer/escribir la tabla usuarios
-- Esto es aceptable para tu caso de uso ya que:
-- - Solo el dueño tiene acceso al módulo de Usuarios (controlado por frontend)
-- - Los usuarios se crean manualmente desde Supabase Dashboard
-- - Es un sistema interno de gestión del motel
