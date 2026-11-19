/* Aviso de privacidad y contratos de RedCare. Namespace: Care.contratos
 *
 * 18 nov 2026. RedCare se trata como proyecto del SECTOR PRIVADO: la organización que la opere es la
 * responsable y aplica la LFPDPPP (DOF 20-mar-2025). Textos tomados de
 * Documentos/Observatorio_Cuidado_Proteccion_de_Datos.docx (anexos A y B). Son BORRADORES académicos:
 * sin revisión jurídica final (Daniel) y sin validez legal. Los datos de la app son simulados.
 *
 * Flujo: al terminar «Necesito cuidado» se firma el Acuerdo de servicio; al terminar «Puedo cuidar»,
 * el Contrato de trabajo en plataforma digital con convenio de confidencialidad. Sin firma no se envía.
 * Minimización: de la firma dibujada solo se guarda una huella (hash), no la imagen.
 */
(function () {
  'use strict';

  const VERSION = '2026-11-18 · borrador v1';
  const RESP = 'RedCare (organización privada por constituir)';

  /* ---------------- Aviso de privacidad ---------------- */
  const AVISO_SIMPLIFICADO = [
    `**${RESP}** es responsable de los datos personales que proporciones en la app.`,
    '**Para qué usamos tus datos:** (1) revisar si tu caso cumple la regla de entrada; (2) organizar el relevo: tareas, horario y la persona que acudirá; (3) dar seguimiento a cómo te va (cansancio, sueño y empleo). Si lo autorizas, además (4) usaremos tus datos sin nombre ni domicilio para estadísticas del Observatorio del Cuidado. Esta autorización es opcional y negarla no cambia tu servicio.',
    '**Datos sensibles:** pedimos información sobre la salud y la ayuda que necesita la persona que cuidas. Solo la registramos con consentimiento expreso y por escrito de esa persona o de quien la apoye.',
    '**Transferencias:** no compartimos tus datos con terceros sin tu consentimiento, salvo en los casos que permite la ley.',
    '**Tus derechos:** puedes acceder, rectificar, cancelar u oponerte al uso de tus datos con el botón «Mis datos» o escribiendo a la persona de datos personales de RedCare.',
  ];
  const AVISO_INTEGRAL = [
    ['1. Responsable', `${RESP}. Su persona o departamento de datos personales atiende tus solicitudes en [correo y teléfono] (LFPDPPP, art. 29).`],
    ['2. Datos que recabamos', 'De la persona cuidadora: alias, alcaldía, horas semanales de cuidado, sexo (solo para seguimiento de equidad) y respuestas de seguimiento sobre cansancio, sueño y empleo. De la persona cuidada: alias, ayuda que necesita en actividades básicas, si requiere tareas clínicas e índice de dependencia (Barthel). Del hogar: domicilio, solo cuando se asigna una persona de relevo. De la persona de relevo: nombre, CURP, identificación, fecha de la carta de no antecedentes penales, una referencia y datos para el pago.'],
    ['3. Datos sensibles', 'Son sensibles los datos de salud de la persona cuidada y los de cansancio y sueño de la persona cuidadora. Solo se tratan con consentimiento expreso y por escrito, con firma autógrafa o electrónica (LFPDPPP, art. 8). No pedimos diagnósticos ni la CURP de la familia.'],
    ['4. Finalidades necesarias', 'Revisar la regla de entrada; organizar y asignar el relevo; dar seguimiento al servicio; atender incidentes; pagar a la persona de relevo. La revisión de la entrada nunca es solo automática: siempre la confirma una persona (art. 26).'],
    ['5. Finalidad opcional', 'Estadísticas disociadas para el Observatorio del Cuidado. Puedes negarte al registrarte o después, con el botón «Mis datos», sin que cambie tu servicio.'],
    ['6. Transferencias', 'No transferimos tus datos a terceros. Si en el futuro lo hiciéramos fuera de los casos que permite la ley, te pediremos tu aceptación (arts. 35 y 36). Nuestros proveedores de nube, pagos y verificación tratan datos solo por cuenta de RedCare.'],
    ['7. Derechos ARCO', 'Puedes acceder, rectificar, cancelar u oponerte al tratamiento, y revocar tu consentimiento. Es gratuito. Respondemos en 20 días y, si procede, lo hacemos efectivo en 15 (arts. 27, 28, 31 y 34). Si no estás de acuerdo, puedes acudir a la Secretaría Anticorrupción y Buen Gobierno (art. 40).'],
    ['8. Conservación', 'El domicilio se borra al cerrar el caso. Los datos de salud se bloquean durante [plazo] y después se suprimen (arts. 2, fr. III, y 10). Las estadísticas disociadas se conservan.'],
    ['9. Tecnologías de rastreo', 'La app no usa cookies de publicidad ni rastreo de terceros.'],
    ['10. Cambios al aviso', 'Cualquier cambio se avisará en la app antes de aplicarse.'],
  ];

  /* ---------------- Acuerdo de servicio («Necesito cuidado») ---------------- */
  const SERVICIO = {
    id: 'servicio',
    titulo: 'Acuerdo de servicio de relevo y consentimiento',
    partes: `${RESP}, la persona cuidadora familiar y la persona que recibe cuidado (con su persona de apoyo, si la designa).`,
    clausulas: [
      ['Primera. Objeto.', 'RedCare organiza relevo por horas para la persona cuidadora: una persona de relevo verificada acompaña a la persona cuidada durante las horas por semana asignadas, en el horario pactado.'],
      ['Segunda. Alcance.', 'El relevo incluye solo las tareas elegidas en la solicitud. **No incluye** tareas clínicas, administración de medicamentos, curaciones, atención de emergencias, supervisión fuera del horario pactado, manejo de dinero ni custodia de bienes.'],
      ['Tercera. Obligaciones de la familia.', 'Dar información veraz y avisar cualquier cambio de salud de la persona cuidada; no pedir tareas fuera de la lista; dar condiciones seguras en el hogar; estar localizable durante el relevo.'],
      ['Cuarta. Obligaciones de RedCare.', 'Verificar identidad, mayoría de edad, antecedentes y referencia de la persona de relevo y conservar la constancia; capacitarla; sustituirla si falta; atender incidentes; mantener un seguro de responsabilidad civil; proteger los datos personales conforme al aviso de privacidad.'],
      ['Quinta. Persona de relevo.', 'RedCare responde por la persona de relevo que asigna. Esta cumple horario y tareas pactadas, se niega a tareas fuera de la lista y avisa, guarda confidencialidad y reporta cualquier incidente el mismo día.'],
      ['Sexta. Emergencias.', 'Ante una emergencia, la persona de relevo llama al 911, avisa a la persona cuidadora y a coordinación, y registra el incidente. RedCare no es un servicio médico ni de emergencias.'],
      ['Séptima. Incidentes.', 'Cualquier parte puede reportar un incidente en la app. Si hay indicios de maltrato o de un delito, RedCare lo canaliza a la autoridad competente.'],
      ['Octava. Veracidad.', 'La persona cuidadora declara que la información que proporciona es cierta. Dar información falsa es incumplimiento del acuerdo, y RedCare no responde por las decisiones que se tomen con ella.'],
      ['Novena. Visitas no prestadas.', 'Si una visita no se presta por causas imputables a RedCare, esta la reprograma o devuelve su costo, a elección de la familia, sin perjuicio de la responsabilidad civil que proceda. Nadie responde por caso fortuito o fuerza mayor que no haya provocado.'],
      ['Décima. Seguro.', 'RedCare mantiene un seguro de responsabilidad civil por daños que cause la persona de relevo en el ejercicio de sus funciones.'],
      ['Undécima. Datos personales.', 'Los datos se tratan conforme al aviso de privacidad. La persona cuidada, o su apoyo, consiente por separado el tratamiento de sus datos de salud.'],
      ['Duodécima. Terminación.', 'La familia puede terminar el servicio en cualquier momento; RedCare, avisando con 7 días. RedCare no puede modificar este acuerdo sin el consentimiento de la familia.'],
    ],
    aceptaciones: [
      ['clausulas', 'Leímos el acuerdo y aceptamos sus 12 cláusulas'],
      ['sensibles', 'La persona cuidada (o su apoyo) consiente de forma expresa el tratamiento de sus datos de salud (LFPDPPP, art. 8)'],
      ['veracidad', 'La información que dimos es cierta'],
    ],
  };

  /* ---------------- Contrato de la persona de relevo («Puedo cuidar») ---------------- */
  const RELEVO = {
    id: 'relevo',
    titulo: 'Contrato de trabajo en plataforma digital y convenio de confidencialidad',
    partes: `${RESP} y la persona de relevo.`,
    clausulas: [
      ['Primera. Objeto.', 'La persona de relevo presta servicios de acompañamiento y cuidado por horas en hogares que RedCare le asigna (Ley Federal del Trabajo, Título Sexto, cap. IX Bis, y trabajo del hogar, arts. 331 a 343).'],
      ['Segunda. Pago.', 'Al menos el salario mínimo profesional de personas trabajadoras del hogar, por hora según el tipo de jornada (diurna, mixta o nocturna). RedCare no cobra a la persona de relevo por inscribirse ni por usar la app.'],
      ['Tercera. Seguridad social.', 'RedCare da de alta a la persona de relevo en el IMSS conforme a la ley aplicable a plataformas digitales.'],
      ['Cuarta. Jornada.', 'Cada visita respeta la jornada máxima de su tipo: diurna 8 h, nocturna 7 h, mixta 7.5 h (LFT, arts. 60 y 61) y el máximo de horas por semana que la persona registró.'],
      ['Quinta. Tareas.', 'Solo las tareas pactadas con cada familia. Debe negarse a tareas clínicas, administración de medicamentos, curaciones y manejo de dinero, y avisar a coordinación.'],
      ['Sexta. Política de gestión algorítmica.', 'Los casos entran por la regla de 40 horas de cuidado a la semana y siempre los confirma una persona. La app propone a una persona de relevo que esté aprobada y certificada, cerca del hogar, disponible en los días y horario, con cupo y que cubra las tareas; entre quienes cumplen, la más cercana. No hay calificaciones automáticas que sancionen. La persona de relevo puede pedir revisión humana de cualquier decisión.'],
      ['Séptima. Confidencialidad.', 'La persona de relevo no divulga datos personales ni lo que vea u oiga en los hogares, aun después de terminar la relación (LFPDPPP, art. 20). Solo ve el domicilio y las tareas del caso asignado mientras dura el servicio.'],
      ['Octava. Incidentes y emergencias.', 'Ante una emergencia llama al 911 y avisa a la familia y a coordinación. Reporta cualquier incidente el mismo día. Puede reportar también malos tratos que reciba.'],
      ['Novena. Datos personales.', 'Sus datos se tratan conforme al aviso de privacidad de RedCare. De la carta de no antecedentes penales solo se guarda el resultado y la fecha, no el documento.'],
      ['Décima. Terminación.', 'Cualquiera de las partes puede terminar la relación conforme a la Ley Federal del Trabajo.'],
    ],
    aceptaciones: [
      ['clausulas', 'Leí el contrato y acepto sus 10 cláusulas'],
      ['confidencialidad', 'Acepto el convenio de confidencialidad (cláusula séptima)'],
      ['algoritmo', 'Leí cómo asigna casos la app (política de gestión algorítmica, cláusula sexta)'],
    ],
  };

  /* Firma por la persona cuidada (modelo de apoyos, Código Nacional de Procedimientos Civiles y Familiares). */
  const MODALIDADES = [
    ['propia', 'Firma ella misma', ''],
    ['apoyo', 'Firma con su persona de apoyo', 'Nombre de la persona de apoyo'],
    ['judicial', 'No puede expresar su voluntad: firma el apoyo designado por un juez', 'Referencia de la resolución judicial'],
    ['menor', 'Es menor de edad: firma quien ejerce la patria potestad o tutela', 'Nombre de quien firma'],
  ];
  const DOCS = { servicio: SERVICIO, relevo: RELEVO };

  /* ---------------- utilidades ---------------- */
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const md = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  const $ = (sel, root) => (root || document).querySelector(sel);

  /** Huella de una firma: SHA-256 (si el navegador lo permite) o un hash simple. Nunca se guarda la imagen. */
  async function huella(texto) {
    try {
      if (window.crypto && crypto.subtle && window.TextEncoder) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
        return 'sha256:' + Array.from(new Uint8Array(buf)).slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) { /* sin contexto seguro: se usa el hash simple */ }
    let h = 2166136261;
    for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
    return 'fnv:' + (h >>> 0).toString(16);
  }

  /* ---------------- Pad de firma ---------------- */
  function padFirma(canvas) {
    const ctx = canvas.getContext('2d');
    let trazos = 0, dibujando = false;
    const ajustar = () => {
      const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#2b3045';
      trazos = 0;
    };
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    canvas.addEventListener('pointerdown', (e) => { dibujando = true; canvas.setPointerCapture(e.pointerId); const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); e.preventDefault(); });
    canvas.addEventListener('pointermove', (e) => { if (!dibujando) return; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); trazos++; e.preventDefault(); });
    const marca = () => canvas.parentNode.classList.toggle('ok', trazos > 4);
    const fin = () => { if (dibujando) { dibujando = false; marca(); canvas.dispatchEvent(new Event('firma', { bubbles: true })); } };
    canvas.addEventListener('pointerup', fin); canvas.addEventListener('pointercancel', fin);
    return {
      ajustar,
      limpiar() { ctx.clearRect(0, 0, canvas.width, canvas.height); trazos = 0; marca(); canvas.dispatchEvent(new Event('firma', { bubbles: true })); },
      firmado: () => trazos > 4,
      datos: () => canvas.toDataURL('image/png'),
    };
  }

  /* ---------------- Diálogo del aviso ---------------- */
  function htmlAviso() {
    return `<div class="doc-legal">
      <div class="eyebrow">Aviso simplificado</div>
      ${AVISO_SIMPLIFICADO.map((p) => `<p>${md(p)}</p>`).join('')}
      <details class="aviso-int"><summary>Aviso de privacidad integral</summary>
        ${AVISO_INTEGRAL.map(([t, x]) => `<p><b>${esc(t)}.</b> ${md(x)}</p>`).join('')}
      </details>
    </div>`;
  }
  function verAviso() {
    $('#aviso-body').innerHTML = htmlAviso();
    const dlg = $('#dlg-aviso'); dlg.showModal(); dlg.scrollTop = 0;
  }

  /* ---------------- Diálogo del contrato ---------------- */
  function htmlClausulas(doc) {
    return `<div class="doc-legal">
      <p class="doc-partes"><b>Partes:</b> ${esc(doc.partes)}</p>
      ${doc.clausulas.map(([t, x]) => `<p><b>${esc(t)}</b> ${md(x)}</p>`).join('')}
    </div>`;
  }

  /**
   * Abre el contrato para firmar. tipo: 'servicio' | 'relevo'.
   * datos: { cuidadora, cuidada } o { nombre }. Devuelve una promesa con el registro de firma, o null si se cancela.
   */
  function firmar(tipo, datos) {
    const doc = DOCS[tipo], dlg = $('#dlg-contrato'), f = $('#form-contrato');
    const d = datos || {};
    const firmantes = tipo === 'servicio'
      ? [{ rol: 'cuidadora', etiqueta: 'Persona cuidadora familiar', nombre: d.cuidadora || '' }, { rol: 'cuidada', etiqueta: 'Persona que recibe cuidado', nombre: d.cuidada || '' }]
      : [{ rol: 'relevo', etiqueta: 'Persona de relevo', nombre: d.nombre || '' }];
    $('#ctr-titulo').textContent = doc.titulo;
    $('#ctr-version').textContent = VERSION;
    $('#ctr-body').innerHTML = `${htmlClausulas(doc)}
      <div class="eyebrow sep">Aceptación</div>
      ${doc.aceptaciones.map(([k, t]) => `<label class="check"><input type="checkbox" name="acp-${k}"><span>${esc(t)}</span></label>`).join('')}
      <div class="eyebrow sep">Firmas</div>
      ${firmantes.map((s, i) => `<fieldset class="firma-blk" data-rol="${s.rol}">
        <legend>${esc(s.etiqueta)}</legend>
        <label class="fld">Nombre o alias<input name="nom-${i}" maxlength="60" autocomplete="off" value="${esc(s.nombre)}"></label>
        ${s.rol === 'cuidada' ? `<label class="fld">¿Quién firma por esta persona?<select name="modalidad">${MODALIDADES.map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join('')}</select></label>
          <label class="fld" id="ctr-apoyo" hidden><span id="ctr-apoyo-lab"></span><input name="apoyo" maxlength="80" autocomplete="off"></label>
          <p class="doc-nota">Ser familiar no da derecho a firmar por otra persona: firma ella misma o el apoyo que ella o un juez designen.</p>` : ''}
        <div class="pad-wrap"><canvas class="pad" data-i="${i}" aria-label="Recuadro para firmar con el dedo o el ratón"></canvas><span class="pad-ph">Firma aquí</span></div>
        <button type="button" class="link sm" data-limpiar="${i}">Borrar firma</button>
      </fieldset>`).join('')}
      <p class="doc-nota">Firma electrónica simulada para el prototipo: se guarda la fecha y una huella de la firma, no la imagen. Datos de demostración; borrador sin validez legal hasta la revisión jurídica.</p>`;
    $('#ctr-err').textContent = '';
    dlg.showModal(); dlg.scrollTop = 0;
    const pads = Array.from(f.querySelectorAll('canvas.pad')).map(padFirma);
    requestAnimationFrame(() => pads.forEach((p) => p.ajustar()));
    f.querySelectorAll('[data-limpiar]').forEach((b) => b.addEventListener('click', () => pads[+b.dataset.limpiar].limpiar()));
    const sel = f.elements.modalidad;
    const pintaApoyo = () => {
      if (!sel) return;
      const m = MODALIDADES.find((x) => x[0] === sel.value);
      $('#ctr-apoyo').hidden = !m[2]; $('#ctr-apoyo-lab').textContent = m[2];
    };
    if (sel) { sel.addEventListener('change', pintaApoyo); pintaApoyo(); }
    const listo = () => {
      const faltan = [];
      doc.aceptaciones.forEach(([k]) => { if (!f.elements['acp-' + k].checked) faltan.push('aceptaciones'); });
      firmantes.forEach((s, i) => {
        if (f.elements['nom-' + i].value.trim().length < 2) faltan.push('nombre');
        if (!pads[i].firmado()) faltan.push('firma');
      });
      if (sel && sel.value !== 'propia' && f.elements.apoyo.value.trim().length < 3) faltan.push('apoyo');
      $('#ctr-firmar').disabled = faltan.length > 0;
      return faltan;
    };
    const onCambio = () => { listo(); $('#ctr-err').textContent = ''; };
    f.addEventListener('input', onCambio); f.addEventListener('change', onCambio); f.addEventListener('firma', onCambio);
    listo();

    return new Promise((resolve) => {
      const fin = (v) => {
        f.onsubmit = null; dlg.onclose = null;
        f.removeEventListener('input', onCambio); f.removeEventListener('change', onCambio); f.removeEventListener('firma', onCambio);
        if (dlg.open) dlg.close(); resolve(v);
      };
      f.onsubmit = async (e) => {
        e.preventDefault();
        const faltan = listo();
        if (faltan.length) { $('#ctr-err').textContent = 'Faltan aceptaciones, nombres o firmas.'; return; }
        const ahora = new Date().toISOString();
        const reg = { tipo, version: VERSION, titulo: doc.titulo, fecha: ahora, aceptaciones: doc.aceptaciones.map(([k]) => k), firmantes: [] };
        for (let i = 0; i < firmantes.length; i++) {
          const s = firmantes[i], x = { rol: s.rol, nombre: f.elements['nom-' + i].value.trim(), huella: await huella(pads[i].datos() + ahora) };
          if (s.rol === 'cuidada') { x.modalidad = sel.value; if (sel.value !== 'propia') x.apoyo = f.elements.apoyo.value.trim(); }
          reg.firmantes.push(x);
        }
        fin(reg);
      };
      dlg.onclose = () => fin(null);
      $('#ctr-cancelar').onclick = () => fin(null);
    });
  }

  /** Muestra un contrato ya firmado (solo lectura). */
  function verFirmado(reg) {
    if (!reg) return;
    const doc = DOCS[reg.tipo];
    const mod = (m) => (MODALIDADES.find((x) => x[0] === m) || [, ''])[1];
    $('#aviso-body').innerHTML = `<h3>${esc(doc.titulo)}</h3>
      <p class="doc-nota">Firmado el ${esc(reg.fecha.slice(0, 10))} · ${esc(reg.version)}</p>
      ${htmlClausulas(doc)}
      <div class="eyebrow sep">Firmas</div>
      <ul class="motivos">${reg.firmantes.map((s) => `<li><b>${esc(s.nombre)}</b> (${esc(s.rol)})${s.modalidad ? ' · ' + esc(mod(s.modalidad)) + (s.apoyo ? ': ' + esc(s.apoyo) : '') : ''} · <span class="mono">${esc(s.huella)}</span></li>`).join('')}</ul>`;
    const dlg = $('#dlg-aviso'); dlg.showModal(); dlg.scrollTop = 0;
  }

  const api = { VERSION, AVISO_SIMPLIFICADO, AVISO_INTEGRAL, SERVICIO, RELEVO, MODALIDADES, huella, verAviso, firmar, verFirmado };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') { window.Care = window.Care || {}; window.Care.contratos = api; }
})();
