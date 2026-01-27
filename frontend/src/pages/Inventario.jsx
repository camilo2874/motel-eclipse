import { useState, useEffect } from 'react'
import { Package, Plus, Search, Edit2, Trash2, AlertCircle, Loader2, TrendingDown, TrendingUp, DollarSign, Archive, ShoppingCart } from 'lucide-react'
import { getProductos, crearProducto, actualizarProducto, eliminarProducto } from '../services/consumos.service'
import toast from 'react-hot-toast'

const Inventario = () => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Bebidas',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: ''
  })

  const categorias = ['Bebidas', 'Snacks', 'Condones', 'Cigarrillos', 'Varios']

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    setLoading(true)
    const { data } = await getProductos()
    if (data) setProductos(data)
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const productoData = {
      nombre: formData.nombre,
      categoria: formData.categoria,
      precio_venta: parseFloat(formData.precio_venta),
      stock_actual: parseInt(formData.stock_actual),
      stock_minimo: parseInt(formData.stock_minimo)
    }

    if (productoEditando) {
      const { error } = await actualizarProducto(productoEditando.id, productoData)
      if (error) {
        toast.error('Error al actualizar producto')
      } else {
        toast.success('Producto actualizado')
      }
    } else {
      const { error } = await crearProducto(productoData)
      if (error) {
        toast.error('Error al crear producto')
      } else {
        toast.success('Producto creado')
      }
    }

    cargarProductos()
    cerrarModal()
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    
    const { error } = await eliminarProducto(id)
    if (error) {
      // Usar el mensaje personalizado del servicio
      toast.error(error.message || 'Error al eliminar producto')
    } else {
      toast.success('Producto eliminado')
      cargarProductos()
    }
  }

  const abrirModalEditar = (producto) => {
    setProductoEditando(producto)
    setFormData({
      nombre: producto.nombre || '',
      categoria: producto.categoria || 'Bebidas',
      precio_venta: producto.precio_venta ? producto.precio_venta.toString() : '',
      stock_actual: producto.stock_actual ? producto.stock_actual.toString() : '0',
      stock_minimo: producto.stock_minimo ? producto.stock_minimo.toString() : '5'
    })
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setProductoEditando(null)
    setFormData({
      nombre: '',
      categoria: 'Bebidas',
      precio_venta: '',
      stock_actual: '',
      stock_minimo: ''
    })
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria && p.categoria.toLowerCase().includes(busqueda.toLowerCase()))
  )

  // Calcular estadísticas
  const totalProductos = productos.length
  const productosConStockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo).length
  const valorTotalInventario = productos.reduce((total, p) => total + (p.precio_venta * p.stock_actual), 0)
  const totalUnidades = productos.reduce((total, p) => total + p.stock_actual, 0)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0)
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
          <h1 className="text-3xl font-bold text-gray-900">Inventario de Productos</h1>
          <p className="text-gray-600 mt-1">Gestión y control de productos y stock</p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Productos */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Productos</p>
            <p className="text-3xl font-bold">{totalProductos}</p>
            <div className="mt-2 text-xs text-blue-100 flex items-center gap-1">
              <Archive className="w-3 h-3" />
              Diferentes referencias
            </div>
          </div>
        </div>

        {/* Productos con Stock Bajo */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-red-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <TrendingDown className="w-6 h-6" />
              </div>
              {productosConStockBajo > 0 && (
                <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold animate-pulse">
                  ¡ALERTA!
                </span>
              )}
            </div>
            <p className="text-red-100 text-sm mb-1">Stock Bajo</p>
            <p className="text-3xl font-bold">{productosConStockBajo}</p>
            <div className="mt-2 text-xs text-red-100 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Requieren reposición
            </div>
          </div>
        </div>

        {/* Valor Total del Inventario */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-green-100 text-sm mb-1">Valor Total</p>
            <p className="text-2xl font-bold">{formatCurrency(valorTotalInventario)}</p>
            <div className="mt-2 text-xs text-green-100 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Capital en productos
            </div>
          </div>
        </div>

        {/* Total Unidades */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>
            <p className="text-purple-100 text-sm mb-1">Total Unidades</p>
            <p className="text-3xl font-bold">{totalUnidades}</p>
            <div className="mt-2 text-xs text-purple-100 flex items-center gap-1">
              <Package className="w-3 h-3" />
              Suma de todo el stock
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar productos..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Lista de productos */}
      {productosFiltrados.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay productos
          </h3>
          <p className="text-gray-600 mb-6">
            {busqueda ? 'No se encontraron productos con ese criterio' : 'Agrega tu primer producto al inventario'}
          </p>
          {!busqueda && (
            <button
              onClick={() => setMostrarModal(true)}
              className="btn btn-primary"
            >
              Agregar Producto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosFiltrados.map(producto => {
            const stockBajo = producto.stock_actual <= producto.stock_minimo
            const porcentajeStock = Math.min((producto.stock_actual / (producto.stock_minimo * 3)) * 100, 100)
            
            // Colores según categoría
            const coloresCategoria = {
              'Bebidas': 'from-blue-500 to-cyan-500',
              'Snacks': 'from-orange-500 to-amber-500',
              'Condones': 'from-pink-500 to-rose-500',
              'Cigarrillos': 'from-gray-600 to-slate-700',
              'Varios': 'from-purple-500 to-indigo-500'
            }
            
            const gradienteCategoria = coloresCategoria[producto.categoria] || 'from-gray-500 to-gray-600'
            
            return (
              <div 
                key={producto.id} 
                className="relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {/* Banner superior con gradiente según categoría */}
                <div className={`h-2 bg-gradient-to-r ${gradienteCategoria}`}></div>
                
                {/* Alerta de stock bajo */}
                {stockBajo && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      ¡BAJO!
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  {/* Nombre y categoría */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{producto.nombre}</h3>
                    {producto.categoria && (
                      <div className="inline-flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradienteCategoria}`}></div>
                        <span className="text-xs font-medium text-gray-600">
                          {producto.categoria}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Precio destacado */}
                  <div className={`p-4 rounded-lg bg-gradient-to-br ${gradienteCategoria} mb-4`}>
                    <p className="text-white text-opacity-90 text-xs mb-1">Precio de Venta</p>
                    <p className="text-white text-2xl font-bold flex items-center gap-1">
                      {formatCurrency(producto.precio_venta)}
                    </p>
                  </div>

                  {/* Stock con barra de progreso */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Stock Disponible</span>
                      <span className={`text-lg font-bold ${stockBajo ? 'text-red-600' : 'text-green-600'}`}>
                        {producto.stock_actual}
                      </span>
                    </div>
                    
                    {/* Barra de progreso de stock */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          stockBajo 
                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-600'
                        }`}
                        style={{ width: `${porcentajeStock}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo requerido: {producto.stock_minimo} unidades
                    </p>
                  </div>

                  {/* Valor total en stock */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 mb-1">Valor en Inventario</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(producto.precio_venta * producto.stock_actual)}
                    </p>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirModalEditar(producto)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all shadow-md"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="font-medium">Editar</span>
                    </button>
                    <button
                      onClick={() => handleEliminar(producto.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Crear/Editar Producto */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto transform animate-slideUp">
            {/* Header del Modal con gradiente */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 p-6 rounded-t-2xl text-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
                  </h3>
                  <p className="text-primary-100 text-sm">
                    {productoEditando ? 'Actualiza la información del producto' : 'Agrega un nuevo producto al inventario'}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="input focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Ej: Coca Cola 400ml"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría *
                </label>
                <div className="relative">
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="input appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    required
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Precio de Venta *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({...formData, precio_venta: e.target.value})}
                    className="input pl-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    min="0"
                    step="100"
                    placeholder="5000"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Precio en pesos colombianos (COP)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Actual *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.stock_actual}
                      onChange={(e) => setFormData({...formData, stock_actual: e.target.value})}
                      className="input pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      min="0"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Mínimo *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.stock_minimo}
                      onChange={(e) => setFormData({...formData, stock_minimo: e.target.value})}
                      className="input pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      min="0"
                      placeholder="5"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                >
                  {productoEditando ? '✓ Actualizar' : '+ Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventario
