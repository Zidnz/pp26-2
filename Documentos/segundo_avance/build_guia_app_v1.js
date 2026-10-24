// Construye Mientras_Guia_App_v1.docx (v1.0 · 21 oct 2026) para el segundo avance.
// Describe Frontend/ (app «Mientras») en la versión del 20 oct 2026, 23:10 (bitácora).
// Capturas: Chromium sin interfaz a 412 × 900 px, escala 2, con los casos de ejemplo de seed() (datos simulados). Ver fig/app/.
// Los resultados de la prueba se copiaron de la salida de `node tests/prueba_asignacion.js` corrida el 21 oct 2026.
// Ejecutar desde Documentos/segundo_avance/:  node build_guia_app_v1.js ../Mientras_Guia_App_v1.docx
const path = require('path');
const { P, H1, H2, H3, B, lista, esp, T, CAJA, CODIGO, FIGURA, FILA_IMG, titulo, indice, construir } = require('./comun_docx');
const fig = (a) => path.join(__dirname, 'fig', a);
const app = (a) => path.join(__dirname, 'fig', 'app', a);
const C = []; const add = (...x) => x.flat().forEach((e) => C.push(e));

add(titulo('Control del documento'));
add(T(['Campo', 'Valor'], [
  ['Documento', 'Guía de la app «Mientras» · Relevo por horas para quien cuida'],
  ['Versión', '1.0 · 21 de octubre de 2026 (primera versión)'],
  ['Objeto descrito', '`Frontend/` (index.html, css/app.css, js/) en la versión del 20 oct 2026, 23:10: priorización de relevos con bolsa de horas.'],
  ['Para qué entrega', 'Segunda revisión del proyecto integrador (2 al 6 de noviembre de 2026). Documenta los dos perfiles mínimos que pide el problema prototípico («Necesito cuidado» y «Puedo cuidar») y el flujo de solicitud, vinculación, seguimiento y evaluación.'],
  ['Relación con otros documentos', 'El **Documento maestro v2.0** explica por qué el programa es relevo por horas. La **Guía del tablero v2.0** y el **Documento técnico v2.0** describen el Observatorio, que es otro producto: la app no le manda datos.'],
  ['Nombre', '«Mientras» y su eslogan son **provisionales** (propuesta del 20 oct); se cambian en `js/config.js`.'],
  ['Elaboró', 'Omar Gutiérrez Escoto (líder de proyecto)'],
  ['Revisa', 'Pendiente: Daniel Cureño Martínez (protección de datos) o Alondra Danae Madrigal García (regla de doble revisión)'],
  ['Estado', 'Borrador para revisión. La app no tiene doble revisión y trabaja con **datos simulados**.'],
], [2.4, 6.96]));
add(esp(160));
add(CAJA('Cómo leer este documento', [
  'Las secciones 1 a 3 dicen qué es la app y cómo se abre. La sección 4 recorre una solicitud paso a paso con capturas. Las secciones 5 a 7 explican cómo decide a quién y cuántas horas. Las secciones 8 y 9 cubren el lado «Puedo cuidar» y el seguimiento. La sección 10 trata los datos personales y la 11 lo que todavía no está validado.',
  'Todas las capturas usan los casos de ejemplo de la app. **Son datos simulados**: demuestran que el flujo funciona, no que el programa sirve. Los nombres de las capturas son alias inventados.',
]));
add(...indice());

// 1
add(H1('1. Qué es Mientras'));
add(P('Mientras es el prototipo de la app del programa de innovación social. Organiza **relevo por horas** para quien cuida en casa, sin pago, a una persona mayor o con discapacidad: unas horas a la semana en que una persona de relevo verificada cuida, para que la cuidadora familiar descanse, trabaje o atienda lo suyo.'));
add(P('Es la forma operativa de la **opción C**, elegida el 5 oct 2026: la cuidadora familiar de alta intensidad pide el relevo, la persona cuidada recibe las horas y una cuidadora remunerada las presta.'));
add(H2('1.1 Qué no es'));
add(T(['No es', 'Por qué'], [
  ['Un buscador de cuidadoras', 'Desconocer que existen servicios explica 0.9 % de la no búsqueda (ENASIC 2022). La hipótesis de «encontrar cuidadora» se descartó el 22 sept; `matching.js` y `clasificador.js` salieron de la app el 8 oct.'],
  ['Un catálogo donde la familia elige', 'El programa asigna a la persona de relevo según la prioridad del caso; no hay calificaciones ni perfiles para escoger.'],
  ['Un servicio de enfermería', 'La lista de tareas es cerrada y no incluye tareas clínicas.'],
  ['Una app que ya funcione con personas reales', 'Todo lo que muestra es simulado y se guarda en el navegador (`localStorage`). No hay servidor.'],
], [2.6, 6.76]));
add(H2('1.2 Relación con el Sistema Público de Cuidados'));
add(P('La app se presenta como «un componente complementario del Sistema Público de Cuidados» y lo dice en pantalla: «Las horas dependen del presupuesto del programa». Lo que proponemos es vincularla con el programa «Ciudad que Cuida a Quien Cuida» de la CDMX. Según la nota de UnoTV del 28 may 2026, ese programa da hasta $6,000 al año en tres pagos a 5,000 personas cuidadoras de 18 a 56 años, con 39 millones de pesos.'));
add(CAJA('Lo que esto no significa', [
  'No existe ningún acuerdo con ese programa. Es una propuesta. Además, ese programa entrega **dinero**, no horas: la vinculación tendría que diseñarse. Y su tope de edad (56 años) deja fuera a muchas cuidadoras mayores; la app no tiene ese tope.',
], 'ambar'));

// 2
add(H1('2. Cómo se abre'));
add(P('Es HTML, CSS y JavaScript sin dependencias de compilación. Se abre con doble clic en `Frontend/index.html` o desde un servidor estático. En escritorio se ve dentro de un marco de teléfono.'));
add(CODIGO(['# desde Frontend/', 'python -m http.server 8000', '# la prueba del reparto de horas', 'node tests/prueba_asignacion.js']));
add(esp());
add(T(['Archivo', 'Qué hace'], [
  ['`index.html`', 'Estructura de las cuatro pestañas y los diálogos (solicitud, detalle, registro de relevo, asignación).'],
  ['`js/config.js`', '**Todos los parámetros que deciden quién recibe cuántas horas**: bolsa, mínimo, tope, umbrales, envejecimiento, pesos, chequeos y textos. Ninguno está aprobado.'],
  ['`js/prioridad.js`', 'Entrevista, puntaje, niveles, envejecimiento, reparto de la bolsa, Zarit, Barthel y chequeos. Funciones puras: las usa la app y la prueba.'],
  ['`js/relevo.js`', 'Paquetes, tipo de jornada, costo y asignación por restricciones.'],
  ['`js/data.js`', 'Catálogos, casos de ejemplo (`seed()`) y almacenamiento (clave `mientras-v3`).'],
  ['`js/legal.js`, `js/red.js`, `js/app.js`', 'Parámetros legales y requisitos; red del hogar; interfaz.'],
  ['`tests/prueba_asignacion.js`', 'Prueba de Node del reparto con 100 personas simuladas (sección 6.3).'],
], [2.6, 6.76]));
add(P('Las ilustraciones se leen del Observatorio por ruta (`observatorio/ilustraciones/`): si se copia la app sin esa carpeta, pierde las imágenes.'));

// 3
add(H1('3. Las cuatro pestañas'));
add(T(['Pestaña', 'Para quién', 'Qué hace'], [
  ['Necesito', 'La cuidadora familiar y el programa', 'Botón «Solicitar relevo» y lista de casos ordenados por puntaje efectivo, con nivel, horas al mes, canal de origen y marcas de revisión. Filtros: Todos, En cola, Con relevo, Revisión.'],
  ['Puedo cuidar', 'Las personas de relevo', 'Registro con documentos, certificación, disponibilidad y cupo. «No eliges familia ni la familia te elige».'],
  ['Seguimiento', 'El programa', 'Programa (bolsa, niveles, puntajes por canal, revisiones y apelaciones), Visitas del día, Caso (red del hogar), Mapa y KPI.'],
  ['Ajustes', 'El equipo', 'Distancia máxima, prestaciones, bolsa simulada, parámetros con su fuente, marco legal, exportar e importar.'],
], [1.6, 2.4, 5.36]));
add(FILA_IMG([[app('01_necesito.jpg'), 'Necesito: casos en cola por puntaje'], [app('02_detalle_caso.jpg'), 'Detalle de un caso'], [app('11_puedo_cuidar.jpg'), 'Puedo cuidar']], 330));
add(P('Las barras superiores siempre dicen «prototipo · datos simulados».', { size: 18, color: '5D6278' }));

// 4
add(H1('4. Solicitar relevo, paso a paso'));
add(FIGURA(fig('f_app_flujo.png'), 'Flujo de una solicitud: siete pasos y después la cola del programa.'));
add(P('El ejemplo de las capturas es una solicitud referida por el DIF: Rosa cuida a Doña Elena, en Iztacalco.'));
add(H2('4.1 Cómo llega (paso 1)'));
add(P('Hay dos vías y `canal_origen` es obligatorio. **Autorregistro:** la persona entra sola. **Referencia institucional:** una persona del DIF, un centro de salud, una escuela, una clínica o un módulo del programa llena un formulario corto (institución, cargo de quien refiere sin su nombre y la casilla «La persona referida está presente y quiere continuar»).'));
add(P('**Por qué dos vías.** Quien busca ayuda por su cuenta no es necesariamente quien más la necesita: la ENASIC muestra que casi nadie busca servicios (3.0 %) y que el grupo del problema dice «no tuve necesidad». Si solo hubiera autorregistro, la cola se llenaría de quienes ya buscan. La referencia institucional es la forma de llegar a quien no pide.'));
add(FILA_IMG([[app('03_entrada.jpg'), 'Entrada: dos vías'], [app('03b_entrada_referencia.jpg'), 'Referencia del DIF'], [app('04_registro.jpg'), 'Registro con alias']], 330));
add(H2('4.2 Registro y consentimiento (pasos 2 y 3)'));
add(P('El registro pide solo alias y sexo de quien cuida y de la persona cuidada, y la alcaldía (para asignar relevo cerca). **No pide CURP, diagnósticos, edad ni domicilio.** El sexo de quien cuida se pide porque entra al puntaje (sección 5); la pantalla lo dice.'));
add(P('Antes de la entrevista hay consentimiento **expreso** para datos sensibles: horas de cuidado, actividades y tareas de salud, dependencia de la persona cuidada y sobrecarga. Sin las dos casillas no se avanza. El aviso de privacidad todavía es un marcador: `[Aviso de privacidad — pendiente revisión legal, Daniel]`.'));
add(H2('4.3 Entrevista (pasos 4 a 6)'));
add(T(['Bloque', 'Qué pregunta', 'Para qué se usa'], [
  ['1 · Tu cuidado', 'Horas a la semana (`P6_7 + P6_26`), cinco actividades básicas (`P6_2`), cuatro tareas de salud (`P6_2`), «¿necesita que otra persona le apoye para poder cuidar?» (`P6_9_4 / P6_28_4`) y «¿se le dificulta cuidar porque le falta fuerza física?» (`P6_9_1 / P6_28_1`). Mismas preguntas y categorías que la ENASIC 2022.', '**El puntaje.** No se preguntan las variables con 0 puntos (si cuida a persona con discapacidad, si tiene 60 años o más), por minimización.'],
  ['2 · Cómo te sientes', '22 reactivos con estructura tipo Zarit, respuesta 0 a 4. Los textos tienen derechos de autor: la app muestra `[Reactivo Zarit n — requiere licencia]`. Se puede dejar vacío.', 'Seguimiento y chequeos de consistencia. **No cambia el puntaje** (decisión de Omar, 20 oct).'],
  ['3 · La persona que cuidas', 'Índice de Barthel: 10 actividades de la vida diaria, total de 0 a 100.', 'Chequeos de consistencia y contexto del caso.'],
], [1.6, 4.6, 3.16]));
add(FILA_IMG([[app('06_entrevista1.jpg'), 'Bloque 1: variables del puntaje'], [app('07_entrevista2_zarit.jpg'), 'Bloque 2: marcadores de Zarit'], [app('08_entrevista3_barthel.jpg'), 'Bloque 3: Barthel']], 330));
add(H2('4.4 Resultado (paso 7)'));
add(P('La pantalla da el nivel, el puntaje sobre 20, la leyenda **«Puntaje provisional — modelo en validación»**, los tres factores que más pesaron, las horas estimadas con la bolsa actual, el aviso de que es un componente complementario y el botón **«Solicitar revisión»**. Si el nivel es Baja, agrega un bloque «Además de tus horas» con canales alternos (redes de apoyo, centros de día, módulo del programa); el directorio real está **pendiente**. Al final la persona elige días, hora y tareas, y entra a la cola.'));
add(FILA_IMG([[app('09a_resultado.jpg'), 'Resultado: nivel, factores y horas'], [app('09b_resultado.jpg'), 'Revisión y preferencias'], [app('10_cola.jpg'), 'El caso entra a la cola']], 330));
add(CAJA('Lo que muestra el ejemplo', [
  'Rosa declaró 56 h, tres actividades básicas, una tarea de salud, «requiere apoyo» y «le falta fuerza». Con eso llega a **20 de 20 puntos**: el máximo. Cualquier persona que conteste «sí» a todo y cuide 40 h o más llega al tope. La tarjeta no distingue entre quienes están en ese extremo, y esas son justo las respuestas más fáciles de inflar (sección 11).',
  'La ilustración del nivel Alta es una cuidadora agotada. La bitácora del 20 oct ya propone cambiarla: muestra el agotamiento en el momento en que se da el resultado, en lugar del relevo.',
], 'ambar'));

// 5
add(H1('5. Cómo decide la prioridad'));
add(H2('5.1 El puntaje: tarjeta de puntos «completa» (script 22)'));
add(P('No hay un modelo serializado que la app pueda cargar (`modelo.archivo = null`), así que la app usa la **tarjeta de puntos** del script 22 como regla transparente. Variante «completa», objetivo «algún daño» (DEC-OBJ-001), ajustada con la ENASIC 2022 **nacional**.'));
add(T(['Variable', 'Pregunta (ENASIC)', 'Puntos'], [
  ['Cuida 40 h o más a la semana', '`P6_7 + P6_26`', '5'],
  ['Le falta fuerza física', '`P6_9_1 / P6_28_1`', '4'],
  ['Al menos una tarea de salud', '`P6_2_10…13`', '3'],
  ['Requiere apoyo de otra persona para cuidar', '`P6_9_4 / P6_28_4`', '3'],
  ['Mujer', 'SEXO (registro)', '2'],
  ['Ayuda en 3 o más actividades básicas', '`P6_2_01…08`', '2'],
  ['Ayuda en al menos 1 actividad básica', '`P6_2_01…08`', '1'],
  ['80 h o más, cuida a persona con discapacidad, tiene 60+', '—', '0 (no se preguntan)'],
  ['**Máximo**', '', '**20**'],
], [4.2, 3.0, 2.16]));
add(esp(120));
add(P('Junto al puntaje, el detalle de cada caso muestra la **regla de referencia** («≥ 40 h/sem: dentro o fuera») con la nota «La tarjeta no la supera de forma demostrable (script 22)».'));
add(CAJA('Lo más importante de esta sección', [
  'La tarjeta **no selecciona mejor que la regla de 40 h**. En el script 22, con el mismo cupo de 40.7 %, la variante completa encuentra +2.1 pp más personas con daño que la regla (IC 90 % −3.7 a 8.0). Con el umbral de 8 puntos que usa la app: +2.2 pp (IC −3.4 a 7.7). Los dos intervalos incluyen el cero. El script 22 es exploratorio y no tiene doble revisión.',
  'La app la usa para **ordenar y repartir**, no porque encuentre a más personas. Si el equipo decide usar solo la regla de 40 h, basta con cambiar los pesos en `config.js`.',
], 'alerta'));
add(H2('5.2 Niveles y envejecimiento en cola'));
add(T(['Concepto', 'Regla', 'Respaldo'], [
  ['Nivel Alta', 'Puntaje efectivo ≥ 13', '**Ninguno.** Corte provisional sin respaldo empírico.'],
  ['Nivel Media', 'Puntaje efectivo ≥ 8', 'Umbral operativo del script 22: con 8 puntos se selecciona más o menos la misma proporción que con la regla de 40 h.'],
  ['Nivel Baja', 'Menos de 8', 'Recibe el mínimo garantizado y el canal alterno.'],
  ['Envejecimiento', '+0.5 puntos por semana sin relevo, con tope de 4', 'Provisional. Con estos valores, un caso de 4 puntos llega a Media en 8 semanas.'],
  ['Puntaje efectivo', 'Base + envejecimiento', 'Es el que ordena la cola y reparte la bolsa.'],
], [2.0, 3.2, 4.16]));

// 6
add(H1('6. Cómo reparte las horas'));
add(H2('6.1 Qué se raciona'));
add(P('Lo que se raciona es una **bolsa mensual de horas subsidiadas** (`presupuesto_horas_mes`). En el archivo vale 2,000 h al mes, que es **ilustrativo**: el piloto no tiene presupuesto. Los casos de ejemplo usan una bolsa **simulada** de 260 h para los casos de ejemplo (control en Ajustes), porque con 2,000 h todos llegan al tope y no se ve el reparto.'));
add(H2('6.2 El algoritmo (`asignarHoras` en prioridad.js)'));
const n1 = lista();
add(n1('**Mínimo garantizado:** 13 h al mes (≈ 3 h a la semana, el paquete más chico de la opción C) a cada caso valorado.'));
add(n1('**Si la bolsa no alcanza para todos los mínimos** (bolsa < casos × 13), el mínimo va primero a los puntajes efectivos más altos y el resto queda en cola con 0 h ese mes, con su puntaje envejeciendo.'));
add(n1('**Lo que sobra** se reparte en proporción al puntaje efectivo, con **tope de 52 h al mes por hogar** (≈ 12 h a la semana). Lo que rebasa el tope se redistribuye entre los demás.'));
add(n1('**Horas enteras:** primero el piso y luego el mayor residuo, sin pasar el tope ni la bolsa.'));
add(n1('**Paquete semanal:** horas del mes ÷ 4.33, hacia abajo.'));
add(H2('6.3 Lo que mostró la prueba'));
add(P('`node tests/prueba_asignacion.js` simula 100 personas (semilla 20261020) con los valores de `config.js`. Resultado del 21 oct 2026: todas las verificaciones pasan.'));
add(T(['Escenario', 'Resultado', 'Lectura'], [
  ['1 · Bolsa de 2,000 h', 'Se usan 2,000 h. Mínimo 13, máximo 27 h/mes. Alta (43 personas) 23.5 h en promedio; Media (31) 18.5 h; Baja (26) 16.1 h. Nadie recibe menos de 13 h.', 'Con los mínimos, la diferencia entre niveles es chica: Alta recibe ≈ 7 h al mes más que Baja.'],
  ['2 · Bolsa de 1,000 h (los mínimos piden 1,300)', 'Se usan 988 h. **24 personas quedan en cola** con 0 h; las demás reciben 13 h.', '«Nadie queda fuera» depende de la bolsa, no del código.'],
  ['3 · Bolsa de 6,000 h', 'Todos llegan al tope de 52 h; sobran 800 h.', 'Con bolsa holgada, el puntaje ya no decide nada.'],
], [2.4, 4.0, 2.96]));
add(CAJA('Supuesto sin validar', [
  'Repartir en proporción al puntaje supone que 10 puntos equivalen al doble de necesidad que 5. Nadie lo ha validado: la tarjeta se ajustó para ordenar, no para medir cuánta necesidad hay.',
], 'ambar'));

// 7
add(H1('7. Revisión humana y apelación'));
add(H2('7.1 Chequeos de consistencia'));
add(P('Cuatro chequeos comparan respuestas entre sí. Si uno salta, el caso va a **revisión humana**; el puntaje **no cambia**.'));
add(T(['Chequeo', 'Cuándo salta', 'Qué verifica'], [
  ['Horas contra Barthel', '40 h o más, Barthel ≥ 90 y sin tareas de salud', 'Mucha carga declarada para una persona casi independiente'],
  ['Actividades contra Barthel', 'Ayuda en 3 o más actividades básicas y Barthel = 100', 'Ayuda declarada en lo que la persona hace sola'],
  ['Horas inverosímiles', '140 h o más a la semana', 'Error de captura o más de una persona cuidada'],
  ['Zarit contra fuerza', 'Zarit ≤ 20 con «le falta fuerza» y «requiere apoyo»', 'Sobrecarga baja con las dos respuestas que más suben el puntaje'],
], [2.2, 3.4, 3.76]));
add(P('Los cortes son provisionales y el de Zarit no funciona hasta que haya reactivos con licencia.'));
add(H2('7.2 Apelación'));
add(P('El resultado tiene el botón «Solicitar revisión»: la persona escribe por qué cree que su valoración no refleja su situación y queda registrado con el caso. El programa lo resuelve desde el detalle del caso; si cambia una respuesta, se vuelve a entrevistar.'));

// 8
add(H1('8. El lado «Puedo cuidar»'));
add(P('La persona de relevo se registra con nombre, alcaldía, certificación (certificada, en proceso, no), días, horario, horas máximas a la semana y tareas que cubre. Sube CURP, identificación, carta de no antecedentes y una referencia, y acepta contrato, IMSS y pago al piso legal. El registro pasa a **revisión** y el programa lo aprueba o lo rechaza con motivo. **Sin certificación vigente no recibe asignaciones.**'));
add(P('La CURP solo se pide aquí y no a la familia (decisión de Omar, 20 oct). La verificación se sostiene en el riesgo de estafa por terceros documentado en México (el «pensionazo»), no en la cifra de maltrato familiar.'));
add(H2('8.1 Asignación (el «matching»)'));
add(P('El problema prototípico pide un modelo de matching. El de Mientras es **por restricciones**, no por puntaje: la persona de relevo tiene que estar aprobada y certificada, estar cerca (≤ 12 km entre centros de alcaldía, ajustable), estar disponible esos días y horas, tener cupo y cubrir las tareas. Entre las que cumplen, gana la más cercana; si hay empate, la de menor carga. Se propone una sola persona.'));
add(P('**Por qué no un matching ponderado.** La suma ponderada pertenecía a la hipótesis de «encontrar cuidadora», que la evidencia descartó. Si ninguna persona cumple, la app dice qué restricción falla, y eso hace visible el cuello de botella (por ejemplo, la certificación). Queda pendiente confirmar con la profesora que esto cumple el requisito de matching.'));
add(H2('8.2 Paquete y costo'));
add(P('Paquetes de 3, 6, 9 o 12 h a la semana, con horario fijo y lista cerrada de tareas sin tareas clínicas. El costo usa el salario mínimo profesional de trabajo del hogar ($342.47 al día, **por verificar vigencia**) dividido entre 8, 7.5 o 7 según la jornada (diurna, mixta o nocturna), y 4.33 semanas por mes. Las prestaciones están en 0 % hasta que Daniel defina el factor.'));

// 9
add(H1('9. Seguimiento y ajustes'));
add(T(['Vista', 'Qué muestra'], [
  ['Programa (nuevo, 20 oct)', 'Bolsa del mes, mínimos garantizados, casos por nivel con sus horas promedio, **puntajes base por canal de origen** (un punto por caso, mediana y cortes de nivel), casos en revisión humana y apelaciones abiertas. Botón «Aplicar horas del ciclo».'],
  ['Visitas', 'Visitas del día: llegó, salió, no llegó, canceló.'],
  ['Caso', 'Red del hogar (quién sostiene y quién apoya en parte), índice de fragilidad propio del prototipo, horas sin cubrir, dos preguntas semanales (cansancio y malas noches) e incidentes en ambos sentidos.'],
  ['Mapa', 'Casos por alcaldía con su tipo de red (un sostén, parcial, distribuida). El punto va en el centro de la alcaldía: no se guardan domicilios.'],
  ['KPI', 'Marcados **SIMULADO**: casos y % dentro de la regla, días a la asignación, horas entregadas, puntualidad, ausencias, incidentes por 100 h, continuidad, respuesta semanal, cansancio, personas certificadas y cupo libre. Exporta solo agregados (`operacion_agregados_SIMULADO.json`).'],
  ['Ajustes', 'Distancia máxima, prestaciones, bolsa simulada, parámetros de priorización con su fuente, marco legal, exportar, importar, restaurar ejemplo y borrar todo.'],
], [2.2, 7.16]));
add(FILA_IMG([[app('12a_prog.jpg'), 'Programa: bolsa y puntajes por canal'], [app('12_seg_caso.jpg'), 'Caso: red del hogar'], [app('12_seg_kpi.jpg'), 'KPI simulados']], 330));
add(CAJA('El panel por canal no es un hallazgo', [
  'El panel muestra que el autorregistro tiene puntajes más bajos que la referencia institucional (en las capturas, promedio 7.8 contra 15.5). **Los casos de ejemplo se armaron así a propósito** para que el panel se vea. Con datos reales, ese panel es la forma de medir si el autorregistro capta a cuidadoras de menor intensidad.',
], 'alerta'));

// 10
add(H1('10. Datos personales'));
add(T(['Principio', 'Cómo se aplica en la app', 'Pendiente'], [
  ['Minimización', 'La familia no da CURP, nombre completo, diagnósticos, edad ni domicilio. Se quitaron del registro el daño a la salud y al trabajo, el parentesco y la red de apoyos. Solo se pregunta lo que usan el puntaje o la asignación.', 'Revisar si «mujer» (2 puntos) debe seguir: priorizar por sexo en un programa público necesita justificación jurídica.'],
  ['Consentimiento', 'Expreso y antes de la entrevista, porque hay datos sensibles (salud, dependencia, sobrecarga).', 'Aviso de privacidad real (hoy es un marcador).'],
  ['Ley aplicable', '—', 'Particulares o sujetos obligados, según la institución receptora y la reforma de 2025 (Daniel).'],
  ['Identidad', 'La valida la institución fuera de la app. La CURP solo se pide a la persona de relevo.', '—'],
  ['Exportación', '«Exportar todo» incluye alias y respuestas de salud. Con datos reales, ese archivo no sale de la institución. Al Observatorio solo llegarían agregados.', 'Política de conservación y eliminación.'],
], [1.7, 4.4, 3.26]));

// 11
add(H1('11. Lo que todavía no está validado'));
add(P('Esta lista es lo que un evaluador puede atacar. Viene de la bitácora del 20 oct (23:10) y del README de la app.'));
add(T(['#', 'Punto débil', 'Por qué importa'], [
  ['1', 'La tarjeta no supera a la regla de 40 h (script 22).', 'Usar 8 variables cuando una basta pide más datos sensibles sin ganar en selección.'],
  ['2', 'Reparto proporcional al puntaje.', 'Supone una relación lineal entre puntos y necesidad que nadie validó. Con los mínimos, la diferencia entre niveles es chica.'],
  ['3', '«Le falta fuerza» (4) y «requiere apoyo» (3) son autodeclaradas con un sí y conservan su peso.', 'Son las más fáciles de inflar. El chequeo de Zarit que las cruza no funciona sin reactivos.'],
  ['4', 'Efecto techo: con 40 h o más y «sí» a todo se llega a 20 de 20.', 'La tarjeta no distingue dentro del grupo de mayor carga.'],
  ['5', 'Las actividades básicas no se midieron en la ENASIC para 384 de 407 cuidadoras de «solo 60+ sin discapacidad».', 'La app las pregunta a todas: aplica pesos en un grupo donde no se estimaron.'],
  ['6', 'Variable «mujer» = 2 puntos.', 'Necesita dictamen jurídico (Daniel). En el script 22 la tarjeta quita cobertura a los hombres.'],
  ['7', 'Niveles, mínimo, tope y envejecimiento son provisionales; Alta ≥ 13 no tiene respaldo.', 'Son decisiones de política, no resultados.'],
  ['8', 'Zarit sin licencia; Barthel sin versión en español con sus condiciones de uso; reactivos ENASIC sin redacción literal verificada.', 'Los instrumentos todavía no se pueden aplicar a personas.'],
  ['9', 'Directorio del canal alterno vacío.', 'El nivel Baja no tiene a dónde ir más allá de su mínimo.'],
  ['10', 'Ilustraciones: Alta muestra agotamiento, Media usa a la persona de relevo, todos los casos son personas mayores.', 'Refuerza estigma y no representa discapacidad infantil ni hombres que cuidan (reemplazos propuestos en la bitácora).'],
  ['11', 'No se probó en un teléfono real ni en Safari.', '—'],
], [0.4, 4.4, 4.56]));
add(H2('11.1 Pendientes y responsables'));
add(T(['Pendiente', 'Responsable'], [
  ['Licencia y versión validada en México de Zarit; Barthel en español', 'Por asignar'],
  ['Aviso de privacidad, ley aplicable y dictamen sobre puntuar por sexo', 'Daniel'],
  ['Valores definitivos de `config.js` (bolsa, mínimo, tope, umbral Alta, envejecimiento)', 'Equipo'],
  ['Directorio real del canal alterno por alcaldía', 'Por asignar'],
  ['Confirmar con la profesora si la asignación por restricciones cumple el requisito de matching', 'Omar'],
  ['Doble revisión de `prioridad.js`, la prueba y esta guía', 'Daniel o Alondra Danae'],
], [6.4, 2.96]));

construir({
  portada: fig('portada_guia_app.jpg'), encabezado: 'Guía de la app Mientras v1.0', pie: 'Prototipo con datos simulados  ·  Pendiente de doble revisión',
  meta: { title: 'Guía de la app Mientras v1.0', description: 'Cómo se usa la app de relevo por horas, cómo decide prioridad y horas, y qué no está validado' },
  C, salida: process.argv[2] || 'Mientras_Guia_App_v1.docx',
});
