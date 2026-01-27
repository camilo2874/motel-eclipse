import { useState, useEffect } from 'react'
import { Users, Key, Shield, UserCog, Loader2, Crown, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { getUsuarios, cambiarMiPassword } from '../services/usuarios.service'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Usuarios = () => {
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false)
  
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [mostrarPassword1, setMostrarPassword1] = useState(false)
  const [mostrarPassword2, setMostrarPassword2] = useState(false)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    setLoading(true)
    const { data, error } = await getUsuarios()
    
    if (error) {
      toast.error('Error al cargar usuarios')
    } else {
      setUsuarios(data || [])
    }
    
    setLoading(false)
  }

  const handleCambiarPassword = async (e) => {
    e.preventDefault()

    if (!nuevaPassword || !confirmarPassword) {
      toast.error('Complete todos los campos')
      return
    }

    if (nuevaPassword !== confirmarPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (nuevaPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    const loadingToast = toast.loading('Cambiando contraseña...')
    
    try {
      const { error } = await cambiarMiPassword(nuevaPassword)

      toast.dismiss(loadingToast)

      if (error) {
        console.error('Error al cambiar contraseña:', error)
        toast.error(error.message || 'Error al cambiar contraseña')
      } else {
        toast.success('Contraseña actualizada exitosamente')
        setMostrarModalPassword(false)
        setNuevaPassword('')
        setConfirmarPassword('')
      }
    } catch (err) {
      toast.dismiss(loadingToast)
      console.error('Error inesperado:', err)
      toast.error('Error inesperado al cambiar contraseña')
    }
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
      {/* Header mejorado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Control y administración de accesos al sistema</p>
        </div>
        <button
          onClick={() => setMostrarModalPassword(true)}
          className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          <Key className="w-5 h-5" />
          Cambiar mi Contraseña
        </button>
      </div>

      {/* Tarjetas de Estadísticas con Gradientes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Usuarios */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Usuarios</p>
            <p className="text-4xl font-bold">{usuarios.length}</p>
            <div className="mt-2 text-xs text-blue-100 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Usuarios registrados
            </div>
          </div>
        </div>
        
        {/* Dueños */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500 via-amber-600 to-orange-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Crown className="w-6 h-6" />
              </div>
              <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">
                MÁXIMO ACCESO
              </span>
            </div>
            <p className="text-yellow-100 text-sm mb-1">Dueños</p>
            <p className="text-4xl font-bold">{usuarios.filter(u => u.rol === 'dueno').length}</p>
            <div className="mt-2 text-xs text-yellow-100 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Control total del sistema
            </div>
          </div>
        </div>
        
        {/* Administradores */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <UserCog className="w-6 h-6" />
              </div>
              <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">
                OPERATIVO
              </span>
            </div>
            <p className="text-green-100 text-sm mb-1">Administradores</p>
            <p className="text-4xl font-bold">{usuarios.filter(u => u.rol === 'administrador').length}</p>
            <div className="mt-2 text-xs text-green-100 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Gestión operativa
            </div>
          </div>
        </div>
      </div>

      {/* Nota informativa mejorada */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-5 mb-6 shadow-sm">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 opacity-20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative flex items-start gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Información de Seguridad</h3>
            <p className="text-sm text-blue-800">
              Los usuarios se crean manualmente desde Supabase Dashboard por seguridad. 
              Aquí puedes ver la lista de usuarios activos y cambiar tu propia contraseña.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de usuarios con tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usuarios.map((usuario) => {
          const esDueno = usuario.rol === 'dueno'
          const esUsuarioActual = usuario.id === user.id
          
          return (
            <div 
              key={usuario.id} 
              className={`relative overflow-hidden rounded-xl bg-white border-2 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                esUsuarioActual ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'
              }`}
            >
              {/* Banner superior según rol */}
              <div className={`h-2 bg-gradient-to-r ${
                esDueno ? 'from-yellow-500 to-orange-600' : 'from-emerald-500 to-green-600'
              }`}></div>
              
              {/* Badge usuario actual */}
              {esUsuarioActual && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                    <CheckCircle className="w-3 h-3" />
                    TÚ
                  </div>
                </div>
              )}
              
              <div className="p-6">
                {/* Avatar y rol */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${
                    esDueno 
                      ? 'from-yellow-500 to-orange-600' 
                      : 'from-emerald-500 to-green-600'
                  } shadow-lg`}>
                    {esDueno ? (
                      <Crown className="w-8 h-8 text-white" />
                    ) : (
                      <UserCog className="w-8 h-8 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{usuario.nombre}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      esDueno
                        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800'
                        : 'bg-gradient-to-r from-emerald-100 to-green-100 text-green-800'
                    }`}>
                      {esDueno ? (
                        <><Shield className="w-3 h-3" /> Dueño</>
                      ) : (
                        <><Lock className="w-3 h-3" /> Administrador</>
                      )}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600 mb-1">Correo Electrónico</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{usuario.email}</p>
                </div>

                {/* Fecha de creación */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Creado:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(usuario.created_at).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Privilegios */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Nivel de Acceso:</p>
                  <div className={`p-2 rounded-lg text-center text-xs font-semibold ${
                    esDueno
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                      : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                  }`}>
                    {esDueno ? 'CONTROL TOTAL' : 'GESTIÓN OPERATIVA'}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Cambiar Mi Contraseña - Mejorado */}
      {mostrarModalPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-slideUp">
            {/* Header del Modal con gradiente */}
            <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 p-6 rounded-t-2xl text-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <Key className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">Cambiar Contraseña</h2>
                  <p className="text-primary-100 text-sm mt-1">
                    Usuario: <span className="font-semibold">{user?.nombre}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMostrarModalPassword(false)
                    setNuevaPassword('')
                    setConfirmarPassword('')
                    setMostrarPassword1(false)
                    setMostrarPassword2(false)
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCambiarPassword} className="p-6 space-y-5">
              {/* Alerta de seguridad */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800 flex items-start gap-2">
                  <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Por seguridad, asegúrate de usar una contraseña fuerte con al menos 6 caracteres.</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={mostrarPassword1 ? "text" : "password"}
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    className="input pl-10 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword1(!mostrarPassword1)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarPassword1 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Usa letras, números y caracteres especiales</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={mostrarPassword2 ? "text" : "password"}
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    className="input pl-10 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Repetir contraseña"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword2(!mostrarPassword2)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarPassword2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {nuevaPassword && confirmarPassword && nuevaPassword === confirmarPassword && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Las contraseñas coinciden
                  </p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalPassword(false)
                    setNuevaPassword('')
                    setConfirmarPassword('')
                    setMostrarPassword1(false)
                    setMostrarPassword2(false)
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Key className="w-5 h-5" />
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Usuarios
