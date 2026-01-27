import { useState, useEffect } from 'react'
import { X, Clock, DollarSign, User, LogIn, LogOut, Loader2, Plus, ShoppingCart, Trash2, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { differenceInMinutes, format } from 'date-fns'
import { getProductosDisponibles, registrarConsumo, getConsumosPorRegistro, eliminarConsumo } from '../services/consumos.service'

const ModalHabitacion = ({ habitacion, onClose }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [registroActivo, setRegistroActivo] = useState(null)
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0)
  const [costoCalculado, setCostoCalculado] = useState(0)
  const [mostrarConsumos, setMostrarConsumos] = useState(false)
  const [productos, setProductos] = useState([])
  const [consumos, setConsumos] = useState([])
  const [subtotalConsumos, setSubtotalConsumos] = useState(0)
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState({})

  useEffect(() => {
    if (habitacion.estado === 'ocupada') {
      cargarRegistroActivo()
    }
  }, [habitacion])

  useEffect(() => {
    if (registroActivo) {
      const interval = setInterval(() => {
        calcularTiempoYCosto()
      }, 1000)

      cargarConsumos()
      return () => clearInterval(interval)
    }
  }, [registroActivo])

  const cargarConsumos = async () => {
    if (!registroActivo) return
    
    const { data } = await getConsumosPorRegistro(registroActivo.id)
    if (data) {
      setConsumos(data)
      const total = data.reduce((sum, c) => sum + (c.cantidad * c.precio_unitario), 0)
      setSubtotalConsumos(total)
    }
  }

  const cargarProductos = async () => {
    const { data } = await getProductosDisponibles()
    if (data) setProductos(data)
  }

  const cargarRegistroActivo = async () => {
    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('habitacion_id', habitacion.id)
        .eq('finalizado', false)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setRegistroActivo(data)
      if (data) calcularTiempoYCosto(data)
    } catch (error) {
      console.error('Error al cargar registro:', error)
    }
  }

  const calcularTiempoYCosto = (registro = registroActivo) => {
    if (!registro) return

    const inicio = new Date(registro.fecha_entrada)
    const ahora = new Date()
    const minutosTranscurridos = differenceInMinutes(ahora, inicio)
    const horasTranscurridas = minutosTranscurridos / 60

    setTiempoTranscurrido(horasTranscurridas)

    // Calcular costo
    const precioBase = habitacion.tarifa.precio_base
    const precioHoraExtra = habitacion.tarifa.precio_hora_extra
    const horasBase = habitacion.tarifa.horas_base || 12
    const minutosGracia = 15

    let costo = precioBase

    if (horasTranscurridas > horasBase) {
      const horasExtras = horasTranscurridas - horasBase
      const minutosExtra = Math.round(horasExtras * 60)
      
      // Aplicar gracia
      if (minutosExtra > minutosGracia) {
        const horasExtrasCobrar = Math.ceil((minutosExtra - minutosGracia) / 60)
        costo += horasExtrasCobrar * precioHoraExtra
      }
    }

    setCostoCalculado(costo)
  }

  const handleCheckIn = async () => {
    setLoading(true)

    try {
      // Verificar si hay turno abierto (fecha_cierre IS NULL)
      const { data: turnos, error: turnoError } = await supabase
        .from('turnos')
        .select('id')
        .is('fecha_cierre', null)
        .limit(1)

      if (turnoError) {
        console.error('Error al verificar turno:', turnoError)
        toast.error('Error al verificar turno')
        setLoading(false)
        return
      }

      if (!turnos || turnos.length === 0) {
        toast.error('No hay un turno abierto. Abre un turno primero en Caja.')
        setLoading(false)
        return
      }

      const turno = turnos[0]

      // Crear registro
      const { data: registro, error: registroError } = await supabase
        .from('registros')
        .insert([
          {
            habitacion_id: habitacion.id,
            turno_id: turno.id,
            usuario_id: user.id,
            fecha_entrada: new Date().toISOString(),
            subtotal_habitacion: 0,
            subtotal_consumos: 0,
            total_pagado: 0,
            finalizado: false
          }
        ])
        .select()
        .single()

      if (registroError) throw registroError

      // Actualizar estado de habitación
      const { error: habitacionError } = await supabase
        .from('habitaciones')
        .update({ estado: 'ocupada' })
        .eq('id', habitacion.id)

      if (habitacionError) throw habitacionError

      toast.success('Check-in realizado exitosamente')
      onClose()
    } catch (error) {
      console.error('Error en check-in:', error)
      toast.error('Error al realizar check-in')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!registroActivo) return

    setLoading(true)

    try {
      const horasRedondeadas = Math.ceil(tiempoTranscurrido * 100) / 100
      const totalFinal = costoCalculado + subtotalConsumos

      // Actualizar registro
      const { error: registroError } = await supabase
        .from('registros')
        .update({
          fecha_salida: new Date().toISOString(),
          horas_totales: horasRedondeadas,
          subtotal_habitacion: costoCalculado,
          subtotal_consumos: subtotalConsumos,
          total_pagado: totalFinal,
          finalizado: true
        })
        .eq('id', registroActivo.id)

      if (registroError) throw registroError

      // Actualizar estado de habitación a limpieza
      const { error: habitacionError } = await supabase
        .from('habitaciones')
        .update({ estado: 'limpieza' })
        .eq('id', habitacion.id)

      if (habitacionError) throw habitacionError

      toast.success(`Check-out exitoso. Total: $${totalFinal.toLocaleString()}`)
      onClose()
    } catch (error) {
      console.error('Error en check-out:', error)
      toast.error('Error al realizar check-out')
    } finally {
      setLoading(false)
    }
  }

  const handleAgregarConsumo = async (producto, cantidad = 1) => {
    if (!registroActivo) return
    
    if (cantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0')
      return
    }
    
    if (cantidad > producto.stock_actual) {
      toast.error(`Solo hay ${producto.stock_actual} unidades disponibles`)
      return
    }

    setLoading(true)
    const { error } = await registrarConsumo(
      registroActivo.id,
      producto.id,
      cantidad,
      producto.precio_venta
    )

    if (error) {
      toast.error('Error al registrar consumo')
    } else {
      toast.success(`${cantidad}x ${producto.nombre} agregado`)
      await cargarConsumos()
      await cargarProductos() // Recargar para actualizar stock
      setCantidadSeleccionada({...cantidadSeleccionada, [producto.id]: 1}) // Resetear cantidad
    }
    
    setLoading(false)
  }

  const handleEliminarConsumo = async (consumoId) => {
    setLoading(true)
    const { error } = await eliminarConsumo(consumoId)
    
    if (error) {
      toast.error('Error al eliminar consumo')
    } else {
      toast.success('Consumo eliminado')
      await cargarConsumos()
    }
    
    setLoading(false)
  }

  const handleCambiarEstado = async (nuevoEstado) => {
    setLoading(true)

    try {
      const { error } = await supabase
        .from('habitaciones')
        .update({ estado: nuevoEstado })
        .eq('id', habitacion.id)

      if (error) throw error

      toast.success('Estado actualizado')
      onClose()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al actualizar estado')
    } finally {
      setLoading(false)
    }
  }

  const formatTiempo = (horas) => {
    const h = Math.floor(horas)
    const m = Math.round((horas - h) * 60)
    return `${h}h ${m}m`
  }

  const getTipoTexto = (tipo) => {
    switch (tipo) {
      case 'normal': return 'Normal'
      case 'maquina_amor': return 'Máquina del Amor'
      case 'suite': return 'Suite'
      default: return tipo
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Habitación #{habitacion.numero}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {getTipoTexto(habitacion.tipo)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información de la tarifa */}
          {habitacion.tarifa && (
            <div className="card bg-blue-50">
              <h3 className="font-semibold text-gray-900 mb-3">Tarifa</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Precio Base (12h)</p>
                  <p className="text-lg font-bold text-primary-600">
                    ${habitacion.tarifa.precio_base.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Hora Adicional</p>
                  <p className="text-lg font-bold text-primary-600">
                    ${habitacion.tarifa.precio_hora_extra.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estado Actual */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Estado Actual</h3>
            <div className="flex items-center gap-2">
              <span className={`badge ${
                habitacion.estado === 'disponible' ? 'badge-disponible' :
                habitacion.estado === 'ocupada' ? 'badge-ocupada' :
                'badge-limpieza'
              }`}>
                {habitacion.estado === 'disponible' && 'Disponible'}
                {habitacion.estado === 'ocupada' && 'Ocupada'}
                {habitacion.estado === 'limpieza' && 'Limpieza'}
              </span>
            </div>
          </div>

          {/* Si está ocupada, mostrar detalles */}
          {habitacion.estado === 'ocupada' && registroActivo && (
            <>
              <div className="card bg-red-50">
                <h3 className="font-semibold text-gray-900 mb-3">Detalles de Ocupación</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Hora de Entrada</p>
                    <p className="font-semibold">
                      {format(new Date(registroActivo.fecha_entrada), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiempo Transcurrido</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatTiempo(tiempoTranscurrido)}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-red-200">
                    <p className="text-sm text-gray-600">Costo Habitación</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${costoCalculado.toLocaleString()}
                    </p>
                    {tiempoTranscurrido > 12 && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ Ha excedido las 12 horas base
                      </p>
                    )}
                  </div>
                  {subtotalConsumos > 0 && (
                    <div className="pt-3 border-t border-red-200">
                      <p className="text-sm text-gray-600">Consumos</p>
                      <p className="text-xl font-bold text-blue-600">
                        ${subtotalConsumos.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div className="pt-3 border-t-2 border-red-300">
                    <p className="text-sm text-gray-600">Total a Pagar</p>
                    <p className="text-3xl font-bold text-primary-600">
                      ${(costoCalculado + subtotalConsumos).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección de Consumos */}
              <div className="card bg-purple-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Consumos ({consumos.length})
                  </h3>
                  <button
                    onClick={() => {
                      setMostrarConsumos(!mostrarConsumos)
                      if (!mostrarConsumos) cargarProductos()
                    }}
                    className={`btn btn-sm ${mostrarConsumos ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {mostrarConsumos ? 'Cerrar' : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar
                      </>
                    )}
                  </button>
                </div>

                {consumos.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {consumos.map(consumo => (
                      <div key={consumo.id} className="flex items-center justify-between bg-white p-2 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{consumo.inventario.nombre}</p>
                          <p className="text-xs text-gray-600">
                            {consumo.cantidad} x ${consumo.precio_unitario.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary-600">
                            ${(consumo.cantidad * consumo.precio_unitario).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleEliminarConsumo(consumo.id)}
                            className="p-1 hover:bg-red-100 rounded"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {mostrarConsumos && (
                  <div className="space-y-3">
                    {/* Buscador de productos */}
                    <div className="relative">
                      <input
                        type="text"
                        value={busquedaProducto}
                        onChange={(e) => setBusquedaProducto(e.target.value)}
                        placeholder="Buscar producto..."
                        className="input text-sm"
                      />
                    </div>

                    {/* Lista de productos */}
                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {productos
                        .filter(p => 
                          p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
                          (p.categoria && p.categoria.toLowerCase().includes(busquedaProducto.toLowerCase()))
                        )
                        .map(producto => (
                          <div
                            key={producto.id}
                            className="bg-white p-3 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{producto.nombre}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {producto.categoria && (
                                    <span className="text-xs badge bg-gray-100 text-gray-700">
                                      {producto.categoria}
                                    </span>
                                  )}
                                  <span className={`text-xs ${
                                    producto.stock_actual <= producto.stock_minimo 
                                      ? 'text-red-600 font-semibold' 
                                      : 'text-gray-600'
                                  }`}>
                                    Stock: {producto.stock_actual}
                                  </span>
                                </div>
                              </div>
                              <span className="font-semibold text-primary-600">
                                ${producto.precio_venta.toLocaleString()}
                              </span>
                            </div>
                            
                            {/* Selector de cantidad y botón */}
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max={producto.stock_actual}
                                value={cantidadSeleccionada[producto.id] || 1}
                                onChange={(e) => setCantidadSeleccionada({
                                  ...cantidadSeleccionada,
                                  [producto.id]: parseInt(e.target.value) || 1
                                })}
                                className="input text-sm w-20 text-center"
                                disabled={producto.stock_actual === 0}
                              />
                              <button
                                onClick={() => handleAgregarConsumo(
                                  producto, 
                                  cantidadSeleccionada[producto.id] || 1
                                )}
                                disabled={loading || producto.stock_actual === 0}
                                className="btn btn-sm btn-primary flex-1"
                              >
                                {producto.stock_actual === 0 ? 'Sin Stock' : 'Agregar'}
                              </button>
                            </div>
                          </div>
                        ))}
                      
                      {productos.filter(p => 
                        p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
                        (p.categoria && p.categoria.toLowerCase().includes(busquedaProducto.toLowerCase()))
                      ).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No se encontraron productos</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Acciones */}
          <div className="space-y-3">
            {habitacion.estado === 'disponible' && (
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="btn btn-success w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Realizar Check-in
                  </>
                )}
              </button>
            )}

            {habitacion.estado === 'ocupada' && (
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="btn btn-danger w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-5 h-5" />
                    Realizar Check-out
                  </>
                )}
              </button>
            )}

            {habitacion.estado === 'limpieza' && (
              <button
                onClick={() => handleCambiarEstado('disponible')}
                disabled={loading}
                className="btn btn-success w-full"
              >
                {loading ? 'Procesando...' : 'Marcar como Disponible'}
              </button>
            )}

            {habitacion.estado === 'disponible' && (
              <button
                onClick={() => handleCambiarEstado('limpieza')}
                disabled={loading}
                className="btn btn-secondary w-full"
              >
                Enviar a Limpieza
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalHabitacion