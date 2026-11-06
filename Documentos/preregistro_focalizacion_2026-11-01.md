# Preregistro — modelo de focalización, versión 2

**Fecha de fijación:** 1 nov 2026, 10:30 (hora CDMX) · **Decidió:** Omar · **Propuso las opciones:** Claude · **Revisor:** _[pendiente]_
**Estado:** fijado **antes** de entrenar cualquier modelo de esta versión. Ningún modelo de la v2 se ha corrido.
**Base:** `Documentos/diagnostico_focalizacion_2026-11-01.md` y `Analysis/resultados/26_diag_*.csv`.

**Límite honesto.** No es un preregistro limpio. El equipo ya conoce los resultados de la sección 11 y de los scripts 21, 22 y 26. El script 26 mostró, de forma descriptiva, cómo se relaciona cada candidato a objetivo con las horas y el bloque (`26_diag_candidatos_objetivo.csv`). Lo que sí garantiza este archivo es que objetivo, cupo, cuota, umbrales, candidatos y regla de decisión quedan fijados antes de ver el rendimiento de ningún modelo con este objetivo.

## Parámetros fijados

| # | Decisión | Valor | Razón | Sustituye a |
|---|---|---|---|---|
| 1 | Objetivo primario | `DANO_SALUD3` = declara por cuidar **salud física deteriorada, cansancio o menos horas de sueño** (P6_11_1/P6_30_1, P6_11_3/P6_30_3, P6_11_6/P6_30_6). Prevalencia ponderada 48.7 %. | Constructo: es lo que el relevo puede cambiar y lo que el piloto mide (cansancio y malas noches, bitácora 8 oct). Excluye los reactivos de trabajo, que dependen del empleo previo, la edad y el sexo. | DEC-OBJ-001 (`DANO_ALGUNO`, 20 oct) |
| 1b | Sensibilidad | `DANO_ALGUNO`, solo para comparar con la versión 1. | Continuidad | — |
| 2 | Cupo | **40.7 %** primario (tasa ponderada de la regla ≥ 40 h). Sensibilidad: 10 % y 20 %. | Convención sin capacidad inventada. Se reemplaza cuando la institución dé su capacidad real. | — |
| 3 | Cuota entre bloques | **La de la regla:** 62.1 % del cupo para el bloque de discapacidad y 37.9 % para «solo 60+». Equivale a seleccionar 44.8 % dentro del bloque de discapacidad y 35.4 % dentro del de 60+. | Neutral. Un modelo solo compite dentro de cada bloque, y cambiar la cuota sería otra decisión, normativa y registrada. | — |
| 4 | Δ | **5 pp** de cobertura sobre la regla (dentro de cada bloque y en el total con la cuota fija). | Relevancia: una persona más con daño por cada 20, a cambio de pedir más datos. | — |
| 4b | δ | **10 pp**: ningún grupo (sexo, edad 15-39 / 40-59 / 60+, ingreso, bloque) puede perder más de 10 pp de cobertura frente a la regla, en el estimador puntual. | Equidad | — |

## Lo que se fija junto con lo anterior

1. **Predictores primarios:** solo variables medidas igual en ambos bloques: tramo de horas (< 20, 20-39, 40-59, 60+), sexo, edad (3 tramos), cuida menores, capacitación recibida y quintil. **Sensibilidad A:** + autopercepción (falta fuerza, requiere apoyo). **Sensibilidad B, solo dentro del bloque de discapacidad:** + ABVD 3+ y clínicas 1+.
2. **Limpieza:** código 8 de `P6_28_x` («No aplica») como categoría propia; horas en tramos (tope de 98 por bloque, redondeo a múltiplos de 7); quienes cuidan en ambos bloques se asignan al bloque de discapacidad (como en `CUIDA_DISC`), con una sensibilidad que los excluye.
3. **Candidatos, máximo tres:** (a) regla compuesta fijada aquí: ≥ 40 h, o 20-39 h y mujer que además cuida menores; (b) logística con los predictores primarios, sin interacciones; (c) tarjeta de puntos enteros derivada de (b). No se prueban otras familias.
4. **Validación:** validación cruzada por UPM (5 × 20, `FAC_CUI` como peso), con selección dentro de cada bloque según la cuota. IC 90 % por linealización con estrato y UPM.
5. **Regla de decisión:**
   - Se adopta el candidato más simple que cumpla las tres condiciones: límite inferior del IC 90 > 0, estimador ≥ Δ y ningún grupo por debajo de δ.
   - Si el IC excluye 0 pero el estimador queda por debajo de Δ, el resultado es «superior pero no relevante» y **se queda la regla**.
   - Si el IC incluye 0, el resultado es «**no concluyente**». Se queda la regla y se reporta junto con la diferencia mínima detectable. Nunca se reporta como «la regla basta».
6. **Potencia esperada (aproximada, con el EE de la cobertura de la regla, objetivo `DANO_SALUD3`):** diferencia mínima detectable ≈ 9.5 pp en el bloque de discapacidad y ≈ 17 pp en el de 60+. Las dos son mayores que Δ, así que **el resultado más probable es «no concluyente»**. Se acepta de antemano.

## Lo que este preregistro no resuelve

- La capacidad real (cupo) y si la institución prefiere otra cuota: hacen falta la institución receptora y el piloto.
- Si la decisión real es «a quién primero» o «cuántas horas a cada quien». La app reparte horas a todas las personas (mínimo de 13 h/mes), así que el modelo informaría el nivel Alta / Media / Baja, no una exclusión. Pendiente de que el equipo lo confirme.
- Cualquier afirmación sobre la CDMX: todo es nacional.

## Enmienda 1 — 1 nov 2026, 10:45 (antes de correr ningún modelo v2)

**Decidió:** Claude, por encargo de Omar («revisa tú si dejamos la regla compuesta»). **Motivo:** la regla compuesta del punto 3(a) (≥ 40 h, o 20-39 h y mujer que cuida menores) salió de asociaciones vistas en `26_diag_info_condicional.csv`, que se calcularon con el objetivo `DANO_ALGUNO`. Evaluarla con los mismos datos favorece al candidato. Se elimina.

1. **Candidatos de la muestra completa:** (b) logística y (c) tarjeta de puntos. La regla ≥ 40 h es el comparador y, a la vez, el candidato más simple.
2. **Sensibilidad B (solo bloque de discapacidad):** además de (b) y (c) con ABVD 3+ y clínicas 1+, se evalúa **R2 del script 21** (puntaje = [≥ 40 h] + [≥ 2 actividades básicas], fijado a priori el 20 oct). Advertencia: sus resultados con otros objetivos ya se conocían.
3. **Detalles de implementación que se fijan aquí:**
   - Logística con regresores 0/1 sin estandarizar, penalización L2 = 1 sin penalizar el intercepto, pesos `FAC_CUI` normalizados a media 1.
   - Tarjeta de puntos: dentro de cada partición de entrenamiento, puntos = redondeo(5 × β_j / max|β|). Los coeficientes negativos se conservan con su signo.
   - Puntajes fuera de muestra: promedio de 20 repeticiones de 5 particiones por UPM (igual que la sección 11).
   - Comparador al cupo de 40.7 %: la regla ≥ 40 h dentro de cada bloque (coincide con la cuota). A 10 % y 20 %: las horas como puntaje continuo dentro de cada bloque. Los empates en todos los puntajes se rompen al azar con semilla fija.
   - **El veredicto primario es sobre la cobertura total con la cuota fija.** Los veredictos por bloque son secundarios: no permiten adoptar un modelo para un solo bloque.
   - Edad: 15-39 / 40-59 / 60+ (referencia 40-59). Horas: < 20 (referencia) / 20-39 / 40-59 / 60+. Quintil: construcción de la sección 11; referencia Q3; «sin dato» como categoría.

## Resultado — 1 nov 2026, 10:55

Script `Analysis/27_focalizacion_v2.py` → `resultados/27_v2_{global,por_bloque,equidad,tarjeta}.csv`. Se aplicó el preregistro sin cambios después de la enmienda 1.

**Veredicto primario: no concluyente. Se queda la regla ≥ 40 h.**
- Logística: −0.3 pp (IC 90 −5.1 a 4.4). Tarjeta: −1.4 pp (−6.1 a 3.4). Diferencia mínima detectable: 7.2 pp.
- Además, **ambos fallan δ**: los hombres pierden 33.6 pp (logística) y 32.8 pp (tarjeta) de cobertura, porque «mujer» vale 4 puntos. Q4-Q5 pierde 13-14 pp y 15-39 años, 12-13 pp.

**Sensibilidades (ninguna cambia el veredicto):**
- Cupo 10 % / 20 %: −0.2 a +1.0 pp.
- `DANO_ALGUNO`: −1.2 pp.
- Sin personas en ambos bloques: −1.9 pp.
- + autopercepción: +4.7 pp (−2.3 a 11.7); hombres −20 pp.
- Solo bloque de discapacidad + ABVD y clínicas: +6.5 pp (−0.4 a 13.5), peor grupo −23.6 pp. R2 a priori: +2.7 pp (−3.4 a 8.8), peor grupo −7.2 pp (la única que cumple δ).

**Lectura:** con la cuota fija y predictores medidos igual en los dos bloques, la ganancia de la v1 desaparece. Es consistente con el diagnóstico: la ventaja anterior venía de reasignar el cupo entre bloques. La única pista de mejora real está dentro del bloque de discapacidad, con carga observable, y no alcanza la potencia.
