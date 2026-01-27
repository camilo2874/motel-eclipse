import { supabase } from '../lib/supabase'

// Obtener ingresos del día actual
export const getIngresosDia = async () => {
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('registros')
      .select('total_pagado')
      .gte('fecha_entrada', hoy.toISOString())
      .eq('finalizado', true)

    if (error) throw error

    const total = data.reduce((sum, registro) => sum + (Number(registro.total_pagado) || 0), 0)

    return { data: total, error: null }
  } catch (error) {
    console.error('Error al obtener ingresos:', error)
    return { data: 0, error }
  }
}

// Obtener ingresos por habitaciones del día
export const getIngresosHabitacionesDia = async () => {
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('registros')
      .select('subtotal_habitacion')
      .gte('fecha_entrada', hoy.toISOString())
      .eq('finalizado', true)

    if (error) throw error

    const total = data.reduce((sum, registro) => sum + (Number(registro.subtotal_habitacion) || 0), 0)

    return { data: total, error: null }
  } catch (error) {
    console.error('Error al obtener ingresos por habitaciones:', error)
    return { data: 0, error }
  }
}

// Obtener ingresos por consumos del día
export const getIngresosConsumosDia = async () => {
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('registros')
      .select('subtotal_consumos')
      .gte('fecha_entrada', hoy.toISOString())
      .eq('finalizado', true)

    if (error) throw error

    const total = data.reduce((sum, registro) => sum + (Number(registro.subtotal_consumos) || 0), 0)

    return { data: total, error: null }
  } catch (error) {
    console.error('Error al obtener ingresos por consumos:', error)
    return { data: 0, error }
  }
}

// Obtener turno actual
export const getTurnoActual = async () => {
  try {
    const { data, error } = await supabase
      .from('turnos')
      .select('*')
      .is('fecha_cierre', null)
      .order('fecha_apertura', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return { data: data || null, error: null }
  } catch (error) {
    console.error('Error al obtener turno:', error)
    return { data: null, error }
  }
}
