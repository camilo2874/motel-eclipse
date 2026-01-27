import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

// Páginas
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Habitaciones from './pages/Habitaciones'
import Caja from './pages/Caja'
import Inventario from './pages/Inventario'
import Usuarios from './pages/Usuarios'
import Reportes from './pages/Reportes'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/habitaciones" element={<Habitaciones />} />
              <Route path="/caja" element={<Caja />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/reportes" element={<Reportes />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
