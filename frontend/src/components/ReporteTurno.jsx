import { format } from 'date-fns'
import { X, Printer, Download, DollarSign, Clock, ShoppingCart, TrendingDown, FileText } from 'lucide-react'
import { generarPDFTurno } from '../utils/generarPDF'
import toast from 'react-hot-toast'

const ReporteTurno = ({ turnoId, datosReporte, onClose }) => {
  const { turno, registros, consumos, consignaciones, productosResumen } = datosReporte

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  const handleImprimir = () => {
    window.print()
  }

  const handleGenerarPDF = () => {
    try {
      const nombreArchivo = generarPDFTurno(datosReporte)
      toast.success(`PDF generado: ${nombreArchivo}`)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      toast.error('Error al generar PDF')
    }
  }

  const handleCopiar = () => {
    const texto = generarTextoReporte()
    navigator.clipboard.writeText(texto)
    alert('Reporte copiado al portapapeles')
  }

  const generarTextoReporte = () => {
    let texto = `
═══════════════════════════════════════════
         MOTEL ECLIPSE
      REPORTE DE CIERRE DE TURNO
═══════════════════════════════════════════

Turno ID: ${turno.id.substring(0, 8)}
Responsable: ${turno.usuario.nombre}
Apertura: ${format(new Date(turno.fecha_apertura), 'dd/MM/yyyy HH:mm')}
Cierre: ${format(new Date(turno.fecha_cierre), 'dd/MM/yyyy HH:mm')}

───────────────────────────────────────────
  RESUMEN FINANCIERO
───────────────────────────────────────────

Saldo Inicial:        ${formatCurrency(turno.saldo_inicial)}
(+) Ingresos:         ${formatCurrency(turno.total_ingresos)}
(-) Consignaciones:   ${formatCurrency(turno.total_consignaciones)}
─────────────────────────────────────────
Saldo Final:          ${formatCurrency(turno.saldo_final)}

───────────────────────────────────────────
  HABITACIONES USADAS (${registros.length})
───────────────────────────────────────────
${registros.map(r => `
Hab. ${r.habitacion.numero} (${r.habitacion.tipo})
  Entrada:  ${format(new Date(r.fecha_entrada), 'HH:mm')}
  Salida:   ${format(new Date(r.fecha_salida), 'HH:mm')}
  Horas:    ${r.horas_totales}h
  Subtotal: ${formatCurrency(r.subtotal_habitacion)}
  Consumos: ${formatCurrency(r.subtotal_consumos)}
  Total:    ${formatCurrency(r.total_pagado)}
`).join('\n')}

───────────────────────────────────────────
  PRODUCTOS VENDIDOS (${productosResumen.length})
───────────────────────────────────────────
${productosResumen.map(p => `
${p.nombre}
  Cantidad: ${p.cantidad}
  Total:    ${formatCurrency(p.total)}
`).join('\n')}

${consignaciones.length > 0 ? `───────────────────────────────────────────
  CONSIGNACIONES (${consignaciones.length})
───────────────────────────────────────────
${consignaciones.map(c => `
Hora:     ${format(new Date(c.created_at), 'HH:mm')}
Monto:    ${formatCurrency(c.monto)}
Usuario:  ${c.usuario.nombre}
${c.observaciones ? `Obs:      ${c.observaciones}` : ''}
`).join('\n')}` : ''}

═══════════════════════════════════════════
Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}
═══════════════════════════════════════════
    `
    return texto
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reporte de Cierre</h2>
            <p className="text-sm text-gray-600 mt-1">Turno finalizado</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerarPDF}
              className="btn btn-success btn-sm flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleCopiar}
              className="btn btn-secondary btn-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Copiar
            </button>
            <button
              onClick={handleImprimir}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 print:p-8 max-h-[70vh] overflow-y-auto">
          {/* Encabezado de impresión */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-3xl font-bold">MOTEL ECLIPSE</h1>
            <p className="text-lg">Reporte de Cierre de Turno</p>
            <p className="text-sm text-gray-600 mt-2">
              {format(new Date(turno.fecha_cierre), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>

          {/* Información del turno */}
          <div className="card bg-blue-50">
            <h3 className="font-semibold text-gray-900 mb-3">Información del Turno</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Responsable</p>
                <p className="font-semibold">{turno.usuario.nombre}</p>
              </div>
              <div>
                <p className="text-gray-600">Apertura</p>
                <p className="font-semibold">
                  {format(new Date(turno.fecha_apertura), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Cierre</p>
                <p className="font-semibold">
                  {format(new Date(turno.fecha_cierre), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Duración</p>
                <p className="font-semibold">
                  {Math.floor((new Date(turno.fecha_cierre) - new Date(turno.fecha_apertura)) / (1000 * 60 * 60))}h
                </p>
              </div>
            </div>
          </div>

          {/* Resumen Financiero */}
          <div className="card bg-green-50">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Resumen Financiero
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-green-200">
                <span className="text-gray-700">Saldo Inicial</span>
                <span className="font-semibold text-lg">{formatCurrency(turno.saldo_inicial)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-green-200">
                <span className="text-gray-700">Ingresos del Turno</span>
                <span className="font-semibold text-lg text-green-600">
                  + {formatCurrency(turno.total_ingresos)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-green-200">
                <span className="text-gray-700">Consignaciones</span>
                <span className="font-semibold text-lg text-red-600">
                  - {formatCurrency(turno.total_consignaciones)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xl font-bold">Saldo Final</span>
                <span className="text-3xl font-bold text-primary-600">
                  {formatCurrency(turno.saldo_final)}
                </span>
              </div>
            </div>
          </div>

          {/* Habitaciones Usadas */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Habitaciones Usadas ({registros.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Hab.</th>
                    <th className="px-4 py-2 text-left">Entrada</th>
                    <th className="px-4 py-2 text-left">Salida</th>
                    <th className="px-4 py-2 text-right">Horas</th>
                    <th className="px-4 py-2 text-right">Habitación</th>
                    <th className="px-4 py-2 text-right">Consumos</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {registros.map(registro => (
                    <tr key={registro.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-semibold">#{registro.habitacion.numero}</td>
                      <td className="px-4 py-2">
                        {format(new Date(registro.fecha_entrada), 'HH:mm')}
                      </td>
                      <td className="px-4 py-2">
                        {format(new Date(registro.fecha_salida), 'HH:mm')}
                      </td>
                      <td className="px-4 py-2 text-right">{registro.horas_totales}h</td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency(registro.subtotal_habitacion)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency(registro.subtotal_consumos)}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-primary-600">
                        {formatCurrency(registro.total_pagado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan="4" className="px-4 py-2">TOTAL</td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(registros.reduce((sum, r) => sum + Number(r.subtotal_habitacion), 0))}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(registros.reduce((sum, r) => sum + Number(r.subtotal_consumos), 0))}
                    </td>
                    <td className="px-4 py-2 text-right text-primary-600">
                      {formatCurrency(registros.reduce((sum, r) => sum + Number(r.total_pagado), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Productos Vendidos */}
          {productosResumen.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Productos Vendidos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {productosResumen.map((producto, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      {producto.categoria && (
                        <p className="text-xs text-gray-600">{producto.categoria}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">
                        {formatCurrency(producto.total)}
                      </p>
                      <p className="text-xs text-gray-600">{producto.cantidad} unidades</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="font-bold">Total Consumos</span>
                <span className="text-xl font-bold text-primary-600">
                  {formatCurrency(productosResumen.reduce((sum, p) => sum + p.total, 0))}
                </span>
              </div>
            </div>
          )}

          {/* Consignaciones */}
          {consignaciones.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Consignaciones ({consignaciones.length})
              </h3>
              <div className="space-y-2">
                {consignaciones.map(consig => (
                  <div key={consig.id} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{format(new Date(consig.created_at), 'HH:mm')}</p>
                      <p className="text-xs text-gray-600">{consig.usuario.nombre}</p>
                      {consig.observaciones && (
                        <p className="text-xs text-gray-500 mt-1">{consig.observaciones}</p>
                      )}
                    </div>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(consig.monto)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones */}
          {turno.observaciones && (
            <div className="card bg-yellow-50">
              <h3 className="font-semibold text-gray-900 mb-2">Observaciones</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{turno.observaciones}</p>
            </div>
          )}
        </div>

        {/* Footer con botón cerrar */}
        <div className="flex justify-end p-6 border-t print:hidden">
          <button
            onClick={onClose}
            className="btn btn-secondary px-6"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReporteTurno
