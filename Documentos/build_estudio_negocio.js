// Construye Estudio_de_Negocio_Programa_Cuidado.docx
// Observatorio de Datos para la Economía del Cuidado · LCDN 7.º semestre · UNRC · 2026-2
// Ejecutar:  node build_estudio_negocio.js

const fs = require('fs');
const { Document, Packer, AlignmentType, Paragraph, TextRun } = require('docx');
const C = require('./comun');
const {
  V, n0, n1, n2, pct, mx, mx2, p, rica, h1, h2, h3, vi, viR, num, regla, caja, tabla,
  figura, salto, numbering, estilos, piePagina, propiedadesPagina, portada,
  GUINDA, AZUL, OCRE,
} = C;

const B = V.barreras, Q = V.quintiles, PA = V.pago, IN = V.ingreso;
const AS = V.asequibilidad, SU = V.subsidio, CX = V.cdmx, TE = V.territorio, EX = V.externo;
const FE = V.federal, N7 = V.n07;

// Derivados aritméticos de cifras ya verificadas (no son cifras nuevas)
const horaGeneral = EX.sm_general_2026_dia / 8;
const horaPiso = EX.sm_hogar_2026_dia / 8;
const horaZlfn = EX.sm_hogar_2026_zlfn_dia / 8;
const horaCaceh = EX.caceh_cat8_dia / 8;
const mes = (h) => h * 40 * 4.33;                       // jornada completa
const conImss = (x) => x * (1 + EX.carga_patronal_pct / 100);
const pctPresu = (mdp) => mdp / EX.presupuesto_cuidados_2026_mdp * 100;

const hijos = [];
const add = (...x) => x.flat().forEach((e) => hijos.push(e));

// ════════════════════════════ PORTADA ════════════════════════════
add(portada(
  'Programa de innovación social «Cuidar en casa»',
  'Estudio de negocio: segmento, precios, salarios y modelo de sostenibilidad',
  'Anexo del documento integrado',
  '1.ª Revisión · 26 de septiembre de 2026',
  [
    [['Redacción: ', true], ['Omar Gutiérrez Escoto']],
    [['Revisión cruzada: ', true], ['PENDIENTE. Ninguna cifra ni recomendación de este anexo está aprobada por el equipo.']],
    [['Versión: ', true], ['0.2 · 23 de septiembre de 2026. Cambios respecto de la 0.1: la cifra de desconocimiento de los servicios se sustituye por la de precisión moderada; se corrige la sección 2.3, que presentaba «tratan mal» como la principal razón para rechazar una residencia cuando es la segunda; y la sección 3.2 agrega la relación entre el segmento de entrada y la población objetivo candidata. La 0.1 se conserva en la carpeta.']],
    [['Depende de: ', true], ['Documento_Integrado_Observatorio_Cuidado_v0.2.docx, secciones 4 y 8. Los hallazgos H1 a H12 se citan aquí sin volver a demostrarse.']],
    [['Nombre del programa: ', true], ['«Cuidar en casa» es un nombre de trabajo propuesto en este documento, no una decisión del equipo.']],
  ],
));
add(salto());

// ════════════════════════════ RESUMEN ════════════════════════════
add(h1('Resumen ejecutivo'));
add(caja('Lo que este estudio concluye', [
  [['1. La aplicación es obligatoria; lo que había que justificar era su propósito, y ese cambia. ', true],
   ['El problema prototípico exige los perfiles «Necesito cuidado» y «Puedo cuidar». Pero los datos descartan que el problema sea encontrarse: desconocer que los servicios existen explica ' + pct(B.desconoce_todas) + ' de la no búsqueda entre todas las personas cuidadoras. Si la aplicación se diseña como un buscador, resuelve un problema que casi nadie tiene.']],
  [['2. El problema real es la confianza para delegar y el precio de un empleo digno, en ese orden. ', true],
   ['En el quintil de ingreso más alto, los hogares con necesidad contratan trabajo doméstico en ' + pct(Q.domestico.q5) + ' de los casos y cuidado en ' + pct(Q.cuidado.q5) + '. Mismo hogar, mismo dinero, misma costumbre de dejar entrar a alguien: lo que no se delega es el cuidado de la persona.']],
  [['3. El pago directo de las familias no sostiene un programa con empleo formal. ', true],
   ['Una jornada completa al piso legal de 2026 cuesta ' + mx(AS.legal_40_costo) + ' al mes sin cuotas patronales y ' + mx(SU.l40_con_costo) + ' con ellas. Solo ' + pct(AS.legal_40_pct20) + ' de los hogares con necesidad podría pagarla sin rebasar el 20 % de su ingreso.']],
  [['4. Un tercer pagador es condición de existencia, no una mejora. ', true],
   ['De ' + n0(V.referencias.n_casos) + ' referencias revisadas, las dos que cerraron cobraban a la familia, y las que escalaron cobran a aseguradoras, al seguro público de cuidados o al sistema de salud.']],
  [['5. Pero ningún pagador disponible alcanza para una cobertura amplia. ', true],
   ['Subsidiar media jornada al piso legal para el 25 % de los hogares con necesidad costaría ' + n0(SU.l20_sin_25_mdp) + ' millones al año solo en la Ciudad de México —el ' + n1(pctPresu(SU.l20_sin_25_mdp)) + ' % de lo solicitado para el Sistema Público de Cuidados local— y ' + n0(FE.n20_sin_mdp) + ' millones a escala nacional: ' + n1(FE.n20_sin_veces_sem) + ' veces el presupuesto 2026 de la Secretaría de las Mujeres, que es quien coordina el sistema. El programa tiene que ser focalizado por diseño, no por preferencia.']],
  [['6. Y el directorio de servicios ya lo construyó el Gobierno federal. ', true],
   ['El SIDECU, presentado en noviembre de 2025, mapea unos ' + n0(EX.sidecu_centros) + ' centros públicos de cuidado. Lo que no mapea —porque no tiene establecimiento— es el cuidado domiciliario, que es la modalidad que prefiere el ' + pct(B.en_su_casa) + '. Ahí está el hueco.']],
], GUINDA));
add(rica([
  ['Consecuencia de diseño. ', true],
  ['El programa que la evidencia sostiene no es un mercado de dos lados donde la oferta y la demanda se encuentran. Es una ', ],
  ['capa de confianza y focalización sobre un mercado que ya existe', true],
  [': verificar y formar a las personas cuidadoras, identificar a los hogares donde el cuidado está produciendo un costo medible —renuncia al empleo, deterioro de la persona cuidadora, hospitalización evitable— y conectar esos casos con un pagador institucional. Los dos perfiles obligatorios siguen existiendo; lo que cambia es qué hace el sistema con ellos.'],
]));
add(salto());

// ════════════════════════════ 1 ════════════════════════════
add(h1('1. Del hallazgo al programa'));
add(p('El planteamiento institucional exige que el programa social derive «de un hallazgo del Observatorio, no de una solución preconcebida». Esta sección hace explícita esa cadena, para que pueda auditarse eslabón por eslabón y para que se vea dónde está rota.'));
add(tabla(
  ['Eslabón', 'Contenido', 'Evidencia'],
  [
    ['Dato', 'Microdatos ENASIC 2022, DENUE 05/2026, Censo 2020, archivos territoriales de la CDMX', 'Confirmado, salvo cuatro archivos sin productor ni año'],
    ['Evidencia', 'H1 a H12 del documento integrado, sección 8.7', 'Confirmado y probable, con precisión declarada'],
    ['Decisión', 'La intervención es domiciliaria (H3), no puede basarse en búsqueda (H2) ni en precio solo (H1), y requiere pagador institucional (H5)', 'Deriva de la evidencia'],
    ['Programa', '«Cuidar en casa»: verificación, formación, focalización y vinculación con pagador', 'Propuesta de este documento. NO validada'],
    ['Piloto', 'Medir, en una institución receptora, por qué un hogar concreto no contrata cuidado domiciliario', 'PENDIENTE: no hay institución receptora'],
  ], [14, 54, 32], { negritaCol0: true, izq: [1, 2] },
));
add(caja('Dónde está rota la cadena', [
  'El eslabón «Piloto» no existe. Sin institución receptora no hay diagnóstico situado, y el diagnóstico situado es justamente lo que mediría la única barrera que ninguna fuente pública mide: por qué un hogar que puede pagar no contrata cuidado.',
  [['Riesgo honesto de este anexo: ', true], ['todo lo que sigue descansa sobre una hipótesis de norma familiar y confianza que es la mejor explicación disponible de los datos, pero que no ha sido medida directamente. Si el piloto la refuta, el programa cambia.']],
], OCRE));
add(salto());

// ════════════════════════════ 2 ════════════════════════════
add(h1('2. Los dos perfiles obligatorios y qué problema resuelven realmente'));
add(h2('2.1 Lo que exige la institución'));
add(p('El documento «Problema Prototípico 7.º Sem LCDN 2026-2», en el apartado «Programa de innovación social», enumera como productos mínimos: propuesta de valor social y población objetivo; dos perfiles funcionales mínimos, «Necesito cuidado» y «Puedo cuidar», con un tercer perfil opcional para organizaciones; flujo de solicitud, búsqueda o matching, vinculación, seguimiento y evaluación; modelo de matching con criterios pertinentes; mecanismos de verificación, confianza, seguridad y atención de incidentes; y modelo de sostenibilidad con aliados, recursos, costos, ingresos o subsidios y estrategia de escalabilidad.'));
add(rica([
  ['Esto zanja una discusión interna. ', true],
  ['La bitácora del 20 de septiembre registró que la aplicación era una propuesta de Omar y no un requisito institucional, y sobre esa base se planteó retirarla como producto final. El registro era incorrecto: los dos perfiles están pedidos por escrito. La aplicación se queda. Lo que la evidencia sí obliga a reformular es qué hace.'],
]));

add(h2('2.2 Lo que la evidencia descarta'));
add(tabla(
  ['Función candidata', 'Qué supondría', 'Veredicto'],
  [
    ['Buscador de servicios', 'Que las familias no encuentran a quién contratar', 'DESCARTADA POR PARTIDA DOBLE. Desconocer que existen explica ' + pct(B.desconoce_todas) + ' de la no búsqueda (H2), y Respect cerró a los seis meses porque dar más información no mejoró la conversión. Además, el SIDECU federal ya mapea unos ' + n0(EX.sidecu_centros) + ' centros desde noviembre de 2025: construirlo de nuevo sería duplicar una plataforma nacional'],
    ['Comparador de precios', 'Que el precio es el freno entre quienes podrían pagar', 'DESCARTADA como función principal. En el quintil más alto la contratación de cuidado se queda en ' + pct(Q.cuidado.q5) + ' (H1)'],
    ['Directorio de residencias', 'Que la demanda insatisfecha es institucional', 'DESCARTADA. Menos del 5 % preferiría una institución (H3), pese a la desigualdad territorial de plazas (H7)'],
    ['Matching algorítmico de pares', 'Que hay congestión: muchas solicitudes y muchas cuidadoras que coordinar', 'PREMATURA. A escala de piloto no hay congestión que optimizar, y ninguna fuente de afinidad oferta–demanda existe todavía'],
  ], [20, 30, 50], { negritaCol0: true, izq: [1, 2] },
));

add(h2('2.3 Lo que la evidencia sí sostiene'));
add(p('Tres resultados, leídos juntos, apuntan a la misma función y no a la de intermediación.'));
add(num(`La oferta de personas dispuestas es abundante: ${pct(B.seria_cuidador)} de la población de 15 a 60 años sería cuidadora pagada y ${pct(B.se_capacitaria)} de ellas se capacitaría (H8). No falta gente; falta gente en quien confiar.`));
add(num(`Entre quienes sí buscaron un servicio y no encontraron lo que buscaban, las razones más citadas son costo elevado (${pct(B.nc_costo)}) y personal no capacitado (${pct(B.nc_no_capacitado)}). Ambas con precisión baja —la submuestra es de 46 casos—, pero apuntan a calidad y precio, no a disponibilidad.`));
add(num(`La ENASIC documenta que quienes aceptarían una institución piden personal capacitado y buen trato antes que precio, y que, entre quienes rechazan una residencia para sí, la razón más citada es que la responsabilidad es de la familia (${pct(N7.no_res_familia)}) y la segunda, que «tratan mal a las personas» (${pct(N7.no_res_maltrato)}).`));
add(caja('Propuesta de valor reformulada', [
  [['Para el hogar: ', true], ['no «encuentra quién cuide», sino «puede delegar sin miedo». Verificación escalonada, persona cuidadora formada y certificada, plan de cuidado escrito, supervisión y un canal de incidentes con respuesta comprometida.']],
  [['Para la persona cuidadora: ', true], ['no «consigue clientes», sino «tiene un empleo reconocido». Formación certificable, salario no menor al piso legal, inscripción al IMSS y continuidad de horas.']],
  [['Para el pagador institucional: ', true], ['no «una app», sino «un mecanismo de focalización auditable»: a qué hogares llega el recurso, por qué esos y qué cambió.']],
  [['Qué hacen entonces los dos perfiles obligatorios: ', true], ['«Necesito cuidado» es el instrumento de diagnóstico y priorización del hogar, no un formulario de búsqueda. «Puedo cuidar» es el expediente de verificación y formación de la persona cuidadora, no un anuncio clasificado.']],
], AZUL));
add(salto());

// ════════════════════════════ 3 ════════════════════════════
add(h1('3. Segmento objetivo y dimensionamiento'));
add(h2('3.1 El embudo'));
add(figura('f8_embudo_mercado_cdmx', 1,
  'Hogares de la Ciudad de México con necesidad de cuidado y hogares que hoy pagan por servicios en casa.',
  'Fuente: Analysis/resultados/05_dimensionamiento_cdmx.csv. Inferencia de tasas nacionales sobre conteos del Censo 2020, no medición. Nivel de evidencia: probable.'));
add(rica([
  ['Cómo leer estas cifras sin sobreinterpretarlas. ', true],
  ['La ENASIC es nacional y no admite estimaciones para la Ciudad de México. Lo que se hace aquí es distinto y está declarado: se calculan tasas nacionales con la encuesta y se aplican a conteos de la ciudad del Censo 2020 (' + n0(CX.viviendas) + ' viviendas particulares habitadas). El resultado es una inferencia con un sesgo conocido y de dirección conocida: la Ciudad de México está más envejecida que el promedio nacional, así que ' + n0(CX.hogares_necesidad) + ' hogares con necesidad es una cota inferior, no una estimación central.'],
]));

add(h2('3.2 El segmento de entrada'));
add(p(`El dato que ordena toda la estrategia comercial es la relación entre las dos barras pequeñas. Alrededor de ${n0(CX.hogares_contratan_domestico)} hogares con una persona con discapacidad o de 60 y más ya pagan trabajo doméstico, y solo unos ${n0(CX.hogares_contratan_cuidado)} pagan enfermería o cuidado: una razón de ${n1(CX.razon_dom_cui)} a 1.`));
add(caja('Por qué ese es el segmento de entrada', [
  'Esos hogares ya resolvieron tres cosas que el resto no: tienen capacidad de pago demostrada, ya aceptaron que una persona ajena entre a su casa, y ya saben coordinar a alguien que trabaja para ellos. Lo único que no han hecho es delegar el cuidado de la persona.',
  [['Consecuencia operativa: ', true], ['el costo de convencerlos es menor y el aprendizaje es más rápido. Si el programa no funciona en este segmento, no funcionará en ninguno, y eso se sabría barato.']],
  [['Consecuencia para el piloto: ', true], ['es en estos hogares donde conviene medir la pregunta abierta del proyecto, porque en ellos el precio y el desconocimiento quedan controlados por construcción.']],
  [['Advertencia: ', true], ['este segmento se deriva de tasas nacionales. Que existan ' + n0(CX.hogares_contratan_domestico) + ' hogares así en la ciudad es probable, no confirmado, y el número exacto no debe citarse como dato.']],
], GUINDA));
add(caja('Segmento de entrada y población objetivo: dos cosas distintas (agregado en la versión 0.2)', [
  'La sección 8.5 del documento integrado identifica una población objetivo candidata: quien cuida 40 horas o más a la semana, dice no haber tenido necesidad de un servicio y declara algún daño a su salud o a su trabajo. Es ' + pct(N7.peso_40_sn_dano) + ' del universo de personas cuidadoras, unas ' + n0(N7.peso_40_sn_dano_personas) + ' personas a escala nacional (H11).',
  [['No es el mismo grupo que el segmento de entrada. ', true], ['El segmento se define por lo que el hogar ya compra; la población objetivo, por la carga de quien cuida. Hoy no se sabe cuánto se traslapan. La ENASIC permite medirlo cruzando la contratación de trabajo doméstico con las horas de cuidado y el daño declarado; ese cruce no se ha hecho.']],
  [['Lo que cambia según cuánto se traslapen. ', true], ['Si el traslape es alto, el segmento de entrada sirve para aprender barato sobre la población que importa. Si es bajo, el piloto en este segmento probaría el programa con hogares que pueden pagar, pero no con la persona cuidadora que carga el daño, y el escenario de pagador de la sección 6 tendría que revisarse, porque esa población no está en condiciones de pagar a precio de mercado.']],
  [['Decisión pendiente del equipo: ', true], ['mantener este segmento de entrada, sustituirlo por la persona cuidadora de alta intensidad, o mantenerlo hasta medir el traslape. Este anexo no lo decide.']],
], AZUL));

add(h2('3.3 Qué no es el mercado'));
add(viR([[pct(B.no_contrataria) + ' de quienes cuidan declara que no contrataría a nadie (H4). ', true], ['Sobre la cota inferior de ' + n0(CX.hogares_necesidad) + ' hogares, eso son del orden de ' + n0(CX.hogares_necesidad * B.no_contrataria / 100) + ' hogares fuera de cualquier oferta de mercado, a cualquier precio. No es un obstáculo a vencer con mejor comunicación: es el tamaño del problema que este tipo de programa no resuelve.']]));
add(viR([['Las residencias no son el mercado. ', true], ['Menos del 5 % preferiría una institución. La desigualdad de plazas entre Miguel Hidalgo e Iztapalapa (' + n0(TE.razon_mh_iztap) + ' a 1) documenta una injusticia territorial real, pero no una demanda insatisfecha.']]));
add(viR([['El cuidado infantil no es el mercado de este programa. ', true], ['Quedó fuera en la selección de nicho porque la política pública de la ciudad ya lo cubre con 300 centros comprometidos.']]));
add(salto());

// ════════════════════════════ 4 ════════════════════════════
add(h1('4. Qué dice el mercado: doce referencias'));
add(p(`El equipo construyó una matriz de ${n0(V.referencias.n_casos)} casos en México, Estados Unidos y Europa, con diecisiete columnas por caso, incluyendo deliberadamente ${n0(V.referencias.n_cerradas)} empresas que cerraron para contrarrestar el sesgo de supervivencia. Se resume aquí lo que decide el modelo de negocio.`));
add(tabla(
  ['Caso', 'País', 'Quién paga', 'Qué enseña'],
  [
    ['HomeHero †', 'EUA', 'Familia', 'Levantó 23 millones de dólares y cerró. Al pasar de contratistas a empleadas, el costo de incorporar cuidadoras se multiplicó por diez'],
    ['Respect †', 'EUA', 'Familia', 'Cerró a los seis meses con unos 30 clientes. Su director: la aplicación mejoró el servicio, no la conversión'],
    ['Care.com', 'EUA', 'Familia', 'Con 34 millones de usuarios, una investigación periodística mostró fallas en la verificación. La verificación opcional da falsa confianza'],
    ['Cuideo', 'España', 'Familia', 'Sobrevivió dejando de ser intermediario: pasó a nómina directa y compró un operador para prestar el servicio'],
    ['Honor + Home Instead', 'EUA', 'Familia', 'La plataforma compró a la red tradicional de franquicias en lugar de competir contra ella'],
    ['Papa Inc.', 'EUA', 'Aseguradoras', 'Acompañamiento pagado por Medicare Advantage. Reporta menos soledad y menos urgencias; evidencia propia, sin aleatorización'],
    ['Careship', 'Alemania', 'Seguro público', 'Creció con la mitad de sus ingresos provenientes del seguro público de cuidados'],
    ['Buurtzorg', 'Países Bajos', 'Sistema de salud', 'No es una aplicación: equipos autogestionados por barrio. KPMG encontró costo total por paciente promedio, no menor'],
    ['ANA Care', 'México y 7 países', 'Agencias, aseguradoras y BID Lab', 'Formación con módulo de matching desde 2025. A sep-2025: 3 006 cursos terminados de 7 105 iniciados y 32 acreditaciones CONOCER contra una meta de 90'],
    ['Nannapp', 'México', 'Familia', 'Nueve años operando, sobre todo cuidado infantil. «Cero incidencias» es autodeclarado'],
  ], [17, 13, 16, 54], { negritaCol0: true, izq: [1, 2, 3] },
));
add(p('† Empresas cerradas. Los dos casos restantes de la matriz (Gericare y Care Me) no aportan evidencia utilizable: el primero no es intermediación y del segundo no se encontró ninguna fuente verificable.', { size: 18, color: C.TINTA3 }));

add(h2('4.1 Cuatro patrones'));
add(num('Quien cobra a la familia, muere o se transforma. Los dos cierres de la muestra cobraban a la familia. Cuideo y Honor sobrevivieron dejando de ser plataformas puras para convertirse en operadores. Ninguna empresa de la muestra escaló como intermediario que solo conecta.'));
add(num('Quien cobra a un pagador institucional, escala. Papa con aseguradoras, Careship con el seguro público alemán, Buurtzorg con el sistema de salud. El reporte del BID sobre ANA Care lo dice sin rodeos: sin un tercero pagador, el pago directo de las familias es limitado por su baja capacidad de pago.'));
add(num('La formalización laboral es el punto de quiebre económico, no un detalle de cumplimiento. HomeHero cerró exactamente ahí. En México ese punto ya llegó por ley: la inscripción al IMSS es obligatoria desde enero de 2023.'));
add(num('Nadie documenta su problema con datos. Ninguna de las empresas revisadas sustenta el problema que dice resolver con una medición. Casi todas parten de la experiencia personal de quien la fundó. Es la única ventaja real que este proyecto tiene sobre sus referentes comerciales, y conviene no desperdiciarla construyendo la misma aplicación que ellos.'));
add(caja('Lo que estas referencias no prueban', [
  'Ninguna evaluación de impacto con asignación aleatoria aparece en la muestra. La mejor evidencia de resultados —la de Papa— la produjo la propia empresa, sin aleatorización y con abandono alto. La evaluación de resultados del proyecto de ANA Care seguía en cero de uno a septiembre de 2025.',
  [['Regla que se deriva: ', true], ['estas referencias sirven para descartar modelos de negocio, no para prometer impacto. Ninguna cifra de esta sección puede usarse en el informe como evidencia de que una intervención funciona.']],
], OCRE));
add(salto());

// ════════════════════════════ 5 ════════════════════════════
add(h1('5. Estructura de salarios y precios'));
add(p('Se piden cuatro rangos distintos, que responden a cuatro decisiones distintas. Se presentan por separado porque confundirlos es el error más común en este tipo de documento: lo que gana la persona cuidadora, lo que paga la familia, lo que cuesta operar el programa y lo que cuesta el equipo que sostiene el Observatorio no son el mismo número.'));

add(h2('5.1 Lo que se le paga a la persona cuidadora'));
add(tabla(
  ['Referencia salarial', 'Por día', 'Por hora', 'Mes a 40 h/sem', 'Naturaleza'],
  [
    ['Salario mínimo general 2026, zona general', mx2(EX.sm_general_2026_dia), mx2(horaGeneral), mx(mes(horaGeneral)), 'Piso legal absoluto'],
    ['Mínimo profesional, persona trabajadora del hogar, zona general', mx2(EX.sm_hogar_2026_dia), mx2(horaPiso), mx(mes(horaPiso)), 'PISO LEGAL APLICABLE en la CDMX'],
    ['Mínimo profesional, Zona Libre de la Frontera Norte', mx2(EX.sm_hogar_2026_zlfn_dia), mx2(horaZlfn), mx(mes(horaZlfn)), 'No aplica a la CDMX; referencia'],
    ['Mediana observada ENASIC, cuidadora (sin ponderar)', '—', mx2(PA.cuidadora_hora_2026), '—', 'Lo que el mercado paga hoy · n = ' + n0(PA.cuidadora_n)],
    ['Mediana observada ENASIC, cuidadora (ponderada)', '—', mx2(PA.cuidadora_hora_pond_2026), '—', 'Lo que el mercado paga hoy · n = ' + n0(PA.cuidadora_n)],
    ['Mediana observada ENASIC, enfermería', '—', mx2(PA.enfermeria_hora_2026), '—', 'Servicio especializado · n = ' + n0(PA.enfermeria_n)],
    ['Tabulador CACEH 2026, categoría 8', mx2(EX.caceh_cat8_dia), mx2(horaCaceh), mx(mes(horaCaceh)), 'Referencia de trabajo digno; NO es piso legal'],
  ], [33, 12, 12, 15, 28], { negritaCol0: true, izq: [4] },
));
add(p('Todas las cifras en pesos de 2026. Las medianas observadas se actualizan desde 2022 con el Índice Nacional de Precios al Consumidor (factor ' + n2(IN.factor_inpc) + ', noviembre de 2022 a agosto de 2026). Las cifras por hora del piso legal y del tabulador dividen la jornada diaria entre 8 horas.', { size: 18, color: C.TINTA3 }));
add(caja('El hallazgo incómodo de esta tabla', [
  [['El mercado actual paga alrededor del piso legal, y buena parte por debajo. ', true],
   ['La mediana observada sin ponderar para una persona cuidadora es de ' + mx2(PA.cuidadora_hora_2026) + ' por hora, frente a un piso legal de ' + mx2(horaPiso) + '. La mediana ponderada sube a ' + mx2(PA.cuidadora_hora_pond_2026) + ', pero el primer cuartil está en ' + mx2(PA.cuidadora_hora_p25_2026) + '. Es decir: cerca de la mitad de los arreglos de cuidado que hoy existen pagan al nivel del mínimo profesional o por debajo de él.']],
  [['Lo que eso significa para el programa: ', true], ['un programa que formalice el empleo no compite contra el mercado informal, porque es estructuralmente más caro que él. No hay eficiencia operativa ni algoritmo que cierre esa diferencia. La única forma de cerrarla es que alguien distinto de la familia pague la diferencia.']],
  [['Límite del dato: ', true], ['la muestra de personas cuidadoras contratadas en la ENASIC es de ' + n0(PA.cuidadora_n) + ' casos con pago por hora calculable, sin ponderar en los cuartiles. Es indicativo, no una estimación de precisión conocida.']],
], GUINDA));
add(h3('Rango recomendado para el programa'));
add(p('Con lo anterior, el rango defendible para la remuneración de una persona cuidadora en el programa va de ' + mx2(horaPiso) + ' por hora —piso legal, no negociable— a ' + mx2(horaCaceh) + ' por hora —referencia de trabajo digno del tabulador de la sociedad civil especializada—, con un punto medio de trabajo alrededor de ' + mx2((horaPiso + horaCaceh) / 2) + ' por hora para cuidado no especializado con formación certificada. El extremo superior del rango corresponde a cuidado de personas con dependencia alta y personal con certificación CONOCER; el inferior, a acompañamiento y apoyo en actividades instrumentales.'));
add(p('Pagar por debajo del piso legal está descartado por dos razones independientes: es ilegal, y contradice el objetivo 8 de desarrollo sostenible que el propio planteamiento institucional vincula al proyecto. Un programa de economía del cuidado que precariza el trabajo de cuidado se refuta a sí mismo.'));

add(h2('5.2 Lo que paga la familia'));
add(tabla(
  ['Paquete', 'Al piso legal', 'Con IMSS e Infonavit', '% del ingreso mediano', 'Hogares que pueden pagarlo'],
  [
    ['10 h/semana · apoyo parcial', mx(AS.legal_10_costo), mx(SU.l10_con_costo), n1(AS.legal_10_costo / (IN.mediana_2022 * IN.factor_inpc) * 100) + ' %', pct(SU.l10_con_pct)],
    ['20 h/semana · medio tiempo', mx(AS.legal_20_costo), mx(SU.l20_con_costo), n1(AS.legal_20_costo / (IN.mediana_2022 * IN.factor_inpc) * 100) + ' %', pct(AS.legal_20_pct20)],
    ['40 h/semana · jornada completa', mx(AS.legal_40_costo), mx(SU.l40_con_costo), n1(AS.legal_40_pct_ingreso) + ' %', pct(AS.legal_40_pct20)],
  ], [28, 17, 20, 17, 18], { negritaCol0: true },
));
add(p('La última columna es la proporción de hogares con necesidad cuyo ingreso permitiría pagar el paquete sin rebasar el 20 % de su ingreso mensual. El umbral del 20 % es una convención del equipo, no un estándar oficial, y debe declararse como tal en cualquier presentación.', { size: 18, color: C.TINTA3 }));
add(figura('f4_asequibilidad', 2,
  'Proporción de hogares con necesidad que podría pagar cuidado domiciliario sin rebasar el 20 % de su ingreso.',
  'Fuente: Analysis/resultados/04_asequibilidad_paquetes.csv. Nacional. Nivel de evidencia: probable.'));
add(rica([
  ['La conclusión comercial es dura y conviene decirla sin suavizar: ', true],
  ['a precio de empleo formal, el mercado de pago directo es de ' + pct(SU.l40_con_pct) + ' de los hogares con necesidad para jornada completa y ' + pct(SU.l20_con_pct) + ' para media jornada, contando cuotas patronales. Incluso el paquete más pequeño, diez horas a la semana, solo llega a ' + pct(SU.l10_con_pct) + '. No existe un diseño de producto que agrande esos números: no dependen del producto, dependen del ingreso de los hogares y del costo legal del trabajo. Lo único que los agranda es que alguien distinto de la familia pague una parte.'],
]));

add(h2('5.3 Lo que cuesta operar y quién lo subsidia'));
add(p('La pregunta que decide la viabilidad del programa no es cuánto cuesta la plataforma, sino cuánto tendría que aportar un tercer pagador para que el servicio sea asequible, y si ese monto cabe en algún presupuesto real.'));
add(tabla(
  ['Escenario · media jornada al piso legal', 'Sin cuotas patronales', 'Con IMSS e Infonavit'],
  [
    ['Costo mensual del paquete de 20 h/semana', mx(SU.l20_sin_costo), mx(SU.l20_con_costo)],
    ['Hogares que lo pagan solos (≤ 20 % del ingreso)', pct(AS.legal_20_pct20), pct(SU.l20_con_pct)],
    ['Subsidio mensual por hogar para llegar al 25 % de cobertura', mx(SU.l20_sin_25), mx(SU.l20_con_25)],
    ['Ese subsidio como proporción del costo', pct(SU.l20_sin_25_pct), pct(SU.l20_con_25 / SU.l20_con_costo * 100)],
    ['Costo anual si se aplicara al 25 % de los hogares de la CDMX', n0(SU.l20_sin_25_mdp) + ' millones', n0(SU.l20_con_25_mdp) + ' millones'],
    ['Proporción del presupuesto solicitado para el Sistema de Cuidados 2026', n1(pctPresu(SU.l20_sin_25_mdp)) + ' %', n1(pctPresu(SU.l20_con_25_mdp)) + ' %'],
  ], [46, 27, 27], { negritaCol0: true },
));
add(caja('El muro de viabilidad', [
  [['El presupuesto solicitado para todo el Sistema Público de Cuidados de la Ciudad de México en 2026 es de ' + n1(EX.presupuesto_cuidados_2026_mdp) + ' millones de pesos', true],
   [', repartidos en siete programas: Utopías, pensión universal de 60 a 64 años, primera infancia, pensiones por discapacidad, comedores de bienestar, Casas de las Tres R (' + n0(EX.presupuesto_casas3r_mdp) + ' millones) y «Ciudad que cuida a las personas cuidadoras» (' + n1(EX.presupuesto_cuidadoras_mdp) + ' millones).']],
  [['Subsidiar media jornada de cuidado domiciliario, al piso legal, para apenas la cuarta parte de los hogares con necesidad de la ciudad costaría del orden de ' + n0(SU.l20_sin_25_mdp) + ' millones al año: el ' + n1(pctPresu(SU.l20_sin_25_mdp)) + ' % de ese presupuesto completo. Con cuotas patronales, el ' + n1(pctPresu(SU.l20_con_25_mdp)) + ' %.', true]],
  [['Conclusión de diseño, no de resignación: ', true], ['el programa no puede plantearse como un subsidio general. Tiene que focalizar en los hogares donde la ausencia de cuidado produce un costo verificable y evitable —renuncia al empleo de la persona cuidadora, hospitalización evitable, institucionalización prematura—, porque solo en esos casos el subsidio se paga con el costo que evita. Esa focalización es, precisamente, lo que un Observatorio puede hacer y una aplicación de intermediación no.']],
], GUINDA));
add(h3('La misma pregunta a escala nacional'));
add(p('La comparación anterior es contra el presupuesto de una sola ciudad. Desde septiembre de 2025 existe un ancla federal: el Anexo Transversal 31 del Proyecto de Presupuesto de Egresos 2026, de ' + n0(FE.anexo31_mdp) + ' millones de pesos. Conviene hacer la comparación también ahí, con una advertencia previa.'));
add(tabla(
  ['Subsidio nacional · 25 % de cobertura', 'Media jornada (20 h/sem)', 'Jornada completa con IMSS'],
  [
    ['Hogares con necesidad en el país (ENASIC, expandido)', n0(FE.hogares_necesidad_nal), n0(FE.hogares_necesidad_nal)],
    ['Costo anual del subsidio', n0(FE.n20_sin_mdp) + ' millones', n0(FE.n40_con_mdp) + ' millones'],
    ['Proporción del Anexo Transversal 31 completo', pct(FE.n20_sin_pct_anexo), pct(FE.n40_con_pct_anexo)],
    ['Veces el presupuesto 2026 de la Secretaría de las Mujeres', n1(FE.n20_sin_veces_sem) + ' veces', '—'],
  ], [44, 28, 28], { negritaCol0: true },
));
add(rica([
  ['La advertencia previa, que no es menor: ', true],
  ['el Anexo 31 no es un fondo disponible. Es una reclasificación de programas que ya existían, y más del 80 % se concentra en tres de ellos —beca de educación básica, servicios de salud del IMSS y pensión de adultas mayores—, con las tres pensiones del Bienestar sumando ' + n0(EX.anexo31_pensiones_mdp) + ' millones, el ' + n0(EX.anexo31_pensiones_pct) + ' % del total. Comparar contra esa cifra dice cuán grande es el problema, no cuánto dinero hay. El presupuesto realmente asignado a la dependencia que coordina el sistema es de ' + n0(FE.semujeres_mdp) + ' millones, y el subsidio de media jornada al 25 % de cobertura lo multiplica por ' + n1(FE.n20_sin_veces_sem) + '.'],
]));
add(caja('Qué se aprende al cambiar de escala', [
  [['A escala de ciudad, el subsidio parece imposible; a escala nacional, parece caro pero concebible. ', true],
   ['El ' + n1(pctPresu(SU.l20_sin_25_mdp)) + ' % del presupuesto de cuidados de la CDMX es una barrera infranqueable para un gobierno local. El ' + pct(FE.n20_sin_pct_anexo) + ' del Anexo 31 es una cifra que sí cabe en una discusión de política federal, porque el denominador es otro.']],
  [['Consecuencia para el proyecto: ', true], ['el interlocutor natural de un programa de cuidado domiciliario subsidiado no es únicamente el gobierno de la ciudad. Pero el proyecto tiene una práctica profesional local y un semestre, así que el piloto sigue siendo local. Lo que cambia es el argumento con el que se presenta: no «esto resuelve el problema», sino «esto mide, a escala pequeña, algo que la política federal necesita saber antes de escalar».']],
], AZUL));
add(p('Nivel de evidencia de este bloque: probable. La distribución de ingreso es nacional y se indexa a 2026 suponiendo que el ingreso de estos hogares creció como el índice de precios, lo cual es un supuesto y no un dato. El conteo de hogares de la Ciudad de México es la inferencia de la sección 3. La carga patronal de 22 % proviene de una calculadora de terceros y está pendiente de confirmar con la calculadora oficial del IMSS. Y el presupuesto citado es la solicitud de octubre de 2025, pendiente de contrastar con el decreto aprobado. Son cifras de orden de magnitud para discutir viabilidad, no un presupuesto.', { size: 18, color: C.TINTA3 }));

add(h2('5.4 Lo que cuesta el equipo del Observatorio'));
add(p('Este es el único de los cuatro rangos que el equipo no puede anclar hoy con una fuente verificada. Se presenta la estructura de puestos y la carga de trabajo, y se declara el vacío en lugar de rellenarlo con cifras inventadas.'));
add(tabla(
  ['Puesto', 'Qué sostiene', 'Dedicación', 'Rango salarial mensual'],
  [
    ['Coordinación del Observatorio', 'Prioriza análisis, responde a la institución receptora, sostiene la doble revisión', '1 persona, tiempo completo', 'POR DETERMINAR'],
    ['Análisis de datos', 'Ejecuta y mantiene los análisis 01 a 06, actualiza indicadores, documenta fichas de fuente', '1 persona, tiempo completo', 'POR DETERMINAR'],
    ['Ingeniería de datos y plataforma', 'Mantiene la base, las cargas periódicas y la plataforma de los dos perfiles', '1 persona, medio tiempo', 'POR DETERMINAR'],
    ['Protección de datos', 'Protocolo de gobernanza, avisos de privacidad, evaluación de riesgo de reidentificación', 'Asesoría externa por proyecto', 'POR DETERMINAR'],
    ['Verificación y formación de cuidadoras', 'Opera el perfil «Puedo cuidar»: verificación escalonada y seguimiento formativo', '1 persona por cada ~80 cuidadoras activas (SUPUESTO)', 'POR DETERMINAR'],
  ], [24, 36, 22, 18], { negritaCol0: true, izq: [1, 2] },
));
add(caja('Cómo cerrar este vacío, sin inventar', [
  'Dos fuentes verificables permiten anclar estos rangos, y ninguna se ha consultado todavía:',
  [['1. Tabulador de sueldos vigente del Gobierno de la Ciudad de México. ', true], ['Es información pública obligatoria y es el anclaje correcto si el pagador es público. El equipo intentó consultarlo el 22 de septiembre de 2026 y el archivo localizado corresponde a una administración anterior, así que no se usó. Hay que solicitarlo por el portal de transparencia.']],
  [['2. Encuesta Nacional de Ocupación y Empleo, por ocupación del SINCO. ', true], ['Permite estimar ingreso por ocupación con microdatos públicos, con el mismo rigor que ya se aplicó a la ENASIC. Es además la fuente pendiente para medir la oferta de personas cuidadoras remuneradas.']],
  [['Responsable sugerido: ', true], ['quien lleve Inteligencia de Negocios, porque el costo del equipo es parte de los indicadores de sostenibilidad que esa unidad curricular tiene que definir.']],
], AZUL));
add(salto());

// ════════════════════════════ 6 ════════════════════════════
add(h1('6. Modelo de sostenibilidad: tres escenarios de pagador'));
add(tabla(
  ['Escenario', 'Quién paga', 'Qué haría falta', 'Veredicto'],
  [
    ['A · Pago directo de la familia', 'El hogar, íntegro', 'Nada institucional; solo captar hogares', 'INVIABLE a salario formal. Alcanza al ' + pct(AS.legal_40_pct20) + ' de los hogares a jornada completa. Es el modelo de los dos cierres de la sección 4'],
    ['B · Copago con pagador público', 'Hogar + Gobierno de la CDMX o federación', 'Convenio con el Sistema Público de Cuidados local o con el Sistema Nacional y Progresivo de Cuidados; focalización auditable; padrón con protección de datos', 'VIABLE SOLO FOCALIZADO. Al 25 % de cobertura, media jornada consume el ' + n1(pctPresu(SU.l20_sin_25_mdp)) + ' % del presupuesto local o el ' + pct(FE.n20_sin_pct_anexo) + ' del Anexo 31 federal'],
    ['C · Pagador por costo evitado', 'Aseguradora, empresa empleadora o sistema de salud', 'Demostrar el costo que se evita: hospitalización, institucionalización o renuncia al empleo de la persona cuidadora', 'PROMETEDOR, SIN EVIDENCIA PROPIA. Es el modelo de Papa, Careship y Buurtzorg. Requiere una medición que el proyecto no tiene'],
  ], [20, 20, 30, 30], { negritaCol0: true, izq: [1, 2, 3] },
));
add(h3('Recomendación'));
add(rica([
  ['Escenario B para el piloto, escenario C como hipótesis a medir dentro de él. ', true],
  ['La Ley del Sistema de Cuidados de la Ciudad de México, promulgada el 2 de julio de 2026, obliga al gobierno de la ciudad a construir la contabilidad oficial del trabajo de cuidados no remunerado. Esa obligación es exactamente lo que el Observatorio produce, y es la mejor puerta de entrada institucional que tiene el proyecto: no se ofrece una aplicación, se ofrece la capacidad de medición que la ley exige y que hoy nadie tiene al nivel territorial que plantea.'],
]));
add(rica([
  ['Un argumento adicional que apareció esta semana. ', true],
  ['El Anexo Transversal 31 incluye a CONOCER —el organismo de certificación de competencias laborales— entre sus programas, bajo el objetivo de garantizar la pertinencia de los cuidados, con las personas cuidadoras como población objetivo. Eso significa que la certificación de personas cuidadoras ya es una línea presupuestada de la política federal, y que el perfil «Puedo cuidar» propuesto en la sección 2.3 se conecta con un instrumento que existe en lugar de inventar uno. La experiencia de ANA Care advierte, eso sí, que la certificación es el cuello de botella real: consiguió 32 acreditaciones CONOCER contra una meta de 90.'],
]));
add(p('El escenario C se mide dentro del piloto, no se promete antes: el indicador clave es si un hogar que recibe horas de cuidado reduce la probabilidad de que la persona cuidadora principal deje su empleo. Es una medición factible a escala pequeña, es el argumento que un pagador institucional entiende, y es honestamente incierta.'));
add(caja('Lo que el modelo de sostenibilidad NO debe prometer', [
  'Que el programa reduce hospitalizaciones. Ninguna referencia de la sección 4 lo demuestra con evidencia causal, y el reporte del BID sobre ANA Care afirma haberlo demostrado sin presentar datos.',
  'Que el programa se autofinancia con comisión sobre transacciones. Con una contratación actual de ' + pct(B.contrata_cui_nec) + ' entre hogares con necesidad, el volumen no existe.',
  'Que el programa genera empleo por el número de cuidadoras registradas. El proyecto del BID reportó 9 853 ofertas de empleo como empleos directos generados; es precisamente el error de medición que este proyecto debe evitar cometer.',
], OCRE));
add(salto());

// ════════════════════════════ 7 ════════════════════════════
add(h1('7. Economía unitaria del piloto'));
add(p('Todo lo que sigue son supuestos declarados, no estimaciones. Se presentan porque la unidad curricular exige un modelo de sostenibilidad con costos e ingresos, y porque un modelo con supuestos visibles se puede discutir, mientras que uno con cifras aparentemente sólidas no.'));
add(tabla(
  ['Concepto', 'Valor', 'Origen'],
  [
    ['Hogares atendidos en el piloto', 'POR DETERMINAR con la institución receptora', 'No se fija un número antes de tener sede'],
    ['Paquete base', '20 h/semana', 'Es el punto donde la asequibilidad todavía no colapsa (' + pct(AS.legal_20_pct20) + ')'],
    ['Costo laboral mensual por hogar', mx(SU.l20_con_costo), 'Piso legal más cuotas patronales · verificado'],
    ['Aportación del hogar', mx(SU.l20_con_costo - SU.l20_con_25), 'Residual tras el subsidio de la sección 5.3'],
    ['Subsidio mensual por hogar', mx(SU.l20_con_25), 'Calculado para cobertura del 25 % · script 06'],
    ['Costo de verificación y formación por cuidadora', 'POR DETERMINAR', 'Depende del esquema CONOCER; ANA Care logró 32 acreditaciones contra una meta de 90'],
    ['Costo de coordinación por hogar y mes', 'POR DETERMINAR', 'Depende de la nómina de la sección 5.4'],
    ['Punto de equilibrio', 'NO CALCULABLE HOY', 'Faltan los tres renglones anteriores'],
  ], [36, 26, 38], { negritaCol0: true, izq: [1, 2] },
));
add(rica([
  ['Por qué no se presenta un punto de equilibrio. ', true],
  ['Porque saldría de multiplicar supuestos por supuestos y tendría la apariencia de un resultado. Las reglas del proyecto lo prohíben con la misma claridad con la que prohíben inventar fuentes. El punto de equilibrio se calcula cuando existan la sede del piloto, el costo real de verificación y la nómina anclada, y no antes.'],
]));
add(salto());

// ════════════════════════════ 8 ════════════════════════════
add(h1('8. Riesgos y supuestos'));
add(tabla(
  ['Riesgo o supuesto', 'Qué pasa si falla', 'Cómo se prueba'],
  [
    ['SUPUESTO CENTRAL: la barrera es de confianza y norma familiar, no de precio', 'Todo el diseño del programa cambia. Si fuera precio, bastaría un cupón', 'Piloto: preguntar directamente a hogares que ya pagan trabajo doméstico por qué no pagan cuidado'],
    ['El ingreso de los hogares creció como el INPC entre 2022 y 2026', 'Las cifras de asequibilidad y subsidio se mueven en bloque', 'Contrastar con ENIGH 2024 cuando se revise esa fuente'],
    ['La carga patronal es de aproximadamente 22 %', 'Cambia el costo del paquete y el subsidio necesario', 'Calculadora oficial del IMSS para personas trabajadoras del hogar'],
    ['Las tasas nacionales son aplicables a la CDMX', 'El dimensionamiento cambia; la dirección del sesgo es conocida y subestima', 'No es verificable con las fuentes actuales. Se declara como inferencia'],
    ['Existirá una institución receptora para el piloto', 'No hay piloto, no hay diagnóstico situado, no hay medición de la barrera', 'Gestión inmediata. Es el riesgo mayor del proyecto'],
    ['El Gobierno de la CDMX tiene interés en la capacidad de medición', 'El escenario B se cae y queda solo el C, sin evidencia propia', 'Acercamiento a través del mandato de la Ley del Sistema de Cuidados'],
    ['RIESGO ÉTICO: el programa capta datos de población vulnerable', 'Daño real a personas mayores, con discapacidad y cuidadoras', 'Protocolo de protección de datos ANTES del primer contacto. No negociable'],
  ], [30, 33, 37], { negritaCol0: true, izq: [1, 2] },
));
add(salto());

// ════════════════════════════ 9 ════════════════════════════
add(h1('9. Indicadores y plan de validación'));
add(p('El incidente crítico de Inteligencia de Negocios advierte contra medir solo crecimiento y rentabilidad, porque un modelo aparentemente exitoso puede no estar llegando a todos por igual. Los indicadores se organizan en tres bloques y ninguno tiene meta numérica todavía: fijar metas sin línea base es lo que ya se señaló como error en un documento previo del equipo.'));
add(tabla(
  ['Bloque', 'Indicador', 'Por qué este y no otro'],
  [
    ['Social', 'Proporción de hogares atendidos en el quintil de ingreso más bajo del piloto', 'Es el indicador que revela si el programa llega a quien más lo necesita o a quien más fácil lo contrata'],
    ['Social', 'Horas de cuidado no remunerado liberadas a la persona cuidadora principal', 'Es el mecanismo por el que el programa produce valor: devolver tiempo'],
    ['Social', 'Permanencia en el empleo de la persona cuidadora principal', 'Es el costo evitado que un pagador institucional puede reconocer (escenario C)'],
    ['Trabajo decente', 'Proporción de personas cuidadoras con pago igual o superior al piso legal e inscripción al IMSS', 'Un programa de cuidado que precariza el cuidado se refuta a sí mismo'],
    ['Trabajo decente', 'Proporción de personas cuidadoras con formación certificada', 'Responde a la razón de rechazo documentada: personal no capacitado y mal trato'],
    ['Operación', 'Tiempo entre solicitud del hogar y primera visita', 'Mide si el sistema sirve; no mide si sirve para algo'],
    ['Operación', 'Incidentes reportados y tiempo de respuesta', 'La verificación opcional da falsa confianza (caso Care.com)'],
    ['Sostenibilidad', 'Costo total por hogar atendido y mes, desglosado', 'Sin esto no hay punto de equilibrio posible (sección 7)'],
    ['Sostenibilidad', 'Proporción del costo cubierta por el hogar, por el pagador y por el programa', 'Hace visible la dependencia del subsidio, en lugar de esconderla'],
  ], [17, 41, 42], { negritaCol0: true, izq: [1, 2] },
));
add(caja('Lo que el piloto debe medir antes que nada', [
  'Antes de medir el desempeño del programa hay que medir el supuesto del que depende. La primera medición del piloto no es un indicador de servicio: es una pregunta a hogares que ya pagan trabajo doméstico y no pagan cuidado, sobre por qué.',
  'Si la respuesta dominante es precio, el programa se convierte en un mecanismo de subsidio y la plataforma es secundaria. Si es confianza, el programa se convierte en un sistema de verificación y formación, y la plataforma es central. Ambas respuestas son publicables. La que no es publicable es no haber preguntado.',
], GUINDA));
add(salto());

// ════════════════════════════ 10 ════════════════════════════
add(h1('10. Qué falta decidir'));
add(p('Ninguna de estas decisiones corresponde a este documento. Se listan para que la revisión del 26 de septiembre las tome de manera explícita y queden registradas en la bitácora con fecha y motivo.'));
add(num('Confirmar o rechazar el reencuadre del 20 de septiembre a la luz del análisis por quintil. Es la decisión de fondo: si el hallazgo central es precio o es norma familiar. Responsables: Daniel y Alondra Danae, por la regla de doble revisión.'));
add(num('Adoptar o rechazar la propuesta de valor reformulada de la sección 2.3, que conserva los dos perfiles obligatorios pero cambia su función.'));
add(num('Elegir escenario de sostenibilidad. La recomendación es B para el piloto y C como hipótesis a medir; hay que decidirlo, no heredarlo.'));
add(num('Asignar responsable para conseguir la institución receptora del piloto, con fecha límite. Es el riesgo mayor del proyecto y hoy no tiene dueño.'));
add(num('Adoptar o rechazar la regla propuesta el 22 de septiembre: los resúmenes generados con inteligencia artificial sirven como guía de lectura, nunca como fuente citable ni como origen de una cifra.'));
add(num('Asignar responsable para anclar la nómina del Observatorio con el tabulador vigente de la CDMX o con la ENOE (sección 5.4).'));
add(num('Asignar responsable para levantar la ficha de fuente del SIDECU y del Mapa de Cuidados de México, y determinar si sus datos son descargables. Si lo son, resuelven el componente de oferta institucional que hoy se arma con el DENUE.'));
add(num('Decidir si el interlocutor del programa es únicamente el Gobierno de la Ciudad de México o también el Sistema Nacional y Progresivo de Cuidados, dado que el cambio de escala cambia la viabilidad del subsidio.'));
add(num('Decidir si el nombre de trabajo «Cuidar en casa» se adopta, se cambia o se pospone.'));
add(regla());
add(p('Este anexo no ha sido revisado por una segunda persona. Bajo la regla del proyecto, no está aprobado y ninguna de sus cifras debe presentarse como posición del equipo hasta que lo esté.', { italics: true, color: C.TINTA2 }));

const doc = new Document({
  creator: 'Equipo LCDN 7.º semestre · UNRC',
  title: 'Programa «Cuidar en casa» · Estudio de negocio',
  description: 'Segmento, precios, salarios y modelo de sostenibilidad. Generado desde _valores.json.',
  styles: estilos, numbering,
  sections: [{
    properties: propiedadesPagina,
    footers: { default: piePagina('Estudio de negocio · v0.2 · 26 de septiembre de 2026 ·') },
    children: hijos,
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync('Estudio_de_Negocio_Programa_Cuidado_v0.2.docx', b);
  console.log('✓ Estudio_de_Negocio_Programa_Cuidado_v0.2.docx ·', (b.length / 1024).toFixed(0), 'KB');
});
