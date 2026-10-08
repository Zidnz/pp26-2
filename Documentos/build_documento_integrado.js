// Construye Documento_Integrado_Observatorio_Cuidado_v0.3.docx (v0.1: 22 sep; v0.2: 23 sep; v0.3: 24 sep 2026)
// Observatorio de Datos para la Economía del Cuidado · LCDN 7.º semestre · UNRC · 2026-2
// Ejecutar:  node build_documento_integrado.js

const fs = require('fs');
const { Document, Packer, AlignmentType, Paragraph, TextRun } = require('docx');
const C = require('./comun');
const {
  V, n0, n1, n2, pct, mx, mx2, p, rica, h1, h2, h3, vi, viR, num, regla, caja, tabla,
  figura, salto, numbering, estilos, piePagina, propiedadesPagina, portada,
  GUINDA, AZUL, OCRE, TINTA2, TINTA3,
} = C;

const B = V.barreras, Q = V.quintiles, PA = V.pago, IN = V.ingreso;
const AS = V.asequibilidad, SU = V.subsidio, CX = V.cdmx, TE = V.territorio, EX = V.externo;
const FE = V.federal, N7 = V.n07, N8 = V.n08, N9 = V.n09;
const pisoHora = EX.sm_hogar_2026_dia / 8;
const cacehHora = EX.caceh_cat8_dia / 8;

const hijos = [];
const add = (...x) => x.flat().forEach((e) => hijos.push(e));

// ════════════════════════════ PORTADA ════════════════════════════
add(portada(
  'Economía del cuidado en la Ciudad de México',
  'Delimitación del problema, selección de nicho y hallazgos del análisis exploratorio',
  'Documento integrado de investigación',
  '1.ª Revisión · 26 de septiembre de 2026',
  [
    [['Redacción: ', true], ['Omar Gutiérrez Escoto']],
    [['Integrantes: ', true], ['Daniel [apellido pendiente] · Alondra Danae [apellido pendiente]']],
    [['Revisión cruzada: ', true], ['PENDIENTE. La regla del proyecto exige que quien produce un entregable no sea quien lo aprueba. Este documento no ha sido aprobado.']],
    [['Versión: ', true], ['0.3 · 24 de septiembre de 2026. Sustituye a la 0.2 del 23 de septiembre, que se conserva en la carpeta por la regla de historia real, igual que la 0.1. Los cambios se listan en la nota inicial.']],
    [['Sustituye a: ', true], ['Documento_investigacion_general.pdf (11 de septiembre de 2026). Aquella versión queda superada; se conserva en el repositorio por la regla de historia real.']],
  ],
));
add(salto());

// ════════════════════════════ NOTA PREVIA ════════════════════════════
add(h1('Nota sobre este documento'));
add(p('Este documento reúne lo que el equipo puede afirmar hoy, con evidencia verificable, sobre el problema asignado. Sigue el criterio de evidencia acordado: toda afirmación se marca como confirmada, probable o desconocida. «Desconocido» es una respuesta válida y no se convierte en supuesto por la presión de completar un entregable.'));
add(rica([
  ['Ninguna cifra nace en este archivo. ', true],
  ['Cada número se lee de un archivo de resultados en ', ], ['Analysis/resultados/', false, GUINDA],
  [' o ', ], ['Analysis/outputs/', false, GUINDA],
  [', a través de ', ], ['_valores.json', false, GUINDA],
  ['. El documento lo genera ', ], ['build_documento_integrado.js', false, GUINDA],
  ['. Si un análisis cambia, se vuelve a correr el script y el documento se actualiza solo. Las cifras que no provienen de un análisis propio (salarios mínimos, INPC, presupuesto público, marco legal) se declaran como externas y llevan fuente y fecha de consulta.'],
]));
add(caja('Tres correcciones que este documento introduce', [
  [['1. La aplicación con los perfiles «Necesito cuidado» y «Puedo cuidar» es un requisito institucional, no una propuesta del equipo. ', true],
   ['La bitácora del 20 de septiembre registró lo contrario. El documento «Problema Prototípico 7.º Sem LCDN 2026-2», en el apartado «Programa de innovación social», pide literalmente «dos perfiles funcionales mínimos: Necesito cuidado y Puedo cuidar». El mismo apartado exige que el programa derive «de un hallazgo del Observatorio, no de una solución preconcebida». Lo que hay que justificar con datos no es la existencia de la aplicación, sino qué problema resuelve.']],
  [['2. El salario mínimo profesional de 2022 estaba mal capturado. ', true],
   ['El script 04 usaba $187.22 por día; el valor publicado es ' + mx2(EX.sm_hogar_2022_dia) + '. Corregido y reejecutado el 22 de septiembre de 2026.']],
  [['3. La hipótesis de precio, adoptada el 20 de septiembre, no sobrevive a su propia prueba. ', true],
   ['El análisis por quintil de ingreso que la propia bitácora propuso como prueba decisiva se ejecutó por primera vez el 22 de septiembre. Su resultado se presenta en la sección 8.4 y obliga a reformular el hallazgo central.']],
], GUINDA));
add(p(''));
add(caja('Cambios de la versión 0.2 (23 de septiembre de 2026)', [
  [['1. Dos cifras de búsqueda se sustituyen por sus equivalentes con precisión suficiente. ', true],
   ['«Buscó un servicio» pasa de ' + pct(B.busco_servicio) + ' (universo de discapacidad o 60 y más, coeficiente de variación de ' + n1(B.busco_servicio_cv) + ' %) a ' + pct(B.busco_todas) + ' (todas las personas cuidadoras, precisión alta). «Desconoce que existen» pasa de ' + pct(B.desconoce) + ' (precisión baja) a ' + pct(B.desconoce_todas) + ' (todas las personas cuidadoras, precisión moderada). Las cifras anteriores se conservan en la sección 8.3 como contexto, no como hallazgo.']],
  [['2. H1 y H2 cambian de estatus. ', true],
   ['La versión 0.1 las marcaba como confirmadas con precisión baja, lo que contradecía la sección 11 y el criterio de evidencia. H1 queda como probable; H2 se reformula con la cifra de precisión moderada.']],
  [['3. Se agrega la sección 8.5 (notebook 07): ', true],
   ['la carga del cuidado no se nombra como necesidad, la norma familiar se mide directamente y aparece el daño declarado. Se agregan H9 a H11.']],
  [['4. Se agrega la sección 8.6 (script 08): ', true],
   ['concentración de la dependencia severa por alcaldía y dos problemas de calidad en los archivos de investigación. Se agrega H12 y dos filas al inventario de la sección 7.2.']],
  [['5. Nota de verificación: la razón de 2.7 veces en H1 es correcta. ', true],
   ['La bitácora del 22 y el 23 de septiembre la citó como 2.6, que es el porcentaje de contratación de cuidado en el quintil 5, no la razón entre quintiles.']],
], AZUL));
add(p(''));
add(caja('Cambios de la versión 0.3 (24 de septiembre de 2026)', [
  [['1. Se agrega la sección 8.7 (notebook 09): ', true],
   ['pobreza CONEVAL por alcaldía para el grupo de 65 años y más, con las 16 alcaldías. Es una variable de contexto de vulnerabilidad económica, no un indicador de cuidado: no cumple la regla de compatibilidad oferta-necesidad de la sección 7.3 y no genera un hallazgo nuevo (no se agrega ninguna fila a la tabla de la sección 8.8, que renumera a la antigua 8.7).']],
  [['2. Una fila nueva en el inventario de la sección 7.2. ', true],
   ['El archivo de CONEVAL, a diferencia de la mayoría de los archivos territoriales de este proyecto, sí tiene productor, año y ficha de fuente completos.']],
], AZUL));
add(p(''));
add(caja('Cómo leer las cifras de este documento', [
  [['Confirmado: ', true], ['proviene de una fuente citable, con fecha de consulta, o de un análisis propio reproducible que valida contra una cifra publicada.']],
  [['Probable: ', true], ['inferencia cuya base se declara de forma explícita, junto con la dirección de su sesgo.']],
  [['Desconocido: ', true], ['el equipo no lo sabe. Se dice.']],
  [['Precisión estadística: ', true], ['las estimaciones con microdatos de la ENASIC siguen el criterio del INEGI por coeficiente de variación: alta si es menor a 15 %, moderada entre 15 % y 30 %, baja a partir de 30 %. Se indica en cada caso.']],
  [['Alcance geográfico: ', true], ['la ENASIC 2022 es nacional y no admite estimaciones para la Ciudad de México ni por alcaldía. Donde se usan sus tasas para hablar de la ciudad, se dice que es una inferencia y no una medición.']],
], AZUL));
add(salto());

// ════════════════════════════ 1 ════════════════════════════
add(h1('1. Qué es la economía del cuidado'));
add(h2('1.1 Definición y alcance'));
add(p('La economía del cuidado agrupa las actividades, relaciones, servicios y recursos destinados a atender las necesidades físicas, emocionales y cotidianas de las personas, y a sostener las condiciones que hacen posible la vida en sociedad. Incluye el cuidado directo de niñas y niños, personas mayores, personas con discapacidad, personas enfermas o en situación de dependencia, y también las actividades domésticas que lo hacen posible: preparar alimentos, limpiar, organizar el hogar, trasladar a las personas, acompañarlas, administrar medicamentos o brindar apoyo emocional.'));
add(p('Estas actividades se realizan de manera remunerada o no remunerada, dentro de los hogares, las comunidades, las instituciones públicas o el mercado. Aunque la mayor parte no genera un salario, tienen valor económico porque permiten que otras personas estudien, trabajen y participen en la vida económica. Por eso la economía del cuidado no se describe bien como «ayuda»: es infraestructura social, en el mismo sentido en que lo son el transporte o el agua potable.'));
add(p('El cuidado no se distribuye de manera equitativa. El género, la edad, la condición socioeconómica, la discapacidad, el territorio y la disponibilidad de servicios determinan quién cuida, quién recibe cuidados, cuánto tiempo se destina y qué posibilidades hay de acceder a apoyo. Cuando la responsabilidad recae en los hogares y, dentro de ellos, desproporcionadamente en las mujeres, se traduce en sobrecarga de tiempo y en oportunidades educativas y laborales perdidas.'));

add(h2('1.2 Por qué es un problema de datos, y no solo de servicios'));
add(p('La magnitud nacional del fenómeno está medida. La Encuesta Nacional para el Sistema de Cuidados (ENASIC) 2022 del INEGI estimó 58.3 millones de personas susceptibles de recibir cuidados en los hogares y 31.7 millones de personas de 15 años y más que brindaron cuidados. La Cuenta Satélite del Trabajo No Remunerado de los Hogares 2024 valoró ese trabajo en 8 billones de pesos, equivalentes a 23.9 % del producto interno bruto. Ambas cifras son confirmadas y están en el planteamiento institucional del problema.'));
add(rica([
  ['Lo que no está medido es la escala a la que se toman las decisiones. ', true],
  ['La ENASIC es nacional: su muestra de 7 021 viviendas y su base final de 6 423 registros no admiten estimaciones por entidad ni por alcaldía. La Cuenta Satélite tampoco llega a la alcaldía. Es decir, México sabe cuánto vale el cuidado que no se paga, pero la Ciudad de México no sabe en qué colonias falta. Esa brecha entre la escala de la medición y la escala de la decisión es el problema que un Observatorio puede atacar, y es lo que distingue este proyecto de un ejercicio de compilación estadística.'],
]));

add(h2('1.3 Qué cambió en 2026: el cuidado dejó de ser un tema y pasó a ser una obligación'));
add(p('Entre noviembre de 2025 y julio de 2026 ocurrieron tres cosas que reencuadran el proyecto. No son contexto decorativo: cambian qué vacío puede llenar el Observatorio y ante quién.'));
add(h3('El mandato local'));
add(rica([
  ['El 26 de mayo de 2026 el Congreso de la Ciudad de México aprobó por unanimidad la Ley del Sistema de Cuidados de la Ciudad de México, promulgada el 2 de julio de 2026. Entre sus mandatos está ', ],
  ['la creación de una contabilidad oficial del trabajo doméstico y de cuidados no remunerado de la ciudad, por primera vez', true],
  ['. Esa obligación describe, casi literalmente, la función de un Observatorio de Datos para la Economía del Cuidado.'],
]));
add(h3('El mandato federal y su presupuesto'));
add(p(`En paralelo, el Gobierno federal construye el Sistema Nacional y Progresivo de Cuidados. Su instrumento presupuestario es el Anexo Transversal 31 del Proyecto de Presupuesto de Egresos de la Federación 2026, que suma ${n0(FE.anexo31_mdp)} millones de pesos: ${n1(EX.anexo31_pct_pib)} % del producto interno bruto estimado para 2026 y ${n2(EX.anexo31_pct_ppef)} % del proyecto de presupuesto, repartidos en ${n0(EX.anexo31_programas)} programas presupuestarios de ${n0(EX.anexo31_instituciones)} instituciones federales. El anexo organiza esos programas en seis objetivos: reconocer el trabajo de cuidados, reducir el tiempo que dedican las familias, redistribuirlo entre mujeres y hombres, ampliar la cobertura de servicios, reducir las barreras de acceso y garantizar la pertinencia.`));
add(caja('Una cifra que conviene no citar mal', [
  [['El Anexo 31 no es dinero nuevo para cuidados. ', true],
   ['El propio documento lo define como el punto de partida para construir el sistema «mediante la identificación de recursos ya invertidos». Es una reclasificación de programas existentes bajo una etiqueta común.']],
  [['Su composición lo confirma: ', true],
   ['las tres pensiones del Bienestar —personas adultas mayores, personas con discapacidad permanente y Mujeres Bienestar— suman ' + n0(EX.anexo31_pensiones_mdp) + ' millones, el ' + n0(EX.anexo31_pensiones_pct) + ' % del anexo, y los tres programas mayores (beca de educación básica, servicios de salud del IMSS y pensión de adultas mayores) concentran más del 80 % del total. Son transferencias monetarias y servicios de salud y educación, no infraestructura de cuidado.']],
  [['Por qué importa para este proyecto: ', true],
   ['presentar ' + n0(FE.anexo31_mdp) + ' millones como «lo que México gasta en cuidados» sería exactamente el tipo de error que las reglas del proyecto prohíben. La cifra se cita con su definición o no se cita.']],
], OCRE));
add(h3('La plataforma que ya existe: el SIDECU'));
add(p(`El 5 de noviembre de 2025 la Secretaría de las Mujeres y el Sistema Nacional DIF presentaron el Sistema de Información de Cuidados (SIDECU), una plataforma pública que permite localizar servicios de cuidado. En su primera fase integra alrededor de ${n0(EX.sidecu_centros)} centros públicos de cuidado de ${n0(EX.sidecu_instituciones)} instituciones, en cinco categorías —cuidado infantil, personas mayores, rehabilitación y discapacidad, centros comunitarios y residencias—, con búsqueda por entidad, municipio o alcaldía y código postal.`));
add(caja('El hueco que el SIDECU deja abierto, y que este Observatorio ocupa', [
  [['1. El SIDECU mapea centros, no cuidado domiciliario. ', true],
   ['Sus cinco categorías son todas de establecimiento. La modalidad que ' + pct(B.en_su_casa) + ' de las personas cuidadoras prefiere —cuidado en la propia casa— no aparece, porque no tiene establecimiento que mapear. Es justamente el nicho que este proyecto seleccionó (sección 4).']],
  [['2. Mapea oferta pública, no necesidad. ', true],
   ['Un directorio dice dónde hay servicios. No dice dónde hacen falta, ni cuántas personas quedan sin ellos, ni qué le cuesta a un hogar no tenerlos. La contabilidad que la ley de la CDMX exige es de lo segundo, no de lo primero.']],
  [['3. Consecuencia directa para el diseño: ', true],
   ['construir un directorio de servicios de cuidado duplicaría una plataforma nacional presentada hace diez meses. Esto se discute en el estudio de negocio, sección 2.2.']],
  [['Pendiente: ', true], ['verificar en la plataforma si los datos del SIDECU son descargables y a qué nivel territorial llegan. Si lo son, es la mejor fuente candidata para el componente de oferta institucional del Observatorio, que hoy se construye con el DENUE y sus limitaciones conocidas (sección 8.2). Responsable por asignar.']],
], AZUL));
add(salto());

// ════════════════════════════ 2 ════════════════════════════
add(h1('2. Planteamiento del problema'));
add(h2('2.1 El problema tal como lo plantea la institución'));
add(p('El planteamiento institucional sostiene que el problema no consiste únicamente en que exista una necesidad de cuidado, sino en que la información sobre esa necesidad, su distribución y los recursos disponibles se encuentra fragmentada entre hogares, instituciones, organizaciones y distintas fuentes de datos. Esa fragmentación dificulta reconocer desigualdades, anticipar necesidades, asignar recursos y diseñar soluciones pertinentes.'));

add(h2('2.2 El problema tal como lo reformula la evidencia del equipo'));
add(p('El equipo probó esa formulación con microdatos y encontró que solo se sostiene en parte. La fragmentación de la información existe, pero no es lo que impide que los hogares accedan a cuidado. Cuatro resultados lo muestran, y los cuatro se documentan en la sección 8:'));
add(num(`Casi nadie busca servicios de cuidado. Solo ${pct(B.busco_todas)} de las personas que cuidan buscó alguno (precisión alta).`));
add(num(`Entre quienes cuidan a una persona con discapacidad o de 60 años y más y no buscaron, la razón dominante es que el propio hogar cuida (${pct(B.hogar_cuida)}); el precio pesa ${pct(B.son_caros)}. Desconocer que los servicios existen explica ${pct(B.desconoce_todas)} de la no búsqueda entre todas las personas cuidadoras (precisión moderada).`));
add(num(`El ingreso del hogar no destraba la contratación de cuidado. En el quintil más alto, la contratación de trabajo doméstico llega a ${pct(Q.domestico.q5)}, pero la de enfermería o persona cuidadora se queda en ${pct(Q.cuidado.q5)}.`));
add(num(`La carga no se nombra como necesidad. Quien cuida 40 horas o más a la semana dice «no tuve necesidad» casi tanto como quien cuida menos de 20 (${pct(N7.sin_nec_40mas)} contra ${pct(N7.sin_nec_menos20)}), pero entre quienes lo dicen, ${pct(N7.dano_40mas)} declara algún daño a su salud o a su trabajo, contra ${pct(N7.dano_menos20)} (sección 8.5).`));
add(rica([
  ['Reformulación propuesta. ', true],
  ['El problema no es que las familias no encuentren servicios de cuidado, ni que no puedan pagarlos en el sentido simple de no tener dinero. El problema es que ', ],
  ['el cuidado de una persona dependiente no se delega, ni siquiera en hogares que ya pagan a alguien para que entre a su casa a hacer otras tareas', true],
  [', y que al precio que costaría un servicio de cuidado formal y bien pagado, la enorme mayoría de los hogares con necesidad queda fuera del mercado. Son dos barreras distintas —una normativa y de confianza, otra de asequibilidad estructural— y cada una exige un tipo de intervención diferente.'],
]));
add(caja('Qué está en disputa dentro del equipo', [
  'El 20 de septiembre se decidió reencuadrar el programa alrededor del precio y del cuidado domiciliario, con base en un cálculo descriptivo: el pago mediano a una cuidadora equivalía al 53 % del ingreso mediano de los hogares con necesidad. Ese cálculo tenía n = 45, sin ponderar, y provenía de hogares que sí contratan, es decir, con sesgo de selección: describe a quien compra, no explica a quien no compra.',
  'La propia bitácora propuso la prueba correcta: la tasa de contratación por quintil de ingreso. Esa prueba se ejecutó el 22 de septiembre y su resultado (sección 8.4) no respalda al precio como cuello de botella principal. La decisión del 20 de septiembre debe revisarse antes del 26.',
  [['Estado: ', true], ['la decisión del 20 de septiembre sigue pendiente de confirmación por Daniel y Alondra Danae. Esta reformulación también lo está.']],
], GUINDA));

add(h2('2.3 Preguntas de investigación'));
add(p('Las preguntas directrices institucionales se conservan. El equipo agrega tres que surgen de la evidencia y que pueden responderse o refutarse con datos:'));
add(vi('¿Qué explica que hogares con la misma capacidad de pago compren trabajo doméstico y no compren cuidado? ¿Es preferencia, desconfianza, o que el servicio que se ofrece no corresponde a lo que el hogar necesita?'));
add(vi('¿A qué precio y bajo qué condiciones de verificación un hogar de la Ciudad de México estaría dispuesto a delegar cuidado de una persona dependiente?'));
add(vi('¿Qué parte de la necesidad de cuidado puede localizarse a nivel de alcaldía o colonia con fuentes públicas, y qué parte requiere levantamiento propio?'));
add(salto());

// ════════════════════════════ 3 ════════════════════════════
add(h1('3. Justificación'));
add(p('El tema fue asignado por la institución como problema prototípico del séptimo semestre: no se elige, se delimita. Su relevancia se sostiene en cuatro razones del planteamiento institucional, a las que el equipo suma dos propias.'));
add(vi('Sostiene la economía real: sin cuidado, millones de personas no podrían incorporarse al trabajo remunerado.'));
add(vi('Incide en la desigualdad: la mayor parte del trabajo de cuidados recae en las mujeres, lo que limita su tiempo, sus ingresos y sus oportunidades.'));
add(vi('Con frecuencia no es remunerado ni reconocido, y queda fuera de las mediciones económicas tradicionales.'));
add(vi('Es fundamental para las políticas públicas: guarderías, estancias, centros de día, permisos laborales y apoyos a personas cuidadoras surgen de reconocer estas necesidades.'));
add(viR([['Existe un mandato legal sin fuente de datos que lo satisfaga. ', true], ['La Ley del Sistema de Cuidados de la CDMX obliga a construir la contabilidad del cuidado no remunerado de la ciudad; las fuentes que permiten hacerlo son nacionales (sección 1.3).']]));
add(viR([['No existe todavía una delimitación validada de qué puede afirmar el Observatorio y con qué datos. ', true], ['Construirla antes de diseñar tablero, modelo o base de datos es condición para que cualquier hallazgo posterior sea defendible. Este documento es esa delimitación.']]));
add(p('Objetivos de Desarrollo Sostenible vinculados: 3 (Salud y bienestar), 5 (Igualdad de género), 8 (Trabajo decente y crecimiento económico), 10 (Reducción de las desigualdades), 11 (Ciudades y comunidades sostenibles) y 17 (Alianzas para lograr los objetivos).'));
add(salto());

// ════════════════════════════ 4 ════════════════════════════
add(h1('4. Nichos de la economía del cuidado y selección del nicho de trabajo'));
add(p('«Economía del cuidado» nombra un campo demasiado amplio para un Observatorio de un semestre. Delimitarlo exige, primero, distinguir sus nichos y, después, elegir uno con un criterio explícito. Esta sección hace ambas cosas.'));

add(h2('4.1 Mapa de nichos'));
add(p('Un nicho se define aquí por la combinación de quién recibe el cuidado y qué tipo de cuidado es, porque esa combinación determina qué fuentes de datos existen y qué intervención es posible.'));
add(tabla(
  ['Nicho', 'Quién recibe el cuidado', 'Qué se necesita medir'],
  [
    ['N1 · Primera infancia', 'Niñas y niños de 0 a 5 años', 'Cobertura de estancias y CENDI, jornada laboral de madres y padres, distancia al servicio'],
    ['N2 · Edad escolar', 'Niñas y niños de 6 a 14 años', 'Horas de acompañamiento escolar, desfase entre horario escolar y laboral'],
    ['N3 · Personas mayores dependientes', 'Personas de 60 y más con limitación funcional', 'Dependencia por actividades de la vida diaria, oferta residencial y domiciliaria, costo'],
    ['N4 · Personas con discapacidad', 'Todas las edades, con discapacidad', 'Tipo y grado de apoyo requerido, servicios especializados disponibles'],
    ['N5 · Enfermedad crónica o recuperación', 'Personas en tratamiento o convalecencia', 'Episodios, duración, articulación con el sistema de salud'],
    ['N6 · Respiro para quien cuida', 'Personas cuidadoras no remuneradas', 'Carga horaria, desgaste, renuncia al empleo, salud de la persona cuidadora'],
    ['N7 · Trabajo del hogar remunerado', 'Personas trabajadoras del hogar', 'Salario, formalidad, seguridad social, condiciones de trabajo'],
    ['N8 · Formación y certificación', 'Personas que cuidan, pagadas o no', 'Oferta formativa, certificación, brecha de competencias'],
  ], [16, 27, 42], { negritaCol0: true, izq: [1, 2] },
));

add(h2('4.2 Criterios de selección'));
add(p('Las reglas del proyecto obligan a elegir por lo que los datos permiten afirmar, no por lo que resulta atractivo. Se usaron seis criterios, cada uno calificado 0, 1 o 2:'));
add(vi('C1 · Microdatos públicos y reproducibles disponibles para el nicho.'));
add(vi('C2 · Posibilidad de desagregación territorial a nivel alcaldía o menor.'));
add(vi('C3 · Necesidad declarada medida, no solo inferida de la demografía.'));
add(vi('C4 · Oferta instalada medida o localizable.'));
add(vi('C5 · Hueco de política pública documentado, es decir, que el nicho no esté ya cubierto por un programa existente.'));
add(vi('C6 · Posibilidad de que el equipo levante dato propio en el piloto de práctica profesional.'));

add(h2('4.3 Matriz de decisión'));
add(tabla(
  ['Nicho', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'Total'],
  [
    ['N1 · Primera infancia', '2', '1', '2', '2', '0', '1', '8'],
    ['N2 · Edad escolar', '1', '1', '1', '0', '1', '1', '5'],
    ['N3 · Personas mayores dependientes', '2', '1', '2', '2', '2', '2', '11'],
    ['N4 · Personas con discapacidad', '2', '2', '2', '1', '2', '2', '11'],
    ['N5 · Enfermedad crónica', '0', '0', '1', '0', '1', '1', '3'],
    ['N6 · Respiro para quien cuida', '2', '0', '2', '0', '1', '2', '7'],
    ['N7 · Trabajo del hogar remunerado', '1', '0', '1', '0', '2', '1', '5'],
    ['N8 · Formación y certificación', '1', '0', '2', '1', '1', '1', '6'],
  ], [30, 10, 10, 10, 10, 10, 10, 12], { negritaCol0: true },
));
add(p('Sustento de las calificaciones más determinantes, en orden de importancia:', { after: 100 }));
add(viR([['N3 y N4 obtienen 2 en C1 ', true], ['porque el equipo descargó los microdatos de la ENASIC 2022, los procesó con su diseño muestral (estratos EST_DIS, conglomerados UPM_DIS, factor FAC_HOG) y validó el procedimiento reproduciendo dos cifras publicadas por el INEGI: ' + pct(B.valida_32pct) + ' de población de 15 años y más que brinda cuidados, contra el 32.0 % publicado, y ' + pct(B.valida_contrata) + ' de hogares que contratan enfermería o cuidadoras, contra el 0.8 % publicado, que cae dentro del intervalo al 90 %.']]));
add(viR([['N1 obtiene 0 en C5 ', true], ['porque la Ley del Sistema de Cuidados de la CDMX ya compromete 300 centros de cuidado y desarrollo infantil y el presupuesto 2026 destina 920.1 millones de pesos a primera infancia. El hueco de política pública es menor que en otros nichos; el Observatorio aportaría poco que no esté ya en marcha.']]));
add(viR([['N4 obtiene 2 en C2 ', true], ['porque el Portal de Datos Abiertos de la Ciudad de México publica población con discapacidad por AGEB del Censo 2020, y el equipo ya tiene el archivo por alcaldía de población con discapacidad que necesita ayuda para las actividades de la vida diaria.']]));
add(viR([['N6 obtiene 0 en C2 y C4 ', true], ['porque no existe ninguna fuente territorial sobre personas cuidadoras no remuneradas en la Ciudad de México ni sobre servicios de respiro. Es un nicho relevante y sin medir: se registra como línea de continuidad, no como nicho de trabajo de este semestre.']]));
add(viR([['N7 obtiene 0 en C2 y C4 ', true], ['por la misma razón. Sigue siendo central para el programa, pero como dimensión del nicho elegido —las condiciones de quien cuida— y no como nicho independiente.']]));

add(h2('4.4 Nicho elegido'));
add(caja('Nicho de trabajo del Observatorio', [
  [['Cuidado de personas mayores con dependencia funcional y de personas con discapacidad, con énfasis en la modalidad domiciliaria, en la Ciudad de México (N3 + N4).', true]],
  'Se trabajan juntos y no por separado porque las fuentes los tratan juntos: la ENASIC define el universo de hogares con necesidad como aquellos con una persona con discapacidad o de 60 años y más, y los archivos territoriales del equipo cruzan ambas poblaciones. Separarlos obligaría a romper el universo de análisis de la fuente principal.',
], GUINDA));
add(p('Las razones de la elección, en orden:', { after: 100 }));
add(num('Es el único nicho donde el equipo ya tiene medida la necesidad declarada, y no solo la demografía. La ENASIC pregunta si se buscó un servicio, por qué no, dónde se preferiría el cuidado y a qué precio se contrata. Esas preguntas son las que convierten un conteo de población en un diagnóstico.'));
add(num(`Es el nicho cuya modalidad preferida está medida y es inequívoca. Entre quienes cuidan a una persona con discapacidad o de 60 y más, ${pct(B.en_su_casa)} querría el cuidado en su casa y menos del 5 % en una institución (sección 8.3). Eso delimita la intervención sin necesidad de suponerla.`));
add(num(`Es el nicho con hueco de política pública documentado. El presupuesto 2026 del Sistema Público de Cuidados de la CDMX destina ${n0(EX.presupuesto_casas3r_mdp)} millones de pesos a Casas de las Tres R y ${n1(EX.presupuesto_cuidadoras_mdp)} millones al programa «Ciudad que cuida a las personas cuidadoras», sobre un total solicitado de ${n1(EX.presupuesto_cuidados_2026_mdp)} millones. El cuidado domiciliario de personas dependientes no aparece como línea propia.`));
add(num(`Es el nicho que la principal plataforma pública no cubre. El SIDECU mapea ${n0(EX.sidecu_centros)} centros de cuidado, todos de establecimiento; el cuidado domiciliario no aparece en ninguna de sus cinco categorías. El Observatorio no duplicaría trabajo federal: ocuparía el hueco que ese trabajo deja.`));
add(num('Es el nicho donde el equipo puede levantar dato propio. El piloto de práctica profesional puede medir en una institución receptora lo que ninguna encuesta pública mide: por qué un hogar concreto no contrata cuidado domiciliario.'));
add(num('Es el nicho que la envejecimiento de la ciudad vuelve creciente. La Ciudad de México concentra ' + n0(CX.pob60) + ' personas de 60 años y más, 16.2 % de su población total (nivel de evidencia: probable; véase sección 7.2).'));

add(h2('4.5 Qué queda fuera, y por qué se dice'));
add(p('Dejar nichos fuera no es descartarlos como irrelevantes. Es declarar que el Observatorio no podrá afirmar nada sobre ellos. Concretamente, este Observatorio no podrá hablar de cuidado infantil, no podrá hablar de la carga sobre personas cuidadoras a nivel territorial, y no podrá hablar de condiciones laborales del trabajo del hogar en la Ciudad de México. Cualquier afirmación del proyecto sobre esos temas será cita de otra fuente, marcada como tal.'));
add(salto());

// ════════════════════════════ 5 ════════════════════════════
add(h1('5. Marco contextual'));
add(h2('5.1 Panorama nacional'));
add(p('La ENASIC 2022 es la primera edición de la encuesta; se levantó entre octubre y diciembre de 2022 y no existe serie histórica, de modo que ninguna afirmación del proyecto puede referirse a una tendencia con esta fuente. Su cobertura es nacional, con muestra de 7 021 viviendas y base final de 6 423 registros, diseño con 90 % de confianza, efecto de diseño de 3.05 y error relativo máximo esperado de 15 %. Los microdatos son de uso público.'));
add(p('La base combina seis tablas con cinco factores de expansión distintos —vivienda, hogar, población cuidadora de 15 años y más, persona elegida de 15 a 60 años y hogares unipersonales— y una misma persona puede pertenecer a más de un universo de análisis. Contar registros sin aplicar el factor que corresponde, o combinar tablas de universos distintos, produce cifras equivocadas que parecen correctas. Es el primer error que el equipo descartó, reproduciendo cifras publicadas por el INEGI antes de estimar nada propio.'));
add(p('La Cuenta Satélite del Trabajo No Remunerado de los Hogares de México 2024 estimó en 8 billones de pesos el valor económico del trabajo no remunerado en labores domésticas y de cuidados, equivalente a 23.9 % del producto interno bruto. Las ediciones 2014 y 2019 de la Encuesta Nacional sobre Uso del Tiempo son metodológicamente comparables entre sí; las anteriores no.'));

add(h2('5.2 Panorama en la Ciudad de México'));
add(tabla(
  ['Ancla territorial', 'Valor', 'Evidencia'],
  [
    ['Población total, Censo 2020', n0(CX.poblacion) + ' personas', 'Confirmado'],
    ['Viviendas particulares habitadas, Censo 2020', n0(CX.viviendas), 'Confirmado'],
    ['Población de 60 años y más', n0(CX.pob60) + ' personas', 'Probable'],
    ['Establecimientos de cuidado en el DENUE (núcleo)', n0(TE.nucleo) + '\n' + n0(TE.asilos_total) + ' asilos y residencias · ' + n0(TE.centros_total) + ' centros de día', 'Probable'],
    ['Alcaldías sin dato de capacidad residencial privada', n0(TE.alcaldias_sin_dato) + ' de 16', 'Confirmado como vacío'],
  ], [40, 34, 26], { negritaCol0: true, izq: [1] },
));
add(p('El Sistema de Indicadores de Cuidados de la Ciudad de México, desarrollado con apoyo de Open Data Charter, integra más de 80 indicadores de oferta y demanda, y el Portal de Datos Abiertos de la Ciudad de México concentra conjuntos de distintas instituciones públicas. Ninguno de los dos ha sido revisado todavía por el equipo con el detalle que exige la ficha de fuente descrita en la sección 7.2: es el vacío de trabajo más grande que queda abierto.'));

add(h2('5.3 Marco normativo'));
add(vi('Ley Federal de Protección de Datos Personales en Posesión de los Particulares, vigente desde el 20 de marzo de 2025.'));
add(vi('Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados. Queda por determinar si la Universidad Nacional Rosario Castellanos es sujeto obligado, lo que cambia qué ley aplica al tratamiento que haga el equipo.'));
add(vi('Ley del Sistema de Cuidados de la Ciudad de México, aprobada el 26 de mayo de 2026 y promulgada el 2 de julio de 2026.'));
add(vi('Recomendación de la UNESCO (2021) sobre la Ética de la Inteligencia Artificial.'));
add(viR([['Obligación de inscribir al IMSS a las personas trabajadoras del hogar, vigente desde enero de 2023. ', true], ['Es determinante para el programa: define el costo real de emplear formalmente a una persona cuidadora y, por lo tanto, el precio mínimo viable del servicio (sección 8.4 y estudio de negocio).']]));
add(p('El desarrollo del dictamen jurídico y del protocolo de gobernanza corresponde a la unidad curricular de Leyes para la Protección de Datos.'));

add(h2('5.4 Antecedentes de mercado'));
add(p(`El equipo construyó una matriz de ${n0(V.referencias.n_casos)} referencias de plataformas y programas de cuidado en México, Estados Unidos y Europa, con ${n0(V.referencias.n_matching)} casos de intermediación y ${n0(V.referencias.n_cerradas)} empresas que cerraron, incluidas deliberadamente para contrarrestar el sesgo de supervivencia. Sus hallazgos se discuten en el estudio de negocio; aquí basta el que condiciona el marco contextual: ninguna de las empresas revisadas documenta su problema con datos. Casi todas parten de la experiencia personal de quien la fundó. El proyecto tiene, en eso, una ventaja real sobre sus referentes comerciales.`));
add(salto());

// ════════════════════════════ 6 ════════════════════════════
add(h1('6. Objetivo general y objetivos específicos'));
add(caja('Objetivo general', [
  'Analizar la correspondencia entre la necesidad de cuidado de personas mayores y personas con discapacidad y la infraestructura de cuidado disponible en las alcaldías de la Ciudad de México, y caracterizar a escala nacional la carga de tiempo y de gasto que el cuidado representa para los hogares, como base para el diseño de un programa de innovación social.',
  [['Se dice «analizar la correspondencia» y no «identificar desigualdades» ', true], ['para no presuponer el resultado. Si el análisis encuentra que la oferta corresponde a la necesidad, ese también es un hallazgo publicable.']],
], AZUL));
add(h3('Objetivos específicos'));
add(num('Determinar, fuente por fuente, el nivel territorial y la ventana temporal que cada una sostiene, y documentarlo en una ficha con seis secciones fijas.'));
add(num('Caracterizar la necesidad de cuidado declarada y las razones por las que no se contrata, con microdatos de la ENASIC 2022 y tratamiento correcto del diseño muestral.'));
add(num('Localizar y clasificar por función la oferta instalada de cuidado en la Ciudad de México, distinguiendo cuidado residencial, diurno, socialización y domiciliario.'));
add(num('Construir indicadores territoriales únicamente para los pares oferta–necesidad que cumplan la regla de compatibilidad de la sección 7.3, y declarar como exploratorio todo lo demás.'));
add(num('Diseñar un programa de innovación social derivado de los hallazgos anteriores, con modelo de sostenibilidad explícito, y probar una de sus funciones en el piloto de práctica profesional.'));
add(num('Establecer el protocolo de protección y gobernanza de datos antes de cualquier tratamiento de información sobre personas.'));
add(salto());

// ════════════════════════════ 7 ════════════════════════════
add(h1('7. Metodología y fuentes'));
add(h2('7.1 Ruta analítica'));
add(p('El trabajo siguió una secuencia que se deja registrada porque su orden importa: primero se probó qué podía afirmarse con cada fuente y solo después se buscó el hallazgo. Los análisis producidos hasta hoy son seis, cada uno con su archivo de resultados en el repositorio.'));
add(tabla(
  ['Análisis', 'Qué responde', 'Salida'],
  [
    ['01 · Oferta en el DENUE', 'Qué claves SCIAN capturan cuidado y cómo se distribuye la oferta por alcaldía', 'Analysis/outputs/ (6 archivos)'],
    ['02 · Capacidad residencial', 'Cómo se compara la capacidad privada con tres denominadores de necesidad', '02_indice_capacidad_residencial.csv'],
    ['03 · Barreras de uso', 'Quién busca servicios, por qué no, dónde los preferiría y quién los contrata', '03_enasic_barreras_estimaciones.csv'],
    ['04 · Precio y asequibilidad', 'Contratación por quintil de ingreso, pago observado y qué hogares podrían pagar', '04_contratacion_por_quintil.csv y otros tres'],
    ['05 · Dimensionamiento', 'Cuántos hogares de la CDMX están en el universo, como inferencia declarada', '05_dimensionamiento_cdmx.csv'],
    ['06 · Subsidio y costo', 'Cuánto tendría que aportar un tercer pagador para que el servicio sea asequible', '06_subsidio_por_paquete.csv'],
  ], [24, 48, 28], { negritaCol0: true, izq: [1, 2] },
));
add(p('Además, se reprodujo el Cuadro 2.2 del estudio del Centro de Estudios Sociales y de Opinión Pública de la CDMX y el Centro de Estudios Demográficos, Urbanos y Ambientales de El Colegio de México (2026) con el DENUE 05/2025: 48 de 48 celdas idénticas en unidades y 48 de 48 en personal ocupado. Reproducir un estudio publicado antes de citarlo es lo que permite usarlo como referencia y no como autoridad.'));

add(h2('7.2 Inventario de fuentes y estado de documentación'));
add(p('La regla del proyecto exige documentar de cada fuente qué representa una fila, su grano, su clave, si las observaciones son independientes y qué factor de expansión aplica. El resultado de aplicarla es incómodo y por eso se publica:'));
add(tabla(
  ['Fuente', 'Productor y año', 'Qué sostiene'],
  [
    ['Microdatos ENASIC 2022', 'INEGI, 2022 · confirmado', 'Necesidad declarada, barreras, preferencia, precio. Nacional; no admite estimación por entidad ni alcaldía'],
    ['DENUE 05/2026', 'INEGI, mayo 2026 · confirmado', 'Localización de establecimientos. No publica capacidad ni plazas'],
    ['Censo de Población y Vivienda 2020', 'INEGI, 2020 · confirmado', 'Población y viviendas por alcaldía; discapacidad por AGEB en el portal de la CDMX'],
    ['Capacidad en residencias privadas', 'Desconocido · sin año', 'Plazas en 12 de 16 alcaldías. No se sabe si los cuatro faltantes valen cero o son dato ausente'],
    ['Población de más de 60 años', 'Desconocido · probablemente Censo 2020', 'Porcentajes de la población total de la CDMX. Verificado que las alcaldías suman la fila de la ciudad'],
    ['Centros de día del sector público', 'Desconocido · sin año', 'Número de instituciones, no capacidad. Mezcla clubes con residencias de día'],
    ['Horas laborales y de cuidado', 'Desconocido · sin año', 'Nada citable todavía: no declara cobertura ni si las horas son por persona participante o por población'],
    ['Gasto en cuidados privados', 'Desconocido · sin año', 'No tiene territorio ni categoría de cuidado de personas mayores'],
    ['Población con discapacidad que necesita ayuda', 'Desconocido · probablemente Censo 2020', 'Conteos de discapacidad y limitación por alcaldía. Verificado que las alcaldías suman la fila de la ciudad (script 08). No declara rango de edad'],
    ['Tiempo promedio en ayudas no pagadas', 'Desconocido · sin año', 'Nada citable: la columna de horas llega a ' + n0(N8.ayudas_max) + ', incompatible con un promedio semanal (máximo posible, 168 h)'],
    ['SIDECU', 'SEMUJERES y SNDIF, nov. 2025 · SIN REVISAR', 'Unos ' + n0(EX.sidecu_centros) + ' centros públicos de cuidado, búsqueda por entidad, municipio y código postal. Solo establecimientos; no incluye cuidado domiciliario. Falta determinar si es descargable'],
    ['Mapa de Cuidados de México (MACU)', 'INMUJERES · SIN REVISAR', 'Identificado como pista en el análisis del IMCO y confirmada su existencia. Sin ficha de fuente'],
    ['Pobreza por grupos poblacionales a escala municipal', 'CONEVAL, 2010/2015/2020 · confirmado', 'Pobreza del grupo 65+ por alcaldía, con bandera de precisión oficial. Es contexto de vulnerabilidad económica, no oferta ni necesidad de cuidado (sección 7.3). Corte puntual cada 5 años, no serie continua'],
  ], [26, 22, 52], { negritaCol0: true, izq: [1, 2] },
));
add(caja('Un vacío que este documento sí cierra en parte', [
  [['El archivo de población de 60 años y más ya puede usarse con más confianza. ', true],
   ['Se verificó que sus porcentajes son de la población total de la Ciudad de México y que las 16 alcaldías suman exactamente la fila de la ciudad (16.19 %). Aplicando ese porcentaje a la población del Censo 2020 (' + n0(CX.poblacion) + ' personas) resultan ' + n0(CX.pob60) + ' personas de 60 y más, cifra consistente con el orden de magnitud publicado para la ciudad en 2020.']],
  [['Qué sigue sin saberse: ', true], ['quién produjo el archivo y en qué fecha. La consistencia aritmética eleva «Censo 2020» de probable a muy probable, pero no sustituye la ficha de fuente. Sin productor documentado, la cifra se cita como probable.']],
], AZUL));

add(h2('7.3 Regla de compatibilidad oferta–necesidad'));
add(p('Antes de construir cualquier indicador territorial, el equipo acordó que un par oferta–necesidad debe ser compatible en cuatro criterios: población objetivo, territorio con cobertura completa y distinguiendo el cero del dato ausente, unidad de medida (capacidad frente a personas) y periodo de referencia.'));
add(rica([
  ['Al aplicar la regla, ', ], ['ningún par oferta–necesidad la cumple hoy', true],
  ['. En consecuencia: el cociente de localización del análisis 02 se mantiene como resultado exploratorio y no como indicador publicable; los clubes y centros culturales se excluyen de la oferta de cuidado por no ser servicios de cuidado; y el cuidado domiciliario, que es la modalidad con mayor demanda declarada, no tiene ninguna fuente territorial. Ese último punto es el vacío más grave del proyecto y se discute en la sección 10.'],
]));

add(h2('7.4 Tratamiento del diseño muestral'));
add(p('Todas las estimaciones con microdatos de la ENASIC se calculan como razones ponderadas, con varianza por linealización de Taylor, usando los estratos EST_DIS y los conglomerados UPM_DIS que publica el INEGI, y el factor de expansión que corresponde a cada tabla. Se reporta el coeficiente de variación de cada estimación y se clasifica su precisión con el criterio del INEGI. Ninguna estimación con precisión baja se presenta sin decirlo.'));
add(salto());

// ════════════════════════════ 8 ════════════════════════════
add(h1('8. Resultados del análisis exploratorio'));
add(h2('8.1 La carga del cuidado y su reparto'));
add(figura('f7_horas_cuidado_laboral', 1,
  'Horas semanales de trabajo de cuidado y de trabajo laboral, por sexo y grupo de edad.',
  'Fuente: Data/investigacion/Horas laborales y de cuidado..csv. Nivel de evidencia: desconocido — el archivo no documenta productor, año ni cobertura.'));
add(rica([
  ['Esta figura se incluye con una advertencia, no como hallazgo. ', true],
  ['El patrón que muestra —la brecha de horas de cuidado entre mujeres y hombres se abre a los 18 años y no se cierra hasta pasados los 60— es coherente con toda la literatura del campo. Pero el archivo que la sustenta no declara productor, año ni cobertura geográfica, ni si las horas son por persona que participa o promediadas sobre toda la población. Mientras eso no se documente, la figura sirve para orientar la lectura y no puede citarse como cifra del proyecto. Es un ejemplo deliberado de la regla de evidencia: un gráfico que confirma lo que uno espera es precisamente el que más conviene no dar por bueno.'],
]));

add(h2('8.2 La oferta instalada no falta donde se suponía'));
add(figura('f5_oferta_por_tipo', 2,
  'Índice de oferta por tipo de servicio y alcaldía, relativo a la participación de cada alcaldía en la población de 60 años y más de la ciudad.',
  'Fuente: Analysis/outputs/indice_por_tipo_servicio.csv (DENUE 05/2026). Nivel de evidencia: probable.'));
add(p(`La hipótesis de partida del equipo —la oferta se concentra en el centro y falta en la periferia— no se sostiene tal como estaba redactada. El patrón depende del tipo de servicio. Iztapalapa tiene un índice de ${n2v(TE.iztapalapa_ind_asilos)} en asilos, es decir, cerca de la mitad de los que le corresponderían por su población mayor, pero de ${n2v(TE.iztapalapa_ind_centros)} en centros de día. Cuauhtémoc, en el centro de la ciudad, tiene el índice más bajo de centros de día (${n2v(TE.cuauhtemoc_ind_centros)}). Milpa Alta no tiene ningún asilo y tiene el índice más alto de centros de día de la ciudad.`));
add(p('Dos advertencias condicionan esta lectura. La primera es que se trata de conteos de establecimientos y no de plazas: la correlación de Spearman entre el número de asilos privados del DENUE y la capacidad del archivo de plazas es de 0.27 con doce observaciones, de modo que contar establecimientos no aproxima la capacidad. La segunda es que la clasificación SCIAN no distingue cuidado de recreación: 59 de los 126 centros de día del núcleo se llaman club, grupo o casa del adulto mayor, y 21 % del núcleo tiene un nombre que no indica un servicio de cuidado y sigue en revisión manual.'));
add(figura('f6_capacidad_residencial', 3,
  'Plazas en residencias permanentes privadas por cada 1 000 personas con discapacidad para bañarse, vestirse o comer.',
  'Fuente: Analysis/resultados/02_indice_capacidad_residencial.csv. Nivel de evidencia: probable, resultado exploratorio.'));
add(p(`Cuando se mide capacidad en lugar de establecimientos, la desigualdad es de otro orden de magnitud. Miguel Hidalgo tiene ${n1(TE.mh_por_mil)} plazas privadas por cada mil personas con dependencia para actividades básicas; Iztapalapa tiene ${n1(TE.iztapalapa_por_mil)}, una razón de ${n0(TE.razon_mh_iztap)} a 1. Iztapalapa concentra cerca del 18 % de la población de 60 y más de la ciudad y menos del 1 % de las plazas privadas. El orden de las alcaldías apenas cambia según el denominador que se use: la correlación de Spearman entre ordenamientos es de al menos 0.94.`));
add(rica([
  ['Por qué este resultado no justifica construir residencias. ', true],
  ['Porque la demanda declarada de residencias es mínima: menos del 5 % de quienes cuidan a una persona con discapacidad o de 60 y más preferiría una institución si contratara cuidado (sección 8.3). Un faltante de oferta solo es un problema si alguien quiere esa oferta. Este es el punto exacto donde un análisis territorial, leído solo, llevaría a la intervención equivocada.'],
]));

add(h2('8.3 Casi nadie busca servicios, y no es por desconocerlos'));
add(figura('f2_razones_no_buscar', 4,
  'Razones declaradas para no haber buscado un servicio de cuidado, entre personas que cuidan a alguien con discapacidad o de 60 años y más.',
  'Fuente: Analysis/resultados/03_enasic_barreras_estimaciones.csv. Nacional. Nivel de evidencia: confirmado.'));
add(p(`Solo ${pct(B.busco_todas)} de todas las personas que cuidan buscó un servicio de cuidado (precisión alta). En el universo de quienes cuidan a una persona con discapacidad o de 60 y más, la estimación es ${pct(B.busco_servicio)}, con un coeficiente de variación de ${n1(B.busco_servicio_cv)} % (precisión baja): sirve de contexto, no de hallazgo. Entre quienes no buscaron en ese universo, la razón dominante es que el propio hogar cuida (${pct(B.hogar_cuida)}, precisión alta) y que no ha tenido necesidad (${pct(B.no_necesidad)}, precisión alta); la lejanía pesa ${pct(B.lejania)} y el precio ${pct(B.son_caros)}. Desconocer que los servicios existen explica ${pct(B.desconoce_todas)} entre todas las personas cuidadoras (precisión moderada); en el universo de discapacidad o 60 y más, ${pct(B.desconoce)}, con precisión baja.`));
add(caja('Qué queda descartado con esto', [
  [['La hipótesis de que la barrera es de información no se sostiene. ', true],
   ['Una plataforma cuya función principal sea dar a conocer que existen servicios de cuidado atacaría una razón que explica menos del 2 % de la no búsqueda. Esta conclusión es coherente con evidencia externa e independiente: Respect, una agencia estadounidense de cuidado domiciliario con aplicación de perfiles y videos de cuidadoras, cerró a los seis meses con unos treinta clientes, y su director declaró que la aplicación mejoró el servicio pero no la conversión de clientes.']],
  [['Lo que este resultado no dice. ', true],
   ['La pregunta P6.45 de la ENASIC pregunta por lugares de cuidado, no por contratar cuidado domiciliario. La barrera específica para contratar a una persona que cuide en casa sigue sin medirse en ninguna fuente pública. Es la medición que el piloto de práctica profesional tendría que aportar.']],
], GUINDA));
add(figura('f3_preferencia_lugar', 5,
  'Dónde preferiría el cuidado quien cuida a una persona con discapacidad o de 60 años y más, si contratara un servicio.',
  'Fuente: Analysis/resultados/03_enasic_barreras_estimaciones.csv. Nacional. Nivel de evidencia: confirmado.'));
add(p(`La modalidad preferida es inequívoca: ${pct(B.en_su_casa)} querría el cuidado en su propia casa. Pero el segundo lugar de la lista es el dato que más condiciona el diseño del programa: ${pct(B.no_contrataria)} declara que no contrataría a nadie, a ningún precio y en ningún lugar. Más de un tercio del universo está fuera de cualquier intervención de mercado, y eso no es un obstáculo operativo sino un límite del tamaño del problema que un programa de este tipo puede resolver.`));
add(p(`Del lado de la oferta, la intención declarada es abundante: ${pct(B.seria_cuidador)} de la población de 15 a 60 años sería persona cuidadora pagada si le pagaran (${pct(B.seria_cuidador_mujeres)} de las mujeres y ${pct(B.seria_cuidador_hombres)} de los hombres) y ${pct(B.se_capacitaria)} de quienes dicen que sí se capacitaría. Es intención, no oferta real: ninguna fuente del proyecto mide cuántas personas cuidadoras remuneradas hay efectivamente en la Ciudad de México.`));

add(h2('8.4 El hallazgo central: no es el precio, o no solo'));
add(p('La bitácora del 20 de septiembre propuso la prueba decisiva para distinguir la hipótesis de precio de la hipótesis de norma familiar: si la tasa de contratación se mantiene baja incluso en el quintil de ingreso más alto, el precio no es el cuello de botella principal. Esa prueba se ejecutó por primera vez el 22 de septiembre.'));
add(figura('f1_contratacion_por_quintil', 6,
  'Contratación de servicios por quintil de ingreso, entre hogares con una persona con discapacidad o de 60 años y más.',
  'Fuente: Analysis/resultados/04_contratacion_por_quintil.csv. Nacional. Nivel de evidencia: probable; precisión baja en las estimaciones de cuidado (desde la versión 0.2; la 0.1 decía «confirmado»).'));
add(tabla(
  ['Quintil de ingreso mensual del hogar', 'Contrata trabajo doméstico', 'Contrata enfermería o persona cuidadora'],
  [
    ['Q1 · hasta $3,200', pct(Q.domestico.q1), pct(Q.cuidado.q1)],
    ['Q2 · $3,200 a $5,000', pct(Q.domestico.q2), pct(Q.cuidado.q2)],
    ['Q3 · $5,000 a $8,000', pct(Q.domestico.q3), pct(Q.cuidado.q3)],
    ['Q4 · $8,000 a $15,000', pct(Q.domestico.q4), pct(Q.cuidado.q4)],
    ['Q5 · más de $15,000', pct(Q.domestico.q5), pct(Q.cuidado.q5)],
    ['Razón entre el quintil 5 y el quintil 1', n1(Q.domestico.q5 / Q.domestico.q1) + ' veces', n1(Q.cuidado.q5 / Q.cuidado.q1) + ' veces'],
  ], [42, 29, 29], { negritaCol0: true },
));
add(caja('Lectura del resultado', [
  [['El ingreso sí destraba la compra de servicios en el hogar, pero no la compra de cuidado. ', true],
   ['Del quintil más bajo al más alto, la contratación de trabajo doméstico se multiplica por ' + n1(Q.domestico.q5 / Q.domestico.q1) + ' y llega a ' + pct(Q.domestico.q5) + '. La contratación de cuidado se multiplica solo por ' + n1(Q.cuidado.q5 / Q.cuidado.q1) + ' y se queda en ' + pct(Q.cuidado.q5) + ', con un intervalo al 90 % de ' + pct(Q.cui_q5_li) + ' a ' + pct(Q.cui_q5_ls) + '.']],
  [['Por qué esto importa más que cualquier otro resultado del proyecto. ', true],
   ['Se trata de los mismos hogares, con el mismo ingreso, en el mismo momento. Ya tienen el hábito de pagar por un servicio, ya cruzaron el umbral de dejar entrar a una persona ajena a su casa, y ya resolvieron la logística de coordinarla. Aun así, no compran cuidado. La diferencia entre ' + pct(Q.domestico.q5) + ' y ' + pct(Q.cuidado.q5) + ' no puede explicarse por falta de dinero, ni por falta de información, ni por desconfianza hacia los extraños en general.']],
  [['Qué queda como explicación candidata: ', true],
   ['que el cuidado de una persona dependiente se percibe como una responsabilidad intransferible de la familia, y no como un servicio delegable. Es consistente con el ' + pct(B.hogar_cuida) + ' que declara que el propio hogar cuida y con el ' + pct(B.no_contrataria) + ' que no contrataría a nadie. Es una hipótesis, no una conclusión: la ENASIC no pregunta directamente por qué no se contrata cuidado domiciliario.']],
], GUINDA));
add(p('El contraste es aún más nítido si se mira solo a hogares con una persona de 60 años y más: contratan trabajo doméstico en ' + pct(B.contrata_dom_60) + ' de los casos (precisión alta) y enfermería o persona cuidadora en ' + pct(B.contrata_cui_60) + ' (precisión baja). ' + n0(B.contrata_dom_60 / B.contrata_cui_60) + ' veces más de lo uno que de lo otro, dentro del mismo universo.'));

add(h3('La segunda barrera: asequibilidad a salario digno'));
add(p('Que el precio no sea el cuello de botella principal no significa que sea irrelevante. Significa que opera en otro lugar: no explica por qué no compran quienes podrían, pero sí define a cuántos hogares podría llegar un programa que pagara salarios dignos.'));
add(figura('f4_asequibilidad', 7,
  'Proporción de hogares con necesidad que podría pagar cuidado domiciliario sin rebasar el 20 % de su ingreso, según paquete de horas y nivel salarial.',
  'Fuente: Analysis/resultados/04_asequibilidad_paquetes.csv. Nacional. Nivel de evidencia: probable.'));
add(p(`El ingreso mensual mediano de los hogares con necesidad es de ${mx(IN.mediana_2022)} en pesos de 2022 (n = ${n0(IN.hogares_muestra)}, ponderado), con un primer cuartil de ${mx(IN.p25_2022)}. Una jornada completa de cuidado domiciliario pagada al piso legal de 2026 —el salario mínimo profesional de persona trabajadora del hogar, ${mx2(EX.sm_hogar_2026_dia)} por día en la zona general— cuesta ${mx(AS.legal_40_costo)} al mes, es decir ${pct(AS.legal_40_pct_ingreso)} del ingreso mediano de esos hogares. Solo ${pct(AS.legal_40_pct20)} de ellos podría pagarla sin rebasar el 20 % de su ingreso. A media jornada, ${pct(AS.legal_20_pct20)}. Y eso antes de contar las cuotas patronales del IMSS y el Infonavit, obligatorias desde enero de 2023.`));
add(rica([
  ['El dato incómodo para el propio proyecto: ', true],
  ['el pago por hora que la ENASIC observa hoy para personas cuidadoras, actualizado a pesos de 2026, tiene una mediana de ' + mx2(PA.cuidadora_hora_2026) + ' (n = ' + n0(PA.cuidadora_n) + ', sin ponderar) frente a un piso legal de ' + mx2(pisoHora) + ' por hora. Es decir, cerca de la mitad de los arreglos de cuidado que hoy existen pagan al nivel del mínimo profesional o por debajo. Un programa que formalice el empleo y pague dignamente no compite contra el mercado actual: es estructuralmente más caro que él. Esa es la tensión que el estudio de negocio tiene que resolver, y no puede resolverse con diseño de producto.'],
]));

add(h2('8.5 La carga que no se nombra: necesidad, norma y daño declarado'));
add(p('Una lectura frecuente del ' + pct(B.no_necesidad) + ' que dice «no tuve necesidad» es que describe a hogares que efectivamente no la tienen. El notebook 07 lo probó cruzando esa respuesta con la intensidad del cuidado y con los daños que la propia persona cuidadora declara. Usa el mismo estimador que el notebook 03 (factor de expansión de la población cuidadora, varianza por linealización de Taylor y criterios de coeficiente de variación del INEGI) y reproduce sus cifras de validación. Los criterios de lectura se fijaron antes de correr los cruces.'));
add(figura('f9_razones_no_buscar_por_horas', 8,
  'Razones para no buscar un servicio de cuidado, según horas semanales de cuidado, entre quienes cuidan a una persona con discapacidad o de 60 años y más.',
  'Fuente: Analysis/resultados/07_enasic_necesidad_vs_norma_estimaciones.csv. Nacional. Nivel de evidencia: confirmado para la asociación; no demuestra causa.'));
add(rica([
  ['«No tuve necesidad» casi no depende de la carga. ', true],
  ['Lo dice ' + pct(N7.sin_nec_menos20) + ' de quienes cuidan menos de 20 horas a la semana y ' + pct(N7.sin_nec_40mas) + ' de quienes cuidan 40 horas o más. La diferencia, ' + n1(N7.dif_sin_nec) + ' puntos, tiene un intervalo al 90 % de ' + n1(N7.dif_sin_nec_li) + ' a ' + n1(N7.dif_sin_nec_ls) + ': no excluye el cero. Entre quienes además ayudan en actividades básicas —bañar, vestir, dar de comer— y cuidan 40 horas o más, sigue siendo ' + pct(N7.sin_nec_abvd40) + '.'],
]));
add(rica([
  ['Detrás de esa respuesta hay costo declarado. ', true],
  ['Entre quienes dicen no haber tenido necesidad, ' + pct(N7.dano_40mas) + ' de quienes cuidan 40 horas o más declara algún daño a su salud o a su trabajo, contra ' + pct(N7.dano_menos20) + ' de quienes cuidan menos de 20. La diferencia, ' + n1(N7.dif_dano) + ' puntos (intervalo al 90 %: ' + n1(N7.dif_dano_li) + ' a ' + n1(N7.dif_dano_ls) + '), sí excluye el cero. La salud física deteriorada pasa de ' + pct(N7.salud_menos20) + ' a ' + pct(N7.salud_40mas) + '.'],
]));
add(p('El grupo que reúne las tres condiciones —cuida 40 horas o más, dice no haber tenido necesidad y declara algún daño— es ' + pct(N7.peso_40_sn_dano) + ' del universo (intervalo al 90 %: ' + pct(N7.peso_40_sn_dano_li) + ' a ' + pct(N7.peso_40_sn_dano_ls) + '), unas ' + n0(N7.peso_40_sn_dano_personas) + ' personas a escala nacional. Es la mejor candidata disponible a población objetivo del programa.'));
add(h3('La norma familiar, medida directamente'));
add(tabla(
  ['Pregunta de la ENASIC', 'Respuesta', 'Estimación'],
  [
    ['P7.7 · Quién debe dar el apoyo', 'La familia', pct(N7.norma_familia)],
    ['P7.7 · Quién debe dar el apoyo', 'Instituciones de gobierno', pct(N7.norma_gobierno)],
    ['P6.38 · Por qué cuida', 'Por iniciativa propia', pct(N7.iniciativa_propia)],
    ['P7.8 · Aceptaría una residencia o casa de día', 'No está de acuerdo', pct(N7.rechaza_residencia)],
    ['P7.8 · Aceptaría una residencia o casa de día', 'Sí, solo unas horas del día', pct(N7.acepta_unas_horas)],
    ['P7.11 · Por qué no aceptaría una residencia', 'La responsabilidad es de la familia', pct(N7.no_res_familia)],
    ['P7.11 · Por qué no aceptaría una residencia', 'Tratan mal a las personas', pct(N7.no_res_maltrato)],
  ], [44, 36, 20], { negritaCol0: false, izq: [0, 1] },
));
add(p('Todas las estimaciones de la tabla tienen precisión alta. La norma no es absoluta: más de un tercio acepta apoyo externo si es por unas horas, y una cuarta parte de quienes rechazan una residencia lo hace por desconfianza en el trato, no por principio. «Son caros», en cambio, tiene precisión baja en todos los grupos de ingreso (' + pct(N7.caros_q12) + ' en los quintiles 1 y 2, ' + pct(N7.caros_q45) + ' en los quintiles 4 y 5): con estos datos no se puede afirmar que el precio frene la búsqueda en ningún grupo.'));
add(caja('Qué se puede y qué no se puede afirmar con esto', [
  [['Se puede: ', true], ['que la carga intensa existe sin nombrarse como necesidad, y que la norma familiar tiene respaldo directo. Se rechaza que la baja búsqueda sea una decisión sin costo en todos los grupos.']],
  [['No se puede: ', true], ['que un servicio evitaría esos daños. Son autodeclarados y la relación es una asociación, no una causa. Quienes cuidan más horas probablemente atienden a personas más dependientes; falta comparar el daño por horas dentro de un mismo nivel de dependencia.']],
  [['Límite de la pregunta: ', true], ['P6.45 pregunta por lugares. No se puede descartar que «no tuve necesidad» signifique «no necesito un lugar» en lugar de «no necesito apoyo». El piloto tiene que incluir una pregunta que distinga ambas lecturas.']],
], GUINDA));

add(h2('8.6 Dónde se concentra la dependencia severa (exploratorio)'));
add(p('El archivo de población con discapacidad que necesita ayuda permite ubicar a las personas con discapacidad para bañarse, vestirse o comer, que es el perfil de dependencia más cercano al del programa. Iztapalapa concentra ' + n0(N8.dep_iztap) + ' personas (' + pct(N8.dep_iztap_pct) + ') y Gustavo A. Madero ' + n0(N8.dep_gam) + ' (' + pct(N8.dep_gam_pct) + '): entre las dos, ' + pct(N8.dep_dos_pct) + ' de las ' + n0(N8.dep_total) + ' personas de la ciudad. Iztapalapa es además la alcaldía con menor capacidad residencial privada por habitante de 60 y más (sección 8.2).'));
add(caja('Para qué sirve y para qué no', [
  [['Sirve para ', true], ['elegir dónde conviene hacer el piloto de práctica profesional.']],
  [['No sirve como indicador del Observatorio. ', true], ['Son conteos, no tasas: Iztapalapa también es la alcaldía más poblada. El archivo no declara productor, año ni rango de edad (sección 7.2), y ningún par oferta–necesidad cumple hoy la regla de compatibilidad (sección 7.3).']],
  [['Fuente: ', true], ['Analysis/resultados/08_dependencia_severa_alcaldia.csv, generado por Analysis/08_hallazgos_csv_proyecto.py. Nivel de evidencia: probable.']],
], OCRE));

add(h2('8.7 Contexto de vulnerabilidad económica por alcaldía (CONEVAL, exploratorio)'));
add(p(`CONEVAL publica pobreza por grupos poblacionales a escala municipal, con corte en 2010, 2015 y 2020. Para el grupo de 65 años y más, la Ciudad de México tiene dato en sus 16 alcaldías: Milpa Alta tiene la tasa más alta (${pct(N9.milpa_alta_pct)}) y Benito Juárez la más baja (${pct(N9.benito_juarez_pct)}). El indicador de pobreza total es, además, el más confiable del archivo: solo ${pct(N9.pct_indicador_principal_banderadas)} de sus celdas (${n0(N9.n_indicador_principal_banderadas)} de ${n0(N9.n_indicador_principal_total)}) tiene precisión reducida o dato ausente. Los indicadores de carencia de vivienda no corren la misma suerte: ${pct(N9.pct_vivienda_banderadas)} de sus celdas (${n0(N9.n_vivienda_banderadas)} de ${n0(N9.n_vivienda_total)}) tiene precisión reducida o dato ausente, así que no se citan por alcaldía.`));
add(p(`El dato se validó de forma independiente. El tablero público Observatorio de Cuidados (INMUJERES) muestra, para Azcapotzalco, ${N9.azc_pct_ocu} % de pobreza en el grupo 65+ y ${n0(N9.azc_personas_ocu)} personas. Calculado desde el archivo de CONEVAL: ${pct(N9.azc_pct_calculado)} y ${n0(N9.azc_personas_calculado)} personas sobre una población 65+ de ${n0(N9.azc_pob65)}. La coincidencia exacta confirma que ese tablero redespliega este mismo producto de CONEVAL y no genera un dato propio: la fuente a citar es CONEVAL, no el tablero.`));
add(caja('Para qué sirve y para qué no', [
  [['Sirve como ', true], ['contexto de vulnerabilidad económica por alcaldía, con productor, año y bandera de precisión oficiales — algo que casi ningún otro archivo territorial de este proyecto tiene (sección 7.2).']],
  [['No sirve como indicador de cuidado. ', true], ['Es una medida de pobreza, no de oferta ni de necesidad de cuidado. No cumple ni intenta cumplir la regla de compatibilidad oferta–necesidad (sección 7.3) y no genera ningún hallazgo nuevo en la sección 8.8: por eso no tiene número de H.']],
  [['Límite de vigencia. ', true], ['Es un corte puntual cada cinco años, no una serie continua; no admite hablar de tendencia (sección 10.1).']],
  [['Fuente: ', true], ['CONEVAL, Pobreza por grupos poblacionales a escala municipal 2010, 2015 y 2020. Analysis/datos/CONEVAL_pobreza_grupos_poblacionales_municipal_2010_2015_2020.xlsx, procesado en Analysis/09_coneval_pobreza_grupos_municipal.ipynb. Nivel de evidencia: confirmado.']],
], AZUL));

add(h2('8.8 Hallazgos priorizados'));
add(tabla(
  ['#', 'Hallazgo', 'Evidencia', 'Qué decide'],
  [
    ['H1', 'El ingreso multiplica por ' + n1(Q.domestico.q5 / Q.domestico.q1) + ' la compra de trabajo doméstico y solo por ' + n1(Q.cuidado.q5 / Q.cuidado.q1) + ' la de cuidado, en los mismos hogares', 'Probable\nprecisión baja en cuidado', 'El programa no puede basarse en resolver búsqueda ni en reducir precio solamente'],
    ['H2', 'Desconocer que los servicios existen explica ' + pct(B.desconoce_todas) + ' de la no búsqueda entre todas las personas cuidadoras', 'Confirmado\nprecisión moderada', 'Se descarta la hipótesis de barrera de información'],
    ['H3', pct(B.en_su_casa) + ' preferiría cuidado en casa; menos del 5 %, una institución', 'Confirmado\nprecisión alta', 'La modalidad del programa es domiciliaria'],
    ['H4', pct(B.no_contrataria) + ' no contrataría a nadie, a ningún precio', 'Confirmado\nprecisión alta', 'Acota el tamaño máximo del mercado atendible'],
    ['H5', 'A jornada completa y salario legal, solo ' + pct(AS.legal_40_pct20) + ' de los hogares puede pagar sin rebasar el 20 % de su ingreso', 'Probable', 'Sin tercer pagador no hay modelo de negocio viable'],
    ['H6', 'El faltante de oferta depende del tipo de servicio; no hay un patrón centro-periferia único', 'Probable\nexploratorio', 'Obliga a clasificar la oferta por función antes de medirla'],
    ['H7', 'Miguel Hidalgo tiene ' + n0(TE.razon_mh_iztap) + ' veces más plazas privadas por persona dependiente que Iztapalapa', 'Probable\nexploratorio', 'Documenta desigualdad, pero no justifica construir residencias (H3)'],
    ['H8', 'La oferta declarada es abundante: ' + pct(B.seria_cuidador) + ' sería cuidador pagado y ' + pct(B.se_capacitaria) + ' se capacitaría', 'Confirmado\nprecisión alta', 'El cuello de botella no está del lado de la oferta de personas'],
    ['H9', '«No tuve necesidad» casi no cambia con las horas (' + pct(N7.sin_nec_menos20) + ' contra ' + pct(N7.sin_nec_40mas) + '), pero el daño declarado sube de ' + pct(N7.dano_menos20) + ' a ' + pct(N7.dano_40mas) + '', 'Confirmado\nprecisión alta; asociación, no causa', 'No basta con ofrecer: hay que detectar a la persona cuidadora'],
    ['H10', pct(N7.norma_familia) + ' dice que el apoyo le toca a la familia, pero ' + pct(N7.acepta_unas_horas) + ' acepta apoyo por unas horas', 'Confirmado\nprecisión alta', 'El formato con más respaldo es el relevo por horas'],
    ['H11', pct(N7.peso_40_sn_dano) + ' del universo cuida 40 h o más, dice no tener necesidad y declara daño', 'Confirmado\nprecisión alta', 'Delimita la población objetivo candidata del programa'],
    ['H12', 'Iztapalapa y Gustavo A. Madero concentran ' + pct(N8.dep_dos_pct) + ' de la dependencia severa de la ciudad', 'Probable\nfuente sin documentar', 'Orienta la sede del piloto; no es indicador'],
  ], [9, 38, 19, 34], { negritaCol0: true, izq: [1, 2, 3] },
));
add(salto());

// ════════════════════════════ 9 ════════════════════════════
add(h1('9. Aportación de cada unidad curricular al análisis'));
add(p('La tabla siguiente parte de la definida por el planteamiento institucional y añade, para cada unidad curricular, qué trabajo ya está hecho y cuál es el siguiente paso concreto. La columna de estado es lo que permite ver, de un vistazo, dónde está realmente el proyecto.'));
add(tabla(
  ['Unidad curricular', 'Aportación institucional', 'Evidencia esperada'],
  [
    ['Inteligencia de Negocios', 'Definición de KPI, arquitectura de información, tableros, visualización y apoyo a decisiones', 'Tablero interactivo y ficha de indicadores'],
    ['Analítica para los Negocios', 'Exploración, segmentación, patrones, relaciones, estimaciones y evaluación del comportamiento de la demanda y la oferta', 'Reporte analítico y hallazgos priorizados'],
    ['Herramientas y Técnicas Avanzadas', 'Modelos de clasificación, predicción, recomendación o matching, optimización u otras técnicas pertinentes', 'Modelo avanzado validado y documentado'],
    ['Leyes para la Protección de Datos', 'Marco jurídico, privacidad desde el diseño, consentimiento, derechos, seguridad, anonimización y gobernanza', 'Protocolo jurídico y de protección de datos'],
    ['Seminario de Titulación I', 'Problematización, antecedentes, metodología, argumentación, resultados, discusión y escritura académica', 'Informe de investigación y proyecto de titulación'],
    ['Práctica Profesional I', 'Diagnóstico situado, priorización, diseño de intervención, implementación, seguimiento y evaluación', 'Piloto en escenario profesional y reporte de intervención'],
  ], [25, 45, 30], { negritaCol0: true, izq: [1, 2] },
));

add(h3('Estado real por unidad curricular'));
add(tabla(
  ['Unidad curricular', 'Qué ya está hecho', 'Siguiente paso', 'Riesgo principal'],
  [
    ['Inteligencia de Negocios', 'Nada del tablero. Existe la materia prima: ocho figuras trazables y seis archivos de resultados', 'Mapa de objetivos e indicadores, separando KPI operativos, sociales y de sostenibilidad', 'Construir el tablero antes de fijar los indicadores. El incidente crítico de la UCA advierte exactamente contra eso'],
    ['Analítica para los Negocios', 'Seis análisis con salida reproducible; ocho hallazgos priorizados con nivel de evidencia', 'Segmentar el universo: qué distingue al ' + pct(B.no_contrataria) + ' que no contrataría del resto', 'Que la segmentación no encuentre nada separable con las variables disponibles. Es un resultado válido y hay que poder publicarlo'],
    ['Herramientas y Técnicas Avanzadas', 'Nada del modelo. Se documentó que ninguna fuente de afinidad oferta–demanda existe todavía', 'Elegir el problema de modelado a partir de H1 a H12 y definir su alternativa simple de comparación', 'Elegir el algoritmo antes que el problema. El programa exige un modelo avanzado; eso lo vuelve objetivo de aprendizaje, no conclusión del análisis'],
    ['Leyes para la Protección de Datos', 'Identificado el marco aplicable y la obligación del IMSS. Sin dictamen', 'Determinar si la UNRC es sujeto obligado y redactar el protocolo antes de cualquier levantamiento en el piloto', 'Levantar datos en el piloto sin protocolo previo. Sería irreversible y afectaría a población vulnerable'],
    ['Seminario de Titulación I', 'Este documento y el estudio de negocio', 'Anteproyecto en el formato de ocho cuartillas que pide la UCA', 'Confundir este documento con el anteproyecto: tienen formatos distintos'],
    ['Práctica Profesional I', 'Nada. No hay convenio firmado con ninguna institución receptora', 'Conseguir institución receptora. El Instituto de Envejecimiento Digno de la CDMX es un candidato identificado, no verificado', 'Es el riesgo mayor del proyecto: sin sede no hay piloto, y sin piloto no se puede medir la única barrera que ninguna fuente pública mide'],
  ], [19, 30, 28, 23], { negritaCol0: true, izq: [1, 2, 3] },
));
add(rica([
  ['Dónde se rompe hoy la ruta de integración. ', true],
  ['La secuencia institucional es OBSERVAR → PROTEGER → ANALIZAR → COMPRENDER → MODELAR → INTERVENIR → EVALUAR → DOCUMENTAR. El proyecto ha avanzado mucho en ANALIZAR y DOCUMENTAR, y nada en OBSERVAR, que es el primer eslabón y depende de una institución receptora que aún no existe. Eso significa que el diagnóstico situado, que debería alimentar todo lo demás, llegaría al final. Conviene decirlo ante los docentes antes de que lo señalen ellos.'],
]));
add(salto());

// ════════════════════════════ 10 ════════════════════════════
add(h1('10. Límites, vacíos y riesgos'));
add(h2('10.1 Lo que este Observatorio no podrá afirmar'));
add(vi('Nada sobre cuidado infantil, ni sobre personas cuidadoras a nivel territorial, ni sobre condiciones laborales del trabajo del hogar en la Ciudad de México (sección 4.5).'));
add(vi('Ninguna estimación de la ENASIC referida a la Ciudad de México o a una alcaldía. La encuesta no lo permite y ningún tratamiento estadístico lo arregla.'));
add(vi('Ninguna tendencia ni estacionalidad. La ENASIC es primera edición y la mayoría de los archivos territoriales no tiene año documentado.'));
add(vi('Ningún indicador territorial de oferta frente a necesidad, mientras ningún par cumpla la regla de compatibilidad de la sección 7.3.'));
add(vi('Ningún efecto causal. Todos los resultados son descriptivos.'));

add(h2('10.2 Vacíos de información, con responsable'));
add(tabla(
  ['Vacío', 'Por qué bloquea', 'Quién puede cerrarlo'],
  [
    ['Sede del piloto de práctica profesional', 'Sin institución receptora no hay diagnóstico situado ni medición de la barrera real', 'Equipo, con apoyo docente · URGENTE'],
    ['Oferta de cuidado domiciliario en la CDMX', 'Es la modalidad con mayor demanda declarada y ninguna fuente la cubre, tampoco el SIDECU', 'Explorar la ENOE por ocupación del SINCO'],
    ['Ficha de fuente del SIDECU y del MACU', 'Podrían resolver el componente de oferta institucional que hoy se arma con el DENUE', 'Un integrante, con la ficha de seis secciones'],
    ['Origen y año de cuatro archivos territoriales', 'Sin ficha de fuente, sus cifras no son citables', 'Quien haya descargado los archivos originalmente'],
    ['Sistema de Indicadores de Cuidados de la CDMX', 'Más de 80 indicadores que podrían evitar reconstruir lo ya resuelto; sin revisar', 'Un integrante, con la ficha de seis secciones'],
    ['Por qué no se contrata cuidado domiciliario', 'Es la pregunta central del proyecto y ninguna fuente pública la responde', 'Solo el piloto'],
    ['Texto íntegro de la Ley del Sistema de Cuidados', 'Se cita su mandato con base en prensa, no en la Gaceta Oficial', 'Leyes para la Protección de Datos'],
  ], [26, 44, 30], { negritaCol0: true, izq: [1, 2] },
));

add(h2('10.3 Riesgos del proyecto'));
add(viR([['Diseñar antes de tener el hallazgo. ', true], ['Es el riesgo recurrente, ya registrado tres veces en la bitácora: carpetas de arquitectura creadas antes de decidir la arquitectura, un informe con algoritmos elegidos antes de validar fuentes, y una aplicación construida antes del diagnóstico. El planteamiento institucional lo prohíbe explícitamente.']]));
add(viR([['Cifras generadas con inteligencia artificial que entran a un entregable. ', true], ['Se detectaron seis archivos de síntesis automática con errores confirmados que circulaban como fuentes. La regla propuesta —los resúmenes automáticos sirven como guía de lectura, nunca como fuente citable— sigue pendiente de que el equipo la adopte.']]));
add(viR([['Trabajar con población vulnerable sin protocolo previo. ', true], ['El piloto tocará a personas mayores, con discapacidad y en situación de dependencia. El protocolo de datos debe existir antes del primer contacto, no después.']]));
add(viR([['Que el programa prometa impacto que la evidencia no sostiene. ', true], ['Ninguno de los datos de este documento demuestra que una intervención mejore la vida de alguien. Demuestran, a lo sumo, dónde no está el problema.']]));
add(salto());

// ════════════════════════════ 11 ════════════════════════════
add(h1('11. Estado de la evidencia'));
add(tabla(
  ['Estatus', 'Afirmación'],
  [
    ['Confirmado', 'Ficha técnica y cobertura de la ENASIC 2022; magnitud nacional del fenómeno; comparabilidad de la ENUT 2014 y 2019'],
    ['Confirmado', 'El procedimiento de estimación del equipo reproduce dos cifras publicadas por el INEGI'],
    ['Confirmado', 'Razones declaradas de no búsqueda, preferencia de lugar y oferta declarada (H2, H3, H4, H8)'],
    ['Confirmado', 'Asociación entre horas de cuidado y daño declarado, y norma familiar medida directamente (H9, H10, H11); nacional'],
    ['Confirmado', 'Salarios mínimos 2022 y 2026, INPC, obligación de inscripción al IMSS desde 2023'],
    ['Confirmado', 'Aprobación y promulgación de la Ley del Sistema de Cuidados de la CDMX y su mandato de contabilidad del cuidado'],
    ['Confirmado', 'Monto, cobertura y seis objetivos del Anexo Transversal 31, y su naturaleza de reclasificación de recursos ya invertidos'],
    ['Probable', 'Cobertura del SIDECU (' + n0(EX.sidecu_centros) + ' centros, ' + n0(EX.sidecu_instituciones) + ' instituciones): tomada de prensa especializada, sin verificar en la plataforma'],
    ['Confirmado', 'Reproducción del Cuadro 2.2 del estudio de El Colegio de México: 48 de 48 celdas'],
    ['Confirmado', 'Pobreza CONEVAL por alcaldía, grupo 65+ (sección 8.7): validada contra el tablero de INMUJERES, coincidencia exacta en Azcapotzalco. No es indicador de cuidado'],
    ['Probable', 'Contratación por quintil (H1): las estimaciones de cuidado tienen precisión baja, aunque la brecha con el trabajo doméstico es robusta'],
    ['Probable', 'Asequibilidad y subsidio necesario (H5): dependen del supuesto de que el ingreso creció como el INPC'],
    ['Probable', 'Resultados territoriales (H6, H7, H12): archivos sin productor ni año documentados, conteos pequeños'],
    ['Probable', 'Dimensionamiento de la CDMX: tasas nacionales aplicadas a conteos locales, con sesgo declarado'],
    ['Desconocido', 'Por qué no se contrata cuidado domiciliario, que es la pregunta central'],
    ['Desconocido', 'Oferta real de personas cuidadoras remuneradas en la Ciudad de México'],
    ['Desconocido', 'Productor y año de cuatro de los archivos territoriales'],
    ['Desconocido', 'Sede del piloto y, por tanto, población concreta del diagnóstico situado'],
  ], [16, 84], { negritaCol0: true, izq: [1] },
));
add(salto());

// ════════════════════════════ 12 ════════════════════════════
add(h1('12. Referencias'));
const ref = (t) => new Paragraph({
  spacing: { after: 130, line: 264 }, alignment: AlignmentType.LEFT,
  indent: { left: 420, hanging: 420 },
  children: [new TextRun({ text: t, size: 20 })],
});
add(h3('Fuentes estadísticas y oficiales'));
add(ref('Consejo Nacional de Evaluación de la Política de Desarrollo Social. (2024). Pobreza por grupos poblacionales a escala municipal 2010, 2015 y 2020. https://www.coneval.org.mx/Medicion/Paginas/Pobreza_grupos_poblacionales_municipal_2010_2020.aspx'));
add(ref('Comisión Nacional de los Salarios Mínimos. (2021, 8 de diciembre). Resolución del Consejo de Representantes sobre los salarios mínimos general y profesionales vigentes a partir del 1 de enero de 2022. Diario Oficial de la Federación.'));
add(ref('Comisión Nacional de los Salarios Mínimos. (2025, 9 de diciembre). Resolución sobre los salarios mínimos general y profesionales vigentes a partir del 1 de enero de 2026. Diario Oficial de la Federación.'));
add(ref('Instituto Nacional de Estadística y Geografía. (2021). Censo de Población y Vivienda 2020. Resultados para la Ciudad de México. https://www.inegi.org.mx/programas/ccpv/2020/'));
add(ref('Instituto Nacional de Estadística y Geografía. (2022). Encuesta Nacional para el Sistema de Cuidados (ENASIC) 2022. Microdatos y descriptor de archivos. https://www.inegi.org.mx/programas/enasic/2022/'));
add(ref('Instituto Nacional de Estadística y Geografía. (2025). ENASIC 2022. Conociendo la base de datos.'));
add(ref('Instituto Nacional de Estadística y Geografía. (2026). Directorio Estadístico Nacional de Unidades Económicas, mayo de 2026. https://www.inegi.org.mx/app/mapa/denue/'));
add(ref('Instituto Nacional de Estadística y Geografía. (2025, 25 de noviembre). Cuenta Satélite del Trabajo No Remunerado de los Hogares de México 2024 (Comunicado de prensa núm. 148/25).'));
add(ref('Instituto Nacional de Estadística y Geografía. (2026). Índice Nacional de Precios al Consumidor, base segunda quincena de julio de 2018 = 100.'));
add(h3('Marco normativo'));
add(ref('Cámara de Diputados del H. Congreso de la Unión. (2025). Ley Federal de Protección de Datos Personales en Posesión de los Particulares [texto vigente, DOF 20 de marzo de 2025].'));
add(ref('Cámara de Diputados del H. Congreso de la Unión. (2025). Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados.'));
add(ref('Congreso de la Ciudad de México. (2026, 26 de mayo). Ley del Sistema de Cuidados de la Ciudad de México [promulgada el 2 de julio de 2026]. Pendiente de consulta en la Gaceta Oficial de la Ciudad de México.'));
add(ref('UNESCO. (2021). Recomendación sobre la ética de la inteligencia artificial.'));
add(h3('Estudios y referencias conceptuales'));
add(ref('Centro de Estudios Sociales y de Opinión Pública de la Ciudad de México y Centro de Estudios Demográficos, Urbanos y Ambientales de El Colegio de México. (2026). Economía del cuidado. [Versión de imprenta; pendiente de localizar la versión publicada y su URL.]'));
add(ref('Comisión Económica para América Latina y el Caribe. (2022). La sociedad del cuidado: horizonte para una recuperación sostenible con igualdad de género (LC/CRM.15/3).'));
add(ref('Comisión Económica para América Latina y el Caribe y ONU Mujeres. (2025). Economía del cuidado y trabajo decente: escenarios y recomendaciones para América Latina y el Caribe.'));
add(ref('Centro de Apoyo y Capacitación para Empleadas del Hogar. (2026). Tabulador salarial 2026 para las personas trabajadoras del hogar.'));
add(ref('Instituto Mexicano para la Competitividad. (2025). Hacia una economía de cuidados en México. [Compila cifras de otras fuentes y presenta inconsistencias internas documentadas por el equipo; no se usa como fuente de cifras.]'));
add(ref('Centro de Investigación Económica y Presupuestaria. (2025, octubre). Sistema Nacional de Cuidados: avances y limitaciones presupuestarias.'));
add(ref('Fundar, Centro de Análisis e Investigación. (2025). Anexo 31 para la consolidación de un sistema de cuidados: avances y limitaciones.'));
add(ref('Secretaría de las Mujeres. (2025). Anexo Transversal 31. Proyecto de Presupuesto de Egresos de la Federación 2026. https://cuidados.mujeres.gob.mx/'));
add(ref('Secretaría de las Mujeres y Sistema Nacional DIF. (2025, 5 de noviembre). Sistema de Información de Cuidados (SIDECU).'));
add(ref('Open Data Charter. (2023). Making care needs visible with care indicators. Data to Policy.'));
add(ref('University of Kansas. (2025, 28 de marzo). The Care Board: A new tool for understanding the care economy.'));
add(h3('Documentos internos del proyecto'));
add(ref('Equipo del proyecto integrador. (2026). Bitácora de decisiones del Observatorio del Cuidado. Documentos/bitacora-decisiones.md.'));
add(ref('Equipo del proyecto integrador. (2026). Inventario de fuentes y matrices de análisis. Analysis/matrices/.'));
add(ref('Universidad Nacional Rosario Castellanos. (2026). Problema prototípico 7.º semestre LCDN 2026-2. Observatorio de Datos para el Diseño de Programas de Innovación Social en la Economía del Cuidado.'));

// ── helper local para dos decimales de índices
function n2v(x) { return Number(x).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

const doc = new Document({
  creator: 'Equipo LCDN 7.º semestre · UNRC',
  title: 'Economía del cuidado en la Ciudad de México · Documento integrado de investigación',
  description: 'Delimitación del problema, selección de nicho y hallazgos del análisis exploratorio. Generado desde _valores.json.',
  styles: estilos, numbering,
  sections: [{
    properties: propiedadesPagina,
    footers: { default: piePagina('Documento integrado de investigación · v0.3 · 26 de septiembre de 2026 ·') },
    children: hijos,
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync('Documento_Integrado_Observatorio_Cuidado_v0.3.docx', b);
  console.log('✓ Documento_Integrado_Observatorio_Cuidado_v0.3.docx ·', (b.length / 1024).toFixed(0), 'KB');
});
