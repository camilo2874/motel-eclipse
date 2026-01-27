import { useAuth } from '../contexts/AuthContext'

export const usePermissions = () => {
  const { user } = useAuth()
  
  const isDueno = user?.rol === 'dueno'
  const isAdministrador = user?.rol === 'administrador'
  
  const permissions = {
    // Dashboard - ambos pueden ver
    verDashboard: isDueno || isAdministrador,
    
    // Habitaciones - ambos pueden gestionar
    verHabitaciones: isDueno || isAdministrador,
    gestionarHabitaciones: isDueno || isAdministrador,
    
    // Caja - ambos pueden operar
    verCaja: isDueno || isAdministrador,
    abrirTurno: isDueno || isAdministrador,
    cerrarTurno: isDueno || isAdministrador,
    retirarEfectivo: isDueno || isAdministrador, // Ambos pueden retirar (se registra quién)
    
    // Inventario - solo dueño
    verInventario: isDueno,
    gestionarInventario: isDueno,
    
    // Usuarios - solo dueño
    verUsuarios: isDueno,
    
    // Reportes - solo dueño
    verReportes: isDueno
  }
  
  return {
    ...permissions,
    isDueno,
    isAdministrador,
    rol: user?.rol
  }
}
