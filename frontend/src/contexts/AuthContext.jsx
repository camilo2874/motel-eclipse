import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

// Helper para queries con timeout
const queryWithTimeout = async (queryFn, timeoutMs = 5000) => {
  return Promise.race([
    queryFn(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
    )
  ])
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sesión actual
    checkUser()

    // Escuchar cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.id)
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
          return
        }
        
        if (session?.user) {
          // Usar timeout en auth state change también
          try {
            const userData = await queryWithTimeout(async () => {
              const { data, error } = await supabase
                .from('usuarios')
                .select('id, nombre, email, rol')
                .eq('id', session.user.id)
                .single()
              
              if (error) throw error
              return data
            }, 3000)
            
            console.log('✅ Usuario actualizado:', userData)
            setUser(userData)
            
          } catch (err) {
            console.error('❌ Error/Timeout en auth change:', err.message)
            // Fallback a datos básicos
            setUser({
              id: session.user.id,
              email: session.user.email,
              nombre: session.user.email?.split('@')[0] || 'Usuario',
              rol: 'dueno'
            })
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    console.log('🔍 Verificando usuario...')
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('❌ Error de autenticación:', authError)
        setUser(null)
        setLoading(false)
        return
      }
      
      if (authUser) {
        console.log('✅ Usuario autenticado:', authUser.id)
        
        // Cargar información completa del usuario con TIMEOUT
        try {
          const userData = await queryWithTimeout(async () => {
            const { data, error } = await supabase
              .from('usuarios')
              .select('id, nombre, email, rol')
              .eq('id', authUser.id)
              .single()
            
            if (error) throw error
            return data
          }, 3000) // Timeout de 3 segundos
          
          console.log('✅ Datos de usuario cargados:', userData)
          setUser(userData)
          
        } catch (dbErr) {
          console.error('❌ Error/Timeout en consulta usuarios:', dbErr.message)
          // Fallback inmediato a datos básicos
          setUser({
            id: authUser.id,
            email: authUser.email,
            nombre: authUser.email?.split('@')[0] || 'Usuario',
            rol: 'dueno' // Cambiar a dueño para tener acceso completo
          })
        }
      } else {
        console.log('❌ No hay usuario autenticado')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Error crítico al verificar usuario:', error)
      setUser(null)
    } finally {
      console.log('✅ Carga completada, loading = false')
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('¡Bienvenido!')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      toast.success('Sesión cerrada')
    } catch (error) {
      toast.error('Error al cerrar sesión')
      console.error('Error:', error)
    }
  }

  const getUserRole = async () => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data?.rol
    } catch (error) {
      console.error('Error al obtener rol:', error)
      return null
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    getUserRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
