/* Aviso de privacidad integral de RedCare, con estructura. Namespace: Care.aviso
 * 24 nov 2026: sustituye al texto corrido de config.js (aviso_privacidad). Reproduce el aviso integral v3
 * (Documentos/Aviso_de_Privacidad_RedCare_v3). Prototipo con datos simulados: nada aquí es asesoría jurídica.
 * La parte de consentimiento y firma del documento no va aquí: en la app se da en las casillas del registro.
 */
(function (raiz) {
  'use strict';
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const VERSION = '3.0 · 24 de noviembre de 2026';
  const DOMICILIO = 'Calle Prototipo 000, Colonia Simulada, Ciudad de México (ficticio)';

  const RESUMEN = [
    { t: 'No vendemos tus datos', d: 'Cada quien ve solo lo mínimo necesario.' },
    { t: 'Una persona revisa', d: 'Ninguna asignación es automática.' },
    { t: 'Domicilio temporal', d: 'Se pide al asignar relevo y se borra al cerrar el caso.' },
    { t: 'Tú decides', d: 'Acceso, corrección, cancelación, oposición y retiro del consentimiento.' },
  ];

  /* Bloques: p, nota, sub, lista, tarjetas {filas: [[titulo, dato, por qué?]], etiquetas}. */
  function secciones(CP) {
    const op = CP.operador || 'RedCare', ct = CP.contacto_datos || 'contacto por definir';
    return [
      { n: 1, titulo: 'Responsable', abierta: true, bloques: [
        { p: `${op}, con domicilio en ${DOMICILIO}, es responsable del tratamiento de tus datos conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (DOF 20-mar-2025). Contacto del área de datos personales: ${ct}.` },
        { nota: 'En un piloto, el responsable sería la asociación civil que opere RedCare bajo convenio con el Gobierno de la Ciudad. Si el responsable fuera una institución pública, aplicaría la ley general para sujetos obligados y cambiarían la autoridad y los plazos.' },
      ] },
      { n: 2, titulo: 'Datos que tratamos y de quién', bloques: [
        { p: 'Los recabamos de ti al registrarte, en el seguimiento y durante el servicio. Si una institución te canaliza (DIF, centro de salud, escuela, clínica, módulo o alcaldía), solo registramos el tipo de institución y el cargo de quien te refiere, sin su nombre. Usamos alias en lugar de nombres.' },
        { tarjetas: { et: ['Cuándo y por qué'], filas: [
          ['Cuidadora familiar', 'Alias, sexo, alcaldía, horas de cuidado a la semana, si hace tareas de salud (sí o no), cuestionario «cómo te sientes» (opcional) y, cada semana, cansancio, noches de mal sueño y si pudo trabajar o estudiar.', 'Al registrarse y en el seguimiento. El sexo solo se usa para revisar la equidad del programa.'],
          ['Persona que recibe el cuidado', 'Alias, sexo, índice de dependencia (Barthel) y su consentimiento: propio o por representante, con el tipo de documento que lo acredita (no se guarda copia).', 'El Barthel solo se captura con su consentimiento.'],
          ['Hogar', 'Domicilio para las visitas.', 'Solo cuando se asigna relevo; se borra al cerrar el caso.'],
          ['Persona de relevo', 'Nombre, sexo, alcaldía, CURP (se verifica y solo se guarda una huella y los últimos 4 caracteres), tipo de identificación presentada, disponibilidad, tareas, certificación, una referencia (nombre y teléfono, que se borran al resolver el registro), banco y últimos 4 dígitos de su cuenta de pago, y el contrato firmado.', 'Para verificar, asignar y pagar. La cuenta completa la guarda el proveedor de pagos.'],
          ['Contacto de emergencia (opcional)', 'Nombre, parentesco y teléfono.', 'Solo para llamarle si hay una emergencia durante una visita.'],
          ['Persona autorizada (opcional)', 'Nombre, parentesco, teléfono y qué información puede recibir (horarios, incidentes).', 'Solo recibe lo que marques.'],
        ] } },
        { sub: 'Lo que no recabamos' },
        { p: 'No pedimos la CURP de la familia, diagnósticos, el detalle de actividades básicas, carta de no antecedentes penales, datos biométricos, el nombre completo de la cuidadora ni la cuenta bancaria completa de nadie.' },
      ] },
      { n: 3, titulo: 'Datos sensibles', bloques: [
        { p: 'Son sensibles las horas de cuidado, las tareas de salud, el Barthel, el cuestionario «cómo te sientes», el cansancio y el sueño. Los tratamos solo con tu consentimiento expreso y por escrito, que en la app se da en una casilla separada y con tu nombre escrito como firma electrónica; guardamos la fecha y una huella SHA-256 del texto que aceptaste.' },
        { nota: 'La pregunta semanal sobre trabajo o estudio no es un dato sensible, pero la tratamos con el mismo cuidado.' },
      ] },
      { n: 4, titulo: 'Para qué usamos tus datos', bloques: [
        { sub: 'Finalidades necesarias' },
        { lista: ['Registrarte y verificar la identidad de las personas de relevo.', 'Revisar si te corresponde relevo con la regla de entrada: cuidar 40 horas o más a la semana.', 'Repartir la bolsa mensual de horas entre los hogares que cumplen la regla.', 'Asignar a una persona de relevo según aprobación, certificación, cercanía, horario y tareas, y organizar las visitas.', 'Dar seguimiento (visitas, incidentes, cansancio, sueño, trabajo o estudio) y atender emergencias, quejas y apelaciones.', 'Firmar los convenios y contratos y pagar a las personas de relevo.'] },
        { sub: 'Finalidad opcional' },
        { p: 'Si lo autorizas, usamos tus datos sin nombre ni domicilio para estadísticas del Observatorio del Cuidado y para evaluar el piloto. Negarte no cambia tu acceso al servicio ni tus horas.' },
        { sub: 'Cómo se decide' },
        { p: 'La app calcula al momento un resultado preliminar con la regla de 40 horas. No se asignan puntos por sexo ni por condiciones de salud. Ninguna asignación es automática: una persona del programa revisa cada solicitud antes de asignar relevo, y las respuestas inconsistentes pasan a revisión. Puedes pedir revisión del resultado en cualquier momento.' },
      ] },
      { n: 5, titulo: 'Con quién compartimos tus datos', bloques: [
        { p: 'No vendemos tus datos. Solo los comunicamos en estos casos, y cada quien ve lo mínimo necesario.' },
        { tarjetas: { et: ['Para qué'], filas: [
          ['Persona de relevo asignada', 'Alias, domicilio, horario, tareas e indicaciones de seguridad.', 'Prestar el relevo. No ve el Barthel, el cuestionario ni las respuestas semanales; firma un contrato con cláusula de confidencialidad.'],
          ['Contacto de emergencia', 'Solo lo necesario para atender la emergencia.', 'Una llamada si ocurre una emergencia durante una visita.'],
          ['Persona autorizada', 'Lo que tú marques: horarios o incidentes.', 'Mantenerla informada.'],
          ['Institución que te canalizó', 'Solo si lo autorizas: el estado de tu solicitud.', 'Dar continuidad. Nunca datos de salud ni de la entrevista.'],
          ['IMSS', 'Los datos de la persona de relevo que exige su seguro de riesgos de trabajo.', 'Cumplir una obligación legal.'],
          ['Proveedores (servidor, base de datos, pagos)', 'Los mínimos para operar.', 'Actúan por cuenta de RedCare, con contrato que les prohíbe usar los datos para otros fines.'],
          ['Autoridades', 'Los que la ley obligue.', 'Cumplir una orden de autoridad competente.'],
        ] } },
      ] },
      { n: 6, titulo: 'Observatorio del Cuidado', bloques: [
        { p: 'El Observatorio solo recibe totales por alcaldía y nunca celdas con menos de 5 casos. Ningún dato personal, ni siquiera un alias, sale de RedCare hacia el Observatorio.' },
      ] },
      { n: 7, titulo: 'Contacto de emergencia y personas autorizadas', bloques: [
        { p: 'Son dos figuras distintas y opcionales. Al contacto de emergencia solo le llamamos si ocurre una emergencia durante una visita, y no le damos información de tu caso. La persona autorizada recibe solo lo que marques (horarios de visita o incidentes). Avísales que los registras.' },
        { p: 'Puedes cambiarlos o borrarlos en «Contactos», y ellos pueden pedir que borremos sus datos. Se borran al cerrar el caso.' },
      ] },
      { n: 8, titulo: 'Tus derechos', bloques: [
        { p: 'Puedes acceder a tus datos, rectificarlos, cancelarlos u oponerte a su uso (derechos ARCO), revocar tu consentimiento y limitar su uso. También puedes oponerte a decisiones tomadas solo de forma automatizada; en RedCare toda asignación pasa por una persona.' },
        { sub: 'Cómo pedirlo' },
        { p: `En «Mis datos» de la app, en ${ct} o en ${DOMICILIO}. Incluye un medio para responderte, un documento que acredite tu identidad o la de tu representante, qué derecho quieres ejercer y sobre qué datos.` },
        { sub: 'Plazos' },
        { p: 'Respondemos en un máximo de 20 días y, si procede, lo hacemos efectivo en los 15 días siguientes; cada plazo puede ampliarse una sola vez por un periodo igual si se justifica. Es gratuito.' },
        { sub: 'Autoridad' },
        { p: 'Si no estás de acuerdo con la respuesta, puedes acudir a la Secretaría Anticorrupción y Buen Gobierno.' },
      ] },
      { n: 9, titulo: 'Conservación y seguridad', bloques: [
        { tarjetas: { et: [], filas: [
          ['Referencia de la persona de relevo', 'Se borra al aprobar o rechazar su registro.'],
          ['Domicilio y contactos', 'Se borran al cerrar el caso.'],
          ['Datos del caso y respuestas semanales', 'Mientras el caso esté activo; al cerrarlo se bloquean y se suprimen a los 12 meses (plazo definido para el piloto).'],
          ['Estadísticas agregadas', 'Se conservan; no identifican a nadie.'],
        ] } },
        { sub: 'Medidas de seguridad' },
        { p: 'Minimización de datos, alias, huella SHA-256 con clave de la CURP, base de datos PostgreSQL con perfiles de acceso (el Observatorio solo lee agregados), bitácora de accesos que no se puede borrar y conexión cifrada (HTTPS). Si ocurre una vulneración que afecte de forma significativa tus derechos, te lo informaremos de inmediato.' },
      ] },
      { n: 10, titulo: 'Tecnologías en la app', bloques: [
        { p: 'La app no usa cookies de publicidad ni rastreo de terceros. Usa el almacenamiento local del navegador para guardar los datos simulados del prototipo y el papel que elegiste al entrar. Puedes borrarlo en Ajustes › Borrar todo o limpiando los datos del sitio en tu navegador.' },
      ] },
      { n: 11, titulo: 'Cambios a este aviso', bloques: [
        { p: 'Cualquier cambio se publica en la app y en el módulo del programa antes de aplicarse, con la fecha y un resumen de lo que cambió. Si cambian las finalidades necesarias o los datos sensibles, te pediremos de nuevo tu consentimiento.' },
      ] },
    ];
  }

  function bloque(b) {
    if (b.p) return `<p>${esc(b.p)}</p>`;
    if (b.nota) return `<p class="av-nota">${esc(b.nota)}</p>`;
    if (b.sub) return `<h5>${esc(b.sub)}</h5>`;
    if (b.lista) return `<ul>${b.lista.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (b.tarjetas) {
      return `<div class="av-tarjetas">${b.tarjetas.filas.map((f) =>
        `<div class="av-fila"><b>${esc(f[0])}</b><span>${esc(f[1])}</span>${f[2] ? `<em><small>${esc(b.tarjetas.et[0] || '')}</small>${esc(f[2])}</em>` : ''}</div>`).join('')}</div>`;
    }
    return '';
  }

  function html(CP) {
    const sec = secciones(CP || {}).map((s) =>
      `<details class="av-sec"${s.abierta ? ' open' : ''}><summary><i>${s.n}</i><span>${esc(s.titulo)}</span></summary><div class="av-cuerpo">${s.bloques.map(bloque).join('')}</div></details>`).join('');
    return `<header class="av-head"><span class="av-tag">Prototipo · datos simulados</span><h3>Aviso de privacidad</h3><p class="av-ver">Versión ${VERSION}</p>
      <p class="av-intro">RedCare es un servicio de relevo por horas para cuidadoras familiares de alta intensidad: organiza el servicio, verifica a las personas de relevo, reparte las horas disponibles, asigna a una persona de relevo y da seguimiento. Este aviso explica qué datos tratamos, de quién, para qué, quién los ve y cómo ejerces tus derechos.</p>
      <p class="av-nota">El responsable, su domicilio, su correo, los domicilios de los hogares, las cuentas de pago y los contactos de esta versión son ficticios. Este aviso describe cómo se tratarían los datos reales en un piloto.</p></header>
      <section class="av-resumen" aria-label="En resumen">${RESUMEN.map((r) => `<div><b>${esc(r.t)}</b><span>${esc(r.d)}</span></div>`).join('')}</section>
      <div class="av-secs">${sec}</div>`;
  }

  const API = { VERSION, html, secciones };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (raiz) { raiz.Care = raiz.Care || {}; raiz.Care.aviso = API; }
})(typeof window !== 'undefined' ? window : null);
