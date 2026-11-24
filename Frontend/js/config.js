/* Configuración del programa RedCare. Namespace: Care.CONFIG_PROGRAMA
 *
 * TODO lo que decide quién recibe cuántas horas vive aquí, no en el código.
 * Es un .js y no un .json porque la app se abre con doble clic (file://) y el navegador bloquea fetch() en ese modo.
 * También lo lee la prueba de Node (tests/prueba_asignacion.js).
 *
 * VALORES PROVISIONALES. Ninguno está aprobado por el equipo ni por el programa. Lo que es ilustrativo se marca así.
 */
(function (raiz) {
  'use strict';

  const CONFIG_PROGRAMA = {
    version: '2026-10-20',

    /* ---------- C. Qué se raciona: la bolsa de horas ---------- */
    // Bolsa total de horas subsidiadas al mes del piloto. ILUSTRATIVO: el piloto no tiene presupuesto definido.
    // 2,000 h/mes ≈ 100 hogares con un promedio de 20 h/mes (≈ 4.6 h/semana).
    presupuesto_horas_mes: 2000,

    /* ---------- D. Nadie queda fuera ---------- */
    // Mínimo garantizado a toda persona valorada. 13 h/mes ≈ 3 h/semana (el paquete más chico de la opción C).
    horas_minimas: 13,
    // Tope por hogar. 52 h/mes ≈ 12 h/semana (el paquete más grande de la opción C). Lo que rebasa se reparte entre los demás.
    horas_maximas: 52,
    semanas_por_mes: 4.33, // mismo supuesto que Analysis/10 y relevo.js

    // Regla de entrada (2 nov 2026): 40 h o más de cuidado a la semana. Reemplaza a la tarjeta de puntos del script 22.
    // Fuente: Analysis/resultados/11_modelo_alternativas.csv, 21_escalera_global.csv y 27_v2_global.csv. NO está probado que la
    // regla sea mejor que un modelo: los resultados son no concluyentes (diferencia mínima detectable ≈ 7 pp). Se usa por parsimonia.
    regla_horas: 40,

    // Horas efectivas = horas declaradas + espera. Solo ordena el reparto de la bolsa. PROVISIONAL, sin respaldo empírico:
    // 0.5 h por semana en cola, tope 4 h.
    envejecimiento: { horas_por_semana: 0.5, tope_envejecimiento: 4 },

    /* ---------- B. Autoselección: vías de entrada ---------- */
    canales: {
      autorregistro: 'Autorregistro',
      referencia: 'Referencia institucional',
    },
    instituciones: ['DIF', 'Centro de salud', 'Escuela', 'Clínica', 'Módulo del programa'],

    /* ---------- F. Chequeos de consistencia (mandan a revisión humana; no cambian el puntaje) ---------- */
    chequeos: {
      horas_altas: 40,          // cuida ≥ 40 h…
      barthel_independiente: 90, // …a una persona con Barthel ≥ 90 (casi independiente)
      // 20 nov 2026: se retiró el chequeo «≥ 3 actividades básicas con Barthel 100» junto con la pregunta de actividades básicas.
      horas_inverosimiles: 140, // ≥ 140 h/semana: verificar captura
    },

    /* ---------- Instrumentos ---------- */
    // Cuestionario propio "Cómo te sientes" (no es el Zarit): 12 reactivos, respuesta 0-4, total 0-48. Sin validar.
    zarit: { n_reactivos: 12, escala_min: 0, escala_max: 4 },

    /* ---------- Textos visibles ---------- */
    nombre: 'RedCare',
    eslogan: 'Una red que cuida a quienes cuidan',
    aviso_complementario: 'RedCare es un componente complementario del Sistema Público de Cuidados. Las horas dependen del presupuesto del programa.',
    // 21 nov 2026: aviso de privacidad simplificado (LFPDPPP, DOF 20-mar-2025). El aviso integral está en la documentación del proyecto.
    // 24 nov 2026: aviso simplificado v3, derivado del aviso integral v3 (Documentos/Aviso_de_Privacidad_RedCare_v3).
    version_aviso: '3.0 · 2026-11-24',
    aviso_privacidad: 'Aviso de privacidad simplificado (v3). {operador} es responsable de tus datos. Los usamos para: '
      + '1) saber si el relevo te corresponde y cuántas horas; 2) asignarte una persona de relevo y organizar las visitas; 3) dar seguimiento, atender incidentes y emergencias. '
      + 'Datos sensibles (con tu consentimiento expreso): horas de cuidado, si haces tareas de salud (sí o no), la dependencia de la persona que cuidas (Barthel) y, cada semana, cansancio, sueño y si pudiste trabajar o estudiar. '
      + 'Tu domicilio se pide solo al asignarte relevo y se borra al cerrar el caso. Tus contactos de emergencia y personas autorizadas son opcionales. No pedimos tu CURP ni diagnósticos. '
      + 'La persona de relevo solo ve tu alias, domicilio, horario y tareas. Una persona del programa revisa cada solicitud antes de asignar. No vendemos tus datos. '
      + 'Estadísticas solo agregadas, si lo autorizas. Derechos ARCO en «Mis datos» o en {contacto}. Aviso integral: en la app y en el módulo del programa.',

    /* ---------- Contratos (20 nov 2026; texto en js/contrato.js) ---------- */
    // Modelo de plataforma digital (como Uber, DiDi o Rappi): el OPERADOR de RedCare gestiona la plataforma y es el patrón de
    // las personas de relevo (LFT Cap. IX Bis). El hogar es usuario: no es patrón ni responsable solidario. Análisis jurídico en la documentación del proyecto (21 nov 2026).
    operador: 'RedCare Cuidados, A.C. (persona moral ficticia del prototipo)',
    contacto_datos: 'privacidad@redcare.example (correo ficticio del prototipo)',
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG_PROGRAMA;
  if (raiz) { raiz.Care = raiz.Care || {}; raiz.Care.CONFIG_PROGRAMA = CONFIG_PROGRAMA; }
})(typeof window !== 'undefined' ? window : null);
