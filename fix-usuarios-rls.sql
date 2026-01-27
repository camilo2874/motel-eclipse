-- Políticas RLS completas para gestión de usuarios
-- Ejecutar en Supabase SQL Editor

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden leer su propia info" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propia info" ON usuarios;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer usuarios" ON usuarios;
DROP POLICY IF EXISTS "Solo dueños pueden crear usuarios" ON usuarios;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil o dueños todos" ON usuarios;
DROP POLICY IF EXISTS "Solo dueños pueden eliminar usuarios" ON usuarios;

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política 1: Todos los autenticados pueden leer usuarios (necesario para listas)
CREATE POLICY "Usuarios autenticados pueden leer usuarios"
ON usuarios
FOR SELECT
TO authenticated
USING (true);

-- Política 2: Solo dueños pueden insertar nuevos usuarios
CREATE POLICY "Solo dueños pueden crear usuarios"
ON usuarios
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid() AND rol = 'dueno'
  )
);

-- Política 3: Usuarios pueden actualizar su perfil, dueños pueden actualizar todos
CREATE POLICY "Actualizar propio perfil o dueños todos"
ON usuarios
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid() AND rol = 'dueno'
  )
);

-- Política 4: Solo dueños pueden eliminar usuarios
CREATE POLICY "Solo dueños pueden eliminar usuarios"
ON usuarios
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid() AND rol = 'dueno'
  )
);
