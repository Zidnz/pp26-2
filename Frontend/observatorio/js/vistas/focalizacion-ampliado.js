/* Observatorio del Cuidado · js/vistas/focalizacion-ampliado.js
   Pestaña «¿A quién primero?», segunda parte (13 oct 2026): por qué estos modelos, cobertura según el cupo,
   variables que usa cada modelo, calibración y elección del objetivo. Todo sale de D.modelo2
   (notebook B, sección 11, subsecciones 11 a 16) y de D.modelo (tasa de selección de la regla).
   Importa de OBS: $, FAINT, GL, MONO, dl, esc, fmt, seg, svg
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,FAINT=OBS.FAINT,GL=OBS.GL,MONO=OBS.MONO,dl=OBS.dl,esc=OBS.esc,fmt=OBS.fmt,seg=OBS.seg,svg=OBS.svg;
  var M2=D.modelo2; if(!M2||!$('#m2Bloque')) return;
  var AZ='#77689d',NA='#a9711a',AQ='#23806f',GR='#9a93ad',INK='#2b3045',HAIR='rgba(63,71,96,.12)';
  var NOM={DANO_ALGUNO:'algún daño',DANO_SALUD_FISICA:'salud física deteriorada'};
  var COLF={'Elegido':NA,'Alternativa':GR,'Línea base':AZ};
  var COLC={'Horas (continuo)':AZ,'Regresión logística':NA,'Gradient boosting':AQ};
  var LBL={HORAS:'Horas de cuidado',CUIDA_MENORES:'Cuida además a menores',FALTA_FUERZA:'Le falta fuerza física',REQUIERE_APOYO:'Requiere apoyo de otra persona',N_CLINICAS:'Tareas clínicas',MUJER:'Mujer',QUINTIL:'Quintil de ingreso',N_ABVD:'Actividades básicas',CAPACITACION:'Recibió capacitación',EDAD_N:'Edad',ESCOLARIDAD:'Escolaridad',ANIOS_CUIDANDO:'Años cuidando',CUIDA_DISC:'Cuida discapacidad',APOYO_FAMILIA:'Apoyo económico familiar'};
  var TASA=GL['Regla >= 40 h'].tasa_seleccion;
  function F(a,o){return a.filter(function(r){return r.objetivo===o})}
  function nm(p){return p.replace('>=','≥')}
  function pp(v,d){return (v>=0?'+':'')+fmt(v,d==null?1:d)}
  function ic(a,b){return fmt(a)+' a '+fmt(b)}
  function txt(x,y,t,o){o=o||{};return '<text x="'+x+'" y="'+y+'"'+(o.a?' text-anchor="'+o.a+'"':'')+(o.m?' '+MONO:'')+' font-size="'+(o.s||11)+'" fill="'+(o.c||INK)+'"'+(o.w?' font-weight="'+o.w+'"':'')+'>'+t+'</text>'}

  /* ---------- 1. Ocho formas de elegir ---------- */
  function renderAlt(o){
    var t=F(M2.alternativas,o).filter(function(r){return r.puntaje!=='Regla >= 40 h'}).sort(function(a,b){return a.dif_cobertura_vs_regla-b.dif_cobertura_vs_regla});
    var lo=Math.min(-10,Math.min.apply(null,t.map(function(r){return r.dif_li90})))-2,hi=Math.max.apply(null,t.map(function(r){return r.dif_ls90}))+12;
    var W=600,lab=170,rowH=30,H=t.length*rowH+34,x0=lab,x1=W-10;function X(v){return x0+(x1-x0)*(v-lo)/(hi-lo)}
    var s=svg(W,H,'Diferencia de cobertura contra la regla por modelo');
    for(var k=Math.ceil(lo/5)*5;k<=hi;k+=5){s+='<line x1="'+X(k)+'" x2="'+X(k)+'" y1="0" y2="'+(H-26)+'" stroke="'+HAIR+'"/>'+txt(X(k),H-10,(k>0?'+':'')+k,{a:'middle',m:1,s:10,c:FAINT})}
    s+='<line x1="'+X(0)+'" x2="'+X(0)+'" y1="0" y2="'+(H-26)+'" stroke="'+INK+'" stroke-width="1.2"/>';
    t.forEach(function(r,i){var y=i*rowH+rowH/2,c=COLF[r.familia];
      s+=txt(0,y+4,esc(nm(r.puntaje)),{s:12.5,w:r.familia==='Elegido'?700:400});
      s+='<line x1="'+X(r.dif_li90)+'" x2="'+X(r.dif_ls90)+'" y1="'+y+'" y2="'+y+'" stroke="'+c+'" stroke-opacity=".45" stroke-width="3"/>';
      s+='<circle cx="'+X(r.dif_cobertura_vs_regla)+'" cy="'+y+'" r="6.5" fill="'+c+'" stroke="#fff" stroke-width="1.5"><title>'+esc(nm(r.puntaje))+': '+pp(r.dif_cobertura_vs_regla)+' pp (IC 90 % '+ic(r.dif_li90,r.dif_ls90)+')</title></circle>';
      s+=txt(X(r.dif_ls90)+8,y+4,'AUC '+fmt(r.auc_ponderado,2),{m:1,s:9.5,c:FAINT})});
    $('#ch-alt').innerHTML=s+'</svg>';
    var mods=t.filter(function(r){return r.familia!=='Línea base'}),sup=mods.filter(function(r){return r.dif_li90>0});
    var dif=mods.map(function(r){return r.dif_cobertura_vs_regla}),rango=Math.max.apply(null,dif)-Math.min.apply(null,dif);
    var ancho=mods.reduce(function(a,r){return a+(r.dif_ls90-r.dif_li90)},0)/mods.length;
    $('#altFind').innerHTML=sup.length===0
      ?'Con <b>'+NOM[o]+'</b>, ninguno de los '+mods.length+' modelos se separa de la regla «40 h o más»: todos los intervalos incluyen el cero.'
      :'Con <b>'+NOM[o]+'</b>, '+sup.length+' de '+mods.length+' modelos superan a la regla. Entre ellos no se pueden ordenar: se separan '+fmt(rango)+' pp, y cada intervalo mide unos '+fmt(ancho,0)+' pp.';
    $('#taltb').innerHTML=F(M2.alternativas,o).map(function(r){return '<tr><td><b>'+esc(nm(r.puntaje))+'</b></td><td>'+esc(r.familia)+'</td><td class="n">'+fmt(r.auc_ponderado,2)+'</td><td class="n">'+(r.brier_ponderado==null?'—':fmt(r.brier_ponderado,3))+'</td><td class="n">'+fmt(r.cobertura)+'%</td><td>'+esc(r.admite_pesos)+'</td><td>'+esc(r.interpretable)+'</td></tr>'}).join('');
  }

  /* ---------- 2. Curva de cobertura según el cupo ---------- */
  function renderCur(o){
    var W=560,H=330,l=46,r=14,tp=10,b=40;function X(v){return l+(W-l-r)*v/100}function Y(v){return tp+(H-tp-b)*(1-v/100)}
    var s=svg(W,H,'Curva de cobertura');
    [0,20,40,60,80,100].forEach(function(k){s+='<line x1="'+X(0)+'" x2="'+X(100)+'" y1="'+Y(k)+'" y2="'+Y(k)+'" stroke="'+HAIR+'"/>'+txt(l-6,Y(k)+4,k+'%',{a:'end',m:1,s:10,c:FAINT})+txt(X(k),H-22,k+'%',{a:'middle',m:1,s:10,c:FAINT})});
    s+=txt(X(50),H-4,'% de personas cuidadoras seleccionadas (cupo del programa)',{a:'middle',s:11,c:FAINT});
    s+='<line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(100)+'" y2="'+Y(100)+'" stroke="'+GR+'" stroke-dasharray="4 4"/>';
    s+='<line x1="'+X(TASA)+'" x2="'+X(TASA)+'" y1="'+Y(100)+'" y2="'+Y(0)+'" stroke="'+GR+'" stroke-opacity=".6"/>';
    ['Horas (continuo)','Regresión logística','Gradient boosting'].forEach(function(p){
      var pts=F(M2.curvas,o).filter(function(q){return q.puntaje===p}).map(function(q){return X(q.pct_seleccion).toFixed(1)+','+Y(q.cobertura).toFixed(1)}).join(' ');
      s+='<polyline points="'+pts+'" fill="none" stroke="'+COLC[p]+'" stroke-width="2.4"/>'});
    var rg=F(M2.alternativas,o).filter(function(q){return q.puntaje==='Regla >= 40 h'})[0];
    s+='<circle cx="'+X(TASA)+'" cy="'+Y(rg.cobertura)+'" r="6.5" fill="'+INK+'" stroke="#fff" stroke-width="1.5"><title>Regla 40 h o más: selecciona '+fmt(TASA)+'% y alcanza a '+fmt(rg.cobertura)+'%</title></circle>';
    $('#ch-cur').innerHTML=s+'</svg>';
    var c=F(M2.cupo,o),lg=c.filter(function(q){return q.puntaje==='Regresión logística'}),dem=lg.filter(function(q){return q.dif_li90>0});
    $('#curFind').innerHTML=dem.length===0
      ?'Con <b>'+NOM[o]+'</b>, en ningún cupo, del 10 % al '+fmt(TASA)+' %, el modelo se separa de «las horas más altas».'
      :'Con <b>'+NOM[o]+'</b>, el modelo supera a «las horas más altas» en '+dem.length+' de '+lg.length+' cupos, de '+pp(Math.min.apply(null,dem.map(function(q){return q.dif_vs_horas})),0)+' a '+pp(Math.max.apply(null,dem.map(function(q){return q.dif_vs_horas})),0)+' pp.';
    $('#tcupob').innerHTML=lg.map(function(q){var h=c.filter(function(z){return z.cupo===q.cupo&&z.puntaje==='Horas (continuo)'})[0];
      return '<tr><td class="n">'+fmt(q.cupo)+'%</td><td class="n">'+fmt(h.horas_corte,0)+' h o más</td><td class="n">'+fmt(h.cobertura)+'%</td><td class="n">'+fmt(q.cobertura)+'%</td><td class="n">'+pp(q.dif_vs_horas)+' pp ('+ic(q.dif_li90,q.dif_ls90)+')</td></tr>'}).join('');
  }

  /* ---------- 3. Importancia por permutación ---------- */
  function renderImp(o){
    var t=F(M2.importancia,o),vars={};t.forEach(function(r){(vars[r.variable]=vars[r.variable]||{})[r.puntaje]=100*r.caida_auc});
    var ks=Object.keys(vars).sort(function(a,b){var A=vars[a],B=vars[b];return (B['Regresión logística']+B['Gradient boosting'])-(A['Regresión logística']+A['Gradient boosting'])});
    var mx=Math.max.apply(null,t.map(function(r){return 100*r.caida_auc})),mn=Math.min(0,Math.min.apply(null,t.map(function(r){return 100*r.caida_auc})));
    var W=520,lab=190,rowH=24,H=ks.length*rowH+8;function X(v){return lab+(W-lab-40)*(v-mn)/(mx-mn)}
    var s=svg(W,H,'Importancia por permutación')+'<line x1="'+X(0)+'" x2="'+X(0)+'" y1="0" y2="'+H+'" stroke="'+INK+'" stroke-opacity=".5"/>';
    ks.forEach(function(k,i){var y=i*rowH+4;s+=txt(0,y+13,LBL[k]||k,{s:12});
      [['Regresión logística',NA,0],['Gradient boosting',AQ,9]].forEach(function(p){var v=vars[k][p[0]],a=Math.min(X(0),X(v)),w=Math.abs(X(v)-X(0));
        s+='<rect x="'+a+'" y="'+(y+p[2])+'" width="'+Math.max(w,.5)+'" height="8" rx="2" fill="'+p[1]+'"><title>'+p[0]+': '+fmt(v,2)+' centésimas de AUC</title></rect>'})});
    $('#ch-imp').innerHTML=s+'</svg>';
    $('#impFind').innerHTML='Lo que pierde el modelo al revolver cada variable, medido fuera de muestra. Con <b>'+NOM[o]+'</b>, la que más pesa es <b>'+(LBL[ks[0]]||ks[0])+'</b>. Es una asociación, no una causa.';
  }

  /* ---------- 4. Calibración ---------- */
  var calM='Regresión logística',curO='DANO_ALGUNO';
  function renderCal(o){
    var W=420,H=330,l=46,r=12,tp=10,b=40;function X(v){return l+(W-l-r)*v/100}function Y(v){return tp+(H-tp-b)*(1-Math.max(0,Math.min(100,v))/100)}
    var s=svg(W,H,'Calibración por deciles');
    [0,25,50,75,100].forEach(function(k){s+='<line x1="'+X(0)+'" x2="'+X(100)+'" y1="'+Y(k)+'" y2="'+Y(k)+'" stroke="'+HAIR+'"/>'+txt(l-6,Y(k)+4,k+'%',{a:'end',m:1,s:10,c:FAINT})+txt(X(k),H-22,k+'%',{a:'middle',m:1,s:10,c:FAINT})});
    s+=txt(X(50),H-4,'Probabilidad predicha (promedio del decil)',{a:'middle',s:11,c:FAINT});
    s+='<line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(100)+'" y2="'+Y(100)+'" stroke="'+GR+'" stroke-dasharray="4 4"/>';
    [calM==='Gradient boosting'?['Gradient boosting',AQ]:['Regresión logística',NA]].forEach(function(p){
      var t=F(M2.calibracion,o).filter(function(q){return q.puntaje===p[0]});
      s+='<polyline points="'+t.map(function(q){return X(q.predicho).toFixed(1)+','+Y(q.observado).toFixed(1)}).join(' ')+'" fill="none" stroke="'+p[1]+'" stroke-width="1.4" stroke-opacity=".7"/>';
      t.forEach(function(q){s+='<line x1="'+X(q.predicho)+'" x2="'+X(q.predicho)+'" y1="'+Y(q.obs_li90)+'" y2="'+Y(q.obs_ls90)+'" stroke="'+p[1]+'" stroke-opacity=".35" stroke-width="2"/><circle cx="'+X(q.predicho)+'" cy="'+Y(q.observado)+'" r="4.5" fill="'+p[1]+'" stroke="#fff"><title>'+p[0]+', decil '+q.decil+': predice '+fmt(q.predicho)+'%, observado '+fmt(q.observado)+'% (IC 90 % '+ic(q.obs_li90,q.obs_ls90)+')</title></circle>'})});
    $('#ch-cal').innerHTML=s+'</svg>';
    var t=F(M2.calibracion,o).filter(function(q){return q.puntaje===calM}),fuera=t.filter(function(q){return q.predicho<q.obs_li90||q.predicho>q.obs_ls90});
    $('#calFind').innerHTML='Si los puntos caen sobre la diagonal, una probabilidad de 70 % significa que 70 de cada 100 declaran el daño. Con <b>'+NOM[o]+'</b>, '+(t.length-fuera.length)+' de '+t.length+' deciles de la <b>'+calM.toLowerCase()+'</b> contienen la diagonal en su intervalo.';
  }

  function render(o){curO=o;renderAlt(o);renderCur(o);renderImp(o);renderCal(o)}
  seg('#segCalMod','m',function(v){calM=v;renderCal(curO)});
  seg('#segObj','o',render); render('DANO_ALGUNO');

  /* ---------- 5. ¿Qué objetivo conviene? ---------- */
  var RS={};M2.resumen.forEach(function(r){RS[r.objetivo]=r});
  var A=RS.DANO_ALGUNO,S=RS.DANO_SALUD_FISICA;
  var SF=function(o,v){return M2.sin_fuerza.filter(function(r){return r.objetivo===o&&r.variante===v})[0]};
  var sT=SF('DANO_SALUD_FISICA','Todas las variables'),sS=SF('DANO_SALUD_FISICA','Sin "le falta fuerza física"');
  var T=[[A.n_muestra+' / '+S.n_muestra,'casos con el daño en la muestra (algún daño / salud física)',''],
         [fmt(A.prec_regla,0)+'% / '+fmt(S.prec_regla,0)+'%','de las personas que elige la regla declaran ese daño',''],
         [pp(sT.dif_cobertura_vs_regla)+' pp','ventaja del modelo con salud física (IC 90 % '+ic(sT.dif_li90,sT.dif_ls90)+')','var(--teal)'],
         [pp(sS.dif_cobertura_vs_regla)+' pp','la misma ventaja sin «le falta fuerza física» (IC '+ic(sS.dif_li90,sS.dif_ls90)+'): no demostrable','var(--amber)']];
  $('#objTiles').innerHTML=T.map(function(t){return '<div class="card tile"><div class="big num" style="font-size:26px;'+(t[2]?'color:'+t[2]:'')+'">'+t[0]+'</div><div class="lbl">'+t[1]+'</div></div>'}).join('');
  $('#objFind').innerHTML='Elegir «salud física» <b>porque ahí gana el modelo</b> sería razonamiento circular. El objetivo se elige por lo que el relevo puede cambiar y el piloto puede medir. Con esos criterios, los datos inclinan hacia <b>algún daño</b>: el relevo libera tiempo, que es lo que alivia el cansancio y el sueño, y la app ya pregunta por ellos. Además tiene casi tres veces más casos. Con ese objetivo, la regla de 40 h basta.';
  (function(){
    var ord=['0-19 h','20-39 h','40-79 h','80 h o más'],W=440,H=280,l=40,b=40,tp=10;function Y(v){return tp+(H-tp-b)*(1-v/100)}
    var gw=(W-l-10)/ord.length,bw=gw*.34,s=svg(W,H,'Prevalencia por horas de cuidado');
    [0,25,50,75,100].forEach(function(k){s+='<line x1="'+l+'" x2="'+W+'" y1="'+Y(k)+'" y2="'+Y(k)+'" stroke="'+HAIR+'"/>'+txt(l-6,Y(k)+4,k+'%',{a:'end',m:1,s:10,c:FAINT})});
    ord.forEach(function(h,i){var cx=l+gw*i+gw/2;s+=txt(cx,H-22,h,{a:'middle',s:11});
      [['DANO_ALGUNO',AZ,-1],['DANO_SALUD_FISICA',NA,1]].forEach(function(p){var r=M2.por_horas.filter(function(q){return q.objetivo===p[0]&&q.horas===h})[0],x=cx+p[2]*(bw/2+2)-bw/2;
        s+='<rect x="'+x+'" y="'+Y(r.prevalencia)+'" width="'+bw+'" height="'+(Y(0)-Y(r.prevalencia))+'" rx="2" fill="'+p[1]+'"><title>'+NOM[p[0]]+', '+h+': '+fmt(r.prevalencia)+'% (IC 90 % '+ic(r.li90,r.ls90)+'; n = '+r.n+')</title></rect><line x1="'+(x+bw/2)+'" x2="'+(x+bw/2)+'" y1="'+Y(r.li90)+'" y2="'+Y(r.ls90)+'" stroke="'+INK+'"/>'+txt(x+bw/2,Y(r.prevalencia)-4,fmt(r.prevalencia,0),{a:'middle',m:1,s:9.5})})});
    s+=txt(l+(W-l)/2,H-4,'Horas semanales de cuidado',{a:'middle',s:11,c:FAINT});
    $('#ch-objh').innerHTML=s+'</svg>';
  })();
  (function(){
    var ORD=[['SEXO','Mujer','Mujeres'],['SEXO','Hombre','Hombres'],['EDAD','15-39','15 a 39 años'],['EDAD','40-59','40 a 59 años'],['EDAD','60+','60 y más'],['TIPO','Cuida discapacidad','Cuida discapacidad'],['TIPO','Solo 60+ sin discapacidad','Solo 60+ sin discap.'],['ING','Q1-Q2','Ingreso Q1–Q2'],['ING','Q3','Ingreso Q3'],['ING','Q4-Q5','Ingreso Q4–Q5']];
    function cam(o,g){var q=M2.por_grupo.filter(function(r){return r.objetivo===o&&r.dimension===g[0]&&r.grupo===g[1]});
      var a=q.filter(function(r){return r.puntaje==='Regla >= 40 h'})[0],m=q.filter(function(r){return r.puntaje==='Regresión logística'})[0];return {v:m.cobertura-a.cobertura,n:a.n_con_dano}}
    var vals=[];ORD.forEach(function(g){vals.push(cam('DANO_ALGUNO',g).v,cam('DANO_SALUD_FISICA',g).v)});
    var lo=Math.min(-35,Math.min.apply(null,vals)-3),hi=Math.max(35,Math.max.apply(null,vals)+3);
    var W=460,lab=150,rowH=25,H=ORD.length*rowH+30;function X(v){return lab+(W-lab-8)*(v-lo)/(hi-lo)}
    var s=svg(W,H,'Cambio de cobertura por grupo')+'<line x1="'+X(0)+'" x2="'+X(0)+'" y1="0" y2="'+(H-24)+'" stroke="'+INK+'"/>';
    [-30,-15,15,30].forEach(function(k){s+='<line x1="'+X(k)+'" x2="'+X(k)+'" y1="0" y2="'+(H-24)+'" stroke="'+HAIR+'"/>'+txt(X(k),H-8,(k>0?'+':'')+k,{a:'middle',m:1,s:10,c:FAINT})});
    ORD.forEach(function(g,i){var y=i*rowH+4;s+=txt(0,y+13,g[2],{s:12});
      [['DANO_ALGUNO',AZ,0],['DANO_SALUD_FISICA',NA,9]].forEach(function(p){var c=cam(p[0],g),a=Math.min(X(0),X(c.v));
        s+='<rect x="'+a+'" y="'+(y+p[2])+'" width="'+Math.abs(X(c.v)-X(0))+'" height="8" rx="2" fill="'+p[1]+'"'+(c.n<100?' fill-opacity=".45"':'')+'><title>'+NOM[p[0]]+', '+g[2]+': '+pp(c.v)+' pp (n con el daño = '+c.n+')</title></rect>'})});
    $('#ch-objg').innerHTML=s+'</svg>';
  })();
  $('#tobjb').innerHTML=M2.decision.map(function(r){return '<tr><td><b>'+esc(r.criterio)+'</b></td><td class="muted">'+esc(r.tipo)+'</td><td>'+esc(r.algun_dano)+'</td><td>'+esc(r.salud_fisica)+'</td><td>'+esc(r.favorece)+'</td></tr>'}).join('');
  $('#src-m2').innerHTML=dl({Universo:'Personas cuidadoras de persona con discapacidad o 60+, nacional (ENASIC 2022, n = 1,043)',Método:'Validación cruzada agrupada por UPM (5 × 20), métricas ponderadas con FAC_CUI, misma tasa de selección que la regla salvo en «según el cupo»',Estado:'Pendiente de doble revisión',Archivo:esc(M2.fuente)});
})();
