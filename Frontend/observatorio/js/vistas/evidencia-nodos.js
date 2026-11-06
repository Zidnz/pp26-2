/* Observatorio del Cuidado · js/vistas/evidencia-nodos.js (6 nov 2026)
   Mapa de nodos de evidencia_modelo.html: la comparación de la regla de 40 h con modelos estadísticos, en cinco vistas de red.
   Mismo lenguaje que la red de RedCare (nodo, ficha, indicadores, partículas), en versión oscura.
   Ninguna cifra está escrita a mano: todo sale de D.modelo_v2 y D.diagnostico_v2 (los mismos datos y las mismas definiciones
   que js/vistas/focalizacion-v2.js). Las coordenadas son solo diseño. Los textos de lectura de las partes 1, 2, 4 y 5 se toman
   de las tarjetas con intervalos (que calcula focalizacion-v2.js); por eso este archivo se carga después de ese.
   Tamaño del nodo = área proporcional a la cifra; círculos punteados = intervalo de confianza al 90 %.
   Importa de OBS: esc, fmt   Exporta a OBS: — */
(function(){
  'use strict';
  var host=document.getElementById('evNodos');
  if(!host||typeof D==='undefined'||!D.modelo_v2||!D.diagnostico_v2||typeof OBS==='undefined') return;
  var V=D.modelo_v2, DG=D.diagnostico_v2, fmt=OBS.fmt, esc=OBS.esc;
  var C={obj:'#0b8a79',regla:'#3d4570',log:'#c46f00',tar:'#6d5bd0',azar:'#d6335a',gris:'#7b819c',sube:'#d6335a',baja:'#0b8a79',neu:'#3f6fd1'};
  var PRIM='PRIMARIO: DANO_SALUD3, predictores primarios';
  var COLP={'Regla >= 40 h':C.regla,'Logística':C.log,'Tarjeta de puntos':C.tar,'R2 a priori (>=40 h + >=2 ABVD)':C.gris,'Horas (continuo)':C.regla};
  var W=920,H=470,CX=460,CY=235;
  function sg(v,d){return (v>0?'+':v<0?'−':'')+fmt(Math.abs(v),d==null?1:d)}
  function nomT(p){return p.replace('>=','≥').replace('Logística','Regresión logística')}
  function corto(s,n){return s.length>n?s.slice(0,n-1)+'…':s}
  function lc(s){return s.charAt(0).toLowerCase()+s.slice(1)}
  function parte(s,max){if(s.length<=max)return [s,''];var i=s.lastIndexOf(' ',max);if(i<8)i=s.indexOf(' ',max);return i<0?[s,'']:[s.slice(0,i),s.slice(i+1)]}
  function f(v){return Math.round(v*10)/10}
  function pl(t){return '<span class="ev-pl">'+t+'</span>'}
  function q(id){var el=document.getElementById(id);return el?el.innerHTML:''}
  var g=V.global.filter(function(r){return r.configuracion===PRIM});
  function pick(p){return g.filter(function(r){return r.puntaje===p})[0]}
  var R=pick('Regla >= 40 h'),L=pick('Logística'),T=pick('Tarjeta de puntos'),DMD=L.dif_minima_detectable_pp;
  var AZAR=parseFloat(R.cupo),hayAz=isFinite(AZAR);
  function cero(r){return r.dif_li90<=0&&r.dif_ls90>=0}
  function anillo(i,n,rx,ry){var a=(-90+(360/n)*i)*Math.PI/180;return [CX+rx*Math.cos(a),CY+ry*Math.sin(a)]}
  function movimiento(){return !(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}

  /* ---------- Motor de dibujo ---------- */
  function lblPos(n){
    var m=n.lab||'below',r=n.r,two=n.sub?1:0,x=n.x,y,an='middle';
    if(m==='auto'){var dx=n.x-CX,dy=n.y-CY,d=Math.hypot(dx,dy)||1;m=Math.abs(dx)/d>.35?(dx>0?'right':'left'):(dy>0?'below':'above')}
    if(m==='below')y=n.y+r+16;
    else if(m==='above')y=n.y-r-9-(two?14:0);
    else{an=m==='right'?'start':'end';x=n.x+(m==='right'?1:-1)*(r+10);y=n.y+(two?-2:4)}
    return {x:x,y:y,an:an};
  }
  function dibuja(svg,G,sel){
    var N={},anim=movimiento(),e='',p='',l='',nd='';
    G.nodes.forEach(function(n){N[n.id]=n});
    G.edges.forEach(function(ed,i){
      var A=N[ed.a],B=N[ed.b],dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,
          sx=A.x+ux*(A.r+3),sy=A.y+uy*(A.r+3),ex=B.x-ux*(B.r+3),ey=B.y-uy*(B.r+3),cv=ed.curve==null?12:ed.curve,
          mx=(sx+ex)/2-uy*cv,my=(sy+ey)/2+ux*cv,d='M'+f(sx)+' '+f(sy)+' Q'+f(mx)+' '+f(my)+' '+f(ex)+' '+f(ey),c=ed.c||A.c;
      e+='<path class="ev-e'+(ed.dash?' dash':'')+(ed.dim?' dim':'')+'" d="'+d+'" style="--c:'+c+';stroke-width:'+(ed.w||1.8)+'"/>';
      if(anim&&ed.flow!==false&&!ed.dim)p+='<circle class="ev-p" r="2.6" style="--c:'+c+'"><animateMotion dur="'+(2.4+(i%4)*.5).toFixed(1)+'s" repeatCount="indefinite" path="'+d+'"/></circle>';
      if(ed.label){var t=ed.t||.5,k0=(1-t)*(1-t),k1=2*t*(1-t),k2=t*t,lx=k0*sx+k1*mx+k2*ex,ly=k0*sy+k1*my+k2*ey,w=ed.label.length*6.7+14;
        l+='<g class="ev-h" style="--c:'+c+'"><rect x="'+f(lx-w/2)+'" y="'+f(ly-9)+'" width="'+f(w)+'" height="18" rx="9"/><text x="'+f(lx)+'" y="'+f(ly+3.6)+'" text-anchor="middle">'+esc(ed.label)+'</text></g>'}
    });
    G.nodes.forEach(function(n){
      var s=sel===n.id,lp=lblPos(n),fs=Math.max(10,Math.min(16,n.r*.36)),cx=f(n.x),cy=f(n.y);
      nd+='<g class="ev-n'+(s?' sel':'')+(n.poco?' poco':'')+'" data-id="'+esc(n.id)+'" tabindex="0" role="button" aria-label="'+esc(n.aria||n.label||n.id)+'" style="--c:'+n.c+'">'+
        (n.halo?n.halo.map(function(h){return '<circle class="ev-halo" cx="'+cx+'" cy="'+cy+'" r="'+f(h)+'"/>'}).join(''):'')+
        (s?'<circle class="ev-pulse" cx="'+cx+'" cy="'+cy+'" r="'+f(n.r+6)+'"/>':'')+
        '<circle class="ev-c" cx="'+cx+'" cy="'+cy+'" r="'+f(n.r)+'"/>'+
        (n.v!=null?'<text class="ev-v" x="'+cx+'" y="'+f(n.v2?n.y-1:n.y+fs*.36)+'" font-size="'+f(fs)+'">'+esc(n.v)+'</text>':'')+
        (n.v2?'<text class="ev-v2" x="'+cx+'" y="'+f(n.y+fs*.9+2)+'">'+esc(n.v2)+'</text>':'')+
        (n.label?'<text class="ev-ln" x="'+f(lp.x)+'" y="'+f(lp.y)+'" text-anchor="'+lp.an+'">'+esc(n.label)+'</text>':'')+
        (n.label&&n.sub?'<text class="ev-ls" x="'+f(lp.x)+'" y="'+f(lp.y+14)+'" text-anchor="'+lp.an+'">'+esc(n.sub)+'</text>':'')+'</g>';
    });
    svg.innerHTML=e+p+l+nd;
  }
  function ficha(o){
    return '<div class="ev-top"><span class="ev-av" style="--c:'+o.c+'">'+esc(o.av)+'</span><div class="ev-id"><b>'+esc(o.name)+'</b><small>'+esc(o.small||'')+'</small></div>'+
      '<span class="ev-tag'+(o.tag[0]?' '+o.tag[0]:'')+'">'+esc(o.tag[1])+'</span></div><div class="ev-rows">'+
      o.rows.map(function(r){return '<div><i>'+r[0]+'</i><span>'+r[1]+'</span></div>'}).join('')+'</div>'+(o.nota?'<p class="ev-nota">'+o.nota+'</p>':'');
  }

  /* ---------- Vista 1: ¿qué método encuentra más a quien tiene el daño? ---------- */
  function vista1(){
    var rows=['Regla >= 40 h','Logística','Tarjeta de puntos'].map(pick),rad=function(c){return Math.sqrt(c)*5.2};
    var P={'Regla >= 40 h':[CX,282],'Logística':[165,350],'Tarjeta de puntos':[755,350]};
    var nodes=[{id:'obj',x:CX,y:68,r:42,c:C.obj,v:fmt(g[0].n_con_objetivo,0),v2:'con el daño',label:'Objetivo: daño a la salud',sub:'salud física, cansancio o sueño',lab:'left'}],edges=[];
    rows.forEach(function(r){var p=P[r.puntaje];
      nodes.push({id:r.puntaje,x:p[0],y:p[1],r:rad(r.cobertura),c:COLP[r.puntaje],v:fmt(r.cobertura,1)+'%',label:nomT(r.puntaje),sub:r.veredicto==='comparador'?'comparador':'modelo',lab:'below',halo:[rad(r.cob_li90),rad(r.cob_ls90)],aria:nomT(r.puntaje)});
      edges.push({a:'obj',b:r.puntaje,c:COLP[r.puntaje],w:1.4+r.cobertura/22});
      if(r.veredicto!=='comparador')edges.push({a:'Regla >= 40 h',b:r.puntaje,c:cero(r)?C.gris:C.sube,dash:true,flow:false,curve:r.puntaje==='Logística'?-16:16,label:sg(r.dif_vs_comparador_pp)+' pp'});
    });
    if(hayAz){nodes.push({id:'azar',x:745,y:112,r:rad(AZAR),c:C.azar,v:fmt(AZAR,1)+'%',label:'Elegir al azar',sub:'misma fracción de personas',lab:'below'});edges.push({a:'obj',b:'azar',c:C.azar,dash:true,w:1.4})}
    function info(id){
      if(id==='obj')return {av:'◎',c:C.obj,name:'Objetivo',small:'Lo que se busca encontrar',tag:['','Daño a la salud'],rows:[['Personas en la muestra',pl(g[0].n_muestra)],['Con el daño',pl(g[0].n_con_objetivo)],['Qué incluye','salud física, cansancio o sueño']],nota:'Solo con datos nacionales (ENASIC 2022): no permite concluir por alcaldía.'};
      if(id==='azar')return {av:'?',c:C.azar,name:'Elegir al azar',small:'Línea de referencia',tag:['alerta','Referencia'],rows:[['Encontraría a',pl(fmt(AZAR,1)+' %')+' <small>de quienes tienen el daño</small>']],nota:'Es lo que lograría elegir al azar a la misma fracción de personas que la regla.'};
      var r=pick(id),cmp=r.veredicto==='comparador',rr=[['Encuentra a',pl(fmt(r.cobertura,1)+' %')+' <small>de quienes tienen el daño</small>'],['Rango probable (IC 90 %)',pl(fmt(r.cob_li90,0)+' a '+fmt(r.cob_ls90,0)+' %')]];
      if(!cmp){rr.push(['Contra la regla',pl(sg(r.dif_vs_comparador_pp)+' pp')]);rr.push(['Rango probable',pl(sg(r.dif_li90)+' a '+sg(r.dif_ls90)+' pp')]);rr.push(['Lectura',cero(r)?'Incluye el cero: no se nota diferencia':'No incluye el cero: sí se nota diferencia'])}
      return {av:r.puntaje.charAt(0),c:COLP[id],name:nomT(id),small:cmp?'Regla actual':'Modelo estadístico',tag:cmp?['','Comparador']:cero(r)?['ok','Sin diferencia notable']:['alerta','Se separa de la regla'],rows:rr,nota:id==='Tarjeta de puntos'?'La tarjeta se retiró del prototipo.':(cmp?'Todo se compara contra esta regla.':'')};
    }
    return {G:{nodes:nodes,edges:edges},info:info,sel0:'Regla >= 40 h',find:q('q1Find'),
      leg:'<span><i class="o" style="--c:'+C.regla+'"></i>Tamaño = a cuántas personas con daño encuentra</span><span><i class="d"></i>Círculos punteados: rango probable (IC 90 %)</span><span><i class="l" style="--c:'+C.gris+'"></i>Línea gris: diferencia que no se nota</span><span><i class="l" style="--c:'+C.sube+'"></i>Roja: sí se nota</span>'};
  }

  /* ---------- Vista 2: ¿cambia con otros supuestos? ---------- */
  function vista2(){
    var CFG=[['PRIMARIO','Primaria (cupo de la regla)'],['Sens. cupo|10 %','Cupo 10 %'],['Sens. cupo|20 %','Cupo 20 %'],['Sens. A','Añade autopercepción'],['Sens. objetivo','Objetivo «algún daño»'],['Sens. sin personas','Sin quienes cuidan en ambos bloques'],['Sens. B','Solo discapacidad, + ABVD y clínicas']];
    function key(r){return r.configuracion.indexOf('PRIM')===0?'PRIMARIO':r.configuracion==='Sens. cupo'?'Sens. cupo|'+r.cupo:CFG.map(function(c){return c[0]}).filter(function(k){return r.configuracion.indexOf(k)===0})[0]}
    var data=V.global.filter(function(r){return r.veredicto!=='comparador'}),nodes=[{id:'reg',x:CX,y:CY,r:46,c:C.regla,v:'Regla',v2:'40 h o más'}],edges=[],RS={};
    CFG.forEach(function(c,i){var rs=data.filter(function(r){return key(r)===c[0]});if(!rs.length)return;
      var fuera=rs.filter(function(r){return r.dif_li90>0||r.dif_ls90<0}).length,p=anillo(i,CFG.length,295,168);RS[c[0]]={rs:rs,fuera:fuera,nom:c[1]};
      var pt=parte(c[1],22);
      nodes.push({id:c[0],x:p[0],y:p[1],r:32,c:fuera?C.sube:C.obj,v:fuera+'/'+rs.length,label:pt[0],sub:pt[1]||undefined,aria:c[1],lab:'auto'});
      edges.push({a:'reg',b:c[0],c:fuera?C.sube:C.obj,w:1.6})});
    function info(id){
      if(id==='reg')return {av:'40',c:C.regla,name:'Regla de 40 horas',small:'Comparador en todas las configuraciones',tag:['','Comparador'],rows:[['Comparaciones',pl(data.length)+' <small>modelo contra regla</small>']],nota:'Cada nodo es una forma de cambiar los supuestos. El número dentro: modelos que se separan de la regla / modelos comparados.'};
      var o=RS[id];
      return {av:String(o.fuera)+'/'+o.rs.length,c:o.fuera?C.sube:C.obj,name:o.nom,small:'Configuración',tag:o.fuera?['alerta','Alguno se separa']:['ok','Ninguno se separa'],
        rows:o.rs.map(function(r){return [esc(nomT(r.puntaje)),pl(sg(r.dif_vs_comparador_pp)+' pp')+' <small>('+sg(r.dif_li90)+' a '+sg(r.dif_ls90)+')</small>']}),nota:'Diferencia de cobertura contra la regla, con rango probable (IC 90 %).'};
    }
    return {G:{nodes:nodes,edges:edges},info:info,sel0:'reg',find:q('q2Find'),
      leg:'<span><i class="o" style="--c:'+C.obj+'"></i>Ningún modelo se distingue de la regla</span><span><i class="o" style="--c:'+C.sube+'"></i>Al menos uno se distingue</span>'};
  }

  /* ---------- Vista 3: ¿a quién deja fuera cada método? ---------- */
  var EQ_DIM=[['SEXO','Sexo'],['EDAD','Edad'],['ING','Ingreso'],['BLOQUE','A quién cuida']];
  var EQ_LBL={'Hombre':'Hombres','Mujer':'Mujeres','15-39':'15 a 39 años','40-59':'40 a 59 años','60+':'60 años y más','Q1-Q2':'Ingreso Q1–Q2','Q3':'Ingreso Q3','Q4-Q5':'Ingreso Q4–Q5','Sin dato':'Ingreso sin dato','Discapacidad':'Persona con discapacidad','Solo 60+':'Solo persona 60+ sin discap.'};
  function vista3(S){
    var m=S.m,rows=V.equidad.filter(function(r){return r.configuracion===PRIM&&r.puntaje===m}),list=[];
    EQ_DIM.forEach(function(d){rows.filter(function(r){return r.dimension===d[0]}).forEach(function(r){list.push(r)})});
    var P=pick(m),n=list.length,nodes=[{id:'ctr',x:CX,y:CY,r:50,c:COLP[m],v:fmt(P.cobertura,1)+'%',v2:'cobertura',aria:nomT(m)}],edges=[];
    list.forEach(function(r,i){var p=anillo(i,n,275,168),big=Math.abs(r.cambio_pp)>=10,poco=r.n_con_objetivo<100;
      var gname=EQ_LBL[r.grupo]||r.grupo,pt=parte(gname,20);
      nodes.push({id:'g'+i,x:p[0],y:p[1],r:13+Math.sqrt(r.n_con_objetivo)*.95,c:big?C.sube:C.neu,poco:poco,v:sg(r.cambio_pp,0),label:pt[0],sub:(pt[1]?pt[1]+' · ':'')+'n = '+r.n_con_objetivo,aria:gname,lab:'auto'});
      edges.push({a:'ctr',b:'g'+i,c:big?C.sube:C.neu,w:1.4,dim:poco})});
    function info(id){
      if(id==='ctr')return {av:m.charAt(0),c:COLP[m],name:nomT(m),small:'Método elegido',tag:['','Todos los grupos'],rows:[['Encuentra a',pl(fmt(P.cobertura,1)+' %')],['La regla encuentra a',pl(fmt(R.cobertura,1)+' %')]],nota:'Cada nodo es un grupo. El número dentro es el cambio, en puntos, frente a la regla; el tamaño es cuántas personas con el daño hay en el grupo.'};
      var r=list[+id.slice(1)],big=Math.abs(r.cambio_pp)>=10,poco=r.n_con_objetivo<100;
      return {av:(EQ_LBL[r.grupo]||r.grupo).charAt(0),c:big?C.sube:C.neu,name:EQ_LBL[r.grupo]||r.grupo,small:(EQ_DIM.filter(function(d){return d[0]===r.dimension})[0]||[0,r.dimension])[1],tag:big?['alerta','Cambio grande']:['ok','Cambio pequeño'],
        rows:[['La regla encuentra a',pl(fmt(r.cobertura_comparador,1)+' %')],[esc(nomT(m))+' encuentra a',pl(fmt(r.cobertura,1)+' %')],['Cambio',pl(sg(r.cambio_pp,0)+' pp')],['Personas con el daño',pl(r.n_con_objetivo)]],
        nota:(poco?'Menos de 100 casos: léelo como orientación, no como cifra firme. ':'')+(big?'Cambio de 10 puntos o más. ':'')+'Sin intervalos.'};
    }
    var rl=rows.slice().sort(function(a,b){return a.cobertura_comparador-b.cobertura_comparador}),ch=rows.slice().sort(function(a,b){return a.cambio_pp-b.cambio_pp}),lo=rl[0],hi=rl[rl.length-1],pe=ch[0],ga=ch[ch.length-1];
    function gn(r){return lc(EQ_LBL[r.grupo]||r.grupo)}
    var find='La regla cubre de <b>'+fmt(lo.cobertura_comparador,0)+' %</b> ('+esc(gn(lo))+') a <b>'+fmt(hi.cobertura_comparador,0)+' %</b> ('+esc(gn(hi))+'). Con '+esc(m==='Logística'?'la regresión logística':'la tarjeta')+', cada grupo cambia entre <b>'+sg(pe.cambio_pp,0)+'</b> y <b>'+sg(ga.cambio_pp,0)+' pp</b>.';
    return {G:{nodes:nodes,edges:edges},info:info,sel0:'ctr',find:find,
      ctrl:'<div class="ev-seg"><button type="button" data-m="Logística" aria-pressed="'+(m==='Logística')+'">Regresión logística</button><button type="button" data-m="Tarjeta de puntos" aria-pressed="'+(m==='Tarjeta de puntos')+'">Tarjeta de puntos</button></div>',
      leg:'<span><i class="o" style="--c:'+C.sube+'"></i>Cambio de 10 puntos o más</span><span><i class="o" style="--c:'+C.neu+'"></i>Cambio menor</span><span>Tamaño = personas con el daño · atenuado: menos de 100 casos</span>'};
  }

  /* ---------- Vista 4: ¿por qué 40 horas? ---------- */
  function vista4(){
    var Cc={};DG.objetivo_componentes.forEach(function(r){Cc[r.componente]=r});
    var TOT=DG.candidatos_objetivo.filter(function(r){return r.objetivo.indexOf('salud (')===0})[0];
    var cats=[['sf','Salud física','',Cc.salud_fisica],['ca','Cansancio','',Cc.cansancio],['su','Sueño','',Cc.sueno],['to','Cualquiera de los tres','(el objetivo)',TOT]],Y=[70,180,290,400];
    var nodes=[{id:'lt',x:190,y:150,r:48,c:C.tar,v:'< 40 h',label:'Menos de 40 h',sub:'a la semana',lab:'left'},{id:'ge',x:190,y:320,r:48,c:C.log,v:'≥ 40 h',label:'40 h o más',sub:'a la semana',lab:'left'}],edges=[];
    cats.forEach(function(c,i){var d=c[3],a=d.prev_menos40,b=d.prev_40mas;
      nodes.push({id:c[0],x:700,y:Y[i],r:34,c:C.obj,v:fmt(b/a,1)+'×',label:c[1],sub:c[2]||undefined,lab:'right'});
      edges.push({a:'lt',b:c[0],c:C.tar,w:1+a*7,t:.72,label:fmt(a*100,0)+'%',curve:10});
      edges.push({a:'ge',b:c[0],c:C.log,w:1+b*7,t:.72,label:fmt(b*100,0)+'%',curve:-10})});
    function info(id){
      if(id==='lt'||id==='ge'){var k=id==='lt'?'prev_menos40':'prev_40mas';
        return {av:id==='lt'?'<':'≥',c:id==='lt'?C.tar:C.log,name:id==='lt'?'Menos de 40 horas':'40 horas o más',small:'Horas de cuidado por semana',tag:['','Grupo de horas'],rows:cats.map(function(c){return [c[1],pl(fmt(c[3][k]*100,0)+' %')]}),nota:'Porcentaje de este grupo que tiene cada daño.'}}
      var c=cats.filter(function(x){return x[0]===id})[0],d=c[3];
      return {av:'×',c:C.obj,name:c[1],small:c[2]||'Componente del daño',tag:['','Descriptivo'],rows:[['Con menos de 40 h',pl(fmt(d.prev_menos40*100,0)+' %')],['Con 40 h o más',pl(fmt(d.prev_40mas*100,0)+' %')],['Razón',pl(fmt(d.prev_40mas/d.prev_menos40,1)+' veces')]],nota:'Descriptivo, sin intervalos: no prueba que 40 h sea el mejor corte.'};
    }
    return {G:{nodes:nodes,edges:edges},info:info,sel0:'to',find:q('q4Find'),
      leg:'<span><i class="o" style="--c:'+C.tar+'"></i>Menos de 40 h</span><span><i class="o" style="--c:'+C.log+'"></i>40 h o más</span><span>Línea gruesa = más frecuente · número dentro: cuántas veces más frecuente con 40 h o más</span>'};
  }

  /* ---------- Vista 5: ¿qué sube o baja el lugar en la fila? ---------- */
  function vista5(){
    var LB={H_20_39:'Cuida de 20 a 39 h',H_40_59:'Cuida de 40 a 59 h',H_60MAS:'Cuida 60 h o más',MUJER:'Mujer',EDAD_15_39:'Tiene 15 a 39 años',EDAD_60MAS:'Tiene 60 años o más',CUIDA_MENORES:'Cuida además a menores',CAPACITACION:'Recibió capacitación',Q1:'Ingreso Q1',Q2:'Ingreso Q2',Q4:'Ingreso Q4',Q5:'Ingreso Q5',Q_NA:'Ingreso sin dato'};
    var t=V.tarjeta.filter(function(r){return LB[r.variable]}).sort(function(a,b){return b.puntos-a.puntos});
    var nodes=[{id:'fila',x:CX,y:CY,r:50,c:C.regla,v:'Fila',v2:'prioridad'}],edges=[];
    t.forEach(function(r,i){var p=anillo(i,t.length,285,170),s=r.puntos>=0,c=s?C.sube:C.baja;
      nodes.push({id:'v'+i,x:p[0],y:p[1],r:Math.max(16,Math.min(34,15+Math.abs(r.puntos)*2.6)),c:c,v:sg(r.puntos,0),label:LB[r.variable],lab:'auto'});
      edges.push({a:'v'+i,b:'fila',c:c,w:Math.min(7,1+Math.abs(r.puntos)*.9)})});
    function info(id){
      if(id==='fila')return {av:'#',c:C.regla,name:'Lugar en la fila',small:'Tarjeta de puntos',tag:['','Resultado'],rows:[['Variables',pl(t.length)]],nota:'Cada nodo suma o resta puntos al lugar de una persona en la fila.'};
      var r=t[+id.slice(1)],s=r.puntos>=0;
      return {av:s?'+':'−',c:s?C.sube:C.baja,name:LB[r.variable],small:'Variable de la tarjeta',tag:s?['alerta','Sube la prioridad']:['ok','La baja'],rows:[['Puntos',pl(sg(r.puntos,0))],['Coeficiente',pl(fmt(r.coeficiente,2))]],nota:'Tarjeta retirada del prototipo; solo para leer qué pesa. Asociaciones, no causas; sin intervalos.'};
    }
    return {G:{nodes:nodes,edges:edges},info:info,sel0:'v0',find:q('q5Find'),
      leg:'<span><i class="o" style="--c:'+C.sube+'"></i>Sube la prioridad</span><span><i class="o" style="--c:'+C.baja+'"></i>La baja</span><span>Tamaño y grosor = cuántos puntos pesa</span>'};
  }

  /* ---------- Armado de la página ---------- */
  var TABS=[['¿Quién encuentra más?',vista1],['¿Cambia con otros supuestos?',vista2],['¿A quién deja fuera?',vista3],['¿Por qué 40 horas?',vista4],['¿Qué pesa en la fila?',vista5]];
  var tiles=[
    ['Cobertura de la regla «40 h o más»',fmt(R.cobertura,1)+'%','de quienes tienen el daño (IC 90 %: '+fmt(R.cob_li90,0)+' a '+fmt(R.cob_ls90,0)+')',C.regla],
    ['Regresión logística contra la regla',sg(L.dif_vs_comparador_pp)+' pp','Rango probable: '+sg(L.dif_li90)+' a '+sg(L.dif_ls90)+(cero(L)?'. Incluye el cero.':'. No incluye el cero.'),C.log],
    ['Tarjeta de puntos contra la regla',sg(T.dif_vs_comparador_pp)+' pp','Rango probable: '+sg(T.dif_li90)+' a '+sg(T.dif_ls90)+(cero(T)?'. Incluye el cero.':'. No incluye el cero.'),C.tar],
    ['La diferencia más pequeña que se nota','≈ '+fmt(DMD,1)+' pp','con esta muestra',C.obj]];
  var pills=[].map.call(document.querySelectorAll('#v2Pills .fz-pill'),function(el){return '<span class="ev-pill'+(el.classList.contains('amb')?' amb':el.classList.contains('rojo')?' rojo':'')+'">'+el.innerHTML+'</span>'}).join('');
  host.innerHTML=
    '<div class="ev-head"><div class="ev-kick">Evidencia del modelo · mapa de nodos</div><h3>¿Un modelo estadístico ordena mejor que la regla de 40 horas?</h3>'+
    '<p class="ev-find">'+q('v2Find')+'</p><div class="ev-pills">'+pills+'</div></div>'+
    '<div class="ev-tiles">'+tiles.map(function(t){return '<div class="ev-tile" style="--c:'+t[3]+'"><i>'+t[0]+'</i><b>'+t[1]+'</b><small>'+t[2]+'</small></div>'}).join('')+'</div>'+
    '<div class="ev-tabs" role="tablist">'+TABS.map(function(t,i){return '<button type="button" role="tab" class="ev-tab" data-t="'+i+'" aria-selected="'+(i===0)+'"><b>'+(i+1)+'</b>'+t[0]+'</button>'}).join('')+'</div>'+
    '<p class="ev-lectura"></p>'+
    '<div class="ev-main"><div class="ev-stage"><div class="ev-ctrl"></div><div class="ev-scroll"><svg class="ev-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Mapa de nodos de la evidencia del modelo"></svg></div><div class="ev-leg"></div></div><aside class="ev-info" aria-live="polite"></aside></div>';
  var $=function(s){return host.querySelector(s)};
  var svg=$('.ev-svg'),S={tab:0,m:'Logística',sel:null},cur=null;
  function pinta(){
    cur=TABS[S.tab][1](S);
    if(!cur.G.nodes.some(function(n){return n.id===S.sel}))S.sel=cur.sel0;
    dibuja(svg,cur.G,S.sel);
    $('.ev-info').innerHTML=ficha(cur.info(S.sel));
    $('.ev-lectura').innerHTML=cur.find||'';
    $('.ev-ctrl').innerHTML=cur.ctrl||'';$('.ev-ctrl').hidden=!cur.ctrl;
    $('.ev-leg').innerHTML=cur.leg||'';
  }
  function elegir(el){var n=el&&el.closest('.ev-n');if(!n)return;S.sel=n.dataset.id;dibuja(svg,cur.G,S.sel);$('.ev-info').innerHTML=ficha(cur.info(S.sel))}
  svg.addEventListener('click',function(e){elegir(e.target)});
  svg.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();elegir(e.target)}});
  $('.ev-tabs').addEventListener('click',function(e){var b=e.target.closest('.ev-tab');if(!b)return;S.tab=+b.dataset.t;S.sel=null;
    [].forEach.call(host.querySelectorAll('.ev-tab'),function(x){x.setAttribute('aria-selected',String(x===b))});pinta()});
  $('.ev-ctrl').addEventListener('click',function(e){var b=e.target.closest('button[data-m]');if(!b)return;S.m=b.dataset.m;pinta()});
  pinta();
})();
