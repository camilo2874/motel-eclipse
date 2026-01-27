import { useState, useEffect } from 'react'
import { Plus, Filter, Search, Home, CheckCircle, XCircle, AlertCircle, LayoutGrid, List, TrendingUp, Clock } from 'lucide-react'
import { getHabitaciones } from '../services/habitaciones.service'
import MapaHabitaciones from '../components/MapaHabitaciones'
import HabitacionCard from '../components/HabitacionCard'
import ModalHabitacion from '../components/ModalHabitacion'
import toast from 'react-hot-toast'

const Habitaciones = () => {
  const [habitaciones, setHabitaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas') // todas, disponibles, ocupadas, limpieza
  const [busqueda, setBusqueda] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null)
  const [vistaLista, setVistaLista] = useState(false)

  useEffect(() => {
    cargarHabitaciones()
  }, [])

  const cargarHabitaciones = async () => {
    setLoading(true)
    const { data, error } = await getHabitaciones()
    
    if (error) {
      toast.error('Error al cargar habitaciones')
    } else {
      setHabitaciones(data || [])
    }
    
    setLoading(false)
  }

  const handleHabitacionClick = (habitacion) => {
    setHabitacionSeleccionada(habitacion)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setHabitacionSeleccionada(null)
    cargarHabitaciones()
  }

  const habitacionesFiltradas = habitaciones.filter(h => {
    // Filtro por estado
    if (filtro !== 'todas' && h.estado !== filtro) return false
    
    // Filtro por búsqueda
    if (busqueda && !h.numero.toString().includes(busqueda)) return false
    
    return true
  })

  const contadores = {
    todas: habitaciones.length,
    disponibles: habitaciones.filter(h => h.estado === 'disponible').length,
    ocupadas: habitaciones.filter(h => h.estado === 'ocupada').length,
    limpieza: habitaciones.filter(h => h.estado === 'limpieza').length
  }

  return (
    <div>
      {/* Header mejorado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Habitaciones</h1>
        <p className="text-gray-600 mt-1">Control de disponibilidad y estado de habitaciones</p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Todas las habitaciones */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer" onClick={() => setFiltro('todas')}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Home className="w-6 h-6" />
              </div>
              {filtro === 'todas' && (
                <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">
                  ACTIVO
                </span>
              )}
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Habitaciones</p>
            <p className="text-4xl font-bold">{contadores.todas}</p>
            <div className="mt-2 text-xs text-blue-100 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              En el sistema
            </div>
          </div>
        </div>

        {/* Disponibles */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer" onClick={() => setFiltro('disponible')}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
              {filtro === 'disponible' && (
                <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">
                  ACTIVO
                </span>
              )}
            </div>
            <p className="text-green-100 text-sm mb-1">Disponibles</p>
            <p className="text-4xl font-bold">{contadores.disponibles}</p>
            <div className="mt-2 text-xs text-green-100 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Listas para usar
            </div>
          </div>
        </div>

        {/* Ocupadas */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-rose-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer" onClick={() => setFiltro('ocupada')}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <XCircle className="w-6 h-6" />
              </div>
              {filtro === 'ocupada' && (
                <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">
                  ACTIVO
                </span>
              )}
            </div>
            <p className="text-red-100 text-sm mb-1">Ocupadas</p>
            <p className="text-4xl font-bold">{contadores.ocupadas}</p>
            <div className="mt-2 text-xs text-red-100 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              En uso actualmente
            </div>
          </div>
        </div>

        {/* En Limpieza */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500 via-amber-600 to-orange-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer" onClick={() => setFiltro('limpieza')}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <AlertCircle className="w-6 h-6" />
              </div>
              {filtro === 'limpieza' && (
                <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">
                  ACTIVO
                </span>
              )}
            </div>
            <p className="text-yellow-100 text-sm mb-1">En Limpieza</p>
            <p className="text-4xl font-bold">{contadores.limpieza}</p>
            <div className="mt-2 text-xs text-yellow-100 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Siendo preparadas
            </div>
          </div>
        </div>
      </div>

      {/* Controles mejorados */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setVistaLista(!vistaLista)}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 transition-all shadow-md flex items-center gap-2"
          >
            {vistaLista ? (
              <>
                <LayoutGrid className="w-5 h-5" />
                Vista Mapa
              </>
            ) : (
              <>
                <List className="w-5 h-5" />
                Vista Lista
              </>
            )}
          </button>
        </div>
      </div>

      {/* Barra de búsqueda mejorada */}
      <div className="card mb-6 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="🔍 Buscar habitación por número..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input pl-12 text-lg font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Vista de habitaciones */}
      {vistaLista ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habitacionesFiltradas.map(habitacion => (
            <HabitacionCard
              key={habitacion.id}
              habitacion={habitacion}
              onClick={() => handleHabitacionClick(habitacion)}
            />
          ))}
        </div>
      ) : (
        <MapaHabitaciones 
          habitaciones={habitacionesFiltradas}
          onHabitacionClick={handleHabitacionClick}
          onRefresh={cargarHabitaciones}
        />
      )}

      {habitacionesFiltradas.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No se encontraron habitaciones</p>
        </div>
      )}

      {/* Modal de detalles */}
      {modalOpen && habitacionSeleccionada && (
        <ModalHabitacion
          habitacion={habitacionSeleccionada}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

export default Habitaciones
