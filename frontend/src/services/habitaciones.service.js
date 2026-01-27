import { supabase } from '../lib/supabase'

// Obtener todas las habitaciones con sus detalles
export const getHabitaciones = async () => {
  try {
    const { data, error } = await supabase
      .from('habitaciones')
      .select(`
        *,
        tarifa:tarifas (
          precio_base,
          precio_hora_extra,
          horas_base
        )
      `)
      .order('numero')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener habitaciones:', error)
    return { data: null, error }
  }
}

// Obtener habitación por ID
export const getHabitacionById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('habitaciones')
      .select(`
        *,
        tarifa:tarifas (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener habitación:', error)
    return { data: null, error }
  }
}

// Obtener ocupación actual
export const getOcupacionActual = async () => {
  try {
    const { data, error } = await supabase
      .from('habitaciones')
      .select('estado')
      .eq('activo', true)

    if (error) throw error

    const ocupadas = data.filter(h => h.estado === 'ocupada').length
    const disponibles = data.filter(h => h.estado === 'disponible').length
    const limpieza = data.filter(h => h.estado === 'limpieza').length
    const total = data.length

    return {
      data: { ocupadas, disponibles, limpieza, total },
      error: null
    }
  } catch (error) {
    console.error('Error al obtener ocupación:', error)
    return { data: null, error }
  }
}

// Actualizar estado de habitación
export const updateEstadoHabitacion = async (id, estado) => {
  try {
    const { data, error } = await supabase
      .from('habitaciones')
      .update({ estado })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al actualizar estado:', error)
    return { data: null, error }
  }
}

// Suscribirse a cambios en habitaciones (tiempo real)
export const subscribeToHabitaciones = (callback) => {
  const subscription = supabase
    .channel('habitaciones-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'habitaciones'
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return subscription
}
