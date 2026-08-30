---
title: Referencia
description: Todas las páginas de Reparto Docente con el rol que exigen, los estados que puede tener un proceso y un plan, y un glosario de todos los términos de la aplicación.
sidebar:
  label: Referencia
  order: 13
---

Material de consulta. Aquí no hay tutorial: para eso, empiece por el
[resumen de la guía](/es/docs/reparto/).

**En esta página:** [páginas y permisos](#páginas-y-permisos) ·
[estados del proceso](#estados-del-proceso) · [estados del plan](#estados-del-plan-docente) ·
[estados del puesto](#estados-del-puesto) ·
[respuestas de viabilidad](#respuestas-de-viabilidad) · [glosario](#glosario)

---

## Páginas y permisos

Cada página lleva **dos** umbrales. **Ver** es el rol mínimo que puede abrirla. **Cambiar** es
el rol mínimo a partir del cual pueden aparecer sus controles de edición.

| Página | Dirección | Ver | Cambiar |
| --- | --- | --- | --- |
| Panel | `/reparto` | **Administrador** | Administrador |
| Procesos | `/reparto/processes` | Lector | Administrador |
| Centros | `/reparto/setup/schools` | Lector | Administrador |
| Cursos académicos | `/reparto/setup/academic-years` | Lector | Administrador |
| Departamentos | `/reparto/setup/departments` | Lector | Administrador |
| Etapas educativas | `/reparto/setup/classroom-stages` | Lector | Administrador |
| Listado del profesorado | `/reparto/setup/teacher-roster` | Lector | **Editor** |
| Dotación de dirección | `/reparto/processes/{id}/allocation` | Lector | Administrador |
| Participantes en el proceso | `/reparto/processes/{id}/participants` | **Administrador** | Administrador |
| Materias | `/reparto/processes/{id}/subjects` | Lector | Administrador |
| Grupos | `/reparto/processes/{id}/teaching-groups` | Lector | Administrador |
| Matriz grupo-materia | `/reparto/processes/{id}/group-subjects` | Lector | Administrador |
| Ajustes del proceso | `/reparto/processes/{id}/settings` | Lector | Administrador |
| Planificación | `/reparto/processes/{id}/planning` | **Administrador** | Administrador |
| Horas necesarias | `/reparto/processes/{id}/requirements` | Lector | Administrador |
| Repartos | `/reparto/processes/{id}/assignments` | **Administrador** | Administrador |
| Sesión | `/reparto/meeting/{id}` | **Administrador** | Administrador |
| Mi vista | `/reparto/processes/{id}/my-view` | Lector | **Editor** |
| Pantalla compartida | `/reparto/processes/{id}/shared` | Lector | Administrador |
| Versiones | `/reparto/processes/{id}/versions` | **Administrador** | Administrador |
| Exportaciones | `/reparto/processes/{id}/exports` | **Administrador** | Administrador |
| Auditoría | `/reparto/processes/{id}/audit` | **Administrador** | Administrador |

Notas:

- `{id}` es normalmente la palabra **`current`**, que se resuelve al proceso que usted eligió.
  El proceso se elige por curso, centro y departamento, nunca escribiendo un código.
- Todas las direcciones llevan delante el idioma del sitio, por ejemplo `/es/reparto/…`.
- Ocho páginas exigen Administrador incluso para verlas: Panel, Sesión, Participantes,
  Repartos, Planificación, Auditoría, Versiones y Exportaciones.
- Los dos umbrales de **Editor** son umbrales, no concesiones. El listado del profesorado
  aplica además una comprobación de propiedad fila a fila: un Editor edita **su propia** ficha
  y la de nadie más, mientras que crear, vincular y borrar fichas siguen siendo de
  Administrador. *Mi vista* cubre la selección propia y el turno propio de quien la usa.
  Canjear un código de vinculación es la excepción estrecha de Lector.
- Quien administra el sitio puede renombrar cualquier dirección o retirar una página entera, así
  que su instalación puede diferir.
- Todas estas comprobaciones tratan de **qué mostrarle**. El servidor vuelve a comprobar en cada
  petición y es él quien decide.

## Estados del proceso

| Estado | Significado |
| --- | --- |
| **Borrador** | En configuración. |
| **Listo para la sesión** | Configuración y planificación completas. |
| **Sesión abierta** | Hay una sesión de selección en curso. |
| **Asignando** | Se están repartiendo los puestos. |
| **Propuesta del departamento** | El reparto propuesto por el departamento. |
| **Enviado a dirección** | Remitido a la dirección del centro. |
| **Devuelto por dirección** | Devuelto para cambios. |
| **Revisión interna** | En revisión por el departamento. |
| **Final** | Cerrado. Todo cambio se rechaza hasta reabrirlo. |
| **Reabierto** | Reabierto tras estar final, con un motivo registrado. |
| **Archivado** | Terminal. No se puede reabrir. |

Usted nunca los fija a mano: no hay control de estado en ninguna parte de la aplicación.

## Estados del plan docente

| Estado | Significado |
| --- | --- |
| **Borrador** | En construcción. |
| **Desequilibrado** | Uno o los dos totales no coinciden con su objetivo. |
| **Equilibrado** | Ambos totales coinciden exactamente. |
| **Bloqueado** | Congelado, listo para la generación. |
| **Puestos generados** | Los puestos existen. |
| **Obsoleto** | Algo ha cambiado por debajo, normalmente la dotación. |
| **Requiere conciliación** | Un cambio de dotación afecta a puestos asignados y hay que resolverlo a mano. |

El estado del plan y la viabilidad son **independientes**. Un plan puede estar *Equilibrado* e
*Irrealizable* a la vez; responden a preguntas distintas.

## Estados del puesto

| Estado | Significado |
| --- | --- |
| **Disponible** | Libre; se puede asignar. |
| **Asignado** | Lo tiene un participante, entero. |
| **Obsoleto** | El plan se movió por debajo. |
| **Requiere conciliación** | Afectado explícitamente por un cambio de dotación. |

## Respuestas de viabilidad

| Respuesta | ¿Bloquea el bloqueo y la asignación? |
| --- | --- |
| **Realizable** | No. |
| **Irrealizable** | Sí. |
| **Desconocida** | Sí — se trata como *no demostrada*. |
| **Sin evaluar** | Sí — lance la evaluación. |

## Glosario

**Actividad docente** — una pieza concreta de docencia, con sus horas de grupo, sus horas por
puesto docente, su número de puestos y sus grupos vinculados.

**Actividad principal** — una actividad creada por usted a partir de una celda activa de materia
principal de la matriz.

**Actividad secundaria** — tutoría, docencia compartida, apoyo o tareas de departamento, añadida
a mano.

**Asignación** — un participante que tiene un puesto completo. Se cancela con **deshacer**, se
mueve con **reasignar**, nunca se borra.

**Categoría de asignación** — si una materia es **Principal** (dato obligatorio de
planificación) o **Secundaria** (opcional). No es un sí/no, y nunca se llama «es principal».

**Curso académico** — un año escolar con etiqueta, perteneciente a un centro, con fecha de
inicio y de fin.

**Etapa educativa** — un nivel de escolarización (*Secundaria*/`ESO`, *Bachillerato*/`BAC`) con
su rango de cursos. Compartida por todo el sitio.

**Generación** — el acto numerado de producir puestos a partir de un plan bloqueado. Cada
regeneración recibe un número nuevo.

**Grupo** — una clase, como *1° ESO A*.

**Heredado** — un campo de horas dejado vacío, que significa «usar el valor por defecto de la
materia». No es lo mismo que un `0` escrito.

**Horas de docente** — las horas que trabaja un **docente**. Se miden contra la suma de
objetivos de los participantes. Nunca se suman a las horas de grupo.

**Horas de grupo** — las horas que recibe una **clase**. Se miden contra la dotación de
dirección.

**Horas extra autorizadas** — una adición explícita, motivada y auditada al objetivo de un
participante. No es una tolerancia aplicada después, y no se edita en el formulario de
participante.

**Horas objetivo** — la `base + extra autorizadas` de un participante. Hay que alcanzarlas
exactamente.

**Jefatura de departamento** — en esta aplicación, sencillamente una cuenta con rol
**Administrador** o **Superadministrador**. El campo `Jefe de departamento` de un departamento
es descriptivo y no concede nada.

**Listado del profesorado** — la lista, común a todo el sitio, del personal docente, separada de
las cuentas de usuario. Una ficha puede vincularse a una cuenta.

**Materialización** — crear a partir de la matriz las actividades principales que faltan. Es
idempotente: ejecutarla dos veces no crea nada nuevo.

**Matriz grupo-materia** — una celda por cada par (grupo, materia), con los valores de
planificación **reales**.

**Obsoleto** — un plan cuyos datos de partida se movieron después de bloquearlo o generarlo.
Bloquea las asignaciones nuevas hasta que se concilie.

**Participante** — un docente que toma parte en un proceso concreto, con horas base, horas extra
autorizadas y un objetivo.

**Proceso de reparto** — un departamento, en un centro, para un curso académico. El contenedor
de todo.

**Puesto** (o *puesto horario*) — un requisito docente indivisible generado a partir de un plan
bloqueado. Se coge entero o no se coge.

**Puestos docentes** — cuántos docentes necesita una actividad a la vez. Dos puestos de una
actividad tienen que ir a dos docentes distintos.

**Plan docente** — el único plan que posee un proceso. Se crea explícitamente; hay como mucho
uno.

**Conciliación** — el flujo explícito para resolver un cambio de dotación que afecta a puestos
asignados. Nunca automático, nunca destructivo.

**Retirar** — la forma en que las actividades y las celdas de la matriz salen del plan. Dejan de
contar pero siguen visibles, con su fecha de retirada. No hay borrado.

**Revisión de dotación** — un registro inmutable de las horas de grupo semanales que la dirección
dio al departamento, con un motivo obligatorio. Solo una es la actual; el resto son historial.

**Sobrecarga autorizada** — la marca de un participante que lleva horas extra autorizadas.

**Testigo** — la combinación ya resuelta que la aplicación guarda como prueba de que los puestos
restantes se pueden seguir repartiendo exactamente. Nunca se muestra al profesorado ni en el
proyector.

**Tipo de actividad** — una etiqueta descriptiva de una actividad: *Ordinaria*, *Tutoría*,
*Docencia compartida*, *Apoyo*, *De departamento*, *Otro*. **Nunca cambia el comportamiento.**

**Versión** — una instantánea inmutable de todo el proceso, capturada a petición.

**Viabilidad** — si los puestos indivisibles *se pueden* repartir de forma que cada participante
caiga exactamente en su objetivo. El tercer invariante.

---

**Anterior:** [← Solución de problemas](/es/docs/reparto/troubleshooting/) ·
**Volver a:** [Resumen de la guía](/es/docs/reparto/)
