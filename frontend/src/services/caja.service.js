import { supabase } from '../lib/supabase'

// Abrir turno
export const abrirTurno = async (usuarioId, saldoInicial = 0, saldoHeredado = 0) => {
  try {
    let saldoAUsar = saldoInicial

    // Si NO se proporcionó un saldo inicial personalizado, heredar del turno anterior
    if (!saldoInicial || saldoInicial === 0) {
      const { data: ultimoTurno } = await supabase
        .from('turnos')
        .select('saldo_final')
        .not('fecha_cierre', 'is', null)
        .order('fecha_cierre', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Heredar el saldo final del turno anterior, o 0 si no hay turno anterior
      saldoAUsar = ultimoTurno?.saldo_final || 0
    }

    // Crear el turno
    const { data, error } = await supabase
      .from('turnos')
      .insert([{
        usuario_id: usuarioId,
        saldo_inicial: saldoAUsar,
        fecha_apertura: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    // Si hay diferencia entre el saldo heredado y el personalizado, registrar ajuste
    const diferencia = saldoInicial > 0 && saldoHeredado > 0 ? saldoHeredado - saldoInicial : 0
    
    if (diferencia !== 0) {
      const { error: consignacionError } = await supabase
        .from('consignaciones')
        .insert([{
          turno_id: data.id,
          usuario_id: usuarioId,
          monto: Math.abs(diferencia),
          observaciones: `Ajuste automático de apertura: ${diferencia > 0 ? 'Retiro' : 'Ingreso'} por diferencia entre saldo heredado ($${saldoHeredado.toLocaleString()}) y base personalizada ($${saldoInicial.toLocaleString()})`
        }])

      if (consignacionError) {
        console.error('Error al registrar ajuste:', consignacionError)
        // No lanzar error, el turno ya se creó correctamente
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error al abrir turno:', error)
    return { data: null, error }
  }
}

// Cerrar turno
export const cerrarTurno = async (turnoId, observaciones = '') => {
  try {
    // Obtener total de ingresos del turno
    const { data: registros, error: registrosError } = await supabase
      .from('registros')
      .select('total_pagado')
      .eq('turno_id', turnoId)
      .eq('finalizado', true)

    if (registrosError) throw registrosError

    const totalIngresos = registros.reduce((sum, r) => sum + (Number(r.total_pagado) || 0), 0)

    // Obtener consignaciones
    const { data: consignaciones, error: consignacionesError } = await supabase
      .from('consignaciones')
      .select('monto')
      .eq('turno_id', turnoId)

    if (consignacionesError) throw consignacionesError

    const totalConsignaciones = consignaciones.reduce((sum, c) => sum + (Number(c.monto) || 0), 0)

    // Obtener turno para saldo inicial
    const { data: turno, error: turnoError } = await supabase
      .from('turnos')
      .select('saldo_inicial')
      .eq('id', turnoId)
      .single()

    if (turnoError) throw turnoError

    const saldoFinal = turno.saldo_inicial + totalIngresos - totalConsignaciones

    // Cerrar turno
    const { data, error } = await supabase
      .from('turnos')
      .update({
        fecha_cierre: new Date().toISOString(),
        total_ingresos: totalIngresos,
        total_consignaciones: totalConsignaciones,
        saldo_final: saldoFinal,
        observaciones
      })
      .eq('id', turnoId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al cerrar turno:', error)
    return { data: null, error }
  }
}

// Registrar consignación
export const registrarConsignacion = async (turnoId, usuarioId, monto, observaciones = '') => {
  try {
    const { data, error } = await supabase
      .from('consignaciones')
      .insert([
        {
          turno_id: turnoId,
          usuario_id: usuarioId,
          monto,
          observaciones
        }
      ])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al registrar consignación:', error)
    return { data: null, error }
  }
}
