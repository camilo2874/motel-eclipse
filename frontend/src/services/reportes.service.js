import { supabase } from '../lib/supabase'

// Reinicio general del sistema (borra historial, mantiene configuración)
export const reinicioGeneral = async () => {
  try {
    // Eliminar en orden para respetar las foreign keys
    
    // 1. Consumos (dependen de registros)
    const { error: consumosError } = await supabase
      .from('consumos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Eliminar todos
    
    if (consumosError) throw consumosError

    // 2. Consignaciones (dependen de turnos)
    const { error: consignacionesError } = await supabase
      .from('consignaciones')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (consignacionesError) throw consignacionesError

    // 3. Registros (dependen de turnos)
    const { error: registrosError } = await supabase
      .from('registros')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (registrosError) throw registrosError

    // 4. Turnos
    const { error: turnosError } = await supabase
      .from('turnos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (turnosError) throw turnosError

    return { error: null }
  } catch (error) {
    console.error('Error en reinicio general:', error)
    return { error }
  }
}

// Obtener reporte completo de un turno
export const getReporteTurno = async (turnoId) => {
  try {
    // 1. Datos del turno
    const { data: turno, error: turnoError } = await supabase
      .from('turnos')
      .select(`
        *,
        usuario:usuario_id (nombre, email)
      `)
      .eq('id', turnoId)
      .single()

    if (turnoError) throw turnoError

    // 2. Registros de habitaciones
    const { data: registros, error: registrosError } = await supabase
      .from('registros')
      .select(`
        *,
        habitacion:habitacion_id (numero, tipo),
        usuario:usuario_id (nombre)
      `)
      .eq('turno_id', turnoId)
      .eq('finalizado', true)
      .order('fecha_entrada', { ascending: true })

    if (registrosError) throw registrosError

    // 3. Consumos del turno
    const { data: consumos, error: consumosError } = await supabase
      .from('consumos')
      .select(`
        *,
        inventario:producto_id (nombre, categoria),
        registro:registro_id (habitacion_id)
      `)
      .in('registro_id', registros.map(r => r.id))
      .order('created_at', { ascending: true })

    if (consumosError) throw consumosError

    // 4. Consignaciones
    const { data: consignaciones, error: consignacionesError } = await supabase
      .from('consignaciones')
      .select(`
        *,
        usuario:usuario_id (nombre)
      `)
      .eq('turno_id', turnoId)
      .order('created_at', { ascending: true })

    if (consignacionesError) throw consignacionesError

    // Calcular resumen de productos vendidos
    const productosResumen = {}
    consumos.forEach(consumo => {
      const key = consumo.producto_id
      if (!productosResumen[key]) {
        productosResumen[key] = {
          nombre: consumo.inventario.nombre,
          categoria: consumo.inventario.categoria,
          cantidad: 0,
          total: 0
        }
      }
      productosResumen[key].cantidad += consumo.cantidad
      productosResumen[key].total += consumo.cantidad * consumo.precio_unitario
    })

    return {
      data: {
        turno,
        registros,
        consumos,
        consignaciones,
        productosResumen: Object.values(productosResumen)
      },
      error: null
    }
  } catch (error) {
    console.error('Error al obtener reporte:', error)
    return { data: null, error }
  }
}

// Obtener estadísticas generales
export const getEstadisticasGenerales = async (fechaInicio, fechaFin) => {
  try {
    const { data: registros, error: registrosError } = await supabase
      .from('registros')
      .select('*')
      .eq('finalizado', true)

    if (registrosError) throw registrosError

    console.log('TODOS los registros finalizados:', registros)
    console.log('Ejemplo de registro:', registros[0])

    const totalIngresos = registros.reduce((sum, r) => sum + (Number(r.total_pagado) || 0), 0)
    const promedioHoras = registros.length > 0 
      ? registros.reduce((sum, r) => sum + (Number(r.horas_totales) || 0), 0) / registros.length 
      : 0

    return {
      data: {
        totalIngresos,
        totalReservas: registros.length,
        promedioHoras
      },
      error: null
    }
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return { data: null, error }
  }
}

// Obtener ingresos por día
export const getIngresosPorDia = async (fechaInicio, fechaFin) => {
  try {
    let query = supabase
      .from('registros')
      .select('fecha_salida, subtotal_habitacion, subtotal_consumos, total_pagado')
      .eq('finalizado', true)

    if (fechaInicio && fechaFin) {
      query = query.gte('fecha_salida', fechaInicio).lte('fecha_salida', fechaFin)
    }

    const { data: registros, error } = await query.order('fecha_salida', { ascending: true })

    if (error) throw error

    console.log('Registros para gráfica:', registros ? registros.length : 0)

    // Agrupar por día
    const ingresosPorDia = {}
    registros.forEach(registro => {
      const fecha = registro.fecha_salida 
        ? new Date(registro.fecha_salida).toISOString().split('T')[0]
        : new Date(registro.created_at).toISOString().split('T')[0]
        
      if (!ingresosPorDia[fecha]) {
        ingresosPorDia[fecha] = {
          fecha,
          habitaciones: 0,
          consumos: 0,
          total: 0
        }
      }
      ingresosPorDia[fecha].habitaciones += Number(registro.subtotal_habitacion) || 0
      ingresosPorDia[fecha].consumos += Number(registro.subtotal_consumos) || 0
      ingresosPorDia[fecha].total += Number(registro.total_pagado) || 0
    })

    return {
      data: Object.values(ingresosPorDia),
      error: null
    }
  } catch (error) {
    console.error('Error al obtener ingresos por día:', error)
    return { data: null, error }
  }
}

// Obtener ocupación por habitación
export const getOcupacionPorHabitacion = async (fechaInicio, fechaFin) => {
  try {
    let query = supabase
      .from('registros')
      .select(`
        habitacion_id,
        horas_totales,
        total_pagado,
        fecha_salida,
        habitacion:habitacion_id (numero, tipo)
      `)
      .eq('finalizado', true)
      .not('horas_totales', 'is', null)

    if (fechaInicio && fechaFin) {
      query = query.gte('fecha_salida', fechaInicio).lte('fecha_salida', fechaFin)
    }

    const { data, error } = await query

    if (error) throw error

    console.log('Registros ocupación:', data.length)

    // Agrupar por habitación
    const ocupacionPorHab = {}
    data.forEach(registro => {
      const habId = registro.habitacion_id
      if (!ocupacionPorHab[habId]) {
        ocupacionPorHab[habId] = {
          numero: registro.habitacion.numero,
          tipo: registro.habitacion.tipo,
          usos: 0,
          horasTotales: 0,
          ingresoTotal: 0
        }
      }
      ocupacionPorHab[habId].usos++
      ocupacionPorHab[habId].horasTotales += Number(registro.horas_totales) || 0
      ocupacionPorHab[habId].ingresoTotal += Number(registro.total_pagado) || 0
    })

    return {
      data: Object.values(ocupacionPorHab).sort((a, b) => b.usos - a.usos),
      error: null
    }
  } catch (error) {
    console.error('Error al obtener ocupación:', error)
    return { data: null, error }
  }
}

// Obtener productos más vendidos
export const getProductosMasVendidos = async (fechaInicio, fechaFin) => {
  try {
    let query = supabase
      .from('consumos')
      .select(`
        producto_id,
        cantidad,
        subtotal,
        created_at,
        producto:producto_id (nombre, categoria)
      `)

    if (fechaInicio && fechaFin) {
      query = query.gte('created_at', fechaInicio).lte('created_at', fechaFin)
    }

    const { data: consumos, error } = await query

    if (error) throw error

    console.log('Consumos encontrados:', consumos.length)

    // Agrupar por producto
    const productosPorId = {}
    consumos.forEach(consumo => {
      const prodId = consumo.producto_id
      if (!productosPorId[prodId]) {
        productosPorId[prodId] = {
          nombre: consumo.producto.nombre,
          categoria: consumo.producto.categoria,
          cantidad: 0,
          total: 0
        }
      }
      productosPorId[prodId].cantidad += consumo.cantidad
      productosPorId[prodId].total += Number(consumo.subtotal) || 0
    })

    return {
      data: Object.values(productosPorId).sort((a, b) => b.total - a.total),
      error: null
    }
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return { data: null, error }
  }
}

// Obtener turnos cerrados con paginación
export const getTurnosCerrados = async (limite = 20) => {
  try {
    const { data, error } = await supabase
      .from('turnos')
      .select(`
        *,
        usuario:usuario_id (nombre, email)
      `)
      .not('fecha_cierre', 'is', null)
      .order('fecha_cierre', { ascending: false })
      .limit(limite)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener turnos cerrados:', error)
    return { data: null, error }
  }
}

