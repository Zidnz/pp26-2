# Reproducción del estudio CESA-CDMX / CEDUA-Colmex (2026): 22 sept 2026

**Qué es:** verificación del estudio "Economía del cuidado. Resumen ejecutivo" (inventario: F19). No es un indicador del Observatorio.

## Archivos
| Archivo | Qué contiene |
|---|---|
| `colmex_cuadros_2_2_a_2_4_por_alcaldia.csv` | Cuadros 2.2, 2.3 y 2.4 **transcritos** del PDF, más los cocientes recalculados. |
| `verificar_cuadros_colmex.py` | Verifica la aritmética interna de los cuadros transcritos: sumas y cocientes. |
| `reproducir_cuadro_2_2_denue.py` | Reproduce el Cuadro 2.2 desde el DENUE. Uso desde la raíz: `python Analysis/reproduccion_colmex_2026-09-22/reproducir_cuadro_2_2_denue.py denue_09_0525_csv.zip` |
| `resultado_reproduccion_cuadro_2_2.csv` | Salida: unidades y personal por alcaldía y grupo; diferencias contra Colmex. |
| `sensibilidad_indicador_adulta_mayor.csv` | Salida: el indicador de viviendas con 65+ por ocupado bajo 4 clasificaciones SCIAN. |

## Resultados (DENUE 05_2025, modificado el 22/05/2025; 460,762 registros en la CDMX)
- **Unidades:** 48 de 48 celdas idénticas (4,145 unidades: 2,959 infantil, 607 adulta mayor y 579 discapacidad).
- **Personal ocupado:** 48 de 48 celdas idénticas con la regla **0–5 → 3, 6–10 → 8, 11–30 → 20, 31–50 → 40, 51–100 → 75, 101–250 → 175**. El documento no declara esta regla; se identificó por mínimos cuadrados, con error 0.
- **Sensibilidad (CDMX, viviendas con 65+ por ocupado):**
  - Clasificación de Colmex: 134.5.
  - Colmex + centros de día: 112.3.
  - Solo residencias y asilos: 225.2.
  - Residencias + centros de día: 169.3.

  **El nivel del indicador depende de la clasificación: no es un hallazgo robusto.**

## Qué NO permite
- Afirmar cobertura real: el personal es una estimación a partir de estratos, y el DENUE no mide cupos.
- Afirmar tendencias: un solo corte de oferta y uno de demanda.
- Asumir que los cuadros de demanda (Censo 2020, cuestionario ampliado) quedaron reproducidos: **no se reprodujeron**, solo se verificó su aritmética.

## Notas
- La clasificación de Colmex (24 clases, con primera infancia) **no es** la delimitación del proyecto (`Analysis/catalogo_scian_cuidado.csv`: 60+ y discapacidad). Comparar con cuidado.
- El script solo lee 5 columnas del DENUE. No guarda nombres, teléfonos ni correos de establecimientos. Los ZIP del DENUE no se suben al repositorio.
