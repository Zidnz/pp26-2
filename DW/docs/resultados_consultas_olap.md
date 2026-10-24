# Resultados de las consultas OLAP

Generado por `DW/sql/ejecutar_consultas.py` a partir de `DW/observatorio_dw.sqlite`. No se editan a mano.


## Q1 · ROLL-UP geográfico: de alcaldía a CDMX. ¿Dónde está la oferta del núcleo?

16 filas.

| alcaldia               |   establecimientos |   pct_cdmx |   total_cdmx |
|:-----------------------|-------------------:|-----------:|-------------:|
| Iztapalapa             |              37.00 |      15.70 |       235.00 |
| Gustavo A. Madero      |              25.00 |      10.60 |       235.00 |
| Coyoacán               |              23.00 |       9.80 |       235.00 |
| Álvaro Obregón         |              22.00 |       9.40 |       235.00 |
| Tlalpan                |              21.00 |       8.90 |       235.00 |
| Xochimilco             |              19.00 |       8.10 |       235.00 |
| Benito Juárez          |              18.00 |       7.70 |       235.00 |
| Miguel Hidalgo         |              11.00 |       4.70 |       235.00 |
| Tláhuac                |              10.00 |       4.30 |       235.00 |
| Venustiano Carranza    |              10.00 |       4.30 |       235.00 |
| La Magdalena Contreras |               9.00 |       3.80 |       235.00 |
| Cuauhtémoc             |               7.00 |       3.00 |       235.00 |
| Azcapotzalco           |               6.00 |       2.60 |       235.00 |
| Iztacalco              |               6.00 |       2.60 |       235.00 |
| Milpa Alta             |               6.00 |       2.60 |       235.00 |
| Cuajimalpa de Morelos  |               5.00 |       2.10 |       235.00 |



## Q2 · DRILL-DOWN por segmento: ¿quién carga 40 horas o más? (ENASIC, nacional; con IC y precisión)

11 filas.

| dimension     | segmento                  |   pct_40h_o_mas |   li90 |   ls90 | precision   |   n_muestra_dominio |
|:--------------|:--------------------------|----------------:|-------:|-------:|:------------|--------------------:|
| A quién cuida | Cuida discapacidad        |           44.82 |  40.13 |  49.51 | alta        |                 636 |
| A quién cuida | Solo 60+ sin discapacidad |           35.41 |  27.31 |  43.51 | alta        |                 407 |
| Edad          | 15-39                     |           48.16 |  41.96 |  54.35 | alta        |                 310 |
| Edad          | 60+                       |           44.88 |  36.39 |  53.38 | alta        |                 348 |
| Edad          | 40-59                     |           29.66 |  24.56 |  34.75 | alta        |                 385 |
| Ingreso       | Q4-Q5                     |           45.73 |  39.08 |  52.38 | alta        |                 359 |
| Ingreso       | Q1-Q2                     |           39.72 |  32.35 |  47.09 | alta        |                 321 |
| Ingreso       | Q3                        |           34.60 |  25.80 |  43.40 | moderada    |                 179 |
| Sexo          | Mujer                     |           44.15 |  38.77 |  49.54 | alta        |                 710 |
| Sexo          | Hombre                    |           33.17 |  27.23 |  39.12 | alta        |                 333 |
| Total         | Total                     |           40.72 |  36.12 |  45.32 | alta        |                1043 |



## Q3 · SLICE de asequibilidad: relevo de 6 h/sem, piso legal, umbral 20 % del ingreso.

5 filas.

| geografia         | ingreso_referencia                     |   costo_mes |   pct_hogares_que_pueden |   li90 |   ls90 | precision   |   tiene_varianza |
|:------------------|:---------------------------------------|------------:|-------------------------:|-------:|-------:|:------------|-----------------:|
| Ciudad de México  | Ingreso corriente total (sensibilidad) |     1112.00 |                    94.36 |  93.16 |  95.56 | alta        |                1 |
| Ciudad de México  | Ingreso monetario (principal)          |     1112.00 |                    91.96 |  90.55 |  93.37 | alta        |                1 |
| México (nacional) | Ingreso corriente total (sensibilidad) |     1112.00 |                    87.98 |  87.58 |  88.39 | alta        |                1 |
| México (nacional) | Ingreso del hogar (ENASIC 2022)        |     1112.00 |                    66.20 | nan    | nan    | no aplica   |                0 |
| México (nacional) | Ingreso monetario (principal)          |     1112.00 |                    84.53 |  84.08 |  84.98 | alta        |                1 |



## Q4 · BRECHA territorial: oferta frente a población 60+, junto con rezago (alcaldía). Índice < 1 = menos oferta que población.

16 filas.

| alcaldia               |   indice_oferta_vs_60 |   plazas_x_1000_adl |   pct_pob_rezago_medio_o_mas |   pob_60mas |
|:-----------------------|----------------------:|--------------------:|-----------------------------:|------------:|
| Cuauhtémoc             |                  0.47 |               42.09 |                         4.44 |    93809.00 |
| Azcapotzalco           |                  0.48 |               44.08 |                         0.09 |    78650.00 |
| Iztacalco              |                  0.54 |                3.42 |                         0.00 |    70907.00 |
| Gustavo A. Madero      |                  0.78 |                6.37 |                        10.58 |   203469.00 |
| Venustiano Carranza    |                  0.80 |              nan    |                         3.72 |    78964.00 |
| Iztapalapa             |                  0.90 |                1.24 |                        18.13 |   262064.00 |
| Miguel Hidalgo         |                  0.98 |              125.29 |                         0.00 |    71111.00 |
| Álvaro Obregón         |                  1.14 |               21.04 |                         3.17 |   122319.00 |
| Coyoacán               |                  1.15 |               57.21 |                         0.59 |   126592.00 |
| Tlalpan                |                  1.22 |               66.55 |                        13.82 |   108894.00 |
| Cuajimalpa de Morelos  |                  1.23 |              nan    |                         1.38 |    25803.00 |
| Benito Juárez          |                  1.31 |               26.94 |                         0.00 |    87344.00 |
| Tláhuac                |                  1.37 |              nan    |                         7.92 |    46196.00 |
| La Magdalena Contreras |                  1.50 |               40.05 |                         6.39 |    38073.00 |
| Xochimilco             |                  1.98 |               43.39 |                        20.62 |    60987.00 |
| Milpa Alta             |                  2.32 |              nan    |                        47.73 |    16437.00 |



## Q5 · COBERTURA: qué alcaldías quedan sin dato por medida (desconocido ≠ 0)

2 filas.

| medida_codigo                | alcaldias_sin_dato                                              |
|:-----------------------------|:----------------------------------------------------------------|
| plazas_por_1000_personas_adl | Cuajimalpa de Morelos, Milpa Alta, Tláhuac, Venustiano Carranza |
| plazas_residencias_privadas  | Cuajimalpa de Morelos, Milpa Alta, Tláhuac, Venustiano Carranza |



## Q6 · TENDENCIAS: ¿alguna fuente admite series de tiempo? (regla de ≥ 2 periodos)

12 filas.

| fuente_id   | tabla_hecho                | periodos    |   permite_tendencia |
|:------------|:---------------------------|:------------|--------------------:|
| F02         | fact_indicador_territorial | 2020        |                   0 |
| F04         | fact_asequibilidad         | 2022        |                   0 |
| F04         | fact_estimacion_encuesta   | 2022        |                   0 |
| F09         | fact_indicador_territorial | mayo 2026   |                   0 |
| F20         | fact_indicador_territorial | 2020        |                   0 |
| F22         | fact_indicador_territorial | 2020        |                   0 |
| F23         | fact_asequibilidad         | 2022        |                   0 |
| F23         | fact_indicador_territorial | 2022        |                   0 |
| P01         | fact_indicador_territorial | desconocido |                   0 |
| P02         | fact_indicador_territorial | desconocido |                   0 |
| P03         | fact_indicador_territorial | desconocido |                   0 |
| X01         | fact_indicador_territorial | 2020        |                   0 |



## Q7 · CALIDAD: cuántas estimaciones son confiables, por script de origen

20 filas.

| script_origen                                 | precision    |   n_estimaciones |
|:----------------------------------------------|:-------------|-----------------:|
| 03_enasic_barreras_estimaciones.csv           | alta         |               32 |
| 03_enasic_barreras_estimaciones.csv           | baja         |               20 |
| 03_enasic_barreras_estimaciones.csv           | moderada     |               17 |
| 04_contratacion_por_quintil.csv               | baja         |                7 |
| 04_contratacion_por_quintil.csv               | moderada     |                3 |
| 07_enasic_necesidad_vs_norma_estimaciones.csv | alta         |               61 |
| 07_enasic_necesidad_vs_norma_estimaciones.csv | baja         |               73 |
| 07_enasic_necesidad_vs_norma_estimaciones.csv | moderada     |               29 |
| 07_enasic_necesidad_vs_norma_estimaciones.csv | no estimable |                3 |
| 12_segmentacion_estimaciones.csv              | alta         |              135 |
| 12_segmentacion_estimaciones.csv              | baja         |               95 |
| 12_segmentacion_estimaciones.csv              | moderada     |               18 |
| 12_segmentacion_estimaciones.csv              | no estimable |                1 |
| 12b_segmentacion_series.csv                   | alta         |              176 |
| 12b_segmentacion_series.csv                   | baja         |               91 |
| 12b_segmentacion_series.csv                   | moderada     |              113 |
| 12b_segmentacion_series.csv                   | no aplica    |               66 |
| 12b_segmentacion_series.csv                   | no estimable |                3 |
| 16_perfil_grupo_problema.csv                  | alta         |               14 |
| 16_perfil_grupo_problema.csv                  | moderada     |                8 |



## Q8 · LINAJE: de una cifra del tablero a su fila de origen

10 filas.

| indicador                     | dominio_segmento   |   estimacion |   total_expandido | script_origen                    |   fila_origen |
|:------------------------------|:-------------------|-------------:|------------------:|:---------------------------------|--------------:|
| Declara algún daño por cuidar | Total              |        62.16 |        3868691.00 | 12_segmentacion_estimaciones.csv |             3 |
| Declara algún daño por cuidar | Mujer              |        67.70 |        2898074.00 | 12_segmentacion_estimaciones.csv |            21 |
| Declara algún daño por cuidar | Hombre             |        49.95 |         970617.00 | 12_segmentacion_estimaciones.csv |            39 |
| Declara algún daño por cuidar | 15-39              |        60.35 |        1042428.00 | 12_segmentacion_estimaciones.csv |            57 |
| Declara algún daño por cuidar | 40-59              |        63.60 |        1317319.00 | 12_segmentacion_estimaciones.csv |            75 |
| Declara algún daño por cuidar | 60+                |        62.22 |        1508944.00 | 12_segmentacion_estimaciones.csv |            93 |
| Declara algún daño por cuidar | Q1-Q2              |        71.27 |        1193270.00 | 12_segmentacion_estimaciones.csv |           111 |
| Declara algún daño por cuidar | Q3                 |        62.19 |         612133.00 | 12_segmentacion_estimaciones.csv |           129 |
| Declara algún daño por cuidar | Q4-Q5              |        57.20 |        1416696.00 | 12_segmentacion_estimaciones.csv |           147 |
| Declara algún daño por cuidar | Cuida discapacidad |        72.56 |        2549319.00 | 12_segmentacion_estimaciones.csv |           165 |

