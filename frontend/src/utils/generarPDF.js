import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'

export const generarPDFTurno = (datosReporte) => {
  const { turno, registros, consumos, consignaciones, productosResumen } = datosReporte

  // Crear documento PDF
  const doc = new jsPDF()
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  // Configuración de colores profesionales (paleta del logo)
  const primaryColor = [255, 165, 79] // Naranja suave
  const accentColor = [255, 190, 120] // Naranja muy claro
  const dangerColor = [220, 38, 38] // Rojo oscuro
  const lightBg = [250, 250, 250] // Gris muy claro
  const darkText = [30, 30, 30] // Negro suave
  const mediumText = [100, 100, 100] // Gris medio

  let yPosition = 20

  // ===== ENCABEZADO PROFESIONAL =====
  // Gradiente de fondo gris oscuro (para que el logo resalte)
  doc.setFillColor(50, 50, 50)
  doc.rect(0, 0, 210, 50, 'F')
  doc.setFillColor(70, 70, 70)
  doc.rect(0, 35, 210, 15, 'F')
  
  // Logo en esquina superior derecha (proporción cuadrada)
  try {
    const logoImg = new Image()
    logoImg.src = '/logo.png'
    doc.addImage(logoImg, 'PNG', 162, 5, 35, 35)
  } catch (error) {
    console.log('No se pudo cargar el logo')
  }
  
  // Logo/Título principal centrado
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont(undefined, 'bold')
  doc.text('MOTEL ECLIPSE', 105, 22, { align: 'center' })
  
  // Línea decorativa
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.5)
  doc.line(70, 26, 140, 26)
  
  // Subtítulo
  doc.setFontSize(13)
  doc.setFont(undefined, 'normal')
  doc.text('Reporte de Cierre de Turno', 105, 33, { align: 'center' })
  
  // Fecha de generación
  doc.setFontSize(9)
  doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 42, { align: 'center' })

  yPosition = 60

  // ===== INFORMACIÓN DEL TURNO (Tarjeta con borde) =====
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.3)
  doc.setFillColor(...lightBg)
  doc.roundedRect(15, yPosition - 5, 180, 30, 2, 2, 'FD')
  
  doc.setTextColor(...darkText)
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text('Información del Turno', 20, yPosition + 2)
  
  yPosition += 10
  doc.setFontSize(9)
  doc.setFont(undefined, 'normal')
  
  const infoTurno = [
    ['Responsable:', turno.usuario?.nombre || 'N/A'],
    ['ID Turno:', turno.id.substring(0, 13) + '...'],
    ['Fecha Apertura:', format(new Date(turno.fecha_apertura), 'dd/MM/yyyy HH:mm')],
    ['Fecha Cierre:', format(new Date(turno.fecha_cierre), 'dd/MM/yyyy HH:mm')],
  ]

  const col1X = 20
  const col2X = 110

  infoTurno.slice(0, 2).forEach(([label, value], index) => {
    doc.setTextColor(...mediumText)
    doc.setFont(undefined, 'bold')
    doc.text(label, col1X, yPosition)
    doc.setTextColor(...darkText)
    doc.setFont(undefined, 'normal')
    doc.text(value, col1X + 35, yPosition)
    yPosition += 6
  })

  yPosition -= 12
  infoTurno.slice(2, 4).forEach(([label, value], index) => {
    doc.setTextColor(...mediumText)
    doc.setFont(undefined, 'bold')
    doc.text(label, col2X, yPosition)
    doc.setTextColor(...darkText)
    doc.setFont(undefined, 'normal')
    doc.text(value, col2X + 35, yPosition)
    yPosition += 6
  })

  yPosition += 15

  // ===== RESUMEN FINANCIERO (Destacado) =====
  doc.setFillColor(...primaryColor)
  doc.roundedRect(15, yPosition - 5, 180, 8, 1, 1, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(12)
  doc.text('RESUMEN FINANCIERO', 20, yPosition)
  
  yPosition += 12
  doc.setFontSize(10)
  
  const saldoInicial = turno.saldo_inicial || 0
  const ingresos = turno.total_ingresos || 0
  const consignacionesTotal = turno.total_consignaciones || 0
  const saldoFinal = turno.saldo_final || 0

  // Fondo de la sección financiera
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(15, yPosition - 5, 180, 32, 1, 1, 'F')

  const financiero = [
    ['Saldo Inicial', formatCurrency(saldoInicial), mediumText],
    ['(+) Ingresos del Turno', formatCurrency(ingresos), darkText],
    ['(-) Retiros de Efectivo', formatCurrency(consignacionesTotal), dangerColor],
  ]

  financiero.forEach(([label, value, color]) => {
    doc.setTextColor(...darkText)
    doc.setFont(undefined, 'normal')
    doc.text(label, 20, yPosition)
    doc.setTextColor(...color)
    doc.setFont(undefined, 'bold')
    doc.text(value, 190, yPosition, { align: 'right' })
    yPosition += 7
  })

  // Línea separadora elegante
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(1)
  doc.line(20, yPosition, 190, yPosition)
  yPosition += 8

  // Saldo Final destacado
  doc.setFontSize(13)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(...darkText)
  doc.text('Saldo Final', 20, yPosition)
  doc.setTextColor(...darkText)
  doc.setFontSize(16)
  doc.text(formatCurrency(saldoFinal), 190, yPosition, { align: 'right' })

  yPosition += 15

  // ===== HABITACIONES USADAS =====
  if (registros && registros.length > 0) {
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20
    }

    // Encabezado de sección
    doc.setFillColor(...primaryColor)
    doc.roundedRect(15, yPosition - 5, 180, 8, 1, 1, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFont(undefined, 'bold')
    doc.setFontSize(11)
    doc.text(`HABITACIONES USADAS (${registros.length})`, 20, yPosition)
    
    yPosition += 10

    const habitacionesData = registros.map(r => [
      `#${r.habitacion?.numero || 'N/A'}`,
      format(new Date(r.fecha_entrada), 'HH:mm'),
      format(new Date(r.fecha_salida), 'HH:mm'),
      `${r.horas_totales || 0}h`,
      formatCurrency(r.subtotal_habitacion || 0),
      formatCurrency(r.subtotal_consumos || 0),
      formatCurrency(r.total_pagado || 0)
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Hab.', 'Entrada', 'Salida', 'Horas', 'Habitación', 'Consumos', 'Total']],
      body: habitacionesData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkText,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 26, halign: 'center' },
        2: { cellWidth: 26, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 32, halign: 'right' },
        5: { cellWidth: 32, halign: 'right' },
        6: { cellWidth: 34, halign: 'right', fontStyle: 'bold', textColor: darkText }
      },
      margin: { left: 15, right: 15 }
    })

    yPosition = doc.lastAutoTable.finalY + 12
  }

  // ===== PRODUCTOS VENDIDOS =====
  if (productosResumen && productosResumen.length > 0) {
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20
    }

    // Encabezado de sección
    doc.setFillColor(147, 51, 234) // Púrpura
    doc.roundedRect(15, yPosition - 5, 180, 8, 1, 1, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFont(undefined, 'bold')
    doc.setFontSize(11)
    doc.text(`PRODUCTOS VENDIDOS (${productosResumen.length})`, 20, yPosition)
    
    yPosition += 10

    const productosData = productosResumen.map(p => [
      p.nombre || 'N/A',
      p.cantidad || 0,
      formatCurrency(p.total || 0)
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Producto', 'Cantidad', 'Total']],
      body: productosData,
      theme: 'grid',
      headStyles: {
        fillColor: [147, 51, 234],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkText
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        0: { cellWidth: 105 },
        1: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: darkText }
      },
      margin: { left: 15, right: 15 }
    })

    yPosition = doc.lastAutoTable.finalY + 12
  }

  // ===== CONSIGNACIONES (RETIROS DE EFECTIVO) =====
  if (consignaciones && consignaciones.length > 0) {
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20
    }

    // Encabezado de sección
    doc.setFillColor(...dangerColor)
    doc.roundedRect(15, yPosition - 5, 180, 8, 1, 1, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFont(undefined, 'bold')
    doc.setFontSize(11)
    doc.text(`RETIROS DE EFECTIVO (${consignaciones.length})`, 20, yPosition)
    
    yPosition += 10

    const consignacionesData = consignaciones.map(c => [
      format(new Date(c.created_at), 'HH:mm'),
      c.usuario?.nombre || 'N/A',
      formatCurrency(c.monto || 0),
      c.observaciones || '-'
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Hora', 'Usuario', 'Monto', 'Observaciones']],
      body: consignacionesData,
      theme: 'grid',
      headStyles: {
        fillColor: dangerColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: darkText
      },
      alternateRowStyles: {
        fillColor: [254, 242, 242]
      },
      columnStyles: {
        0: { cellWidth: 22, halign: 'center' },
        1: { cellWidth: 42, halign: 'left' },
        2: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: dangerColor },
        3: { cellWidth: 81, halign: 'left' }
      },
      margin: { left: 15, right: 15 }
    })

    yPosition = doc.lastAutoTable.finalY + 10
  }

  // ===== FOOTER PROFESIONAL =====
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Línea superior del footer
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(15, 282, 195, 282)
    
    // Información del footer
    doc.setFontSize(8)
    doc.setTextColor(...mediumText)
    doc.setFont(undefined, 'normal')
    doc.text(`Página ${i} de ${pageCount}`, 105, 287, { align: 'center' })
    
    doc.setFontSize(7)
    doc.setTextColor(...mediumText)
    doc.text('Motel Eclipse - Sistema de Gestión Profesional', 105, 292, { align: 'center' })
  }

  // Guardar PDF
  const nombreArchivo = `Turno_${format(new Date(turno.fecha_cierre), 'yyyyMMdd_HHmmss')}.pdf`
  doc.save(nombreArchivo)

  return nombreArchivo
}

// Generar PDF de estadísticas generales (semanal/mensual)
export const generarPDFEstadisticas = (datosEstadisticas, periodo, fechaInicio, fechaFin) => {
  const { 
    estadisticas, 
    ingresosPorDia, 
    ocupacionHabitaciones, 
    productosVendidos 
  } = datosEstadisticas

  const doc = new jsPDF()

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  // Configuración de colores profesionales (paleta del logo)
  const primaryColor = [255, 165, 79] // Naranja suave
  const accentColor = [255, 190, 120] // Naranja muy claro
  const dangerColor = [220, 38, 38] // Rojo oscuro
  const lightBg = [250, 250, 250] // Gris muy claro
  const darkText = [30, 30, 30] // Negro suave
  const mediumText = [100, 100, 100] // Gris medio

  let yPosition = 20

  // ===== ENCABEZADO PROFESIONAL =====
  doc.setFillColor(50, 50, 50)
  doc.rect(0, 0, 210, 55, 'F')
  doc.setFillColor(70, 70, 70)
  doc.rect(0, 40, 210, 15, 'F')
  
  // Logo en esquina superior derecha (proporción cuadrada)
  try {
    const logoImg = new Image()
    logoImg.src = '/logo.png'
    doc.addImage(logoImg, 'PNG', 162, 5, 35, 35)
  } catch (error) {
    console.log('No se pudo cargar el logo')
  }
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont(undefined, 'bold')
  doc.text('MOTEL ECLIPSE', 105, 22, { align: 'center' })
  
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.5)
  doc.line(70, 26, 140, 26)
  
  doc.setFontSize(14)
  doc.setFont(undefined, 'normal')
  doc.text('Informe de Estadísticas', 105, 34, { align: 'center' })
  
  // Período
  let textoPeriodo = ''
  if (periodo === 'todos') {
    textoPeriodo = 'Período: Histórico Completo'
  } else if (periodo === '7dias') {
    textoPeriodo = 'Período: Últimos 7 días'
  } else if (periodo === '30dias') {
    textoPeriodo = 'Período: Últimos 30 días'
  } else if (fechaInicio && fechaFin) {
    textoPeriodo = `Período: ${format(new Date(fechaInicio), 'dd/MM/yyyy')} - ${format(new Date(fechaFin), 'dd/MM/yyyy')}`
  }
  
  doc.setFontSize(11)
  doc.text(textoPeriodo, 105, 42, { align: 'center' })
  doc.setFontSize(9)
  doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 48, { align: 'center' })

  yPosition = 65

  // ===== RESUMEN GENERAL (Destacado) =====
  doc.setFillColor(...primaryColor)
  doc.roundedRect(15, yPosition - 5, 180, 8, 1, 1, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(12)
  doc.text('RESUMEN GENERAL', 20, yPosition)
  
  yPosition += 12

  // Fondo de la sección
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(15, yPosition - 5, 180, 28, 1, 1, 'F')

  // Cards de métricas (3 columnas)
  const cardWidth = 56
  const cardHeight = 22
  const cardSpacing = 6
  
  // Card 1: Ingresos Totales
  doc.setFillColor(239, 246, 255)
  doc.roundedRect(15, yPosition, cardWidth, cardHeight, 2, 2, 'F')
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(0.3)
  doc.roundedRect(15, yPosition, cardWidth, cardHeight, 2, 2, 'D')
  
  doc.setFontSize(8)
  doc.setTextColor(...mediumText)
  doc.setFont(undefined, 'bold')
  doc.text('Ingresos Totales', 18, yPosition + 6)
  doc.setFontSize(16)
  doc.setTextColor(...darkText)
  doc.text(formatCurrency(estadisticas?.totalIngresos || 0), 18, yPosition + 16)
  
  // Card 2: Total Registros
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(15 + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight, 2, 2, 'F')
  doc.setDrawColor(...accentColor)
  doc.setLineWidth(0.3)
  doc.roundedRect(15 + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight, 2, 2, 'D')
  
  doc.setFontSize(8)
  doc.setTextColor(...mediumText)
  doc.setFont(undefined, 'bold')
  doc.text('Total Registros', 18 + cardWidth + cardSpacing, yPosition + 6)
  doc.setFontSize(16)
  doc.setTextColor(...darkText)
  doc.text(`${estadisticas?.totalReservas || 0}`, 18 + cardWidth + cardSpacing, yPosition + 16)
  
  // Card 3: Promedio Horas
  doc.setFillColor(250, 245, 255)
  doc.roundedRect(15 + (cardWidth + cardSpacing) * 2, yPosition, cardWidth, cardHeight, 2, 2, 'F')
  doc.setDrawColor(147, 51, 234)
  doc.setLineWidth(0.3)
  doc.roundedRect(15 + (cardWidth + cardSpacing) * 2, yPosition, cardWidth, cardHeight, 2, 2, 'D')
  
  doc.setFontSize(8)
  doc.setTextColor(...mediumText)
  doc.setFont(undefined, 'bold')
  doc.text('Promedio Horas', 18 + (cardWidth + cardSpacing) * 2, yPosition + 6)
  doc.setFontSize(16)
  doc.setTextColor(...darkText)
  doc.text(`${(estadisticas?.promedioHoras || 0).toFixed(1)}h`, 18 + (cardWidth + cardSpacing) * 2, yPosition + 16)

  yPosition += cardHeight + 15

  // ===== INGRESOS POR DÍA =====
  if (ingresosPorDia && ingresosPorDia.length > 0) {
    doc.setFillColor(...primaryColor)
    doc.roundedRect(15, yPosition - 5, 180, 8, 1, 1, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text('INGRESOS POR DÍA', 20, yPosition)
    
    yPosition += 10

    const ingresosData = ingresosPorDia.slice(0, 15).map(ing => [
      format(new Date(ing.fecha), 'dd/MM/yyyy'),
      formatCurrency(ing.habitaciones || 0),
      formatCurrency(ing.consumos || 0),
      formatCurrency((ing.habitaciones || 0) + (ing.consumos || 0))
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Fecha', 'Habitaciones', 'Consumos', 'Total']],
      body: ingresosData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkText,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        0: { cellWidth: 40, halign: 'center' },
        1: { cellWidth: 45, halign: 'right' },
        2: { cellWidth: 45, halign: 'right' },
        3: { cellWidth: 45, halign: 'right', fontStyle: 'bold', textColor: darkText }
      },
      margin: { left: 15, right: 15 }
    })

    yPosition = doc.lastAutoTable.finalY + 12
  }

  // ===== HABITACIONES MÁS USADAS =====
  if (ocupacionHabitaciones && ocupacionHabitaciones.length > 0) {
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFillColor(...primaryColor)
    doc.roundedRect(15, yPosition - 5, 180, 8, 1, 1, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFont(undefined, 'bold')
    doc.setFontSize(11)
    doc.text(`HABITACIONES MÁS USADAS (Top ${Math.min(ocupacionHabitaciones.length, 10)})`, 20, yPosition)
    
    yPosition += 10

    const habitacionesData = ocupacionHabitaciones.slice(0, 10).map(hab => [
      `#${hab.numero}`,
      hab.tipo || 'N/A',
      hab.usos || 0,
      `${(hab.horasTotales || 0).toFixed(1)}h`,
      formatCurrency(hab.ingresoTotal || 0)
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Hab.', 'Tipo', 'Usos', 'Horas', 'Ingreso']],
      body: habitacionesData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkText,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 50 },
        2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 45, halign: 'right', fontStyle: 'bold', textColor: darkText }
      },
      margin: { left: 15, right: 15 }
    })

    yPosition = doc.lastAutoTable.finalY + 12
  }

  // ===== PRODUCTOS MÁS VENDIDOS =====
  if (productosVendidos && productosVendidos.length > 0) {
    if (yPosition > 220) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFillColor(147, 51, 234)
    doc.roundedRect(15, yPosition - 5, 180, 8, 1, 1, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFont(undefined, 'bold')
    doc.setFontSize(11)
    doc.text(`PRODUCTOS MÁS VENDIDOS (Top ${Math.min(productosVendidos.length, 10)})`, 20, yPosition)
    
    yPosition += 10

    const productosData = productosVendidos.slice(0, 15).map(prod => [
      prod.nombre || 'N/A',
      prod.categoria || '-',
      prod.cantidad || 0,
      formatCurrency(prod.total || 0)
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Producto', 'Categoría', 'Cantidad', 'Total']],
      body: productosData,
      theme: 'grid',
      headStyles: {
        fillColor: [147, 51, 234],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkText,
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: darkText }
      },
      margin: { left: 15, right: 15 }
    })

    yPosition = doc.lastAutoTable.finalY + 10
  }

  // ===== FOOTER PROFESIONAL =====
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Línea superior del footer
    doc.setDrawColor(...primaryColor)
    doc.setLineWidth(0.5)
    doc.line(15, 282, 195, 282)
    
    // Información del footer
    doc.setFontSize(8)
    doc.setTextColor(...mediumText)
    doc.setFont(undefined, 'normal')
    doc.text(`Página ${i} de ${pageCount}`, 105, 287, { align: 'center' })
    
    doc.setFontSize(7)
    doc.setTextColor(...mediumText)
    doc.text('Motel Eclipse - Sistema de Gestión Profesional', 105, 292, { align: 'center' })
  }

  // Guardar PDF
  let nombreArchivo
  if (periodo === '7dias') {
    nombreArchivo = `Reporte_Semanal_${format(new Date(), 'yyyyMMdd')}.pdf`
  } else if (periodo === '30dias') {
    nombreArchivo = `Reporte_Mensual_${format(new Date(), 'yyyyMMdd')}.pdf`
  } else if (fechaInicio && fechaFin) {
    nombreArchivo = `Reporte_${format(new Date(fechaInicio), 'yyyyMMdd')}_${format(new Date(fechaFin), 'yyyyMMdd')}.pdf`
  } else {
    nombreArchivo = `Reporte_Completo_${format(new Date(), 'yyyyMMdd')}.pdf`
  }
  
  doc.save(nombreArchivo)
  return nombreArchivo
}

