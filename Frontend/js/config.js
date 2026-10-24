/* Configuración del programa Mientras. Namespace: Care.CONFIG_PROGRAMA
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

    // Niveles sobre el puntaje EFECTIVO (base + envejecimiento). Escala de la tarjeta «completa»: 0 a 20 puntos.
    // Media ≥ 8 porque 8 es el umbral operativo del script 22 (resultados/22_tarjeta_validacion_umbral.csv):
    // selecciona ≈ la misma proporción que la regla de 40 h. Alta ≥ 13 es un corte PROVISIONAL sin respaldo empírico.
    umbrales: { alta: 13, media: 8 },

    // Envejecimiento en cola: +x puntos por semana sin relevo asignado, hasta un tope.
    // Con 0.5 y tope 4, un caso de 4 puntos llega a Media (8) en 8 semanas. PROVISIONAL.
    envejecimiento: { puntos_por_semana: 0.5, tope_envejecimiento: 4 },

    /* ---------- E. Puntaje ---------- */
    // Si existe un modelo serializado que la app pueda cargar, se indica aquí. Hoy no existe ninguno
    // (los modelos viven en notebooks de Analysis/), así que la app usa la tarjeta como regla transparente.
    modelo: { archivo: null },

    // Tarjeta de puntos, variante «completa», objetivo «algún daño» (DEC-OBJ-001).
    // Fuente: Analysis/resultados/22_tarjeta_puntos.csv (script 22, ENASIC 2022 NACIONAL, exploratorio, sin doble revisión).
    // Ninguna variante supera a la regla de 40 h de forma demostrable (+2.2 pp, IC 90 % −3.4 a 7.7).
    variante_tarjeta: 'completa',
    pesos: {
      h40: 5, h80: 0, abvd1: 1, abvd3: 2, clin1: 3, disc: 0, req: 3, fuerza: 4, mujer: 2, edad60: 0,
    },

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
      abvd_muchas: 3,           // declara ayuda en ≥ 3 actividades básicas…
      barthel_sin_ayuda: 100,   // …pero Barthel = 100 (independiente en todas)
      horas_inverosimiles: 140, // ≥ 140 h/semana: verificar captura
      zarit_bajo: 20,           // Zarit total ≤ 20 pero declara «le falta fuerza» y «requiere apoyo». Corte PROVISIONAL.
    },

    /* ---------- Instrumentos ---------- */
    // Zarit: 22 reactivos, respuesta 0-4, total 0-88. Los textos requieren licencia: la app solo usa marcadores.
    zarit: { n_reactivos: 22, escala_min: 0, escala_max: 4 },

    /* ---------- Textos visibles ---------- */
    nombre: 'Mientras',
    eslogan: 'Relevo por horas para quien cuida',
    aviso_complementario: 'Mientras es un componente complementario del Sistema Público de Cuidados. Las horas dependen del presupuesto del programa.',
    aviso_privacidad: '[Aviso de privacidad — pendiente revisión legal, Daniel]',
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG_PROGRAMA;
  if (raiz) { raiz.Care = raiz.Care || {}; raiz.Care.CONFIG_PROGRAMA = CONFIG_PROGRAMA; }
})(typeof window !== 'undefined' ? window : null);
