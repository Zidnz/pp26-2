# ML

**Actualizado: 9 oct 2026.** Antes, este archivo decía que la carpeta estaba vacía a propósito. Ese texto quedó desactualizado el 5 y 6 oct, cuando se construyó el primer modelo. Los modelos viven en los notebooks de `Analysis/`, junto al análisis que los justifica, y no en esta carpeta:

| Modelo | Dónde | Decisión que informa | Alternativa simple contra la que se compara |
|---|---|---|---|
| Focalización de personas cuidadoras: regresión logística y gradient boosting (ENASIC 2022, nacional) | `Analysis/B_enasic_cuidadoras.ipynb`, sección 11 | A quién ofrecer primero el relevo | Regla "40 horas o más" |
| Tipología de AGEB urbanas: k-means sobre 9 indicadores del Censo 2020 (CDMX) | `Analysis/D_tipologia_territorial_ageb.ipynb`, sección 18 | En qué tipo de zona hacer el piloto, a dónde se pueden extrapolar sus resultados, canal de la app y brechas de oferta | Regla de dos cortes (60+ × internet) e índice de una dimensión (CP1) |

Los dos están **pendientes de doble revisión**. `Frontend/js/clasificador.js` no es un modelo entrenado: es una demostración basada en reglas.
