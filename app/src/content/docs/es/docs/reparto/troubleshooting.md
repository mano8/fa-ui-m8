---
title: Solución de problemas
description: Los mensajes que muestra Reparto Docente, qué significa realmente cada uno y qué hacer al respecto.
sidebar:
  label: Solución de problemas
  order: 12
---

Casi todos los rechazos de Reparto Docente son la aplicación protegiendo una regla, no un
fallo. Esta página traduce los que más probablemente encontrará.

**En esta página:** [no aparece nada](#no-aparece-nada) ·
[páginas vacías](#una-página-está-vacía) · [no puedo bloquear](#no-puedo-bloquear-el-plan) ·
[no puedo asignar](#no-puedo-asignar-un-puesto) ·
[cambios de dotación](#he-cambiado-la-dotación-y-se-ha-parado-todo) ·
[las horas no cuadran](#las-horas-parecen-mal) · [la sesión](#los-controles-de-sesión-no-hacen-nada)

---

## No aparece nada

### No hay ninguna entrada «Reparto docente» en el menú

El complemento no está habilitado en esta instalación. Es opcional, y solo aparece cuando se
ha instalado **y además** se ha conectado a un servicio Reparto en funcionamiento. Nada que
haga en la interfaz lo cambiará; pregunte a quien administra el sitio.

### «No tiene acceso a esta página»

El rol de su cuenta es demasiado bajo. Reparto Docente necesita al menos **Lector** para ver
algo; una cuenta **Usuario** no tiene aquí ninguna capacidad. Consulte
[Quién puede hacer qué](/es/docs/reparto/roles/).

### La página se queda en «Comprobando su acceso…»

La aplicación todavía no ha averiguado quién es usted. Deliberadamente no muestra ni el
contenido ni un rechazo mientras no lo sabe: «todavía no» no es «no puede». Si no se resuelve
nunca, recargue la página.

### Me ha cerrado la sesión mientras trabajaba

Vuelva a iniciar sesión y compruebe el estado de conexión. El arranque de autenticación y los
reintentos API comparten ahora un único refresco coordinado. Si vuelve a ocurrir, revise la salud
del servicio de cuentas y el error de red del navegador.

## Una página está vacía

### «Seleccione un proceso primero»

No hay proceso elegido. Use la barra **Proceso actual** de la parte superior de la página, o la
página de Procesos. Su elección se recuerda en este navegador.

### La página de dotación no muestra ninguna dotación actual

Es normal en un proceso nuevo: todavía no se ha registrado ninguna dotación. Es un estado vacío,
no un error.
[Registre la primera revisión](/es/docs/reparto/stage-1-configuration/#dotación-de-dirección).

### Todas las pantallas de la etapa 2 están vacías

El plan docente todavía no se ha creado. Un proceso posee como mucho un plan y no se crea
automáticamente.
[Créelo desde la página de Planificación](/es/docs/reparto/stage-2-planning/#0-crear-el-plan-docente).

### El panel de materialización no lista nada

No hay celdas activas de materia principal en la matriz. La etapa 2 no tiene entrada hasta que
exista al menos una celda.
[Rellene la matriz](/es/docs/reparto/stage-1-configuration/#la-matriz-grupo-materia).

### La lista de comprobación dice «No comprobado aquí»

Ese paso no se puede evaluar desde esta pantalla, normalmente porque todavía no hay un proceso
seleccionado. No es un fallo.

## No puedo bloquear el plan

Bloquear necesita **cuatro** cosas a la vez. Compruébelas en este orden:

1. **La diferencia de horas de grupo es `0.00`.** Si no, ajuste las actividades o revise la
   dotación.
2. **La diferencia de horas de profesorado es `0.00`.** Si no, ajuste las actividades
   secundarias, el número de puestos docentes o los objetivos de los participantes.
3. **La viabilidad dice Realizable.** Si dice *Sin evaluar*, lance la evaluación. Si dice
   *Irrealizable*, lea el panel de diagnóstico. Si dice *Desconocida*, la comprobación agotó su
   esfuerzo: simplifique el plan o inténtelo de nuevo.
4. **Ningún hallazgo bloqueante que cuente contra el bloqueo.**

:::note[`plan.requirements_not_generated` no es un problema]
Este hallazgo está presente en todo plan que aún no ha generado sus puestos, es decir, en todo
plan que está a punto de bloquear. No impide bloquear.
:::

### «El servicio solo desbloquea un plan bloqueado antes de la generación»

Está intentando desbloquear un plan que ya ha generado sus puestos. El desbloqueo solo existe
para un plan bloqueado y todavía no generado. Use la **regeneración** o el flujo de
**conciliación**; el panel le dice cuál.

## No puedo asignar un puesto

### Un participante aparece con un motivo en vez de poder elegirse

De eso se trata: la aplicación le dice *por qué* en vez de esconder la opción.

| Motivo | Qué hacer |
| --- | --- |
| El participante está inactivo | Reactívelo, o elija a otra persona. |
| Ya tiene otro puesto de la misma actividad | Dos puestos de una actividad deben ir a docentes distintos. Elija a otra persona. |
| Le haría pasar de sus horas restantes | El puesto es mayor que sus horas restantes. Los puestos no se parten: o elige a otro participante, o le autoriza horas extra antes. |

### «La selección está bloqueada porque el testigo determinista no se pudo reparar»

El mensaje completo dice algo así:

> *La selección está bloqueada porque el testigo determinista no se pudo reparar
> (local_repair_not_found); se requiere una evaluación administrativa de viabilidad.*

**Qué significa:** la aplicación guarda una combinación ya resuelta que demuestra que los puestos
restantes se pueden seguir repartiendo exactamente. Sus últimas asignaciones movieron las cosas lo
bastante como para que no pudiera ajustar esa combinación sobre la marcha, y no va a continuar
sobre una combinación que ya no puede demostrar.

**Qué hacer:** vaya a la página de Planificación, vuelva a lanzar la evaluación de viabilidad y
regrese al tablero. Nada está roto y nada se ha perdido.

### «Un puesto no se puede partir, autorice horas extra primero»

El mensaje completo da las cifras:

> *El puesto … necesita 8.00 horas pero al participante solo le quedan 5.00 antes del objetivo de
> 21.00; un puesto no se puede partir, así que autorice horas extra primero.*

Los puestos son indivisibles. O entrega este puesto a alguien a quien le queden exactamente las
horas necesarias, o sube el objetivo de este participante autorizándole horas extra: una acción
aparte que exige un motivo escrito.

### Todo el tablero rechaza asignaciones nuevas

El plan está **obsoleto** o necesita **conciliación**, normalmente porque cambió la dotación de
dirección. Véase la sección siguiente.

## He cambiado la dotación y se ha parado todo

Es el comportamiento previsto. Registrar una revisión nueva de dotación marca el plan como
obsoleto y bloquea las nuevas operaciones de asignación hasta que usted concilie explícitamente.

No se ha borrado nada: todas las actividades, puestos y asignaciones siguen ahí. Vaya a
**Planificación → Cambios de dotación y conciliación**, previsualice la conciliación, resuelva a
mano cada puesto asignado afectado y aplique con un motivo y el recuento exacto de conflictos de
la vista previa.

Instrucciones completas:
[Etapa 2 — cuando cambia la dotación](/es/docs/reparto/stage-2-planning/#cuando-cambia-la-dotación).

### La aplicación fue rechazada y mi vista previa ha desaparecido

Algo cambió entre la vista previa y la aplicación, así que la vista previa estaba caducada y se
descartó en vez de comprometerse. **Vuelva a previsualizar.** No pulse aplicar una segunda vez; lo
mismo vale para el editor masivo de la matriz y para la generación de puestos.

## Las horas parecen mal

### Los dos totales no coinciden entre sí

No tienen por qué. Las **horas de grupo** son lo que reciben las clases; las **horas de
profesorado** son lo que trabaja el profesorado. 120 y 124 son correctos a la vez. Lea
[Horas, balances y viabilidad](/es/docs/reparto/hours-and-balances/).

### Una celda pone «Heredado» en vez de un número

La celda está usando el valor por defecto de su materia. Eso es lo que significa un campo de horas
vacío. Si quiere un valor explícito, escríbalo; si quiere un cero real, escriba `0`, que **no** es
lo mismo que dejarlo vacío.

### He escrito tres decimales y me lo ha rechazado

Las horas admiten como mucho dos decimales. La aplicación rechaza un tercero en vez de redondearlo,
porque cambiar en silencio un número que usted ha escrito sería peor.

### La viabilidad vuelve a decir «Sin evaluar»

Ha cambiado un campo relevante para el solver, una actividad o la matriz. La viabilidad se
reinicia en vez de mostrar una respuesta caducada. Evalúe de nuevo. El orden de selección y
los metadatos propios de la reunión ya no la reinician.

## Los controles de sesión están deshabilitados

Lea el motivo que aparece al lado. Lo habitual es **No hay ninguna sesión de reunión abierta**:
abra una desde el panel **Sesión de la reunión**. La preparación, el estado del plan o la
propiedad del turno también pueden cerrar un control. Las cinco acciones están conectadas;
un rechazo del servidor se muestra al lado en vez de quedar en silencio.

## ¿Sigue atascado?

- Consulte la página de **Auditoría**: registra lo que ocurrió realmente, en orden, con quién lo
  hizo.
- Mire el estado de conexión de la página: *Actualizaciones en vivo desconectadas* significa que lo
  que ve puede estar caducado. Recargue.
- Vuelva a leer [Cómo funciona el complemento](/es/docs/reparto/how-it-works/). Casi todas las
  sorpresas vienen de una de esas diez reglas.

---

**Anterior:** [← Límites y notas operativas](/es/docs/reparto/limitations/) ·
**Siguiente:** [Referencia →](/es/docs/reparto/reference/)
