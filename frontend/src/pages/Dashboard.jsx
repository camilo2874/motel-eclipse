import { useState, useEffect } from 'react'
import { Bed, DollarSign, Clock, Package, Loader2, Home, ShoppingCart } from 'lucide-react'
import { getOcupacionActual } from '../services/habitaciones.service'
import { getIngresosDia, getIngresosHabitacionesDia, getIngresosConsumosDia, getTurnoActual } from '../services/dashboard.service'
import { getProductosBajoStock } from '../services/inventario.service'
import MapaHabitaciones from '../components/MapaHabitaciones'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    ocupacion: { ocupadas: 0, total: 11 },
    ingresos: 0,
    ingresosHabitaciones: 0,
    ingresosConsumos: 0,
    turno: null,
    productosBajoStock: 0
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    
    const [ocupacion, ingresos, ingresosHab, ingresosCons, turno, productos] = await Promise.all([
      getOcupacionActual(),
      getIngresosDia(),
      getIngresosHabitacionesDia(),
      getIngresosConsumosDia(),
      getTurnoActual(),
      getProductosBajoStock()
    ])

    setStats({
      ocupacion: ocupacion.data || { ocupadas: 0, total: 11 },
      ingresos: ingresos.data || 0,
      ingresosHabitaciones: ingresosHab.data || 0,
      ingresosConsumos: ingresosCons.data || 0,
      turno: turno.data,
      productosBajoStock: productos.data || 0
    })

    setLoading(false)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen en tiempo real de tu motel</p>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Ocupación */}
        <div className="card hover:shadow-xl transition-all duration-300 border-l-4 border-primary-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Bed className="w-6 h-6 text-primary-600" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Ocupación</p>
              <p className="text-xs text-gray-400">Habitaciones</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900">
              {stats.ocupacion.ocupadas}
            </p>
            <p className="text-2xl text-gray-400">/ {stats.ocupacion.total}</p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${(stats.ocupacion.ocupadas / stats.ocupacion.total) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-primary-600">
              {Math.round((stats.ocupacion.ocupadas / stats.ocupacion.total) * 100)}%
            </span>
          </div>
        </div>

        {/* Ingresos Habitaciones */}
        <div className="card hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Alquiler</p>
              <p className="text-xs text-gray-400">Hoy</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.ingresosHabitaciones)}
          </p>
          <p className="text-sm text-gray-500">Ingresos por habitaciones</p>
        </div>

        {/* Ingresos Consumos */}
        <div className="card hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Consumos</p>
              <p className="text-xs text-gray-400">Hoy</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(stats.ingresosConsumos)}
          </p>
          <p className="text-sm text-gray-500">Ingresos por productos</p>
        </div>

        {/* Ingresos Totales */}
        <div className="card hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white border-0 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-100">Total</p>
              <p className="text-xs text-green-200">Hoy</p>
            </div>
          </div>
          <p className="text-4xl font-bold mb-1">
            {formatCurrency(stats.ingresos)}
          </p>
          <p className="text-sm text-green-100">Ingresos totales del día</p>
        </div>

        {/* Turno Actual */}
        <div className={`card hover:shadow-xl transition-all duration-300 border-l-4 ${stats.turno ? 'border-emerald-500' : 'border-gray-400'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stats.turno ? 'bg-emerald-100' : 'bg-gray-100'}`}>
              <Clock className={`w-6 h-6 ${stats.turno ? 'text-emerald-600' : 'text-gray-500'}`} />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Turno</p>
              <p className="text-xs text-gray-400">Estado</p>
            </div>
          </div>
          <p className={`text-3xl font-bold mb-1 ${stats.turno ? 'text-emerald-600' : 'text-gray-400'}`}>
            {stats.turno ? 'Abierto' : 'Cerrado'}
          </p>
          <p className="text-sm text-gray-500">
            {stats.turno 
              ? `Desde ${new Date(stats.turno.fecha_apertura).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
              : 'Sin turno activo'
            }
          </p>
        </div>

        {/* Productos Bajo Stock */}
        <div className={`card hover:shadow-xl transition-all duration-300 border-l-4 ${stats.productosBajoStock > 0 ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stats.productosBajoStock > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <Package className={`w-6 h-6 ${stats.productosBajoStock > 0 ? 'text-red-600' : 'text-gray-500'}`} />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Inventario</p>
              <p className="text-xs text-gray-400">Bajo stock</p>
            </div>
          </div>
          <p className={`text-4xl font-bold mb-1 ${stats.productosBajoStock > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {stats.productosBajoStock}
          </p>
          <p className="text-sm text-gray-500">
            {stats.productosBajoStock > 0 ? 'Requieren reabastecimiento' : 'Stock adecuado'}
          </p>
        </div>
      </div>

      {/* Mapa de Habitaciones */}
      <div className="mt-8">
        <MapaHabitaciones onRefresh={cargarDatos} />
      </div>
    </div>
  )
}

export default Dashboard
