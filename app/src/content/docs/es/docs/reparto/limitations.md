---
title: Limitaciones y bloqueos
description: Lista honesta de lo que Reparto Docente todavía no puede hacer — la sesión en directo que no se puede gestionar desde la interfaz, el problema de la compilación de producción y los límites de diseño deliberados.
sidebar:
  label: Limitaciones y bloqueos
  order: 11
---

Esta página es deliberadamente franca. Separa los **bloqueos** —cosas que deberían funcionar
y ahora mismo no lo hacen— de los **límites deliberados**, que son decisiones de diseño y no
debe esperar que cambien.

Lea los bloqueos antes de planificar una sesión real.

**En esta página:** [bloqueos](#bloqueos) · [asperezas](#asperezas) ·
[límites deliberados](#límites-deliberados) ·
[límites operativos](#límites-operativos) ·
[qué significa en la práctica](#qué-significa-esto-en-la-práctica)

---

## Bloqueos

### La sesión en directo no se puede gestionar desde la interfaz

Es la mayor carencia de la versión actual. La etapa 3 solo se puede completar desde el
tablero de reparto y por la jefatura de departamento. La sesión de selección en directo —en
la que el profesorado coge sus propios puestos por turnos— no se puede gobernar desde estas
pantallas.

Se combinan cinco problemas distintos:

#### El profesorado no puede vincularse a sus cuentas (L1)

El botón **Vincular usuario** del listado del profesorado vincula la cuenta que tiene la
sesión iniciada **en ese momento**. Una jefatura de departamento que lo pulse se vincula *a sí
misma*, no al docente. No hay ningún control en ninguna parte para vincular la cuenta de un
compañero.

Como a *Mi vista* se llega mediante ese vínculo, **ningún docente puede alcanzar su propia
pantalla en una instalación tal y como se entrega**. Abrir *Mi vista* con una cuenta no
vinculada muestra:

> *No hay ninguna ficha de profesorado vinculada a este usuario.*

![Mi vista rechazando una cuenta no vinculada](../../../../../assets/reparto/es/my-view.png)

Arreglarlo no es un cambio de una línea: el servicio de cuentas restringe su directorio de
usuarios a los superadministradores, así que cualquier control «vincular a este compañero» que
funcione necesita un directorio que aporte el sitio anfitrión.

**Solución alternativa:** ninguna desde la interfaz. La jefatura de departamento asigna todos
los puestos desde el tablero.

#### No se puede abrir ni cerrar una sesión (L2)

Crear y cerrar una sesión de selección, y registrar la **posición de selección** de un
participante durante la sesión, existen por debajo —con sus estructuras de datos, sus etiquetas
y sus mensajes de error— pero ninguna pantalla los ofrece. No hay botón ni campo de formulario.

La consecuencia directa es que la inicialización de turnos siempre falla, porque no hay ninguna
sesión que inicializar.

#### Los controles de turno no hacen nada (L3)

Los cinco botones de turno de la sesión —*Inicializar turnos*, *Iniciar turno*, *Completar
turno*, *Saltar turno*, *Anular turno*— y los botones de *elegir* y *pasar turno* del docente se
dibujan pero **no llevan ninguna acción**. Pulsarlos no tiene efecto.

Y peor para quien empieza: el panel de preparación no comprueba si existe siquiera una sesión,
así que **Inicializar turnos aparece habilitado** cuando no hay nada que inicializar.

![La sala de control de la sesión, donde Inicializar turnos e Iniciar turno aparecen habilitados sin ninguna sesión abierta](../../../../../assets/reparto/es/meeting.png)

#### La viabilidad pasa a «Sin evaluar» en plena sesión (L4)

Cualquier edición de un participante invalida el resultado de viabilidad. Registrar algo tan
corriente como un orden de selección deja el plan en **Sin evaluar** y pone *«Viabilidad del
reparto: Sin evaluar»* en la pantalla de la jefatura en mitad de una sesión.

Es una **falsa alarma** —el camino de asignación en vivo usa comprobaciones rápidas y no depende
de la evaluación guardada— pero da un susto al leerlo, y la invalidación es más amplia de lo
necesario.

**Solución alternativa:** vuelva a lanzar la evaluación desde la página de Planificación. No
pasa nada.

#### A la pantalla compartida le faltan dos agregados (L5)

Faltan dos cifras que el diseño pide al proyector: **cuántos docentes están equilibrados frente
a pendientes** y **cuántos llevan una sobrecarga autorizada**. Los datos agregados que recibe la
pantalla compartida no llevan ninguna de las dos.

Ambas serían cuentas sin nombres, así que es una carencia real y no una ocultación por
privacidad.

### La compilación de producción no sirve tal y como se entrega

Cuando este sitio se compila como paquete estático de producción, su política de seguridad de
contenido bloquea unos seis de los guiones internos del propio marco de documentación. El
resultado es un **diseño colapsado**: la barra lateral se superpone a la columna principal e
intercepta las pulsaciones destinadas al contenido. Además, la raíz del sitio devuelve un 404
desde la salida compilada.

**En la práctica:** afecta al *sitio anfitrión*, no al complemento Reparto, y no ocurre con el
servidor de desarrollo, donde esa política es deliberadamente inerte. Hasta que se corrija, use
el servidor de desarrollo para trabajo real, o corrija la política antes de desplegar.

## Asperezas

Son menores. No le impiden trabajar.

### A veces se nombra a los participantes por identificador

Algunos mensajes de validación compuestos por el servidor se dirigen a un participante mediante
un código interno largo en vez de por su nombre:

> *Participant 54d3f552-5e39-4f2c-a171-d88126972414 is 21.00 hours below the target of 21.00.*

La regla que se comunica es correcta; solo la etiqueta es poco útil. Busque el código en la
página de participantes, o lea la misma información en el panel de balances por participante del
panel principal, que sí usa nombres.

### La asignación puede detenerse para reevaluar la viabilidad

Mientras asigna, puede recibir un rechazo así:

> *La selección está bloqueada porque el testigo determinista no se pudo reparar
> (local_repair_not_found); se requiere una evaluación administrativa de viabilidad.*

Es el sistema funcionando como está diseñado —no le deja continuar sobre una combinación que ya
no puede demostrar— pero llega sin aviso en mitad de una tanda de asignaciones. Vuelva a lanzar
la evaluación desde la página de Planificación y continúe. Consulte
[Solución de problemas](/es/docs/reparto/troubleshooting/#la-selección-está-bloqueada-porque-el-testigo-determinista-no-se-pudo-reparar).

### Dos caminos de renovación no están coordinados

El paquete de autenticación mantiene dos guardas de renovación de credenciales de vuelo único
sin coordinar entre sí: una la usa el cliente de la API y otra la usa la comprobación de
arranque del propio proveedor. Si una página monta ambos caminos sobre una credencial caducada,
los dos pueden lanzar una rotación en vez de una sola, lo que es trabajo desperdiciado y, en
potencia, una condición de carrera.

En la práctica esto suele notarse como una renovación rechazada por carga de página que
sobrevive sin consecuencias, y una consulta de identidad duplicada por cada montaje de
pantalla.

**Nota operativa:** iniciar sesión a mano en una cuenta mientras una ejecución automatizada
(una batería de pruebas, una sesión con guion) ya mantiene abierta esa misma cuenta hace que
el servicio de cuentas revoque todas sus sesiones: dos clientes presentando una misma
credencial de renovación rotatoria es exactamente el patrón de reutilización que está
diseñado para detectar. Eso es el servicio de identidad funcionando correctamente, no esta
aspereza; no inicie sesión a mano en una cuenta que ya esté usando una ejecución automatizada.

## Límites deliberados

Son decisiones, no defectos. No espere que cambien.

### Sin habilitaciones ni reglas de elegibilidad

**Cualquier participante activo puede coger cualquier puesto.** No existe la noción de un docente
habilitado para una materia, restringido a una etapa o curso, vinculado a determinados grupos, ni
marcado como bilingüe o especialista.

La legalidad depende solo de: que el participante esté activo; sus horas restantes exactas; los
puestos que ya tiene; la regla de que dos puestos de una actividad van a docentes distintos; y las
reglas de la sesión y los turnos.

La elegibilidad restringida es una extensión futura documentada. Añadirla es un cambio grande
—haría falta nueva información, un cálculo de viabilidad distinto e interfaces revisadas— así que
no es algo que se pueda activar.

:::caution
Como no hay habilitaciones, la aplicación le dejará dar sin problema un puesto de estadística de
Bachillerato a cualquier participante. Decidir *quién debe* impartir *qué* es su criterio, no el
de la aplicación.
:::

### Sin optimizador automático

Reparto Docente **no** resuelve el plan por usted. Le da balances en vivo, límites duros y
validación inmediata, y usted toma las decisiones. Las actividades secundarias en particular se
añaden a mano, porque elegirlas es el trabajo de planificación.

### Sin edición manual de los puestos generados

No hay creación, edición, creación masiva ni borrado de puestos horarios. Su identidad y sus horas
solo cambian mediante generación o conciliación explícita. Eso es lo que hace que un puesto se
pueda entregar con confianza a un docente.

### Sin asignaciones parciales ni compartidas

Un puesto va a un docente entero. En toda la aplicación no hay casilla de horas, ni tipo de
reparto, ni forma de saltarse el exceso de asignación. Un docente que necesita más horas recibe
primero **horas extra autorizadas**: un acto aparte, motivado y auditado, que sube su objetivo.

### Sin control de estado

El estado del proceso lo gobierna el servidor. No hay control de transición en ninguna parte, y una
petición que intente fijar un estado se rechaza. Abrir una sesión de selección cambia el estado por
sí sola.

### Archivado es terminal

Un proceso **final** se puede reabrir, con un motivo escrito. Un proceso **archivado** no: la
pantalla lo explica y no ofrece control. La exportación final del reparto archiva el proceso, y por
eso pide una confirmación explícita.

### Nada se borra

Las actividades y las celdas de la matriz se **retiran**, las asignaciones se **deshacen** o se
**reasignan**, y las cifras de dotación se **sustituyen**. Si buscaba un botón de borrar, no lo
hay, y ese es precisamente el objetivo.

### Las bases de datos de desarrollo se reinician, no se migran

No hay migración de datos hacia atrás ni capa de compatibilidad con la antigua semántica de
asignación en dos etapas. Una base de datos de desarrollo de una versión anterior se reinicia en
vez de actualizarse.

### Nombrar a la jefatura de departamento exige el directorio de cuentas

Asignar el campo **Jefe de departamento** de un departamento exige buscar la cuenta destino en el
directorio de cuentas, y esa búsqueda está restringida a superadministradores. Un administrador
puede *vaciar* el campo pero normalmente no puede *rellenarlo*. Es una decisión propia del
servicio de identidad sobre quién puede usar su directorio, no una restricción de Reparto, y
Reparto no puede ampliarla.

Como el campo no autoriza absolutamente nada
([por qué](/es/docs/reparto/roles/#quién-es-la-jefatura-de-departamento)), esto no cambia nada
sobre quién puede dirigir un departamento.

### El proyector funciona con la sesión de un participante

El acceso de lectura a un proceso sigue la participación. Una cuenta que no participa en ningún
proceso de un departamento no obtiene ningún acceso de lectura a su proceso —ni siquiera a la
pantalla compartida, que es de solo lectura.

**En la práctica:** una «cuenta de proyector» sin más, que no participe, ve *«Todavía no hay
procesos.»* y ni siquiera pregunta al servidor por el proceso. Se acepta como un límite
permanente y no se persigue como algo que arreglar: no existe un permiso de proyector de solo
lectura independiente de la participación. Use la sesión de la jefatura de departamento o la de
un participante para la pantalla compartida.

### La revisión de esquema se genera en el primer arranque

El repositorio no incluye ningún fichero de revisión de esquema. Las migraciones se generan a
partir de los metadatos declarados de los modelos, y nunca se escriben desconectadas de ellos:
la revisión se produce la primera vez que se levanta la infraestructura, a partir de los
modelos tal y como están en ese momento, y se aplica entonces. Es una política deliberada, no
un descuido.

**Nota para quien opera el sistema:** una instalación tiene que completar un primer arranque
correcto antes de que la aplicación sea utilizable. Si espera encontrar en el repositorio un
fichero de migración ya escrito, no lo encontrará; esa ausencia es el diseño, no una carencia.

## Límites operativos

La comprobación de viabilidad resuelve un problema genuinamente difícil, así que está acotada en
vez de ser ilimitada:

- Puede responder **Desconocida** cuando agota el esfuerzo permitido. Desconocida se trata como *no
  demostrada* y bloquea igual que *Irrealizable*.
- El objetivo operativo validado es de aproximadamente **30 participantes y 100 puestos activos**.
  Los departamentos mayores no se rechazan, pero Desconocida se vuelve más probable.
- El resolutor completo solo se ejecuta por vías administrativas. Nunca lo dispara un docente y
  nunca se ejecuta durante la asignación en vivo, que usa comprobaciones rápidas y una combinación
  guardada.

## Qué significa esto en la práctica

Para un departamento que haga un reparto **hoy**:

| Quiere… | ¿Puede? |
| --- | --- |
| Configurar un departamento y su matriz | ✅ Sí, completamente. |
| Construir, equilibrar, validar y bloquear un plan | ✅ Sí, completamente. |
| Generar los puestos docentes | ✅ Sí, completamente. |
| Asignar todos los puestos como jefatura | ✅ Sí, incluidos deshacer y reasignar. |
| Registrar cambios de dotación y conciliarlos | ✅ Sí, completamente. |
| Generar documentos borrador, provisionales y finales | ✅ Sí. |
| Capturar versiones, comparar, respaldar y auditar | ✅ Sí. |
| Que el profesorado elija sus puestos en directo | ❌ No — véanse [los bloqueos de la sesión](#la-sesión-en-directo-no-se-puede-gestionar-desde-la-interfaz). |
| Celebrar una sesión ordenada por turnos | ❌ No — los controles no llevan acción. |
| Proyectar desde una cuenta no participante | ❌ No — use la sesión de la jefatura o de un participante. |
| Desplegar como compilación estática de producción | ⚠️ No tal y como se entrega — el diseño se colapsa. |

En resumen: **hoy la jefatura de departamento puede completar todo el reparto. La sesión en
directo dirigida por el profesorado, no.**

---

**Anterior:** [← Versiones, exportaciones y auditoría](/es/docs/reparto/versions-exports-audit/) ·
**Siguiente:** [Solución de problemas →](/es/docs/reparto/troubleshooting/)
