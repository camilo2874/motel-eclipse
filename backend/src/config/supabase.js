import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan las credenciales de Supabase en las variables de entorno')
}

// Cliente con service role (backend)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Verificar conexión
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('habitaciones').select('count')
    if (error) throw error
    console.log('✅ Conexión a Supabase establecida')
    return true
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error.message)
    return false
  }
}

export default supabase
