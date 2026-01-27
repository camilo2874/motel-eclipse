import { supabase } from '../lib/supabase'

// Obtener productos del inventario
export const getProductos = async () => {
  try {
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return { data: null, error }
  }
}

// Obtener productos con stock disponible
export const getProductosDisponibles = async () => {
  try {
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .gt('stock_actual', 0)
      .order('nombre', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener productos disponibles:', error)
    return { data: null, error }
  }
}

// Registrar consumo
export const registrarConsumo = async (registroId, productoId, cantidad, precioUnitario) => {
  try {
    const { data, error } = await supabase
      .from('consumos')
      .insert([
        {
          registro_id: registroId,
          producto_id: productoId,
          cantidad,
          precio_unitario: precioUnitario
        }
      ])
      .select(`
        *,
        inventario:producto_id (nombre)
      `)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al registrar consumo:', error)
    return { data: null, error }
  }
}

// Obtener consumos de un registro
export const getConsumosPorRegistro = async (registroId) => {
  try {
    const { data, error } = await supabase
      .from('consumos')
      .select(`
        *,
        inventario:producto_id (nombre, precio_venta)
      `)
      .eq('registro_id', registroId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al obtener consumos:', error)
    return { data: null, error }
  }
}

// Eliminar consumo
export const eliminarConsumo = async (consumoId) => {
  try {
    const { error } = await supabase
      .from('consumos')
      .delete()
      .eq('id', consumoId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error al eliminar consumo:', error)
    return { error }
  }
}

// Crear producto
export const crearProducto = async (producto) => {
  try {
    const { data, error } = await supabase
      .from('inventario')
      .insert([producto])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al crear producto:', error)
    return { data: null, error }
  }
}

// Actualizar producto
export const actualizarProducto = async (id, cambios) => {
  try {
    const { data, error } = await supabase
      .from('inventario')
      .update(cambios)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    return { data: null, error }
  }
}

// Eliminar producto
export const eliminarProducto = async (id) => {
  try {
    // Verificar si el producto tiene consumos asociados
    const { data: consumos, error: consumosError } = await supabase
      .from('consumos')
      .select('id')
      .eq('producto_id', id)
      .limit(1)

    if (consumosError) throw consumosError

    if (consumos && consumos.length > 0) {
      return { 
        error: { 
          message: 'No se puede eliminar este producto porque tiene consumos registrados. Solo puedes eliminar productos que nunca se han usado.' 
        } 
      }
    }

    // Si no hay consumos, eliminar el producto
    const { error } = await supabase
      .from('inventario')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    
    // Mensaje personalizado para error de clave foránea
    if (error.code === '23503') {
      return { 
        error: { 
          message: 'No se puede eliminar este producto porque tiene consumos registrados.' 
        } 
      }
    }
    
    return { error }
  }
}

