/* Observatorio del Cuidado · js/vistas/metodo.js
   Pestaña Método: modelos y la decisión que informa cada uno (14 oct 2026), inventario, pares oferta–necesidad,
   fichas, calidad, variables y diccionario (linaje y tabla expandible, 21 oct 2026).
   Importa de OBS: $, esc, fmt, ent
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,esc=OBS.esc,fmt=OBS.fmt,ent=OBS.ent;

  /* Contenido de las tres decisiones (22 oct 2026). Todo sale de D, que sale de Analysis/resultados: no hay cifras escritas a mano.
     «¿En qué orden?» no tiene modelo y la página lo dice. */
  function contenido(){
    var T=D.tipologia,M2=D.modelo2,G=D.modelo.global;
    function sg(x){return (x<0?'−':'+')+fmt(Math.abs(x))}
    function barras(f,max,hi){return f.map(function(r,i){return '<div class="mdx-b"><span class="mdx-l">'+esc(r[0])+'</span><span class="mdec-bt"><i'+(i===hi?' class="mdec-b-m"':'')+' style="--w:'+(100*r[1]/max).toFixed(1)+'%"></i></span><b class="mdx-bv">'+r[2]+'</b></div>'}).join('')}
    function fila(l,t){return '<div class="mdec-r"><span><b>'+l+'</b> '+t+'</span></div>'}
    function chip(c,t){return '<span class="chip '+c+'">'+t+'</span>'}
    function gl(p){return G.filter(function(x){return x.puntaje===p})[0]}
    function grp(g,p){return D.modelo.grupos.filter(function(x){return x.dimension==='TIPO'&&x.grupo===g&&x.puntaje===p})[0]}
    function res(o){return M2.resumen.filter(function(x){return x.objetivo===o})[0]}

    /* 1 · ¿Dónde? — tipología de AGEB (notebook D, sección 18) */
    var ts=T.tipos.slice().sort(function(a,b){return b.pct_de_las_60-a.pct_de_las_60}), top=ts[0];
    var dt=T.decision.filter(function(d){return d.tipo===top.tipo})[0];
    function cmp(s){return T.comparacion.filter(function(c){return c.particion.indexOf(s)===0})[0]}
    var km=cmp('k-means'),cp=cmp('Índice CP1'),rg=cmp('Regla 60+');
    var k4=T.seleccion_k.filter(function(k){return k.k===4})[0];
    function rob(s){return T.robustez.filter(function(r){return r.variante.indexOf(s)===0})[0]}
    var ward=rob('Ward'),gmm=rob('Mezcla');
    var terc=T.decision.reduce(function(s,d){return s+d.ageb_brecha_terciles},0);
    var p1={chips:chip('ev','k-means · 4 tipos · CDMX')+chip('p-moderada','Pendiente de doble revisión'),
      dec:'La zona donde vive más gente de 60+ es la «'+esc(top.nombre)+'» (tipo '+top.tipo+'): '+fmt(top.pct_de_las_60)+' % de las personas de 60+ de la CDMX. Es la propuesta del notebook para el piloto; el equipo no la ha decidido. Y '+fmt(dt.pct_viv_sin_int)+' % de sus viviendas no tiene internet.',
      cap:'Personas de 60+ de la CDMX que viven en cada tipo de zona',
      viz:barras(T.tipos.map(function(t){return ['Tipo '+t.tipo+' · '+t.nombre,t.pct_de_las_60,fmt(t.pct_de_las_60)+' %']}),ts[0].pct_de_las_60,T.tipos.indexOf(top)),
      no:'Nada sobre personas: los datos son por AGEB, y la ENASIC no tiene AGEB, así que no se cruza con «¿A quién?». La brecha es distancia en línea recta al establecimiento núcleo del DENUE, sin precio ni cupo; el Censo es de marzo de 2020. Elegir un tipo no elige la sede.',
      dt:'Contra qué se comparó y qué tan firme es',
      det:fila('Alternativas simples.','Poder explicativo (R²) sobre las 9 variables: k-means '+fmt(km.r2_9_variables,2)+', índice de una dimensión (CP1) '+fmt(cp.r2_9_variables,2)+', regla de dos cortes (60+ × internet) '+fmt(rg.r2_9_variables,2)+'. El modelo agrega poco sobre el índice simple.')+
        fila('La CDMX es un gradiente.','La silueta con k = 4 ('+fmt(k4.silueta,2)+') apenas supera la de una referencia sin grupos ('+fmt(k4.silueta_nula_media,2)+'). Los tipos son una partición estable, no un descubrimiento.')+
        fila('Estabilidad.','Con otras submuestras coinciden (ARI '+fmt(km.ari_promedio,2)+') y al dejar fuera cada alcaldía coincide el '+fmt(T.dejar_fuera.coincidencia_ponderada)+' % (mínimo '+fmt(T.dejar_fuera.minima)+' %, '+esc(T.dejar_fuera.alcaldia_minima)+'). Con otro algoritmo ya no: Ward '+fmt(ward.ari,2)+', mezcla gaussiana '+fmt(gmm.ari,2)+'.')+
        fila('Brecha de oferta.',T.brecha_total.ageb+' AGEB con '+ent(T.brecha_total.n_60)+' personas de 60+ (cuartil superior de 60+ y de distancia a la vez). Con el tercil superior son '+terc+' AGEB: el umbral es una convención, no un dato.'),
      t:'territorio',b:'Ver el modelo en «¿Dónde?» →'};

    /* 2 · ¿A quién? — focalización (notebook B, sección 11; escalera y tarjeta: scripts 21 y 22) */
    var R=gl('Regla >= 40 h'),L=gl('Regresión logística'),B=gl('Gradient boosting');
    var rA=res('DANO_ALGUNO'),rF=res('DANO_SALUD_FISICA');
    var g60r=grp('Solo 60+ sin discapacidad','Regla >= 40 h'),g60l=grp('Solo 60+ sin discapacidad','Regresión logística');
    var FM=-10,FX=25;
    function fx(v){return (100*(v-FM)/(FX-FM)).toFixed(1)}
    function forest(r){var ok=r[2]>0||r[3]<0;
      return '<div class="mdx-f'+(ok?' ok':'')+'"><span class="mdx-l">'+esc(r[0])+'</span><span class="mdx-ft"><i class="mdx-fz" style="left:'+fx(0)+'%"></i><i class="mdx-fb" style="left:'+fx(r[2])+'%;width:'+(fx(r[3])-fx(r[2])).toFixed(1)+'%"></i><i class="mdx-fd" style="left:'+fx(r[1])+'%"></i></span><b class="mdx-bv">'+sg(r[1])+' ('+sg(r[2])+' a '+sg(r[3])+')</b></div>'}
    var fr=[['Algún daño · logística',L.dif_cobertura_vs_regla,L.dif_li90,L.dif_ls90],
            ['Algún daño · gradient boosting',B.dif_cobertura_vs_regla,B.dif_li90,B.dif_ls90],
            ['Salud física · logística',rF.dif_modelo,rF.dif_li,rF.dif_ls],
            ['Salud física · sin «le falta fuerza»',rF.dif_sin_fuerza,rF.dif_sin_fuerza_li,rF.dif_sin_fuerza_ls]];
    var p2={chips:chip('ev','Logística y boosting · nacional')+chip('p-moderada','Pendiente de doble revisión'),
      dec:'Hoy basta la regla «40 horas o más»: encuentra el '+fmt(R.cobertura)+' % de las personas con algún daño (IC 90 %: '+fmt(R.cobertura_li90)+' a '+fmt(R.cobertura_ls90)+'). La regresión logística suma '+sg(L.dif_cobertura_vs_regla)+' pp, con IC de '+sg(L.dif_li90)+' a '+sg(L.dif_ls90)+': no se distingue de cero.',
      cap:'Cobertura extra frente a la regla, con IC 90 % (puntos porcentuales)',
      viz:fr.map(forest).join('')+'<div class="mdx-ax"><span style="left:'+fx(0)+'%">0</span><span style="left:'+fx(10)+'%">+10</span><span style="left:'+fx(20)+'%">+20</span></div>',
      no:'No prueba que el modelo no sirva: con esta muestra no se puede distinguir de la regla. Con «daño a la salud física» sí hay ventaja ('+sg(rF.dif_modelo)+' pp), pero depende de «le falta fuerza física»: sin esa variable el IC incluye 0. El objetivo se fijó después de ver resultados (DEC-OBJ-001): no es un preregistro. Datos nacionales (ENASIC 2022), no de la CDMX.',
      dt:'Contra qué se comparó y dónde falla',
      det:fila('Misma tasa de selección.','Regla y modelos eligen cerca del '+fmt(R.tasa_seleccion)+' % de las cuidadoras. El AUC sí sube (regla '+fmt(R.auc_ponderado,2)+', logística '+fmt(L.auc_ponderado,2)+', gradient boosting '+fmt(B.auc_ponderado,2)+'), pero la cobertura con ese cupo sube poco y el IC incluye 0.')+
        fila('Dónde falla el modelo.','En «solo 60+ sin discapacidad» la regla cubre el '+fmt(g60r.cobertura)+' % y la logística el '+fmt(g60l.cobertura)+' %. Elegir entre ambos es una decisión de política, no solo de métrica.')+
        fila('Tarjeta de puntos (script 22).','Versión transparente con puntos enteros: en ninguna de sus tres variantes supera de forma demostrable a la regla.')+
        fila('Límite de medición.','Actividades básicas y tareas clínicas no se preguntaron a casi todas las cuidadoras de «solo 60+ sin discapacidad»: cualquier puntaje que las use las deja fuera por construcción.'),
      t:'focalizacion',b:'Ver el modelo en «¿A quién primero?» →'};

    /* 3 · ¿En qué orden? — sin modelo: regla de dos medidas (volumen y concentración) con sensibilidad (script 24, 24 oct 2026) */
    var PR=T.prioridad, pa=PR.alcaldias, tot=T.brecha_total.n_60;
    function lista(l){var n=l.map(function(a){return esc(a.alcaldia)});return n.length>1?n.slice(0,-1).join(', ')+' y '+n[n.length-1]:(n[0]||'')}
    function lvl(a){var e=a.etiqueta_modal;return a.nivel_modal===1?'Doble':a.nivel_modal===2?(e.indexOf('volumen')>0?'Solo volumen':'Solo concentración'):a.nivel_modal===3?'Brecha menor':'Sin brecha'}
    var n1=pa.filter(function(a){return a.nivel_modal===1}), n1e=n1.filter(function(a){return a.estable}),
        n2=pa.filter(function(a){return a.nivel_modal===2}), estab=pa.filter(function(a){return a.estable}).length;
    var p3={chips:chip('p-noest','Sin modelo')+chip('p-moderada','Regla sin pesos · pendiente de doble revisión'),
      dec:'Hoy no hay modelo para esta decisión: no existe un resultado observado contra el cual validarlo. Lo que hay es una regla sin pesos que cruza dos medidas: el volumen (personas de 60+ en AGEB con brecha de oferta) y la concentración (qué fracción de las personas de 60+ de la alcaldía son esas). '+
          (n1.length?'Quedan arriba en las dos: '+lista(n1)+'. '+(n1e.length?'Con los tres cortes y los tres tamaños de grupo probados ('+PR.combinaciones+' combinaciones) solo es así en '+lista(n1e)+'. ':'Ninguna lo es en las '+PR.combinaciones+' combinaciones. '):'')+
          (n2.length?'Arriba en una sola medida: '+n2.map(function(a){return esc(a.alcaldia)+' ('+(a.etiqueta_modal.indexOf('volumen')>0?'volumen':'concentración')+')'}).join(', ')+'.':''),
      cap:'Personas de 60+ en AGEB con brecha (cuartil), su peso en la alcaldía y nivel. Estabilidad: en cuántas de '+PR.combinaciones+' combinaciones de corte y tamaño de grupo queda en ese nivel',
      viz:'<div class="scroll-x"><table><thead><tr><th>Alcaldía</th><th class="n">Personas en brecha</th><th class="n">% de sus 60+</th><th>Nivel</th><th class="n">Estabilidad</th></tr></thead><tbody>'+
          pa.slice(0,8).map(function(a){return '<tr><td>'+esc(a.alcaldia)+'</td><td class="n">'+ent(a.n_60_brecha)+'</td><td class="n">'+fmt(a.pct_60_brecha)+' %</td><td>'+lvl(a)+'</td><td class="n">'+a.combinaciones_en_modal+'/'+PR.combinaciones+'</td></tr>'}).join('')+'</tbody></table></div>',
      no:'Un orden exacto. Lo que sostiene la regla es el nivel; dentro de un nivel el orden de la tabla es solo de presentación. Tampoco mide urgencia, capacidad ni precio: la brecha es relativa (cuartil superior de personas de 60+ y de distancia en línea recta, a la vez), no un déficit absoluto. Un índice con pesos solo se justifica si cambia lo que esta regla ya dice.',
      dt:'Qué hay y qué falta',
      det:fila('Lo que hay.',T.brecha_total.ageb+' AGEB con '+ent(tot)+' personas de 60+ en brecha con el cuartil ('+PR.ageb.n_tercil+' AGEB con el tercil, '+PR.ageb.n_quintil+' con el quintil). Con tres cortes y grupos de cabeza de 4, 5 y 6 alcaldías, '+estab+' de '+pa.length+' alcaldías quedan en el mismo nivel en las '+PR.combinaciones+' combinaciones; el resto cambia de nivel según el corte.')+
        fila('Dentro de cada alcaldía.','De las '+PR.ageb.n_cuartil+' AGEB en brecha con el cuartil, '+PR.ageb.cuartil_por_poco+' pasan el corte por menos de 10 % (en personas de 60+ o en distancia), y '+PR.ageb.n_3_cortes+' están en brecha con los tres cortes. Ordenar por alcaldía entera oculta eso: el servicio se instala en un punto.')+
        fila('Lo que no está resuelto.','Qué se va a atender (abrir un servicio, ubicar el piloto o enfocar difusión) y quién decide: sin eso ningún orden es defendible. Tampoco se cruza con la capacidad ni el precio de la oferta. Los cortes y el tamaño del grupo de cabeza son convenciones, no estándares.')+
        fila('Pregunta abierta del equipo.','¿Se adopta esta regla o se quiere un índice con pesos? Sin decisión. La regla se propuso el 24 oct 2026 y no tiene doble revisión.'),
      t:'territorio',b:'Ver las brechas por alcaldía →'};
    return [p1,p2,p3];
  }

  /* «Cada modelo responde a una decisión» (20 oct 2026): quedan solo el selector y las tres decisiones; el contenido de cada decisión se escribió el 22 oct 2026 (función contenido, abajo) y sale de D.
     Se quitaron las vistas «Videojuego» y «Trío» y su interruptor. Respaldo: _to_delete/backup_pre_quitar_vistas_2026-10-20/ */
  (function(){
    var O=[
      {img:'metodo_piloto',alt:'Ilustración: una mujer pensativa mira una maqueta de barrios con edificios al centro y casas en las orillas',q:'¿Dónde hacer el piloto?',corto:'¿Dónde?',tint:'#ece6ff'},
      {img:'metodo_relevo',alt:'Ilustración: cinco mujeres cuidadoras y una persona mayor con bolsas de mandado, una laptop, una silla de ruedas y una silla vacía',q:'¿A quién ofrecer primero el relevo?',corto:'¿A quién?',tint:'#dff3ec'},
      {img:'metodo_zonas',alt:'Ilustración: dos mujeres y una persona mayor con bastón miran una maqueta con tres zonas: edificios, casas y campo',q:'¿En qué orden atender las zonas?',corto:'¿En qué orden?',tint:'#fbeedd'}];
    var C=contenido();
    var calma=window.matchMedia('(prefers-reduced-motion: reduce)').matches, anim=!calma&&('IntersectionObserver' in window);
    var cont=$('#modDec');
    var tabs=O.map(function(o,i){return '<button type="button" role="tab" class="mdec-tab" id="mdt'+i+'" aria-controls="mdp'+i+'" aria-selected="false" tabindex="-1"><span class="mdec-tn">'+(i+1)+'</span><span class="mdec-tt">'+o.corto+'</span></button>'}).join('');
    var imgs=O.map(function(o){return '<img class="mdec-im" src="ilustraciones/'+o.img+'.webp" alt="'+o.alt+'" decoding="async">'}).join('');
    var panels=O.map(function(o,i){return '<section class="mdec-pn" role="tabpanel" id="mdp'+i+'" aria-labelledby="mdt'+i+'" hidden>'+
      '<h3 class="mdec-q">'+o.q+'</h3><div class="mdec-st">'+C[i].chips+'</div><p class="mdec-dec">'+C[i].dec+'</p>'+
      '<div class="mdec-viz"><span class="mdec-cap">'+C[i].cap+'</span>'+C[i].viz+'</div>'+
      '<div class="mdec-no"><span class="mdec-l">Qué no permite afirmar</span><p>'+C[i].no+'</p></div>'+
      '<details class="mdec-det"><summary>'+C[i].dt+'</summary>'+C[i].det+'</details>'+
      '<button type="button" class="fr-go" data-goto="'+C[i].t+'">'+C[i].b+'</button></section>'}).join('');
    cont.innerHTML='<div class="mdec-sel"><div class="mdec-tabs" role="tablist" aria-label="Decisiones que informa cada modelo">'+tabs+'<span class="mdec-ind" aria-hidden="true"></span></div>'+
      '<div class="mdec-stage"><div class="mdec-scene"><div class="mdec-tilt">'+imgs+'</div><span class="mdec-cnt" aria-hidden="true"><b>1</b>/'+O.length+'</span>'+
      '<div class="mdec-nav"><button type="button" class="mdec-ar" data-d="-1" aria-label="Decisión anterior">‹</button><button type="button" class="mdec-ar" data-d="1" aria-label="Decisión siguiente">›</button></div></div>'+
      '<div class="mdec-pw">'+panels+'</div></div></div>';
    var root=cont.querySelector('.mdec-sel'), T=[].slice.call(root.querySelectorAll('.mdec-tab')), M=[].slice.call(root.querySelectorAll('.mdec-im')), P=[].slice.call(root.querySelectorAll('.mdec-pn')),
        ind=root.querySelector('.mdec-ind'), scene=root.querySelector('.mdec-scene'), cnt=root.querySelector('.mdec-cnt b'), cur=-1, visto=!anim;
    if(anim)cont.classList.add('mdec-js');
    function arranca(p){p.classList.remove('in');p.classList.add('rs');void p.offsetWidth;p.classList.remove('rs');p.classList.add('in')}
    function ir(i,foco){
      i=(i+O.length)%O.length; if(i===cur)return; cur=i;
      T.forEach(function(t,j){var on=j===i;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;t.classList.toggle('on',on)});
      M.forEach(function(m,j){m.style.setProperty('--k',j-i);m.classList.toggle('on',j===i)});
      P.forEach(function(p,j){p.hidden=j!==i});
      scene.style.setProperty('--tint',O[i].tint); cnt.textContent=i+1;
      ind.style.width=T[i].offsetWidth+'px'; ind.style.transform='translateX('+T[i].offsetLeft+'px)';
      if(visto)arranca(P[i]); if(foco)T[i].focus();
    }
    T.forEach(function(t,i){t.addEventListener('click',function(){ir(i)})});
    root.querySelector('.mdec-tabs').addEventListener('keydown',function(e){var k=e.key; if(k==='ArrowRight'||k==='ArrowDown'){e.preventDefault();ir(cur+1,true)}else if(k==='ArrowLeft'||k==='ArrowUp'){e.preventDefault();ir(cur-1,true)}else if(k==='Home'){e.preventDefault();ir(0,true)}else if(k==='End'){e.preventDefault();ir(O.length-1,true)}});
    [].forEach.call(root.querySelectorAll('.mdec-ar'),function(b){b.addEventListener('click',function(){ir(cur+(+b.dataset.d))})});
    /* el indicador se mide cuando el bloque es visible (la pestaña Método arranca oculta y todo mide 0) */
    function coloca(){if(cur<0||!T[cur].offsetWidth)return;ind.style.width=T[cur].offsetWidth+'px';ind.style.transform='translateX('+T[cur].offsetLeft+'px)'}
    if('ResizeObserver' in window)new ResizeObserver(coloca).observe(root);else window.addEventListener('resize',coloca);
    ir(0);
    if(anim){var io=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){io.disconnect();visto=true;arranca(P[cur])}},{threshold:.25});io.observe(root)}
    else{P.forEach(function(p){p.classList.add('in')})}
    if(!calma&&window.matchMedia('(hover:hover)').matches){var tl=root.querySelector('.mdec-tilt');
      scene.addEventListener('pointermove',function(e){var b=scene.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;tl.style.setProperty('--ry',(x*9).toFixed(2)+'deg');tl.style.setProperty('--rx',(-y*7).toFixed(2)+'deg')});
      scene.addEventListener('pointerleave',function(){tl.style.setProperty('--ry','0deg');tl.style.setProperty('--rx','0deg')})}
  })();
  $('#tinv tbody').innerHTML=D.inventario.map(function(r){return '<tr><td class="mono">'+esc(r.id)+'</td><td style="min-width:240px"><b>'+esc(r.fuente)+'</b></td><td style="min-width:140px">'+esc(r.emisor)+'</td><td style="min-width:140px">'+esc(r.desagregacion_geografica_maxima)+'</td><td style="min-width:110px">'+esc(r.periodo_cubierto)+'</td><td style="min-width:160px">'+esc(r.estado_evidencia)+'</td></tr>'}).join('');
  $('#tpares tbody').innerHTML=D.pares.map(function(p){return '<tr><td>'+esc(p.id_oferta)+'</td><td>'+esc(p.id_necesidad)+'</td><td>'+esc(p.poblacion_compatible)+'</td><td>'+esc(p.territorio_compatible)+'</td><td>'+esc(p.unidad_compatible)+'</td><td>'+esc(p.periodo_compatible)+'</td><td><b>'+esc(p.decision)+'</b><div class="muted" style="font-size:11.5px">'+esc(p.motivo)+'</div></td></tr>'}).join('');
  $('#tfichas tbody').innerHTML=D.fichas.map(function(f){return '<tr><td><b>'+esc(f.archivo)+'</b></td><td>'+esc(f.unidad_observacion)+'</td><td>'+esc(f.medida)+'</td><td>'+esc(f.anio)+'</td><td>'+esc(f.productor)+'</td></tr>'}).join('');
  $('#calidad').innerHTML=D.calidad_datos.map(function(c){return '<li><b>'+esc(c.archivo)+':</b> '+esc(c.chequeo)+' = '+esc(c.valor)+'. '+esc(c.nota)+'.</li>'}).join('');
  var VARS=[['Horas de cuidado','Horas semanales (tope 168)','P6.7 + P6.26'],['Actividades básicas','Comer, vestir, pañales, bañar, acostar','P6.2.01–04, 08'],['Tareas clínicas','Medicamentos, curaciones, terapia, tratamientos','P6.2.10–13'],['Cuida discapacidad','Frente a solo 60+','FILTRO6.1'],['Cuida menores','Además a menores de 18','FILTRO6.2–6.3'],['Años cuidando','Solo bloque de discapacidad','P6.6.1'],['Capacitación','Recibió capacitación','P6.3 / P6.23'],['Apoyo de la familia','Apoyo económico','P6.8 / P6.27'],['Requiere apoyo','Necesita que otra persona le ayude','P6.9.4 / P6.28.4'],['Falta de fuerza','Le falta fuerza física','P6.9.1 / P6.28.1'],['Sexo, edad, escolaridad','Datos de registro','SEXO, EDAD, NIVEL'],['Quintil de ingreso','Mismos cortes que el script 04','THOGAR P3A.4–P3A.5']];
  $('#tvars tbody').innerHTML=VARS.map(function(v){return '<tr><td><b>'+v[0]+'</b></td><td>'+v[1]+'</td><td class="mono" style="font-size:11.5px">'+v[2]+'</td></tr>'}).join('');

  /* Diccionario (21 oct 2026): dos vistas que se intercalan con un botón.
     · Linaje: de qué variables sale cada una; al tocar una se iluminan sus ancestros.
     · Tabla: filas compactas que se expanden, con buscador y filtro por grupo.
     Todo sale de D.diccionario (Analysis/matrices/diccionario_observatorio.csv vía build_datos.py): aquí no se escribe ninguna definición. */
  (function(){
    var V=D.diccionario, N=V.length, idx={}, hijos=V.map(function(){return []});
    V.forEach(function(v,i){idx[v.nombre]=i});
    var padres=V.map(function(v){return (v.depende_de||[]).map(function(n){return idx[n]}).filter(function(j){return j!=null})});
    padres.forEach(function(ps,i){ps.forEach(function(p){hijos[p].push(i)})});
    var COL={'Universo y grupo':'#77689d','Intensidad':'#23806f','Daño':'#c0435a','Perfil':'#a9711a','Modelo':'#3d4a8c','Método':'#6b7088'};
    function col(g){return COL[g]||'#6b7088'}
    function corto(n){return n.replace(/\s*\(.*\)\s*$/,'')}
    var AV='<svg class="dic-av" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8 15 14H1z" fill="#a9711a"/><path d="M8 6v3.6M8 11.6v.1" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>';
    function ancestros(i,s){s=s||{};padres[i].forEach(function(p){if(!s[p]){s[p]=1;ancestros(p,s)}});return s}
    function descend(i,s){s=s||{};hijos[i].forEach(function(h){if(!s[h]){s[h]=1;descend(h,s)}});return s}
    var prof=V.map(function(){return -1});
    function hondo(i){if(prof[i]>=0)return prof[i];prof[i]=0;padres[i].forEach(function(p){prof[i]=Math.max(prof[i],hondo(p)+1)});return prof[i]}
    V.forEach(function(_,i){hondo(i)});
    var conect=V.map(function(_,i){return padres[i].length||hijos[i].length}), maxP=Math.max.apply(null,prof);
    /* columnas por profundidad; orden por baricentro para cruzar menos líneas */
    var cols=[]; for(var d=0;d<=maxP;d++)cols.push(V.map(function(_,i){return i}).filter(function(i){return conect[i]&&prof[i]===d}));
    function pos(){var p={};cols.forEach(function(c){c.forEach(function(i,k){p[i]=k/(c.length||1)})});return p}
    for(var it=0;it<3;it++){
      var p=pos(); for(d=1;d<cols.length;d++)cols[d].sort(function(a,b){return med(padres[a],p)-med(padres[b],p)});
      p=pos(); cols[0].sort(function(a,b){return med(hijos[a],p)-med(hijos[b],p)});
    }
    function med(l,p){return l.length?l.reduce(function(s,j){return s+p[j]},0)/l.length:0}
    var sueltas=V.map(function(_,i){return i}).filter(function(i){return !conect[i]});

    var box=$('#dicLinaje'), tab=$('#dicTabla'), lst=$('#dicList'), det;
    function nodo(i,cls){var v=V[i];return '<button type="button" class="dic-node'+(cls||'')+'" data-i="'+i+'" aria-pressed="false" style="--c:'+col(v.grupo)+'"><b>'+esc(corto(v.nombre))+(v.advertencia?AV:'')+'</b><span>'+esc(v.origen)+'</span></button>'}
    box.innerHTML='<div class="dic-graph"><svg class="dic-edges" aria-hidden="true"></svg>'+
      cols.map(function(c,d){return '<div class="dic-col"><p class="dic-ch">'+(d===0?'Desde el cuestionario':d===maxP?'Resultado':'Paso '+d)+'</p>'+c.map(function(i){return nodo(i)}).join('')+'</div>'}).join('')+'</div>'+
      (sueltas.length?'<div class="dic-sueltas"><p class="dic-ch">Sin dependencias dentro del diccionario</p><div>'+sueltas.map(function(i){return nodo(i,' sm')}).join('')+'</div></div>':'')+
      '<div class="dic-det" id="dicDet" aria-live="polite"></div>'+
      '<p class="dic-ley">'+Object.keys(COL).filter(function(g){return V.some(function(v){return v.grupo===g})}).map(function(g){return '<span><i style="background:'+col(g)+'"></i>'+esc(g)+'</span>'}).join('')+'<span>'+AV+'Tiene una advertencia</span></p>';
    det=$('#dicDet');
    var graph=box.querySelector('.dic-graph'), svg=box.querySelector('.dic-edges'), B=[].slice.call(box.querySelectorAll('.dic-node')), sel=-1;
    var E=[]; padres.forEach(function(ps,i){ps.forEach(function(p){E.push([p,i])})});
    function dibuja(){
      var g=graph.getBoundingClientRect(); if(!g.width)return;
      var vert=graph.offsetWidth<620; graph.classList.toggle('vert',vert);
      g=graph.getBoundingClientRect();
      /* k = zoom de .content (layout.css): getBoundingClientRect devuelve px de pantalla y el SVG vive en px locales; sin dividir, las líneas se pasan de largo */
      var k=(graph.offsetWidth&&g.width/graph.offsetWidth)||1, W=g.width/k, H=g.height/k;
      svg.setAttribute('viewBox','0 0 '+W+' '+H); svg.style.width=W+'px'; svg.style.height=H+'px';
      function r(i){var b=graph.querySelector('.dic-node[data-i="'+i+'"]').getBoundingClientRect();return {l:(b.left-g.left)/k,t:(b.top-g.top)/k,w:b.width/k,h:b.height/k}}
      svg.innerHTML=E.map(function(e){var a=r(e[0]),b=r(e[1]),dd;
        if(vert){var x1=a.l+a.w/2,y1=a.t+a.h,x2=b.l+b.w/2,y2=b.t,m=(y2-y1)/2;dd='M'+x1+' '+y1+'C'+x1+' '+(y1+m)+' '+x2+' '+(y2-m)+' '+x2+' '+y2}
        else{var X1=a.l+a.w,Y1=a.t+a.h/2,X2=b.l,Y2=b.t+b.h/2,M=(X2-X1)/2;dd='M'+X1+' '+Y1+'C'+(X1+M)+' '+Y1+' '+(X2-M)+' '+Y2+' '+X2+' '+Y2}
        return '<path data-e="'+e[0]+'-'+e[1]+'" d="'+dd+'"/>'}).join('');
      pinta();
    }
    function pinta(){
      if(sel<0){box.classList.remove('foco');return}
      var an=ancestros(sel),de=descend(sel); box.classList.add('foco');
      B.forEach(function(b){var i=+b.dataset.i;b.classList.toggle('on',i===sel||!!an[i]);b.classList.toggle('des',!!de[i]);b.setAttribute('aria-pressed',String(i===sel))});
      [].forEach.call(svg.querySelectorAll('path'),function(p){var e=p.dataset.e.split('-').map(Number);
        p.classList.toggle('on',!!((e[1]===sel||an[e[1]])&&(an[e[0]]||e[0]===sel))); p.classList.toggle('des',!!((e[0]===sel||de[e[0]])&&de[e[1]]))});
    }
    function liga(l){return l.length?l.map(function(j){return '<button type="button" class="dic-lk" data-i="'+j+'">'+esc(corto(V[j].nombre))+'</button>'}).join(''):'<span class="muted">—</span>'}
    function elige(i){
      sel=i; pinta(); var v=V[i];
      det.innerHTML='<div class="dic-dh"><b style="--c:'+col(v.grupo)+'">'+esc(v.nombre)+'</b><span class="chip" style="background:'+col(v.grupo)+'1f;color:'+col(v.grupo)+'">'+esc(v.grupo)+'</span></div>'+
        '<p>'+esc(v.definicion)+'</p>'+(v.advertencia?'<p class="dic-adv">'+AV+esc(v.advertencia)+'</p>':'')+
        '<dl><dt>Origen</dt><dd class="mono">'+esc(v.origen)+'</dd><dt>Se construye con</dt><dd>'+liga(padres[i])+'</dd><dt>Alimenta a</dt><dd>'+liga(hijos[i])+'</dd></dl>'+
        '<button type="button" class="dic-ir" data-i="'+i+'">Ver en la tabla →</button>';
    }
    box.addEventListener('click',function(e){var b=e.target.closest('[data-i]');if(!b)return;var i=+b.dataset.i;
      if(b.classList.contains('dic-ir')){vista('tabla');abre(i);return} elige(i)});
    if('ResizeObserver' in window)new ResizeObserver(dibuja).observe(graph);else window.addEventListener('resize',dibuja);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(dibuja); /* al cargar la tipografía cambian las alturas de las tarjetas */
    elige(cols[maxP][0]);

    /* Tabla expandible */
    lst.innerHTML=V.map(function(v,i){return '<li><details class="dic-row" data-i="'+i+'" style="--c:'+col(v.grupo)+'"><summary>'+
      '<b class="mono">'+esc(v.nombre)+'</b><span class="dic-def">'+esc(v.definicion)+'</span>'+
      '<span class="dic-meta"><span class="chip" style="background:'+col(v.grupo)+'1f;color:'+col(v.grupo)+'">'+esc(v.grupo)+'</span>'+(v.advertencia?'<span title="'+esc(v.advertencia)+'">'+AV+'</span>':'')+'</span></summary>'+
      '<div class="dic-body">'+(v.advertencia?'<p class="dic-adv">'+AV+esc(v.advertencia)+'</p>':'')+
      '<dl><dt>Regla</dt><dd class="mono">'+esc(v.origen)+'</dd><dt>Unidad</dt><dd>'+esc(v.unidad_o_grano)+'</dd><dt>Factor de expansión</dt><dd class="mono">'+esc(v.factor_de_expansion)+'</dd>'+
      '<dt>Se calcula en</dt><dd class="mono">'+esc(v.archivo)+'</dd><dt>Se construye con</dt><dd>'+liga(padres[i])+'</dd><dt>Alimenta a</dt><dd>'+liga(hijos[i])+'</dd></dl>'+
      '<button type="button" class="dic-ir dic-al" data-i="'+i+'">Ver en el linaje →</button></div></details></li>'}).join('');
    var grupos=Object.keys(COL).filter(function(g){return V.some(function(v){return v.grupo===g})}), fg='';
    $('#dicChips').innerHTML='<button type="button" aria-pressed="true" data-g="">Todas <span>'+N+'</span></button>'+grupos.map(function(g){return '<button type="button" aria-pressed="false" data-g="'+esc(g)+'" style="--c:'+col(g)+'">'+esc(g)+' <span>'+V.filter(function(v){return v.grupo===g}).length+'</span></button>'}).join('');
    function sinAc(s){return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
    function filtra(){var q=sinAc($('#dicQ').value.trim()),n=0;
      [].forEach.call(lst.children,function(li,i){var v=V[i],ok=(!fg||v.grupo===fg)&&(!q||sinAc([v.nombre,v.definicion,v.origen,v.advertencia,v.archivo].join(' ')).indexOf(q)>=0);li.hidden=!ok;if(ok)n++});
      $('#dicVacio').hidden=n>0}
    $('#dicQ').addEventListener('input',filtra);
    $('#dicChips').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;fg=b.dataset.g;
      [].forEach.call(this.children,function(x){x.setAttribute('aria-pressed',x===b)});filtra()});
    lst.addEventListener('click',function(e){var b=e.target.closest('.dic-lk,.dic-ir');if(!b)return;e.preventDefault();var i=+b.dataset.i;
      if(b.classList.contains('dic-al')){vista('linaje');elige(i);box.scrollIntoView({block:'nearest',behavior:'smooth'});return} abre(i)});
    function abre(i){var d=lst.querySelector('.dic-row[data-i="'+i+'"]');if(d.parentNode.hidden){$('#dicQ').value='';fg='';[].forEach.call($('#dicChips').children,function(x){x.setAttribute('aria-pressed',x.dataset.g==='')});filtra()}
      d.open=true;d.scrollIntoView({block:'center',behavior:'smooth'});d.classList.remove('flash');void d.offsetWidth;d.classList.add('flash')}

    /* Interruptor de vista; se recuerda por navegador (si el almacenamiento falla, arranca en Linaje) */
    var SW=[].slice.call(document.querySelectorAll('#dicVista button'));
    function vista(v){SW.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.v===v)});box.hidden=v!=='linaje';tab.hidden=v!=='tabla';
      try{localStorage.setItem('obs-dic-vista',v)}catch(e){} if(v==='linaje')dibuja()}
    SW.forEach(function(b){b.addEventListener('click',function(){vista(b.dataset.v)})});
    var ini='linaje'; try{ini=localStorage.getItem('obs-dic-vista')||ini}catch(e){} vista(ini==='tabla'?'tabla':'linaje');
  })();
  $('#dicLink').textContent=D.diccionario_fuente; $('#dicLink').href='../../'+D.diccionario_fuente;
})();
