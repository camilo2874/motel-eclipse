# CAPÍTULO 7: PRUEBAS Y VALIDACIÓN

## 7.1 Estrategia de Pruebas

El sistema fue sometido a diferentes tipos de pruebas para garantizar su correcto funcionamiento y calidad:

### 7.1.1 Tipos de Pruebas Realizadas

1. **Pruebas Unitarias**: Validación de funciones individuales
2. **Pruebas de Integración**: Verificación de comunicación entre componentes
3. **Pruebas Funcionales**: Validación de casos de uso completos
4. **Pruebas de Usabilidad**: Evaluación de experiencia de usuario
5. **Pruebas de Seguridad**: Verificación de autenticación y autorización
6. **Pruebas de Rendimiento**: Evaluación de tiempos de respuesta

## 7.2 Pruebas Funcionales por Módulo

### 7.2.1 Módulo de Autenticación

| Caso de Prueba | Resultado Esperado | Estado |
|----------------|-------------------|--------|
| Login con credenciales válidas | Usuario autenticado, redirección a dashboard | ✅ Exitoso |
| Login con email inválido | Mensaje de error, mantener en login | ✅ Exitoso |
| Login con contraseña incorrecta | Mensaje de error específico | ✅ Exitoso |
| Acceso a ruta protegida sin sesión | Redirección automática a login | ✅ Exitoso |
| Token JWT expirado | Cierre de sesión automático | ✅ Exitoso |
| Logout exitoso | Limpieza de sesión, redirección a login | ✅ Exitoso |

### 7.2.2 Módulo de Turnos (Caja)

| Caso de Prueba | Resultado Esperado | Estado |
|----------------|-------------------|--------|
| Abrir turno sin saldo | Turno creado con saldo inicial 0 | ✅ Exitoso |
| Abrir turno con saldo personalizado | Consignación automática si hay diferencia | ✅ Exitoso |
| Abrir turno con uno ya abierto | Error: "Ya tienes un turno abierto" | ✅ Exitoso |
| Registrar consignación manual | Monto descontado del saldo, registro creado | ✅ Exitoso |
| Cerrar turno con cálculos | Totales correctos, PDF generado | ✅ Exitoso |
| Cerrar turno sin tener uno abierto | Error: "No hay turno abierto" | ✅ Exitoso |

**Caso de prueba detallado:**

```
ESCENARIO: Abrir turno con saldo personalizado
PRECONDICIONES: 
  - Usuario autenticado
  - Turno anterior cerrado con saldo final $500,000

PASOS:
1. Click en "Abrir Turno"
2. Sistema muestra saldo heredado: $500,000
3. Usuario ingresa saldo personalizado: $300,000
4. Sistema muestra alerta: "Se creará retiro de $200,000"
5. Usuario confirma apertura

RESULTADO ESPERADO:
- Turno creado con saldo_inicial = $300,000
- Consignación creada:
  * monto = $200,000
  * observaciones = "Ajuste automático de apertura: Retiro..."
- Toast de confirmación
- Vista de caja actualizada

RESULTADO OBTENIDO: ✅ Cumple todas las condiciones
```

### 7.2.3 Módulo de Habitaciones

| Caso de Prueba | Resultado Esperado | Estado |
|----------------|-------------------|--------|
| Check-in en habitación disponible | Estado → ocupada, registro creado | ✅ Exitoso |
| Check-in en habitación ocupada | Error: "Habitación no disponible" | ✅ Exitoso |
| Agregar consumo a registro activo | Stock reducido, subtotal actualizado | ✅ Exitoso |
| Check-out con cálculo de tarifa | Cálculo correcto según horas, habitación → limpieza | ✅ Exitoso |
| Check-out con minutos de gracia | No cobra hora extra si está dentro del margen | ✅ Exitoso |
| Cambio de estado manual | Estado actualizado correctamente | ✅ Exitoso |

**Caso de prueba detallado:**

```
ESCENARIO: Check-out con cálculo de tarifa base + horas extras
PRECONDICIONES:
  - Habitación #1 (Normal, $80,000 base, $7,000/hora extra)
  - Check-in: 01/01/2026 08:00
  - Tarifa: 12 horas base, 15 min gracia

PASOS:
1. Check-out: 01/01/2026 21:30 (13.5 horas)
2. Sistema calcula:
   - Tiempo: 13.5 horas
   - Base: 12 horas + 0.25 gracia = 12.25 horas
   - Extra: 13.5 - 12.25 = 1.25 horas
   - Subtotal habitación: $80,000 + (1.25 × $7,000) = $88,750
3. Usuario confirma

RESULTADO ESPERADO:
- subtotal_habitacion = $88,750
- horas_totales = 13.5
- Estado habitación → limpieza

RESULTADO OBTENIDO: ✅ Cálculo exacto
```

### 7.2.4 Módulo de Inventario

| Caso de Prueba | Resultado Esperado | Estado |
|----------------|-------------------|--------|
| Crear producto nuevo | Producto guardado en BD | ✅ Exitoso |
| Crear producto con precio negativo | Error de validación | ✅ Exitoso |
| Entrada de stock | Stock incrementado, movimiento registrado | ✅ Exitoso |
| Salida de stock mayor al disponible | Error: "Stock insuficiente" | ✅ Exitoso |
| Alerta de stock bajo | Indicador visual en dashboard y listado | ✅ Exitoso |
| Consumo reduce stock automáticamente | Stock actualizado al agregar a registro | ✅ Exitoso |

### 7.2.5 Módulo de Reportes

| Caso de Prueba | Resultado Esperado | Estado |
|----------------|-------------------|--------|
| Generar PDF de turno | PDF descargado con datos correctos | ✅ Exitoso |
| Reporte por periodo (1 mes) | Estadísticas calculadas correctamente | ✅ Exitoso |
| Logo en PDF | Logo visible en esquina superior derecha | ✅ Exitoso |
| Tablas con muchos datos | Paginación automática en PDF | ✅ Exitoso |
| PDF sin datos | Mensaje "Sin datos para el periodo" | ✅ Exitoso |

### 7.2.6 Módulo de Usuarios (Solo Dueño)

| Caso de Prueba | Resultado Esperado | Estado |
|----------------|-------------------|--------|
| Acceso con rol administrador | Error 403: Acceso denegado | ✅ Exitoso |
| Crear usuario con email duplicado | Error: "Email ya existe" | ✅ Exitoso |
| Desactivar usuario | Usuario no puede iniciar sesión | ✅ Exitoso |
| Cambiar rol de usuario | Permisos actualizados en siguiente login | ✅ Exitoso |

## 7.3 Pruebas de Seguridad

### 7.3.1 Autenticación y Autorización

| Vulnerabilidad | Prueba Realizada | Resultado |
|----------------|------------------|-----------|
| Acceso sin token | Petición sin header Authorization | ✅ Bloqueado (401) |
| Token inválido | Token modificado manualmente | ✅ Rechazado |
| Token expirado | Token > 1 hora de antigüedad | ✅ Renovación requerida |
| Escalada de privilegios | Admin intenta acceder a /usuarios | ✅ Bloqueado (403) |
| Inyección SQL | Input con comillas y comandos SQL | ✅ Sanitizado |

### 7.3.2 Validación de Datos

| Campo | Validación | Prueba | Resultado |
|-------|-----------|--------|-----------|
| Email | Formato válido | `admin@test` | ✅ Rechazado |
| Contraseña | Mínimo 6 caracteres | `123` | ✅ Rechazado |
| Precio | Número positivo | `-100` | ✅ Rechazado |
| Stock | Entero >= 0 | `1.5` o `-5` | ✅ Rechazado |
| Fecha | No futura | `2027-01-01` | ✅ Rechazado |

### 7.3.3 Protección contra Ataques

**Brute Force:**
- Rate limiting: 100 requests / 15 minutos por IP
- Prueba: 150 intentos de login en 5 minutos
- Resultado: ✅ Bloqueado temporalmente

**XSS (Cross-Site Scripting):**
- Prueba: Input `<script>alert('XSS')</script>` en observaciones
- Resultado: ✅ Escapado automáticamente por React

**CSRF (Cross-Site Request Forgery):**
- Tokens en headers (no cookies)
- SameSite cookies
- Resultado: ✅ Protegido

## 7.4 Pruebas de Rendimiento

### 7.4.1 Tiempo de Respuesta del Backend

| Endpoint | Método | Promedio | Máximo | Estado |
|----------|--------|----------|--------|--------|
| /api/auth/login | POST | 180ms | 250ms | ✅ Aceptable |
| /api/habitaciones | GET | 45ms | 80ms | ✅ Excelente |
| /api/registros/activos | GET | 60ms | 120ms | ✅ Bueno |
| /api/reportes/estadisticas | GET | 340ms | 580ms | ✅ Aceptable |
| /api/inventario | GET | 35ms | 70ms | ✅ Excelente |

### 7.4.2 Tiempo de Carga del Frontend

| Métrica | Tiempo | Estado |
|---------|--------|--------|
| First Contentful Paint (FCP) | 0.8s | ✅ Bueno |
| Largest Contentful Paint (LCP) | 1.2s | ✅ Bueno |
| Time to Interactive (TTI) | 1.5s | ✅ Aceptable |
| Tamaño bundle (gzip) | 245KB | ✅ Optimizado |

### 7.4.3 Consultas a Base de Datos

**Consulta sin índice:**
```sql
SELECT * FROM registros WHERE finalizado = false;
Tiempo: 45ms (Seq Scan)
```

**Consulta con índice:**
```sql
-- Con idx_registros_finalizado
SELECT * FROM registros WHERE finalizado = false;
Tiempo: 5ms (Index Scan)
Mejora: 9x más rápida ✅
```

## 7.5 Pruebas de Usabilidad

### 7.5.1 Evaluación con Usuarios Reales

Se realizaron pruebas con 3 usuarios del personal del Motel Eclipse:

**Participante 1 - Administrador con experiencia básica en computadoras**
- ✅ Pudo abrir turno sin ayuda
- ✅ Realizó check-in y check-out correctamente
- ⚠️ Duda inicial sobre consignación (resuelto con tooltip)
- ✅ Cerrar turno y ver reporte fue intuitivo

**Participante 2 - Dueño del negocio**
- ✅ Navegación clara entre módulos
- ✅ Reportes estadísticos útiles para decisiones
- ✅ PDF con logo profesional
- Sugerencia: Agregar gráficos (implementado)

**Participante 3 - Nuevo empleado sin experiencia**
- ⚠️ Confusión inicial con estados de habitación (agregadas leyendas)
- ✅ Después de 10 minutos operó con confianza
- ✅ Mensajes de error claros
- ✅ Diseño atractivo y profesional

### 7.5.2 Métricas de Usabilidad

| Criterio | Calificación | Observación |
|----------|--------------|-------------|
| Facilidad de aprendizaje | 4.5/5 | Personal aprende en < 30 min |
| Eficiencia | 5/5 | Tareas completadas rápidamente |
| Satisfacción | 4.7/5 | Interfaz agradable y profesional |
| Errores | 4.3/5 | Pocos errores después de capacitación |
| Memorabilidad | 4.8/5 | Fácil recordar tras días sin uso |

## 7.6 Bugs Encontrados y Resueltos

### 7.6.1 Bug Crítico: Habitaciones en $0

**Problema:**
```
En reportes estadísticos, habitaciones mostraban $0 en ingresos
```

**Causa:**
```javascript
// La consulta no incluía total_pagado
SELECT habitacion_id, COUNT(*) as cantidad_usos
FROM registros
GROUP BY habitacion_id
```

**Solución:**
```javascript
// Agregado total_pagado y acumulación
SELECT habitacion_id, COUNT(*) as cantidad_usos, 
       SUM(total_pagado) as total_pagado
FROM registros
GROUP BY habitacion_id

// En backend:
ocupacionPorHab[habId].ingresoTotal += Number(registro.total_pagado) || 0;
```

**Estado:** ✅ Resuelto

### 7.6.2 Bug Visual: Modal de Reporte No Se Cierra

**Problema:**
```
Modal de cierre de turno muy largo, botón X no visible 
sin hacer zoom out del navegador
```

**Causa:**
```jsx
// Div de contenido sin altura máxima
<div className="p-6 space-y-6 print:p-8">
  {/* Contenido largo */}
</div>
```

**Solución:**
```jsx
// Agregado max-height y overflow
<div className="p-6 space-y-6 print:p-8 max-h-[70vh] overflow-y-auto">
  {/* Contenido largo */}
</div>

// + Botón cerrar al final
<div className="flex justify-end p-6 border-t print:hidden">
  <button onClick={onClose}>Cerrar</button>
</div>
```

**Estado:** ✅ Resuelto

### 7.6.3 Bug de Formato: Emojis en PDF

**Problema:**
```
Emojis (💰, 🏠, etc.) en títulos de secciones del PDF 
se mostraban como símbolos extraños o fórmulas
```

**Causa:**
```
jsPDF no soporta emojis Unicode nativamente
```

**Solución:**
```javascript
// Antes:
doc.text('💰 Resumen Financiero', ...)

// Después:
doc.text('Resumen Financiero', ...)
```

**Estado:** ✅ Resuelto

## 7.7 Pruebas de Regresión

Después de cada corrección de bugs, se ejecutó suite completa de pruebas funcionales para garantizar que no se introdujeron nuevos errores:

✅ Autenticación: 6/6 casos pasados
✅ Turnos: 6/6 casos pasados
✅ Habitaciones: 6/6 casos pasados
✅ Inventario: 6/6 casos pasados
✅ Reportes: 5/5 casos pasados
✅ Usuarios: 4/4 casos pasados

**Total: 33/33 pruebas exitosas (100%)**

---
