/* Observatorio del Cuidado · js/vistas/indicadores-formulas.js
   «Cómo se calcula»: operación de cada indicador de la ficha (D.kpis), con los números de D cuando existen y, solo donde el modelo de
   Power BI tiene una medida propia, esa medida DAX copiada de PowerBI/generar_pbip.py.
   Alcance: el texto de la operación está escrito a mano a partir del diccionario (Analysis/matrices/diccionario_observatorio.csv), de las
   definiciones de build_datos.py y de los CSV de resultados; los números salen de D. Es una descripción, NO recalcula nada.
   La medida DAX del modelo no calcula el indicador: lee el valor que ya calculó el script en Python (CALCULATE + AVERAGE sobre un CSV).
   Pendiente de doble revisión (23 oct 2026).
   Importa de OBS: ent, fmt, mill
   Exporta a OBS:  formula (con .mm = MathML cuando el indicador es una fórmula) */
(function(){
  var ent=OBS.ent,fmt=OBS.fmt,mill=OBS.mill;
  var K=D.clave,CG=D.carga;
  var VAR='IC al 90 % por linealización de Taylor con estratos y UPM (EST_DIS, UPM_DIS).';
  var PERS='Σ FAC_CUI · 1[condición] ÷ Σ FAC_CUI · 1[universo] × 100';
  function den(e){return e.total_expandido/(e.pct/100)}
  function razon(e,n,d){return '≈ '+ent(e.total_expandido)+' ('+n+') ÷ ≈ '+mill(den(e))+' ('+d+') = '+fmt(e.pct)+' %'}
  function pisoRow(h){return D.relevo.filas.filter(function(r){return r.salario.indexOf('Piso')===0&&r.horas===h})[0]}
  var F={
    'Hogares con necesidad de cuidado':function(){return {
      op:'Hogares con al menos una persona con discapacidad o de 60 años y más ÷ total de hogares del país × 100',
      datos:'= '+fmt(D.tasa_necesidad_nal)+' % (tasa nacional, hogares expandidos)',
      nota:'Fuente: ENASIC 2022 (archivo 05, concepto «Tasa nacional de hogares con persona con discapacidad o 60+»). La ficha cita también el Censo 2020, pero esta cifra sale de la ENASIC.'}},
    'Grupo del problema':function(){var e=K.grupo_problema_salud3;return {
      op:'Σ FAC_CUI · 1[cuida a persona con discapacidad o 60+ ∧ HORAS ≥ 40 ∧ «no tuve necesidad» ∧ daño a la salud] ÷ Σ FAC_CUI · 1[cuida a persona con discapacidad o 60+] × 100',
      datos:razon(e,'personas del grupo','personas cuidadoras del universo'),
      dax:'(sin medida DAX: la cifra sale de resultados/29_grupo_problema_salud3.csv)',
      nota:'HORAS = P6_7 + P6_26 con tope de 168 (cada bloque topa en 98 h). «No tuve necesidad» = P6_45_09. Daño a la salud = salud física, cansancio o sueño (DANO_SALUD3, objetivo primario). Con «algún daño» (salud o trabajo, versión 1) el grupo era '+fmt(K.grupo_problema.pct)+' %. Script 29, sin doble revisión. '+VAR}},
    'Cuidado de alta intensidad':function(){var e=K.pesa_40;return {
      op:PERS.replace('condición','HORAS ≥ 40').replace('universo','cuida a persona con discapacidad o 60+'),
      datos:razon(e,'cuidan 40 h o más','personas cuidadoras del universo'),
      nota:'HORAS = P6_7 + P6_26, tope de 168; las horas más altas quedan subestimadas. '+VAR}},
    'Preferencia por cuidado en casa':function(){var e=D.preferencia[0];return {
      op:PERS.replace('condición','P6.46 = «en su casa»').replace('universo','cuida a persona con discapacidad o 60+'),
      datos:razon(e,'prefieren en su casa','personas cuidadoras del universo'),
      nota:'Es una preferencia declarada, no una contratación. '+VAR}},
    'Búsqueda de servicios':function(){var e=K.busco_todas;return {
      op:'Σ FAC_CUI · 1[P6.42 = sí buscó] ÷ Σ FAC_CUI × 100, todas las personas cuidadoras',
      datos:razon(e,'buscaron un servicio','todas las personas cuidadoras'),
      nota:VAR}},
    'Oferta declarada de cuidadoras':function(){var e=D.oferta_declarada.pob;return {
      op:'Σ w · 1[P6.47 = le gustaría trabajar como cuidador(a) si le pagaran] ÷ Σ w · 1[15 a 60 años] × 100',
      datos:razon(e,'dirían que sí','población de 15 a 60 años'),
      nota:'Intención declarada, no oferta real. w = factor de expansión de la población de 15 a 60 años. '+VAR}},
    'Oferta institucional registrada':function(){var t=D.territorio.totales;return {
      op:'Conteo simple (sin ponderar) de establecimientos del DENUE en las clases SCIAN del núcleo de cuidado: asilos + centros de día, CDMX',
      datos:'= '+ent(t.asilos)+' asilos + '+ent(t.centros_dia)+' centros de día = '+ent(t.asilos+t.centros_dia),
      nota:'Parte de los nombres no indica cuidado; la revisión manual está pendiente. Es un registro, no capacidad.'}},
    'Contratación de cuidado':function(){var e=D.contratacion.cuidado;return {
      op:'Σ w · 1[el hogar contrata enfermería o cuidadora] ÷ Σ w · 1[hogar con persona con discapacidad o 60+] × 100',
      datos:'≈ '+ent(e.total_expandido)+' hogares que contratan = '+fmt(e.pct)+' % de los hogares con necesidad (el denominador no se reconstruye: con un porcentaje tan bajo el redondeo lo distorsiona)',
      nota:'w = factor de expansión del hogar. '+VAR}},
    'Cobertura territorial oferta–necesidad':function(){return {
      op:'No se calcula. Sería oferta ÷ necesidad por alcaldía, pero solo si ambas miden la misma población.',
      datos:'Ningún par oferta–necesidad cumple la regla de compatibilidad (matrices/pares_oferta_necesidad.csv).',
      nota:'«Desconocido» es una respuesta válida: no se rellena con un supuesto.'}},
    'Daño por intensidad de cuidado':function(){var n=K.dano_salud3_40h,d=CG.sin_necesidad[2];return {
      op:'Σ FAC_CUI · 1[daño a la salud ∧ HORAS ≥ 40 ∧ «no tuve necesidad»] ÷ Σ FAC_CUI · 1[HORAS ≥ 40 ∧ «no tuve necesidad»] × 100',
      datos:'≈ '+ent(n.total_expandido)+' (con daño) ÷ ≈ '+ent(d.total_expandido)+' (con 40 h o más que dicen «no tuve necesidad») = '+fmt(n.pct)+' %',
      nota:'Es una asociación entre horas y daño declarado en una encuesta transversal, no causalidad. '+VAR}},
    'Costo de la jornada completa':function(){var r=pisoRow(40);return {
      op:'costo mensual = salario por hora × 40 h/semana × 4.33 semanas; indicador = costo mensual ÷ ingreso mensual mediano del hogar con necesidad × 100',
      datos:'salario por hora $'+fmt(r.salario_hora_2026,2)+' (salario mínimo profesional 2026 ÷ 8) → costo mensual $'+ent(r.costo_mensual_2026)+' = '+fmt(r.pct_ingreso_mediano)+' % del ingreso mediano',
      nota:'Sin prestaciones, carga patronal ni hora nocturna: el costo real es mayor. Mediana sin varianza de diseño.'}},
    'Asequibilidad del relevo (6 h/sem)':function(){var r=pisoRow(6);return {
      op:'Σ w · 1[costo mensual de 6 h/semana ÷ ingreso mensual del hogar ≤ 20 %] ÷ Σ w · 1[hogar con necesidad] × 100',
      datos:'costo mensual de 6 h = $'+ent(r.costo_mensual_2026)+' → '+fmt(r.u20)+' % de los hogares lo cubre sin rebasar el 20 % de su ingreso',
      dax:'CALCULATE(AVERAGE(asequibilidad[pct_hogares]), REMOVEFILTERS(asequibilidad), asequibilidad[fuente_ingreso] = "ENASIC · nacional", asequibilidad[salario_corto] = "Piso legal", asequibilidad[horas] = 6, asequibilidad[umbral_orden] = 20)',
      nota:'El tope del 20 % es una convención del equipo, no un estándar oficial. Poder pagar no es querer contratar. El ingreso de la ENASIC es cerca de la mitad del de la ENIGH.'}},
    'Asequibilidad del relevo (6 h/sem), CDMX':function(){var f=D.relevo_enigh.filas.filter(function(r){return r.dominio==='CDMX'&&r.salario.indexOf('Piso')===0&&r.horas===6})[0];return {
      op:'Σ w · 1[costo mensual de 6 h/semana ÷ ingreso monetario mensual del hogar ≤ 20 %] ÷ Σ w · 1[hogar con persona con discapacidad o 60+, CDMX] × 100',
      datos:f?'= '+fmt(f.u20)+' % (IC 90 %: '+fmt(f.u20_li)+' a '+fmt(f.u20_ls)+')':'',
      nota:'Ingreso monetario de la ENIGH 2022 en pesos de ago-2022. La ENIGH llega a entidad, no a alcaldía. '+VAR}},
    'Población en zonas de rezago social medio o mayor':function(){var c=D.territorio.rezago_calidad;return {
      op:'Σ población de las AGEB urbanas con grado de rezago medio, alto o muy alto ÷ Σ población de las AGEB urbanas válidas × 100',
      datos:'≈ '+ent(c.pob_medio_mas)+' personas ÷ ≈ '+mill(c.pob_medio_mas/0.09)+' (aprox. a partir del 9.0 % publicado) = 9.0 %',
      nota:'Se excluyen las '+c.suprimidas+' AGEB con datos suprimidos. Censo, no encuesta: sin varianza. Es contexto de vulnerabilidad, no necesidad de cuidado.'}},
    'Viviendas sin internet en las AGEB urbanas':function(){var s=D.tipologia.sin_internet_total;return {
      op:'Σ viviendas particulares habitadas sin internet ÷ Σ viviendas particulares habitadas, en AGEB urbanas de 100 habitantes o más × 100',
      datos:'≈ '+ent(s.viviendas)+' ÷ ≈ '+mill(s.viviendas/(s.pct/100))+' = '+fmt(s.pct)+' %',
      nota:'Censo 2020: la conectividad pudo cambiar desde entonces.'}},
    'Personas de 60+ en AGEB con brecha de oferta':function(){var b=D.tipologia.brecha_total;return {
      op:'Σ personas de 60+ de las AGEB que están a la vez en el cuartil alto de personas de 60+ y en el cuartil alto de distancia en línea recta a la residencia o centro de día más cercano',
      datos:'= '+ent(b.n_60)+' personas en '+ent(b.ageb)+' AGEB',
      nota:'Los cuartiles son un umbral convencional. La distancia es en línea recta: no mide capacidad, precio ni transporte.'}},
    'Pago observado a cuidadoras':function(){var p=D.pago.cuidadora;return {
      op:'mediana del pago por hora declarado (2022) × factor INPC 2022→2026',
      datos:'= $'+fmt(p.mediana,2)+' por hora (n = '+p.n+' hogares, sin ponderar; la mediana ponderada es $'+fmt(p.mediana_ponderada,2)+')',
      nota:'Muestra de menos de 30 casos: precisión baja. No controla horas ni tareas.'}},
    'Brecha de horas de cuidado por sexo (18–29 años)':function(){var b=D.brecha_sexo.filter(function(x){return x.edad==='18-29'})[0];return {
      op:'razón = horas semanales de cuidado de las mujeres ÷ horas semanales de los hombres, grupo de 18 a 29 años',
      datos:fmt(b.m,1)+' h ÷ '+fmt(b.h,1)+' h = '+fmt(b.razon,2)+' veces',
      nota:'Archivo del proyecto con productor y año sin documentar (08_brecha_cuidado_sexo.csv): tratarlo como probable.'}},
    'Satisfacción con el servicio buscado':function(){var e=K.cumplio;return {
      op:'Σ FAC_CUI · 1[el servicio cumplió lo que buscaba] ÷ Σ FAC_CUI · 1[buscó un servicio] × 100',
      datos:razon(e,'dicen que cumplió','personas cuidadoras que buscaron'),
      nota:VAR}},
    'Calidad del cuidado domiciliario':function(){return {
      op:'No se calcula: ninguna fuente del proyecto mide trato, capacitación ni incidentes del cuidado en casa.',
      datos:'Lo tendría que medir el piloto.',
      nota:'«Desconocido» es una respuesta válida.'}},
    'Cobertura de la regla "40 h o más"':function(){var g=D.modelo_v2.global.filter(function(r){return r.configuracion.indexOf('PRIMARIO')===0&&r.puntaje==='Regla >= 40 h'})[0];return {
      op:'cobertura = Σ w · 1[HORAS ≥ 40 ∧ daño a la salud, cansancio o sueño] ÷ Σ w · 1[daño a la salud, cansancio o sueño] × 100  (personas con el daño que la regla selecciona; DANO_SALUD3)',
      datos:'= '+fmt(g.cobertura)+' % (IC 90 %: '+fmt(g.cob_li90)+' a '+fmt(g.cob_ls90)+'); la regla selecciona al '+g.cupo+' del universo',
      dax:'(sin medida DAX: la cifra sale de resultados/27_v2_global.csv)',
      nota:'Versión 2 preregistrada (script 27): validación por UPM (5 × 20), métricas ponderadas con FAC_CUI. El daño es autodeclarado. No prueba que la regla sea mejor que un modelo. Sin doble revisión.'}}
  };

  /* ---- notación matemática (MathML nativo, sin librerías) ----
     Cada entrada de MM es la misma operación que el texto «op», dibujada como fracción. El texto se conserva como respaldo y como aria-label. */
  var esc=OBS.esc;
  function T(t){return '<mtext>'+esc(t)+'</mtext>'}
  function W(w){return '<mi class="ind-w">'+esc(w)+'</mi>'}
  function cnd(c){return typeof c==='string'?T(c):c.m}
  function grp(cs){return '<mrow><mo stretchy="true" symmetric="true">[</mo><mtable class="ind-mt" columnalign="left">'+cs.map(function(c,i){return '<mtr><mtd>'+(i?'<mo>∧</mo>':'')+cnd(c)+'</mtd></mtr>'}).join('')+'</mtable><mo stretchy="true" symmetric="true">]</mo></mrow>'}
  function S(w,cs){return '<mrow><mo>∑</mo>'+W(w)+'<mo>·</mo><mn>1</mn>'+grp(cs)+'</mrow>'}
  function fr(n,d,m){return '<mrow><mfrac>'+n+d+'</mfrac>'+(m?'<mo>×</mo><mn>'+m+'</mn>':'')+'</mrow>'}
  function R(w,nc,dc){return fr(S(w,nc),S(w,dc),100)}
  function SU(t){return '<mrow><mo>∑</mo>'+T(t)+'</mrow>'}
  var U='cuida a persona con discapacidad o 60+',HOG='hogar con persona con discapacidad o 60+';
  function leq20(costo,ing){return {m:'<mrow><mfrac>'+T(costo)+T(ing)+'</mfrac><mo>≤</mo><mn>20</mn><mo>%</mo></mrow>'}}
  var MM={
    'Hogares con necesidad de cuidado':function(){return fr(T('hogares con al menos una persona con discapacidad o 60+'),T('total de hogares del país'),100)},
    'Grupo del problema':function(){return R('FAC_CUI',[U,'horas ≥ 40','no tuve necesidad','algún daño'],[U])},
    'Cuidado de alta intensidad':function(){return R('FAC_CUI',[U,'horas ≥ 40'],[U])},
    'Preferencia por cuidado en casa':function(){return R('FAC_CUI',[U,'P6.46 = «en su casa»'],[U])},
    'Búsqueda de servicios':function(){return fr(S('FAC_CUI',['P6.42 = sí buscó']),'<mrow><mo>∑</mo>'+W('FAC_CUI')+'</mrow>',100)},
    'Oferta declarada de cuidadoras':function(){return R('w',['15 a 60 años','P6.47 = le gustaría trabajar como cuidador(a) si le pagaran'],['15 a 60 años'])},
    'Oferta institucional registrada':function(){return '<mrow><mi>N</mi><mo>=</mo><mo>∑</mo><mn>1</mn>'+grp(['establecimiento del DENUE en la CDMX','clase SCIAN de asilos o centros de día'])+'</mrow>'},
    'Contratación de cuidado':function(){return R('w',[HOG,'el hogar contrata enfermería o cuidadora'],[HOG])},
    'Daño por intensidad de cuidado':function(){return R('FAC_CUI',['horas ≥ 40','no tuve necesidad','algún daño'],['horas ≥ 40','no tuve necesidad'])},
    'Costo de la jornada completa':function(){return '<mtable columnalign="left"><mtr><mtd><mrow>'+T('costo mensual')+'<mo>=</mo>'+T('salario por hora')+'<mo>×</mo><mn>40</mn><mo>×</mo><mn>4.33</mn></mrow></mtd></mtr><mtr><mtd>'+fr(T('costo mensual'),T('ingreso mensual mediano del hogar'),100)+'</mtd></mtr></mtable>'},
    'Asequibilidad del relevo (6 h/sem)':function(){return R('w',[HOG,leq20('costo mensual de 6 h/semana','ingreso mensual del hogar')],[HOG])},
    'Asequibilidad del relevo (6 h/sem), CDMX':function(){return R('w',['hogar con persona con discapacidad o 60+, CDMX',leq20('costo mensual de 6 h/semana','ingreso monetario mensual del hogar')],['hogar con persona con discapacidad o 60+, CDMX'])},
    'Población en zonas de rezago social medio o mayor':function(){return fr(SU('población en AGEB con rezago medio, alto o muy alto'),SU('población en AGEB urbanas válidas'),100)},
    'Viviendas sin internet en las AGEB urbanas':function(){return fr(SU('viviendas sin internet'),SU('viviendas particulares habitadas'),100)},
    'Personas de 60+ en AGEB con brecha de oferta':function(){return '<mrow><mo>∑</mo>'+T('personas de 60+')+'<mo>·</mo><mn>1</mn>'+grp(['AGEB en el cuartil alto de personas de 60+','AGEB en el cuartil alto de distancia a la oferta'])+'</mrow>'},
    'Pago observado a cuidadoras':function(){return '<mrow>'+T('mediana')+'<mo>(</mo>'+T('pago por hora, 2022')+'<mo>)</mo><mo>×</mo>'+T('factor INPC 2022→2026')+'</mrow>'},
    'Brecha de horas de cuidado por sexo (18–29 años)':function(){return '<mrow>'+T('razón')+'<mo>=</mo><mfrac>'+T('horas semanales de las mujeres')+T('horas semanales de los hombres')+'</mfrac></mrow>'},
    'Satisfacción con el servicio buscado':function(){return R('FAC_CUI',['buscó un servicio','el servicio cumplió lo que buscaba'],['buscó un servicio'])},
    'Cobertura de la regla "40 h o más"':function(){return R('w',['algún daño','horas ≥ 40'],['algún daño'])}
  };
  /* devuelve {op, datos, dax, nota, mm} o null si el indicador no está en la tabla (así no se inventa nada) */
  OBS.formula=function(k){var f=F[k.nombre];if(!f)return null;try{var r=f(),m=MM[k.nombre];if(m)r.mm=m();return r}catch(e){return null}};
})();
