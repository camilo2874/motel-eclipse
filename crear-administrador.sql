-- CREAR NUEVO ADMINISTRADOR EN SUPABASE
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Primero debes crear el usuario en Authentication
-- Ve a: Authentication → Users → Add user
-- - Email: (el email del administrador)
-- - Password: (contraseña temporal)
-- - Confirma el email automáticamente
-- 
-- DESPUÉS DE CREAR EL USUARIO EN AUTH, copia su UUID y ejecútalo aquí:

-- PASO 2: Insertar en tabla usuarios con rol administrador
INSERT INTO usuarios (id, nombre, email, rol)
VALUES (
  '00000000-0000-0000-0000-000000000000',  -- ⚠️ REEMPLAZA CON EL UUID DEL USUARIO CREADO
  'Nombre del Administrador',               -- ⚠️ CAMBIA EL NOMBRE
  'admin2@eclipse.com',                     -- ⚠️ CAMBIA EL EMAIL (debe coincidir con Auth)
  'administrador'                           -- Rol: 'administrador' o 'dueno'
);

-- VERIFICAR que se creó correctamente
SELECT id, nombre, email, rol, created_at 
FROM usuarios 
ORDER BY created_at DESC 
LIMIT 5;
