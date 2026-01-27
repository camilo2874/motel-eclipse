import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../hooks/usePermissions'
import { 
  Home, 
  Bed, 
  Wallet, 
  Package, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Crown,
  User,
  Calendar,
  Users
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const Layout = () => {
  const { user, signOut } = useAuth()
  const { verDashboard, verHabitaciones, verCaja, verInventario, verUsuarios, verReportes, isDueno, rol } = usePermissions()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fechaHora, setFechaHora] = useState(new Date())

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFechaHora(new Date())
    }, 1000)
    
    return () => clearInterval(intervalo)
  }, [])

  const allMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', permission: verDashboard },
    { path: '/habitaciones', icon: Bed, label: 'Habitaciones', permission: verHabitaciones },
    { path: '/caja', icon: Wallet, label: 'Caja', permission: verCaja },
    { path: '/inventario', icon: Package, label: 'Inventario', permission: verInventario },
    { path: '/usuarios', icon: Users, label: 'Usuarios', permission: verUsuarios },
    { path: '/reportes', icon: BarChart3, label: 'Reportes', permission: verReportes },
  ]

  // Filtrar menú según permisos
  const menuItems = allMenuItems.filter(item => item.permission)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-br from-primary-50 to-purple-50">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Eclipse
              </h1>
              <div className="h-1 w-16 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full mx-auto mt-2"></div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <p className="text-xs font-medium">
                  {format(fechaHora, "EEEE, d 'de' MMMM", { locale: es })}
                </p>
              </div>
              <p className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                {format(fechaHora, 'HH:mm:ss')}
              </p>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Usuario y cerrar sesión */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDueno ? 'bg-yellow-100' : 'bg-primary-100'}`}>
                {isDueno ? (
                  <Crown className="w-5 h-5 text-yellow-600" />
                ) : (
                  <User className="w-5 h-5 text-primary-700" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.nombre || user?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {rol === 'dueno' ? 'Dueño' : 'Administrador'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 md:hidden">
            <div className="flex flex-col h-full">
              <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-br from-primary-50 to-purple-50">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent flex-1 text-center">
                    Eclipse
                  </h1>
                  <button onClick={() => setSidebarOpen(false)} className="ml-2">
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                <div className="h-1 w-16 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full mx-auto mb-4"></div>
                <div className="bg-white rounded-lg shadow-sm p-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <p className="text-xs font-medium">
                      {format(fechaHora, "EEEE, d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                  <p className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                    {format(fechaHora, 'HH:mm:ss')}
                  </p>
                </div>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top bar mobile */}
        <div className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-primary-600">Eclipse</h1>
          <div className="w-6"></div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
