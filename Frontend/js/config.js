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
      abvd_muchas: 3,           // declara ayuda en ≥ 3 actividades básicas…
      barthel_sin_ayuda: 100,   // …pero Barthel = 100 (independiente en todas)
      horas_inverosimiles: 140, // ≥ 140 h/semana: verificar captura
    },

    /* ---------- Instrumentos ---------- */
    // Cuestionario propio "Cómo te sientes" (no es el Zarit): 12 reactivos, respuesta 0-4, total 0-48. Sin validar.
    zarit: { n_reactivos: 12, escala_min: 0, escala_max: 4 },

    /* ---------- Textos visibles ---------- */
    nombre: 'RedCare',
    eslogan: 'Una red que cuida a quienes cuidan',
    aviso_complementario: 'RedCare es un componente complementario del Sistema Público de Cuidados. Las horas dependen del presupuesto del programa.',
    aviso_privacidad: '[Aviso de privacidad — pendiente revisión legal, Daniel]',
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG_PROGRAMA;
  if (raiz) { raiz.Care = raiz.Care || {}; raiz.Care.CONFIG_PROGRAMA = CONFIG_PROGRAMA; }
})(typeof window !== 'undefined' ? window : null);
