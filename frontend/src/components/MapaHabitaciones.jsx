import { useState, useEffect } from 'react'
import { Bed, Clock, Loader2 } from 'lucide-react'
import { getHabitaciones, subscribeToHabitaciones } from '../services/habitaciones.service'
import toast from 'react-hot-toast'

const MapaHabitaciones = ({ habitaciones: habitacionesProp, onHabitacionClick, onRefresh }) => {
  const [habitaciones, setHabitaciones] = useState(habitacionesProp || [])
  const [loading, setLoading] = useState(!habitacionesProp)

  useEffect(() => {
    if (habitacionesProp) {
      setHabitaciones(habitacionesProp)
      setLoading(false)
    } else {
      cargarHabitaciones()
    }

    // Suscribirse a cambios en tiempo real
    const subscription = subscribeToHabitaciones((payload) => {
      console.log('Cambio detectado:', payload)
      if (!habitacionesProp) {
        cargarHabitaciones()
      }
      if (onRefresh) onRefresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [habitacionesProp])

  const cargarHabitaciones = async () => {
    const { data, error } = await getHabitaciones()
    
    if (error) {
      toast.error('Error al cargar habitaciones')
      console.error(error)
    } else {
      setHabitaciones(data || [])
    }
    
    setLoading(false)
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-100 border-green-300 hover:bg-green-200'
      case 'ocupada':
        return 'bg-red-100 border-red-300 hover:bg-red-200'
      case 'limpieza':
        return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
      case 'mantenimiento':
        return 'bg-gray-100 border-gray-300 hover:bg-gray-200'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'Disponible'
      case 'ocupada':
        return 'Ocupada'
      case 'limpieza':
        return 'Limpieza'
      case 'mantenimiento':
        return 'Mantenimiento'
      default:
        return estado
    }
  }

  const getTipoTexto = (tipo) => {
    switch (tipo) {
      case 'normal':
        return 'Normal'
      case 'maquina_amor':
        return 'Máquina del Amor'
      case 'suite':
        return 'Suite'
      default:
        return tipo
    }
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'suite':
        return '👑'
      case 'maquina_amor':
        return '💕'
      default:
        return '🛏️'
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Mapa de Habitaciones</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span>Ocupada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>Limpieza</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {habitaciones.map((habitacion) => (
          <button
            key={habitacion.id}
            className={`${getEstadoColor(habitacion.estado)} border-2 rounded-lg p-4 transition-all duration-200 text-left hover:scale-105 hover:shadow-md`}
            onClick={() => {
              if (onHabitacionClick) {
                onHabitacionClick(habitacion)
              } else {
                console.log('Habitación seleccionada:', habitacion)
              }
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">
                #{habitacion.numero}
              </span>
              <span className="text-2xl">{getTipoIcon(habitacion.tipo)}</span>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-600">
                {getTipoTexto(habitacion.tipo)}
              </p>
              <p className={`text-xs font-semibold ${
                habitacion.estado === 'disponible' ? 'text-green-700' :
                habitacion.estado === 'ocupada' ? 'text-red-700' :
                habitacion.estado === 'limpieza' ? 'text-yellow-700' :
                'text-gray-700'
              }`}>
                {getEstadoTexto(habitacion.estado)}
              </p>
              
              {habitacion.tarifa && (
                <p className="text-xs text-gray-500 mt-2">
                  ${habitacion.tarifa.precio_base.toLocaleString()}
                </p>
              )}
            </div>

            {habitacion.estado === 'ocupada' && (
              <div className="mt-2 pt-2 border-t border-red-200 flex items-center gap-1 text-xs text-red-700">
                <Clock className="w-3 h-3" />
                <span>En uso</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {habitaciones.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Bed className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay habitaciones registradas</p>
        </div>
      )}
    </div>
  )
}

export default MapaHabitaciones