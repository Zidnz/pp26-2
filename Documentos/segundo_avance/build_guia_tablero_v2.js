// Construye Observatorio_Cuidado_Guia_Tablero_v2.docx (v2.0 · 21 oct 2026) para el segundo avance.
// Actualiza la Guía del tablero v1.0 (9 oct 2026) al Observatorio del 20 oct 2026.
// Las cifras se tomaron de la página renderizada en Chromium sin interfaz (1440 px) el 21 oct 2026; las capturas están en fig/obs/.
// Ejecutar desde Documentos/segundo_avance/:  node build_guia_tablero_v2.js ../Observatorio_Cuidado_Guia_Tablero_v2.docx
const path = require('path');
const { P, H1, H2, H3, B, lista, esp, T, CAJA, FIGURA, titulo, indice, construir } = require('./comun_docx');
const fig = (a) => path.join(__dirname, 'fig', a);
const C = []; const add = (...x) => x.flat().forEach((e) => C.push(e));

add(titulo('Control del documento'));
add(T(['Campo', 'Valor'], [
  ['Documento', 'Guía del tablero — Observatorio del Cuidado'],
  ['Versión', '2.0 · 21 de octubre de 2026 (sustituye a la v1.0 del 9 de octubre)'],
  ['Objeto descrito', '`Frontend/observatorio/index.html` en la versión del 20 oct 2026, después de la actualización de «¿Cuánto cuesta?» con el modelo de sostenibilidad (script 20).'],
  ['Para qué entrega', 'Segunda revisión del proyecto integrador (2 al 6 de noviembre de 2026). Es la evidencia de la UCA de Inteligencia de Negocios: el Observatorio es su tablero (confirmado por Omar el 15 oct 2026).'],
  ['Relación con otros documentos', 'El **Documento técnico v2.0** explica con qué está hecho y cómo se conecta; esta guía explica qué dice cada gráfica y por qué se eligió. El **Documento maestro v2.0** usa sus hallazgos.'],
  ['Proyecto', 'Proyecto prototípico 7.º semestre LCDN · Equipo 3 · PP 26-2'],
  ['Elaboró', 'Omar Gutiérrez Escoto (líder de proyecto)'],
  ['Revisa', 'Pendiente: Daniel Cureño Martínez o Alondra Danae Madrigal García (regla de doble revisión)'],
  ['Estado', 'Borrador para revisión. El Observatorio sigue pendiente de doble revisión.'],
], [2.4, 6.96]));
add(esp(160));
add(CAJA('Cómo leer este documento', [
  'Cada pestaña se describe con la pregunta que responde, el mensaje que queremos dejar y una tabla con sus tarjetas: qué muestra, qué queremos que se entienda y por qué se eligió esa forma.',
  'Las cifras se copiaron de la página abierta en Chromium el 21 oct 2026, no de memoria. Los motivos de diseño vienen del README del Observatorio y de `Documentos/bitacora-decisiones.md`. Donde no hay motivo escrito, la columna «Por qué esa forma» describe para qué sirve la gráfica en el relato.',
  'La sección 7 lista lo que un evaluador puede atacar. Algunos puntos de la v1.0 se resolvieron y otros siguen abiertos; aparecen con su estado.',
]));
add(...indice());

// ── 0. Qué cambió
add(H1('1. Qué cambió desde la v1.0'));
add(P('Entre el 9 y el 20 de octubre el Observatorio cambió en seis puntos. Ninguno movió una cifra ya publicada, salvo la tarjeta de subsidio, que cambió de producto (de media jornada a relevo por horas).'));
add(T(['Fecha', 'Pestaña', 'Cambio', 'Efecto en el relato'], [
  ['13 oct', '¿A quién primero?', 'Ampliación del modelo de focalización: ocho formas de elegir, cobertura por cupo, importancia de variables, calibración y la tarjeta «¿Qué objetivo conviene?».', 'La comparación deja de ser «regla contra dos modelos» y pasa a ser contra seis familias. El resultado no cambia: con «algún daño», nada supera a la regla.'],
  ['13 y 20 oct', '¿Cuánto cuesta?', 'Tarjeta de costo por tipo de jornada (script 19), con selector de carga laboral desde el 20 oct.', 'Muestra que el relevo nocturno cuesta 14.3 % más por hora y que la carga laboral lo encarece.'],
  ['14 oct', 'Inicio', 'El embudo pasa de cinco escenas 3D a una pantalla de «selección de personaje» con un mapa de México relleno.', 'Misma cifra (≈ 776 mil); forma más legible. El mapa mide proporción, no ubicación (ver 6.2).'],
  ['15 oct', 'Inicio', 'Las cuatro «razones» con cifra del bloque «Los datos que cuidan» se sustituyen por cuatro tarjetas descriptivas en carrusel (Qué es, Qué mide y qué no, De dónde sale cada dato, Qué tan firme es).', 'El Inicio deja de adelantar hallazgos. Se resuelven los puntos 1 y 3 de la v1.0.'],
  ['15 oct', 'Indicadores', 'Pestaña dinámica: conteo por clase de evidencia, minimapa de 21 bloques, filtros e inspector de la ficha.', 'La evidencia (confirmado, probable, desconocido) manda en el aspecto de cada ficha.'],
  ['20 oct', 'Método', 'Las tres tarjetas «Cada modelo responde a una decisión» quedan en **TBC** (sin contenido) por decisión del equipo.', '**Hueco visible en un entregable** (ver 6.2, punto 9).'],
  ['20 oct', '¿Cuánto cuesta?', 'La tarjeta de subsidio pasa a financiar relevo de 6 h/semana con el modelo de sostenibilidad (script 20) y los 1,407,522 hogares de la ENIGH.', 'Se resuelve el punto 5 de la v1.0. Ya no se compara media jornada con la solicitud de la CDMX.'],
], [0.9, 1.5, 3.6, 3.36]));

// ── 1. Descripción general
add(H1('2. Descripción general del Observatorio'));
add(H2('2.1 Propósito'));
add(P('El Observatorio del Cuidado («Los datos que cuidan») es un sitio de una sola página con ocho pestañas. Cada pestaña responde una sola pregunta sobre las personas que cuidan, sin pago, a alguien con discapacidad o de 60 años y más.'));
add(CAJA('Pregunta central', ['¿Quién carga el cuidado de alta intensidad, por qué no recurre a cuidado pagado, si podría pagarlo, a quién atender primero y dónde probar una solución?']));
add(H2('2.2 Enfoque y público'));
add(P('**Enfoque.** Quien cuida en casa sin pago (la cuidadora familiar de alta intensidad) y quien recibe ese cuidado. Es la opción C del programa, elegida el 5 oct 2026. La app «Mientras» aparece solo como contexto, con sus dos perfiles («Necesito cuidado» y «Puedo cuidar»); el Observatorio no lee datos de ella.'));
add(P('**Público.** Quien decide sobre el programa y el piloto: el docente, la institución receptora y el equipo. No es un tablero operativo. **Cambio respecto de la v1.0:** la v1.0 decía que el Observatorio «no sustituye el tablero de la UCA de Inteligencia de Negocios». El 15 oct 2026 Omar confirmó que el Observatorio **es** ese tablero. El almacén de datos (`DW/`, 20 oct) complementa esa UCA, pero el Observatorio todavía no lo lee.'));
add(H2('2.3 Reglas de construcción'));
add(B('Solo datos reales agregados. No hay datos simulados ni datos personales.'));
add(B('Ninguna cifra está escrita a mano: `build_datos.py` la lee de `Analysis/` y se detiene si falta un archivo, una fila esperada o un bloque sin diccionario. Hay dos excepciones conocidas (sección 6.2, punto 10).'));
add(B('Cada tarjeta tiene una gráfica principal, una frase de hallazgo y una ficha (botón ⓘ) con lectura, fuente, universo, precisión y archivo de origen.'));
add(B('La precisión se marca siempre (alta, moderada, baja) y la evidencia se clasifica como confirmada, probable o desconocida.'));
add(B('La URL guarda la pestaña (`#necesidad`, `#relevo`, `#territorio`…), así que cada pestaña se puede compartir directamente.'));

// ── 2. Arquitectura
add(H1('3. Arquitectura y flujo de datos'));
add(P('La cadena es la misma de la v1.0: fuente oficial → análisis reproducible → archivo de resultados → `build_datos.py` → página. Desde el 20 oct hay una rama paralela: el ETL del almacén lee los mismos resultados, pero la página no lo consume.'));
add(FIGURA(fig('f_arquitectura.png'), 'Arquitectura al 20 oct 2026: tres capas y el almacén en paralelo.'));
add(P('La página abre con doble clic (file://), sin servidor. Por eso los datos se cargan como scripts `.js` y no se leen del `.json`: el navegador bloquea `fetch` e `import` en ese modo.'));
add(FIGURA(fig('f_estructura.png'), 'Estructura de archivos de Frontend/observatorio al 20 oct 2026.'));

// ── 3. Storytelling
add(H1('4. Storytelling'));
add(P('La historia va del problema a la decisión: hay un grupo que se daña cuidando y no pide ayuda por una norma familiar, no por precio ni por falta de información. Unas horas de relevo sí caben en el bolsillo de la mayoría, una regla simple basta para encontrar a ese grupo y el territorio dice dónde probarlo.'));
add(FIGURA(fig('guia_v1_arco.png'), 'Arco narrativo: una pregunta y una cifra ancla por pestaña (figura de la v1.0; las cifras siguen vigentes).'));
add(H2('4.1 Por qué este orden'));
add(P('Cada pestaña responde la objeción que deja la anterior: ¿quién es?, ¿por qué no pide ayuda?, ¿puede pagarla?, ¿cómo encontrarlo?, ¿dónde empezar? Las pestañas llevan nombre de pregunta y no de tema para que quien navega siga el razonamiento sin leer un instructivo.'));
add(T(['Momento', 'Pestaña', 'Qué aporta al relato (20 oct)'], [
  ['Gancho', 'Inicio', 'Qué es el Observatorio y qué no mide; embudo de 31.7 M de personas que cuidan a ≈ 776 mil en el grupo del problema; cierre con la regla frente al modelo (+2.2 pp, no demostrable).'],
  ['Conflicto', '¿Quién lo carga?', 'El daño crece con las horas (+31.0 pp entre 40 h o más y menos de 20 h), pero la necesidad declarada casi no cambia.'],
  ['Causa', '¿Por qué no se contrata?', 'Se ponen a prueba cuatro explicaciones; sobrevive la norma familiar (82.3 %).'],
  ['Salida viable', '¿Cuánto cuesta?', 'La jornada completa se lleva 94.4 % del ingreso mediano; 6 h a la semana, 14.2 %. Si se subsidia, el relevo cuesta una fracción de la solicitud de cuidados de la CDMX (0.5 % en el escenario de 25 % de aceptación).'],
  ['Focalización', '¿A quién primero?', 'La regla «40 h o más» encuentra casi a las mismas personas que seis familias de modelos.'],
  ['Aterrizaje', '¿Dónde?', 'Escala en la CDMX (≈ 1.41 M de hogares) y zonas candidatas para el piloto, con sus barreras de acceso.'],
  ['Prueba', 'Indicadores y Método', 'Lo que se mide, lo que no se puede medir y de dónde sale cada cifra.'],
], [1.4, 1.9, 6.06]));
add(esp(140));
add(CAJA('Riesgo del relato', [
  'La historia termina en una solución que el equipo ya eligió (relevo por horas). Puede leerse como evidencia acomodada a la decisión.',
  'Lo que lo contiene: las hipótesis descartadas siguen visibles (la app «que busca», el precio), cada cifra muestra su precisión y la pestaña de focalización reporta un resultado nulo (el modelo no supera a la regla). Hay que sostenerlo así en la defensa.',
], 'ambar'));

// ── 4. Recorrido
add(H1('5. Recorrido pestaña por pestaña'));
add(P('Las cifras son las que la página muestra el 21 oct 2026. Las capturas son a 1440 px de ancho.'));

// 5.1 Inicio
add(H2('5.1 Inicio'));
add(FIGURA(fig('obs/obs_v-inicio.jpg'), 'Pestaña Inicio: bloque «Los datos que cuidan» con el carrusel de cuatro tarjetas.', 600));
add(CAJA('Pregunta y mensaje', ['**Pregunta:** ¿qué es esto y por qué importa?', '**Mensaje:** existe un grupo grande y concreto que se daña cuidando y no pide ayuda; el sitio dice de dónde sale cada cifra.']));
add(esp(100));
add(T(['Tarjeta', 'Qué muestra', 'Qué queremos que se entienda', 'Por qué esa forma'], [
  ['Los datos que cuidan (carrusel)', 'Cuatro tarjetas: 01 Qué es, 02 Qué mide y qué no, 03 De dónde sale cada dato, 04 Qué tan firme es (estado de las 29 fuentes del inventario). Los dos perfiles de la app como etiquetas.', 'Qué es el Observatorio antes de ver un número; que la ENASIC no permite cifras de la CDMX.', 'Sustituyó a las cuatro «razones» con cifra (15 oct): la portada adelantaba hallazgos sin su contexto. Autoavance cada 9 s, que se detiene al tocarlo.'],
  ['Contadores', '21 indicadores con ficha, 36 gráficas y mapas, 29 fuentes inventariadas, 16 alcaldías.', 'Alcance del sitio, no hallazgos.', 'Se calculan de lo pintado; no están escritos a mano.'],
  ['¿Cuántas personas están en el problema?', 'Cinco etapas: 31.7 M cuidan → 6.2 M a una persona con discapacidad o 60+ → 2.5 M cuidan 40 h o más → 1.1 M dicen «no tuve necesidad» → 776 mil con daño. Cada etapa con ilustración, porcentaje de la etapa anterior y un mapa de México relleno.', 'Cómo se construye la población objetivo paso a paso.', 'Pantalla de selección (14 oct) en lugar de cinco escenas 3D. El mapa mide proporción, no ubicación; la propia página lo advierte.'],
  ['¿A quién atender primero?', '+2.2 pp: la regresión logística encuentra 53.0 % de quienes declaran daño; la regla de 40 h, 50.8 % (IC 90 % −4.1 a +8.5).', 'Hoy la regla simple rinde igual.', 'Cierra el embudo con la decisión que informa.'],
], [2.0, 3.0, 2.2, 2.16]));
add(...FIGURA(fig('obs/card_embudo.jpg'), 'Embudo «¿Cuántas personas están en el problema?» (versión del 14 oct).', 560));

// 5.2 Necesidad
add(H2('5.2 ¿Quién lo carga? (#necesidad)'));
add(FIGURA(fig('obs/obs_v-necesidad.jpg'), 'Pestaña ¿Quién lo carga?', 600));
add(CAJA('Pregunta y mensaje', ['**Titular:** «La carga crece con las horas; la necesidad declarada, no.»', '**Mensaje:** el grupo del problema no se reconoce como necesitado aunque declara daño; por eso hay que buscarlo por sus horas y no esperar a que pida ayuda.']));
add(esp(100));
add(P('**Filtro de segmentación.** La barra «Segmentar por» (sexo, edad, ingreso, a quién cuida, intensidad) filtra toda la pestaña, una dimensión a la vez, porque los cruces dejan muestras demasiado chicas. Si el segmento tiene precisión baja, la página dice «precisión baja: no se compara».'));
add(T(['Tarjeta', 'Qué muestra', 'Qué queremos que se entienda', 'Por qué esa forma'], [
  ['Cuatro KPI', '6.2 M personas cuidan a alguien con discapacidad o de 60+; 236 M de horas a la semana (≈ 5.9 M jornadas de 40 h; promedio 38 h); 40.7 % cuida 40 h o más (IC 90 % 36.1–45.3); brecha de daño por horas +31.0 pp (78 % contra 47 %; IC 22.7–39.3).', 'Tamaño del fenómeno y que la carga se distribuye de forma desigual.', 'Cambiaron respecto de la v1.0: ahora miden escala y brecha, no proporciones repetidas en otras tarjetas.'],
  ['Comparar segmentos', 'Mapa de calor de indicadores por segmento; ▲▼ marcan diferencias significativas (IC 90 %).', 'Qué grupos se apartan del promedio y cuáles no se distinguen.', 'Un solo mapa de calor desde el 7 oct; clic en un renglón filtra la pestaña.'],
  ['¿Declaran daño quienes dicen «no tuve necesidad»?', 'Pictograma por franja de horas: con 40 h o más, 70.5 %; con menos de 20 h, 42.6 %.', 'Decir «no tuve necesidad» no significa no tener daño.', 'Muestra el subgrupo dentro del grupo con un solo denominador.'],
  ['¿Cuánto cambia con más horas?', 'Diferencias en pp con IC 90 % (40 h o más contra menos de 20 h).', 'Qué diferencias son reales: el intervalo no cruza el cero.', 'Todas con el mismo signo («más horas menos menos horas»).'],
  ['El grupo del problema', '≈ 776 mil personas, 12.5 % del universo; 79.6 % declara daño entre quienes además bañan, visten o dan de comer.', 'La definición operativa de la población objetivo.', 'Tarjeta oscura: es la cifra que conecta con el programa.'],
  ['¿Cuántas horas cuidan?', 'Distribución de horas: la mitad cuida 30 h o menos; 40.7 % 40 h o más; 3.3 % llega al tope de 98 h del cuestionario.', 'La cola de alta intensidad que un promedio esconde.', 'Histograma por rangos.'],
  ['¿Quiénes forman el grupo?', '77.8 % mujeres (68.8 % en el universo); 73.0 % cuida a persona con discapacidad (56.5 %); por edad e ingreso no se distingue.', 'El grupo es más femenino y más ligado a discapacidad.', 'Una dimensión a la vez hace legible la comparación.'],
  ['Horas por sexo y edad', 'Entre 18 y 29 años las mujeres cuidan 2.08 veces las horas de los hombres; la brecha se cierra con la edad.', 'Forma de la brecha.', 'Marcada «origen sin documentar»: sirve para la forma, no para citar niveles.'],
], [1.8, 3.2, 2.2, 2.16]));

// 5.3 Barreras
add(H2('5.3 ¿Por qué no se contrata? (#barreras)'));
add(FIGURA(fig('obs/obs_v-barreras.jpg'), 'Pestaña ¿Por qué no se contrata?', 600));
add(CAJA('Pregunta y mensaje', ['**Titular:** «La barrera principal no es información ni precio: es la norma familiar.»', '**Mensaje:** el programa no puede ser un buscador de cuidadoras ni un descuento; tiene que entrar por una forma de ayuda que la familia acepte.']));
add(esp(100));
add(P('Usa el mismo filtro de segmentación que «¿Quién lo carga?». Sin cambios de contenido desde la v1.0.'));
add(T(['Tarjeta', 'Qué muestra', 'Qué queremos que se entienda', 'Por qué esa forma'], [
  ['Fila de hipótesis', 'Oferta declarada (45.0 % de las mujeres de 15 a 60 años trabajaría como cuidadora); precio 2.8 %; desconfianza 25.3 %; norma familiar 82.3 %.', 'Cada explicación con su veredicto: «Intención, no oferta real», «No es el cuello de botella», «Requisito de diseño», «Respaldada».', 'Un veredicto por hipótesis hace explícito qué se descartó.'],
  ['¿Por qué no buscó servicios?', '49.4 % «no tuvo necesidad» y 41.9 % «el propio hogar cuida»; precio, información y desconfianza por debajo de 5 %.', 'La no búsqueda es de norma, no de mercado.', 'Barras con IC; precisión baja en gris rayado.'],
  ['¿Contratan más los hogares con más ingreso?', 'En el quintil más alto, 24.3 % paga trabajo doméstico y solo 2.6 % paga cuidado.', 'El ingreso no destraba la contratación de cuidado.', 'Comparar dos servicios a lo largo del ingreso aísla el efecto del dinero.'],
  ['Si contratara cuidado, ¿dónde?', '58.1 % lo querría en su casa (59.3 % mujeres, 55.7 % hombres; diferencia no significativa).', 'Justifica un servicio a domicilio y no una residencia.', 'Figuras por sexo o columnas, según el filtro.'],
  ['¿Por qué rechazaría una residencia?', 'Responsabilidad familiar 48.0 %; maltrato 25.3 %.', 'Confirma la norma familiar desde otra pregunta.', 'Columnas con IC.'],
], [1.8, 3.2, 2.2, 2.16]));

// 5.4 Relevo
add(H2('5.4 ¿Cuánto cuesta? (#relevo)'));
add(FIGURA(fig('obs/obs_v-relevo.jpg'), 'Pestaña ¿Cuánto cuesta?', 600));
add(CAJA('Pregunta y mensaje', ['**Titular:** «Unas horas de cuidado pagado cuestan una fracción de la jornada completa.»', '**Mensaje:** la jornada completa no es pagable para el hogar típico; unas horas de relevo sí. Si se subsidia, el relevo cabe en el presupuesto de cuidados de la ciudad. La pestaña lleva la marca «sin prestaciones · jornada diurna».']));
add(esp(100));
add(T(['Tarjeta', 'Qué muestra', 'Qué queremos que se entienda', 'Por qué esa forma'], [
  ['Cuatro KPI', '$1,112 al mes por 6 h/sem al piso legal; $7,414 por 40 h; 66.2 % podría pagar 6 h/sem con tope de 20 % (ENASIC, nacional); $42.81/h salario mínimo profesional 2026.', 'La distancia entre relevo y jornada completa.', 'Cifras de dinero que cualquier lector entiende.'],
  ['¿Cuántos hogares podrían pagarlo?', 'Selectores de ingreso (ENASIC nacional, ENIGH nacional, ENIGH CDMX), tarifa (piso $43/h o CACEH $113/h) y tope (10, 20, 30 %). Con piso, 20 % y ENASIC: 66.2 % paga 6 h/sem; jornada completa 5.3 %.', 'Cuánto depende la conclusión de los supuestos.', 'Los selectores exponen la sensibilidad en lugar de esconderla.'],
  ['¿Qué parte del ingreso se lleva?', 'Hogar mediano ($6,800 al mes, ENASIC, pesos de nov-2022): 6 h/sem = 14.2 %; jornada completa = 94.4 %.', 'Un hogar concreto, no un promedio.', 'Barras con la línea del tope; rojo lo que lo rebasa.'],
  ['¿Cuánto se paga hoy por hora?', 'Mediana y P25–P75: cuidadora $43.87/h (26 casos, precisión baja); trabajo doméstico $76.97/h; enfermería (14 casos, precisión baja).', 'Hoy se paga casi el piso legal por cuidar.', 'Rangos con mediana y líneas de referencia.'],
  ['¿Cambia el costo si el relevo es de noche o con carga laboral? (nuevo)', 'Hora diurna $42.81, mixta $45.66 (+6.7 %), nocturna $48.92 (+14.3 %). 6 h/sem de noche: $1,271 al mes. Selector de carga: sin carga, +IMSS e Infonavit (22 %), +aguinaldo y vacaciones (30.2 %).', 'El relevo nocturno y el empleo formal encarecen el paquete; una noche de 12 h requiere dos personas.', 'Barras por jornada; por defecto «sin carga» para coincidir con el resto de la pestaña.'],
  ['Advertencia visible', '«Poder pagar no es querer contratar».', 'La asequibilidad no mide disposición a pagar.', 'Va abierta desde el 7 oct.'],
  ['Si se subsidia el relevo (rehecha el 20 oct)', 'Financiamiento anual de 6 h/sem en la CDMX por aceptación (5 %, 25 %, cota de 64.1 %) y costo de operación ($0 a $1,000 por hogar-mes). Con 25 % y operación $0: 36.2 mdp, 0.5 % de la solicitud (6,748 mdp). Subsidio laboral promedio: $171 por hogar-mes con ingreso ENASIC y $0 con ENIGH CDMX.', 'El relevo, a diferencia de la media jornada, sí cabe en el presupuesto; lo que falta saber es la operación y la aceptación.', 'Puntos contra la línea de la solicitud. Aceptación y operación son ilustrativas; ≈ 70,557 hogares elegibles es una inferencia con tasas nacionales.'],
], [1.8, 3.4, 2.1, 2.06]));
add(...FIGURA(fig('obs/card_jornada.jpg'), 'Tarjeta nueva: costo por tipo de jornada y carga laboral (scripts 19 y 20).', 420));
add(...FIGURA(fig('obs/card_subsidio.jpg'), 'Tarjeta de subsidio rehecha con el modelo de sostenibilidad (script 20).', 420));

// 5.5 Focalización
add(H2('5.5 ¿A quién primero? (#focalizacion)'));
add(FIGURA(fig('obs/obs_v-focalizacion.jpg'), 'Pestaña ¿A quién primero?', 600));
add(CAJA('Pregunta y mensaje', ['**Titular:** «Una regla simple encuentra casi a las mismas personas que el modelo.»', '**Mensaje:** para decidir a quién ofrecer primero el relevo basta preguntar las horas de cuidado; ningún modelo mejora de forma demostrable con el objetivo «algún daño», y todos piden más datos personales.']));
add(esp(100));
add(P('Todos los métodos seleccionan la misma proporción de personas (≈ 40.7 %) para que la comparación sea justa.'));
add(T(['Tarjeta', 'Qué muestra', 'Qué queremos que se entienda', 'Por qué esa forma'], [
  ['Cuatro KPI', 'Regla 50.8 %; regresión logística 53.0 %; diferencia +2.2 pp (IC 90 % −4.1 a 8.5); +12.7 pp a favor del modelo si el objetivo es salud física deteriorada.', 'El modelo solo gana con otro objetivo, que hoy es solo una sensibilidad (DEC-OBJ-001).', 'Resultado e incertidumbre juntos.'],
  ['El modelo cambia a quién se selecciona', 'Cobertura por grupo: regla contra logística y gradient boosting; en rojo, grupos con menos de 200 casos con daño.', 'Con quien cuida solo a una persona mayor sin discapacidad la cobertura cae de 50.2 % a 20.9 %. Elegir método es decisión de política.', 'Una métrica global esconde a quién deja fuera cada método.'],
  ['Qué asocia el modelo con el daño', 'Coeficientes estandarizados: horas (+0.47), cuidar también a menores, falta de fuerza, que la persona requiera apoyo, tareas clínicas, ser mujer; más ingreso, menos daño.', 'Asociaciones, no causas.', 'La dirección se lee a izquierda o derecha.'],
  ['Ocho formas de elegir (nuevo, 13 oct)', 'Diferencia contra la regla con IC 90 % de SVM, horas continuas, bosque aleatorio, logística, lasso, red neuronal, árbol y gradient boosting.', 'Ninguna familia se separa de la regla con «algún daño».', 'Mismo protocolo para todas; tabla con AUC y Brier.'],
  ['Cobertura según el cupo (nuevo)', 'Curvas de cobertura: a 10, 20, 30 y 40.7 % de seleccionados, la diferencia con la regla nunca excluye el cero.', 'El resultado no depende del tamaño del programa.', 'Curva más tabla por cupo.'],
  ['Importancia y calibración (nuevo)', 'Pérdida de AUC al revolver cada variable; calibración por deciles (17 de 20 contienen la diagonal).', 'Las horas pesan más; las probabilidades son razonables, no exactas.', 'Diagnóstico que la UCA de Herramientas pide.'],
  ['¿Qué objetivo conviene? (nuevo)', '631 / 222 casos; 78 % / 33 % de los que elige la regla declaran ese daño; +12.7 pp con salud física, +9.1 pp sin «le falta fuerza física» (no demostrable).', 'Elegir salud física porque ahí gana el modelo sería razonamiento circular.', 'Tarjetas, prevalencia por horas, cambio por grupo y tabla de criterios.'],
  ['Cuándo no debe usarse', 'Subselecciona «60+ sin discapacidad» por un límite del cuestionario; datos nacionales; daño autodeclarado; no causal.', 'Dónde deja de funcionar.', 'Cumple la regla de documentar los límites.'],
], [1.8, 3.2, 2.2, 2.16]));
add(...FIGURA(fig('obs/card_objetivo.jpg'), 'Tarjeta «¿Qué objetivo conviene?» (13 oct).', 560));

// 5.6 Territorio
add(H2('5.6 ¿Dónde? (#territorio)'));
add(FIGURA(fig('obs/obs_v-territorio.jpg'), 'Pestaña ¿Dónde?', 600));
add(CAJA('Pregunta y mensaje', ['**Titular:** «Oferta, dependencia y vulnerabilidad por alcaldía.»', '**Mensaje:** el problema en la CDMX es grande (≈ 1.41 M de hogares), la oferta formal está mal repartida y el piloto debe elegir zona por dónde viven las personas mayores, no por dónde son mayoría.']));
add(esp(100));
add(P('Sin cambios de contenido desde la v1.0. Las tres partes siguen igual:'));
add(T(['Parte', 'Tarjetas', 'Cifras clave', 'Por qué esa forma'], [
  ['1 · Escala y alcaldías', 'Cuatro KPI y «Asilos frente a población de 60+» con siete capas', '≈ 1,407,522 hogares CDMX con 60+ o discapacidad (47.1 %, IC 45.0–49.1, ENIGH 2022, confirmado); ≥ 1,099,461 (cota inferida); ≈ 11,300 contratan enfermería o cuidadora; ≈ 86,193 contratan trabajo doméstico. Índice de asilos: Tlalpan 1.89, Iztapalapa 0.52, Milpa Alta 0.', 'La medición directa va primero y las inferidas a su lado, marcadas «probable».'],
  ['2 · México y zonas', '32 entidades; zonas dentro de cada alcaldía', 'Pobreza 60+ en la CDMX 16.0 % (IC 13.8–18.2), lugar 29 de 32; la variación dentro de una alcaldía (mediana 13.5 puntos) iguala la que hay entre alcaldías (13.2).', 'Justifica bajar de alcaldía a AGEB.'],
  ['3 · Tipología de AGEB (modelo 2)', 'Cuatro tipos de zona, dónde viven las personas de 60+, internet, distancia a la oferta, brechas, confiabilidad', '43.1 % de las personas de 60+ vive en el tipo 2; 36.7 % de las viviendas del tipo 1 sin internet; 151 AGEB con 164,354 personas de 60+ con brecha de oferta; silueta 0.21 contra 0.18 sin grupos (la ciudad es un gradiente).', 'Compara contra alternativas simples y dice cuándo no usarlo.'],
], [1.7, 2.3, 3.6, 1.76]));

// 5.7 Indicadores
add(H2('5.7 Indicadores'));
add(FIGURA(fig('obs/obs_v-indicadores.jpg'), 'Pestaña Indicadores (versión dinámica del 15 oct).', 600));
add(CAJA('Pregunta y mensaje', ['**Titular:** «Qué mide el Observatorio, y qué todavía no puede medir.»', '**Mensaje:** el Observatorio es un sistema de indicadores con ficha, no un conjunto de gráficas sueltas, y reconoce sus huecos.']));
add(esp(100));
add(P('Desde el 15 oct la pestaña abre con un contador (21 de 21 indicadores a la vista: **9 confirmados, 10 probables, 2 desconocidos**), un minimapa de 21 bloques coloreados por clase de evidencia, filtros por dimensión (Demanda, Oferta, Cobertura, Tiempos, Costos, Contexto, Brechas, Calidad, Focalización) y un inspector con la ficha completa. Los dos indicadores desconocidos aparecen como **«no medible»**: cobertura territorial oferta–necesidad (ningún par cumple la regla de compatibilidad) y calidad del cuidado domiciliario. Con `?ind=clasico` se ve la cuadrícula anterior.'));
add(P('**Por qué así:** la clase de evidencia manda en el aspecto (franja sólida, rayada o punteada con candado) para que nadie lea un «probable» como si fuera un dato medido.'));

// 5.8 Método
add(H2('5.8 Método'));
add(FIGURA(fig('obs/obs_v-metodo.jpg'), 'Pestaña Método: las tres decisiones en TBC.', 600));
add(CAJA('Pregunta y mensaje', ['**Titular:** «Cada cifra dice de dónde sale y qué tan precisa es.»', '**Mensaje:** cualquier número del sitio se puede rastrear hasta su archivo y su fuente.']));
add(esp(100));
add(P('Abre con «Cada modelo responde a una decisión», un selector de tres pestañas: **¿Dónde hacer el piloto?**, **¿A quién ofrecer primero el relevo?** y **¿En qué orden atender las zonas?** Desde el 20 oct las tres muestran solo su título y **«TBC»**: el equipo quitó las vistas «Videojuego» y «Trío» y vació el contenido. Debajo, todo plegado: fuentes (F01–F27 y documentos internos), diccionario, cómo leer la precisión, lo que no se puede afirmar, compatibilidad oferta–necesidad, calidad de archivos territoriales y variables del modelo.'));
add(CAJA('Antes de la segunda revisión', [
  'Un «TBC» visible en la pestaña que debe dar credibilidad al sitio es lo primero que un evaluador va a notar. Hay que decidir una de dos: llenar las tres decisiones con texto revisado (la versión del 15 oct está en la bitácora y en el README del Observatorio) u ocultar el bloque hasta tenerlo. Esta guía no decide cuál.',
], 'alerta'));

// ── 5. Fuentes
add(H1('6. Fuentes de datos'));
add(P('La columna vertebral es la ENASIC 2022 (INEGI): alimenta necesidad, barreras, costos y focalización. El componente territorial usa otras fuentes porque la ENASIC no permite cifras por alcaldía ni para la CDMX. Las cifras con IC al 90 % usan el diseño muestral (estratos y UPM) de cada encuesta.'));
add(FIGURA(fig('guia_v1_fuentes.png'), 'Qué fuente alimenta cada pestaña (figura de la v1.0; sigue vigente).'));
add(H2('6.1 Fuentes y archivos que se agregaron desde la v1.0'));
add(T(['Archivo o fuente', 'Pestaña', 'Script → resultado', 'Estado'], [
  ['Salario mínimo profesional 2026 con divisor por jornada (LFT arts. 60–61)', '¿Cuánto cuesta?', '19 → `19_costo_hora_por_jornada.csv`', 'Artículos por verificar en el DOF (Daniel): probable'],
  ['Modelo de sostenibilidad (lee 03, 04, 05, 06, 07, 14, 16 y 19)', '¿Cuánto cuesta?', '20 → `20_sostenibilidad_escenarios.csv` y `20_modelo_sostenibilidad.xlsx`', 'Supuestos declarados; carga del 22 % por confirmar'],
  ['Alternativas, curvas, calibración e importancia del modelo de focalización', '¿A quién primero?', 'Notebook B §11 (subsecciones 11–16) → `11_modelo_*`, `11_objetivo_*`', 'Pendiente de doble revisión'],
  ['Solicitud presupuestal del Sistema Público de Cuidados CDMX (6,747.7 mdp)', '¿Cuánto cuesta?', 'Ancla de la tarjeta de subsidio', 'Prensa; por contrastar con el decreto aprobado'],
], [3.0, 1.5, 3.0, 1.86]));
add(P('El inventario completo está en `Analysis/matrices/inventario_fuentes_cuidado.csv` y el diccionario en `Analysis/matrices/diccionario_observatorio.csv`.'));

// ── 6. Límites
add(H1('7. Límites y puntos débiles'));
add(P('El Observatorio no tiene datos simulados, pero varias cifras del relato son más débiles de lo que su redacción sugiere. Esto es lo que un evaluador puede atacar.'));
add(H2('7.1 Lo que los datos no permiten afirmar'));
add(B('La ENASIC es nacional y de una sola edición: no hay cifras de la CDMX ni tendencias a partir de ella. El almacén lo confirma: ninguna fuente admite series (0 de 12 combinaciones).'));
add(B('Los costos de las gráficas de asequibilidad no incluyen prestaciones ni hora nocturna: el costo real es mayor. Solo la tarjeta de jornada muestra la carga laboral.'));
add(B('La asequibilidad no mide disposición a pagar: hoy contrata cuidado 1.0 % de los hogares con necesidad.'));
add(B('El modelo de focalización se entrenó con datos nacionales y predice daño autodeclarado; no está validado para la población de una institución.'));
add(B('La tipología describe zonas, no personas (falacia ecológica), y no se cruza con la ENASIC.'));
add(B('El financiamiento del subsidio usa aceptación y costo de operación ilustrativos: no es un presupuesto.'));
add(H2('7.2 Estado de las inconsistencias'));
add(T(['#', 'Hallazgo', 'Estado al 21 oct', 'Prioridad'], [
  ['1', '(v1.0) La razón 01 del Inicio omitía la condición «no tuve necesidad».', '**Resuelto** al quitar las razones (15 oct).', '—'],
  ['2', '(v1.0) «Por horas, el precio cabe» se apoya en 66.2 % sin varianza, sin prestaciones y sin disposición a pagar; con ENIGH CDMX sube a 92.0 %.', '**Abierto.** El KPI sigue en 66.2 % (ENASIC). La fuente del ingreso sigue sin decidirse y ahora también mueve el subsidio ($171 o $0).', 'Alta · decisión del equipo'],
  ['3', '(v1.0) «Informar no basta» usaba 1.6 % y la bitácora 0.9 %.', '**Resuelto** al quitar las razones. El 0.9 % sigue en los documentos.', '—'],
  ['4', '(v1.0) La ficha de «Zonas dentro de cada alcaldía» dice que no hay polígonos de AGEB.', '**Abierto.** Sigue diciendo «El proyecto no tiene los polígonos de las AGEB», aunque la tipología los usa desde el 9 oct.', 'Media · redacción'],
  ['5', '(v1.0) El subsidio usaba la cota inferida de 1.10 M y media jornada.', '**Resuelto** el 20 oct: usa 1,407,522 hogares (ENIGH) y relevo de 6 h.', '—'],
  ['6', '(v1.0) Brecha de horas por sexo y población 60+ por alcaldía sin fuente documentada.', '**Abierto.** El almacén encontró que el archivo de 60+ coincide con el Censo 2020 (diferencia máxima 0.003 pp), pero no se reetiquetó.', 'Media'],
  ['7', '(v1.0) La fecha dice «Actualizado 6 oct 2026».', '**Abierto.** Sigue igual, y desde entonces hubo cambios el 8, 9, 13, 14, 15 y 20 oct.', 'Alta · redacción'],
  ['8', '(v1.0) Todo el Observatorio sigue pendiente de doble revisión.', '**Abierto.**', 'Alta · proceso'],
  ['9', '(nuevo) Método muestra «TBC» en las tres decisiones.', 'Abierto (ver 5.8).', 'Alta'],
  ['10', '(nuevo) Dos textos numéricos escritos a mano: «con 1,043 personas» (`index.html`) y «por debajo de 5%» (`barreras.js`).', 'Abierto. Hoy coinciden con los datos.', 'Media'],
  ['11', '(nuevo) El KPI «+12.7 pp sí gana el modelo si el objetivo es salud física» se presenta al mismo nivel que el resultado principal.', 'Abierto. Desde DEC-OBJ-001 (20 oct) salud física es solo una sensibilidad exploratoria, elegida después de ver resultados. Conviene rotularlo así.', 'Media · redacción'],
  ['12', '(nuevo) Dos cifras parecidas para «el daño crece con las horas»: +31.0 pp (78 % contra 47 %, todas las cuidadoras) en los KPI y 70.5 % contra 42.6 % (solo quienes dicen «no tuve necesidad») en el pictograma.', 'Abierto. Ambas son correctas, pero con denominadores distintos; en la defensa hay que decir cuál se cita.', 'Media'],
  ['13', '(nuevo) El mapa del embudo rellena todo México con el porcentaje de cada etapa.', 'Abierto. La página advierte que mide proporción, no ubicación, pero un mapa invita a leer ubicación.', 'Baja'],
], [0.4, 3.9, 3.5, 1.56]));
add(H2('7.3 Siguiente paso'));
const n1 = lista();
add(n1('Resolver el «TBC» de Método antes del 2 de noviembre (punto 9).'));
add(n1('Corregir la fecha, la ficha de polígonos y el rótulo del +12.7 pp (puntos 4, 7 y 11): son redacción y no cambian cifras.'));
add(n1('Decidir con el equipo la fuente de ingreso (punto 2) y registrarlo en la bitácora.'));
add(n1('Asignar la doble revisión del Observatorio y de esta guía a Daniel o Alondra Danae.'));

construir({
  portada: fig('portada_guia_tablero.jpg'), encabezado: 'Guía del tablero v2.0', pie: '«Los datos que cuidan»  ·  Pendiente de doble revisión',
  meta: { title: 'Guía del tablero — Observatorio del Cuidado v2.0', description: 'Qué contiene cada pestaña del Observatorio, qué explica cada gráfica y de dónde salen los datos' },
  C, salida: process.argv[2] || 'Observatorio_Cuidado_Guia_Tablero_v2.docx',
});
