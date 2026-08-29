---
title: Quién puede hacer qué
description: Los cinco roles de cuenta en Reparto Docente, qué puede ver y cambiar cada uno, y por qué algunos botones faltan en vez de aparecer desactivados.
sidebar:
  label: Quién puede hacer qué
  order: 4
---

Reparto Docente **no añade ningún rol propio**. Lee el rol que su cuenta ya tiene en este
sitio y lo deriva todo de ahí.

**En esta página:** [los cinco roles](#los-cinco-roles) ·
[jefatura de departamento](#quién-es-la-jefatura-de-departamento) ·
[registros propios](#registros-propios-qué-puede-hacer-un-editor) ·
[por qué faltan botones](#por-qué-un-botón-falta-en-vez-de-atenuarse) ·
[los tres niveles de vista](#los-tres-niveles-de-vista)

---

## Los cinco roles

Los roles son una escalera: cada uno concede todo lo que conceden los de debajo.

```text
Usuario  <  Lector  <  Editor  <  Administrador  <  Superadministrador
```

| Rol | Ver páginas | Cambiar registros propios | Dirigir el departamento (planificar, asignar, configurar) | Configuración global (centros, cursos, etapas) |
| --- | --- | --- | --- | --- |
| **Usuario** | ✗ | ✗ | ✗ | ✗ |
| **Lector** | ✓ casi todas* | ✗ | ✗ | ✗ |
| **Editor** | ✓ casi todas* | ✓ solo los propios | ✗ | ✗ |
| **Administrador** | ✓ | ✓ | ✓ | ✓ |
| **Superadministrador** | ✓ | ✓ | ✓ | ✓ |

\* Ocho páginas —**Panel**, **Reunión**, **Participantes**, **Asignaciones**,
**Planificación**, **Auditoría**, **Versiones** y **Exportaciones**— requieren el rol de
Administrador para *verse*, porque los datos que hay detrás nombran a otros docentes y sus
horas. Consulte [los tres niveles de vista](#los-tres-niveles-de-vista).

:::caution[Una cuenta «Usuario» no obtiene nada aquí]
`Usuario` es una cuenta perfectamente válida en este sitio, pero dentro de Reparto Docente
tiene capacidad **cero**, incluida la de leer. Todas las páginas la rechazarán. Si un
compañero le dice que las páginas de Reparto le salen vacías o rechazadas, compruebe
primero su rol.
:::

## Quién es la jefatura de departamento

Cada vez que esta guía dice *«la jefatura de departamento hace X»*, el requisito es
simplemente: **su cuenta es Administrador o Superadministrador.** No existe un tipo de
cuenta «jefatura de departamento» aparte, y nunca lo habrá.

Un departamento sí tiene un campo **Jefe de departamento**, pero es *solo descriptivo*:
registra quién figura nominalmente al frente, para el rastro de auditoría y para
mostrarlo. No concede ningún permiso. Nombrar a alguien en él no le habilita para nada, y
vaciarlo no le quita nada.

:::note
Por cómo protege su directorio de usuarios el servicio de cuentas, *asignar* el campo de
jefatura solo es posible en la práctica para un superadministrador. Un administrador puede
vaciar el campo pero normalmente no puede rellenarlo. Es una limitación del servicio de
cuentas, no un fallo de Reparto Docente, y —dado que el campo no autoriza nada— no cambia
nada sobre quién puede dirigir el departamento.
:::

## Registros propios: qué puede hacer un Editor

Un **Editor** solo puede crear, editar o borrar datos que le identifican como su
propietario:

- **su propia ficha de profesorado** — sus datos de contacto y notas, nunca el vínculo
  entre la ficha y una cuenta;
- **su propia elección de puesto** durante una sesión: vincularse a sí mismo, y solo a sí
  mismo, a un puesto disponible;
- **su propio turno**: iniciarlo, completarlo o saltarlo, siendo suyo.

Todo lo demás —participantes, materias, grupos, la matriz, el plan, las asignaciones de
otras personas— es trabajo de jefatura de departamento y exige Administrador o superior.

Tenga en cuenta que «Editor» es un *umbral*, no una concesión: dice que ese nivel de cuenta
puede llegar a tener ese control. Que *ese registro concreto* sea suyo se comprueba aparte,
fila a fila.

## Por qué un botón falta en vez de atenuarse

Reparto Docente distingue tres situaciones y muestra cada una de forma distinta:

| Situación | Qué ve usted |
| --- | --- |
| **No puede hacer esto en absoluto** | El control no se dibuja. Nada que pulsar, nada atenuado. |
| **Puede hacerlo, pero ahora no** | El control está presente y desactivado, con el motivo escrito al lado. |
| **Todavía no lo sabemos** | Ni el contenido ni un rechazo: un breve estado de espera. «Todavía no» no es «no puede». |

Esto último importa: si la aplicación no ha terminado de averiguar quién es usted, no lo
adivina. Espera, y después le muestra la página o se la deniega.

## Los tres niveles de vista

La etapa 3 muestra el mismo proceso a tres públicos distintos, y es el *servidor* quien
decide qué puede recibir cada uno. No es un ajuste de pantalla que usted pueda cambiar.

| Nivel | Quién | Qué recibe |
| --- | --- | --- |
| **Jefatura de departamento** | Administrador / Superadministrador | Todo: horas por docente, motivos, diagnósticos, el rastro de auditoría completo. |
| **Docente** | Un participante, en **Mi vista** | Sus cinco cifras, los puestos aún libres, de quién es el turno y un balance agregado del plan que no nombra a nadie. Nunca las horas de otro docente, ni el motivo escrito de una autorización de horas extra. |
| **Pantalla compartida** | El proyector de la sala | Solo agregados. Los datos que recibe no contienen ningún nombre de participante ni ninguna hora por docente, así que la pantalla proyectada no puede mostrarlos físicamente. |

Un docente que pide el nivel de jefatura es rechazado. Pedir hacia *abajo* —una jefatura
mirando el nivel de pantalla compartida— sí está permitido.

:::note[El nivel se aplica en todos los caminos, no solo en pantalla]
Los niveles anteriores se aplican allí donde se sirven los datos, no allí donde se
muestran. El panel del proceso y la lista de participantes llevan el nivel de jefatura de
departamento —las horas de otros docentes y el motivo escrito de las horas extra—, así que
el servidor los rechaza a quien no sea Administrador, y ocho páginas heredan ese umbral:
**Panel**, **Reunión**, **Participantes**, **Asignaciones**, **Planificación**,
**Auditoría**, **Versiones** y **Exportaciones**. A un Lector o un Escritor que abra una de
ellas se le indica que la página requiere el rol de Administrador.

Nada de lo que el profesorado necesita se ha movido: **Mi vista** sirve sus cinco cifras y
los puestos libres, y la pantalla compartida sirve sus agregados sin nombres; ambas siguen
igual.
:::

---

**Anterior:** [← Primeros pasos](/es/docs/reparto/getting-started/) ·
**Siguiente:** [Horas, balances y viabilidad →](/es/docs/reparto/hours-and-balances/)
