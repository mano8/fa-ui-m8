---
title: Cómo funciona el complemento
description: Las diez ideas que hay detrás de Reparto Docente — puestos indivisibles, objetivos exactos, dos balances independientes, revisiones inmutables y nada que se borre nunca.
sidebar:
  label: Cómo funciona
  order: 2
---

Reparto Docente solo tiene unas diez ideas dentro. Cuando las conozca, cada pantalla y
cada mensaje de rechazo tendrán sentido. Nada de esta página es lectura opcional: estas
reglas las impone el servidor, no las sugiere la interfaz.

**En esta página:** [tres etapas](#1-tres-etapas-en-un-orden-fijo) ·
[dotación](#2-la-dirección-le-da-un-número-y-puede-cambiarlo) ·
[la matriz](#3-la-matriz-grupo-materia-es-donde-viven-los-números-reales) ·
[actividades](#4-la-actividad-docente-es-la-unidad-de-planificación) ·
[dos balances](#5-hay-dos-totales-de-horas-y-ambos-son-correctos) ·
[puestos indivisibles](#6-los-puestos-son-indivisibles) ·
[objetivos exactos](#7-cada-docente-debe-llegar-exactamente-a-su-objetivo) ·
[viabilidad](#8-la-viabilidad-es-una-tercera-comprobación) ·
[nada se borra](#9-nunca-se-borra-nada) ·
[decide el servidor](#10-decide-el-servidor-no-la-pantalla)

---

## 1. Tres etapas, en un orden fijo

**Configuración → Planificación → Asignación.**

No se pueden generar puestos docentes antes de que el plan esté equilibrado y bloqueado,
y no se puede asignar un puesto antes de generarlo. Si una pantalla le dice que un paso
todavía no está disponible, es porque la etapa anterior no ha terminado, no porque algo
esté roto.

El menú de la izquierda está agrupado por estas tres etapas, así que el propio menú es el
orden de trabajo.

## 2. La dirección le da un número, y puede cambiarlo

La dirección del centro comunica al departamento cuántas **horas de grupo semanales** se
le han asignado —120 en el ejemplo que usa esta guía—. Ese número se registra en la
página **Dotación de dirección**.

Esa cifra nunca se sobrescribe. Cada vez que cambia se registra una **revisión nueva**,
con un motivo escrito, y la anterior se conserva para siempre como historial. Solo una
revisión es «actual» en cada momento.

![La página de dotación de dirección con su revisión actual y su historial](../../../../../assets/reparto/es/allocation.png)

Si la dirección cambia el número *después* de que usted haya planificado, el plan se marca
como **obsoleto** y se bloquean las nuevas asignaciones hasta que usted concilie
explícitamente; consulte
[Etapa 2](/es/docs/reparto/stage-2-planning/#cuando-cambia-la-dotación).

## 3. La matriz grupo-materia es donde viven los números reales

En la etapa 1 se registran tres listas:

- **Grupos** — las clases: *1° ESO A*, *2° BAC B*, etcétera.
- **Materias** — lo que se imparte: *Matemáticas*, *Tutoría*, *Docencia compartida*…
  Cada materia lleva unas horas por defecto *sugeridas*.
- **La matriz grupo-materia** — una celda por cada par (grupo, materia) que realmente
  existe. Aquí viven los valores de planificación **reales**.

Los valores por defecto de la materia solo *siembran* una celda nueva. Editar un valor por
defecto más tarde nunca reescribe una celda que ya existía. Es deliberado: sus decisiones
grupo a grupo no se sobrescriben en silencio por un cambio en una plantilla.

:::note[Vacío no es cero]
En un campo de horas, dejar la casilla **vacía** significa *«usar el valor por defecto de
la materia»*. Escribir **0** significa *«cero horas de verdad»*. Son dos cosas distintas y
la aplicación nunca las confunde. Si quiere que una celda siga a su materia, borre la
casilla en vez de escribir 0.
:::

## 4. La actividad docente es la unidad de planificación

Una **actividad docente** es una pieza concreta de docencia. Lleva:

| Campo | Significado |
| --- | --- |
| **Horas de grupo por grupo** | Cuántas horas semanales recibe *la clase*. |
| **Horas por puesto docente** | Cuántas horas semanales dedica *un docente*. |
| **Puestos docentes** | Cuántos docentes hacen falta a la vez. |
| **Grupos vinculados** | A qué clases se aplica (una, varias o ninguna). |

Las actividades vienen de dos sitios:

- Las **actividades principales** se generan por usted, una por cada celda activa de
  materia principal de la matriz. Esto se llama *materialización*, y solo crea las que
  faltan.
- Las **actividades secundarias** —tutoría, docencia compartida, tareas de
  departamento— se añaden a mano, porque son la parte discrecional del plan.

## 5. Hay dos totales de horas, y ambos son correctos

Esta es la única idea que sorprende a todo el mundo, así que tiene su propia página:
[Horas, balances y viabilidad](/es/docs/reparto/hours-and-balances/).

En resumen:

```text
Horas de grupo   = lo que reciben las clases   → debe igualar la dotación de dirección
Horas de docente = lo que trabaja el profesorado → debe igualar la suma de objetivos
```

**No** son el mismo número y **nunca** deben sumarse. En el ejemplo, el plan son 120 horas
de grupo y 124 horas de profesorado, y ambas cifras son correctas al mismo tiempo.

![La cabecera de balance de planificación: 120.00 horas de grupo y 124.00 horas de profesorado, ambas con diferencia 0.00](../../../../../assets/reparto/es/planning-balance.png)

## 6. Los puestos son indivisibles

Cuando el plan se bloquea, la aplicación genera un **puesto horario** —esta guía lo llama
*puesto*— por cada docente que necesita una actividad.

Un puesto de 4 horas va a **un** docente, entero. No se puede partir en 3 + 1. No se puede
compartir. Un docente al que solo le quedan 3 horas no puede cogerlo. En el tablero de
reparto no hay ninguna casilla de horas precisamente porque no hay nada que escribir: las
horas vienen del puesto.

Una actividad que necesita dos docentes de 2 horas cada uno produce **dos** puestos de 2
horas, y tienen que ir a docentes **distintos**.

## 7. Cada docente debe llegar exactamente a su objetivo

Cada docente participante tiene:

```text
objetivo = horas base semanales + horas extra autorizadas
```

Antes de poder cerrar el proceso, cada participante activo debe alcanzar ese objetivo
**exactamente**. Ni por debajo, ni por encima. En toda la aplicación no hay ninguna forma
de saltárselo.

Si un docente necesita realmente trabajar más, la jefatura de departamento primero le
**autoriza horas extra**: una acción aparte, que exige un motivo escrito y queda auditada,
y que sube el objetivo. Retirar una autorización es la misma acción con el valor 0.

Quien lleva horas extra autorizadas queda marcado como **sobrecarga autorizada** allí
donde aparezca.

## 8. La viabilidad es una tercera comprobación

Que los dos totales cuadren es necesario pero no suficiente. Es perfectamente posible que
las horas de grupo y las de profesorado cuadren y que aun así *no haya manera* de repartir
los puestos indivisibles de forma que todo el mundo caiga exactamente en su objetivo.

Por eso la aplicación hace una tercera comprobación, la **viabilidad del reparto**, y la
muestra junto a los dos balances. Las tres tienen que estar en verde antes de poder
bloquear el plan:

![Los tres invariantes: horas de grupo equilibradas, carga docente equilibrada, viabilidad del reparto realizable](../../../../../assets/reparto/es/dashboard-invariants.png)

La viabilidad *no* es un estado del plan; es una respuesta independiente, y vuelve a **Sin
evaluar** cada vez que cambia algo relevante. Es normal: vuelva a lanzar la evaluación
desde la página de planificación.

## 9. Nunca se borra nada

Reparto Docente es un registro de decisiones, así que casi no elimina nada:

| En vez de borrar… | …la aplicación hace esto |
| --- | --- |
| Una actividad docente | La **retira**: deja de contar, pero sigue visible con su fecha de retirada. |
| Una celda de la matriz | La **retira**, igual. |
| Una asignación | **Deshacer**: libera el puesto y reabre el turno del docente. Exige un motivo escrito. |
| Mover un puesto a otra persona | **Reasignar**: una única operación atómica, no un borrado más una creación. Exige un motivo escrito. |
| Una cifra de dotación | Una **revisión nueva** la sustituye; la anterior se conserva. |

Las asignaciones canceladas siguen en el tablero como historial, sin botones de acción.

## 10. Decide el servidor, no la pantalla

Cada comprobación de permisos de la interfaz es una afirmación sobre **qué mostrarle**. El
servicio Reparto vuelve a comprobar lo mismo en cada petición, y es él quien decide. Esto
tiene dos consecuencias visibles:

- **Todo falla en cerrado.** Cuando la aplicación aún no conoce su rol, o no puede
  contactar con el servidor, deniega en vez de suponer que usted tiene permiso.
- **Los botones desaparecen, no se atenúan.** Si su cuenta no puede hacer algo en
  absoluto, normalmente el control ni se dibuja. Si un control *está* pero desactivado, el
  motivo aparece a su lado.

---

**Anterior:** [← Resumen de la guía](/es/docs/reparto/) ·
**Siguiente:** [Primeros pasos →](/es/docs/reparto/getting-started/)
