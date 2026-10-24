# ML

Esta carpeta **no contiene código**. Es el índice de los modelos del proyecto. El código de cada modelo vive en `Analysis/`, dentro del notebook que contiene el análisis que lo justifica. Se dejó ahí porque los notebooks usan rutas relativas a `Analysis/` (`datos/`, `resultados/`, `figuras/`, `estilo_graficas.py`). Moverlos rompería la reproducción.

**Cómo leer las referencias:** en `Analysis/`, la "sección NN" es el número del notebook original antes de la fusión del 7 oct 2026 (ver `Analysis/README.md`). Dentro de cada sección hay subsecciones `## 1.`, `## 2.`, etc. Abajo se indican las dos cosas.

## Modelos

| Modelo | Archivo | Dónde está dentro del notebook | Decisión que informa | Alternativa simple |
|---|---|---|---|---|
| Focalización de personas cuidadoras: regresión logística y gradient boosting (ENASIC 2022, **nacional**) | `Analysis/B_enasic_cuidadoras.ipynb` | Sección 11, encabezado `# 11 — Modelo de focalización`. Es el **último bloque** del notebook. Resultados globales en la subsección 4 y por grupo en la 5. Desde el 13 oct 2026: por qué estos modelos contra otras cinco familias (11), diagnóstico (12), cupo (13), elección del objetivo con la verificación sin «le falta fuerza física» (14) y lectura (16) | A quién ofrecer primero el relevo | Regla "40 horas o más" |
| Tipología de AGEB urbanas: k-means sobre 9 indicadores del Censo 2020 (**CDMX**) | `Analysis/D_tipologia_territorial_ageb.ipynb` | Sección 18. Ocupa **todo el notebook**. Modelo final en la subsección 5, comparación contra alternativas simples en la 6 y robustez en la 7 | En qué tipo de zona hacer el piloto, a dónde se pueden extrapolar sus resultados, canal de la app y brechas de oferta | Regla de dos cortes (60+ × internet) e índice de una dimensión (CP1) |
| Escalera de priorización de cuidadoras: R0–R5 (azar, regla ≥ 40 h, regla compuesta, tarjeta de puntos, logística, gradient boosting) con validación por UPM (ENASIC 2022, **nacional**). **Exploratorio** | `Analysis/21_priorizacion_cuidadoras.py` (script, no notebook) | Todo el script. Salidas `resultados/21_*` | A quién ofrecer primero el relevo (extiende el modelo de focalización sin modificar la sección 11) | R1 regla ≥ 40 h y R2 regla compuesta, fijada a priori |
| Tarjeta de puntos con objetivo «algún daño»: L1 con puntos enteros, 3 variantes (completa / sin «falta fuerza» / sin fuerza ni «requiere apoyo»), validación por UPM y umbral operativo (ENASIC 2022, **nacional**). **Exploratorio** | `Analysis/22_tarjeta_puntos.py` (script) | Todo el script; la sección 5 evalúa solo el bloque de discapacidad. Salidas `resultados/22_tarjeta_*.csv`, `figuras/f26_tarjeta_puntos.png` | A quién ofrecer primero el relevo (candidato de la escalera del script 21) | Regla ≥ 40 h: ninguna variante la supera (bitácora, 20 oct, 21:45) |
| Participación laboral de mujeres de 25 a 54 años: logística explicativa con diseño muestral (ENUT 2024, **nacional**) | `Analysis/enut2024_participacion_laboral/` (`01_…ipynb` en Python, `02_…qmd` en R) | Ver su README | A qué hogares dirigir un programa de cuidados (según su README). **Sin entrada en la bitácora** | Su README no declara una alternativa simple: **pendiente** |

## Objetivo del modelo de focalización (vigente desde el 20 oct 2026, 11:05)

- **Primario:** `DANO_ALGUNO`. **Sensibilidad exploratoria:** `DANO_SALUD_FISICA` (DEC-OBJ-001, bitácora del 20 oct).
- Se registró después de ver los resultados de la sección 11 y del script 21, así que no es un preregistro.
- Con `DANO_ALGUNO`, ningún modelo supera de forma demostrable a la regla de 40 h: +2.2 pp (IC 90 % −4.1 a 8.5). La regla basta. Con salud física la ventaja depende de «le falta fuerza física».
- Tarjeta de puntos con `DANO_ALGUNO` (script 22, 20 oct 21:45): no supera a la regla de 40 h en ninguna variante, ni en la muestra completa ni dentro del bloque de discapacidad. Sigue pendiente decidir si se presenta la tarjeta o solo la regla.
- Limitación de medición: actividades básicas y tareas clínicas no se preguntaron a 384 de las 407 cuidadoras de «solo 60+ sin discapacidad» (`P6_22_*` depende de `P6_21`). Cualquier puntaje que use esas variables las deja fuera por construcción.

## No son modelos de aprendizaje

- `Analysis/20_modelo_sostenibilidad.py` / `.ipynb`: modelo financiero determinista de la opción C (supuestos declarados y escenarios). Va en la UCA de Analítica para los Negocios, no aquí.
- `Analysis/19_costo_hora_por_jornada.py`: cálculo de costos.

## Salidas

- Focalización: `Analysis/resultados/11_modelo_*.csv` y `11_objetivo_*.csv`, y `Analysis/figuras/f10` y `f15` a `f20`. En el Observatorio: pestaña «¿A quién primero?». Video: `Analysis/animaciones/01_focalizacion_regla_vs_modelo.mp4`.
- Escalera de priorización: `Analysis/resultados/21_*.csv`. No está en el Observatorio.
- ENUT 2024: `Analysis/enut2024_participacion_laboral/reports/comparacion_ee_enut2024.csv`.
- Tipología: `Analysis/resultados/18_tipologia_*.csv`, `18_oferta_nucleo_puntos.csv` y `18_tipologia_contornos.geojson`, y `Analysis/figuras/f11` a `f14`.

## Estado

- Los cinco análisis de la tabla están **pendientes de doble revisión**. Sus cifras no deben citarse en el informe ni en la presentación hasta que alguien distinto a quien los hizo los revise.
- La app de `Frontend/` no usa ningún modelo entrenado. Desde el 20 oct 2026 (23:10) prioriza con la tarjeta de puntos «completa» del script 22, aplicada como regla transparente (`Frontend/js/config.js` y `prioridad.js`) y marcada como provisional; antes usaba la regla ≥ 40 h + ayuda en actividades básicas. `clasificador.js` y `matching.js` salieron de la app el 8 oct. Sus copias en `_to_delete/` se borraron el 20 oct y no hay git: ya no existen.
- La copia anterior del modelo de focalización que estaba en `_to_delete/` se borró el 20 oct 2026. La única versión es la sección 11 de `B_enasic_cuidadoras.ipynb`.

## Historial de este archivo

- 20 oct 2026 (21:45): se agrega el script 22 (tarjeta de puntos con «algún daño») y la limitación de medición de `P6_2_*` / `P6_22_*`.

- 20 oct 2026 (11:15): se agregan el script 21 y el subproyecto ENUT 2024, el objetivo vigente (DEC-OBJ-001) y la sección «No son modelos de aprendizaje». Se corrige la mención a `Frontend/js/clasificador.js`, que ya no existe en esa ruta. (Su respaldo se borró junto con `_to_delete/`.)

- 14 oct 2026: la tabla de arriba se muestra ahora en el Observatorio (pestaña Método, tarjeta «Cada modelo responde a una decisión»), con una tercera decisión, «¿en qué orden?», que hoy no tiene modelo.

- Antes del 5 oct 2026: decía que la carpeta estaba vacía a propósito.
- 9 oct 2026: pasó a señalar que los modelos viven en `Analysis/`.
- 13 oct 2026 (después): el modelo de focalización se amplía (subsecciones 11 a 16). Hallazgo principal: con «algún daño» ningún modelo supera a la regla de 40 h; con «salud física», la ventaja depende de «le falta fuerza física». Ver bitácora.
- 13 oct 2026: se aclara la doble numeración (sección contra subsección), se añaden las salidas y se advierte de la copia anterior en `_to_delete/`. La ubicación del código no cambia.
