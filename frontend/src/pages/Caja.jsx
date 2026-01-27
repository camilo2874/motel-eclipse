import { useState, useEffect } from 'react'
import { DollarSign, Clock, TrendingUp, TrendingDown, Loader2, Plus, CreditCard, AlertCircle, CheckCircle, XCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../hooks/usePermissions'
import { getTurnoActual } from '../services/dashboard.service'
import { abrirTurno, cerrarTurno, registrarConsignacion } from '../services/caja.service'
import { getReporteTurno } from '../services/reportes.service'
import ReporteTurno from '../components/ReporteTurno'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const Caja = () => {
  const { user } = useAuth()
  const { retirarEfectivo } = usePermissions()
  const [loading, setLoading] = useState(true)
  const [turnoActual, setTurnoActual] = useState(null)
  const [saldoInicial, setSaldoInicial] = useState('')
  const [saldoHeredado, setSaldoHeredado] = useState(0)
  const [montoConsignacion, setMontoConsignacion] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [mostrarModalApertura, setMostrarModalApertura] = useState(false)
  const [mostrarModalCierre, setMostrarModalCierre] = useState(false)
  const [mostrarModalConsignacion, setMostrarModalConsignacion] = useState(false)
  const [mostrarReporte, setMostrarReporte] = useState(false)
  const [datosReporte, setDatosReporte] = useState(null)

  useEffect(() => {
    cargarTurno()
    
    // Recargar cada 10 segundos si hay turno activo
    const interval = setInterval(() => {
      if (turnoActual) {
        cargarTurno()
      }
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const cargarTurno = async () => {
    setLoading(true)
    const { data: turno } = await getTurnoActual()
    
    if (turno) {
      // Calcular ingresos en tiempo real
      const { data: registros } = await supabase
        .from('registros')
        .select('total_pagado')
        .eq('turno_id', turno.id)
        .eq('finalizado', true)
      
      const totalIngresos = registros?.reduce((sum, r) => sum + (Number(r.total_pagado) || 0), 0) || 0
      
      // Calcular consignaciones en tiempo real
      const { data: consignaciones } = await supabase
        .from('consignaciones')
        .select('monto')
        .eq('turno_id', turno.id)
      
      const totalConsignaciones = consignaciones?.reduce((sum, c) => sum + (Number(c.monto) || 0), 0) || 0
      
      // Actualizar turno con totales calculados
      turno.total_ingresos = totalIngresos
      turno.total_consignaciones = totalConsignaciones
    }
    
    setTurnoActual(turno)
    setLoading(false)
  }

  const handleAbrirTurno = async () => {
    setLoading(true)
    // Si no se ingresa saldo, se hereda del turno anterior
    const saldoPersonalizado = saldoInicial && !isNaN(saldoInicial) ? parseFloat(saldoInicial) : 0
    const { data, error } = await abrirTurno(user.id, saldoPersonalizado, saldoHeredado)
    
    if (error) {
      toast.error('Error al abrir turno')
    } else {
      const diferencia = saldoPersonalizado > 0 ? saldoHeredado - saldoPersonalizado : 0
      if (diferencia !== 0) {
        toast.success(`Turno abierto. Ajuste de ${diferencia > 0 ? 'retiro' : 'ingreso'}: $${Math.abs(diferencia).toLocaleString()}`, { duration: 5000 })
      } else {
        toast.success('Turno abierto correctamente')
      }
      setMostrarModalApertura(false)
      setSaldoInicial('')
      cargarTurno()
    }
    
    setLoading(false)
  }

  const handleAbrirModalApertura = async () => {
    // Cargar el saldo del último turno cerrado
    const { data: ultimoTurno } = await supabase
      .from('turnos')
      .select('saldo_final')
      .not('fecha_cierre', 'is', null)
      .order('fecha_cierre', { ascending: false })
      .limit(1)
      .maybeSingle()

    setSaldoHeredado(ultimoTurno?.saldo_final || 0)
    setMostrarModalApertura(true)
  }

  const handleCerrarTurno = async () => {
    setLoading(true)
    const { error } = await cerrarTurno(turnoActual.id, observaciones)
    
    if (error) {
      toast.error('Error al cerrar turno')
      setLoading(false)
      return
    }
    
    // Obtener datos del reporte
    const { data: reporte } = await getReporteTurno(turnoActual.id)
    
    if (reporte) {
      setDatosReporte(reporte)
      setMostrarReporte(true)
    }
    
    toast.success('Turno cerrado exitosamente')
    setTurnoActual(null)
    setMostrarModalCierre(false)
    setObservaciones('')
    setLoading(false)
  }

  const handleRegistrarConsignacion = async () => {
    if (!montoConsignacion || isNaN(montoConsignacion)) {
      toast.error('Ingresa un monto válido')
      return
    }

    setLoading(true)
    const { error } = await registrarConsignacion(
      turnoActual.id,
      user.id,
      parseFloat(montoConsignacion),
      observaciones
    )
    
    if (error) {
      toast.error('Error al registrar consignación')
    } else {
      toast.success('Consignación registrada')
      setMostrarModalConsignacion(false)
      setMontoConsignacion('')
      setObservaciones('')
      cargarTurno()
    }
    
    setLoading(false)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  if (loading && !turnoActual) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con animación */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Sistema de Caja</h1>
          <p className="text-gray-500 text-sm">Control y gestión de turnos y efectivo</p>
        </div>
        {!turnoActual && (
          <button
            onClick={handleAbrirModalApertura}
            className="btn btn-success flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Abrir Turno
          </button>
        )}
      </div>

      {!turnoActual ? (
        <div className="card text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No hay turno activo
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Inicia un nuevo turno para comenzar a gestionar operaciones y registros de caja
            </p>
            <button
              onClick={handleAbrirModalApertura}
              className="btn btn-primary px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Abrir Turno Ahora
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Banner de Turno Activo con animación */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 p-6 shadow-xl">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-white">Turno Activo</h3>
                    <span className="px-3 py-1 bg-white bg-opacity-30 backdrop-blur-sm rounded-full text-sm font-semibold text-white animate-pulse">
                      EN VIVO
                    </span>
                  </div>
                  <p className="text-green-100">
                    Responsable: <span className="font-semibold text-white">{user?.nombre || 'Usuario'}</span>
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-green-100 text-sm mb-1">Apertura</p>
                <p className="text-white text-lg font-semibold">
                  {format(new Date(turnoActual.fecha_apertura), 'dd/MM/yyyy')}
                </p>
                <p className="text-white text-xl font-bold">
                  {format(new Date(turnoActual.fecha_apertura), 'HH:mm')}
                </p>
              </div>
            </div>
          </div>

          {/* Tarjetas de Métricas Principales con gradientes mejorados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Saldo Inicial */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <ArrowUpCircle className="w-5 h-5 text-blue-200" />
                </div>
                <p className="text-blue-100 text-sm font-medium mb-1">Saldo Inicial</p>
                <p className="text-white text-3xl font-bold">
                  {formatCurrency(turnoActual.saldo_inicial)}
                </p>
                <p className="text-blue-100 text-xs mt-2">Base de caja</p>
              </div>
            </div>

            {/* Ingresos */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs font-semibold text-white">
                    +{Math.round((turnoActual.total_ingresos / (turnoActual.saldo_inicial || 1)) * 100)}%
                  </div>
                </div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Ingresos del Turno</p>
                <p className="text-white text-3xl font-bold">
                  {formatCurrency(turnoActual.total_ingresos)}
                </p>
                <p className="text-emerald-100 text-xs mt-2">Ventas registradas</p>
              </div>
            </div>

            {/* Retiros */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                    <ArrowDownCircle className="w-6 h-6 text-white" />
                  </div>
                  <TrendingDown className="w-5 h-5 text-orange-200" />
                </div>
                <p className="text-orange-100 text-sm font-medium mb-1">Retiros Realizados</p>
                <p className="text-white text-3xl font-bold">
                  {formatCurrency(turnoActual.total_consignaciones)}
                </p>
                <p className="text-orange-100 text-xs mt-2">Consignaciones a caja fuerte</p>
              </div>
            </div>

            {/* Efectivo en Caja - Destacado */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-purple-300">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white bg-opacity-30 rounded-lg backdrop-blur-sm animate-pulse">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-purple-100 text-sm font-medium mb-1">💰 Efectivo en Caja</p>
                <p className="text-white text-3xl font-bold mb-1">
                  {formatCurrency((turnoActual.saldo_inicial || 0) + (turnoActual.total_ingresos || 0) - (turnoActual.total_consignaciones || 0))}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(((turnoActual.total_ingresos || 0) / ((turnoActual.saldo_inicial || 1) * 2)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-purple-100 text-xs whitespace-nowrap">Balance actual</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas adicionales del turno */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Duración del Turno</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor((new Date() - new Date(turnoActual.fecha_apertura)) / (1000 * 60 * 60))}h {Math.floor(((new Date() - new Date(turnoActual.fecha_apertura)) % (1000 * 60 * 60)) / (1000 * 60))}m
                  </p>
                </div>
                <Clock className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Promedio por Hora</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency((turnoActual.total_ingresos || 0) / Math.max(1, Math.floor((new Date() - new Date(turnoActual.fecha_apertura)) / (1000 * 60 * 60))))}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Movimientos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {((turnoActual.total_ingresos || 0) > 0 ? 1 : 0) + ((turnoActual.total_consignaciones || 0) > 0 ? 1 : 0)}
                  </p>
                </div>
                <AlertCircle className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Acciones Rápidas con diseño mejorado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Botón Retirar Efectivo */}
            <button
              onClick={() => setMostrarModalConsignacion(true)}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-4 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <TrendingDown className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Retirar Efectivo</h3>
                  <p className="text-blue-100 text-sm">Registrar consignación a caja fuerte</p>
                </div>
              </div>
            </button>

            {/* Botón Cerrar Turno */}
            <button
              onClick={() => setMostrarModalCierre(true)}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-4 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Cerrar Turno</h3>
                  <p className="text-red-100 text-sm">Finalizar y generar reporte completo</p>
                </div>
              </div>
            </button>
          </div>

          {/* Resumen Detallado con diseño mejorado */}
          <div className="card bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Resumen Financiero del Turno</h3>
                <p className="text-gray-500 text-sm">Desglose detallado de movimientos</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Saldo Inicial */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-700" />
                  </div>
                  <span className="font-medium text-gray-700">Saldo Inicial</span>
                </div>
                <span className="text-xl font-bold text-blue-700">{formatCurrency(turnoActual.saldo_inicial)}</span>
              </div>

              {/* Ingresos */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-200 rounded-lg">
                    <ArrowUpCircle className="w-5 h-5 text-green-700" />
                  </div>
                  <span className="font-medium text-gray-700">Ingresos del Turno</span>
                </div>
                <span className="text-xl font-bold text-green-700">
                  + {formatCurrency(turnoActual.total_ingresos || 0)}
                </span>
              </div>

              {/* Retiros */}
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <ArrowDownCircle className="w-5 h-5 text-orange-700" />
                  </div>
                  <span className="font-medium text-gray-700">Consignaciones</span>
                </div>
                <span className="text-xl font-bold text-orange-700">
                  - {formatCurrency(turnoActual.total_consignaciones || 0)}
                </span>
              </div>

              {/* Línea separadora */}
              <div className="border-t-2 border-dashed border-gray-300 my-2"></div>

              {/* Total */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl border-2 border-purple-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-200 rounded-xl">
                    <DollarSign className="w-6 h-6 text-purple-700" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-gray-900">Efectivo en Caja</span>
                    <p className="text-xs text-gray-600">Balance actual disponible</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-purple-700">
                    {formatCurrency(
                      turnoActual.saldo_inicial + 
                      (turnoActual.total_ingresos || 0) - 
                      (turnoActual.total_consignaciones || 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Apertura de Turno */}
      {mostrarModalApertura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Abrir Nuevo Turno</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">
                  💰 <strong>Saldo heredado del turno anterior:</strong>
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  ${saldoHeredado.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Deja el campo vacío para usar este valor
                </p>
              </div>

              {(() => {
                const saldoPersonalizado = saldoInicial && !isNaN(saldoInicial) ? parseFloat(saldoInicial) : 0
                const diferencia = saldoPersonalizado > 0 ? saldoHeredado - saldoPersonalizado : 0
                
                if (diferencia !== 0) {
                  return (
                    <div className={`border rounded-lg p-4 ${diferencia > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                      <p className={`text-sm font-semibold mb-2 ${diferencia > 0 ? 'text-orange-800' : 'text-green-800'}`}>
                        ⚠️ Se registrará un ajuste automático
                      </p>
                      <p className={`text-sm ${diferencia > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                        <strong>{diferencia > 0 ? 'Retiro' : 'Ingreso'} de ajuste:</strong> ${Math.abs(diferencia).toLocaleString()}
                      </p>
                      <p className={`text-xs mt-1 ${diferencia > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        Este {diferencia > 0 ? 'retiro' : 'ingreso'} quedará registrado en el reporte del turno
                      </p>
                    </div>
                  )
                }
                return null
              })()}

              <div>
                <label className="label">Caja Base Personalizada (Opcional)</label>
                <input
                  type="number"
                  value={saldoInicial}
                  onChange={(e) => setSaldoInicial(e.target.value)}
                  className="input"
                  placeholder="Dejar vacío para heredar saldo anterior"
                  min="0"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMostrarModalApertura(false)
                    setSaldoInicial('')
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAbrirTurno}
                  disabled={loading}
                  className="btn btn-success flex-1"
                >
                  {loading ? 'Abriendo...' : 'Abrir Turno'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Consignación */}
      {mostrarModalConsignacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Retirar Efectivo de Caja</h3>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 mb-2">
                  💵 <strong>Efectivo disponible en caja:</strong>
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {formatCurrency((turnoActual?.saldo_inicial || 0) + (turnoActual?.total_ingresos || 0) - (turnoActual?.total_consignaciones || 0))}
                </p>
              </div>
              <div>
                <label className="label">Monto a Retirar</label>
                <input
                  type="number"
                  value={montoConsignacion}
                  onChange={(e) => setMontoConsignacion(e.target.value)}
                  className="input"
                  placeholder="0"
                  min="0"
                  max={(turnoActual?.saldo_inicial || 0) + (turnoActual?.total_ingresos || 0) - (turnoActual?.total_consignaciones || 0)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este monto se restará del efectivo disponible
                </p>
              </div>
              <div>
                <label className="label">Observaciones (Opcional)</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="Notas adicionales..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMostrarModalConsignacion(false)
                    setMontoConsignacion('')
                    setObservaciones('')
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegistrarConsignacion}
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cierre de Turno */}
      {mostrarModalCierre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Cerrar Turno</h3>
            <div className="space-y-4">
              <div className="card bg-yellow-50">
                <p className="text-sm text-yellow-800">
                  ⚠️ Al cerrar el turno no podrás registrar más operaciones hasta abrir uno nuevo.
                </p>
              </div>
              <div>
                <label className="label">Observaciones de Cierre (Opcional)</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="Novedades del turno..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMostrarModalCierre(false)
                    setObservaciones('')
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCerrarTurno}
                  disabled={loading}
                  className="btn btn-danger flex-1"
                >
                  {loading ? 'Cerrando...' : 'Cerrar Turno'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reporte de Turno */}
      {mostrarReporte && datosReporte && (
        <ReporteTurno
          turnoId={datosReporte.turno.id}
          datosReporte={datosReporte}
          onClose={() => setMostrarReporte(false)}
        />
      )}
    </div>
  )
}

export default Caja
