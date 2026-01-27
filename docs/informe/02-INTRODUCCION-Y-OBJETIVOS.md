# CAPÍTULO 1: INTRODUCCIÓN

## 1.1 Contexto del Proyecto

El Motel Eclipse es un establecimiento de alojamiento por horas ubicado en [ciudad], que ofrece servicios de hospedaje temporal con 11 habitaciones de diferentes categorías (normales, con máquina del amor y suites). Como la mayoría de negocios de este sector, enfrenta desafíos operativos relacionados con la gestión manual de procesos críticos.

### 1.1.1 Situación Actual

Antes de la implementación del sistema, el Motel Eclipse operaba mediante procesos manuales:

- **Turnos de caja**: Registrados en cuadernos físicos con cálculos manuales
- **Control de habitaciones**: Tablero físico para marcar disponibilidad
- **Inventario**: Revisión manual sin alertas de reabastecimiento
- **Reportes**: Inexistentes o generados manualmente con alto margen de error

Esta modalidad generaba:
- Errores frecuentes en cálculos de tarifas
- Imposibilidad de auditoría histórica
- Desabastecimiento de productos críticos
- Dificultad para detectar inconsistencias financieras
- Falta de información para decisiones estratégicas

### 1.1.2 Necesidad del Sistema

La gerencia del Motel Eclipse identificó la necesidad de modernizar sus operaciones mediante un sistema digital que permita:

1. **Automatizar cálculos**: Eliminar errores humanos en facturación y cierres de caja
2. **Centralizar información**: Una única fuente de verdad para todos los datos del negocio
3. **Generar reportes**: Análisis estadísticos para identificar patrones y oportunidades
4. **Controlar inventario**: Alertas proactivas para prevenir desabastecimiento
5. **Auditar operaciones**: Trazabilidad completa de movimientos financieros

## 1.2 Justificación

### 1.2.1 Justificación Empresarial

La implementación de este sistema es crítica para:

- **Competitividad**: Negocios similares están adoptando tecnología para optimizar operaciones
- **Rentabilidad**: Reducción de pérdidas por errores humanos y desabastecimiento
- **Escalabilidad**: Infraestructura preparada para crecimiento futuro
- **Cumplimiento**: Registros auditables para requerimientos fiscales y legales

### 1.2.2 Justificación Técnica

La elección de tecnologías modernas garantiza:

- **Mantenibilidad**: Código estructurado y documentado, fácil de actualizar
- **Rendimiento**: Aplicación rápida y responsiva para uso diario
- **Seguridad**: Autenticación robusta y protección de datos sensibles
- **Accesibilidad**: Aplicación web accesible desde cualquier dispositivo con navegador

### 1.2.3 Justificación Académica

Este proyecto integra conocimientos adquiridos durante la carrera:

- Análisis y diseño de sistemas
- Programación web frontend y backend
- Gestión de bases de datos relacionales
- Arquitectura de software
- Ingeniería de requisitos
- Pruebas de software

## 1.3 Objetivos del Proyecto

### 1.3.1 Objetivo General

Desarrollar e implementar un sistema web integral para la gestión operativa y administrativa del Motel Eclipse, que automatice los procesos de control de turnos, habitaciones, inventario y generación de reportes, mejorando la eficiencia y trazabilidad de las operaciones.

### 1.3.2 Objetivos Específicos

1. **Análisis de Requisitos**
   - Identificar procesos críticos del negocio
   - Definir requisitos funcionales y no funcionales
   - Diseñar casos de uso para cada módulo

2. **Diseño de Arquitectura**
   - Diseñar arquitectura cliente-servidor escalable
   - Modelar base de datos relacional optimizada
   - Definir API REST con endpoints seguros

3. **Desarrollo del Sistema**
   - Implementar interfaz de usuario intuitiva y responsiva
   - Desarrollar backend con lógica de negocio robusta
   - Integrar autenticación y autorización por roles

4. **Módulos Funcionales**
   - Desarrollar módulo de gestión de turnos de caja
   - Implementar control de check-in/check-out de habitaciones
   - Crear sistema de inventario con alertas automáticas
   - Generar reportes estadísticos en PDF personalizado

5. **Calidad y Seguridad**
   - Implementar validaciones en frontend y backend
   - Configurar políticas de seguridad en base de datos (RLS)
   - Realizar pruebas funcionales de cada módulo

6. **Despliegue y Documentación**
   - Preparar sistema para ambiente de producción
   - Generar documentación técnica completa
   - Crear manual de usuario para el personal

## 1.4 Alcance del Proyecto

### 1.4.1 Dentro del Alcance

✅ **Incluido en el desarrollo:**

- Dashboard con métricas en tiempo real
- Gestión completa de turnos (apertura, cierre, consignaciones)
- Control de habitaciones (ocupación, check-in, check-out, tarifas)
- Inventario de productos (entradas, salidas, ajustes, alertas)
- Generación de reportes en PDF con logotipo personalizado
- Administración de usuarios con roles diferenciados
- Auditoría de operaciones críticas
- Diseño responsivo para tablets y computadoras

### 1.4.2 Fuera del Alcance

❌ **No incluido en esta versión:**

- Aplicación móvil nativa (iOS/Android)
- Sistema de reservas en línea
- Integración con pasarelas de pago
- Sistema de cámaras o cerraduras inteligentes
- Módulo de recursos humanos o nómina
- Integración con sistemas contables externos

### 1.4.3 Limitaciones

- Sistema diseñado para un único establecimiento (no multi-tenant)
- Requiere conexión a internet para operar
- Optimizado para navegadores modernos (Chrome, Firefox, Edge)

## 1.5 Metodología de Desarrollo

Se adoptó un enfoque **ágil e iterativo** con las siguientes fases:

1. **Análisis**: Reuniones con stakeholders para capturar requisitos
2. **Diseño**: Modelado de base de datos y wireframes de interfaz
3. **Desarrollo iterativo**: Implementación por módulos con entregas incrementales
4. **Pruebas continuas**: Validación funcional en cada iteración
5. **Retroalimentación**: Ajustes basados en uso real del personal

Esta metodología permitió adaptarse a cambios en requisitos y garantizar que el sistema final satisfaga las necesidades reales del negocio.

---
