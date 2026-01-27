import { supabase } from '../lib/supabase'

// Obtener productos con stock bajo
export const getProductosBajoStock = async () => {
  try {
    const { data, error } = await supabase
      .from('inventario')
      .select('stock_actual, stock_minimo')
      .eq('activo', true)

    if (error) throw error

    const bajoStock = data.filter(p => p.stock_actual <= p.stock_minimo).length

    return { data: bajoStock, error: null }
  } catch (error) {
    console.error('Error al obtener productos bajo stock:', error)
    return { data: 0, error }
  }
}
