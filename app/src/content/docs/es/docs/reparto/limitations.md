---
title: Límites y notas operativas
description: Las fronteras deliberadas del producto y los límites operativos que quedan tras corregir la sesión, la autenticación y la compilación de producción.
sidebar:
  label: Límites y operación
  order: 11
---

El código actual no tiene ningún bloqueo conocido del flujo de Reparto documentado aquí.
Las antiguas carencias de sesión en directo, vinculación de cuentas, doble refresco, ruta
raíz y scripts CSP quedaron corregidas antes de la pareja de versiones `2.0.0`. Esta página
recoge ahora las fronteras intencionadas y el comportamiento que debe prever quien administre.

**En esta página:** [carencias cerradas](#carencias-cerradas) ·
[intervención esperada](#intervención-esperada) · [límites deliberados](#límites-deliberados) ·
[límites operativos](#límites-operativos) · [primer arranque](#primer-arranque-y-revisiones-del-esquema)

---

## Carencias cerradas

Estas afirmaciones ya no son limitaciones:

- un Administrador abre y cierra una sesión y ejecuta las cinco acciones de turno;
- un docente vincula su ficha con un código de un solo uso, toma un puesto y pasa su turno;
- los controles permanecen cerrados sin sesión y explican el motivo;
- los cambios propios de la reunión no invalidan la viabilidad;
- la pantalla compartida cuenta participantes equilibrados, pendientes y sobrecargados;
- el arranque de autenticación y los reintentos API comparten un único refresco;
- la salida estática incluye la redirección raíz y los hashes CSP de todos los scripts;
- los mensajes de validación y recuperación nombran al participante afectado.

## Intervención esperada

### Una asignación puede pedir reevaluar la viabilidad

En ocasiones el testigo determinista no se puede reparar localmente. El servicio bloquea
el siguiente intento y pide ejecutar la evaluación administrativa y reintentar. No hay
pérdida de datos ni se rompe la sesión: abra **Planificación**, evalúe de nuevo y continúe.
El servicio no adivina cuando ya no puede demostrar que los puestos indivisibles restantes
encajan exactamente.

## Límites deliberados

### Sin cualificaciones ni reglas de elegibilidad

Cualquier participante activo puede tomar cualquier puesto si lo permiten horas, unicidad,
ciclo y turno. Titulaciones, niveles, bilingüismo y preferencias no se modelan.

### Sin optimizador automático

La aplicación valida y demuestra viabilidad; no construye automáticamente el plan preferido
del departamento. Las actividades secundarias y decisiones finales siguen siendo humanas.

### Puestos indivisibles y sin edición manual

Cada puesto generado va completo a un docente. No existe asignación parcial o compartida,
editor manual ni anulación para sobreasignar. Los cambios pasan por generación o
reconciliación. Las horas extra son un cambio separado, motivado y auditado.

### El servidor es dueño del ciclo y del historial

No hay selector arbitrario de estado. Las acciones documentadas hacen avanzar el proceso.
**Final** se puede reabrir con motivo; **Archivado** es terminal. Los elementos se retiran,
deshacen, reasignan o sustituyen, no se borran del historial.

### Nombrar jefatura usa el directorio protegido de cuentas

El campo **Jefe de departamento** es descriptivo y no concede permisos. Buscar otra cuenta
exige Superadministrador; un Administrador normalmente puede vaciar el campo, pero no elegir
a un compañero. Reparto no amplía la política del servicio de identidad.

### El proyector usa una sesión existente

No existe un permiso específico. Un Administrador ve todos los procesos; un Lector o Editor
los ve por participación. Una cuenta de proyección no participante no tiene proceso que
abrir. La respuesta proyectada sigue siendo agregada, sin nombres ni horas individuales.

### Las bases antiguas de desarrollo se reinician

No hay capa que migre una base de desarrollo del modelo antiguo de dos etapas al dominio de
tres etapas. Esos datos antiguos de desarrollo se reinician.

## Límites operativos

El reparto indivisible es un problema difícil, por lo que el solver está acotado:

- **Desconocido** significa que alcanzó el límite de esfuerzo sin prueba y bloquea igual
  que **No viable** hasta lograr un resultado viable;
- el objetivo validado es aproximadamente **30 participantes y 100 puestos activos**;
- el solver completo solo se ejecuta en flujos administrativos; la elección docente usa
  comprobaciones baratas y el testigo guardado.

## Primer arranque y revisiones del esquema

El servicio no entrega una revisión Alembic escrita a mano y separada de los modelos. En el
primer arranque Compose comprueba deriva, genera la revisión necesaria y actualiza la base.
El despliegue debe completar ese arranque antes de estar listo.

Una instalación limpia puede tardar más. Haga copia de los datos persistentes, revise la
migración generada y espere al control de salud de Reparto antes de abrir la UI.

---

**Anterior:** [← Versiones, exportaciones y auditoría](/es/docs/reparto/versions-exports-audit/) ·
**Siguiente:** [Solución de problemas →](/es/docs/reparto/troubleshooting/)
