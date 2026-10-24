// Construye Documento_Maestro_Avance2_Observatorio_del_Cuidado_v2.docx (v2.0 · 21 oct 2026), documento de avance
// para la segunda revisión (2 al 6 nov 2026). Sustituye al Documento maestro del 25 sept 2026 (primera revisión).
// Redactado en primera persona del equipo (pedido de Omar del 25 sept para el documento maestro).
// Ninguna cifra nace aquí: cada una sale de Analysis/resultados, de la bitácora o de una fuente externa citada.
// Ejecutar desde Documentos/segundo_avance/:  node build_maestro_v2.js ../Documento_Maestro_Avance2_Observatorio_del_Cuidado_v2.docx
const path = require('path');
const { P, H1, H2, H3, B, lista, esp, T, CAJA, FIGURA, titulo, indice, construir } = require('./comun_docx');
const fig = (a) => path.join(__dirname, 'fig', a);
const C = []; const add = (...x) => x.flat().forEach((e) => C.push(e));

add(titulo('Control del documento'));
add(T(['Campo', 'Valor'], [
  ['Documento', 'Documento maestro de avance — Observatorio de Datos para la Economía del Cuidado'],
  ['Versión', '2.0 · 21 de octubre de 2026. Sustituye al documento maestro del 25 de septiembre (primera revisión).'],
  ['Para qué entrega', 'Segunda revisión del proyecto integrador (2 al 6 de noviembre de 2026): avance del documento, proyecto único integrado, resultados preliminares y participación de todas las UCA.'],
  ['Equipo', 'Equipo 3 · Omar Gutiérrez Escoto · Daniel Cureño Martínez · Alondra Danae Madrigal García'],
  ['Programa', 'Licenciatura en Ciencia de Datos para el Negocio · 7.º semestre · UNRC, sede Santo Tomás · PP 26-2'],
  ['Documentos que lo acompañan', 'Guía del tablero v2.0 · Documento técnico v2.0 · Guía de la app Mientras v1.0'],
  ['Estado', 'Avance para revisión. **Ningún resultado de este documento tiene todavía la doble revisión** de Daniel ni de Alondra Danae; lo marcamos en cada sección.'],
], [2.4, 6.96]));
add(esp(160));
add(CAJA('Cómo leer este documento', [
  'Cada cifra sale de un notebook, un script o un archivo de resultados del proyecto, o de una fuente externa que citamos con su fecha. Ninguna cifra nació al redactar este documento.',
  'Clasificamos cada afirmación con tres niveles de evidencia. **Confirmado:** tiene fuente citable y la reprodujimos. **Probable:** es una inferencia con base explícita, por ejemplo una cifra nacional usada como contexto para la CDMX. **Desconocido:** no lo pudimos verificar, y lo decimos.',
  'Además de la evidencia, cada resultado lleva su **estado de revisión**. Nuestra regla es que quien produce un análisis no lo aprueba. Por eso los resultados de los scripts 21 y 22 y del subproyecto ENUT 2024 aparecen como exploratorios, y los del script 21 no se citan con cifras.',
  'La ENASIC 2022 es nacional: sus cifras son confirmadas para el país y solo probables como contexto para la Ciudad de México.',
]));
add(...indice());

// 1
add(H1('1. Qué construimos'));
add(P('El tema del proyecto integrador —la economía del cuidado— nos lo asignó la universidad; nosotros lo delimitamos. El producto final tiene dos partes que pide el problema prototípico: un **Observatorio de datos** y un **programa de innovación social** derivado de sus hallazgos, articulados entre seis UCA.'));
add(T(['Pieza', 'Qué es hoy (21 oct 2026)', 'Dónde vive'], [
  ['Observatorio del Cuidado', 'Sitio de ocho pestañas con 36 gráficas y mapas, 21 indicadores con ficha y datos reales agregados. Cada cifra se rastrea hasta su archivo. Es el tablero de la UCA de Inteligencia de Negocios.', '`Frontend/observatorio/`'],
  ['Análisis reproducible', 'Cuatro notebooks (A a D) y los scripts 19 a 22, con estimaciones que respetan el diseño muestral de cada encuesta.', '`Analysis/`'],
  ['Almacén de datos', 'Esquema estrella con cuatro hechos, diez dimensiones y tres data marts, con ETL.', '`DW/`'],
  ['Programa y app «Mientras»', 'Relevo por horas para quien cuida: priorización con bolsa de horas, perfiles «Necesito cuidado» y «Puedo cuidar», seguimiento. Prototipo con datos simulados.', '`Frontend/`'],
  ['Bitácora de decisiones', 'Registro de cada decisión con su fecha, sus motivos y lo que no permite afirmar.', '`Documentos/bitacora-decisiones.md`'],
], [2.2, 5.0, 2.16]));

// 2
add(H1('2. Qué cambió desde el primer avance'));
add(P('En la primera revisión (26 sept) presentamos nueve hallazgos y un programa de trabajo llamado «Cuidar en casa». Desde entonces tomamos decisiones que cambian el proyecto. Las ponemos primero porque el resto del documento depende de ellas.'));
add(T(['Fecha', 'Decisión o hallazgo', 'Qué cambió'], [
  ['5 oct', 'Elegimos la **opción C** del programa (`Propuestas_programa_poblacion_objetivo_v0.2`).', 'La cuidadora familiar de alta intensidad pide relevo; la persona cuidada lo recibe; una cuidadora remunerada verificada lo presta. Un solo programa, un solo piloto.'],
  ['5 oct', 'El modelo de focalización no supera a la regla de 40 h con «algún daño».', 'Para decidir a quién ofrecer primero el relevo basta preguntar las horas.'],
  ['6 oct', 'Medimos el ingreso con la ENIGH 2022: la ENASIC lo subestima.', 'El precio pesa menos como barrera de lo que creíamos. Para 6 h a la semana, la proporción de hogares que podría pagar sube de 66.2 % (ENASIC, nacional) a 92.0 % (ENIGH, CDMX).'],
  ['6 oct', 'Medimos directamente cuántos hogares de la CDMX tienen una persona de 60+ o con discapacidad.', '47.1 % de los hogares, ≈ 1.41 millones (ENIGH 2022). Antes teníamos una cota inferior inferida de 1.10 millones.'],
  ['8 oct', 'La app deja de ser un buscador y pasa a organizar relevo por horas.', 'Salen el clasificador de texto y el matching ponderado.'],
  ['9 oct', 'Segundo modelo: tipología de AGEB para decidir dónde hacer el piloto.', 'El territorio entra al nivel de zona, no de alcaldía.'],
  ['15 oct', 'Modelo de sostenibilidad del relevo (script 20).', 'Las conclusiones de «el subsidio no cabe en la ciudad» valían para media jornada, no para el relevo.'],
  ['20 oct', 'DEC-OBJ-001: el objetivo primario del modelo es «algún daño»; «salud física» queda como sensibilidad exploratoria.', 'Revierte una decisión de ese mismo día que se tomó después de ver los resultados.'],
  ['20 oct', 'La app «Mientras» prioriza con una tarjeta de puntos y reparte una bolsa de horas.', 'Responde cinco problemas: autoselección, qué se raciona, que nadie quede fuera, instrumentos y riesgos.'],
], [0.9, 4.0, 4.46]));

// 3
add(H1('3. Planteamiento y pregunta'));
add(P('Partimos de un supuesto: que las familias **no encuentran** servicios de cuidado. Los datos no lo sostuvieron. Desconocer que existen servicios explica 0.9 % de la no búsqueda (ENASIC 2022), y solo 3.0 % de las personas cuidadoras buscó servicios. Lo que sí encontramos es un grupo que cuida mucho, se daña y no nombra su carga como necesidad.'));
add(CAJA('Pregunta con la que trabajamos ahora', [
  '¿Quién carga el cuidado de alta intensidad sin pedir ayuda, por qué no recurre a cuidado pagado, si podría pagar unas horas de relevo, a quién atender primero y dónde probarlo en la Ciudad de México?',
]));
add(P('La reformulación sigue lo que pide el Seminario de Titulación: que el supuesto se ajuste a la evidencia y que expliquemos por qué el original no se sostuvo. Replanteamos el problema como tres cosas: **detección** (la cuidadora no busca; hay que encontrarla), **formato** (horas de relevo, no residencias ni jornada completa) y **confianza** (personal verificado y tareas acotadas antes que precio).'));
add(P('**Población.** Personas que cuidan sin pago a alguien con discapacidad o de 60 años y más, y esas personas cuidadas. **Ámbito.** El país para la carga de cuidado (la ENASIC no permite más) y la Ciudad de México para la escala, la oferta y el territorio.'));

// 4
add(H1('4. Datos, fuentes y método'));
add(T(['Fuente', 'Escala', 'Qué permite', 'Qué no permite'], [
  ['ENASIC 2022 (INEGI), microdatos', 'Nacional', 'Quién cuida, cuántas horas, qué daño declara y por qué no busca ayuda', 'Cifras para la CDMX o por alcaldía; tendencias (es la primera edición)'],
  ['ENIGH 2022 (INEGI / CONEVAL)', 'Nacional y entidad', 'Ingreso de los hogares y hogares con 60+ o discapacidad en la CDMX; pobreza 60+ por entidad', 'Necesidad de cuidado ni horas de cuidado'],
  ['Censo 2020 por AGEB (INEGI) y Marco Geoestadístico 2025', 'AGEB urbana de la CDMX', 'Tipología de zonas: envejecimiento, hogar, escolaridad, internet', 'Nada sobre personas (falacia ecológica); datos de marzo de 2020'],
  ['DENUE 05/2026 (INEGI)', 'Establecimiento, CDMX', 'Contar residencias y centros de día', 'Capacidad, precio ni calidad; mezcla cuidado y recreación'],
  ['Índice de Rezago Social 2020 por AGEB (CONEVAL), marginación (CONAPO)', 'AGEB y entidad', 'Contexto de vulnerabilidad', 'Necesidad de cuidado'],
  ['Salario mínimo profesional 2026 (CONASAMI), tabulador CACEH', 'Nacional', 'Costo del relevo al piso legal', 'Prestaciones reales (por definir)'],
  ['ENUT 2024 (INEGI)', 'Nacional', 'Participación laboral de mujeres y cuidado (subproyecto en curso)', 'Aún sin doble revisión ni registro en la bitácora'],
], [2.6, 1.3, 2.9, 2.56]));
add(esp(120));
add(P('Estimamos con el diseño muestral de cada encuesta: factores de expansión, estratos y conglomerados, varianza por linealización de Taylor e intervalos al 90 %. Cada estimación lleva su precisión según el coeficiente de variación del INEGI: alta por debajo de 15 %, moderada de 15 a 30 %, baja desde 30 %. Las de precisión baja no cuentan como hallazgo.'));
add(P('Las fuentes territoriales tienen huecos que declaramos en lugar de rellenar: dos archivos de la CDMX no tienen productor ni año documentados, y ninguna fuente nos permite hablar de tendencias.'));

// 5
add(H1('5. Resultados preliminares'));
add(P('Ordenamos los resultados como el Observatorio: del problema a la decisión. Las cifras son nacionales salvo que digamos lo contrario. **Todos están pendientes de doble revisión.**'));
add(H2('5.1 La carga crece con las horas; la necesidad declarada, no'));
add(P('6.2 millones de personas cuidan a alguien con discapacidad o de 60 años y más, y 40.7 % de ellas cuida 40 horas o más a la semana (IC 90 % 36.1–45.3). Quien cuida 40 h o más declara daño a su salud o a su trabajo 31.0 puntos más que quien cuida menos de 20 h (78 % contra 47 %; IC 22.7–39.3). Pero decir «no tuve necesidad» casi no cambia con la intensidad. Entre quienes lo dicen y cuidan 40 h o más, 70.5 % declara daño (42.6 % con menos de 20 h).'));
add(P('**El grupo del problema:** ≈ 776 mil personas (12.5 % de quienes cuidan) cuidan 40 h o más, dicen «no tuve necesidad» y declaran daño. 77.8 % son mujeres. Es el punto de entrada de nuestro programa. **Evidencia:** confirmado para el país (precisión alta); probable como contexto de la CDMX. **Límite:** la pregunta de la ENASIC es por lugares, así que «no tuve necesidad» puede querer decir «no necesito un lugar».'));
add(H2('5.2 La barrera principal es la norma familiar'));
add(P('82.3 % dice que el apoyo debe darlo la familia. Las razones para no buscar servicios son «no tuve necesidad» (49.4 %) y «el propio hogar cuida» (41.9 %); precio, información y desconfianza quedan por debajo de 5 %. En el quintil de ingreso más alto, 24.3 % paga trabajo doméstico, pero solo 2.6 % paga cuidado. 58.1 % querría el cuidado en su casa y 36.3 % aceptaría apoyo externo «solo unas horas del día». **Lectura:** el formato tiene que ser horas en casa, ofrecidas de una forma que la familia acepte, no un buscador ni un descuento.'));
add(H2('5.3 Unas horas de relevo sí caben; la jornada completa, no'));
add(P('Al piso legal ($42.81 la hora), 6 h a la semana cuestan $1,112 al mes y la jornada completa $7,414. Para el hogar mediano de la ENASIC ($6,800 al mes, pesos de 2022) eso es 14.2 % y 94.4 % de su ingreso. Con un tope de 20 % del ingreso, 66.2 % de los hogares con necesidad podría pagar 6 h (ENASIC, nacional) y 92.0 % con el ingreso de la ENIGH para la CDMX (IC 90.6–93.4). La jornada completa la puede pagar 5.3 %.'));
add(CAJA('Poder pagar no es querer contratar', [
  'Hoy contrata cuidado 1.0 % de los hogares con necesidad, y 35.9 % de las cuidadoras de personas con discapacidad o de 60+ dice que no contrataría a nadie a ningún precio. La asequibilidad dice que el precio no es el obstáculo principal; no dice que las familias vayan a aceptar el relevo. Eso solo lo mide el piloto.',
], 'ambar'));
add(H2('5.4 El problema en la Ciudad de México y dónde probar'));
add(P('47.1 % de los hogares de la CDMX tiene una persona de 60+ o con discapacidad: ≈ 1.41 millones (ENIGH 2022, IC 45.0–49.1, confirmado). La oferta formal está mal repartida: con 17.6 % de la población de 60+, Iztapalapa tiene un índice de asilos de 0.52, contra 1.89 de Tlalpan; Milpa Alta no tiene ninguno en el DENUE. Contar establecimientos no mide capacidad, y en el núcleo de oferta 49 de 235 establecimientos tienen nombres que no indican cuidado.'));
add(P('Dentro de una misma alcaldía, la distancia entre sus AGEB (mediana de 13.5 puntos de población sin derechohabiencia) es comparable a la que hay entre alcaldías (13.2). Por eso bajamos a zonas: 43.1 % de las personas de 60+ vive en el tipo de zona 2 («consolidada de transición»), y 36.7 % de las viviendas del tipo 1 no tienen internet. Una app sola deja fuera a buena parte de esas zonas. **Evidencia:** probable (modelo descriptivo, sin cruce con la ENASIC).'));
add(H2('5.5 Lo que dejamos de afirmar'));
add(P('Corregimos tres afirmaciones del primer avance. La comparación «el subsidio cuesta 45.8 % del presupuesto de cuidados de la ciudad» era para media jornada, no para el relevo (sección 8). La cota de 1.10 millones de hogares la sustituye la medición directa de la ENIGH. Y la lectura de que el precio era una barrera central se debilitó al medir el ingreso con la ENIGH (5.3).'));

// 6
add(H1('6. Modelos y su comparación'));
add(P('La UCA de Herramientas y Técnicas Avanzadas pide un modelo validado y documentado, con su desempeño, sus límites y las condiciones de uso. Nuestra regla es comparar cada modelo con una alternativa simple y decirlo cuando la alternativa lo iguala.'));
add(T(['Decisión', 'Modelo', 'Alternativa simple', 'Resultado', 'Estado'], [
  ['¿A quién ofrecer primero el relevo?', 'Regresión logística y gradient boosting (ENASIC, nacional), comparados con otras cinco familias', 'Regla «cuida 40 h o más»', 'Con «algún daño», ningún modelo supera a la regla: +2.2 pp (IC 90 % −4.1 a 8.5). La regla basta.', 'Notebook B §11 · sin doble revisión'],
  ['La misma, con una regla de puntos', 'Tarjeta de puntos (L1 con puntos enteros, script 22)', 'Regla de 40 h', 'No la supera en ninguna variante: completa +2.1 pp (IC −3.7 a 8.0). La usa la app como regla transparente.', 'Exploratorio · sin doble revisión'],
  ['¿Dónde hacer el piloto?', 'k-means sobre 9 indicadores del Censo 2020 por AGEB (notebook D)', 'Regla de dos cortes e índice de una dimensión', 'Partición estable (ARI ≈ 0.97), pero la ciudad es un gradiente: la silueta (0.21) apenas supera a datos sin grupos (0.18). Agrega poco al índice simple (R² 0.53 contra 0.49).', 'Notebook D §18 · sin doble revisión'],
  ['¿A qué hogares dirigir el programa?', 'Logística explicativa de participación laboral de mujeres de 25 a 54 años (ENUT 2024)', 'No declarada', 'En curso. No citamos sus cifras hasta que tenga revisión y registro en la bitácora.', 'Sin doble revisión ni registro'],
], [1.9, 2.3, 1.5, 2.6, 1.06]));
add(H2('6.1 Por qué el resultado nulo es un resultado'));
add(P('Que la regla de 40 h rinda igual que los modelos es útil para el programa: pide un solo dato, se explica sin computadora y trata menos información sensible. Lo reportamos tal cual, y lo reportamos siempre contra la regla.'));
add(H2('6.2 El objetivo del modelo (DEC-OBJ-001)'));
add(P('El 20 de octubre fijamos el objetivo primario en **«algún daño»** y dejamos **«salud física deteriorada»** como sensibilidad. Con salud física el modelo sí gana (+12.7 pp, IC 2.5 a 22.9), pero esa ventaja depende de una sola variable, «le falta fuerza física», y sin ella deja de ser demostrable (+9.1 pp, IC −2.6 a 20.9). Elegir el objetivo donde el modelo luce mejor, después de verlo, sería seleccionar por el resultado. Elegimos con criterios previos: qué puede cambiar el relevo, qué mide el piloto (cansancio y malas noches) y la precisión. **Advertencia:** registramos esta decisión después de explorar, así que no es un preregistro, y todavía no la confirma el equipo completo.'));
add(H2('6.3 Límites que condicionan cualquier modelo'));
add(B('Las actividades básicas y las tareas clínicas no se preguntaron a 384 de las 407 cuidadoras de «solo 60+ sin discapacidad». Cualquier puntaje que las use deja fuera a ese grupo por construcción.'));
add(B('Los modelos se entrenaron con datos nacionales y predicen daño autodeclarado. No están validados para la población de una institución.'));
add(B('Son asociaciones, no causas: ningún modelo prueba que el relevo reduzca el daño.'));
add(B('El script 21 (escalera de métodos de priorización) es exploratorio. Por nuestra regla, no citamos sus cifras hasta que alguien distinto lo revise.'));

// 7
add(H1('7. El programa: relevo por horas'));
add(H2('7.1 Qué no es y qué sí es'));
add(T(['No es', 'Por qué'], [
  ['Un buscador de servicios', 'Desconocer que existen explica 0.9 % de la no búsqueda, y el SIDECU ya es un directorio federal.'],
  ['Un descuento o comparador de precios', 'En el quintil más alto, la contratación de cuidado se queda en 2.6 %.'],
  ['Una residencia o jornada completa', 'Menos del 5 % preferiría una institución, y la jornada completa la paga 5.3 % de los hogares.'],
  ['Un catálogo de cuidadoras', 'El programa asigna; la familia no elige de una lista.'],
], [2.8, 6.56]));
add(esp(100));
add(P('**Qué sí es:** relevo acotado por horas (3 a 12 a la semana), con tareas definidas y sin tareas clínicas, pago al piso legal, seguimiento e incidentes en ambos sentidos. Se ofrece a la cuidadora como tiempo para ella, no como «contrata a alguien para tu mamá», para no pedirle a la familia que renuncie a cuidar.'));
add(H2('7.2 La app «Mientras»'));
add(FIGURA(fig('f_app_flujo.png'), 'Flujo de una solicitud en la app Mientras (versión del 20 oct 2026).'));
add(T(['Problema', 'Cómo lo resolvimos en la app', 'Qué falta'], [
  ['Autoselección: quien pide no es quien más necesita', 'Dos vías de entrada: autorregistro y referencia institucional (DIF, centro de salud, escuela, clínica, módulo). El panel del programa compara puntajes por canal.', 'Medirlo con casos reales: los del prototipo son simulados.'],
  ['Qué se raciona', 'Una bolsa mensual de horas subsidiadas (2,000 h, ilustrativa).', 'Presupuesto real del piloto.'],
  ['Que nadie quede fuera', 'Mínimo garantizado de 13 h al mes, reparto del resto en proporción al puntaje con tope de 52 h, envejecimiento en cola y canal alterno para el nivel Baja.', 'Solo se cumple si la bolsa alcanza para los mínimos: con 1,000 h para 100 personas, 24 esperan.'],
  ['Instrumentos', 'Variables de la tarjeta con la codificación de la ENASIC, sobrecarga tipo Zarit (seguimiento, no puntaje) y Barthel.', 'Licencia de Zarit y versión validada en México.'],
  ['Riesgos', 'Cuatro chequeos de consistencia que mandan a revisión humana; consentimiento expreso; apelación.', 'Aviso de privacidad y dictamen jurídico.'],
], [2.2, 4.4, 2.76]));
add(esp(120));
add(P('**El matching.** La asignación de la persona de relevo es por restricciones: aprobada y certificada, cercana, disponible, con cupo y que cubra las tareas. Gana la más cercana. Si ninguna cumple, la app dice qué restricción falla, y así hace visible el cuello de botella. Tenemos que confirmar con la profesora que esto cumple el requisito de matching del problema prototípico.'));
add(H2('7.3 Con quién se vincularía'));
add(P('Proponemos operar como componente complementario del Sistema Público de Cuidados de la CDMX. El programa «Ciudad que Cuida a Quien Cuida» apoya en 2026 a 5,000 personas cuidadoras de 18 a 56 años con hasta $6,000 al año (UnoTV, 28 may 2026). Es la puerta institucional más cercana, con dos diferencias que hay que resolver: ese programa entrega dinero, no horas, y su tope de edad deja fuera a muchas cuidadoras mayores. No tenemos ningún acuerdo con él. La Ley del Sistema de Cuidados de la Ciudad de México (2 de julio de 2026) obliga a construir la contabilidad del trabajo de cuidados: lo que ofrecemos es la capacidad de medición que esa ley pide.'));

// 8
add(H1('8. Modelo de sostenibilidad'));
add(P('Rehicimos el modelo para el relevo (script 20, 15 oct). El del estudio de negocio v0.2 calculaba media jornada y jornada completa, que no es nuestro producto. El script escribe un libro de Excel con fórmulas vivas y un notebook que recalcula todo y se detiene si no coincide.'));
add(T(['Concepto', 'Resultado con los parámetros base', 'Nivel'], [
  ['Costo laboral de 6 h/semana, diurno, con carga laboral del 22 %', '$1,357 al mes por hogar. Lo paga completo un hogar con ingreso de $6,784 o más (convención del 20 %).', 'Probable: la carga y los artículos de la LFT están por confirmar'],
  ['Subsidio laboral promedio del grupo del problema', '$171 por hogar al mes con ingreso de la ENASIC; $0 con ingreso de la ENIGH CDMX.', 'Depende de una decisión pendiente (fuente del ingreso)'],
  ['Hogares elegibles en la CDMX', '≈ 70,557 (razón nacional del grupo del problema aplicada a los 1,407,522 hogares de la ENIGH).', 'Probable (inferido)'],
  ['Financiamiento anual con 25 % de aceptación', '36.2 millones de pesos: 0.5 % de la solicitud de cuidados de la CDMX (6,747.7 mdp). Con la cota máxima de aceptación (64.1 %), 92.8 mdp (1.4 %).', 'Aceptación ilustrativa'],
  ['Si la operación cuesta $250 por hogar al mes', 'Con 25 % de aceptación, 89.1 mdp (1.3 %); con $1,000, 247.9 mdp (3.7 %).', 'Costo de operación por determinar'],
], [2.6, 4.6, 2.16]));
add(esp(120));
add(P('**Qué mueve más el resultado.** La sensibilidad de un factor a la vez muestra que lo que más mueve el subsidio son las **horas de relevo** (con 12 h sube $755; con 3 h baja a $0) y el **umbral de asequibilidad** (con 10 % sube $292; con 30 % baja a $0). La fuente del ingreso pesa igual. Casi todo lo que decide el subsidio son decisiones de diseño nuestras, no datos, y así lo vamos a decir en la defensa.'));
add(H2('8.1 Tres escenarios de pagador'));
add(T(['Escenario', 'Quién paga', 'Veredicto actualizado'], [
  ['A · Pago directo', 'El hogar, completo', 'Viable para muchos hogares en precio, pero no en contratación: hoy contrata 1.0 %.'],
  ['B · Copago con pagador público', 'Hogar y Sistema Público de Cuidados', 'Nuestra recomendación para el piloto. El subsidio laboral es una fracción pequeña de la solicitud; el riesgo está en la operación y la aceptación.'],
  ['C · Pagador por costo evitado', 'Aseguradora, empleador o sistema de salud', 'Exigente. Si cada salida del empleo evitada vale $100,000 al año, el relevo tendría que reducir esa probabilidad en 16.3 puntos solo para pagar su costo laboral. Con $20,000, necesitaría 81 puntos, más que el 47.7 % que declara daño al trabajo: no puede cumplirse.'],
], [2.0, 2.4, 4.96]));
add(P('No calculamos un punto de equilibrio: el costo de operación (coordinación, verificación, formación, plataforma y nómina) sigue por determinar. En su lugar, el modelo da el financiamiento como función de ese costo y de la aceptación.'));

// 9
add(H1('9. El Observatorio como tablero de decisiones'));
add(P('El Observatorio es el tablero de la UCA de Inteligencia de Negocios. Tiene ocho pestañas, cada una con una pregunta, y 21 indicadores con ficha: 9 confirmados, 10 probables y 2 desconocidos. Los dos desconocidos (cobertura territorial oferta–necesidad y calidad del cuidado domiciliario) aparecen como «no medible» en lugar de llenarse con un supuesto. El detalle está en la Guía del tablero v2.0.'));
add(P('El 20 de octubre construimos un almacén de datos con esquema estrella: cuatro hechos (estimaciones de encuesta, medidas territoriales, asequibilidad y costo de paquetes), diez dimensiones y tres data marts (necesidad de cuidado, territorio y oferta, asequibilidad). El ETL hace cumplir nuestras reglas como código: falla si una cifra de la ENASIC aparece en una alcaldía y no rellena con cero lo que no sabemos. La primera corrida tuvo 0 rechazos y 18 de 20 pruebas pasaron. El Observatorio todavía no lee el almacén.'));
add(H2('9.1 Recomendación ejecutiva'));
add(P('La UCA pide una recomendación sustentada en al menos tres hallazgos. La nuestra:'));
const r = lista();
add(r('**Buscar a la cuidadora, no esperarla** (hallazgos 5.1 y 5.2). Casi nadie busca servicios y el grupo del problema dice «no tuve necesidad». El programa debe entrar por referencia institucional, no solo por autorregistro.'));
add(r('**Ofrecer horas en casa, no jornada ni residencia** (hallazgos 5.2 y 5.3). El formato con respaldo es el relevo de pocas horas, que sí cabe en el ingreso de la mayoría.'));
add(r('**Priorizar con la regla de 40 h** (sección 6). Rinde igual que los modelos y pide menos datos sensibles.'));
add(r('**Elegir la sede del piloto por dónde viven las personas mayores, no por dónde son mayoría, y con un canal sin internet** (hallazgo 5.4).'));

// 10
add(H1('10. Protección de datos'));
add(P('Trabajamos con una población vulnerable y con datos de salud. Lo que ya aplicamos en el diseño:'));
add(B('**En el Observatorio y el almacén:** solo agregados de microdatos públicos. Los microdatos no se suben al repositorio ni se cargan al almacén.'));
add(B('**En la app:** minimización (sin CURP, diagnósticos, edad ni domicilio de la familia), consentimiento expreso antes de la entrevista, identidad validada por la institución fuera de la app, CURP solo para la persona de relevo, y exportación al Observatorio solo de agregados.'));
add(B('**En la verificación de la persona de relevo:** la sostenemos en el riesgo documentado de estafa por terceros (el «pensionazo»), no en la cifra de maltrato familiar.'));
add(P('**Pendiente (UCA de Leyes para la Protección de Datos):** los tres productos de la UCA —dictamen jurídico, protocolo de protección y gobernanza, y rediseño del flujo de datos— todavía no están integrados a este documento. Las preguntas abiertas son la ley aplicable (particulares o sujetos obligados, según la institución receptora y la reforma de 2025), el aviso de privacidad y si un programa público puede dar puntos por ser mujer.'));

// 11
add(H1('11. Aportación de cada UCA'));
add(T(['UCA', 'Lo que pide el problema prototípico', 'Lo que ya tenemos', 'Lo que falta para el final'], [
  ['Inteligencia de Negocios', 'Mapa de objetivos e indicadores; observatorio funcional que apoye decisiones; recomendación ejecutiva con 3 hallazgos', 'Observatorio de 8 pestañas y 21 indicadores con ficha; almacén con esquema estrella, 3 data marts y ETL; recomendación (9.1)', 'Doble revisión; decidir si el Observatorio lee el almacén; indicadores operativos del piloto'],
  ['Analítica para los Negocios', 'Informe analítico de impacto; propuesta de política basada en evidencia; observatorio con indicadores clave', 'Hallazgos priorizados (sección 5); modelo de sostenibilidad con escenarios (sección 8)', 'Costo de operación; contrastar la solicitud de la CDMX con el decreto; ejemplo de uso por una institución'],
  ['Herramientas y Técnicas Avanzadas', 'Modelo avanzado validado y documentado, con desempeño, límites y condiciones de uso; inventario y ficha de fuentes; modelo de datos', 'Dos modelos validados contra alternativas simples (focalización y tipología); inventario de 29 fuentes; tarjeta de puntos exploratoria', 'Doble revisión de los scripts 21 y 22 y de la ENUT 2024; decidir si se presenta la tarjeta o solo la regla'],
  ['Leyes para la Protección de Datos', 'Dictamen jurídico; protocolo de protección y gobernanza; rediseño del flujo de datos', 'Minimización y consentimiento en la app; regla de solo agregados en el Observatorio', 'Los tres productos de la UCA; aviso de privacidad; dictamen sobre puntuar por sexo'],
  ['Seminario de Titulación I', 'Anteproyecto con problematización, supuesto, preguntas, objetivos reformulados y metodología', 'Supuesto original que no se sostuvo y reformulación documentada (sección 3); bitácora como evidencia del proceso', 'Redacción del anteproyecto en formato APA 7'],
  ['Práctica Profesional I', 'Diagnóstico de la institución, FODA, plan dirigido a la institución y bitácora del piloto', 'Diseño del piloto y de su medición (relevo, cansancio, malas noches, permanencia en el empleo)', '**Institución receptora y sede del piloto: por confirmar.** Es nuestro riesgo mayor'],
], [1.7, 2.7, 2.7, 2.26]));

// 12
add(H1('12. Riesgos y supuestos'));
add(T(['Riesgo o supuesto', 'Qué pasa si falla'], [
  ['La barrera es la norma familiar, no el precio', 'Si fuera precio, bastaría un subsidio. Lo medimos en el piloto preguntando a hogares que pagan trabajo doméstico y no cuidado.'],
  ['Habrá institución receptora para el piloto', 'Sin ella no hay diagnóstico situado ni medición. Hoy no tiene fecha.'],
  ['Las familias aceptarán relevo en casa', 'La ENASIC pregunta por lugares, no por apoyo en casa. Nadie lo ha medido.'],
  ['Las respuestas que suben el puntaje son honestas', '«Le falta fuerza» y «requiere apoyo» son las más fáciles de inflar. Los chequeos las mandan a revisión, pero el de Zarit no funciona sin licencia.'],
  ['La bolsa alcanza para los mínimos', 'Si no alcanza, parte de los casos espera. «Nadie queda fuera» es una restricción de presupuesto, no del código.'],
  ['Las tasas nacionales aplican a la CDMX', 'El dimensionamiento cambia. La CDMX está más envejecida que el país.'],
  ['Riesgo ético con población vulnerable', 'Daño real a personas mayores, con discapacidad y cuidadoras. Requiere protocolo de datos antes del primer contacto.'],
], [3.2, 6.16]));
add(P('La investigación de riesgos legales del primer avance (abuso patrimonial, estafa dirigida, fraude institucional y tutela) sigue vigente; el detalle está en `Riesgos_Cuidado_Fraude_Interdiccion_Informe_Completo.docx`.'));

// 13
add(H1('13. Lo que nos falta decidir'));
const d = lista();
add(d('**Sede del piloto e institución receptora**, con responsable y fecha.'));
add(d('**Fuente del ingreso** para asequibilidad y subsidio (ENASIC o ENIGH): mueve el subsidio de $171 a $0.'));
add(d('**Tarjeta o regla:** si la app y la presentación usan la tarjeta de puntos o solo la regla de 40 h, y si la variable «mujer» se queda.'));
add(d('**Confirmar DEC-OBJ-001** como equipo (objetivo «algún daño»).'));
add(d('**Valores del programa:** bolsa, mínimo, tope, umbral de nivel Alta y envejecimiento.'));
add(d('**Método del Observatorio:** llenar o retirar las tres decisiones que hoy dicen «TBC».'));
add(d('**Repositorio:** crear el repositorio git del Observatorio antes de la entrega. El 20 de octubre borramos los respaldos y hoy la bitácora es la única evidencia de las versiones anteriores.'));
add(d('**Nombre:** si «Mientras» se adopta, se cambia o se pospone.'));

// 14
add(H1('14. Estado de la evidencia y doble revisión'));
add(T(['Pieza', 'Estado de revisión'], [
  ['Notebooks A a D (secciones 01 a 18)', 'Sin doble revisión'],
  ['Scripts 19 y 20', 'Sin doble revisión'],
  ['Scripts 21 y 22', 'Exploratorios; sin doble revisión. Las cifras del 21 no se citan.'],
  ['Subproyecto ENUT 2024', 'Sin doble revisión ni entrada en la bitácora; no se citan sus cifras.'],
  ['Observatorio y almacén', 'Sin doble revisión'],
  ['App Mientras', 'Sin doble revisión; datos simulados'],
  ['Este documento', 'Sin doble revisión'],
], [4.0, 5.36]));
add(esp(120));
add(P('Antes de la segunda revisión, cada pieza necesita que alguien distinto a quien la hizo la revise y lo registre en la bitácora. Si eso no ocurre a tiempo, la presentaremos como resultado preliminar y lo diremos así.'));

// Fuentes
add(H1('Fuentes'));
[
  'INEGI. Encuesta Nacional para el Sistema de Cuidados (ENASIC) 2022: microdatos.',
  'INEGI. Encuesta Nacional de Ingresos y Gastos de los Hogares (ENIGH) 2022; CONEVAL, programa de cálculo de la pobreza 2022.',
  'INEGI. Censo de Población y Vivienda 2020: principales resultados por AGEB y manzana urbana, CDMX; Marco Geoestadístico 2025.',
  'INEGI. Directorio Estadístico Nacional de Unidades Económicas (DENUE), CDMX, 05/2026.',
  'INEGI. Encuesta Nacional sobre Uso del Tiempo (ENUT) 2024 (subproyecto en curso).',
  'CONEVAL. Índice de Rezago Social 2020 por AGEB. CONAPO. Índices de marginación 2020.',
  'CONASAMI. Salarios mínimos profesionales 2026, DOF 09-dic-2025.',
  'UnoTV. «¿Cuidas a un adulto mayor o persona con discapacidad? CDMX da apoyo de hasta 6 mil pesos y servicios gratis», 28 de mayo de 2026. Consultado el 21 de octubre de 2026.',
  'Gobierno de la Ciudad de México. Ley del Sistema de Cuidados de la Ciudad de México, 2 de julio de 2026 (citada en el primer avance).',
  'Universidad Nacional Rosario Castellanos. Problema prototípico 7.º semestre LCDN 2026-2.',
  'Documentos internos: bitácora de decisiones; Propuestas_programa_poblacion_objetivo_v0.2; Observatorio_Cuidado_Hallazgos_y_Propuestas_v5; Riesgos_Cuidado_Fraude_Interdiccion_Informe_Completo; Analysis/resultados (secciones 03 a 22); DW/docs.',
].forEach((t) => add(B(t)));

construir({
  portada: fig('portada_maestro.jpg'), encabezado: 'Documento maestro · 2.º avance', pie: 'Segunda revisión, 2 al 6 nov 2026  ·  Pendiente de doble revisión',
  meta: { title: 'Documento maestro de avance v2.0 — Observatorio del Cuidado', description: 'Segundo avance: hallazgos, modelos, programa de relevo por horas, sostenibilidad y aportación de cada UCA' },
  C, salida: process.argv[2] || 'Documento_Maestro_Avance2_Observatorio_del_Cuidado_v2.docx',
});
