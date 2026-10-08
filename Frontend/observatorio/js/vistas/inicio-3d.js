/* Observatorio del Cuidado · js/vistas/inicio-3d.js
   Escenas 3D de la portada.
   (El bloque «Los datos que cuidan» ya no tiene escena 3D: desde el 7 oct 2026 lleva un medallón ilustrado, ver inicio.js.)
   2 · ¿Cuántas personas están en el problema?: una escena por etapa del embudo. Cada escena usa una ilustración 2D de
       OBS.ILU como figura recortada con grosor; sin OBS.ILU vuelven los personajes 3D.
   3 · Lo que encontramos: un objeto por hallazgo, dibujado con la cifra de su tarjeta (columnas, charola, aros, balanza).
   En 2 y 3 cada figura u objeto queda encima de su tarjeta: el cursor sobre una figura resalta su tarjeta (y al revés)
   y un clic abre la pestaña de la tarjeta.
   Las figuras son ilustración, no datos. Necesita las tarjetas que pinta inicio.js.
   Importa de OBS: $, $$, C, GL, ILU, M3D, des, fmt, r40, r6
   Exporta a OBS:  — */
(function(){
"use strict";
const $=OBS.$,$$=OBS.$$,fmt=OBS.fmt,M=OBS.M3D,C=OBS.C,GL=OBS.GL,des=OBS.des,r6=OBS.r6,r40=OBS.r40;
const sin3d=id=>{ const f=$('#fr-'+id); if(f) f.classList.add('no3d'); };
if(!M){ ['embudo','hallazgos'].forEach(sin3d); return; }
const T=M.T, reduce=M.reduce, gummy=M.gummy, roundedBox=M.roundedBox, TAN=Math.tan(13*Math.PI/180);
const colX=(i,n,HW)=>(2*(i+.5)/n-1)*HW;           // centro de la tarjeta i de n, en unidades de la escena
const at=(m,x,y,z)=>{ m.position.set(x,y,z); return m; };
const INK="#2b3045", SOFT="#6d5d9e";

// Cámara (fov 26): el plano z=0 abarca al menos o.hw unidades a cada lado (o.hwN en escenarios angostos,
// donde las tarjetas ya no van en una fila y conviene acercar). Devuelve el medio ancho real.
function fit(cam,r,o){ const a=r.width/r.height, hw=(a<2&&o.hwN)?o.hwN:o.hw, d=Math.max(o.dMin,hw/(TAN*a)); cam.position.set(0,o.lookY+o.up,d); cam.lookAt(0,o.lookY,0); return TAN*d*a; }

// Interacción común. groups[i].userData.cards = índices de las tarjetas que representa la figura i.
function interact(st,groups,cards,F,extra){
  const {camera,canvas}=st;
  const ray=new T.Raycaster(), ndc=new T.Vector2(0,0), target=new T.Vector3(), plane=new T.Plane(new T.Vector3(0,0,1),-4), tmp=new T.Vector3(), d=new T.Vector3();
  let hover=-1, since=-1e9, down=null;
  const pick=e=>{ const r=canvas.getBoundingClientRect(); ray.setFromCamera(new T.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);
    const h=ray.intersectObjects(groups,true)[0]; if(!h) return -1; let o=h.object; while(o&&groups.indexOf(o)<0) o=o.parent; return groups.indexOf(o); };
  const setHot=(i,only)=>{ hover=i; const on=only!=null?[only]:i>=0?groups[i].userData.cards:[]; cards.forEach((c,k)=>c.classList.toggle('is-hot',on.indexOf(k)>=0)); };
  window.addEventListener('pointermove',e=>{ const r=canvas.getBoundingClientRect(); if(!r.width) return; ndc.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1); since=performance.now(); },{passive:true});
  canvas.addEventListener('pointermove',e=>{ const i=pick(e); if(i!==hover) setHot(i); canvas.style.cursor=(i>=0&&groups[i].userData.cards.length===1)?'pointer':'default'; });
  canvas.addEventListener('pointerleave',()=>setHot(-1));
  canvas.addEventListener('pointerdown',e=>{ down={x:e.clientX,y:e.clientY}; });
  canvas.addEventListener('pointerup',e=>{ if(!down) return; const mv=Math.hypot(e.clientX-down.x,e.clientY-down.y); down=null; if(mv>6) return;
    const i=pick(e); if(i<0) return; const cs=groups[i].userData.cards; if(cs.length!==1) return;
    const b=cards[cs[0]]&&cards[cs[0]].querySelector('[data-goto]'); if(b) b.click(); });
  cards.forEach((c,k)=>{ c.addEventListener('pointerenter',()=>setHot(groups.findIndex(g=>g.userData.cards.indexOf(k)>=0),k)); c.addEventListener('pointerleave',()=>setHot(-1)); });
  const blinks=F?F.eyes.map(()=>({next:performance.now()+2000+Math.random()*5000,t:-1e9})):[];
  st.tick(now=>{
    if(F){ if(now-since>4000&&!reduce) ndc.set(Math.sin(now/2300)*.4,Math.sin(now/1700)*.15+.05);
      ray.setFromCamera(ndc,camera); if(!ray.ray.intersectPlane(plane,target)) target.set(0,2,4);
      F.eyes.forEach((e,i)=>{ tmp.copy(target); e.g.worldToLocal(tmp); d.copy(tmp).sub(e.c).normalize(); d.z=Math.max(d.z,.55); d.normalize();
        e.pup.position.copy(e.c).addScaledVector(d,e.er*.68);
        const b=blinks[i]; if(!reduce&&now>b.next){ b.t=now; b.next=now+2500+Math.random()*5000; }
        const k=now-b.t<130?.12:1; e.scl.scale.y=(e.tired?.45:1)*k; }); }
    groups.forEach((g,i)=>{ const on=i===hover, s0=g.userData.s0||1, s=g.scale.x+((on?1.06:1)*s0-g.scale.x)*.15; g.scale.setScalar(s);
      if(g.userData.bounce!==false&&!reduce) g.position.y=Math.max(0,Math.sin(now/600+i*1.3))*.04*(on?3:1); });
    if(extra) extra(reduce?0:now,hover);
  });
}

// ======================= 2 · ¿Cuántas personas están en el problema? =======================
// Con OBS.ILU cada escena es una ilustración 2D convertida en figura recortada con grosor (cartón pluma): borde blanco,
// canto lavanda en capas, sombra proyectada en el piso, brillo que recorre la figura al girar y giro hacia el cursor.
// Los accesorios que cargan el mensaje (reloj «40 h +», globo «no tuve necesidad» y el estallido «¡Mentiraaa!») siguen en 3D. «Con daño» es una figura
// de dos caras (trabajo al frente, salud atrás) que da media vuelta cada 5.5 s.
// Sin OBS.ILU vuelven los personajes 3D.
try{ (function(){
  const cv=$('#c3-embudo'), cards=$$('#cards-embudo .fr-card'); if(!cv) return;
  const O={hw:13.85,hwN:12,lookY:1.2,up:1.85,dMin:15}; let HW=O.hw; const lay=[];
  const st=M.makeStage(cv,{fov:26,onResize:(cam,r)=>{ HW=fit(cam,r,O); lay.forEach(f=>f()); }});
  const F=M.buildFigures(), mk=F.make, IL=OBS.ILU||null;
  const lc=h=>new T.Color(h).convertSRGBToLinear();
  const segM=(a,b,r,m)=>{ const A=new T.Vector3(...a),B=new T.Vector3(...b),dd=B.clone().sub(A); const c=new T.Mesh(new T.CylinderGeometry(r,r,dd.length(),12),m); c.position.copy(A).add(B).multiplyScalar(.5); c.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dd.normalize()); return c; };
  // Figura recortada de la ilustración I con alto H (unidades de escena); la base queda en y=0. Con I2, la figura tiene
  // dos caras: I al frente e I2 atrás, y da media vuelta cada 5.5 s para mostrar la otra (sin giro si se pide menos movimiento).
  // Sus materiales llevan userData.ladoFijo: el motor no les cambia el lado al dibujar el reflejo (son planos de doble cara).
  function standee(I,H,I2){
    const g=new T.Group(), PAD=16, fig=new T.Group(); g.add(fig);
    // una cara: planos de doble cara. Dos caras: cada plano solo se ve desde su lado (FrontSide), para que la cara
    // trasera no asome por el borde de la frontal ni el canto de la frontal por la trasera
    const lado=I2?T.FrontSide:T.DoubleSide;
    const fijo=m=>{ m.side=lado; m.userData.ladoFijo=true; return m; };
    // texturas de una cara: ilustración, silueta dilatada (borde y canto) y silueta difusa (sombra)
    function cara(I){
      const W=H*I.w/I.h, c={W, sx:W*(I.w+2*PAD)/I.w, sy:H*(I.h+2*PAD)/I.h, art:new T.Texture(), sil:new T.Texture(), sha:new T.Texture()};
      [c.art,c.sil,c.sha].forEach(t=>{ t.anisotropy=4; });
      const img=new Image(); img.onload=()=>{
        c.art.image=img; c.art.needsUpdate=true;
        const cw=I.w+2*PAD, ch=I.h+2*PAD, s=document.createElement('canvas'); s.width=cw; s.height=ch; const x=s.getContext('2d');
        for(let k=0;k<32;k++){ const a=k/32*Math.PI*2; x.drawImage(img,PAD+Math.cos(a)*PAD*.8,PAD+Math.sin(a)*PAD*.8,I.w,I.h); }
        x.drawImage(img,PAD,PAD,I.w,I.h); x.globalCompositeOperation='source-in'; x.fillStyle='#fff'; x.fillRect(0,0,cw,ch);
        c.sil.image=s; c.sil.needsUpdate=true;
        const b=document.createElement('canvas'); b.width=cw; b.height=ch; const y=b.getContext('2d'); y.filter='blur(10px)'; y.drawImage(s,0,0);
        c.sha.image=b; c.sha.needsUpdate=true; };
      img.src=I.src; return c; }
    const A=cara(I); fig.position.y=H*PAD/I.h;
    // ilustración: textura tal cual (sRGB sin conversión) + brillo diagonal + oscurecido suave junto al piso; las dos caras comparten el brillo
    const uni={uSweep:{value:-1},uAmt:{value:.45}};
    const artMat=tex=>fijo(new T.ShaderMaterial({transparent:true,uniforms:{map:{value:tex},uSweep:uni.uSweep,uAmt:uni.uAmt},
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform sampler2D map;uniform float uSweep,uAmt;varying vec2 vUv;void main(){vec4 c=texture2D(map,vUv);if(c.a<.03)discard;'+
        'float d=vUv.x*.8+vUv.y*.45-uSweep;float s=exp(-d*d*30.)*uAmt;float ao=mix(.9,1.,smoothstep(0.,.18,vUv.y));'+
        'gl_FragColor=vec4(c.rgb*ao+s*.3*vec3(1.,.98,1.),c.a);}'}));
    const borde=(tex,col)=>fijo(new T.MeshBasicMaterial({map:tex,color:col,transparent:true,alphaTest:.5}));
    const plane=(w,h,m,z,atras)=>{ const p=new T.Mesh(new T.PlaneGeometry(w,h),m); p.position.set(0,H/2,z); if(atras) p.rotation.y=Math.PI; return p; };
    const N=11, PASO=.016, c0=lc("#E6E0F1"), c1=lc("#A597C6"), blanco=lc("#FFFFFF");
    fig.add(plane(A.W,H,artMat(A.art),0));
    fig.add(plane(A.sx,A.sy,borde(A.sil,blanco),-.006));
    for(let i=1;i<=N;i++) fig.add(plane(A.sx,A.sy,borde(A.sil,c0.clone().lerp(c1,i/N)),-.006-i*PASO));
    if(I2){ const B=cara(I2), zb=-.012-(N+1)*PASO;
      fig.add(plane(B.sx,B.sy,borde(B.sil,blanco),zb,true));
      fig.add(plane(B.W,H,artMat(B.art),zb-.006,true)); }
    // sombra en el piso: la silueta acostada hacia atrás y a la derecha (la luz viene de arriba a la izquierda)
    const fijo2=m=>{ m.side=T.DoubleSide; m.userData.ladoFijo=true; return m; };
    const sg=new T.PlaneGeometry(A.sx,A.sy*.42); sg.translate(0,A.sy*.21,0);
    sg.applyMatrix4(new T.Matrix4().set(1,.55,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1));
    const sm=new T.Mesh(sg,fijo2(new T.MeshBasicMaterial({map:A.sha,color:lc("#2a2440"),transparent:true,opacity:.16,depthWrite:false})));
    sm.rotation.x=-Math.PI/2; sm.position.set(0,.015,-.12); g.add(sm);
    g.userData.standee={fig,artM:{uniforms:uni},sm,ry:0,dos:!!I2,giro:0,giroT:0,next:performance.now()+4000};
    return g; }
  const fig2d=(g,clave,H,x,clave2)=>{ const s=standee(IL[clave],H,clave2?IL[clave2]:null); s.position.x=x||0; g.add(s); g.userData.standees=(g.userData.standees||[]).concat([s]); return s; };
  // Accesorios 3D
  function reloj(x,y){ const ck=new T.Group(); ck.position.set(x,y,0);
    ck.add(new T.Mesh(new T.CylinderGeometry(.62,.62,.16,40),gummy("#FBFAFD")).rotateX(Math.PI/2));
    ck.add(new T.Mesh(new T.TorusGeometry(.64,.1,16,48),gummy("#77689D")));
    ck.add(segM([0,0,.1],[0,.42,.1],.045,gummy("#2b3045"))); ck.add(segM([0,0,.1],[.3,-.12,.1],.045,gummy("#2b3045")));
    [[-.32,.72],[.32,.72]].forEach(([x,y])=>ck.add(new T.Mesh(new T.SphereGeometry(.14,16,12),gummy("#77689D")).translateX(x).translateY(y)));
    const lb=M.txt("40 h +",2.0,"#6d5d9e"); lb.position.set(0,-1.05,0); ck.add(lb); return ck; }
  function globo(x,y){ const bb=new T.Group(); bb.position.set(x,y,0);
    bb.add(new T.Mesh(roundedBox(3.1,.95,.16,.24,3),gummy("#FBFAFD")));
    const tail=new T.Mesh(new T.ConeGeometry(.16,.4,12),gummy("#FBFAFD")); tail.position.set(-1.05,-.58,0); tail.rotation.z=2.5; bb.add(tail);
    const lb=M.txt("«no tuve necesidad»",2.9,"#6d5d9e"); lb.position.set(0,.02,.1); bb.add(lb); bb.userData.y0=y; return bb; }
  function gota(x,y){ const drop=new T.Group(); drop.position.set(x,y,.25); drop.add(new T.Mesh(new T.SphereGeometry(.12,16,12),gummy("#7FB8E6"))); const cn=new T.Mesh(new T.ConeGeometry(.1,.2,12),gummy("#7FB8E6")); cn.position.y=.14; drop.add(cn); drop.userData.y0=y; return drop; }
  function maletin(x,y){ const bag=new T.Group(); bag.position.set(x,y,.2); bag.rotation.z=.45; bag.scale.setScalar(1.35);
    bag.add(new T.Mesh(roundedBox(.9,.58,.34,.11,3),gummy("#1E5A47"))); const hd=new T.Mesh(new T.TorusGeometry(.16,.05,10,24,Math.PI),gummy("#1E5A47")); hd.position.y=.29; bag.add(hd); return bag; }
  function alerta(x,y){ const ex=new T.Group(); ex.position.set(x,y,0); ex.add(new T.Mesh(roundedBox(.16,.42,.16,.07,2),gummy("#C0435A"))); const dot=new T.Mesh(new T.SphereGeometry(.09,12,10),gummy("#C0435A")); dot.position.y=-.36; ex.add(dot); return ex; }
  // 0 · cuidan · 1 · a una persona con discapacidad o de 60+ · 2 · 40 h o más · 3 · «no tuve necesidad» · 4 · con daño
  function scene0(){ const g=new T.Group();
    if(IL){ fig2d(g,'familia',3.75); return g; }
    const a=mk.rosa(), b=mk.jorge(), c=mk.lupeSola(); a.position.x=-1.55; c.position.x=1.55; a.rotation.y=.25; c.rotation.y=-.25; g.add(a,b,c); return g; }
  function scene1(){ const g=new T.Group();
    if(IL){ fig2d(g,'cuidadoraSilla',3.75); return g; }
    const a=mk.rosa(), b=mk.daniel(), c=mk.ernesto(); a.position.x=-1.6; b.position.x=.1; c.position.x=1.75; b.rotation.y=-.35; c.rotation.y=-.3; g.add(a,b,c); return g; }
  function scene2(){ const g=new T.Group();
    if(IL) fig2d(g,'agotada',3.9,-.25); else { const a=mk.rosa(); a.position.x=-.7; g.add(a); }
    const ck=reloj(IL?-1.95:1.15,IL?3.45:1.55); if(IL) ck.scale.setScalar(.72); g.add(ck); g.userData.clock=ck; return g; }
  // «¡Mentiraaa!»: estallido rosa con borde rojo que salta después del globo, sacude y se va (ciclo de 6 s).
  // El texto vive en MENTIRA para cambiarlo en un solo lugar.
  const MENTIRA="¡Mentiraaa!";
  function estallido(x,y){ const g=new T.Group(); g.position.set(x,y,.35);
    const sh=new T.Shape(), n=15;
    for(let i=0;i<=n*2;i++){ const a=i/(n*2)*Math.PI*2, r=i%2?.8:1, px=Math.cos(a)*r*1.45, py=Math.sin(a)*r*.66; if(i) sh.lineTo(px,py); else sh.moveTo(px,py); }
    const geo=new T.ExtrudeGeometry(sh,{depth:.1,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:3});
    const borde=new T.Mesh(geo,gummy("#C0435A")); borde.scale.set(1.07,1.12,1); borde.position.z=-.07; g.add(borde);
    g.add(new T.Mesh(geo,new T.MeshBasicMaterial({color:lc("#FFE8EE")})));   // cara sin sombreado: rosa limpio
    const lb=M.txt(MENTIRA,2.45,"#B3264A",84); lb.position.set(0,.02,.22); g.add(lb);
    g.scale.setScalar(reduce?.8:0); return g; }
  function scene3(){ const g=new T.Group();
    if(IL) fig2d(g,'dobleJornada',3.5,-.45); else { const a=mk.rosa(); a.position.x=-.95; g.add(a); }
    const bb=globo(IL?1.0:1.35,IL?3.95:2.6); if(IL) bb.scale.setScalar(.85); g.add(bb); g.userData.bubble=bb;
    const mt=estallido(IL?1.6:1.5,IL?2.6:1.5); g.add(mt); g.userData.mentira=mt; return g; }
  function scene4(){ const g=new T.Group();
    if(IL){ fig2d(g,'oficina',3.6,0,'dolorHogar'); return g; }
    const e0=F.eyes.length; const a=mk.rosa(); a.position.x=-.6; a.rotation.z=.06; g.add(a); F.eyes.slice(e0).forEach(e=>{ e.tired=true; });
    const drop=gota(-.05,2.55); g.add(drop); g.add(maletin(1.15,.42));
    const ex=alerta(.35,3.25); g.add(ex);
    g.userData.drop=drop; g.userData.ex=ex; return g; }
  const vign=[scene0,scene1,scene2,scene3,scene4].map((fn,i)=>{ const g=fn(); g.userData.cards=[i]; st.root.add(g); return g; });
  const blobs=vign.map(()=>st.blob(0,.15,4.6,1.6));
  lay.push(()=>vign.forEach((g,i)=>{ g.position.x=blobs[i].position.x=colX(i,5,HW); }));
  st.collect(); st.resize();
  // giro de las figuras 2D hacia el cursor (en reposo, vaivén lento); el brillo sigue al giro
  const ptr={x:0,t:-1e9}, pv=new T.Vector3();
  window.addEventListener('pointermove',e=>{ const r=cv.getBoundingClientRect(); if(!r.width) return; ptr.x=((e.clientX-r.left)/r.width)*2-1; ptr.t=performance.now(); },{passive:true});
  interact(st,vign,cards,F,(t,hover)=>{ const now=performance.now();
    vign.forEach((g,i)=>(g.userData.standees||[]).forEach(s=>{ const S=s.userData.standee; s.getWorldPosition(pv); pv.project(st.camera);
      const tg=reduce?0:(now-ptr.t>4000)?Math.sin(now/2600+i*1.1)*.22:Math.max(-1,Math.min(1,(ptr.x-pv.x)*1.6))*.5;
      if(S.dos&&!reduce&&now>S.next){ S.giroT+=Math.PI; S.next=now+5500; }
      S.ry+=(tg-S.ry)*.08; S.giro+=(S.giroT-S.giro)*.05; S.fig.rotation.y=S.giro+S.ry; S.sm.scale.x=.75+.25*Math.abs(Math.cos(S.giro+S.ry));
      S.artM.uniforms.uSweep.value=.62+S.ry*1.5+(hover===i&&!reduce?Math.sin(now/650)*.35:0);
      S.artM.uniforms.uAmt.value+=((hover===i?.9:.45)-S.artM.uniforms.uAmt.value)*.1; }));
    vign[2].userData.clock.rotation.z=Math.sin(t/500)*.12;
    const bb=vign[3].userData.bubble; bb.position.y=bb.userData.y0+Math.sin(t/700)*.06;
    // «¡Mentiraaa!»: 0–1.8 s oculto · salta con rebote · sacude · 5.2–5.6 s se encoge (con menos movimiento queda fijo)
    const mt=vign[3].userData.mentira; if(mt&&!reduce){ const c=now%6000, E=.8;
      let k=0; if(c>1800&&c<2400){ const u=(c-1800)/600; k=1-Math.cos(u*Math.PI*2.5)*Math.exp(-u*5); } else if(c>=2400&&c<5200) k=1; else if(c>=5200&&c<5600) k=1-(c-5200)/400;
      mt.scale.setScalar(Math.max(.001,k*E)); mt.rotation.z=(c>2000&&c<5200)?Math.sin(c/70)*.07*Math.exp(-(c-2000)/900):0; }
    const dr=vign[4].userData.drop; if(dr){ dr.position.y=dr.userData.y0-((t/1600)%1)*.7; vign[4].userData.ex.scale.setScalar(1+.12*Math.max(0,Math.sin(t/260))); } });
})(); }catch(e){ sin3d('embudo'); }

// ======================= 3 · Lo que encontramos =======================
try{ (function(){
  const cv=$('#c3-hallazgos'), cards=$$('#cards-hallazgos .fr-card'); if(!cv) return;
  const O={hw:8,hwN:6.6,lookY:1.45,up:1.5,dMin:12}; let HW=O.hw; const lay=[];
  const st=M.makeStage(cv,{fov:26,onResize:(cam,r)=>{ HW=fit(cam,r,O); lay.forEach(f=>f()); }});
  const B=gummy("#ECE6F3"), built=[];
  const LG=GL['Regresión logística'];
  // a · Columnas a escala: daño con menos de 20 h y con 40 h o más (entre quienes dicen «no tuve necesidad»)
  (function(){ const g=new T.Group();
    g.add(at(new T.Mesh(roundedBox(2.3,.22,1.3,.08,3),B),0,.11,0));
    const k=.034, h1=C.dano[0].pct*k, h2=C.dano[2].pct*k;
    g.add(at(new T.Mesh(roundedBox(.78,h1,.78,.17,4),gummy("#AA95D1")),-.55,.22+h1/2,0));
    const c2=at(new T.Mesh(roundedBox(.78,h2,.78,.17,4),gummy("#C0435A")),.55,.22+h2/2,0); g.add(c2);
    g.add(at(M.txt(fmt(C.dano[0].pct)+'%',1.1,INK,92),-.55,.22+h1+.24,0), at(M.txt(fmt(C.dano[2].pct)+'%',1.1,"#a8344a",92),.55,.22+h2+.24,0));
    g.add(at(M.txt('< 20 h',.95,SOFT,84),-.55,.11,.7), at(M.txt('40 h +',.95,SOFT,84),.55,.11,.7));
    built.push({g,tick:(t,hot)=>{ c2.scale.y=1+(hot?.035*Math.sin(t/110):0); }}); })();
  // b · Charola de 100 esferas; las distintas son el % que dice no saber que existen los servicios (redondeado)
  (function(){ const g=new T.Group();
    const tray=new T.Group(); tray.position.y=1.15; tray.rotation.x=.85; g.add(tray);
    tray.add(new T.Mesh(roundedBox(2.4,2.4,.18,.08,3),B));
    const geo=new T.SphereGeometry(.088,16,12), big=new T.SphereGeometry(.15,24,16), mOff=gummy("#C9BDE0"), mOdd=gummy("#E59A1E");
    const nOdd=Math.max(0,Math.min(100,Math.round(des.pct))), odd=[];
    for(let i=0;i<10;i++) for(let j=0;j<10;j++){ const idx=((i*10+j)*37+69)%100, isOdd=idx<nOdd;   // orden fijo y disperso; con 1 queda en (6,3)
      const m=new T.Mesh(isOdd?big:geo,isOdd?mOdd:mOff); m.position.set(-.99+i*.22,-.99+j*.22,.16); tray.add(m); if(isOdd) odd.push(m); }
    g.add(at(new T.Mesh(new T.CylinderGeometry(.08,.14,1.0,16),B),0,.5,-.35));
    g.add(at(M.txt('≈ '+nOdd+' de cada 100',2.2,"#8a5c12",80),0,2.45,0));
    built.push({g,tick:(t,hot)=>{ odd.forEach(o=>{ o.position.z=.16+Math.abs(Math.sin(t/(hot?150:420)))*(hot?.5:.25); }); }}); })();
  // c · Aros: % de hogares que podría pagar 6 h/semana y la jornada completa (arco proporcional)
  (function(){ const g=new T.Group(), rs=[];
    [[r6,-.78,"#23806F"],[r40,.78,"#C0435A"]].forEach(([row,x,c])=>{ const p=row.u20/100, r=new T.Group(); r.position.set(x,1.05,0);
      r.add(at(M.txt(fmt(row.u20)+'%',.7,INK,92),0,0,.1)); g.add(at(M.txt(row.horas+' h/sem',1.0,SOFT,84),x,.1,.3));
      r.add(new T.Mesh(new T.TorusGeometry(.6,.17,20,72),B));
      const arc=new T.Mesh(new T.TorusGeometry(.6,.21,20,96,Math.max(.05,2*Math.PI*p)),gummy(c)); arc.rotation.z=Math.PI/2; r.add(arc); g.add(r); rs.push(r); });
    built.push({g,tick:(t,hot)=>{ rs.forEach((r,i)=>{ r.rotation.y=Math.sin(t/900+i)*.3*(hot?2:1); }); }}); })();
  // d · Balanza: la inclinación recorre el IC 90% de la diferencia de cobertura modelo − regla
  (function(){ const g=new T.Group(), Mm=gummy("#77689D"), Lm=gummy("#AA95D1");
    g.add(at(new T.Mesh(new T.CylinderGeometry(.7,.85,.2,40),B),0,.1,0));
    g.add(at(new T.Mesh(new T.CylinderGeometry(.08,.1,2.0,20),Mm),0,1.15,0));
    const piv=new T.Group(); piv.position.y=2.2; g.add(piv);
    piv.add(new T.Mesh(roundedBox(2.6,.12,.18,.05,3),Mm)); piv.add(new T.Mesh(new T.SphereGeometry(.16,24,16),Lm));
    const hangs=[];
    [-1.2,1.2].forEach((x,i)=>{ const h=new T.Group(); h.position.x=x; piv.add(h);
      [-.28,.28].forEach(dx=>{ const s2=new T.Mesh(new T.CylinderGeometry(.015,.015,.8,8),Mm); s2.position.set(dx/2,-.4,0); s2.rotation.z=dx>0?-.33:.33; h.add(s2); });
      h.add(at(new T.Mesh(new T.CylinderGeometry(.42,.32,.1,32),i?Lm:B),0,-.82,0)); h.add(at(M.txt(i?'Modelo':'Regla 40 h',1.1,SOFT,84),0,-1.1,.1)); hangs.push(h); });
    const mid=(LG.dif_li90+LG.dif_ls90)/2, half=(LG.dif_ls90-LG.dif_li90)/2;
    built.push({g,tick:(t,hot)=>{ const pp=mid+half*Math.sin(t/(hot?500:1400)), ang=-pp*.9*Math.PI/180; piv.rotation.z=ang; hangs.forEach(h=>{ h.rotation.z=-ang; }); }}); })();
  const groups=built.map((b,i)=>{ b.g.userData.cards=[i]; b.g.userData.s0=1.1; b.g.userData.bounce=false; b.g.scale.setScalar(1.1); b.g.rotation.y=-.25; st.root.add(b.g); return b.g; });
  const blobs=built.map(()=>st.blob(0,.25,3.2,2.2));
  lay.push(()=>groups.forEach((g,i)=>{ g.position.x=blobs[i].position.x=colX(i,4,HW); }));
  st.collect(); st.resize();
  interact(st,groups,cards,null,(t,hover)=>{ const now=performance.now();
    built.forEach((b,i)=>{ const on=i===hover; b.g.position.y+=((on?.18:0)-b.g.position.y)*.12;
      b.g.rotation.y+=((on&&!reduce?.4*Math.sin(now/700):-.25)-b.g.rotation.y)*.08; b.tick(t,on); }); });
})(); }catch(e){ sin3d('hallazgos'); }
})();
