# Diagnóstico previo al modelo de focalización — lo que el EDA debió decir antes de modelar

**Fecha:** 1 nov 2026 · **Autor:** Claude a pedido de Omar · **Revisor:** _[pendiente — Daniel o Alondra]_
**Cifras:** todas salen de `Analysis/26_diagnostico_previo_focalizacion.py` → `Analysis/resultados/26_diag_*.csv`.
**Alcance:** ENASIC 2022, nacional, personas que cuidan a alguien con discapacidad o de 60+ (mismo universo que la sección 11). Nada aquí habla de la CDMX.
**Control:** el script reproduce la sección 11 (prevalencia 62.2 %, cupo 40.7 %, cobertura de la regla 50.8 %) y su logística propia da AUC 0.751 contra 0.752 publicado.
**Tipo de registro:** posterior a los resultados de 11, 21 y 22. No es un preregistro; sirve para que el siguiente modelo sí lo tenga.

---

## 1. La conclusión vigente excede lo que los datos permiten

`ML/README.md` dice: «Con `DANO_ALGUNO`, ningún modelo supera de forma demostrable a la regla de 40 h. **La regla basta.**» La primera mitad es correcta; la segunda no se sigue.

| Dato (D1) | Valor |
|---|---|
| Muestra / UPM / estratos | 1,043 / 445 / 139 |
| Efecto de diseño · n efectivo | 1.88 · **≈ 554** |
| Techo de cobertura al cupo de la regla (40.7 % / 62.2 %) | 65.5 % |
| Cobertura de la regla | 50.8 % |
| **Ganancia máxima posible sobre la regla** | **14.7 pp** |
| **Diferencia mínima detectable** (80 % potencia, α = 0.10) | **9.5 pp** |

El diseño solo podía detectar una mejora de al menos dos terceras partes de la máxima posible. Un intervalo de −4.1 a +8.5 pp es **no concluyente**: es compatible con «no hay ganancia» y con «hay una ganancia moderada». «La regla basta» convierte ausencia de evidencia en evidencia de ausencia. **Confirmado** (cálculo en `26_diag_muestra.csv`).

## 2. Las omisiones del EDA, en orden de gravedad

### O1. El modelo «mejora» sobre todo reasignando entre bloques, no encontrando mejor dentro de cada bloque (D7)

Escalera de información con validación por UPM (5 × 20), mismo cupo que la regla:

| Escalón | AUC | Dif. cobertura vs regla (IC 90) | % seleccionado en «solo 60+» | Cobertura en «solo 60+» |
|---|---|---|---|---|
| E0 regla ≥ 40 h | 0.633 | — | 35.4 % | 50.2 % |
| E1 forma de las horas | 0.624 | 0.0 | 35.4 % | 50.2 % |
| E2 + tipo de cuidado | 0.681 | −0.2 (−5.4, 4.9) | **17.4 %** | **25.5 %** |
| E3 + carga observable | 0.707 | +3.1 (−2.5, 8.6) | 10.9 % | 19.0 % |
| E5 + autopercepción (≈ modelo 11) | 0.751 | +2.4 (−2.9, 7.7) | 14.5 % | 23.8 % |

Solo agregar «cuida a discapacidad vs solo 60+» sube el AUC de 0.63 a 0.68, **no cambia la cobertura total** y reduce a la mitad la selección del bloque 60+. Esa no es información para encontrar a quién tiene daño: es una decisión de **a qué población darle el programa**, tomada implícitamente por el modelo porque ese bloque declara menos daño (49 % contra 73 %). Decidir la cuota entre bloques es normativo; no se le delega a un clasificador.

La caída de 29 pp en «solo 60+» que la sección 11 registró como «peor grupo» no es un efecto secundario: es el mecanismo principal.

### O2. Los predictores no se miden igual en los dos bloques (D5)

- Actividades básicas y tareas clínicas: preguntadas a las 636 personas del bloque de discapacidad y a **23 de 407** del bloque 60+ (P6_22 depende de P6_21). El 0 de las otras 384 significa «no se preguntó». La bitácora del 20 oct ya lo detectó; el EDA debió detectarlo antes de la sección 11. E3 muestra el efecto: al entrar ABVD y clínicas, la cobertura del bloque 60+ cae otra vez (25.5 % → 19.0 %).
- `P6_28_1` a `P6_28_4` (bloque 60+) tienen **código 8 = «No aplica»** (42, 50, 31 y 13 casos); `P6_9_x` no lo tiene. El código actual (`== '1'`) lo convierte en «no» sin decirlo, y «no aplica» no es lo mismo que «no tengo esa dificultad». **Confirmado** en el catálogo y en los datos.
- **204 personas** cuidan en los dos bloques: sus horas se suman (33 pasan de 98 h) y sus dificultades se combinan con «O», así que tienen dos oportunidades de responder «sí».
- Horas: rango 01–98 en cada bloque (tope) y 38.6 % de la población declara un múltiplo de 7 (redondeo por días). Una medida tan redondeada no sostiene cortes finos como 38 contra 42 h.

### O3. El objetivo no mide intensidad ni necesidad de relevo (D2, D6)

- `DANO_ALGUNO` = 62.2 %. Lo declara el **48.9 % de quienes cuidan menos de 7 h a la semana**. Una variable que casi la mitad de los casos leves cumple no discrimina a la cuidadora de alta intensidad que el programa busca.
- Ningún componente lo sostiene solo (cansancio es el único componente en 6.5 %), pero es una unión de seis reactivos heterogéneos: tres de salud y tres de trabajo. Los de trabajo dependen de tener empleo previo, edad y sexo, no solo del cuidado.
- Definiciones alternativas (`26_diag_candidatos_objetivo.csv`), **solo descriptivas**:

| Objetivo | Prevalencia | < 7 h | < 40 h | ≥ 40 h | Bloque disc. | Bloque 60+ |
|---|---|---|---|---|---|---|
| DANO_ALGUNO (vigente) | 62.2 % | 48.9 % | 51.6 % | 77.6 % | 72.6 % | 48.7 % |
| Dos o más componentes | 43.4 % | 29.5 % | 33.5 % | 57.9 % | 54.2 % | 29.5 % |
| Salud física | 23.5 % | 19.8 % | 17.0 % | 32.8 % | 32.1 % | 12.2 % |
| Salud (física, cansancio o sueño) | 48.7 % | 37.3 % | 40.4 % | 60.8 % | 58.9 % | 35.5 % |

  **Advertencia:** esta tabla no sirve para elegir el objetivo. Elegir el que más se separa por horas favorece a la regla de antemano; elegir el que más se separa por bloque favorece al modelo. El objetivo se elige por criterio de constructo (§4, decisión 1).

### O4. La relación horas → daño es un escalón, no un gradiente (D3)

| Horas/sem | 0–6 | 7–13 | 14–20 | 21–29 | 30–39 | 40–59 | 60–97 | 98+ |
|---|---|---|---|---|---|---|---|---|
| Daño | 48.9 % | 45.5 % | 51.0 % | 61.8 % | 50.5 % | 73.4 % | 82.2 % | 77.7 % |

Debajo de 40 h el daño es plano (≈ 45–62 %, intervalos traslapados); arriba sube a ≈ 75–82 %. Por eso «horas continuas» (AUC 0.655) no mejora a la regla al cupo: la regla ya extrae casi toda la información de las horas. La línea base estadística de la sección 11 nunca fue una competidora real. Esto debió verse en una gráfica de prevalencia por tramo **antes** de elegir los modelos.

### O5. Sí hay información además de las horas, pero la más fuerte está contaminada (D4)

Diferencias de prevalencia de daño **dentro de < 40 h** (pp, IC 90):

| Variable | Tipo | Dif. |
|---|---|---|
| Necesita capacitación (P6_9_3 / P6_28_3) | autopercepción | +36.4 (29.1, 43.7) |
| ABVD 3+ | carga, **solo bloque discapacidad** | +35.3 (27.3, 43.3) |
| Requiere apoyo | autopercepción, misma batería que el daño | +30.4 (22.6, 38.2) |
| Le falta fuerza | autopercepción, misma batería que el daño | +28.0 (19.1, 37.0) |
| Clínicas 1+ | carga, **solo bloque discapacidad** | +27.3 (19.0, 35.6) |
| Cuida a discapacidad | tipo de cuidado | +26.7 (17.9, 35.4) |
| Mujer | sociodemográfica | +17.1 (8.2, 26.0) |
| Cuida menores | carga | +11.5 (1.2, 21.8) |
| 60+ | sociodemográfica | −5.1 (−14.7, 4.5) |

Así que la hipótesis nula «no hay información fuera de las horas» es **falsa** en estos datos. El problema es de dónde viene: las autopercepciones se contestan en la misma entrevista y la misma sección que el daño (varianza de método común; «le falta fuerza» ya estaba marcada como casi igual a salud física), y la carga objetiva solo existe en un bloque. Lo que queda limpio y medido igual en ambos bloques es poco: horas, sexo, edad, cuidado de menores.

## 3. Hipótesis corregida

La pregunta «¿modelo o regla?» mezclaba dos preguntas distintas.

**Pregunta normativa (no es de modelado):** ¿qué proporción del cupo va a cada tipo de cuidado? La decide el programa con la institución, antes de modelar.

**Pregunta de modelado, con la cuota fija:**

> **H1.** Dentro de cada tipo de cuidado y con la cuota fijada, un puntaje construido solo con información de registro medida igual en ambos bloques cubre más personas con [objetivo elegido por constructo] que la regla ≥ 40 h, por al menos Δ pp (Δ fijado antes de correr).
> **H0.** La diferencia es ≤ 0.
> **H2 (equidad).** H1 se cumple sin bajar la cobertura de ningún grupo de sexo, edad o ingreso más de δ pp respecto a la regla.

**Lo que el diagnóstico predice antes de correr nada** (para que el resultado pueda contradecirlo):
- En el bloque de discapacidad, H1 es plausible: hay carga objetiva medida (ABVD, clínicas) con +27 a +35 pp dentro de < 40 h.
- En el bloque 60+, H1 es poco probable: no hay carga medida y lo demás es débil o autopercepción.
- En los dos, la potencia será **menor** que la de la sección 11 (cada bloque tiene menos muestra). Si Δ queda por debajo de la diferencia mínima detectable, el resultado más probable es «no concluyente», y así se debe reportar.

## 4. Protocolo para elegir modelo sin intuición

Se fija todo **antes** de ejecutar; se registra en la bitácora con fecha y responsable.

| # | Decisión | Criterio | Quién | Estado |
|---|---|---|---|---|
| 1 | Objetivo | Constructo: lo que el relevo puede cambiar y lo que el piloto mide (bitácora del 8 oct: cansancio y malas noches). No por rendimiento. | Equipo | **Fijado 1 nov (Omar):** salud física, cansancio o sueño |
| 2 | Cupo | Capacidad real del programa (horas de relevo disponibles ÷ horas por hogar). Script 20 no lo fija. | Institución receptora | **Convención 1 nov (Omar):** 40.7 % (sensibilidad: 10 y 20 %); la cifra real sigue desconocida |
| 3 | Cuota entre bloques | Normativa (proporcional a la población, a la necesidad o igualitaria). | Equipo + institución | **Fijado 1 nov (Omar):** la de la regla, 62.1 / 37.9 |
| 4 | Δ mínimo relevante y δ de equidad | Cuánto debe ganar un puntaje para justificar preguntar más datos (minimización: dictamen de Daniel). | Equipo + Daniel | **Fijado 1 nov (Omar):** Δ = 5 pp, δ = 10 pp |
| 5 | Predictores primarios | Medidos igual en ambos bloques. Autopercepción solo en sensibilidad. Carga objetiva solo en un análisis dentro del bloque de discapacidad. | Equipo | Recomendado |
| 6 | Limpieza | Código 8 («No aplica») como categoría propia, no como «no»; quienes cuidan en ambos bloques como categoría propia o excluidos en sensibilidad; horas en tramos, no en corte fino. | Quien programe | Recomendado |
| 7 | Candidatos | Máximo tres, elegidos por requisitos (acepta pesos, interpretable, maneja faltantes), no ocho familias para quedarse con la mejor. Propuesta: regla compuesta fijada a priori, logística con pocos términos y tarjeta de puntos. | Equipo | Recomendado |
| 8 | Regla de decisión | Se adopta el candidato más simple cuyo límite inferior del IC 90 de ganancia sea > 0 **y** que cumpla H2. Si ninguno lo cumple: la regla, con el resultado reportado como «no concluyente» y la diferencia mínima detectable al lado. | Fijada aquí | Propuesta |
| 9 | Validación | Validación cruzada anidada por UPM (la selección de hiperparámetros dentro de cada partición), métricas ponderadas con `FAC_CUI` e IC por linealización o bootstrap de UPM. | Quien programe | Recomendado |

## 5. Pregunta que el equipo no ha resuelto y cambia el problema

La entrevista de la app ya incluye Zarit y Barthel (bitácora del 20 oct). Si la institución mide la carga directamente, **predecir el daño a partir de datos de registro no es la decisión real**. La decisión real sería otra: a quién entrevistar primero (tamizaje) o cómo repartir horas entre quienes ya se entrevistaron. Cada una pide un objetivo y una métrica distintos. Esto se resuelve antes de la decisión 1.

## 6. Qué queda verificado y qué no

**Verificado:** todas las cifras de este documento, recalculadas desde los microdatos; reproducción de la sección 11; rangos y saltos de cuestionario contra el diccionario de datos.
**No verificado:**
- Por qué el bloque 60+ admite «No aplica» y el de discapacidad no (diseño del cuestionario): no se revisó el manual.
- Si las horas «exclusivas» de los dos bloques se traslapan en el tiempo.
- La diferencia mínima detectable por bloque: no se calculó.
- La logística de D7 es propia (numpy, L2 = 1) porque el entorno no tenía scikit-learn. Mide información incremental; no es candidato a modelo.

**Siguiente paso:** el equipo fija las decisiones 1 a 4 (dos de ellas dependen de la institución). Hasta entonces, no se corre ningún modelo nuevo.


**Actualización (1 nov 2026, 10:30).** Las decisiones 1 a 4 quedaron fijadas: `Documentos/preregistro_focalizacion_2026-11-01.md` y bitácora DEC-OBJ-002.
