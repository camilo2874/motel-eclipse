import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import { rateLimit } from 'express-rate-limit'

// Configuración
dotenv.config()

// Importar rutas
import authRoutes from './routes/auth.routes.js'
import habitacionesRoutes from './routes/habitaciones.routes.js'
import registrosRoutes from './routes/registros.routes.js'
import inventarioRoutes from './routes/inventario.routes.js'
import cajaRoutes from './routes/caja.routes.js'
import reportesRoutes from './routes/reportes.routes.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware de seguridad
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por IP
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
})
app.use('/api/', limiter)

// Middleware general
app.use(compression())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check (para UptimeRobot)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// Rutas de la API
app.use('/api/auth', authRoutes)
app.use('/api/habitaciones', habitacionesRoutes)
app.use('/api/registros', registrosRoutes)
app.use('/api/inventario', inventarioRoutes)
app.use('/api/caja', cajaRoutes)
app.use('/api/reportes', reportesRoutes)

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API Motel Eclipse',
    version: '1.0.0',
    status: 'running'
  })
})

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`)
  console.log(`🌍 Entorno: ${process.env.NODE_ENV}`)
  console.log(`🏨 API Motel Eclipse lista`)
})

export default app
