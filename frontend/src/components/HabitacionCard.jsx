import { Clock, Bed, DollarSign } from 'lucide-react'

const HabitacionCard = ({ habitacion, onClick }) => {
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-50 border-green-300'
      case 'ocupada':
        return 'bg-red-50 border-red-300'
      case 'limpieza':
        return 'bg-yellow-50 border-yellow-300'
      default:
        return 'bg-gray-50 border-gray-300'
    }
  }

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'badge-disponible'
      case 'ocupada':
        return 'badge-ocupada'
      case 'limpieza':
        return 'badge-limpieza'
      default:
        return 'badge'
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

  return (
    <button
      onClick={onClick}
      className={`${getEstadoColor(habitacion.estado)} border-2 rounded-lg p-6 transition-all hover:shadow-lg text-left w-full`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Habitación #{habitacion.numero}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {getTipoTexto(habitacion.tipo)}
          </p>
        </div>
        <span className={`badge ${getEstadoBadge(habitacion.estado)}`}>
          {habitacion.estado === 'disponible' && 'Disponible'}
          {habitacion.estado === 'ocupada' && 'Ocupada'}
          {habitacion.estado === 'limpieza' && 'Limpieza'}
        </span>
      </div>

      <div className="space-y-2">
        {habitacion.tarifa && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>
              ${habitacion.tarifa.precio_base.toLocaleString()} / 12h
            </span>
          </div>
        )}

        {habitacion.estado === 'ocupada' && (
          <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
            <Clock className="w-4 h-4" />
            <span>En uso - Ver detalles</span>
          </div>
        )}
      </div>
    </button>
  )
}

export default HabitacionCard