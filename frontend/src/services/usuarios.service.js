import { supabase } from '../lib/supabase'

// Obtener todos los usuarios (solo lectura)
export const getUsuarios = async () => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return { data: null, error }
  }
}

// Cambiar mi propia contraseña
export const cambiarMiPassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    return { data: null, error }
  }
}
