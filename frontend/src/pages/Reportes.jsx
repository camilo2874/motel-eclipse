import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, DollarSign, Package, Home, Download, Loader2, FileText, ClipboardList, AlertTriangle, RefreshCcw, BarChart3, PieChart as PieChartIcon, Clock, CheckCircle, XCircle } from 'lucide-react'
import { getEstadisticasGenerales, getIngresosPorDia, getOcupacionPorHabitacion, getProductosMasVendidos, getTurnosCerrados, getReporteTurno, reinicioGeneral } from '../services/reportes.service'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { generarPDFTurno, generarPDFEstadisticas } from '../utils/generarPDF'
import toast from 'react-hot-toast'

const Reportes = () => {
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('estadisticas') // 'estadisticas' o 'turnos'
  const [periodo, setPeriodo] = useState('todos')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  
  const [estadisticas, setEstadisticas] = useState(null)
  const [ingresosPorDia, setIngresosPorDia] = useState([])
  const [ocupacionHabitaciones, setOcupacionHabitaciones] = useState([])
  const [productosVendidos, setProductosVendidos] = useState([])
  const [turnosCerrados, setTurnosCerrados] = useState([])
  const [generandoPDF, setGenerandoPDF] = useState(null)
  const [mostrarModalReinicio, setMostrarModalReinicio] = useState(false)
  const [pasoConfirmacion, setPasoConfirmacion] = useState(1)
  const [textoConfirmacion, setTextoConfirmacion] = useState('')

  useEffect(() => {
    if (tab === 'estadisticas') {
      cargarDatos()
    } else if (tab === 'turnos') {
      cargarTurnos()
    }
  }, [periodo, tab])

  const cargarTurnos = async () => {
    setLoading(true)
    const { data } = await getTurnosCerrados(50)
    if (data) setTurnosCerrados(data)
    setLoading(false)
  }

  const handleGenerarPDF = async (turnoId) => {
    setGenerandoPDF(turnoId)
    try {
      const { data: reporte } = await getReporteTurno(turnoId)
      if (reporte) {
        const nombreArchivo = generarPDFTurno(reporte)
        toast.success(`PDF generado: ${nombreArchivo}`)
      } else {
        toast.error('No se pudo cargar el reporte')
      }
    } catch (error) {
      console.error('Error al generar PDF:', error)
      toast.error('Error al generar PDF')
    } finally {
      setGenerandoPDF(null)
    }
  }

  const handleExportarEstadisticas = async () => {
    setLoading(true)
    try {
      // Obtener fechas según el período
      let inicio, fin
      if (periodo === 'todos') {
        inicio = null
        fin = null
      } else if (periodo === '7dias') {
        inicio = startOfDay(subDays(new Date(), 7)).toISOString()
        fin = endOfDay(new Date()).toISOString()
      } else if (periodo === '30dias') {
        inicio = startOfDay(subDays(new Date(), 30)).toISOString()
        fin = endOfDay(new Date()).toISOString()
      } else if (periodo === 'personalizado' && fechaDesde && fechaHasta) {
        inicio = startOfDay(new Date(fechaDesde)).toISOString()
        fin = endOfDay(new Date(fechaHasta)).toISOString()
      }

      const datosParaPDF = {
        estadisticas,
        ingresosPorDia,
        ocupacionHabitaciones,
        productosVendidos
      }

      const nombreArchivo = generarPDFEstadisticas(datosParaPDF, periodo, inicio, fin)
      toast.success(`PDF generado: ${nombreArchivo}`)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      toast.error('Error al generar PDF de estadísticas')
    } finally {
      setLoading(false)
    }
  }

  const handleAbrirModalReinicio = () => {
    setMostrarModalReinicio(true)
    setPasoConfirmacion(1)
    setTextoConfirmacion('')
  }

  const handleCerrarModalReinicio = () => {
    setMostrarModalReinicio(false)
    setPasoConfirmacion(1)
    setTextoConfirmacion('')
  }

  const handleSiguientePaso = () => {
    setPasoConfirmacion(2)
  }

  const handleReinicioGeneral = async () => {
    if (textoConfirmacion !== 'REINICIAR') {
      toast.error('Debes escribir exactamente: REINICIAR')
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Ejecutando reinicio general...')
    
    try {
      const { error } = await reinicioGeneral()
      
      if (error) {
        toast.error('Error al ejecutar reinicio')
        console.error('Error:', error)
      } else {
        toast.success('✅ Reinicio completado. Sistema limpio.')
        handleCerrarModalReinicio()
        
        // Recargar datos
        if (tab === 'estadisticas') {
          cargarDatos()
        } else {
          cargarTurnos()
        }
      }
    } catch (error) {
      toast.error('Error inesperado al reiniciar')
      console.error('Error:', error)
    } finally {
      toast.dismiss(loadingToast)
      setLoading(false)
    }
  }

  const cargarDatos = async () => {
    setLoading(true)
    
    let inicio, fin
    if (periodo === 'todos') {
      inicio = null
      fin = null
    } else if (periodo === '7dias') {
      inicio = startOfDay(subDays(new Date(), 7)).toISOString()
      fin = endOfDay(new Date()).toISOString()
    } else if (periodo === '30dias') {
      inicio = startOfDay(subDays(new Date(), 30)).toISOString()
      fin = endOfDay(new Date()).toISOString()
    } else if (periodo === 'personalizado' && fechaDesde && fechaHasta) {
      inicio = startOfDay(new Date(fechaDesde)).toISOString()
      fin = endOfDay(new Date(fechaHasta)).toISOString()
    } else {
      setLoading(false)
      return
    }

    const [stats, ingresos, ocupacion, productos] = await Promise.all([
      getEstadisticasGenerales(inicio, fin),
      getIngresosPorDia(inicio, fin),
      getOcupacionPorHabitacion(inicio, fin),
      getProductosMasVendidos(inicio, fin)
    ])

    if (stats.data) setEstadisticas(stats.data)
    if (ingresos.data) setIngresosPorDia(ingresos.data)
    if (ocupacion.data) setOcupacionHabitaciones(ocupacion.data)
    if (productos.data) setProductosVendidos(productos.data.slice(0, 10))

    setLoading(false)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  if (loading && !estadisticas) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div>
      {/* Header mejorado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-600 mt-1">Análisis y visualización de datos del negocio</p>
        </div>
        
        {/* Botón de Reinicio General mejorado */}
        <button
          onClick={handleAbrirModalReinicio}
          className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          <RefreshCcw className="w-5 h-5" />
          Reinicio General
        </button>
      </div>

      {/* Modal de Confirmación de Reinicio - Mejorado */}
      {mostrarModalReinicio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-slideUp">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Reinicio General
                  </h3>
                  <p className="text-red-100 text-sm">Paso {pasoConfirmacion} de 2</p>
                </div>
              </div>
            </div>
            <div className="p-6">

            {pasoConfirmacion === 1 ? (
              <>
                {/* PASO 1: Información */}
                <div className="mb-6 space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800 font-semibold mb-2">
                      💡 RECOMENDACIÓN IMPORTANTE
                    </p>
                    <p className="text-sm text-yellow-700">
                      Antes de continuar, ve a la pestaña <strong>"Turnos Cerrados"</strong> y 
                      exporta los PDFs de todos los turnos que quieras conservar.
                    </p>
                  </div>

                  <p className="text-gray-700">
                    Esta acción eliminará <strong>PERMANENTEMENTE</strong>:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Todos los turnos (abiertos y cerrados)</li>
                    <li>Todos los registros de habitaciones</li>
                    <li>Todos los consumos</li>
                    <li>Todas las consignaciones</li>
                    <li>Todo el historial financiero</li>
                  </ul>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-green-800">
                      <strong>✓ Se mantendrá:</strong> Inventario, Habitaciones y Usuarios
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800 font-semibold">
                      ⚠️ Esta acción NO se puede deshacer
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCerrarModalReinicio}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSiguientePaso}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all shadow-lg"
                  >
                    Continuar →
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* PASO 2: Confirmación con texto */}
                <div className="mb-6 space-y-4">
                  <p className="text-gray-700 font-semibold">
                    Para confirmar el reinicio, escribe exactamente:
                  </p>
                  
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <code className="text-xl font-bold text-red-600">REINICIAR</code>
                  </div>

                  <input
                    type="text"
                    value={textoConfirmacion}
                    onChange={(e) => setTextoConfirmacion(e.target.value)}
                    placeholder="Escribe aquí..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-center text-lg font-semibold"
                    autoFocus
                  />

                  {textoConfirmacion && textoConfirmacion !== 'REINICIAR' && (
                    <p className="text-sm text-red-600 text-center">
                      ⚠️ El texto no coincide
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPasoConfirmacion(1)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 transition-all"
                  >
                    ← Atrás
                  </button>
                  <button
                    onClick={handleReinicioGeneral}
                    disabled={textoConfirmacion !== 'REINICIAR'}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Ejecutar Reinicio
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs mejorados */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setTab('estadisticas')}
          className={`px-8 py-3.5 rounded-xl font-semibold transition-all flex items-center gap-2 transform hover:scale-105 ${
            tab === 'estadisticas'
              ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          Estadísticas
        </button>
        <button
          onClick={() => setTab('turnos')}
          className={`px-8 py-3.5 rounded-xl font-semibold transition-all flex items-center gap-2 transform hover:scale-105 ${
            tab === 'turnos'
              ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          Turnos Cerrados
        </button>
      </div>

      {/* Contenido según tab */}
      {tab === 'turnos' ? (
        // SECCIÓN DE TURNOS CERRADOS
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Turnos Cerrados - Generar PDFs
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : turnosCerrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No hay turnos cerrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Responsable</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Apertura</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Cierre</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Ingresos</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Saldo Final</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {turnosCerrados.map((turno) => (
                    <tr key={turno.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                        {turno.id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{turno.usuario?.nombre || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{turno.usuario?.email || ''}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {format(new Date(turno.fecha_apertura), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {format(new Date(turno.fecha_cierre), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-green-600 font-semibold">
                          {formatCurrency(turno.total_ingresos || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-blue-600 font-bold">
                          {formatCurrency(turno.saldo_final || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleGenerarPDF(turno.id)}
                          disabled={generandoPDF === turno.id}
                          className="btn btn-success btn-sm flex items-center gap-2 mx-auto"
                        >
                          {generandoPDF === turno.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4" />
                              Generar PDF
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // SECCIÓN DE ESTADÍSTICAS (CONTENIDO ORIGINAL)
        <>
          {/* Filtros de Fecha */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Período:</span>
            </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setPeriodo('todos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                periodo === 'todos' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setPeriodo('7dias')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                periodo === '7dias' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => setPeriodo('30dias')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                periodo === '30dias' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Últimos 30 días
            </button>
            <button
              onClick={() => setPeriodo('personalizado')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                periodo === 'personalizado' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Personalizado
            </button>
          </div>

          {periodo === 'personalizado' && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Desde:</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Hasta:</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
              <button
                onClick={cargarDatos}
                disabled={!fechaDesde || !fechaHasta}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buscar
              </button>
            </>
          )}
          </div>

          {/* Botón Exportar PDF mejorado */}
          <button
            onClick={handleExportarEstadisticas}
            disabled={!estadisticas}
            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:transform-none"
          >
            <Download className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas mejoradas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Ingresos Totales */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">
                  GANANCIAS
                </span>
              </div>
              <p className="text-blue-100 text-sm mb-1">Ingresos Totales</p>
              <p className="text-3xl font-bold">
                {formatCurrency(estadisticas.totalIngresos)}
              </p>
              <div className="mt-2 text-xs text-blue-100 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Período seleccionado
              </div>
            </div>
          </div>

          {/* Total Registros */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <Home className="w-6 h-6" />
                </div>
                <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">
                  REGISTROS
                </span>
              </div>
              <p className="text-green-100 text-sm mb-1">Total Registros</p>
              <p className="text-3xl font-bold">
                {estadisticas.totalReservas}
              </p>
              <div className="mt-2 text-xs text-green-100 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Habitaciones ocupadas
              </div>
            </div>
          </div>

          {/* Promedio Horas */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">
                  PROMEDIO
                </span>
              </div>
              <p className="text-purple-100 text-sm mb-1">Promedio Horas</p>
              <p className="text-3xl font-bold">
                {estadisticas.promedioHoras.toFixed(1)}h
              </p>
              <div className="mt-2 text-xs text-purple-100 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Duración promedio
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfica de Ingresos por Día */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Ingresos por Día
        </h3>
        {ingresosPorDia.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ingresosPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fecha" 
                tickFormatter={(fecha) => format(new Date(fecha), 'dd/MM')}
              />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(fecha) => format(new Date(fecha), 'dd/MM/yyyy')}
              />
              <Legend />
              <Bar dataKey="habitaciones" name="Habitaciones" fill="#3b82f6" />
              <Bar dataKey="consumos" name="Consumos" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No hay datos para este período</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ocupación por Habitación */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Habitaciones Más Usadas
          </h3>
          {ocupacionHabitaciones.length > 0 ? (
            <div className="space-y-3">
              {ocupacionHabitaciones.slice(0, 8).map((hab, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">Habitación #{hab.numero}</p>
                    <p className="text-xs text-gray-600">{hab.tipo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{hab.usos} usos</p>
                    <p className="text-xs text-gray-600">{hab.horasTotales.toFixed(1)}h totales</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No hay datos de ocupación</p>
            </div>
          )}
        </div>

        {/* Productos Más Vendidos */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Productos Más Vendidos
          </h3>
          {productosVendidos.length > 0 ? (
            <div className="space-y-3">
              {productosVendidos.map((prod, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{prod.nombre}</p>
                      {prod.categoria && (
                        <p className="text-xs text-gray-600">{prod.categoria}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{formatCurrency(prod.total)}</p>
                    <p className="text-xs text-gray-600">{prod.cantidad} unidades</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No hay ventas registradas</p>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  )
}

export default Reportes

