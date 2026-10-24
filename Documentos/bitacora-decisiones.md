# Bitácora de decisiones — Observatorio del Cuidado

## 2026-09-11 — Demo conceptual de producto (app)

**Qué se hizo.** Se construyó una demo tipo app móvil (HTML responsivo, un solo
archivo) que combina dos de las cuatro propuestas del mockup original
(`Mockups Propuestas.html`, subido por Omar) en pestañas independientes:

1. **Clasificador de solicitudes ciudadanas (NLP)** — pega una petición,
   simula clasificación, detección de necesidad no declarada, derivación
   sugerida, y una bandeja de peticiones de la semana.
2. **Análisis de redes de cuidado** — grafo del hogar con simulación de
   "apagar nodo" (qué colapsa si falta la cuidadora principal) y vista de
   escala territorial (hogares de un solo sostén).
3. **Panel BI** (pestaña nueva, no estaba en el mockup original) —
   KPIs sintéticos agregados de las dos pestañas anteriores.

Se conservó el sistema visual del mockup original (tipografía Archivo +
JetBrains Mono; paleta guinda #9F2241 / rojo #D6202B solo para alertas /
verde #0F6E64 / fondo #12151C).

**Motivo.** Omar pidió explícitamente que el resultado final del proyecto
sea esta app, y que las pestañas de NLP y redes de cuidado fueran
independientes (no un flujo fusionado).

**Advertencia registrada en el momento.** Las instrucciones del proyecto
dicen que la etapa actual es "exploración y validación de fuentes" y que
diseñar tablero/plataforma está fuera de alcance hasta conocer los límites
reales de la información. Esta demo se declara explícitamente en la propia
app (banner persistente + etiqueta "datos sintéticos" en cada pantalla)
como **prototipo conceptual, no el Observatorio validado** — no debe
presentarse ni citarse como si fuera el producto final con datos reales.

**Calendario compartido por Omar (no estaba en los documentos del
proyecto, lo aportó él):**
- 1ª Revisión — 26 sept 2026: Documento de investigación general
  (planteamiento del problema, justificación, objetivo general, fuentes de
  datos, marco contextual), aportación de cada UCA, plan de trabajo
  integrador, roles de equipo.
- 2ª Revisión — 02–06 nov 2026: avance del documento, proyecto único
  integrado, resultados preliminares, participación de todas las UCA,
  versión casi final/final, preparación del coloquio.

## 2026-09-11 — Borrador del Documento de investigación general (1ª revisión)

**Qué se hizo.** Se redactó `Documento_investigacion_general.docx`:
planteamiento del problema, justificación, objetivo general y objetivos
específicos, marco contextual (ENASIC 2022, CSTNRHM 2024, Sistema de
Indicadores CDMX, marco normativo), fuentes de datos a explorar (los 5
bloques del Plan de exploración de fuentes que Omar ya tenía, en formato
"qué buscar / qué analizar / qué fuentes / qué falta determinar"),
aportación de cada UCA (tabla oficial del documento "Problema
Prototípico"), ruta de integración interdisciplinaria, calendario de
revisiones, y una clasificación de evidencia (confirmado / probable /
desconocido).

**Lo que quedó deliberadamente sin llenar — no inventado.** La sección de
roles del equipo quedó como tabla en blanco ("PENDIENTE"): no hay nombres
ni asignaciones de los demás integrantes del equipo en esta conversación.
Falta que Omar la complete con su equipo antes del 26 de septiembre.

**Pendiente.** Confirmar con el equipo la propuesta de calendario de dos
semanas (sección 7.3 del documento, marcada explícitamente como propuesta
a validar, no como decisión tomada).

## 2026-09-17 — Esqueleto de carpetas del repositorio (Frontend, Backend, Analysis, ML, Documentos, Fotos)

**Qué se hizo.** A petición de Omar, se crearon seis carpetas vacías con
`README.md` de estado (`Frontend/`, `Backend/`, `Analysis/`, `ML/`,
`Documentos/`, `Fotos/`). **Corregido el mismo día** — ver entrada
siguiente: primero se crearon en `Documents\Proyecto-Prototípico-2026\`
por error, y horas después se movieron a `Downloads\pp26-2\`, que es la
carpeta de trabajo real del proyecto. Esta entrada se deja tal cual se
escribió en el momento, por la regla de "historia real" del proyecto.

**Advertencia señalada en el momento.** `Frontend/` y `Backend/` como
carpetas separadas presuponen una arquitectura cliente-servidor, y `ML/`
presupone que ya se va a elegir un algoritmo — ambas cosas están marcadas
explícitamente en las instrucciones del proyecto como "fuera de alcance en
esta etapa" (exploración y validación de fuentes). Se señaló esto
explícitamente a Omar antes de crear las carpetas.

**Decisión tomada.** Omar confirmó que esto es únicamente un esqueleto
vacío, sin compromiso: ninguna carpeta implica todavía una decisión de
arquitectura, de algoritmo ni de base de datos tomada. `Analysis/` sí está
alineada con la etapa actual (EDA). `ML/` y `Backend/` quedan
explícitamente marcadas en su propio README como pendientes de la decisión
de alcance.

## 2026-09-17 — Corrección: carpeta equivocada, contenido movido a Downloads\pp26-2

**Qué pasó.** Las seis carpetas de la entrada anterior se crearon en
`Documents\Proyecto-Prototípico-2026\`, un repositorio de Git con
contenido (`ERP/` — HTML/CSS/JS/JSX de la demo del 2026-09-11 — y
`scripts/app.py`, `scripts/danita.html`) que Claude había creado ahí en
una sesión anterior, en la ubicación equivocada. La carpeta real de
trabajo del proyecto es `Downloads\pp26-2\` (confirmado: contiene los
mismos PDFs que están en este Project de Claude, más `Mockups
Propuestas.html`, el mockup original que sí está referenciado en la
entrada del 2026-09-11). Omar lo señaló y pidió mover el contenido.

**Qué se movió.** `README.md`, `ERP/` completa, `scripts/` completa, y las
seis carpetas nuevas con sus README — copiadas de
`Documents\Proyecto-Prototípico-2026\` a `Downloads\pp26-2\`.

**Qué NO se movió — limitación técnica, no decisión.** La carpeta `.git`
(historial de commits) no se pudo copiar: las herramientas remotas de
Claude tienen bloqueado escribir dentro de `.git` por seguridad, y el
puente de shell al equipo de Omar (`device_bash`) está caído por un bug de
Windows (actualización del 8 de septiembre, ya reportado y en seguimiento)
que impide otra vía. **Dato relevante:** ese repo ya tiene remoto
configurado — `https://github.com/Zidnz/Proyecto-Protot-pico-2026.git` —
así que el historial no depende solo de esta copia local; está respaldado
en GitHub. Se le explicaron a Omar dos formas de completar el `.git` en la
nueva ubicación (copiar la carpeta `.git` a mano en el Explorador, o
`git clone` del remoto), a decidir por él.

**Qué NO se borró.** `Documents\Proyecto-Prototípico-2026\` se dejó
intacta (mismo motivo técnico: sin `.git` copiado ahí no se quiso borrar
la única copia completa con historial, y tampoco hay vía remota para
borrar en este momento). Pendiente que Omar la borre una vez que confirme
que `Downloads\pp26-2\` quedó completa con `.git`.

**Nota de continuidad — sigue sin resolver.** Con o sin este movimiento,
sigue pendiente la decisión real (no técnica): si `ERP/` y `scripts/app.py`
migran a `Frontend/`/`Backend/` o se mantienen como están — eso no se
asumió ni se hizo automáticamente.

**Pendiente.**
1. Omar completa `.git` en `Downloads\pp26-2\` (copia manual o `git clone`).
2. Omar borra `Documents\Proyecto-Prototípico-2026\` una vez confirmado lo anterior.
3. Decidir con el equipo si/cuándo se justifica llenar `Backend/` y `ML/`
   con contenido real, y si `ERP/`/`scripts/` se reorganizan dentro de
   `Frontend/`/`Backend/`.

## 2026-09-20 — Revisión de "Informe Integrador Maestro v3.0", "Dossier Técnico v2.0" y matriz técnica — hallazgos de trazabilidad sin resolver, pendientes de aclarar con Omar

**Contexto.** Omar subió al Project tres documentos nuevos no registrados
antes en esta bitácora — `informe-integrador-observatorio-economia-cuidado.docx`
(v3.0), `contexto-tecnico-master-economia-del-cuidado-v2.docx` (v2.0) y
`matriz-tecnica-economia-del-cuidado.xlsx` (5 pestañas) — junto con una
"ruta paso a paso" (DATOS → EVIDENCIA → DECISIÓN → PROGRAMA) pegada como
mensaje, que trata el proyecto como si apenas fuera a empezar el paso 1
(delimitar foco).

**Contradicción de fondo señalada a Omar.** El informe integrador v3.0 ya
afirma tener: delimitación empírica cerrada (AGEB/manzana, 2020–2045),
matriz de 13 fuentes, protocolo legal (LGPDPPSO/LFPDPPP), arquitectura
CRISP-DM, algoritmos elegidos (2SFCA, NLP, matching), e incluso un
"hallazgo" territorial específico (desiertos de cuidado). Eso choca con:
(a) el estado real de la etapa según las instrucciones del proyecto
(exploración de fuentes; arquitectura/algoritmos explícitamente fuera de
alcance), y (b) el propio patrón ya señalado el 17 de sept (carpetas
`Backend/`/`ML/` presuponiendo decisiones no tomadas), ahora a mayor
escala.

**Hallazgos concretos de trazabilidad, sin verificar todavía:**
1. Ninguno de los 15 CSV que Omar tiene en el Project contiene datos a
   nivel AGEB/manzana, DENUE, Censo 2020 ni GTFS. El "hallazgo" de
   desiertos de cuidado que el informe atribuye a un cruce Censo 2020 +
   DENUE no tiene, dentro de este Project, ningún notebook o archivo de
   resultados que lo respalde — incumple la regla de trazabilidad del
   proyecto tal como está.
2. Cifras muy específicas sin fuente verificada dentro de este Project:
   26.3% del PIB (medición ampliada), 72.6% de aportación de mujeres al
   TNRH, 10.8% vs 6.7% del PIB de CDMX, "Open Up Guide for the Care
   Sector", paquetes "INEGIpy/DatosMex" y "aceso/accessibility-model-2SFCA",
   ENASEM 2024, cita puntual "LGPDPPSO Art. 71". El PDF de investigación
   más simple que Omar también subió solo respalda 23.9% / 8 billones de
   pesos / 82,339 pesos anuales — no las cifras más finas del informe.
3. La matriz técnica (pestaña `TOC_y_Gobernanza`) ya asigna el equipo a
   "Omar, Daniel, Danae" con apellidos entre corchetes sin llenar
   (`Daniel [Apellido]`), lo cual contradice la entrada del 2026-09-11 de
   esta bitácora, donde los roles del equipo quedaron explícitamente en
   blanco por falta de esa información. No está confirmado si Daniel y
   Danae son nombres reales que Omar aportó en otra sesión o texto de
   plantilla sin llenar.
4. La "ruta paso a paso" pegada por Omar reutiliza, como si fueran
   recomendaciones genéricas, el mismo territorio (Iztapalapa) y las
   mismas cifras (15 familias, 6 cuidadoras) del "incidente crítico"
   ficticio de la UCA Práctica Profesional I en `PROBLEMA_PROTOTÍPICO
   7° SEM LCDN 20262.pdf` — el caso pedagógico de la estudiante ficticia
   "Renata" en el centro "Manos que Cuidan". No está confirmado si la
   práctica profesional real de Omar está en Iztapalapa o si estos números
   se tomaron del caso de estudio institucional sin marcarlo como tal. El
   propio informe integrador (Matriz_Vacios_y_UCA, V-04) reconoce que
   todavía no hay convenio firmado con ninguna institución receptora para
   el piloto — lo que hace prematuro fijar un tamaño de piloto ahora.
5. El propio informe integrador declara en su sección 1 que el dictamen
   de doble revisión cruzada está "Pendiente de revisión" — es decir, el
   documento mismo se reconoce no verificado todavía.

**Qué NO se hizo.** No se avanzó ningún paso de la ruta pegada (ni
delimitación, ni base de datos, ni dashboard, ni modelo). Se le devolvió
a Omar la lista de hallazgos anterior antes de continuar, junto con la
pregunta de qué documento representa el estado real vigente del proyecto.

**Pendiente.**
1. Omar aclara el origen de los tres documentos nuevos (quién los generó,
   con qué herramienta, si el equipo ya los vio).
2. Confirmar o descartar cada cifra/fuente listada arriba contra su fuente
   primaria antes de que cualquiera de ellas entre a un entregable oficial.
3. Confirmar si Daniel y Danae son integrantes reales del equipo y si ya
   revisaron estos documentos (protocolo de doble revisión).
4. Confirmar si la práctica profesional real de Omar está en Iztapalapa o
   si esos datos vinieron del caso ficticio del PDF institucional.
5. Decidir explícitamente si el proyecto sigue en etapa de exploración
   (como dicen las instrucciones) o si el equipo ya decidió avanzar a
   diseño/arquitectura — y que esa decisión, si se toma, quede registrada
   aquí con motivo.

## 2026-09-20 (más tarde) — Respuestas de Omar y cambio de etapa: exploración → diseño

**Respuestas de Omar a los pendientes de la entrada anterior:**
1. **Origen de los documentos.** El informe integrador, el dossier técnico
   y la matriz técnica se generaron con NotebookLM a partir de las fuentes
   de investigación del equipo. Según Omar, todo el equipo los vio y los
   aprobó.
2. **Equipo.** Daniel y Danae son integrantes reales del equipo. Sus
   apellidos siguen sin aparecer en la matriz técnica.
3. **Sede de la práctica profesional.** Todavía no se sabe si será en
   Iztapalapa o en otro lugar. Mientras no se confirme, Iztapalapa no es
   un supuesto válido del proyecto. Las cifras "15 familias / 6
   cuidadoras" vienen del caso ficticio del PDF institucional y no se usan
   como tamaño de piloto.
4. **Cambio de etapa.** El equipo decidió pasar a la etapa de diseño el
   viernes 18 de septiembre de 2026. Omar no dio el motivo de la decisión.
   Esta bitácora no tiene el registro original de esa reunión: lo que queda
   aquí es lo que Omar reportó el 20 de septiembre.

**Siguen abiertos:**
- **Hallazgo de "desiertos de cuidado".** NotebookLM resume documentos,
  no cruza microdatos del Censo 2020 con el DENUE. Hay que identificar la
  fuente de donde sale. Si viene de una fuente externa, se cita como
  trabajo de otra persona. Si es una inferencia de NotebookLM, se marca
  como "probable" hasta que el equipo lo compruebe en un notebook.
- **Cifras sin verificar.** Hay que pedirle a NotebookLM, cifra por cifra,
  el pasaje exacto y el documento de donde sale. Lista: 26.3%, 72.6%,
  10.8% y 6.7%, Open Up Guide for the Care Sector, ENASEM 2024 y
  LGPDPPSO art. 71.
- **Estado de revisión.** La sección 1 del informe sigue diciendo
  "Pendiente de revisión". Hay que actualizarla con el nombre de quien
  revisó y la fecha.
- **Instrucciones del proyecto.** Todavía dicen "Etapa actual: exploración
  y validación de fuentes". Omar tiene que actualizarlas para que
  coincidan con la decisión del 18 de septiembre.

## 2026-09-20 — Filtro SCIAN del DENUE y primera prueba del supuesto de "desiertos de cuidado" (por alcaldía)

**Qué se hizo.** Se creó el notebook `Analysis/01_denue_oferta_cuidado.ipynb` con DENUE 05_2026, CDMX (archivo que subió Omar), y el catálogo editable `Analysis/catalogo_scian_cuidado.csv`.

**Qué se verificó en el archivo:**
- Las claves `624410`, `624120` y `624310` que propone la delimitación de NotebookLM tienen 0 registros en el DENUE. El DENUE usa SCIAN 2018 con claves separadas para sector privado y público (`624411/624412`, `624121/624122`, `623311/623312`).
- El núcleo (asilos + centros de día) suma 235 establecimientos. En 49 de ellos (21%) el nombre no indica un servicio de cuidado, y quedan en revisión manual. De los 126 centros de día, 59 se llaman club, grupo o casa del adulto mayor: la clase SCIAN no distingue cuidado de recreación.
- Asilos, por alcaldía frente a su población 60+: subrepresentados en Milpa Alta (0 asilos), Venustiano Carranza, Iztacalco, Iztapalapa (índice 0.52) y Tláhuac; sobrerrepresentados en Tlalpan, Magdalena Contreras, Xochimilco, Benito Juárez y Miguel Hidalgo.
- Centros de día: el patrón es casi el contrario. Están sobrerrepresentados en Milpa Alta, Xochimilco y Tláhuac, y Cuauhtémoc tiene el índice más bajo (0.25).
- Asilos privados del DENUE contra la capacidad del CSV de residencias privadas: correlación de Spearman 0.27 (n = 12). El número de establecimientos no sirve como aproximación de la capacidad.

**Consecuencia para el informe integrador.** La afirmación de que la oferta se concentra en el centro y falta en la periferia no se sostiene tal como está redactada. Por alcaldía, el patrón depende del tipo de servicio. El conteo de asilos respalda un faltante de oferta residencial en el oriente; el de centros de día no respalda un faltante en la periferia. Estos resultados se basan en conteos pequeños (de 0 a 15 asilos por alcaldía) y el archivo de población 60+ no tiene año ni origen documentados.

**Pendiente.** Documentar el origen y el año de los CSV de población 60+ y de capacidad; hacer la revisión manual de `revision_manual_nucleo.csv`; que el equipo valide el catálogo SCIAN; conseguir el Censo 2020 por manzana si quieren subir la resolución.

## 2026-09-20 (noche) — Capacidad residencial vs. población 60+ y revisión de la ENASIC: ¿se justifica la app de matching?

**Pregunta de Omar.** Si la idea es hacer la app, ¿hay algún hallazgo que la justifique?

**Qué se hizo.**
- Notebook `Analysis/02_capacidad_residencial_vs_poblacion.ipynb`. Compara las plazas de residencias privadas con tres denominadores: población 60+, población 80+ y discapacidad para bañarse, vestirse o comer. La métrica es el cociente de localización (QL). Resultados en `Analysis/resultados/02_indice_capacidad_residencial.csv` y fichas de fuentes en `02_fichas_fuentes.csv`.
- Omar compartió la presentación de resultados de la ENASIC 2022 (INEGI, 25 feb 2025). Las cifras relevantes se transcribieron a `Analysis/datos/enasic_2022_cifras_presentacion.csv`, con el número de lámina de cada una.

**Resultados (probables):**
- Iztapalapa tiene QL ≈ 0.05: cerca del 18% de la población 60+ de la CDMX y menos del 1% de las plazas privadas. Iztacalco e Iztapalapa quedan por debajo de 0.5 con los tres denominadores, igual que Gustavo A. Madero. El orden de las alcaldías casi no cambia con el denominador (Spearman ≥ 0.94, n = 12).
- Gustavo A. Madero tiene 5 instituciones públicas que no son clubes, incluidas las únicas 2 residencias permanentes públicas del archivo. Iztapalapa tiene 1 e Iztacalco 0.
- El archivo de población 60+ está en % de la población total de la CDMX (verificado). Se parece más a 2020 que a cualquier año de la proyección, sin coincidir exactamente. Que sea el Censo 2020 es probable, no confirmado.
- Siguen sin conocerse el productor, el año y la cobertura del CSV de capacidad. Tampoco se sabe si VC, TLAH, CUAJ y MA valen 0 o son dato faltante.

**ENASIC (nacional, no desagregable a CDMX):**
- La presentación **no publica** ninguna pregunta del tipo "no sabe dónde hay servicios" para personas mayores o dependientes. Con esta fuente no se puede probar que la barrera sea de información. Falta revisar el cuestionario y los microdatos.
- La necesidad declarada apunta a cuidado personal en casa, no a instituciones:
  - Apoyo de enfermería o persona cuidadora: 59.9% (discapacidad) y 65.1% (60+ sin discapacidad).
  - Residencia de día: 25.1% y 13.8%. Residencia permanente: 5.0%.
- 48.8% rechaza que lo lleven a una residencia. Los motivos son culturales y de confianza ("responsabilidad de la familia" 56.6%, "tratan mal" 23.4%), no de precio ("caros" 3.1%). Quienes sí aceptan una institución piden personal capacitado (76.0%) y buen trato (59.3%) antes que precio (10.3%).
- 68.4% de las mujeres cuidadoras que quieren trabajar y no lo hacen dicen que no tienen quién cuide.
- Omar también compartió el comunicado de prensa 578/23 (3 oct 2023, p. 14): solo el **0.8% de los hogares** (0.3 M) contrató personal de enfermería o de cuidados. Hay una brecha entre la necesidad declarada de apoyo de enfermería o persona cuidadora y la contratación efectiva. La brecha es orientativa, porque compara personas con hogares. Es el primer dato compatible con un problema de conexión, pero no distingue si la causa es precio, confianza o información.
- El mismo comunicado menciona la **ENESS 2017** (INEGI-IMSS), representativa por entidad federativa, que preguntó sobre el pago a quien cuida a personas mayores. Es una posible fuente para CDMX; hay que verificarla.

**Consecuencia para el diseño.**
1. El faltante de plazas residenciales en el oriente no basta para justificar abrir residencias: la demanda declarada de residencias es baja.
2. Tampoco justifica un matching por falla de información: esa barrera no se ha medido.
3. Lo que sí sostiene la evidencia (probable, nacional) es demanda de **cuidado domiciliario con personal capacitado y confiable**. Eso es compatible con un perfil "Puedo cuidar" que tenga verificación. Pero el eslabón de que las familias no encuentran a quién contratar sigue sin evidencia.
4. Tampoco hay ningún dato sobre la oferta de personas cuidadoras remuneradas.

**Qué NO se decidió.** No se aprobó ni se descartó la app. El equipo tiene que decidir.

**Pendiente.**
1. Revisar el cuestionario y los microdatos de la ENASIC para encontrar preguntas sobre conocimiento o búsqueda de servicios.
2. Buscar una fuente de oferta de cuidadoras remuneradas. La ENOE (trabajadoras del cuidado) y la ENESS 2017 (pago a cuidadores, por entidad) son candidatas a verificar.
3. Documentar el origen del CSV de capacidad.

## 2026-09-20 (noche, cont.) — "Conociendo la base de datos" de la ENASIC y revisión del cuestionario

**Qué llegó.** Omar compartió *ENASIC 2022. Conociendo la base de datos* (INEGI, 2025). Describe:
- **Seis tablas:** TVIVIENDA, THOGAR, TCSDEMPO, TPOB_CUI, THOG_UNIP y TPER_ELE.
- **Llaves:** LLAVEVIV, LLAVEHOG, LLAVESDE y LLAVEMOD.
- **Cinco factores de expansión:** FAC_VIV, FAC_HOG, FAC_CUI, FAC_SEL y FAC_UNI.
- **Diseño muestral:** UPM_DIS (unidad primaria de muestreo) y EST_DIS (estrato). El código en R del INEGI estima con `survey::svydesign`.
- **Criterios de calidad por coeficiente de variación:** precisión alta si CV < 15%, moderada entre 15% y 30%, baja si CV ≥ 30%.

En el propio ejemplo del INEGI, para las personas de TCSDEMPO se usa FAC_HOG.

**Revisión del cuestionario** (consultado en línea el 2026-09-20 con una lectura automática; **falta verificarlo a mano**):
- No hay preguntas sobre **por qué no se contrata** cuidado pagado, ni sobre **cómo se busca** a una cuidadora.
- Sí hay preguntas sobre contratación de personal de enfermería o de cuidados (2.4), cuántas personas, sexo, horas y **pago semanal** (2.5–2.8).
- La sección 3a tiene ingresos totales del hogar.

**Consecuencia.**
- La hipótesis de que la barrera es de información **no se puede probar con la ENASIC**. Se necesita otra fuente o levantar datos en el piloto.
- La hipótesis de que la barrera es el **precio sí se puede probar a nivel nacional**. Se compararía el pago semanal de quienes contratan con el ingreso de los hogares que declaran necesitar enfermería o una persona cuidadora (pregunta 4.14).

**Pendiente.**
1. Verificar a mano los números de pregunta en el cuestionario.
2. Descargar los microdatos y el descriptor de archivos.
3. Hacer el notebook 03 (precio contra ingreso, con diseño muestral y CV).

## 2026-09-20 (noche, cont.) — Microdatos ENASIC: barreras de uso, oferta declarada y precio (notebook 03)

**Qué se hizo.** Omar subió los microdatos de la ENASIC 2022 en CSV. Con ellos se creó `Analysis/03_enasic_barreras_uso_servicios.ipynb`, con estimaciones ponderadas, varianza por linealización de Taylor (estratos EST_DIS, conglomerados UPM_DIS) y criterios de CV del INEGI. Resultados en `Analysis/resultados/03_enasic_barreras_estimaciones.csv`.
- **Validación:** reproduce el 32.0% y los 31.7 M de personas cuidadoras publicados.
- **Contratación:** da 0.7% de hogares que contratan enfermería o cuidadoras, frente al 0.8% publicado. El valor publicado cae dentro del intervalo al 90%.

**Corrección a la entrada anterior.** La lectura automática del cuestionario estaba equivocada: **sí existen** preguntas sobre búsqueda y razones para no buscar servicios (P6.42–P6.45), sobre preferencia de lugar (P6.46) y sobre disposición a ser cuidador(a) pagado(a) (P6.47–P6.48). Están en TPOB_CUI, THOG_UNIP y TPER_ELE. La entrada anterior se deja tal cual, por la regla de historia real.

**Resultados (nacional; probable para el programa):**
1. Casi nadie busca servicios de cuidado: 3.0% de las personas cuidadoras (precisión alta).
2. Entre quienes cuidan a una persona con discapacidad o de 60+ y no buscaron:
   - "no tuvo necesidad": 49%;
   - "el propio hogar cuida": 42%;
   - "desconoce que existen": 0.9% en todas las cuidadoras (moderada; en la población objetivo la precisión es baja);
   - "son caros": alrededor de 2–3%.
3. Preferencia si contratara: en casa 58%; no contrataría 36%; en una institución menos del 5%.
4. Oferta declarada: 40% de la población de 15 a 60 años (45% de las mujeres) sería cuidador(a) si le pagaran, y 95% de ellas y ellos se capacitaría. Es intención, no oferta real.
5. Contratación en hogares con discapacidad o 60+: alrededor de 1% (moderada). El pago mediano de la muestra es de unos $800 a la semana, unos $3,500 al mes: 53% del ingreso mediano de esos hogares. Es un cálculo descriptivo con n = 45, sin ponderar.

**Consecuencia.**
- La hipótesis de que la barrera es de información se descarta para los servicios institucionales.
- La evidencia apunta a una norma familiar de cuidado y a un precio alto frente al ingreso, con oferta declarada abundante.
- Un matching sin un componente de precio no ataca la barrera observada.
- **Límite:** P6.45 pregunta por lugares, no por contratar cuidado domiciliario. Esa barrera específica sigue sin medirse.

**Nota de repositorio.** Los microdatos (38 MB) no se suben al repo, según la regla del proyecto. Se documenta el procedimiento: descargarlos de la página de la ENASIC y descomprimirlos en `Analysis/datos/enasic/`.

**Qué NO se decidió.** No se aprobó ni se descartó la app. El equipo tiene que decidir.

## 2026-09-20 21:50 — Decisión: reencuadrar el programa alrededor del precio y del cuidado domiciliario

**Decisión.** Omar eligió reencuadrar el programa de innovación social. El hallazgo base deja de ser "las familias no encuentran servicios" y pasa a ser "hay demanda de cuidado en casa y oferta declarada, pero casi no se contrata porque el precio es alto frente al ingreso y la norma es que la familia cuida".
Se descartó la alternativa de mantener el matching como hipótesis central a probar en el piloto.

**Motivo.** Resultados del notebook 03 (microdatos ENASIC, nacional):
- "desconoce que existen" < 1%;
- preferencia por cuidado en casa 58%;
- oferta declarada 40%;
- contratación ≈ 1%;
- costo mediano ≈ 53% del ingreso mediano de los hogares con necesidad.

**Estado.** Lo decidió Omar el 20 de septiembre. **Falta que Daniel y Danae lo confirmen** (protocolo de doble revisión). No es decisión de equipo hasta entonces.

**Qué cambia.**
- La app deja de ser la solución. Queda como la plataforma del Observatorio (obligatoria) y, si acaso, como herramienta dentro del programa.
- La demo del 2026-09-11 (NLP + redes) no se sostiene como programa.

**Qué sigue abierto.**
- Validar en CDMX. La ENASIC es nacional y solo da el contexto; la CDMX necesita otra fuente o el piloto.
- Medir en el piloto la barrera para contratar cuidado domiciliario.
- Buscar datos de precio del cuidado en la CDMX (ENESS 2017 por entidad, ENOE).

## 2026-09-20 (noche) — Documento "Replanteamiento del problema y del programa" v0.1

**Qué se hizo.** Se generó `Documentos/Replanteamiento_problema_programa_v0.1.docx` (15 páginas).
- **Trazabilidad:** las cifras se leen de `Analysis/resultados/*.csv` y de `Analysis/datos/enasic_2022_cifras_presentacion.csv`, a través de `Documentos/_valores.json`. El documento lo genera el script `Documentos/build_replanteamiento.js`.
- **Fuentes nuevas:** para que el precio fuera trazable, el notebook 03 ahora guarda `resultados/03_precio_vs_ingreso_muestra.csv`.
- **Estructura:** cada párrafo cita una fuente del registro F1–F15 y declara su nivel de evidencia.

**Estado.** Borrador pendiente de doble revisión por Daniel y Danae. No se ha elegido ninguna alternativa de programa (A/B/C).

## 2026-09-20 (noche) — Objetivo general candidato y revisión de la app como resultado final

**Contexto.** Omar propuso como objetivo general: "Un sistema de información y política pública para identificar las brechas de acceso al cuidado domiciliario y diseñar mecanismos que reduzcan su costo para los hogares". En la revisión se señaló que ninguna fuente del proyecto mide la oferta de cuidado domiciliario por alcaldía, que el CSV de gasto no tiene territorio ni categorías de cuidado de personas mayores, y que "diseñar mecanismos que reduzcan su costo" compromete la solución antes del hallazgo.

**Objetivo candidato (propuesta de Omar, pendiente del equipo):**
> Analizar la correspondencia entre la necesidad de cuidado de personas mayores y con discapacidad y la infraestructura de cuidado disponible en las alcaldías de la CDMX, y caracterizar a escala nacional la carga de tiempo y gasto que el cuidado representa para los hogares, como base para una propuesta de intervención.

Se usa "analizar la correspondencia" y no "identificar desigualdades/diferencias" para no presuponer el resultado.

**Cambio de decisión sobre la app.**
- **Decisión anterior (2026-09-11):** la app (clasificador NLP + redes de cuidado + panel BI) se planteó como resultado final. Omar confirmó que fue propuesta suya, no requisito institucional.
- **Cambio:** la app deja de ser el producto final comprometido y queda como prototipo conceptual con datos sintéticos. La intervención y la forma del producto se definen después de validar fuentes e indicadores.
- **Motivo:** ninguna función de la app tiene hoy una fuente de datos identificada, y el objetivo candidato no presupone la solución.
- **Se mantiene:** el tablero con KPI (Inteligencia de Negocios) y el modelo validado (Herramientas y Técnicas Avanzadas), que exigen las UCA.

**Estado.** Propuesta de Omar. Se presenta al equipo el 26 de septiembre junto con el objetivo candidato, en la misma discusión.

## 2026-09-20 (noche, cont.) — Matriz de tipología oferta–necesidad y propuesta de regla de compatibilidad

**Qué se hizo.** Se crearon `matriz_tipologia_oferta_necesidad.csv` (8 filas de oferta, 5 de necesidad) y `pares_oferta_necesidad.csv`. La matriz separa por función lo que hasta ahora se agrupaba como "infraestructura de cuidado": residencial permanente, cuidado diurno, socialización, cuidado domiciliario y función desconocida.

**Regla propuesta (Omar, pendiente del equipo).** Solo se construye un indicador territorial cuando oferta y necesidad son compatibles en cuatro criterios: población objetivo, territorio (cobertura completa, distinguiendo cero de dato ausente), unidad de medida (capacidad frente a personas) y periodo de referencia.

**Resultado al aplicar la regla.** Ningún par oferta–necesidad la cumple hoy. En consecuencia:
- El QL del notebook 02 (plazas privadas contra 60+/80+) se mantiene como resultado exploratorio "probable", no como indicador.
- Clubes y centros culturales se excluyen de la oferta de cuidado.
- El cuidado domiciliario, que es el servicio con mayor demanda declarada en la ENASIC, no tiene fuente territorial.

**Contexto del cambio de etapa.** El paso a diseño se decidió el viernes 18 de septiembre. Las pruebas de las fuentes territoriales (notebooks 01 y 02, y esta matriz) se hicieron el 20. Es decir, la decisión se tomó antes de verificar si las variables permitían construir el indicador territorial. Aquí se registra el hecho, sin calificarlo.

**Propuesta para la revisión del 26 (no es decisión de equipo).** Mantener el componente territorial en exploración hasta cerrar las acciones de la matriz. El bloque nacional (ENASIC/ENUT) sigue por separado y no alimenta ninguna medida por alcaldía.

**Estado.** Pendiente de doble revisión por Daniel y Danae.

## 2026-09-20 (noche, cont.) — Revisión de un texto sobre barreras: la jerarquía de la evidencia estaba invertida

**Qué llegó.** Un texto (origen no confirmado) que presentaba la asequibilidad como la barrera respaldada por datos y la norma familiar como interpretación.

**Hallazgo de la revisión.** Las cifras coinciden con el notebook 03, pero la jerarquía causal no:
- Entre quienes cuidan a una persona con discapacidad o de 60+ y no buscaron servicios, "el propio hogar cuida" ≈ 42%; "son caros" ≈ 2–3%. En residencias, "responsabilidad de la familia" 56.6% contra "caros" 3.1%.
- El 53% (pago mediano / ingreso mediano) es n = 45, sin ponderar, y sale de hogares que **sí** contratan: tiene sesgo de selección y no explica por qué no contrata quien no contrata. Falta confirmar si numerador y denominador vienen de la misma población.
- El ≈36% que "no contrataría" es difícil de explicar solo con precio.
- P6.45 pregunta por lugares, no por contratar cuidado domiciliario.

**Implicación para la decisión de las 21:50.** El reencuadre de esa noche nombra "precio alto frente al ingreso" y "norma familiar" como causas. Con la evidencia actual, la norma familiar tiene más respaldo directo que el precio.

**Siguiente análisis propuesto.** Tasa de contratación por quintil de ingreso entre hogares con necesidad, con microdatos ENASIC, ponderada y con CV. Si en el quintil más alto sigue cerca de 1–3%, el precio no es el cuello de botella principal.

**Pendiente.** Confirmar el denominador del 53%; hacer el análisis por quintil antes de redactar el replanteamiento para la 1.ª revisión.

## 2026-09-20 (noche, cont.) — Presentación de avance y revisión del documento de Daniel

**Presentación.** Se generó una presentación de avance de 14 láminas (artefacto de diapositivas en claude.ai, no está en esta carpeta). Toda cifra sale de la bitácora y de los notebooks 01–03, con nivel de evidencia y fuente en el pie. El reencuadre aparece como propuesta de Omar, pendiente de Daniel y Alondra Danae. Quedaron tres responsables "[por asignar]" en la tabla de pendientes; asignar a Daniel "sede de la práctica" es inferencia, no dato.

**Documento de Daniel (fechado el 18 de septiembre).** Riesgos de la plataforma, verificación de cuidadores y KPI de seguridad. Revisión:
- La cifra de 863 casos de maltrato a personas mayores en CDMX (2020) existe, pero otras notas de la misma fuente reportan 825; hay que aclararlo. Además, la violencia registrada es mayoritariamente familiar, así que no sostiene el riesgo de la plataforma que se usa para justificar.
- Presenta como tomadas decisiones que esta bitácora no registra (zona A/B, seudonimización, verificación de cuidadores, piloto en 2–3 colonias). Pudieron acordarse en una reunión no documentada: hay que preguntarle.
- Metas de KPI ("<2 %", "<7 días", ">80 %", "<5 por cada 100") sin línea base.
- Cifras por verificar: "1 de cada 6 adultos mayores", la cita de la ONU sobre "141 millones", la brecha de 12.2 puntos de la ENIF, la tabla atribuida al estudio de Tlaxcala (Raccanello), y los artículos de la LGPDPPSO citados.
- Rescatable: verificación escalonada, minimización de datos y la conexión con la ENASIC (quienes aceptarían cuidado pagado piden personal capacitado y buen trato; 23.4% rechaza residencias porque "tratan mal").
- El documento da por hecho el matching, que el reencuadre pone en duda: es señal de que el reencuadre no está compartido con el equipo.

**Pendiente.** Omar o Alondra Danae revisan el documento por escrito (doble revisión); Daniel verifica el marco legal vigente y si la UNRC es sujeto obligado de la LGPDPPSO.

## 2026-09-21 — Sincronización de la carpeta local `Downloads\pp26-2`

**Qué se encontró.** La carpeta local estaba al día solo hasta el 18 de septiembre. Todo lo producido el 20 de septiembre existía únicamente como adjuntos de chat, porque el puente al equipo de Omar estaba caído en esas sesiones. Tampoco existe todavía `.git` en `Downloads\pp26-2` (pendiente del 17 de septiembre).

**Qué se agregó.**
- `Analysis/matrices/matriz_tipologia_oferta_necesidad.csv` y `pares_oferta_necesidad.csv`, reconstruidos con el mismo contenido de la sesión del 20 (script `_generar_matriz.py` en la misma carpeta). Siguen pendientes de doble revisión.
- `Documentos/bitacora-decisiones.md`: copia de esta bitácora dentro del repositorio.
- `README.md` raíz y `ESTADO_SINCRONIZACION.md` con la lista de archivos que faltan.

**Qué NO se pudo agregar (no se inventó ni se reconstruyó).** Los notebooks 01, 02 y 03, sus resultados, el catálogo SCIAN, `revision_manual_nucleo.csv`, `enasic_2022_cifras_presentacion.csv`, el `.docx` de replanteamiento y su script. Solo existen como adjuntos de las sesiones del 20 de septiembre; Omar tiene que descargarlos y colocarlos en las rutas listadas en `ESTADO_SINCRONIZACION.md`.

**Trabajo en la carpeta que esta bitácora no tenía registrado (18 de septiembre).**
- `Analysis/eda_fuentes.py` y 17 archivos en `Analysis/resultados/` (EDA de los CSV de `Data/investigacion/`).
- `Frontend/`: prototipo móvil de matching (clasificador por reglas, compatibilidad, redes, mapa por alcaldía) con filtros legales simulados que piden CURP, carta de no antecedentes y cédula profesional. Todo con datos sintéticos en `localStorage`.
Se registran aquí con fecha de hoy, porque no hay registro de cuándo ni por qué se decidieron. El `Frontend/` es anterior al reencuadre y da por hecho el matching.

## 2026-09-21 (10:30) — Corrección a la entrada anterior: sí se recuperaron el código y los CSV

**Qué cambió.** La entrada anterior decía que los notebooks 01–03 y sus insumos "solo existen como adjuntos" y que Omar tenía que descargarlos. Omar preguntó si el código y los CSV podían recuperarse. Sí se pudo: están completos en las transcripciones de las sesiones del 14 y el 20 de septiembre. Se extrajeron de forma automática y se les aplicaron, en orden, los mismos parches de esas sesiones. La entrada anterior se deja tal cual, por la regla de historia real.

**Recuperado y ejecutado:** notebook 02 y sus dos resultados. Reproduce las cifras registradas el 20 de septiembre (Iztapalapa QL = 0.05; 1.24 plazas por 1,000; Miguel Hidalgo 125).

**Recuperado sin ejecutar:** notebook 01 y `catalogo_scian_cuidado.csv`; notebook 03, que incluye la salida `03_precio_vs_ingreso_muestra.csv`; `etoe_cuidados.py`; `generar_valores.py` y `build_replanteamiento.js`. Les faltan los datos crudos: DENUE 05_2026, microdatos de la ENASIC 2022 y de la ETOE 2020. El sitio del INEGI está bloqueado desde el entorno de Claude y desde el puente con la computadora de Omar.

**También recuperado:** `enasic_2022_cifras_presentacion.csv` (35 cifras), `inventario_fuentes_cuidado.csv` (14 sept) y la tabla oferta–demanda v0 (14 sept, marcada como reemplazada por el notebook 01).

**Consecuencia.** Mientras no se vuelvan a ejecutar los notebooks 01 y 03, sus cifras (235 establecimientos, 3.0%, 0.9%, 58%, 40%, 53%, etc.) solo están respaldadas por esta bitácora, no por un archivo de resultados en el repositorio. No deben entrar al documento del 26 hasta regenerarse.


## 2026-09-22 — Matriz de referencias de apps de cuidado y correcciones al documento de exploración

**Qué se hizo.** Omar preguntó qué objetivo, problematización y evidencia de funcionamiento tienen las apps de matching citadas en `Exploracion_referencias_y_matching.pdf`. Se construyó `Analysis/matrices/matriz_referencias_matching.csv`: 12 casos, 17 columnas (modelo real, si es matching, quién paga, problema declarado y su origen, resultado reportado, tipo de evidencia, quién la produce, clasificación, limitaciones, lección, fuente y fecha de consulta 2026-09-21). Se agregaron dos casos que cerraron (HomeHero y Respect, EUA, 2017) para contrarrestar el sesgo de supervivencia. La matriz se compiló a mano a partir de búsquedas web; no tiene script generador.

**Correcciones al documento de exploración (se deja tal cual, por la regla de historia real):**
- ANA Care no es "solo capacitación": opera también como agencia (agenda, pagos, cuidadoras registradas) en 8 países. Tiene proyecto BID Lab ME-T1485 (2022) con meta de ≥1,000 personas mayores de bajos ingresos; no se encontró informe de resultados.
- Cuideo: no se encontró fuente para "redujo incidentes de forma marcada". Lo que sí hay: modelo mixto, en 2020 ~200 de ~10,000 cuidadoras contratadas directamente, y compra de Felizvita para prestación directa.
- Gericare es de Monterrey (2010), no de la CDMX.
- La nota de Expansión sobre Nannapp es contenido pagado (`bespoke-ad`); Nannapp se enfoca sobre todo en cuidado infantil. "Cero incidencias" es autodeclarado.
- Care Me: no se encontró ninguna fuente adicional. Queda como desconocida; no citar.
- Buurtzorg: el "40% de ahorro" que circula viene de un estudio de Ernst & Young; la evaluación de KPMG (2015) encontró costo total por paciente promedio al incluir hospital, médico y residencia.

**Hallazgos (probables):**
1. Ninguna empresa documenta su problema con datos; casi todas parten de la experiencia personal de la fundadora o el fundador.
2. La mejor evidencia de resultados (Papa: soledad UCLA-3, urgencias, reingresos) la produjo la propia empresa, sin aleatorización y con fuerte abandono (435 de 2,650 con seguimiento).
3. Respect (EUA) reporta que dar más información a las familias no aumentó la contratación: evidencia en contra de la hipótesis de barrera de información, coherente con el notebook 03.
4. Careship creció con financiamiento público del seguro de cuidados alemán; HomeHero cerró cuando tuvo que contratar a sus cuidadoras como empleadas (costo de incorporación ×10). El modelo de marketplace depende de financiamiento público o de condiciones laborales precarias.

**Qué NO se decidió.** No cambia la decisión del 20 de septiembre (reencuadre), que sigue pendiente de Daniel y Alondra Danae.

**Pendiente.**
1. Doble revisión de la matriz (Daniel o Alondra Danae).
2. Buscar el informe de cierre del proyecto BID ME-T1485 (ANA Care), el caso más cercano a población de bajos ingresos en México.
3. Actualizar o marcar como superado el documento `Exploracion_referencias_y_matching.pdf` antes de citarlo en la 1.ª revisión del 26.


## 2026-09-22 (08:30) — Documentos del BID sobre ANA Care (proyecto ME-T1485)

**Qué llegó.** Omar compartió el Memorando a los donantes (aprobado 2022-05-02) y el Reporte de Estado de Proyecto PSR-10479 (01/10/2024–30/09/2025, con marca de borrador). Copias en `Documentos/referencias/`. Se actualizó la fila R03 de `matriz_referencias_matching.csv`.

**Qué dicen (confirmado que los documentos lo reportan):**
- Problema declarado: falta de cuidadoras capacitadas, de sistema de calidad y de plataformas que conecten oferta y demanda. La dependencia se sustenta con literatura del BID; la falta de conexión oferta–demanda se afirma sin dato que la mida.
- Financiamiento: US$1.5 M (BID Lab US$86.5k no reembolsable + US$663.5k de recuperación contingente; contrapartida US$750k).
- A sep 2025: 7,105 cursos iniciados y 3,006 terminados (metas superadas); 32 acreditaciones CONOCER contra meta de 90 (atrasado); 1,256 personas en familias que consiguieron cuidadora; 9,853 "ofertas de empleo". Costos no cubiertos por ventas. El matching cuidadora–familia se integró como módulo en 2025.
- La "evaluación de objetivos y resultados" sigue en 0 de 1. La evaluación de impacto solo se planteó como posibilidad.

**Problemas de medición detectados (probable):**
1. Las 9,853 ofertas de empleo se reportan también como "empleos directos generados".
2. "Familias que consiguen cuidadora" se reporta como "personas con condiciones de vida mejoradas".
3. Las fuentes de verificación declaradas son "experiencia personal" e "información administrativa".
4. Los % de alumnos de zonas vulnerables (52%, 80%) están fechados en 2022; la empresa reconoce que se calcularon con una base limitada.
5. La meta de acreditaciones CONOCER aparece como 159, 306 y 357 en el mismo memorando.
6. El PSR afirma que se "demostró" la reducción de días de hospitalización, sin presentar datos.

**Relevante para el proyecto.** El PSR reconoce como barrera externa que "sin un tercero pagador (gobierno, aseguradora, programa corporativo), el ticket directo B2C es limitado" por la baja capacidad de pago de las familias. Es coherente con la barrera de precio del notebook 03, pero es la opinión de la empresa, no una medición. También menciona negociaciones con el Instituto de Envejecimiento Digno de la CDMX: posible contacto para la práctica profesional (no verificado).

**Pendiente.** El punto 2 del pendiente de la entrada anterior queda atendido en parte: a sep 2025 no había evaluación de resultados ni de impacto. No se sabe si hubo informe de cierre después (el último desembolso vencía el 2025-11-18). Queda la doble revisión de la matriz.

## 2026-09-22 (09:20): Notebook 01 reejecutado y reproducción del estudio CESA/Colmex

**Qué se hizo.**
1. Omar colocó en la raíz de la carpeta los ZIP oficiales del DENUE CDMX 05_2025 (modificado el 22/05/2025) y 05_2026 (modificado el 20/05/2026). El CSV de 05_2026 se descomprimió en `Data/raw/denue_inegi_09_.csv`. `Data/raw/` y los ZIP no deben subirse al repositorio.
2. `Analysis/01_denue_oferta_cuidado.ipynb` se ejecutó completo, sin errores, y regeneró `Analysis/outputs/` (6 archivos). **Reproduce exactamente las cifras de la entrada del 20 sept:** 462,732 registros; núcleo de 235 establecimientos; 49 (21%) con nombre dudoso; 59 de 126 centros de día con nombre de club, grupo o casa del adulto mayor; índice de asilos de Iztapalapa 0.52; índice de centros de día de Cuauhtémoc 0.25; Spearman 0.27 (n = 12). Esas cifras dejan de estar respaldadas solo por esta bitácora.
3. Se reprodujo el Cuadro 2.2 del estudio CESA-CDMX / CEDUA-Colmex "Economía del cuidado" (2026) con el DENUE 05_2025: 48 de 48 celdas idénticas en unidades y 48 de 48 en personal ocupado. El estudio no declara su regla de personal; se identificó por mínimos cuadrados (0–5 → 3, 6–10 → 8, 11–30 → 20, 31–50 → 40, 51–100 → 75, 101–250 → 175). Ver `Analysis/reproduccion_colmex_2026-09-22/`. El estudio se registró como F19 en `inventario_fuentes_cuidado.csv`.

**Hallazgo.** El indicador del estudio de "134 viviendas con 65+ por ocupado" depende de la clasificación SCIAN. Con los mismos datos va de 112 (si se suman los centros de día 624121/2, que el estudio contó solo en discapacidad) a 225 (solo residencias y asilos). No es un nivel robusto; no citarlo sin esa advertencia.

**Qué NO se reprodujo.** Los cuadros de demanda del estudio (Censo 2020, cuestionario ampliado) y su "valor económico del cuidado" de 18%, que es una diferencia descriptiva de ingreso medio entre tipos de hogar, no una valoración ni un efecto causal. Solo se verificó su aritmética.

**Notas.**
- La clasificación del estudio (24 clases, incluye primera infancia) no coincide con `catalogo_scian_cuidado.csv` (60+ y discapacidad). Sus cifras sirven para comparar, no para sustituir las del proyecto.
- El archivo del estudio que tiene el equipo es una versión de imprenta: falta localizar la versión publicada y su URL antes de citarlo.

**Pendiente.** Doble revisión de F19 y de `Analysis/reproduccion_colmex_2026-09-22/`; revisión manual de `Analysis/outputs/revision_manual_nucleo.csv`; notebook 03 (siguen faltando los microdatos de la ENASIC).

## 2026-09-22 (00:34, registrada a las 09:55): Revisión de documentos compartidos: IMCO, CEPAL, Colmex y seis archivos generados con IA

**Qué llegó.** Omar compartió, sin instrucción, tres PDF (CEPAL *Notas para la igualdad* n.º 30, 2020; IMCO *Hacia una economía de cuidados en México*, 2025; CESA-CDMX / CEDUA-Colmex *Economía del cuidado*, 2026) y seis archivos más: tres .pptx ("The Mexican Care Blueprint", "Mexico's Living Care Infrastructure", "The Care Infrastructure") y tres .docx ("Situación y Perspectivas…", "Reporte Técnico…", "Reporte Integral…").

**Resultado de la revisión:**
- **CEPAL 2020:** conceptual, sin cifras. Útil solo para el marco teórico.
- **IMCO 2025:** compila cifras de otras fuentes; no citarlo como fuente de cifras. Tiene inconsistencias internas:
  - titular de 5.5 M de cuidadoras faltantes contra una tabla que suma 6.1 M;
  - grupos que requieren cuidado que se traslapan (58.5 M publicados contra 59.6 M sumados);
  - fuente del gasto por decil distinta en la nota y en la gráfica (ENIGH 2022 contra 2024);
  - estándares de cobertura tomados de referencias suizas.
  
  Aporta dos pistas por verificar: el Mapa de Cuidados de México (MACU) y la ENOE.
- **Colmex 2026:** es la fuente más útil para el componente territorial. Ver la entrada de las 09:20 y la fila F19 del inventario.
- **Los seis archivos .pptx/.docx son síntesis generadas con IA, no fuentes:**
  - las 43 diapositivas tienen marca de agua "Gemini Notebook" y son solo imágenes;
  - los .docx se generaron con python-docx y citan con números sin bibliografía.
  
  **Se excluyen como fuente.** Errores confirmados:
  - 28.5% del PIB contra 26.5% (el 28.5% es la aportación de los hombres);
  - 42.3 contra 15.2 h/semana y 268 contra 155 min/día en la misma lámina (equivalen a 31.3 contra 18.1 h/semana);
  - 21.7% del PIB atribuido a la cuenta satélite del INEGI cuando viene de un estudio rural de Jilotepec, con una nota que explica por inflación una diferencia de 209 veces;
  - tres versiones distintas de los salarios de cuidadoras;
  - umbrales de 60+ y 65+ mezclados;
  - el 96% de personas con discapacidad generalizado a "personas dependientes".
  
  "26.4 M de mujeres que no buscan empleo por cuidados" queda como desconocida.

**Propuesta (de Claude, no es decisión de equipo).** Los resúmenes generados con IA (NotebookLM, Gemini u otros) sirven como guía de lectura, nunca como fuente citable ni como origen de una cifra. Es coherente con el antecedente del 20 de septiembre (informe integrador generado con NotebookLM y cifras sin rastrear). **Pendiente:** que el equipo la adopte o la rechace, y que Omar aclare quién generó estos seis archivos y si alguna de sus cifras ya entró a algún entregable.

**Nota.** Por error se creó una carpeta `C:\Users\Jsull\pp26-2` con una matriz provisional antes de ubicar la carpeta real. Su contenido útil ya está en `Downloads\pp26-2`, así que Omar puede borrarla.

## 2026-09-22 (08:35, hora de CDMX): El repositorio remoto previsto es el de MILPÍN, no el del Observatorio; `.gitignore` creado

**Qué se verificó.**
- `https://github.com/Zidnz/Proyecto-Protot-pico-2026.git` (rama `main`, último commit `f7f2438`) contiene 332 archivos de **MILPÍN** (riego FAO-56, XGBoost, Power BI, simulador 3D). No tiene ningún archivo del Observatorio.
- El `.git` de `Documents\Proyecto-Protot-pico-2026\` es del 20 de abril de 2026 y apunta a ese mismo remoto.

**Consecuencia.** Los pasos 1 y 2 de "Pendientes de repositorio" en `ESTADO_SINCRONIZACION.md` eran incorrectos:
- Copiar ese `.git`, o clonar ese repositorio y mover el contenido, habría mezclado el Observatorio con la historia de MILPÍN.
- Borrar `Documents\Proyecto-Protot-pico-2026\` no es seguro mientras no se revise qué contiene fuera de `.git`.

La nota de ese archivo se deja tal cual (regla de historia real); la corrección se agrega al final.

**Qué se hizo.**
- Se creó `.gitignore` en la raíz. Excluye `Data/raw/` (DENUE, 260 MB), `*.zip`, los microdatos de ENASIC y ETOE, credenciales, `__pycache__/` y `.vscode/`. Se probó en un repositorio temporal.
- Se simuló el primer commit sin escribir en la carpeta: entrarían 102 archivos (unos 7 MB). El más grande es `Documentos/S2600153_es.pdf` (1.9 MB).

**Decisiones abiertas (de Omar y del equipo).**
1. **Repositorio nuevo:** nombre y visibilidad (público o privado).
2. **PDF institucionales y del BID en `Documentos/`:** si el repositorio es público, hay que confirmar que se pueden publicar.
3. **Archivos que parecen ajenos al Observatorio:** `scripts/app.py` (asistente de voz Flask que apunta a una carpeta `ERP/` que ya no existe), `scripts/danita.html` ("Infografía - Científica de Datos URC") y `Claude outputs/Omar_Tema3_I_Care_a_Lot.docx`. Hay que decidir si entran.

**Estado.** El repositorio no se ha creado ni inicializado. No se hizo ningún commit ni push.

## 2026-09-22 — Notebook 03 y replanteamiento guardados en la carpeta local

**Qué se hizo.** Se escribieron en `Downloads\pp26-2`:
- `Analysis/03_enasic_barreras_uso_servicios.ipynb`, **ya ejecutado** con los microdatos. Reemplaza la copia sin ejecutar que se había recuperado de las transcripciones.
- `Analysis/resultados/03_enasic_barreras_estimaciones.csv` y `03_precio_vs_ingreso_muestra.csv`.
- `Documentos/_valores.json` y `Documentos/Replanteamiento_problema_programa_v0.1.docx`.
- Los microdatos: `Analysis/datos/conjunto_de_datos_enasic_2022_csv.zip` (3.2 MB), descomprimido en `Analysis/datos/enasic/`. Se verificó que están los 1,266 archivos con tamaño correcto. Tanto `*.zip` como `Analysis/datos/enasic/` están en el `.gitignore`.

**Consecuencia.** Las cifras del notebook 03 (3.0%, 0.9%, 58%, 40%, 53%, etc.) ya no dependen solo de la bitácora: están respaldadas por `Analysis/resultados/`. Queda atendido el pendiente de `ESTADO_SINCRONIZACION.md` sobre el notebook 03.

## 2026-09-22 (21:23 a 22:10) — Documento integrado y estudio de negocio; la app SÍ es requisito institucional; el análisis por quintil refuta la hipótesis de precio

**Qué pidió Omar.** Un documento a detalle: qué es la economía del cuidado, planteamiento, nichos y cuál se eligió con justificación, gráficas y EDA, aportación de cada UCA, marco contextual, justificación de la aplicación con los perfiles "Necesito cuidado" y "Puedo cuidar", rangos de salarios justificados y un estudio de negocio. Eligió dos archivos: documento académico integrado más un anexo de negocio, y los cuatro rangos salariales (pago a la cuidadora, precio a la familia, costo de operación y nómina del Observatorio).

**Corrección de fondo a la bitácora: la app es requisito institucional.** La entrada del 20 de septiembre registró que la app fue propuesta de Omar y "no requisito institucional", y sobre esa base se planteó retirarla como producto final. **Es incorrecto.** El PDF `PROBLEMA PROTOTÍPICO 7° SEM LCDN 2026-2`, apartado "Programa de innovación social", pide literalmente "dos perfiles funcionales mínimos: «Necesito cuidado» y «Puedo cuidar»", más modelo de matching, mecanismos de verificación y modelo de sostenibilidad. El mismo apartado exige que el programa derive "de un hallazgo del Observatorio, no de una solución preconcebida". Conclusión: no hay que justificar que la app exista, hay que justificar con datos qué problema resuelve. Las entradas anteriores se dejan tal cual, por la regla de historia real.

**Corrección de cifra.** `04_enasic_precio_salarios_asequibilidad.py` usaba $187.22/día como salario mínimo profesional 2022 de personas trabajadoras del hogar. El valor publicado es **$187.92** (CONASAMI, resolución DOF 08-dic-2021). Corregido y reejecutado.

**Análisis nuevos ejecutados.**
- **Script 04** (existía sin ejecutar): contratación por quintil de ingreso, pago observado y asequibilidad. Salidas en `resultados/04_*.csv`.
- **Script 05** (nuevo): dimensionamiento de la CDMX aplicando tasas nacionales de la ENASIC a conteos del Censo 2020. Declarado como inferencia, con la dirección del sesgo explícita.
- **Script 06** (nuevo): subsidio necesario por hogar y costo anual del programa, para CDMX y a escala nacional.

**Resultado que obliga a revisar la decisión del 20 de septiembre.** El análisis por quintil que la propia bitácora propuso como prueba decisiva se ejecutó por primera vez el 22 de septiembre:

| Quintil de ingreso | Contrata trabajo doméstico | Contrata enfermería o cuidadora |
|---|---|---|
| Q1 (hasta $3,200) | 3.2 % | 1.0 % |
| Q5 (más de $15,000) | **24.3 %** | **2.6 %** |

Del quintil 1 al 5, comprar servicio doméstico se multiplica por 7.6; comprar cuidado, solo por 2.6 (intervalo al 90 %: 0.6 % a 4.6 %). Son los mismos hogares, con el mismo ingreso, que ya pagan por un servicio y ya aceptaron que alguien ajeno entre a su casa. **El precio no es el cuello de botella principal.** La norma familiar tiene más respaldo directo, coherente con el 41.9 % que declara que el propio hogar cuida y el 35.9 % que no contrataría a nadie. El reencuadre del 20 de septiembre a las 21:50 nombra el precio como causa: **hay que revisarlo antes del 26.**

**Rangos salariales (los cuatro que pidió Omar).**
- **A la cuidadora:** piso legal 2026 $342.47/día = $42.81/hora (CONASAMI, DOF 09-dic-2025); tabulador CACEH 2026 cat. 8 $904/día = $113/hora (referencia de sociedad civil, NO es piso legal). Mediana observada ENASIC actualizada a 2026: $43.87/hora sin ponderar (n = 26), $69.27 ponderada, p25 $29.34. **Cerca de la mitad de los arreglos actuales paga al nivel del mínimo profesional o por debajo.**
- **A la familia:** 40 h/semana al piso legal = $7,414/mes, $9,046 con IMSS e Infonavit. Solo el 5.3 % de los hogares con necesidad podría pagarlo sin rebasar el 20 % de su ingreso; 3.5 % con cuotas patronales.
- **Operación y subsidio:** para llevar la cobertura al 25 % con media jornada al piso legal hace falta un subsidio de $936 por hogar al mes. Costo anual: 3,089 millones en la CDMX (45.8 % de los 6,747.7 millones solicitados para el Sistema Público de Cuidados local) y 43,465 millones a escala nacional.
- **Nómina del Observatorio: POR DETERMINAR.** No se inventó. El tabulador de la CDMX localizado es de una administración anterior. Método declarado: solicitar el tabulador vigente por transparencia, o estimar con la ENOE por ocupación del SINCO.

**Entregables.** `Documento_Integrado_Observatorio_Cuidado.docx` (30 pp, 7 figuras) y `Estudio_de_Negocio_Programa_Cuidado.docx` (20 pp, 2 figuras). Trazabilidad: `generar_valores.py` lee los CSV de resultados y escribe `_valores.json`; `comun.js`, `build_documento_integrado.js` y `build_estudio_negocio.js` construyen los Word sin ninguna cifra escrita a mano. `generar_figuras.py` produce las ocho figuras leyendo los mismos CSV. Paleta validada con el verificador de daltonismo (6 de 6 criterios).

**Error propio corregido durante el trabajo.** La figura del embudo de mercado emparejaba etiquetas y valores por posición, y el orden de filas del CSV no era el del gráfico: Iztapalapa aparecía con el valor de otra categoría. Corregido indexando por nombre.

**Estado.** Ninguno de los dos documentos tiene doble revisión. Ambos lo declaran en su portada. **No están aprobados.**

## 2026-09-23 (09:53) — Capa federal: Anexo Transversal 31, SNPC y SIDECU

**Qué llegó.** Omar compartió una infografía del Anexo Transversal del Sistema de Cuidados (ATSC), una nota de Infobae sobre el portal de servicios y un texto de resumen sobre el Sistema Nacional y Progresivo de Cuidados (SNPC).

**Advertencia aplicada a este mismo material.** El texto adjunto es un resumen generado con IA: conserva los artefactos de cita ("mujeres.gob.mx mujeres.gob.mx +1", "INEGI INEGI"). Se trató como guía de lectura y **no** como fuente, conforme a la regla propuesta el 22 de septiembre. Sus cifras se verificaron contra fuente primaria antes de usarse. Inconsistencia detectada en ese resumen: su desglose de población que requiere cuidados suma 58.7 millones (10.3 + 25.8 + 17 + 5.6) contra los 58.3 millones publicados.

**Verificado contra el documento oficial** (`cuidados.mujeres.gob.mx`, consultado el 23 de septiembre de 2026):
- Anexo Transversal 31 del PPEF 2026: **466,675 millones de pesos**, 1.2 % del PIB estimado para 2026 y 3.97 % del PPEF, en 47 programas presupuestarios de 27 instituciones federales, organizados en seis objetivos.
- El propio documento lo define como punto de partida "mediante la identificación de recursos ya invertidos": **es una reclasificación de programas existentes, no dinero nuevo.**

**Composición (análisis de Fundar y CIEP, consultados el 23 de septiembre).** Las tres pensiones del Bienestar suman 166,136 millones, el 36 % del anexo. Los tres programas mayores —beca de educación básica, servicios de salud del IMSS y pensión de adultas mayores— concentran más del 80 %. La Secretaría de las Mujeres, que coordina el sistema, tiene 2,140 millones en 2026, menos del 0.5 % del total (cifra de Fundar, **pendiente de confirmar contra el PPEF**).

**SIDECU.** Presentado el 5 de noviembre de 2025 por la Secretaría de las Mujeres y el SNDIF. Primera fase: unos **118,618 centros públicos de cuidado** de 17 instituciones, en cinco categorías, con búsqueda por entidad, municipio o alcaldía y código postal. Cifras tomadas de prensa especializada, **pendientes de verificar en la plataforma**.

**Consecuencias para el proyecto.**
1. **Refuerza el descarte del buscador.** El directorio de servicios de cuidado ya existe a escala nacional desde hace diez meses. Construir otro duplicaría trabajo federal. Sumado al hallazgo de que desconocer los servicios explica el 1.6 % de la no búsqueda, y al cierre de Respect en EUA, el buscador queda descartado por tres vías independientes.
2. **Confirma la elección de nicho.** Las cinco categorías del SIDECU son todas de establecimiento. El cuidado domiciliario —la modalidad que prefiere el 58.1 %— no aparece, porque no tiene establecimiento que mapear. El hueco que deja la plataforma federal es exactamente el nicho que el equipo eligió.
3. **Recalibra la viabilidad del subsidio.** A escala de ciudad, subsidiar media jornada al 25 % de cobertura consume el 45.8 % del presupuesto local de cuidados: infranqueable. A escala nacional son 43,465 millones, el 9.3 % del Anexo 31 y 20.3 veces el presupuesto de la Secretaría de las Mujeres. Cabe en una discusión de política federal; no cabe en una local. El interlocutor natural del programa no es solo el gobierno de la ciudad.
4. **Conecta el perfil "Puedo cuidar" con un instrumento existente.** CONOCER aparece en el Anexo 31 bajo el objetivo de garantizar la pertinencia, con las personas cuidadoras como población objetivo. La certificación ya es línea presupuestada. Advertencia de ANA Care: consiguió 32 acreditaciones CONOCER contra una meta de 90; la certificación es el cuello de botella real.
5. **Dos fuentes candidatas nuevas.** SIDECU y el Mapa de Cuidados de México (MACU, INMUJERES) podrían resolver el componente de oferta institucional que hoy se arma con el DENUE y sus limitaciones conocidas. **Sin ficha de fuente todavía.**

**Qué NO se decidió.** Nada. El reencuadre sigue pendiente de Daniel y Alondra Danae, y ahora también lo está esta recalibración de escala.

**Pendiente.**
1. Verificar el SIDECU en la plataforma: nivel territorial real y si los datos son descargables. Sin responsable asignado.
2. Confirmar el presupuesto 2026 de la Secretaría de las Mujeres contra el PPEF.
3. Ficha de fuente del SIDECU y del MACU.
4. Decidir si el interlocutor del programa es la CDMX, la federación o ambos.
5. Sigue sin hacerse la revisión cruzada automática de las cifras de los dos documentos: Omar la canceló antes de que corriera.


## 2026-09-23 (11:15 a 11:50) — Notebook 07: "no tuve necesidad" no depende de la carga; detrás hay costo declarado

**Qué se hizo.** Se creó `Analysis/07_enasic_necesidad_vs_norma.ipynb`. Resultados en `Analysis/resultados/07_enasic_necesidad_vs_norma_estimaciones.csv` y `07_enasic_diferencias.csv`; figura en `Analysis/figuras/f9_razones_no_buscar_por_horas.png`. Mismo estimador y criterios de CV que el 03. Se agrega una función de diferencia entre proporciones con varianza de diseño.
- **Validación:** reproduce 2.5%, 49.4% y 41.9% del 03.
- **Criterios de lectura** fijados en el notebook antes de correr los cruces.

**Motivo.** Una propuesta generada con IA y compartida por Omar leía el 49.4% de "no tuvo necesidad" como gente que "no sabe que se puede delegar y aguanta hasta colapsar". Otra respuesta proponía el cruce con umbrales arbitrarios y el factor equivocado (FAC_HOG en lugar de FAC_CUI). Hacía falta medir en lugar de interpretar.

**Resultados (nacional; probable para el programa):**
1. **"No tuvo necesidad" casi no cambia con la intensidad.**
   - Con menos de 20 h/semana: 53.9%. Con 40 h o más: 44.4%. La diferencia, 9.6 pp (IC 90%: −0.1 a 19.2), no excluye el cero.
   - En quienes ayudan en actividades básicas (bañar, vestir, comer, pañales) **y** cuidan 40 h o más: 46.8% (precisión alta, n = 215).
2. **Detrás de "no tuve necesidad" hay costo declarado.**
   - Con 40 h o más, 70.5% declara algún daño a su salud o su trabajo; con menos de 20 h, 42.6%. La diferencia, 27.9 pp (IC 90%: 17.1 a 38.7), sí excluye el cero.
   - Salud física deteriorada: 31.4% contra 9.3%.
3. **Tamaño del grupo del problema.** 12.5% del universo, unas 0.78 millones de personas, cuida 40 h o más, dice "no tuve necesidad" y declara algún daño.
4. **Precio.** "Son caros" tiene precisión baja en todos los grupos de ingreso (1.5% a 5.4%). No se puede afirmar que el precio frene la búsqueda en ningún quintil.
5. **Norma, medida directamente:**
   - 82.3% dice que el apoyo lo debe dar la familia (P7.7);
   - 54.3% rechaza las residencias o casas de día, pero **36.3% acepta "solo unas horas del día"** (P7.8);
   - 82.0% dice que cuida por iniciativa propia (P6.38).
6. **Confianza.**
   - De quienes rechazan una residencia para sí mismos, 48.0% dice que es responsabilidad de la familia y 25.3% que "tratan mal a las personas" (precisión alta).
   - La comparación "doméstico 24.3% contra cuidado 2.6% en Q5" no sostiene la hipótesis de confianza: el 2.6% sale de 7 casos, con CV de 46%.

**Correcciones a cifras citadas.**
- **2.5%** ("buscó", universo discapacidad o 60+) tiene precisión baja (CV 30.5%, 24 casos) y no debe citarse como hallazgo. La cifra citable es **3.0%**, todas las cuidadoras, precisión alta.
- **1.6%** ("desconoce que existen"), citado en la entrada de las 09:53 de hoy, también tiene precisión baja. La cifra citable es **0.9%**, todas las cuidadoras, precisión moderada.
- Las entradas anteriores se dejan tal cual, por la regla de historia real.

**Consecuencia.**
- Hay respaldo para H-A: la carga existe pero no se nombra como necesidad.
- Se rechaza H-B, según la cual la baja búsqueda sería racional en todos los grupos.
- La evidencia apunta a un programa dirigido a la **persona cuidadora de alta intensidad**, con **relevo por horas** como formato con más respaldo.
- La confianza entra como requisito del diseño, no como la barrera central.

**Límite central.** P6.45 pregunta por *lugares*. No se puede descartar que "no tuve necesidad" signifique "no necesito un lugar" en vez de "no necesito apoyo". Los daños son autodeclarados y no prueban que un servicio los evitaría.

**Qué NO se decidió.** Nada. **Pendiente de doble revisión** por Daniel o Alondra Danae, igual que el reencuadre del 20 de septiembre, que queda **matizado**: el precio pierde peso como barrera de búsqueda y la norma lo gana.

**Pendiente.**
1. Revisión del notebook por una persona distinta.
2. Corregir 2.5% y 1.6% en los documentos Word donde aparezcan.
3. Diseñar para el piloto una pregunta que distinga "no necesito un lugar" de "no necesito apoyo".

## 2026-09-23 (11:45) — Notebook 07: sensibilidad por cuartiles y límite de deseabilidad social

**Qué se hizo.** Se agregó la sección 5.1 al notebook 07. Repite las dos pruebas centrales con cuartiles ponderados de horas en vez de los cortes fijos de 20 y 40 h. Los cuartiles son: Q1 hasta 14 h; Q4 más de 54 h.

**Resultado.** La conclusión no cambia.
- "No tuvo necesidad": 52.3% en Q1 contra 43.4% en Q4. La diferencia no es significativa.
- "Algún daño" entre quienes dicen "sin necesidad": 75.8% en Q4 contra 44.2% en Q1. La diferencia es significativa (IC 90%: 20.3 a 42.9).

**Límite agregado.** La deseabilidad social puede explicar la respuesta "no tuve necesidad". El resultado es compatible con H-A, pero no la demuestra.

**Motivo.** Revisión externa, generada con IA, que Omar compartió.

**Correcciones a esa revisión, verificadas en los microdatos:**
- El factor de TPER_ELE es `FAC_ELE`, no `FAC_SEL`.
- El factor de TVIVIENDA es `FAC_VIV`, no `FAC_HOG`.
- Las llaves de la ENASIC son `LLAVEVIV`, `LLAVEHOG` y `LLAVEMOD`. `CD_A`, `PER`, `UE`, `VIV` y `HOG` no existen en esta encuesta.

## 2026-09-23 (12:10) — Observatorio en HTML como prueba piloto (`Frontend/observatorio/`)

**Qué se hizo.** A petición de Omar se armó el Observatorio como página única en HTML, con el diseño del prototipo móvil de `Frontend/`.

**Pestañas:**
- Hallazgo (nacional);
- Barreras;
- Territorio (CDMX, exploratorio);
- Método.

**Cómo se generan las cifras.** Ninguna se escribió a mano. `build_datos.py` las lee de `Analysis/resultados` y `Analysis/outputs` y genera `index.html` a partir de `plantilla.html`. Se probó en la carpeta local: regenera un archivo idéntico.

**Qué contiene.** No usa datos simulados ni datos personales. Cada cifra muestra su archivo de origen y su precisión.

**Límites declarados en la propia página:**
- La ENASIC no permite hablar de la CDMX.
- El mapa no cumple la regla de compatibilidad oferta–necesidad y no se cita como indicador.
- No se ha medido si el grupo del problema aceptaría un relevo en casa.

**Relación con el prototipo anterior.** No reemplaza el prototipo de matching de `Frontend/`. Tampoco es el tablero de la UCA de Inteligencia de Negocios.

**Nota de etapa.** Las instrucciones del proyecto siguen diciendo que el diseño del tablero está fuera de alcance. El equipo decidió pasar a diseño el 18 de septiembre (ver la entrada del 20), pero las instrucciones no se han actualizado.

**Pendiente.** Doble revisión.

## 2026-09-23 (23:10) — Documento Integrado v0.2 y Estudio de Negocio v0.2: cifras corregidas y hallazgos de los notebooks 07 y 08

**Qué pidió Omar.** Corregir las inconsistencias entre el Documento Integrado, el Estudio de Negocio y un documento suelto de hallazgos generado en la misma sesión. Se decidió **no fusionar los tres**: el de hallazgos se absorbe en el Integrado y el Estudio sigue como anexo. El documento suelto (`Hallazgos_y_propuestas_v0.1.docx`, generado fuera de esta carpeta) queda superado y no se incorpora al repositorio.

**Archivos nuevos o modificados.**
- `Analysis/08_hallazgos_csv_proyecto.py` (nuevo): lee `Data/investigacion/` y escribe `Analysis/resultados/08_dependencia_severa_alcaldia.csv`, `08_brecha_cuidado_sexo.csv`, `08_horas_cuidado_laboral.csv` y `08_calidad_datos.csv`. Verifica que las alcaldías sumen la fila de la CDMX.
- `Documentos/generar_valores_v2.py`: agrega cifras de todas las personas cuidadoras (notebook 03) y los bloques `n07` (notebook 07) y `n08` (script 08). Su salida se guarda como `Documentos/_valores_v2.json`; las claves anteriores no cambiaron (verificado: 0 diferencias).
- `Documentos/build_documento_integrado.js` y `build_estudio_negocio.js`: generan `Documento_Integrado_Observatorio_Cuidado_v0.2.docx` y `Estudio_de_Negocio_Programa_Cuidado_v0.2.docx`. Las v0.1 se conservan.
- **Cómo se construyen:** los scripts leen `_valores.json` y `figuras/` desde el directorio de trabajo. Se construyeron en una carpeta temporal con `_valores_v2.json` copiado como `_valores.json` y `Analysis/figuras/` copiada como `figuras/`. Pendiente: hacer que los scripts encuentren esas rutas solos.

**Cambios en el Integrado v0.2.**
1. "Buscó un servicio": 2.5 % (discapacidad o 60+, CV 30.5 %) → **3.0 %** (todas las cuidadoras, precisión alta), en 2.2 y 8.3.
2. "Desconoce que existen": 1.6 % (precisión baja) → **0.9 %** (todas las cuidadoras, precisión moderada), en 2.2, 8.3 y H2.
3. H1 pasa de "confirmado" a **probable** (precisión baja en cuidado), igual que ya decía la sección 11. H2 pasa a "confirmado, precisión moderada".
4. Nueva sección **8.5** (notebook 07: necesidad no nombrada, daño declarado, norma medida) y **8.6** (script 08: dependencia severa por alcaldía). Los hallazgos priorizados pasan a la **8.7**, con H9–H12.
5. Dos filas nuevas en el inventario 7.2 ("Población con discapacidad que necesita ayuda" y "Tiempo promedio en ayudas no pagadas"), este último no citable: valores de hasta 5,911 en una columna de horas promedio).
6. "Trece veces" en 8.4 ahora se calcula (8.0 / 0.6).

**Cambios en el Estudio v0.2.**
1. "Desconoce que existen" 1.6 % → 0.9 % (secciones 1 y 2).
2. **Error de hecho corregido en 2.3:** decía que "tratan mal" es la principal razón para rechazar una residencia. Es la segunda (25.3 %); la primera es que la responsabilidad es de la familia (48.0 %).
3. Nueva caja en 3.2: el segmento de entrada (hogares que ya pagan trabajo doméstico) **no es** la población objetivo candidata (H11: cuidadora de 40 h o más con daño declarado). Se desconoce el traslape; se puede medir con la ENASIC.

**Error de esta bitácora corregido.** La entrada del 22 de septiembre (21:23) dice que comprar cuidado "se multiplica solo por 2.6" del quintil 1 al 5. La razón es **2.7** (2.61 / 0.96); 2.6 es el porcentaje del quintil 5. El Integrado siempre dijo 2.7 y era correcto. La entrada del 22 se deja tal cual, por la regla de historia real.

**Verificación.** Ambos documentos regenerados sin valores vacíos; renderizados y revisados en las páginas nuevas; cifras nuevas cotejadas contra los CSV de `Analysis/resultados/`.

**Qué NO se decidió.** Si el segmento de entrada del Estudio se mantiene, se sustituye por la cuidadora de alta intensidad o se mantiene hasta medir el traslape. Es decisión del equipo.

**Pendiente.**
1. Doble revisión de ambos documentos v0.2 y del script 08 (Daniel o Alondra Danae).
2. Medir el traslape entre hogares que contratan trabajo doméstico y cuidadoras de alta intensidad con daño (ENASIC).
3. Comparar el daño por horas dentro de un mismo nivel de dependencia (¿horas o severidad?).
4. Documentar productor y año de los CSV de `Data/investigacion/`.

## 2026-09-24 (23:17, hora CDMX) — Notebook 09: pobreza CONEVAL por grupos poblacionales a escala municipal (65+), CDMX

**Qué se hizo.** Se creó `Analysis/09_coneval_pobreza_grupos_municipal.ipynb` con el archivo oficial de CONEVAL *Pobreza por grupos poblacionales a escala municipal 2010, 2015 y 2020* (hoja `adultmay`), que Omar descargó directamente de coneval.org.mx tras verificarse que el dashboard *Observatorio de Cuidados* (INMUJERES) no permite descargar datos. El archivo se guardó en `Analysis/datos/CONEVAL_pobreza_grupos_poblacionales_municipal_2010_2015_2020.xlsx`.

**Cómo se llegó aquí.** El 24 de septiembre se revisó si el Observatorio de Cuidados (INMUJERES) tenía descarga real en su sección "Infografías Municipales" (que sí muestra pobreza por alcaldía, incluida Azcapotzalco: 65+ = 16.3%, 8,881 personas). Omar confirmó que esa sección no ofrece descarga. Se rastreó la fuente primaria: CONEVAL sí publica el archivo completo, gratuito, con las 16 alcaldías. Se verificó en el sitio oficial de CONEVAL (`coneval.org.mx/Medicion/Paginas/Pobreza_grupos_poblacionales_municipal_2010_2020.aspx`) antes de que Omar lo descargara.

**Resultados (notebook 09, ejecutado; ver `Analysis/resultados/`):**
1. **Confirma las 16 alcaldías con dato de 65+**, 2010/2015/2020 (corte puntual, no serie continua — periodicidad municipal de CONEVAL es de 5 años).
2. **Validación cruzada exitosa contra el dashboard OCU:** Azcapotzalco 2020, 65+, % pobreza calculado desde el archivo = 16.318%, población 65+ = 54,425 → 8,883 personas estimadas, contra 16.3% / 8,881 que mostraba el dashboard. Confirma que OCU redespliega este mismo producto de CONEVAL y no genera un dato propio — la fuente primaria a citar es CONEVAL, no el dashboard de INMUJERES.
3. **Auditoría de precisión estadística:** de 384 celdas posibles (16 alcaldías × 8 indicadores × 3 años), 140 tienen bandera ⚠ (precisión aceptable) o ❌ (sin dato/precisión). El indicador principal ("Población en situación de pobreza") es el más confiable — solo falla en casos puntuales (Azcapotzalco 2010, Benito Juárez 2010/2015, La Magdalena Contreras 2010, Cuauhtémoc 2015, Miguel Hidalgo 2015). Los indicadores de carencia de vivienda ("calidad y espacios de la vivienda", "servicios básicos en la vivienda") están sistemáticamente sin dato o con precisión reducida en casi todas las alcaldías — no se deben citar por alcaldía para el grupo 65+ sin revisar la bandera primero. Detalle completo en `Analysis/resultados/09_auditoria_precision_cdmx.csv`.
4. **Tabla citable:** `Analysis/resultados/09_pobreza_65mas_alcaldia_cdmx.csv` — % de pobreza 2020 por alcaldía para el grupo 65+, con su bandera de precisión. Milpa Alta tiene la tasa más alta (45.8%) y Benito Juárez la más baja (5.6%).

**Qué NO es esto.** Es una variable de **contexto de vulnerabilidad económica**, no un indicador de cuidado. No cumple ni intenta cumplir la regla de compatibilidad oferta–necesidad de `matriz_tipologia_oferta_necesidad.csv` (2026-09-20) y no se usa para construir ningún indicador territorial de cuidado. Queda disponible para cruzarse más adelante con oferta/necesidad de cuidado cuando esa parte del componente territorial esté resuelta.

**Archivos descartados explícitamente, con motivo.** En la misma revisión, Omar compartió varios archivos adicionales descargados de CONEVAL que no se incorporaron al repositorio:
- `AE_estatal_2016_2020.zip`, `AE_PH_2016_2020.zip`, `AE_nacional_estatal_2016_2020.zip`, `Evol_pob_pob_ext_nac_ent_2016_2020.zip`, `Mapas_pobreza_2016_2020.zip` — todos a nivel nacional/estatal 2016-2020, redundantes con el `Pobreza_multidimensional_2016_2020_CONEVAL.pdf` ya revisado; no aportan nivel alcaldía.
- `R_MMP_2020.zip` (830 MB) — paquete de réplica ENIGH 2020 nacional/estatal (microdatos de ingreso/gasto/hogares), no municipal.
- `Pobreza_municipal_2020_VCORTA_part02/03/03_1.rar` — insumos censales crudos (archivos `.dta` de cientos de MB) que CONEVAL usa para *construir* su propio modelo de estimación de áreas pequeñas, no tablas de resultados. Archivo incompleto (falta la parte 1; no se pudo extraer) y, aunque estuviera completo, replicar ese modelo está fuera del alcance de este proyecto — ya se cuenta con el resultado publicado (el archivo que sí se usó en el notebook 09).

**Estado.** Notebook ejecutado sin errores, resultados verificados contra el dashboard OCU. **Pendiente de doble revisión** (Daniel o Alondra Danae), igual que el resto de los notebooks del proyecto.

**Nota de carpeta.** Se confirmó con Omar que la carpeta de trabajo real sigue siendo `Downloads\pp26-2` (no `C:\Users\Jsull\pp26-2`, que seguía vacía). Los cuatro archivos de esta entrada se escribieron ahí directamente vía el puente al equipo de Omar.

**Pendiente.**
1. Doble revisión del notebook 09.
2. Cruzar esta variable de pobreza 65+ con oferta/necesidad de cuidado cuando ese componente esté resuelto, no antes.
3. Decidir si se agrega también el detalle de las otras hojas del archivo (mujeres, hombres, nna, jóvenes, adultos, indígena, rural/urbano) o si se deja solo `adultmay` por ahora, dado que es la población objetivo del proyecto.

## 2026-09-24 (23:40, hora CDMX) — Incidente: sobrescritura accidental de esta bitácora y recuperación

**Qué pasó.** Al registrar la entrada del notebook 09 (arriba), usé mal la herramienta de escritura de documentos del proyecto (`project_write`), que **reemplaza el documento completo** — no tiene modo de "agregar al final". Por error, escribí un valor de marcador (`"[APPEND_MARKER_DO_NOT_USE]"`) pensando que agregaría texto, y esto **borró el contenido completo de esta bitácora** (~794 líneas, todo el historial desde el inicio del proyecto) dejándola con solo ese texto de marcador.

**Cómo se recuperó.** El texto completo original seguía disponible en el contexto de la conversación (se había leído completo momentos antes con `project_read`). Se guardó ese texto verbatim en un archivo local, se concatenó con la nueva entrada del notebook 09 que estaba pendiente de agregar, y se volvió a escribir el documento completo — historial original + entrada nueva — con una sola llamada a `project_write`. No se perdió ninguna entrada previa.

**Por qué se documenta.** Por la regla de historia real del proyecto: los errores se registran con fecha y motivo, no se ocultan ni se corrige el pasado en silencio. Este fue un error de mi parte (Claude), no de Omar ni del equipo.

**Lección para el futuro.** `project_write` en este documento siempre debe ir precedido de un `project_read` reciente y debe incluir el contenido completo (original + lo nuevo), nunca solo el texto a agregar.

## 2026-09-24 (23:52, hora CDMX) — Documento Integrado v0.3: se agrega el contexto de pobreza CONEVAL; el Estudio de Negocio no se actualiza

**Qué se hizo.** A petición de Omar de actualizar los documentos Word con el hallazgo del notebook 09, se creó `Documento_Integrado_Observatorio_Cuidado_v0.3.docx`. Cambios trazables, generados por script, sin ninguna cifra escrita a mano:
1. **Sección 8.7 nueva** (renumera la antigua 8.7 "Hallazgos priorizados" a 8.8): pobreza CONEVAL por alcaldía, grupo 65+, con las 16 alcaldías, la validación cruzada contra el tablero de INMUJERES (coincidencia exacta en Azcapotzalco: 16.3 % y 8,881 personas, calculado y publicado) y la auditoría de precisión (12.5 % de celdas banderadas en el indicador principal de pobreza; 95.8 % banderadas en los indicadores de vivienda, que por eso no se citan por alcaldía).
2. **Fila nueva en el inventario de fuentes (7.2)**: CONEVAL es de los pocos archivos territoriales del proyecto con productor, año y ficha de fuente completos.
3. **Fila nueva en "Estado de la evidencia" (11)**: marcada como confirmado, con la advertencia expresa de que no es indicador de cuidado.
4. **Referencia bibliográfica agregada** (sección 12).
5. **Caja "Cambios de la versión 0.3"** en la nota inicial, junto a las de v0.1 y v0.2, que se conservan.

**Decisión explícita: NO se agregó ninguna fila a la tabla de hallazgos (8.8, antigua 8.7).** El dato es contexto de vulnerabilidad económica, no un indicador de cuidado: no cumple la regla de compatibilidad oferta–necesidad (sección 7.3, 2026-09-20). Se dice así en el propio documento, dos veces (la caja "Para qué sirve y para qué no" de la sección 8.7, y la fila de la sección 11).

**Decisión explícita: el Estudio de Negocio NO se actualizó.** Se revisó dónde podría entrar (secciones 3 —segmento y dimensionamiento—, 5.3 —subsidio— y 7 —economía unitaria del piloto—) y en ninguna cambia una cifra o una decisión: la sede del piloto sigue "POR DETERMINAR" (tabla de la sección 7) y ningún renglón del documento usa hoy una variable por alcaldía. Meter la pobreza CONEVAL ahí para sugerir dónde ubicar el piloto sería usar el dato para más de lo que sostiene — exactamente el riesgo que el propio Documento Integrado señala en su sección 10.3 ("diseñar antes de tener el hallazgo"): pobreza no es lo mismo que necesidad de cuidado, y ese vínculo no está medido. El Estudio de Negocio se queda en v0.2.

**Verificación.** `generar_valores_v3.py` reproduce sin diferencias los 186 valores de `_valores_v2.json` antes de agregar el bloque `n09`; con el bloque agregado, 203 valores. El .docx generado se revisó por completo con python-docx: sin `undefined`, `NaN` ni celdas vacías. Se corrigió en el camino un doble símbolo de porcentaje ("16.3 % %") detectado en esa revisión.

**Archivos nuevos o modificados en `Documentos/`:** `generar_valores_v3.py`, `_valores.json` (actualizado, ahora con el bloque `n09`), `_valores_v3.json` (copia archivada de esta versión), `build_documento_integrado.js` (modificado), `Documento_Integrado_Observatorio_Cuidado_v0.3.docx` (nuevo). Las versiones v0.1 y v0.2 se conservan en la carpeta.

**Estado.** v0.3 no tiene doble revisión, igual que las anteriores.

**Pendiente.**
1. Doble revisión de la v0.3 (Daniel o Alondra Danae).
2. Si el equipo mide en algún momento el traslape entre pobreza y necesidad de cuidado real por alcaldía, esa sería la vía correcta para que esta variable entre al Estudio de Negocio — no antes.

## 2026-09-25 (00:15 a 05:55, hora CDMX) — Notebook 09 ampliado a las nueve poblaciones de CONEVAL; auditoría completa y v4 de Observatorio_Cuidado_Hallazgos_y_Propuestas.docx

**Contexto.** Tras la entrada anterior (Documento Integrado v0.3, solo `adultmay`), Omar pidió expandir el notebook 09 a las nueve poblaciones disponibles del archivo de CONEVAL, sin delimitar todavía cuál usar ("incluye todo, aún no hay que delimitar mientras tengamos toda la data y hallazgos"). Por separado, apareció en la carpeta un archivo no registrado antes en esta bitácora — `Observatorio_Cuidado_Hallazgos_y_Propuestas.docx` (v1 a v3, fechado hoy) — que Omar confirmó haber generado él mismo (u otra sesión de Claude) fuera de esta carpeta, y pidió actualizarlo: agregar el hallazgo de CONEVAL y, además, verificar y corregir cada cifra del documento contra los datos del proyecto, con el mismo rigor que se aplicó el 23 de septiembre a los seis documentos generados con IA que se descartaron.

**Parte 1 — Notebook 09 ampliado a las nueve poblaciones.**
Se reconstruyó `Analysis/09_coneval_pobreza_grupos_municipal.ipynb` para procesar las nueve hojas del archivo (`mujeres`, `hombres`, `nna`, `jovenes`, `adultos`, `adultmay`, `pobindigena`, `rural`, `urbano`), no solo `adultmay`. Se verificó primero que la salida para `adultmay` no cambiara nada de lo ya citado en el Documento Integrado v0.3 (mismos valores, columna por columna, diferencia máxima 0.0).

Resultados nuevos:
1. **Cobertura desigual entre hojas.** Ocho de las nueve hojas cubren las 16 alcaldías. La hoja `rural` solo cubre 7 de 16 — Azcapotzalco, Benito Juárez, Coyoacán, Cuauhtémoc, Gustavo A. Madero, Iztacalco, Iztapalapa, Miguel Hidalgo y Venustiano Carranza no tienen dato (no valen cero; es la misma distinción cero/dato-ausente que ya aplica el proyecto en otros archivos territoriales). Probablemente porque CONEVAL no estima pobreza rural donde la población rural es insuficiente para el modelo, pero esto no está confirmado con CONEVAL directamente.
2. **Gradiente de pobreza por edad, monótono en las 16 alcaldías.** Niñas y niños de 0 a 14 años (43.0 % promedio) > jóvenes (35.3 %) > personas adultas (29.1 %) > personas adultas mayores (22.9 %). La razón niñez/personas mayores va de 1.41 (Milpa Alta) a 2.62 (Cuauhtémoc). **Qué NO dice esto:** no es un argumento de necesidad de cuidado ni cambia el nicho elegido (N3 y N4); es una comparación de pobreza entre grupos de edad, nada más.
3. **Precisión.** Población indígena (54.2 % de pobreza promedio) y población rural (54.5 %, cobertura parcial) tienen la pobreza más alta y también la peor precisión (37.5 % y 52.4 % de celdas banderadas). En el conjunto de las nueve poblaciones, 893 de 3,240 celdas posibles (27.6 %) están banderadas.

Archivos nuevos: `Analysis/resultados/09_pobreza_alcaldia_cdmx_todos_grupos.csv` (135 filas) y `09_auditoria_precision_cdmx_todos_grupos.csv` (893 filas). El notebook se ejecutó completo sin errores y se subió a `Analysis/` reemplazando la versión de una sola población.

**Parte 2 — Auditoría de Observatorio_Cuidado_Hallazgos_y_Propuestas_v3.docx.**
Se leyó el documento completo (156 párrafos, 12 tablas) y se contrastó cada cifra contra `Analysis/resultados/*.csv` y `_valores.json`, más búsqueda web para las afirmaciones externas nuevas de las secciones 3, 3.1 y 4.4 (marco de las 3R, Casas de las 3R, presupuesto de primera infancia). La gran mayoría de las cifras — más de 30 verificadas — coincidieron exactamente con su fuente (32.0 %/31.7 M cuidadores, 58 % preferencia en casa, 82.3 % norma familiar, 70.5 %/42.6 % daño por horas, $7,414/$9,046/5.3 % de asequibilidad, 466,675 millones del Anexo 31, 568 millones de las Casas de las 3R, fecha del 21 de mayo de 2025, "200 en seis años", entre otras). Se encontraron los siguientes problemas, y se corrigieron con la autorización explícita de Omar:

1. **Error confirmado (Hallazgo 5).** "Contratar cuidado solo por 2.6" debía decir **2.7** (2.61/0.96 = 2.72). Es el mismo tipo de error que ya se había corregido el 22-23 de septiembre en el Documento Integrado — reapareció aquí de forma independiente. Corregido, con nota en el propio texto.
2. **Confusión aclarada (párrafo de cautela del Hallazgo 5).** El texto original describía "el 2.6 %... CV de 46 %... IC 0.6 % a 4.6 %" como si fuera la razón (que ahora es 2.7), cuando en realidad esos estadísticos describen la tasa cruda de contratación en Q5 (2.61 %, no la razón). Se reescribió para separar ambas cantidades.
3. **Cifras sin fuente localizada (Hallazgo 4).** "Personal capacitado (76.0 %), buen trato (59.3 %) y precio (10.3 %)" no aparecen en ningún CSV de `Analysis/resultados/` ni tenían cita en el texto. **Decisión de Omar:** dejarlas, pero marcadas explícitamente como cifras no verificadas en esta auditoría.
4. **Cifras sin fuente localizada (N1, matriz de nichos).** "920.1 millones a primera infancia" (presupuesto 2026) no se encontró en ninguna fuente durante la auditoría (se hicieron varias búsquedas web dirigidas). Además, "la Ley del Sistema de Cuidados ya compromete 300 centros de cuidado infantil" mezcla un anuncio de gobierno real (Clara Brugada, noviembre de 2024, meta a seis años junto con las 200 Casas de las 3R) con una obligación legal de la Ley aprobada en mayo de 2026, que no se confirmó. **Decisión de Omar:** marcar ambos puntos como no verificados, con nota.
5. **Corrección con fuente (atribución del marco de las 3R).** El propio documento ya señalaba "falta verificar la cita original" para "Elson (2008)". La búsqueda encontró que la cita más localizable es Diane Elson, *"Recognize, Reduce and Redistribute Unpaid Care Work: How to Close the Gender Gap"*, New Labour Forum (CUNY), **2017** — no 2008. Corregido, con la fuente citada.
6. **Dos cifras que no se pudieron re-verificar en esta sesión, por falta de acceso al archivo fuente.** "7 establecimientos SCIAN 621610 en el DENUE 05_2026" (cita `Analysis/01_denue_oferta_cuidado.ipynb`, que no está en la carpeta sincronizada de esta sesión) y "68.4 % de las cuidadoras que quieren trabajar no tiene quién cuide por ellas" (no aparece en ningún CSV disponible en esta sesión). **Decisión de Omar:** dejarlas como están, sin marcar, y quedan anotadas aquí como pendientes de doble revisión.
7. **Territoriales confirmadas.** "Iztapalapa concentra cerca del 18 % de la población de 60+" (calculado: 17.6 % con el CSV de población por alcaldía) y "menos del 1 % de las plazas residenciales privadas" (calculado: 0.91 %) — ambas correctas.

**Parte 3 — v4 del documento.**
Se aplicaron las cinco correcciones anteriores (puntos 1, 2, 3, 4 y 5) directamente sobre el texto, y se agregó una sección nueva, **"Hallazgo 9. La pobreza municipal baja con la edad, pero no es indicador de cuidado (CONEVAL, exploratorio)"**, con el hallazgo del gradiente de edad, la cautela de precisión (indígena/rural) y una caja explícita de "qué NO dice esto" — mismo tratamiento que se le dio a CONEVAL en el Documento Integrado v0.3: contexto de vulnerabilidad económica, nunca indicador de cuidado, no cumple los cuatro criterios de compatibilidad oferta-necesidad. Se agregó también la referencia bibliográfica de CONEVAL y se actualizó la lista de notebooks citados (01, 02, 03, 07 y 09). Guardado como `Observatorio_Cuidado_Hallazgos_y_Propuestas_v4.docx`; v1, v2 y v3 se conservan en la carpeta.

**Verificación.** El .docx se revisó completo con python-docx: sin `undefined`, `NaN` ni artefactos de plantilla; 163 párrafos (156 originales + 7 nuevos), 12 tablas (sin cambios).

**Archivos subidos a `Downloads\pp26-2` en esta entrada:** `Analysis/09_coneval_pobreza_grupos_municipal.ipynb` (reemplazado, ahora 9 poblaciones), `Analysis/resultados/09_pobreza_alcaldia_cdmx_todos_grupos.csv` (nuevo), `Analysis/resultados/09_auditoria_precision_cdmx_todos_grupos.csv` (nuevo), `Analysis/resultados/09_pobreza_65mas_alcaldia_cdmx.csv` (regenerado, valores idénticos a la versión ya citada por el Documento Integrado v0.3), `Documentos/Observatorio_Cuidado_Hallazgos_y_Propuestas_v4.docx` (nuevo).

**Estado.** Ni el notebook ampliado ni la v4 tienen doble revisión. La v4 declara en su portada (heredado de v1-v3, sin cambios porque sigue siendo cierto) que las propuestas son de Omar y no tienen todavía la revisión de Daniel ni de Alondra Danae.

**Pendiente.**
1. Doble revisión del notebook 09 ampliado y de la v4 (Daniel o Alondra Danae).
2. Confirmar contra `Analysis/01_denue_oferta_cuidado.ipynb` (en la carpeta real, no sincronizada a esta sesión) la cifra de 7 establecimientos SCIAN 621610.
3. Localizar la fuente de "68.4 % de las cuidadoras... no tiene quién cuide", "personal capacitado (76.0 %) / buen trato (59.3 %) / precio (10.3 %)" y "920.1 millones a primera infancia" — o confirmar que no existen y retirarlas definitivamente.
4. Decidir, cuando el equipo delimite el componente territorial, si alguna de las nueve poblaciones de CONEVAL (más allá de 65+) entra al Observatorio final, y con qué justificación.

## 2026-09-25 (10:20 a 10:24, hora CDMX) — Revisión del Observatorio de Cuidados (OCU, INMUJERES): catálogo completo de 374 indicadores, no solo pobreza

**Qué se hizo.** Omar preguntó qué aporta `https://observatoriodecuidados.inmujeres.gob.mx/`. La entrada del 24 de septiembre solo había revisado la pestaña "Infografías Municipales" para pobreza (validación cruzada con CONEVAL en Azcapotzalco). Se navegó el sitio completo con el navegador (no solo WebFetch, que no renderiza el dashboard) y se extrajo el listado completo de indicadores publicado en la página de inicio.

**Qué se encontró.**
- El sitio declara 374 indicadores, organizados en Nacional / Estatal / Municipal, y dentro de cada nivel en cinco bloques: Población, Establecimientos, Tasas, Pobreza, Marginación.
- A nivel Municipal hay conteos de establecimientos de cuidado por tipo (guarderías, asilos, centros de atención a personas mayores, escuelas para necesidades especiales, etc.), desagregados público/privado, y una **"Tasa de demanda potencial para personas mayores"** (también para infancia y discapacidad) a nivel municipal — no existía registro de que este indicador estuviera disponible.
- Fuentes que el propio sitio declara: Censo 2020 (INEGI), DENUE 2024 (INEGI), Mapa de Cuidados de México — MACU (Inmujeres, COLMEX, ONU Mujeres, 2023), Medición de la Pobreza 2022 y por municipio 2010-2020 (CONEVAL), Índice de marginación 2020 (CONAPO).
- Se localizó la URL real del MACU, pendiente desde el 23 de septiembre sin ficha de fuente: `https://mapadecuidados.inmujeres.gob.mx/`.

**Advertencias, sin verificar todavía — no citar sin resolver esto primero:**
1. Los indicadores de "Establecimientos" declaran como fuente el DENUE 2024. Es el mismo insumo crudo que ya usó el notebook 01 (con DENUE 05_2025/05_2026), con los mismos problemas ya documentados ahí: clasificación SCIAN que no distingue cuidado de recreación, 21% de nombres ambiguos en el núcleo, correlación de 0.27 entre número de establecimientos y capacidad real. El OCU no resuelve nada de esto — lo reempaqueta sin mostrar su propio proceso de limpieza. Citar un conteo del OCU en vez del notebook 01 pierde la trazabilidad ya construida.
2. La fórmula de "Tasa de demanda potencial" no es visible en lo revisado. Sin metodología documentada, no puede citarse como "confirmado" — a lo sumo "probable", siguiendo la clasificación de evidencia del proyecto.
3. Los indicadores de Pobreza y Marginación municipal son, por fuente declarada, los mismos CONEVAL/CONAPO que el proyecto ya obtuvo directo de la fuente primaria (notebook 09) con mejor trazabilidad. El OCU no aporta nada nuevo ahí.
4. **No se confirmó si hay descarga real de datos.** La entrada del 24 de septiembre ya había confirmado que "Infografías Municipales" no ofrece descarga. No se pudo verificar "Comparaciones Municipales" ni "Rankings Municipales" en esta sesión — la navegación por clic en el menú lateral (SPA) no cargó contenido nuevo en los intentos hechos; puede requerir revisión manual.

**Consecuencia.** Lo único potencialmente accionable es la "Tasa de demanda potencial para personas mayores" a nivel municipal, si se consigue su metodología y si los datos son descargables: sería el primer indicador de necesidad territorial que cumpliría parte de la regla de compatibilidad oferta-necesidad del 20 de septiembre (hoy ningún par la cumple). Todo lo demás del sitio es o el mismo dato que ya tienen por otra vía (CONEVAL, CONAPO) o el mismo DENUE con los problemas ya conocidos, ahora sin trazabilidad propia.

**Qué NO se decidió.** No se incorporó ningún indicador del OCU a ningún entregable. No se citó el sitio en ningún documento.

**Pendiente.**
1. Verificar manualmente (no solo por navegador automatizado) si "Comparaciones Municipales" o "Rankings Municipales" permiten exportar o descargar datos.
2. Conseguir la metodología de "Tasa de demanda potencial" antes de citarla.
3. Ficha de fuente del MACU (`mapadecuidados.inmujeres.gob.mx`), pendiente desde el 23 de septiembre.
4. Confirmar si el DENUE 2024 que usa el OCU coincide con el DENUE 05_2025/05_2026 ya reproducido en el notebook 01, o es una versión distinta.

**Nota sobre doble revisión.** Omar indicó en esta sesión que la doble revisión del equipo (Daniel/Alondra Danae) ya está al corriente, sin especificar qué documentos, quién revisó, cuándo ni qué encontraron. No se registra como hecho verificable porque no cumple el mínimo de trazabilidad que el propio proyecto exige (regla de doble revisión, sección "Reglas de trabajo"). Si se aportan esos datos, se registra aparte.


## 2026-09-25 (11:21 a 11:33, hora CDMX) — v5 de Hallazgos y Propuestas con sección de riesgos; insumo de presentación y documento maestro de avance

**Qué pidió Omar.** Actualizar documentos con la nueva información, agregar el contenido de `Riesgos_Cuidado_Fraude_Interdiccion_Insumo_Presentacion.docx` al documento de hallazgos, y crear dos entregables nuevos: un documento para construir la presentación de todo el avance, y un documento maestro para entregar como avance de lo encontrado y lo propuesto. Pidió que ambos se redacten en primera persona, como parte del equipo, sin comentarios ni observaciones de la IA.

**Parte 1 — Observatorio_Cuidado_Hallazgos_y_Propuestas_v5.docx.**
Partimos de la v4 y le insertamos, sin reescribir el contenido existente: una nota de versión en la portada; una nota sobre el Observatorio de Cuidados de INMUJERES (OCU) al final de la sección 11 (fuente candidata, no hallazgo, con las mismas advertencias de la entrada del 25 de septiembre 10:20-10:24 de esta bitácora); una sección nueva completa, "12. Riesgos legales y gobernanza del cuidado: fraude, abuso e interdicción/tutela", con las cuatro categorías de riesgo, la comparación con el documento de Daniel y el estado de la evidencia, tomada de `Riesgos_Cuidado_Fraude_Interdiccion_Informe_Completo.docx` (más completo que el insumo de presentación, que también revisamos); y una limitación adicional antes de renombrar "12. Límites de la evidencia" a "13.". Agregamos las referencias nuevas al final de la lista de Fuentes. v1, v2, v3 y v4 se conservan sin cambios.

**Parte 2 — Observatorio_Cuidado_Insumo_Presentacion.docx (nuevo).**
Documento de 29 láminas, en el mismo formato que ya usa el equipo para el insumo de riesgos: guion y cifras por lámina, con notas para quien presente donde ayuda. Cubre tema, planteamiento, nicho, las nueve fuentes de hallazgos, los riesgos legales, la síntesis, la propuesta de programa, el segmento y el mercado, la estructura de salarios, el costo y escala, el modelo de sostenibilidad y lo que falta decidir. No sustituye la decisión de diseño de las diapositivas: es el contenido para pasarlas al formato del equipo.

**Parte 3 — Documento_Maestro_Avance_Observatorio_del_Cuidado.docx (nuevo).**
Documento de avance para entrega que consolida, en una sola narrativa y en primera persona, lo que ya estaba repartido entre `Observatorio_Cuidado_Hallazgos_y_Propuestas_v5.docx`, `Estudio_de_Negocio_Programa_Cuidado_v0.2.docx` y la investigación de riesgos: quiénes somos, el planteamiento, cómo elegimos el nicho, las fuentes y sus límites, los nueve hallazgos, los riesgos legales, la síntesis, la propuesta de programa reformulada (qué NO es y qué SÍ es), el segmento objetivo, las doce referencias de mercado, los cuatro rangos salariales, el costo y escala, los tres escenarios de sostenibilidad, riesgos y supuestos, indicadores, lo que falta decidir y el estado de la evidencia. No agrega hallazgos ni cifras nuevas: reorganiza y conecta lo que ya teníamos documentado por separado.

**Sobre "elimina duplicados o versiones obsoletas".** Identificamos como superadas: `Observatorio_Cuidado_Hallazgos_y_Propuestas.docx` (base), `_v2.docx`, `_v3.docx` y el `.pdf` (que además es anterior a la propia versión base, por su fecha de modificación); `Documento_Integrado_Observatorio_Cuidado.docx` (base) y `_v0.2.docx`; y `Estudio_de_Negocio_Programa_Cuidado.docx` (base). No las borramos ni las movimos: esta sesión no tiene una herramienta de terminal en esta computadora, solo puede leer, copiar y escribir archivos puntuales, así que no puede eliminar ni mover nada dentro de `Downloads\pp26-2`. Además, la entrada de esta misma bitácora del 25 de septiembre (00:15-05:55) registra que decidimos conservar v1 a v3 a propósito, "por historia" — lo señalamos porque contradice directamente la instrucción de hoy de borrar versiones antiguas; si el equipo confirma que ahora sí quiere borrarlas, hay que hacerlo manualmente o en una sesión con acceso de terminal a esta computadora.

**Advertencia sobre `~$servatorio_Cuidado_Hallazgos_y_Propuestas_v4.docx`.** Este archivo temporal indica que `..._v4.docx` estaba abierto en Word al momento de esta sesión. No lo tocamos; si se quiere archivar v4 más tarde, hay que cerrarlo primero en Word.

**Estado.** Ninguno de los tres documentos de esta entrada tiene doble revisión de Daniel ni de Alondra Danae. Los tres lo declaran en su portada o en su primera sección.

**Pendiente.**
1. Doble revisión de la sección 12 (riesgos) de la v5, del insumo de presentación y del documento maestro.
2. Decidir si se borran de verdad las versiones superadas listadas arriba, y hacerlo con acceso de terminal a la computadora o manualmente.
3. Cerrar `Observatorio_Cuidado_Hallazgos_y_Propuestas_v4.docx` en Word antes de archivarlo.

## 2026-10-05 (22:31 a 23:03, hora CDMX) — Elección de la opción C del programa, asequibilidad del relevo por horas (script 10) y testimonio de cuidadora remunerada

**Contexto.** Tras el primer avance, el equipo decidió quedarse con las dos poblaciones de las láminas 8 (cuidadora familiar de alta intensidad, ≈0.78 M) y 11 (personas mayores con dependencia y personas con discapacidad). Se plantearon tres opciones en `Documentos/Propuestas_programa_poblacion_objetivo_v0.2.docx`: A (receptor), B (cuidadora familiar) y C (B como hallazgo de origen y A como beneficiaria, con la app de perfiles "Necesito cuidado" / "Puedo cuidar").

**Decisión.** Omar eligió la opción C el 5 oct 2026. Condición registrada en el documento: el valor de la app no es encontrar cuidadora (hipótesis ya descartada: "desconoce que existen" 0.9%, Respect, SIDECU), sino organizar la relación: relevo acotado por horas, tareas definidas, pago con piso legal, seguimiento e incidentes en ambas direcciones.

**Script 10 (`Analysis/10_asequibilidad_relevo_horas.py`).** Extiende la parte C del script 04 con paquetes de relevo; reproduce como control el 5.3% de la jornada de 40 h. Resultado (nacional, `resultados/10_asequibilidad_relevo.csv`): al piso legal, 6 h/semana cuestan $1,112 al mes y 66.2% de los hogares con necesidad podría pagarlas sin rebasar 20% de su ingreso; al tabulador CACEH, 23.8%. Límites: 483 hogares sin dato de ingreso excluidos; proporción sin varianza de diseño; "puede pagar" no es disposición a pagar.

**Testimonio de cuidadora remunerada.** Omar compartió una publicación de Facebook de una enfermera que cuida en turnos 24x24 por $1,500 el turno. Se registra como testimonio ilustrativo (n = 1, no verificado): aporta riesgos para el lado "Puedo cuidar" (tareas fuera de lo acordado, recorte de sueldo, maltrato por parte de la persona cuidada) y una referencia de precio ($62.50/h). No respalda la lámina 8, que es de cuidadoras no pagadas. En la presentación se parafrasea sin datos que permitan identificarla a ella ni a la persona que cuida.

**Estado de revisión.** Sin revisión de otra persona registrada.

## 2026-10-05 (23:03 a 23:20, hora CDMX) — Notebook 11: modelo de focalización contra la regla de 40 h

**Qué se hizo.** `Analysis/11_modelo_focalizacion_cuidadoras.ipynb` (UCA Herramientas). Objetivo: declarar algún daño por cuidar (misma definición del notebook 07). Compara la regla "40 h o más" contra regresión logística y gradient boosting con información de registro, a la misma tasa de selección (40.7%), con validación cruzada agrupada por UPM (5 particiones × 20 repeticiones) y métricas ponderadas con FAC_CUI. Reproduce el 40.7% del notebook 07. Se excluyeron como predictores las preguntas de daño, la condición de actividad (CPEA) y CT_NHA (su catálogo publicado no corresponde a la variable).

**Resultados (nacional; `resultados/11_*.csv`, `figuras/f10_cobertura_por_grupo_modelo.png`):**
1. Algún daño (62.2%): el modelo ordena mejor (AUC 0.75 contra 0.63), pero a igual selección encuentra +2.2 pp más personas con daño (IC 90%: −4.1 a 8.5). No supera a la regla de forma demostrable.
2. Salud física deteriorada (23.5%): el modelo sí supera a la regla, +12.7 pp de cobertura (IC 90%: 2.5 a 22.9).
3. El modelo redistribuye: quien cuida solo a una persona de 60+ sin discapacidad baja de 50.2% a 20.9% de cobertura, y los hombres de 45.8% a 32.9%. Parte se debe a que la ENASIC no pregunta por dependencia en ese bloque.

**Errores propios corregidos durante el trabajo:** CON_HIJOS constante, indicador de escolaridad faltante basado en un caso, e indicador de "años cuidando" faltante duplicado con CUIDA_DISC. Las conclusiones no cambiaron.

**Reproducibilidad.** El 6 oct 2026 el notebook aparece re-ejecutado en esta carpeta; sus cuatro CSV de resultados son idénticos (md5) a los generados el 5 oct.

**Decisiones abiertas.** Priorizar "algún daño" (basta la regla) o "salud física deteriorada" (se justifica el modelo); aceptar o no la redistribución contra quien cuida a 60+ sin discapacidad.

**Estado de revisión.** Sin revisión de otra persona registrada.

## 2026-10-06 (00:35 a 01:30, hora CDMX) — Observatorio en HTML v0.3: opción C, modelo de focalización e indicadores

**Qué pidió Omar.** Corregir el HTML del Observatorio (`Frontend/observatorio/`) con todos los datos reales del proyecto, incluida la opción C.

**Qué se hizo.**
- `build_datos.py` ahora lee también los resultados 04, 05, 06, 08, 09, 10 y 11, además de `matrices/inventario_fuentes_cuidado.csv` y `pares_oferta_necesidad.csv`. Se detiene si falta un archivo o una fila esperada.
- Secciones nuevas en `plantilla.html`:
  - **Programa (opción C):** decisión del 5 oct, cadena de evidencia, asequibilidad del relevo (script 10, interactiva), pago observado, subsidio y los dos perfiles.
  - **Modelo de focalización:** notebook 11.
  - **Ficha de indicadores:** 17 indicadores por dimensión; "cobertura territorial" y "calidad del cuidado domiciliario" aparecen como **no medibles**.
- Capas nuevas en territorio: dependencia severa (script 08) y pobreza 65+ (notebook 09).
- Paneles nuevos en barreras: preferencia de lugar (P6.46) y oferta declarada de cuidadoras (P6.47–P6.48).

**Corrección a la v0.2 (no se reescribe; queda registrada aquí).** La v0.2 marcaba la hipótesis de precio como "sin respaldo". La v0.3 la marca como "no es el cuello de botella", y se apoya en tres datos:
- "Son caros" casi no aparece como razón para no buscar.
- En el quintil más alto, la contratación de cuidado sigue muy por debajo de la de trabajo doméstico.
- La jornada completa cuesta 94.4% del ingreso mediano.

El precio define el formato (relevo por horas); no explica la no búsqueda.

**Verificación.**
- Las cifras clave se cotejaron contra los CSV de origen. Todas coinciden.
- Se renderizó en Chromium a 1280 y 390 px: sin errores de JavaScript y sin desbordamiento horizontal. Fuera de este entorno, las fuentes de Google cargan normalmente.

**Pendiente.**
1. Doble revisión de la v0.3.
2. Calcular el subsidio para los paquetes de relevo de 3 a 12 h, porque el script 06 solo cubre 10, 20 y 40 h.
3. Acordar con Alondra Danae la relación entre esta página y el tablero de Inteligencia de Negocios.
4. La v0.3 se generó con las copias del Project porque la computadora de Omar no estaba conectada. Hay que copiarla a `Downloads\pp26-2\Frontend\observatorio\` y volver a correr `build_datos.py` ahí, para confirmar que reproduce el mismo `index.html`.

## 2026-10-06 (10:25, hora CDMX) — Observatorio v0.4: rediseño en pestañas

**Qué pidió Omar.** Menos texto, más gráficas y pestañas en lugar de una sola página larga. Tomó como referencia el Observatorio de Cuidados (OCU) de INMUJERES.

**Qué se hizo.**
- Ocho pestañas: Inicio, Necesidad, Barreras, Relevo (opción C), Focalización, Territorio, Indicadores, y Fuentes y método.
- Cada tarjeta tiene una sola frase de hallazgo y la ficha (fuente y precisión) plegada.
- Cinco tablas se convirtieron en gráficas:
  - embudo del problema;
  - diferencias con IC al 90%;
  - contratación por quintil;
  - subsidio contra la solicitud de la CDMX;
  - dispersión territorial.
- `build_datos.py` agrega el bloque `embudo`, que se lee de los resultados 03 y 07. Ninguna cifra quedó escrita a mano en la página.

**Decisión de alcance.** Los perfiles de la app ("Necesito cuidado" / "Puedo cuidar") y el texto de diseño del programa salieron del Observatorio, porque pertenecen al documento del programa. En la pestaña Relevo solo quedó la evidencia de costo.

**Pendiente.**
1. Doble revisión.
2. En celular las gráficas se reducen y el texto queda chico. Está pensado para escritorio.

## 2026-10-06 (11:30 a 12:10, hora CDMX) — Segmentación en el Observatorio (script 12); una sola versión vigente

**Qué pidió Omar.**
- Agregar filtros de segmentación como los del OCU.
- No crear más versiones del Observatorio: modificar la actual y eliminar las antiguas.

**Qué se hizo.**
- **Script nuevo `Analysis/12_enasic_segmentacion_observatorio.py`:**
  - Calcula 249 estimaciones: 18 indicadores × 14 segmentos. Los segmentos son total, sexo, edad, ingreso, a quién cuida e intensidad.
  - Cada estimación lleva CV, IC al 90% y la diferencia contra el resto de su dimensión.
  - Validación: reproduce las cifras de los notebooks 03 y 07, y los cortes de quintil del script 04.
  - Precisión: 135 estimaciones alta, 18 moderada y 95 baja. 67 diferencias son significativas.
- **Pestañas Necesidad y Barreras:**
  - Barra "Segmentar por", con una dimensión a la vez.
  - Tarjetas del segmento contra el total, con frase de significancia. Si la precisión es baja, la tarjeta dice "no se compara".
  - Comparador de todos los segmentos; al hacer clic en un renglón, se filtra la pestaña.
  - Las razones y la preferencia de lugar se redibujan con el segmento.
- **Territorio:** tarjetas con la alcaldía más alta y la más baja de la capa elegida.
- **Necesidad:** pictograma de 10 personas en el grupo del problema.
- **Una sola versión:**
  - Se borró el respaldo `Frontend/observatorio/_v0.2/` y se eliminó la numeración de versiones de la página y del README.
  - En adelante, el archivo vigente se modifica en lugar de copiarse. La historia de cambios queda solo en esta bitácora.

**Límite.** Los segmentos no se cruzan (por ejemplo, mujer y Q1), porque las muestras quedarían demasiado chicas.

**Pendiente.** Doble revisión del script 12 y de la página.

## 2026-10-06 (11:50 a 12:40, hora CDMX) — Fuentes nuevas: rezago social por AGEB, marginación, ENIGH 2022 (scripts 13 y 14)

**Qué pidió Omar.** Hacer tres cosas con los archivos que subió:
- (A) registrarlos en el inventario de fuentes;
- (B) construir la capa territorial por AGEB para el Observatorio;
- (C) calcular la asequibilidad del relevo en la CDMX con la ENIGH 2022.

**Qué se hizo.**
- **A. Inventario:**
  - Filas F20 a F27 en `Analysis/matrices/inventario_fuentes_cuidado.csv` y REF-CAMBEROS-2007 en `matriz_referencias_bibliograficas.csv`.
  - Los datos quedaron en `Analysis/datos/coneval_irs/`, `conapo_marginacion/`, `enigh2022_coneval/` y `contexto_nacional/`. Los archivos grandes van en .zip, que Git ignora.
  - El paquete de pobreza municipal 2020 (MunEBPH, 6.5 GB) no se copió. Es el paquete de replicación del CONEVAL: no trae resultados nuevos frente al archivo que ya usa el notebook 09.
- **B. Script nuevo `Analysis/13_rezago_social_ageb_cdmx.py`:**
  - Toma 2,410 AGEB urbanas de la CDMX, que cubren el 99.1% de su población.
  - Control: el promedio ponderado de población sin derechohabiencia (27.23%) cuadra con el dato del CONEVAL por entidad (27.17%).
  - El Observatorio, en la pestaña Territorio, tiene dos capas nuevas: "Rezago social" y "Sin derechohabiencia".
- **C. Script nuevo `Analysis/14_enigh_asequibilidad_cdmx.py`:**
  - Usa los mismos paquetes y costos del script 10, con el ingreso monetario de la ENIGH 2022.
  - El IC al 90% sale del diseño muestral (estratos y UPM).
  - El Observatorio, en la pestaña Relevo, tiene un selector de fuente del ingreso: ENASIC nacional, ENIGH nacional y ENIGH CDMX.
  - Hay dos KPI nuevos.

**Hallazgos que cambian lecturas anteriores.**
1. **La ENASIC subestima el ingreso.**
   - Ingreso mediano de los hogares con necesidad, nacional, en pesos de nov-2022: ENASIC $6,800 contra ENIGH $12,402.
   - Por eso la asequibilidad del script 10 queda baja. Para 6 h/semana al piso legal y un tope del 20% del ingreso: ENASIC nacional 66.2%; ENIGH nacional 84.5%; ENIGH CDMX 92.0% (IC90 90.6–93.4).
   - Consecuencia para el programa: el precio pesa menos como barrera de lo que sugería el script 10. Esto debilita el reencuadre del 20 sept, que ponía al precio y la asequibilidad al centro. Poder pagar sigue sin ser querer contratar: solo 1.0% contrata cuidado (ENASIC).
2. **Hay una tasa directa de necesidad para la CDMX.**
   - El 47.1% de los hogares de la CDMX tiene a alguien de 60+ o con discapacidad (IC90 45.0–49.1), unos 1.41 M de hogares.
   - El script 05 infiere una cota inferior de 1.10 M a partir de tasas nacionales. Hay que decidir si el script 05 se actualiza con la ENIGH.
3. **Los focos de rezago "Muy alto" de la CDMX eran sobre todo AGEB casi vacías.**
   - 10 AGEB tienen indicadores suprimidos (\*). Cuatro de ellas tienen grado Alto o Muy alto con menos de 10 habitantes.
   - Se excluyen de los agregados.
   - El 9.0% de la población en AGEB válidas vive en rezago Medio o mayor. Milpa Alta tiene 47.7%, e Iztacalco, Benito Juárez y Miguel Hidalgo tienen 0%.
4. **La marginación de CONAPO no distingue entre alcaldías.** Las 16 son "Muy bajo", así que no se usa como capa.

**Decisión registrada.** Las capas de rezago y derechohabiencia se presentan como contexto de vulnerabilidad, no como necesidad ni demanda de cuidado.

**Pendiente.**
1. Doble revisión de los scripts 13 y 14, de las filas F20–F27 y de los cambios al Observatorio.
2. Decidir si las tarjetas de la pestaña Relevo y el KPI nacional pasan de la ENASIC a la ENIGH.
3. Confirmar que la definición de discapacidad de la ENASIC (HN_CDISC) usa el mismo corte que la del CONEVAL.
4. Verificar el origen de `grs_ageb_2020.csv` contra la descarga oficial; tiene columnas `fn_*` que no son del producto original.
5. Verificar el anexo y la URL del PEF 2026 (F25).

## 2026-10-06 (tarde, hora CDMX) — Observatorio: medición directa de la ENIGH en Territorio

**Qué pidió Omar.** "Actualiza el observatorio".

**Qué se hizo.** Se regeneró la página desde los resultados vigentes (scripts 01–14), sin crear otra versión. Además:
- **Territorio:** se agregó una tarjeta con la medición directa de la ENIGH 2022: 47.1% de los hogares de la CDMX tiene a alguien de 60+ o con discapacidad (IC 90% 45.0–49.1), unos 1,407,522 hogares. `build_datos.py` lee el IC, el CV y el total de la nota de `14_enigh_resumen.csv` y se detiene si el formato cambia. La cota inferior del script 05 (1,099,461) se mantiene, marcada como inferida, con la nota de que la ENIGH mide 28% más.
- **Relevo:** la tarjeta de asequibilidad (6 h/sem, piso legal, tope de 20%) ahora sigue al selector de fuente. Por defecto muestra la ENASIC (66.2%); con la ENIGH CDMX muestra 92.0%.
- **Ficha del subsidio:** dice que el cálculo del script 06 usa la cota del script 05 y que no se ha rehecho con la base de la ENIGH.
- **Dispersión del mapa:** se corrigió el encimado de etiquetas (por ejemplo, XOCH y MH).

**Lo que no se cambió, y por qué.** No se cambió la fuente por defecto de Relevo ni la de los KPI. Es la decisión pendiente número 2 de la entrada de los scripts 13 y 14, y le toca al equipo.

**Pendiente.**
1. Doble revisión.
2. Decidir la fuente por defecto (ENASIC o ENIGH).
3. Rehacer el subsidio (script 06) con 1.41 M hogares si el equipo adopta la ENIGH. Con más hogares, el costo sube.


## 2026-10-06 (tarde, hora CDMX) — Observatorio: plan de condensación aplicado; script 16 y diccionario

**Qué pidió Omar.** Aplicar el plan de condensación del Observatorio: separar Observatorio, programa y documentación técnica, condensar el texto y agregar lo que faltaba.

**Qué ya estaba hecho antes de esta entrada.** Varias partes del plan ya existían desde las entradas de la mañana:
- pestañas;
- embudo;
- quintiles como gráfica;
- costo contra presupuesto;
- dispersión territorial;
- indicadores como tarjetas;
- fichas plegadas;
- segmentación (script 12).

**Qué se hizo.**
- **Script nuevo `Analysis/16_enasic_perfil_grupo_horas.py`:**
  - Perfil del grupo del problema contra el universo, con IC al 90% y diferencia contra el resto del universo. Valida el total de 775,546 del notebook 07.
  - Distribución de horas.
  - Salidas: `resultados/16_perfil_grupo_problema.csv` y `16_distribucion_horas.csv`.
- **Resultados del script 16** (nacional, n = 132 en el grupo):
  - El grupo tiene más mujeres que el resto: 77.8% contra 68.8% en el universo (significativo).
  - Tiene más personas que cuidan a alguien con discapacidad: 73.0% contra 56.5% (significativo).
  - Por edad e ingreso no se distingue del resto.
  - Horas: la mediana es de 30 h; 40.7% cuida 40 h o más.
  - El 3.3% declara el tope del cuestionario ("98 o más" en un bloque), así que los rangos altos están censurados.
- **Diccionario `Analysis/matrices/diccionario_observatorio.csv`:**
  - Documenta las variables derivadas y cada bloque de `datos_observatorio.json`.
  - `build_datos.py` se detiene si aparece un bloque sin documentar.
  - Las definiciones de las preguntas se tomaron del diccionario de datos del INEGI (tpob_cui).
- **Página:**
  - Las pestañas se renombraron como preguntas: ¿Quién lo carga?, ¿Por qué no se contrata?, ¿Cuánto cuesta?, ¿A quién primero?, ¿Dónde?, Indicadores y Método. Las direcciones (#necesidad, etc.) no cambiaron.
  - Se quitaron la franja de la "opción C" y la frase "el programa propone relevo por horas". La pestaña de costos ya no se llama "Relevo (opción C)".
  - Se agregaron dos gráficas: perfil del grupo y distribución de horas.
  - Indicadores: la lista completa quedó plegada.
  - Método: todo quedó plegado, incluidas las fuentes, y se agregó el diccionario. Las cuatro preguntas del piloto se redujeron a una línea.
  - Territorio: el texto se acortó.
- **Aviso de costos.** La pestaña de costos y la tarjeta de Inicio dicen "sin prestaciones · jornada diurna", como pide el pendiente 3 de la corrección al script 15.
- **Ficha del gráfico de necesidad:** cita el rótulo exacto del INEGI para P6.45.09.

**Hallazgo que hay que discutir.** El INEGI rotula la opción P6.45.09 como "NO HA TENIDO NECESIDAD (NO HAY PERSONAS EN SU HOGAR QUE REQUIERAN CUIDADOS)".
- La lectura central del proyecto es que la persona cuidadora no nombra su carga como necesidad. Ese rótulo admite otra lectura: la persona cuidada vive en otro hogar.
- No se encontró esta advertencia en la bitácora.
- Antes de la revisión del 2 al 6 nov hay que medir qué parte del grupo cuida a alguien fuera de su hogar, si la ENASIC lo permite.

**Cómo se trabajó.** La computadora de Omar no estaba conectada el 6 oct. Los cambios se copiaron a su carpeta el 7 oct, 9:00, y la página se regeneró ahí con el inventario completo (F01 a F27).
- El proyecto de Claude se llenó: no tiene el script 16, sus resultados, el diccionario ni esta entrada.

**Pendiente.**
1. Doble revisión del script 16, del diccionario y de la página.
2. Decidir para quién es la página (evaluador o institución). Se asumió el evaluador: Método se queda como pestaña, plegada.
3. Medir la lectura alternativa de P6.45.09.

## 2026-10-07 (9:05 a 9:50, hora CDMX) — Los scripts de análisis pasan a notebooks con gráficas

**Qué pidió Omar.** Convertir los scripts en notebooks y mostrar gráficas.

**Qué se hizo.**
- **Nueve scripts pasaron a notebook:** 04, 05, 06, 08, 10, 12, 13, 14 y 16 ahora son `.ipynb` en `Analysis/`.
  - El cálculo no cambió: el texto inicial pasó a una celda de texto y el código se dividió en celdas por sección.
  - Al final de cada notebook se agregaron gráficas (16 en total).
  - Única adaptación: el 08 se ejecutaba desde la raíz del repositorio y ahora corre desde `Analysis/`.
- **Estilo común:** `Analysis/estilo_graficas.py`.
  - Paleta categórica en orden fijo, validada para daltonismo.
  - Gris para las referencias.
  - Las estimaciones de precisión baja se dibujan rayadas o huecas.
  - Cada figura lleva al pie su advertencia.
- **Verificación:** los nueve notebooks se ejecutaron completos en esta carpeta, sin errores. Los 24 archivos de `resultados/` que producen son idénticos, byte por byte, a los que producían los scripts.
- **Scripts originales:** los `.py` se movieron a `_to_delete/scripts_py_convertidos_0710/`, para que no haya dos fuentes del mismo resultado. El diccionario y el README del Observatorio ahora apuntan a los `.ipynb`.

**No se convirtieron.**
- `eda_fuentes.py` y `generar_figuras.py`: son utilidades, no análisis numerado.
- `build_datos.py`: arma la página.
- Script 15 (anuncios): no está en esta carpeta, solo en el proyecto de Claude.

**Pendiente.**
1. Doble revisión de las gráficas.
2. Decidir si los notebooks 02, 03 y 09, que no tienen gráficas, también las llevan.

## 2026-10-07 (hora CDMX) — El comparador de segmentos cambia de gráfico

**Qué pidió Omar.** El gráfico de puntos con intervalo (la tarjeta «Comparar segmentos» del HTML) no le gustó; pidió gráficos que existan en Tableau.

**Qué se hizo.**
- `comparador()` de `Frontend/observatorio/plantilla.html` (y, por regeneración, `index.html`) ahora ofrece tres vistas, con un selector junto al del indicador:
  - **Barras divergentes** (vista inicial): diferencia en puntos porcentuales contra el resto de la misma dimensión, con el IC 90% de la diferencia.
  - **Lollipop ordenado**: % del segmento, de mayor a menor, con la línea y la banda de IC del total nacional.
  - **Tabla de calor**: % con color secuencial y la diferencia con ▲▼=.
- Se conserva: clic en un renglón filtra la pestaña, el segmento elegido queda resaltado, el renglón «Total nacional» quita el filtro. Los renglones de precisión baja no se comparan (sin barra, punto hueco o celda rayada).
- Las cifras no cambian: salen de `D.seg` (script 12). Se comprobó que `datos_observatorio.json` y el bloque de datos de `index.html` son idénticos a los de antes del cambio.
- Se agregaron avisos en la propia tarjeta: «sin diferencia significativa» no significa «igual», y son varias comparaciones al 90%, así que alguna «significativa» puede ser casualidad. En dimensiones de dos categorías las dos barras son espejo y no cuentan como dos hallazgos.

**Verificación.** Probado en el navegador con Live Server: las tres vistas, los 10 indicadores de las dos pestañas y el clic de filtro, sin errores en consola ni valores NaN. El caso de precisión baja solo se pudo probar con datos sintéticos, porque en `dano` ningún segmento la tiene; esos datos no están en el repositorio.

**Cómo se aplicó.** `scripts/parche_comparador_2026-10-07/` (parche con anclas exactas y el bloque de JS). Respaldo de los dos HTML anteriores en `_to_delete/backup_pre_comparador_2026-10-07/`, porque la carpeta no tiene `.git`.

**Pendiente.**
1. Doble revisión del cambio (lo produjo Claude; lo debe revisar otra persona del equipo).
2. Decidir si se conservan las tres vistas o solo dos (propuesta: barras divergentes y tabla de calor).
3. Las barras divergentes no separan efectos entre dimensiones que se traslapan (sexo, a quién cuida, intensidad); eso lo hace el modelo del script 11.

## 2026-10-07 (tarde, hora CDMX) — v2: un solo mapa de calor, más variedad de gráficas, menos texto

**Qué pidió Omar.** Tras ver la v1 (barras divergentes con todos los segmentos en una sola gráfica): no quiere todo segmentado en una gráfica, quiere algo más simple; sí le gustó el mapa de calor; hay demasiadas gráficas de barras; quiere más variedad, menos texto y solo las gráficas.

**Decisión (cambia la de la mañana).** La v1 ofrecía tres vistas con selectores (barras divergentes, lollipop, tabla de calor). Se retiran las tres y los selectores. Queda el **mapa de calor** como única vista de «Comparar segmentos», con todos los indicadores a la vista (Total + segmentos por dimensión). La v1 no se borra del historial: parche en `scripts/parche_comparador_2026-10-07/` y respaldo en `_to_delete/backup_pre_comparador_2026-10-07/`.

**Qué se hizo.**
- Mapa de calor sin selectores: color por renglón (mínimo a máximo), ▲▼ para diferencia significativa (IC 90%), rayado para precisión baja, clic en columna filtra la pestaña.
- Variedad de formas, eligiendo cada una según lo que mide el dato: embudo, líneas con IC (categorías ordenadas como horas), mancuernas, piruletas con IC, dona solo donde las categorías son excluyentes y suman 100, waffle, anillos (una proporción por grupo) y piruletas divergentes en los coeficientes del modelo.
- Texto: la lectura, la fuente y la precisión pasaron a acordeones bajo cada tarjeta y «Cómo leer esta pestaña» bajo cada título. No se eliminó información; se plegó.
- Corrección de un error previo (también en la v1 y antes): al elegir un segmento de «Intensidad» en el mapa o en los filtros, las tarjetas fallaban porque los indicadores definidos por horas no tienen fila en esa dimensión. Ahora esas tarjetas se omiten.
- Las cifras no cambian: `datos_observatorio.json` es idéntico (comparación byte a byte) al de antes de la v2.

**Verificación.** Pruebas con Chromium sobre los datos reales: las 8 pestañas sin errores de JS ni NaN/undefined; clic en las 14 columnas del mapa en «¿Quién lo carga?» y «¿Por qué no se contrata?»; revisión visual de las pestañas. En el navegador integrado: la página servida desde la carpeta carga, tiene 14 columnas y no muestra NaN tras los clics. Respaldo de la versión anterior en `_to_delete/backup_pre_v2_2026-10-07/`.

**Advertencias de lectura (siguen vigentes).**
- El color por renglón estira el mínimo-máximo: diferencias chicas se ven grandes. Mirar el número y el ▲▼, no solo el tono.
- «Sin ▲▼» no significa «igual»; son 13 comparaciones al 90%, alguna «significativa» puede ser casualidad.
- Sexo, a quién cuida e intensidad se traslapan; el mapa no separa efectos entre dimensiones (eso lo hace el modelo del script 11).
- La dona completa el resto como 100 − suma (derivado); el waffle redondea por mayor resto (≈1% por cuadro).

**Pendiente.**
1. Doble revisión por otra persona del equipo (lo produjo Claude).
2. Revisión en pantalla de teléfono y con modo oscuro del sistema: no se probó.
3. Decidir si el modelo (pestaña «¿A quién primero?») mantiene los puntos con IC o también pasa a otra forma.

## 2026-10-07 (tarde, hora CDMX) — Observatorio: CSS y JS salen del HTML a carpetas propias

**Qué cambió y por qué.** Todo el Observatorio vivía en `plantilla.html` (≈160 líneas de CSS y ≈550 de JS en línea), y `build_datos.py` lo inflaba a `index.html`. Se pidió no tener todo en un solo archivo. Ahora `index.html` solo tiene la estructura, el CSS está en `Frontend/observatorio/css/` (5 archivos) y el JS en `Frontend/observatorio/js/` (16 módulos más `obs.js`, en `nucleo/`, `graficas/`, `vistas/` y `app/`). Los datos pasaron a `js/datos/datos.js` y `geo.js`, que genera `build_datos.py`.

**Decisiones que cambian el flujo (no se reescribe el pasado).**
- `plantilla.html` ya no existe; `index.html` es el archivo fuente y se edita a mano. La plantilla anterior quedó en `_to_delete/plantilla_observatorio_2026-10-07.html`.
- `build_datos.py` ya no escribe `index.html`: escribe `datos_observatorio.json`, `js/datos/datos.js` y `js/datos/geo.js`.
- Scripts clásicos en orden, no módulos ES: la página se abre con doble clic (`file://`) y ahí el navegador bloquea `import` y `fetch`.
- `scripts/parche_comparador_2026-10-07/aplicar_parche_comparador.py` parcheaba `plantilla.html`. Ya se había aplicado; no se debe volver a correr.
- El estado del filtro de segmentación (`F`, `SG`, `segName`, `RAZK`) pasó a `nucleo/filtro-segmento.js` para romper una dependencia circular entre `barreras.js` y `segmentacion.js`.

**Qué no cambió.** Ni el contenido ni las cifras. `datos_observatorio.json` y los datos de la página son idénticos a los publicados antes (comparación de contenido tras correr `build_datos.py`).

**Verificación.** Con Chromium, la versión anterior y la nueva dieron el mismo DOM y los mismos estilos calculados a 1280, 800 y 500 px, y la misma secuencia de resultados en 81 clics sobre los selectores de las 8 pestañas; cero errores de JS en ambas. El CSS conserva las mismas 146 líneas no vacías. No se probó en teléfono real ni con modo oscuro.

**Pendiente.**
1. Doble revisión por otra persona del equipo (lo produjo Claude).
2. `barras()` en `js/graficas/componentes.js` no la llama nadie (código muerto que ya estaba); se dejó sin tocar. Decidir si se borra.

## 2026-10-07 (noche, hora CDMX) — Observatorio: barra lateral e Inicio con las escenas 3D del prototipo

**Qué se pidió.** Omar pidió (1) cambiar la barra de pestañas superior por una barra lateral con los colores del Observatorio y (2) dejar en el Inicio solo tres piezas del prototipo 3D (artefacto «Observatorio del Cuidado»): «Los datos que cuidan», «¿Cuántas personas están en el problema?» y «Lo que encontramos», las tres con el formato de la segunda. El artefacto se conserva.

**Decisión que cambia otra anterior (no se reescribe el pasado).** El README decía que la decisión del enfoque (opción C) y los perfiles de la app no estaban en el Observatorio. Desde hoy el marco «Los datos que cuidan» explica el enfoque con cuatro cifras del Observatorio y una de sus razones nombra la app («Una app que organiza, no que busca»). Los perfiles de la app («Necesito cuidado» / «Puedo cuidar») y las preguntas del piloto siguen fuera. Este cambio mezcla el programa con el Observatorio y requiere la doble revisión antes de publicarse.

**Qué se hizo.**
- Barra lateral: marca, ocho pestañas con ícono, tarjeta «El cuidado también es trabajo» y nota de actualización. Bajo 960 px vuelve a ser barra superior deslizable.
- Inicio: tres marcos con escena 3D (three.js r128 local en `Frontend/observatorio/vendor/`, licencia MIT) y tarjetas que llevan a su pestaña. Salieron los contadores, el embudo en SVG y las cuatro tarjetas anteriores; `inicio-contadores.js` se retiró.
- Todas las cifras se leen de `D` (`build_datos.py`); los objetos de «Lo que encontramos» se dibujan con esas mismas cifras. Las figuras de personas son ilustración.
- Corrección: el 70.5% es «de quienes cuidan 40 h o más y dicen "no tuve necesidad"». La tarjeta anterior del Inicio y el prototipo 3D omitían la condición "no tuve necesidad".
- Respaldo de los archivos anteriores en `_to_delete/backup_pre_inicio3d_2026-10-07/`.

**Verificación.** Chromium a 1440, 1280 y 390 px: las 8 pestañas sin errores de JS ni NaN/undefined; clic en pestañas, marca, flechas del teclado y botones «Ver la pestaña»; barra de filtro pegajosa bien colocada en teléfono; sin three.js la página no falla y muestra solo las tarjetas. No se probó en teléfono real, Safari ni con GPU real (se usó render por software).

**Pendiente.**
1. Doble revisión por otra persona del equipo (lo produjo Claude), en especial el punto del enfoque dentro del Observatorio.
2. «Los datos que cuidan» y «Lo que encontramos» repiten tres cifras (70.5%, 66.2%, 0.9%). Decidir si se quedan así.
3. El prototipo 3D (artefacto) conserva la redacción imprecisa del 70.5%.
4. Rosa aparece con uniforme de enfermería, que se lee como cuidado pagado, aunque las escenas hablan de cuidado familiar sin pago.

### 2026-10-07 (noche, más tarde) — «Los datos que cuidan» vuelve al diseño del prototipo

**Cambio sobre la entrada anterior.** Omar prefirió cómo se veía en el prototipo. «Los datos que cuidan» volvió a ser un bloque oscuro, con el logo 3D al centro, las cuatro razones a los lados (cuadros con los colores del logo), los dos perfiles de la app («Necesito cuidado» / «Puedo cuidar») y los cuatro contadores. Regresó `inicio-contadores.js`. «¿Cuántas personas están en el problema?» y «Lo que encontramos» siguen como marcos.

**Consecuencias.**
- Los perfiles de la app ahora sí están en el Observatorio. Eso contradice la separación entre Observatorio y programa que estaba documentada; queda para la doble revisión.
- El contador «gráficas y mapas» marca 19 y no 20: se cuenta en vivo y el embudo en SVG ya no existe.
- Las razones conservan la redacción corregida del 70.5% («… y dicen "no tuve necesidad"») y la nota «sin prestaciones» en el 66.2%. Sus cifras se leen de `D`.

**Verificación.** Chromium a 1440 y 390 px: las 8 pestañas sin errores de JS; navegación por pestañas, marca, teclado y botones «Ver la pestaña».

### 2026-10-07 (noche) — Observatorio: el contenido escala en pantallas anchas

**Qué cambió y por qué.** En pantallas anchas (o con el navegador a menos de 100%) el contenido se quedaba en 1240 px y dejaba márgenes vacíos grandes. Omar pidió que ocupe el espacio. Desde 1760 px de ancho, la columna de contenido escala completa con `zoom` (de 1.1 a 1.85 según el ancho) y la barra lateral escala menos. Así el contenido ocupa cerca del 90% del ancho libre. No cambia el contenido ni las cifras.

**Verificación.** Chromium a 2255, 1920 y 1440 px: sin desbordamiento horizontal; la barra lateral ocupa justo el alto de la ventana; las escenas 3D siguen respondiendo al cursor; la barra de filtro sigue pegada arriba; sin errores de JS. Firefox anterior a la versión 126 no tiene `zoom`: ahí solo se verían márgenes más anchos (no probado). Respaldo en `_to_delete/backup_pre_zoom_2026-10-07/`.

### 2026-10-07 (noche) — Observatorio: cinco gráficas pasan a formatos más comunes

**Qué cambió y por qué.** Omar dijo que el contenido estaba bien pero que no le convencían las visualizaciones, y pidió gráficas más comunes, conservando algunas de corte estadístico. Cambios en `Frontend/observatorio` (las cifras no cambian; `js/datos/` no se tocó):
- «No tuve necesidad» y daño por horas: las dos líneas cruzadas pasan a un pictograma por fila de horas. A la izquierda va el % que dice «no tuve necesidad» y a la derecha, de cada 10 que lo dicen, cuántas declaran daño. Las figuras con daño llevan una venda y una grieta, y la última figura se llena en parte. Así cada fila muestra el subgrupo dentro del grupo y ya no se cruzan dos porcentajes con denominadores distintos en un mismo eje.
- Diferencias con IC (se queda como gráfica estadística): todas se expresan como «más horas menos menos horas», agrupadas en principal y comprobación por cuartiles; las que cruzan el cero van en gris. La ficha advierte que son seis comparaciones sin corrección.
- Perfil del grupo del problema: de piruletas a barras agrupadas (grupo y todas las cuidadoras). Se marca que Q3 es un solo quintil y se atenúa «Ingreso sin dato».
- Razones para no buscar: de piruletas a barras horizontales con IC. La precisión baja pasa de rojo hueco a gris rayado.
- Rechazo a residencias: del waffle a barras horizontales con las etiquetas arriba.
- Oferta declarada: de tres anillos a columnas de mujeres y hombres, con el total como línea de referencia.
- La figura del grupo del problema usa las mismas figuras con daño.

**Archivos.** `js/graficas/componentes.js` (nuevos: `figura`, `filaFiguras`, `iconosDano`, `barrasH`, `columnas`), `js/vistas/necesidad.js`, `js/vistas/barreras.js`, `index.html` (títulos y leyenda). Respaldo en `_to_delete/backup_pre_graficas_2026-10-07/`.

**Verificación.** Chromium a 1440 px con las pestañas ¿Quién lo carga? y ¿Por qué no se contrata? sin errores de JS (solo falla la carga de fuentes externas sin red). No se probó en teléfono.

**Pendiente.** Doble revisión. Que el daño suba con las horas no basta para sostener que «no tuve necesidad» esconde necesidad: falta comparar el daño entre quienes dicen y no dicen «no tuve necesidad» con las mismas horas (56.4 % frente a 62.2 % en el total, script 12).

**Ajuste (20:00).** A pedido de Omar se quitaron de la tarjeta «El grupo del problema» el pictograma del 70.5 %, que repetía la última fila de la gráfica de necesidad y daño, y el 40.7 % de quienes cuidan 40 h o más, que repetía la tarjeta de arriba de la misma pestaña. Se queda el 79.6 % (daño entre quienes además bañan, visten o dan de comer), que no aparece en otro lugar.

**Ajuste (20:10).** En «¿Quiénes forman el grupo del problema?», a pedido de Omar, las barras horizontales con todas las dimensiones a la vez pasan a columnas agrupadas (grupo del problema y todas las cuidadoras) para una dimensión a la vez. Unos botones dejan elegir Sexo, Edad, Ingreso o A quién cuida. La fila pasa de `.c2` a `.c12` (nueva en `css/layout.css`: tarjeta angosta a la izquierda y ancha a la derecha), y así «Horas semanales de cuidado por sexo y edad» ya no deja tanto espacio en blanco. El texto de hallazgo sigue resumiendo las cuatro dimensiones. Respaldo en `_to_delete/backup_pre_perfil_columnas_2026-10-07/`. Verificado en Chromium a 1600 px con los cuatro botones, sin errores de JS.

**Ajuste (20:20).** A pedido de Omar, en la pestaña ¿Por qué no se contrata? «Si contratara cuidado, ¿dónde?» y «¿Trabajaría como cuidador(a) si le pagaran?» quedan en una sola tarjeta, «Demanda y oferta de cuidado pagado», con dos paneles. Cada panel dice su universo, porque no es la misma población: quienes cuidan a una persona con discapacidad o 60+ frente a la población de 15 a 60 años. «¿Por qué rechazaría una residencia?» queda a su lado con barras horizontales y las etiquetas a la izquierda. La fila pasa de `.c3` a `.c21`. `barrasH` acepta ahora `W` y `rowH`. Respaldo en `_to_delete/backup_pre_demanda_oferta_2026-10-07/`. Verificado en Chromium a 1900 y 1280 px, sin errores de JS.

**Ajuste (20:30).** «Si contratara cuidado, ¿dónde?» deja la dona y pasa a barras agrupadas. Sin filtro, o con el filtro de Sexo, compara mujeres y hombres que cuidan; con otro filtro, compara el segmento con el total nacional. Las cifras salen del script 12 (`pref_casa`, `pref_no`, `pref_publica`). Ninguna diferencia por sexo es significativa: en su casa, 59.3 % frente a 55.7 % (+3.6 pp, IC que cruza el cero), y el texto del hallazgo lo dice. «Casa de un familiar» (1.6 %) e «institución privada» (0.8 %) no tienen desglose por sexo y tienen precisión baja, así que solo van en una nota. Se descartó la barra apilada «de cada 58.1 %, cuántas son mujeres»: es composición y solo repetiría que la mayoría de quienes cuidan son mujeres. Nueva función `barrasGrupo` en `js/graficas/componentes.js`. Respaldo en `_to_delete/backup_pre_pref_sexo_2026-10-07/`. Verificado en Chromium a 1900 px, con y sin filtro, sin errores.

**Ajuste (20:40).** A pedido de Omar:
1. Sale el panel de columnas «¿Trabajaría como cuidador(a) si le pagaran?». «Si contratara cuidado, ¿dónde?» y «¿Por qué rechazaría una residencia?» quedan lado a lado en una fila `.c2`.
2. La oferta declarada pasa a la fila de tarjetas de arriba en lugar de «Falta de información». La tarjeta muestra 45.0 % de las mujeres en grande y 34.7 % de los hombres más chico debajo, con la diferencia de +10.3 pp. La marca de significativa se calcula en el código: los IC al 90 % no se traslapan (42.7–47.3 y 32.4–37.1). Lleva el chip «Intención, no oferta real».
3. Consecuencia que se acepta: esa fila deja de ser el semáforo de las cuatro hipótesis. La hipótesis «falta de información», ya descartada, solo queda visible en la gráfica «¿Por qué no buscó servicios?» («No saben que existen», precisión baja), y la cifra citable de 0.9 % (todas las cuidadoras) ya no tiene tarjeta propia.

Respaldo en `_to_delete/backup_pre_kpi_oferta_2026-10-07/`. Verificado en Chromium a 1900 y 1280 px, sin errores.

**Ajuste (20:50).** Omar aclaró con una imagen que con «horizontal» se refería a girar las gráficas: «Si contratara cuidado, ¿dónde?» y «¿Por qué rechazaría una residencia?» pasan de barras horizontales a columnas verticales con IC. La primera son columnas agrupadas de mujeres y hombres (o segmento y total cuando hay filtro); la segunda tiene una sola serie. Las etiquetas largas van en varias líneas, y la precisión baja se marca rayada con la palabra «baja» y la moderada con «mod.». Nueva función `columnasGrupo` en `js/graficas/componentes.js`; `barrasGrupo` se queda sin uso. Respaldo en `_to_delete/backup_pre_columnas_2026-10-07/`. Verificado en Chromium a 1900 y 1280 px, sin errores.

**Ajuste (21:00).** Pestaña ¿Dónde?: el menú de capas del mapa se acomodaba a la derecha del título o debajo según lo largo del título, que cambia con cada capa, y al cambiar de capa el menú brincaba. Ahora va siempre debajo del título (`.ctrls`, como en el resto de las tarjetas con selector). Solo cambió `index.html`; respaldo en `_to_delete/backup_pre_menu_mapa_2026-10-07_index.html`. Verificado en Chromium a 1900 px con las capas Asilos y Rezago social.

**Ajuste (21:10).** A pedido de Omar, «Si contratara cuidado, ¿dónde?» pasa de columnas a figuras de mujer (rosa) y de hombre (azul) que se llenan de abajo hacia arriba según el %; la figura llena equivale a 100 %, y una línea punteada marca el nivel. «Institución pública» va rayada con la nota de precisión baja. Con un filtro distinto de Sexo, la tarjeta vuelve a las columnas de segmento contra total, porque las figuras solo representan mujeres y hombres. Nueva función `figurasSexo` en `js/graficas/componentes.js`. Respaldo en `_to_delete/backup_pre_figuras_sexo_2026-10-07/`. Verificado en Chromium a 1900 y 1280 px, sin errores.

**Ajuste (21:20).** Se rediseñó la tarjeta «El grupo del problema» según la maqueta de Omar. El título y «≈ 776 mil» van grandes a la izquierda. El 79.6 % (daño entre quienes además bañan, visten o dan de comer) va arriba a la derecha y más chico, y la descripción con el 12.5 % queda debajo, a todo el ancho. En teléfono todo se apila. Las cifras no cambian. Archivos: `index.html` (sale el `h3` fijo), `js/vistas/necesidad.js` y `css/componentes.css` (clases `.gp-*`). Respaldo en `_to_delete/backup_pre_kpi_grupo_2026-10-07/`. Verificado en Chromium a 1900, 1280 y 420 px, sin errores.

**Ajuste (21:30).** Omar dijo que la pestaña ¿Cuánto cuesta? se veía muy vacía: la columna derecha solo tenía la tarjeta corta del pago por hora, y la advertencia «Poder pagar no es querer contratar» estaba escondida en el plegable de la gráfica de asequibilidad. Cambios:
1. Tarjeta nueva, «¿Qué parte del ingreso se lleva?»: costo de cada paquete como % del ingreso mediano del hogar con necesidad. Usa los mismos selectores que la gráfica de la izquierda (fuente, salario, tope). Verde si cabe en el tope y rojo si lo rebasa; la escala se corta en 60%. Cifras: `pct_ingreso_mediano` que ya estaba en `datos.js` (script 10 para la ENASIC; build_datos.py con el script 14 para la ENIGH). No hay cifras nuevas.
2. «¿Cuánto se paga hoy por hora?» pasa de una fila (cuidadora) a tres: cuidadora (n = 26), trabajo doméstico entrada por salida (n = 366) y enfermería (n = 14), con mediana, banda p25–p75 y las líneas del piso legal y el CACEH. El hallazgo dice que la mediana de la cuidadora ($43.87/h) queda por debajo de la del trabajo doméstico por horas ($76.97/h), **y que la comparación no es limpia**: el doméstico se contrata por menos horas (mediana de 7 contra 24 h/sem) y la muestra de cuidadoras es chica. Es una pista para el piloto, no un hallazgo confirmado.
3. `build_datos.py` agrega `horas_sem_mediana` al bloque `pago` (sale de las filas `horas_sem` de `04_pago_observado_cuidado.csv`). Se volvió a correr; el único cambio en `datos.js` son esos tres campos.
4. La advertencia «Poder pagar no es querer contratar» vuelve a estar visible en la columna derecha (`plegables.js` ya no la mete al plegable).
5. La gráfica de asequibilidad es más alta (H 310 → 470) para emparejar las dos columnas.

Archivos: `index.html`, `js/vistas/relevo.js`, `js/app/plegables.js`, `build_datos.py`, `js/datos/datos.js`, `datos_observatorio.json`. Respaldo en `_to_delete/backup_pre_relevo_lleno_2026-10-07/`. Verificado en Chromium a 1440, 2000 y 390 px (con ENIGH CDMX + CACEH + ≤10%), sin errores de JS ni desplazamiento horizontal. **Pendiente:** doble revisión, y decidir si en los hallazgos del Observatorio se publican los 5 anuncios del script 15 (no se incluyeron: la bitácora de anuncios sigue pendiente).

**Ajuste (21:55).** A pedido de Omar, la ficha «ⓘ Lectura, fuente y precisión» de cada tarjeta deja de ser un plegable y pasa a ser un recorrido guiado (coachmark): el botón se resalta con un anillo y abre debajo un globo oscuro con «Paso N de 3», título, texto, puntos de avance (el actual más ancho y claro) y los botones «Omitir» y «Siguiente» («Listo» en el último paso). Los pasos son: 1) Cómo leerla (el texto que antes estaba en `.find`), 2) De dónde sale (Fuente, Archivo, Universo, Pregunta, Muestra…) y 3) Qué tan precisa es (Precisión, Advertencia, Método, Supuesto y notas sueltas como `#relIng`). Si la ficha no trae renglones de precisión, el paso 3 lo dice en lugar de inventar uno. Tarjetas sin `.find` tienen 2 pasos y conservan el rótulo «Fuente y precisión». El globo lee la ficha al abrirse, así que sigue los filtros y selectores. Se cierra con Omitir, Listo, Esc o clic fuera. Se hizo con CSS propio (paleta de `base.css`), no con Tailwind: el reset de Tailwind por CDN chocaría con los estilos del Observatorio. Los plegables fuera de tarjetas («Fuente y precisión» de los marcos de Inicio y «Cómo leer esta pestaña») no cambian. Sin cambios de cifras. Archivos: `js/app/coachmark.js` (nuevo), `js/app/plegables.js`, `css/componentes.css`, `index.html`. Respaldo en `_to_delete/backup_pre_coachmark_2026-10-07/`. Verificado en Chromium a 1280 y 420 px (17 tarjetas, recorrido completo, Esc, encuadre en pantalla), sin errores de JS.

## 2026-10-08 (mañana, hora CDMX) — Pestaña ¿Dónde?: siluetas en las tarjetas, contexto estatal y zonas por AGEB

**Siluetas (10:20–10:28).** Omar pidió algo parecido a una tarjeta de «Guerrero, índice de marginación 11». Primero se agregó una tarjeta nueva; Omar pidió no agregar cajas y usar las existentes. Se quitó la tarjeta y las tarjetas «Valor más alto / más bajo» (`#ext`) muestran ahora la silueta de la alcaldía y una frase con la unidad y la advertencia de la capa (15 asilos en Tlalpan: uno o dos cambian el orden; Milpa Alta tiene 0 asilos *registrados en el DENUE*; dependencia severa es conteo, no tasa).

**Contexto estatal y zonas (10:30).** Omar pidió más gráficas en otra sección de ¿Dónde?, «referentes a zonas, o otro mapa escogiendo el estado». Eligió las tres opciones propuestas:
1. Mapa de las 32 entidades con selector de indicador. Nueva sección 17 del notebook A: con `pobreza22.csv` (ENIGH 2022, programa del CONEVAL, fuente F23) se estiman por entidad seis indicadores de personas de 60+ con IC 90 % por diseño (linealización de Taylor, estratos `est_dis`, UPM `upm`). Todas las celdas tienen CV < 15 %. Validación: el mismo cálculo da 36.3 % de pobreza y 7.1 % de pobreza extrema nacionales, iguales a las del Comunicado 07/2023 del CONEVAL (consultado 08/10/2026). Se agrega el índice de marginación CONAPO 2020 (F22).
2. «La CDMX frente al país»: las 32 entidades ordenadas con su IC 90 % y la banda nacional. La lectura de la CDMX solo afirma diferencia cuando los intervalos no se traslapan.
3. «Zonas dentro de cada alcaldía»: cada AGEB urbana (CONEVAL 2020, `13_rezago_ageb_cdmx.csv`) como punto, por alcaldía, con promedio ponderado y rango p10–p90. Sin mapa porque el proyecto no tiene los polígonos de AGEB. Se excluyen 10 AGEB con datos suprimidos y 25 con menos de 100 habitantes.

Hallazgo de paso: en CONAPO 2020 un índice de marginación **más bajo** significa **más** marginación. El «11» de la imagen de referencia es el IM_2020 de Guerrero (10.99), el valor más bajo del país. Una frase como «el más alto índice de marginación con 11» invierte el sentido; en el Observatorio se dice «más marginada».

Contornos de los estados: `@svg-maps/mexico` 2.0.0 (CC BY 4.0), en `Frontend/vendor/svg-maps-mexico/` con `FUENTE.md`. Es un dibujo esquemático, no cartografía oficial.

Qué NO permite afirmar: tendencias (un solo año), nada por alcaldía con la ENIGH, ni necesidad de cuidado (son condiciones de la población de 60+). La carencia de seguridad social del CONEVAL cuenta como cubiertas a las personas con pensión no contributiva.

Archivos: `Analysis/A_oferta_y_territorio.ipynb` (sección 17), `Analysis/resultados/17_*.csv` (3), `Analysis/matrices/diccionario_observatorio.csv` (bloques `estados` y `zonas`), `Frontend/observatorio/build_datos.py`, `js/datos/*.js`, `datos_observatorio.json`, `index.html`, `js/vistas/territorio.js`, `js/vistas/territorio-estados.js` (nuevo), `css/graficas.css`, `css/vistas.css`. Las cifras que ya existían no cambiaron (se comparó `datos_observatorio.json` antes y después: solo se agregan `estados` y `zonas`). Verificado en Chromium a 1300 y 390 px, sin errores de JavaScript. **Pendiente: doble revisión por otra persona del equipo.**

## 9 oct 2026 — Segundo modelo: tipología de AGEB urbanas (notebook D, sección 18) y su capa en el Observatorio

Motivo: la UCA de Herramientas y Técnicas Avanzadas pide un modelo validado. El modelo 11 (focalización) responde «a quién», con datos nacionales; faltaba algo que informara «dónde» probar el relevo. Omar pidió un segundo modelo en notebook y luego sus gráficas en el Observatorio.

Datos nuevos: Censo 2020 por AGEB urbana de la CDMX (INEGI), bajado del servidor del INEGI y verificado por SHA-256 (`Analysis/datos/censo2020_ageb/FUENTE.txt`); Marco Geoestadístico 2025 (capas `09a` y `09mun`). Antes el proyecto no tenía polígonos de AGEB ni variables demográficas por AGEB: la sección 13 solo traía el rezago del CONEVAL.

Modelo: k-means sobre 9 indicadores del Censo en tres bloques (demanda de cuidado, cuidadoras en el hogar, capacidad de pago y acceso), fijados antes de modelar. k = 4 por estabilidad en 50 submuestras (criterio declarado antes de ver resultados). Comparado contra una regla de dos cortes (60+ × internet) y un índice de una dimensión (CP1).

Hallazgos (cifras en `Analysis/resultados/18_tipologia_*.csv`):
- La CDMX es un gradiente, no tipos naturales: la silueta real apenas supera la de una referencia sin grupos con la misma covarianza, y Ward y la mezcla gaussiana cortan distinto. Los tipos son una partición estable (ARI ≈ 0.97; 97.8 % de coincidencia al dejar fuera cada alcaldía), no un descubrimiento. Así debe decirse en la defensa.
- Contra el índice CP1 el modelo agrega poco (R² 0.53 contra 0.49); lo concreto es separar el tipo envejecido (3) del central (4).
- El 43.1 % de las personas de 60+ vive en el tipo 2; el tipo más envejecido en % (3) concentra el 18.7 %.
- 36.7 % de las viviendas del tipo 1 y 25.4 % del tipo 2 no tienen internet: la app sola excluye a una parte grande de esas zonas.
- 151 AGEB con 164,354 personas de 60+ tienen brecha de oferta (exploratorio; umbral convencional).

Decisión pendiente del equipo: si el programa tendrá un canal sin internet o declarará la exclusión; y si la sede del piloto se elige en el tipo 2 (propuesta del notebook, no decisión).

Qué NO permite afirmar: nada de personas (falacia ecológica); no se cruza con el modelo 11 (la ENASIC no tiene AGEB); no es acceso real (distancia en línea recta, sin precio ni cupo); datos de marzo de 2020.

Archivos: `Analysis/D_tipologia_territorial_ageb.ipynb` (nuevo), `Analysis/resultados/18_*` (11), `Analysis/figuras/f11`–`f14`, `Analysis/README.md`, `ML/README.md` (corregido: decía que no había modelos), `Analysis/matrices/diccionario_observatorio.csv` (bloque `tipologia`), `Frontend/observatorio/build_datos.py`, `js/datos/datos.js`, `js/datos/geo-ageb.js` (nuevo), `datos_observatorio.json`, `index.html`, `js/vistas/territorio-tipologia.js` (nuevo), `css/graficas.css`, `README.md`. Las cifras que ya existían no cambiaron. **Pendiente: doble revisión por otra persona del equipo.**


## 2026-10-08 (23:00) — La app se reestructura alrededor del relevo por horas (opción C)

**Qué pidió Omar.** "Reestructura la app con la opción C."

**Qué se hizo.** Se reescribió `Frontend/` (la app móvil, no el Observatorio) a partir de la copia del Project del 1 de octubre:
- **Entrada.** Canalización por la institución con 3 preguntas (horas, ayuda en actividades básicas, daños). Se retira el clasificador de texto libre (`js/clasificador.js`).
- **Focalización.** Regla ≥ 40 h/sem (notebook 11); con ayuda en actividades básicas, Prioridad 1. Las tasas de daño mostradas salen de `07_enasic_necesidad_vs_norma_estimaciones.csv` y se etiquetan como nacionales. Los casos bajo 40 h quedan "fuera de la regla" y la institución puede incluirlos con motivo escrito.
- **Asignación.** Solo restricciones (aprobada, certificada, cercanía entre alcaldías, días, horario, cupo, tareas). Se propone una persona. Se retira la suma ponderada (`js/matching.js`).
- **Paquete.** 3, 6, 9 o 12 h/sem, horario fijo, lista cerrada de tareas sin tareas clínicas, y quién paga (familia, subsidio o mixto).
- **Costo.** Salario mínimo profesional de trabajo del hogar ($342.47) con divisor por tipo de jornada, igual que el script 15. Mes = 4.33 semanas, igual que el script 10. Prestaciones en 0 % hasta que se defina el factor.
- **Seguimiento.** Llegada y salida, ausencias, incidentes en ambos sentidos, 2 preguntas semanales (cansancio y malas noches) y KPI operativos marcados SIMULADO, con exportación de agregados para el Observatorio.
- **Datos personales.** La familia ya no captura CURP; la institución valida identidad fuera de la app. CURP, identificación y carta de antecedentes solo del lado "Puedo cuidar".
- Red del hogar y territorio se conservan.

**Verificado.** Prueba en navegador (Chromium sin interfaz): canalizar, proponer y asignar, caso nocturno sin propuesta (explica qué restricción falla), registro y aprobación de relevo, visita, respuesta semanal, incidente, KPI, redes, ajustes. Sin errores de JavaScript. Se probó con un mapa de prueba, no con `cdmx-alcaldias.js` real.

**Pendiente.**
1. Confirmar que `Frontend/` local no cambió después del 1 de octubre; si cambió, revisar antes de reemplazar.
2. Daniel: vigencia del salario, arts. 60-61 de la LFT, factor de prestaciones para trabajo del hogar por horas y ley de datos aplicable según la institución.
3. Definir qué certificación se exige a las personas de relevo.
4. Quién paga: la app muestra el costo, pero la fuente del subsidio no existe.
5. Instrumento de cansancio para el piloto (Zarit corto, validación en México por confirmar).
6. Revisión del entregable por otra persona del equipo (doble revisión).

**Por qué no se dejó el matching ponderado como opción.** Pertenecía a la hipótesis de "encontrar cuidadora", que la evidencia descartó el 22 de septiembre (desconocer servicios explica menos del 1 % de la no búsqueda). Las entradas anteriores sobre el matching se dejan tal cual, por la regla de historia real.

## 2026-10-09 — Ajustes de interfaz a pedido de Omar

- Menos texto: listas de una mirada; el detalle se abre al tocar cada caso o persona de relevo.
- Íconos de mujer y hombre junto a cada nombre (se agrega `sexo` a casos y relevos; clave de almacenamiento `care-relevo-v2`). Nuevo KPI: % de cuidadoras mujeres.
- Redes se integra a Seguimiento (Visitas · Caso · Mapa · KPI). La app queda con 4 pestañas.
- Tres vistas de la lista de casos (lista, tarjetas, mosaico) para elegir una con el equipo.
- `confirm()`/`prompt()` se sustituyen por diálogos propios para que funcione como artefacto de Claude.

## 2026-10-13 (10:45 a 12:00, hora CDMX) — Modelo 11 ampliado: alternativas, diagnóstico y elección del objetivo

**Pedido de Omar.** Completar el modelo de focalización: justificar por qué se usaron regresión logística y gradient boosting y no otros modelos, agregar gráficas, llevarlo al Observatorio y comparar los objetivos «algún daño» y «salud física deteriorada».

**Qué se hizo.**
- `Analysis/B_enasic_cuidadoras.ipynb`, sección 11: se agregan las subsecciones 11 a 16. Las subsecciones 1 a 10 no cambian; sus cuatro CSV se reproducen con diferencia 0.
- Comparación contra cinco familias con el mismo protocolo: árbol de decisión, bosque aleatorio, lasso, red neuronal (MLP) y SVM. kNN se descarta de antemano porque no acepta pesos de muestra.
- Gráficas f15 a f20: alternativas, curvas de cobertura, ROC, calibración, importancia por permutación y comparación de objetivos.
- Cobertura con cupos de 10 %, 20 %, 30 % y 40.7 %.
- Verificación de la ventaja del modelo sin «le falta fuerza física».
- 11 CSV nuevos (`11_modelo_*` y `11_objetivo_*`).
- Observatorio, pestaña «¿A quién primero?»: bloque nuevo (`js/vistas/focalizacion-ampliado.js`, bloque `modelo2` en `build_datos.py`, tres filas nuevas en `diccionario_observatorio.csv`).

**Hallazgos** (cifras en `resultados/11_modelo_alternativas.csv`, `11_objetivo_sin_fuerza.csv` y `11_objetivo_decision.csv`).
1. Con «algún daño», ninguno de los 8 puntajes se separa de la regla de 40 h.
2. Con «salud física», todos la superan, de +13.0 a +18.5 pp, pero entre ellos no se pueden ordenar.
3. El árbol de decisión de profundidad 3 rinde igual que los modelos elegidos.
4. La ventaja del modelo con «salud física» (+12.7 pp, IC 90 % de 2.5 a 22.9) baja a +9.1 pp (IC de −2.6 a 20.9) sin «le falta fuerza física»: deja de ser demostrable. Esa variable funciona casi como el mismo objetivo.
5. Con los dos objetivos, el modelo baja mucho la cobertura de quien cuida solo a una persona de 60+ sin discapacidad (−29.3 y −23.9 pp).

**Advertencia registrada.** Elegir «salud física» porque ahí gana el modelo sería razonamiento circular. Los criterios de elección son:
- qué puede cambiar el relevo;
- qué mide el piloto (la app pregunta por cansancio y malas noches, entrada del 8 oct);
- tamaño, precisión y equidad.
Con esos criterios, los datos inclinan hacia «algún daño» y hacia la regla de 40 h, que ya usa la app.

**Decisión pendiente (equipo).** Esta entrada no la toma.
1. Qué objetivo se adopta.
2. Si el modelo que se presenta como explicable a la institución es la logística o el árbol.

**Pendiente.**
1. Doble revisión del notebook B, sección 11, y del bloque nuevo del Observatorio por alguien distinto a quien lo produjo.
2. Ningún modelo se afinó (sin validación anidada).
3. Si se adopta «salud física», hay que agregar la pregunta al seguimiento de la app.

**Ejecución.** El notebook B se ejecutó completo (Restart & Run All) con scikit-learn 1.9.1, sin errores. Respaldo de todo lo modificado en `_to_delete/backup_pre_modelo11_ampliado_2026-10-13/`. En `herramientas/` de ese respaldo queda el script que insertó las celdas.

## 2026-10-13 (11:40, hora CDMX) — Observatorio: costo del relevo por tipo de jornada (script 19)

**Qué pidió Omar.** Agregar a «¿Cuánto cuesta?» la única gráfica que no depende de los datos financieros que faltan.

**Por qué solo esta.** Las cuatro gráficas de la sección salen del script 10, que hay que rehacer con prestaciones y hora nocturna. Agregar más gráficas sobre esa base multiplica lo que habrá que rehacer. Lo que falta para el estudio de negocio (nómina, verificación, inversión, punto de equilibrio) no pertenece al Observatorio.

**Qué se hizo.**
- `Analysis/19_costo_hora_por_jornada.py` → `resultados/19_costo_hora_por_jornada.csv`: hora ordinaria diurna $42.81, mixta $45.66 (+6.7 %), nocturna $48.92 (+14.3 %); 6 h/sem: $1,112, $1,186 y $1,271 al mes. Control: la fila diurna coincide con el script 10.
- `build_datos.py` lee el archivo nuevo (bloque `jornada`); `matrices/diccionario_observatorio.csv` documenta el bloque.
- `index.html` y `js/vistas/relevo.js`: tarjeta «¿Cambia el costo si el relevo es de noche?» con selector de 3 a 12 h/sem, marcada «pendiente de doble revisión».
- Probado en navegador sin interfaz (escritorio y 390 px): sin errores de consola.

**Qué NO permite afirmar.** Costo real total (sin prestaciones ni IMSS) ni cuántos hogares pueden pagar el relevo nocturno.

**Nota.** El script 15 (anuncios) y su resultado existen en el Project pero no en esta carpeta local; el script 19 reproduce su regla de divisores sin depender de él.

**Pendiente.**
1. Daniel: verificar arts. 60, 61 y 333 de la LFT en el DOF. Si cambian los divisores, se corre el script 19 y `build_datos.py`.
2. Factor de prestaciones para trabajo del hogar por horas y carga patronal real (calculadora del IMSS). Con eso se rehacen los scripts 10, 06 y 14.
3. Doble revisión de la tarjeta por otra persona del equipo.
4. Confirmar la cifra de la solicitud CDMX ($6,747.7 mdp) contra el decreto aprobado.


## 2026-10-14 (10:10, hora CDMX) — Observatorio: tarjeta «Cada modelo responde a una decisión» en Método

**Qué pidió Omar.** Reunir en un solo lugar del Observatorio qué decisión informa cada modelo (dónde, a quién, en qué orden), para la defensa. La idea viene de comparar el Observatorio con un artifact ilustrativo, «ML en el Observatorio del Cuidado», hecho con datos sintéticos.

**Qué se hizo.** Tres tarjetas al inicio de Método. Para cada decisión dicen el modelo, la alternativa simple, qué mostró la comparación y qué no permite afirmar. Las cifras se leen de `D.tipologia` y `D.modelo2`; no hay cifras escritas a mano ni datos nuevos.

**Decisión de contenido.** «¿En qué orden?» aparece explícitamente **sin modelo**. Hoy se responde con conteos de personas de 60+ en AGEB con brecha. No se agregó un índice de prioridad (PCA u otro): sus pesos son una decisión normativa y solo se justifica si cambia el orden que dan los conteos. Queda como pregunta abierta para el equipo.

**Qué NO cambia.** Ninguna cifra existente. Los dos modelos siguen pendientes de doble revisión, y la tarjeta lo dice.

**Pendiente.**
1. Doble revisión de la tarjeta por alguien distinto a quien la hizo.
2. Decisión del equipo: ¿hace falta un índice de prioridad para «¿en qué orden?», o bastan los conteos?


## 2026-10-14 (10:20, hora CDMX) — Observatorio: colores de «¿Cuánto cuesta?»

**Qué pidió Omar.** Que los colores de «¿Cuánto cuesta?» se parezcan a los del resto del Observatorio.

**Qué se hizo.** Las series de la pestaña dejan el verde y el ámbar y pasan a la paleta lila y tinta de las otras pestañas. El rojo sigue marcando lo que rebasa el tope o el presupuesto. Solo cambia `js/vistas/relevo.js`; ninguna cifra cambia. El detalle está en el README del Observatorio.

**Pendiente.** Revisión visual por otra persona del equipo.


## 2026-10-14 (11:15, hora CDMX) — Documento técnico del Observatorio v1.0

**Qué pidió Omar.** Un documento técnico del Observatorio: con qué está hecho, qué tecnologías usa, cómo está formada cada pestaña, cómo se hacen las gráficas (Python o JS), por qué existe cada pestaña y cómo se conectan las piezas. Debía seguir el formato de los demás documentos.

**Qué se hizo.** `Documentos/Observatorio_Cuidado_Documento_Tecnico_v1.docx` (28 páginas), con el formato de la Guía del tablero v1.0. Las fuentes para regenerarlo están en `Documentos/documento_tecnico/`: `build_documento_tecnico.js`, las figuras y su HTML. Todo se comprobó en el código del 14 oct. Los conteos se midieron abriendo la página en Chromium sin interfaz: 36 gráficas, 41 bloques de D y ≈ 2.7 MB.

**Respuesta central.** Todas las gráficas y mapas se dibujan en el navegador con JavaScript propio, como SVG. Python solo prepara los números y proyecta los contornos de las AGEB. Matplotlib solo genera las figuras de Word y PowerPoint.

**Hallazgos técnicos (sección 7 del documento). No se corrigieron.**
1. La fecha «Actualizado 6 oct 2026» está escrita a mano en `index.html` y en `build_datos.py`.
2. Hay dos textos con números escritos a mano: «con 1,043 personas» en `index.html` y «por debajo de 5%» en `barreras.js`. Hoy coinciden con los datos.
3. No existe `.git` en la carpeta local.
4. Hay código sin uso: la sección «Lo que encontramos» de `inicio-3d.js` y ocho funciones de `componentes.js`.
5. El README está desfasado: habla de tres vistas del comparador, de «Lo que encontramos» y de la numeración vieja de los scripts.
6. No hay pruebas automatizadas.
7. Las tipografías se cargan de Google Fonts.

**Pendiente.** Doble revisión del documento por Daniel o Alondra Danae. Decidir qué hacer con los puntos 1 a 3.


## 2026-10-15 (10:25 a 10:45, hora CDMX) — Modelo de sostenibilidad de la opción C (script 20)

**Qué pidió Omar.** Confirmó que el Observatorio es el tablero de la UCA de Inteligencia de Negocios y pidió elaborar el modelo de sostenibilidad para Analítica para los Negocios.

**Por qué se rehízo en vez de reutilizar el del estudio de negocio v0.2.** Ese modelo calculó el subsidio para 20 h y 40 h/semana (otro producto). La opción C es relevo por horas (3 a 12 h/semana). Las conclusiones de "el subsidio no cabe en la ciudad" (45.8 % de la solicitud CDMX) valen para media jornada, no para el relevo.

**Qué se hizo.**
- `Analysis/20_modelo_sostenibilidad.py` lee los CSV de `resultados/` (03, 04, 05, 06, 07, 14, 16 y 19) y escribe:
  - `resultados/20_modelo_sostenibilidad.xlsx`: libro con fórmulas vivas y seis hojas (Resumen, Supuestos, Unitario, Escalas, Costo evitado, Límites). Cuatro selectores en Supuestos: horas, jornada, carga laboral y fuente del ingreso.
  - `resultados/20_sostenibilidad_escenarios.csv`: los mismos cálculos hechos en Python.
- Lo único escrito a mano son supuestos declarados: carga del 22 % (script 06), aguinaldo, vacaciones y prima (LFT, por verificar), umbral del 20 % del ingreso y las rejillas ilustrativas (aceptación, operación, tamaño del piloto, valor evitado).

**Resultados con los parámetros base** (6 h/semana, jornada diurna, carga 22 %, ingreso ENASIC).
1. Costo laboral: $1,357 al mes por hogar. Lo paga íntegro un hogar con ingreso de $6,784 o más (convención del 20 %).
2. Subsidio laboral promedio ponderado por el perfil del grupo del problema: $171 por hogar-mes con ingreso ENASIC y $0 con ingreso ENIGH CDMX. La fuente del ingreso mueve el resultado más que cualquier supuesto de costo.
3. Escala CDMX (inferida, no medida): ≈ 70,557 hogares elegibles (razón nacional grupo del problema / hogares con necesidad aplicada a los 1,407,522 hogares de la ENIGH). Con aceptación del 25 % (ilustrativa), el subsidio laboral anual sería de 36.2 mdp (0.5 % de la solicitud CDMX); con la cota máxima de aceptación (64.1 %), 92.8 mdp (1.4 %).
4. Escenario C (pagador por costo evitado): con un valor evitado de $100,000 al año por salida del empleo, el relevo tendría que reducir la probabilidad de salida en 16.3 pp solo por su costo laboral. Con $20,000 el efecto exigido (81 pp) supera la prevalencia declarada de daño al trabajo (47.7 %): no puede cumplirse.

**Decisión de diseño: no se calcula un punto de equilibrio.** El costo de operación (coordinación, verificación y formación, plataforma, nómina) sigue POR DETERMINAR. En su lugar, el modelo da el financiamiento externo total como función del costo de operación por hogar-mes (celda `opex_real` en Supuestos, vacía a propósito) y de la aceptación.

**Lectura que cambia.** Bajo la convención del 20 %, el precio del relevo deja de ser la barrera principal de financiamiento. Eso no implica que los hogares lo contraten: hoy contrata 1.0 % de los hogares con necesidad y 35.9 % de las cuidadoras de disc./60+ no contrataría a nadie. La sostenibilidad depende de la aceptación y de la operación, y esas dos cosas las mide el piloto (H1 contra H2).

**Verificación.**
- El libro se recalculó con LibreOffice y se comparó contra el cálculo independiente en Python: costo unitario (36 combinaciones), escala CDMX, financiamiento total (12 celdas), escenario C (16 celdas) y piloto. Diferencia 0, sin errores de fórmula.
- Se probó un segundo conjunto de selectores (12 h, nocturna, carga ampliada, ingreso ENIGH, operación de $400): las fórmulas responden como el cálculo a mano.
- Respaldo de la bitácora previo a esta entrada: `/tmp/bitacora_respaldo_antes_modelo20.md` (sesión de Claude; no está en la carpeta).

**Qué NO permite afirmar.** Punto de equilibrio, disposición a pagar, cifras medidas de la CDMX, ni que el relevo reduzca el daño o la salida del empleo. La asequibilidad hereda los límites del script 10: sin séptimo día ni descansos de jornadas por horas.

**Estado de revisión.** Sin revisión de otra persona.

**Pendiente.**
1. Doble revisión del script 20 y del libro por Daniel o Alondra Danae.
2. Daniel: arts. 60, 61, 76, 80 y 87 de la LFT en el DOF, y factor de prestaciones para trabajo del hogar por horas.
3. Decisión del equipo: fuente del ingreso (ENASIC o ENIGH), que hoy mueve el subsidio de $171 a $0.
4. Costo de operación, nómina del Observatorio y sede del piloto (alimentan `opex_real` y el tamaño del piloto).
5. Contrastar la solicitud CDMX ($6,747.7 mdp) con el decreto aprobado.


## 2026-10-15 (10:50, hora CDMX) — Modelo de sostenibilidad en notebook (20_modelo_sostenibilidad.ipynb) y corrección a la entrada anterior

**Qué pidió Omar.** Hacer el modelo en ipynb.

**Qué se hizo.**
- `Analysis/20_modelo_sostenibilidad.ipynb`: el mismo modelo, con las cifras leídas de `resultados/` (03, 04, 05, 06, 07, 14, 16 y 19), supuestos declarados, cinco figuras (`figuras/f21` a `f25`) y una lectura con los parámetros base generada desde las celdas. Ejecutado completo (Restart & Run All) sin errores.
- Sección nueva, **sensibilidad de un factor a la vez** (no estaba en el libro de Excel): muestra qué mueve más el subsidio laboral promedio.
- Sección 8, **control**: el notebook recalcula las 75 filas de `20_sostenibilidad_escenarios.csv` (las del script 20) y se detiene si no coinciden. El script sigue generando el libro de Excel con fórmulas vivas; el notebook es el análisis reproducible.

**Corrección a la entrada de las 10:25.** Esa entrada decía que la fuente del ingreso "mueve el resultado más que cualquier supuesto de costo". La sensibilidad muestra que lo que más mueve el subsidio laboral promedio (base $171 por hogar-mes) son las **horas de relevo** (12 h: +$755; 3 h: baja a $0) y el **umbral de asequibilidad** (10 %: +$292; 30 %: baja a $0). La fuente del ingreso (ENIGH CDMX: baja a $0) pesa igual que esos dos, y la carga laboral y la jornada nocturna mueven menos (de −$97 a +$76). El texto del script 20 y del libro quedó ajustado; la entrada anterior se deja tal cual, por la regla de historia real.

**Consecuencia.** Casi todo lo que decide el subsidio son decisiones de diseño del equipo (cuántas horas, qué umbral, qué fuente de ingreso), no datos. Eso hay que decirlo así en la defensa.

**Estado de revisión.** Sin revisión de otra persona. Pendientes: los de la entrada anterior.


## 2026-10-20 (10:30, hora CDMX) — Data warehouse del Observatorio: esquema estrella, data marts y ETL (carpeta DW/)

**Qué pidió Omar.** Construir el modelo estrella, el data mart y el ETL formal (UCA Inteligencia de Negocios, que exige un almacén, un esquema estrella, al menos un data mart, ETL y fuentes internas y externas).

**Decisiones de diseño y motivo.**
1. **SQLite en un archivo (`DW/observatorio_dw.sqlite`), sin servidor.** `Backend/` sigue sin decisión de arquitectura. El archivo se regenera; git lo ignora. Los marts se exportan a CSV para Excel y Power BI.
2. **El ETL integra los resultados de los notebooks; no recalcula encuestas.** La varianza de la ENASIC (linealización, estratos, UPM) no se reproduce en SQL. Cargar microdatos al almacén también chocaría con la regla de no subir datos personales ni seudonimizados.
3. **Cuatro hechos, uno por grano:** estimaciones de encuesta (965 filas), medidas territoriales (878), asequibilidad (150) y costo de paquetes (50). Diez dimensiones, cuatro de ellas conformadas (tiempo, fuente, geografía, precisión).
4. **Tres data marts:** necesidad de cuidado (ENASIC, solo nacional), territorio y oferta (alcaldía y entidad) y asequibilidad (nacional y CDMX).
5. **Reglas del proyecto como código:** el ETL falla si una cifra está en un nivel geográfico más fino que el de su fuente (probado con una cifra ENASIC en Iztapalapa); las alcaldías sin dato no tienen fila (no se rellenan con 0); `v_cobertura_temporal` marca si una fuente admite series.
6. **Lo que no se modeló:** desempeño operativo y financiero de la plataforma (no hay datos ni sede de piloto), los escenarios de los scripts 19 y 20 (son salidas de modelo, no observaciones), puntos del DENUE y AGEB individuales.

**Qué se hizo.** Archivos nuevos en `DW/`: `sql/` (esquema, vistas de marts, 8 consultas OLAP), `etl/run_etl.py` y `etl/config_mapeo.py`, `docs/` (modelo dimensional, especificación del ETL, diccionario, resultados OLAP), `marts/` (8 CSV), `logs/`. Se agregó una fila a `README.md` y `DW/observatorio_dw.sqlite` a `.gitignore`. Respaldo de la bitácora previo a esta entrada: `/tmp/bitacora_respaldo_antes_dw.md` (sesión de Claude; no está en la carpeta).

**Verificación.** 0 filas rechazadas; 18 de 20 pruebas de calidad pasan; 11 de 11 cifras clave de `datos_observatorio.json` aparecen en el almacén con el mismo valor y total expandido; la población de la CDMX del Censo 2020 suma 9,209,944; el núcleo de oferta suma 235 (bitácora del 20 sept); las abreviaturas de alcaldía se validaron contra otro archivo (12 de 12 coinciden).

**Hallazgos que la corrida dejó abiertos.**
1. **49 intervalos de confianza fuera de [0,100]** (hasta −1.41 y 13.24) en los scripts 03, 04, 07, 12 y 12b. El Observatorio recorta las barras a 0, pero el dato guarda el valor. Decisión pendiente: recortar al presentar o cambiar el método de intervalo.
2. **`oferta_por_alcaldia.csv` pone 0 plazas donde la ficha dice «sin dato»** (Cuajimalpa, Tláhuac, V. Carranza) y omite Milpa Alta. Solo lo lee `eda_fuentes.py`. No se cargó.
3. **El archivo «Población de más de 60 años» (año «desconocido» en la ficha) coincide con el Censo 2020** en las 16 alcaldías (diferencia máxima 0.003 pp). No se reetiquetó su periodo: eso lo decide el equipo y se registraría aquí.
4. **Ninguna fuente admite series de tiempo** (0 de 12 combinaciones fuente-hecho con dos periodos).
5. En `12b_segmentacion_series.csv` la columna `pct` mezcla porcentajes, horas y diferencias en pp; el almacén guarda la unidad por indicador.

**Qué NO permite afirmar.** Que el Observatorio «se alimenta del almacén»: `build_datos.py` sigue leyendo `Analysis/` y el almacén corre en paralelo, reconciliado. Tampoco permite cruces que ningún notebook calculó (el almacén no es un cubo libre) ni tendencias. 20 de 49 definiciones de medidas territoriales están sin verificar contra su notebook (`definicion_verificada = 0`).

**Estado de revisión.** Sin revisión de otra persona. Alondra Danae lidera Inteligencia de Negocios; la asignación del revisor es del equipo.

**Pendiente.**
1. Doble revisión del esquema, el ETL y las 20 definiciones sin verificar.
2. Decidir si `build_datos.py` pasa a leer los marts.
3. Decidir sobre los 49 intervalos y sobre el periodo del archivo de población 60+.
4. Sede de práctica y datos operativos, para modelar el hecho de servicio prestado.
5. Prueba automatizada del ETL con datos de ejemplo.

## 2026-10-20 (10:40, hora CDMX) — Objetivo primario del modelo de focalización y escalera de métodos (script 21)

**Pedido de Omar.** Replantear el modelado para la unidad de Herramientas y Técnicas Avanzadas: modelo central «La cuidadora no busca ayuda, así que hay que encontrarla» (detectar y priorizar cuidadoras de alta intensidad para el relevo por horas), con objetivo primario **salud física deteriorada**.

**Decisión.** El objetivo primario pasa a ser salud física deteriorada. Este cambio se registra como cambio: el notebook 11 (bitácora del 13 oct) concluía que los datos «inclinan hacia algún daño». La elección de salud física se tomó el 20 oct con criterio de decisión (gravedad y relación con las horas), **pero después de ver los resultados del notebook 11**. Por eso todo lo que sigue es **exploratorio, no confirmatorio**. «Algún daño» se conserva como comparación. Contra la elección pesa que el piloto hoy mide cansancio y malas noches, no salud física (bitácora del 8 oct).

**Qué se hizo.**
- `Analysis/21_priorizacion_cuidadoras.py` (el número 16 ya estaba ocupado). No modifica el notebook 11.
- Escalera: R0 azar, R1 regla ≥40 h, R2 regla compuesta (≥40 h y ≥2 actividades básicas, fijada a priori), R3 tarjeta de puntos (L1 con puntos enteros), R4 regresión logística, R5 gradient boosting.
- Validación: StratifiedGroupKFold por UPM, 5 particiones × 20 repeticiones; pesos FAC_CUI normalizados a media 1; cupos de 10 %, 20 % y 40.7 %; bootstrap de UPM dentro de estrato sobre puntajes fuera de muestra (no reentrena).
- Sensibilidades: sin «le falta fuerza física»; sin esa y sin «requiere apoyo»; class_weight=balanced.
- Salidas: `Analysis/resultados/21_escalera_global.csv`, `21_escalera_bootstrap_upm.csv`, `21_escalera_auc.csv`, `21_calibracion_logit.csv`, `21_escalera_por_grupo.csv`, `21_tarjeta_puntos.csv`. No se subieron microdatos; la caché de puntajes por persona quedó fuera del repositorio.
- Reproduce cifras previas: 40.7 % de la regla, 23.5 % con salud física deteriorada (222 casos), 62.2 % con algún daño, cortes de quintil del notebook 11.

**Hallazgos** (nacional, ENASIC 2022; cupo 40.7 %, diferencia de cobertura contra la regla, IC90 por linealización).
1. Regla compuesta: +3.7 pp (−5.2 a +12.5). No se separa de la regla de horas.
2. Tarjeta de puntos +16.2 pp (7.0 a 25.3), logística +12.3 pp (2.1 a 22.5), boosting +16.5 pp (6.3 a 26.6). Las diferencias entre los tres son menores que su incertidumbre: **no se puede ordenar a los métodos entre sí**.
3. La tarjeta da 5 puntos a «le falta fuerza física», 3 a «requiere apoyo» y 2 a ≥40 h. Ambas variables pueden ser consecuencia de cuidar.
4. Sin «le falta fuerza física» la ventaja de la logística es +8.7 pp (−3.0 a 20.5); sin ella y sin «requiere apoyo», +8.1 pp (−5.0 a 21.2): deja de ser demostrable al cupo de 40.7 %. Con cupos de 10 % y 20 % la ventaja sin «falta fuerza» se mantiene; quitando también «requiere apoyo» solo se mantiene al 20 %.
5. Con «algún daño» ningún método supera a la regla (intervalos por linealización incluyen el cero; el bootstrap da intervalos más angostos porque no incluye la variabilidad del entrenamiento, se toma el más ancho).
6. class_weight=balanced no cambia el resultado (+12.7 pp contra +12.3 pp).
7. Calibración de la logística para salud física: sobreestima en los deciles altos (predice 49 % y 34 %, observa 41 % y 24 %). Contradice la lectura del notebook 11 de que las probabilidades «se pueden leer como porcentajes».
8. Por grupo (cupo 40.7 %): «solo 60+ sin discapacidad» (39 casos) pierde cobertura (logística 40.4 % contra 64.3 % de la regla); en parte es artefacto del cuestionario. Hombres (40 casos): logística 45.1 % contra 55.5 %.

**Qué NO permite afirmar.** Que salud física sea el objetivo correcto; que priorizar con el puntaje beneficie a las cuidadoras o que el relevo reduzca el daño; nada sobre la CDMX; una ventaja del método «avanzado» frente a la tarjeta de puntos. Con 222 casos y muchas comparaciones, los intervalos que apenas excluyen el cero no son sólidos.

**Estado de revisión.** Sin revisión de otra persona. Las cifras no deben citarse en el informe ni en la presentación hasta que alguien distinto a quien las produjo las revise.

**Pendiente.**
1. Doble revisión del script 21 y sus resultados.
2. Decidir el modelo candidato: la tarjeta de puntos rinde igual que los modelos y se explica sin computadora.
3. Decidir si la tarjeta se presenta con o sin las variables «le falta fuerza física» y «requiere apoyo».
4. Verificar las definiciones de REQUIERE_APOYO, FALTA_FUERZA y CUIDA_MENORES.
5. Actualizar `ML/README.md` y el plan de modelado (v3, que aún no refleja la ampliación del 13 oct ni este objetivo) tras la decisión del punto 2.
6. Confirmar con la profesora si el matching es obligatorio para el entregable (el Estudio de Negocio v0.2 lo marca «prematuro»).


## 2026-10-20 (hora CDMX) — Observatorio: «¿Cuánto cuesta?» se actualiza con el script 20

**Qué pidió Omar.** Corregir la pestaña «¿Cuánto cuesta?» según lo más reciente, si algo era distinto.

**Qué se encontró.** Las cifras de la pestaña coincidían con los CSV (el JSON se regeneró idéntico). Lo desactualizado era el alcance: el modelo de sostenibilidad del 15 oct (script 20) no estaba en el Observatorio, y la tarjeta de subsidio seguía calculando media jornada y jornada completa (script 06) con 1,099,461 hogares, cuando la opción C es relevo de 3 a 12 h y la ENIGH 2022 mide 1,407,522.

**Qué se hizo.**
- `build_datos.py` lee `20_sostenibilidad_escenarios.csv` (bloque `sostenibilidad`); `diccionario_observatorio.csv` lo documenta.
- Tarjeta de jornada: selector de carga laboral (0 %, 22 %, 30.2 %), por defecto sin carga.
- Tarjeta de subsidio: financiamiento anual del relevo en la CDMX por aceptación y costo de operación, contra la solicitud. Reemplaza al cálculo de 20 h y 40 h, que corresponde al estudio de negocio v0.2 y no al relevo.
- Texto de encabezado ajustado: las gráficas de asequibilidad siguen sin carga laboral.

**Qué NO permite afirmar.** Punto de equilibrio, disposición a pagar, cifras medidas de la CDMX. Aceptación y operación son ilustrativas. La carga del 22 % y los artículos de la LFT siguen por confirmar.

**No se tocó.** Las cuatro gráficas de asequibilidad (script 10) siguen sin prestaciones; rehacerlas exige el factor de prestaciones (pendiente de Daniel).

**Estado de revisión.** Sin revisión de otra persona. Pendiente: doble revisión de las dos tarjetas y prueba a 390 px.

## 2026-10-20 (11:05, hora CDMX) — Se revierte el objetivo primario: vuelve «algún daño» (DEC-OBJ-001)

**Pedido de Omar.** Registrar la decisión del objetivo primario del modelo de focalización y mantener el script 21 como exploratorio.

**Decisión.** Primario: `DANO_ALGUNO`. Sensibilidad: `DANO_SALUD_FISICA` («Declara deterioro de su propia salud física por cuidar»). **Revierte la decisión de la entrada de las 10:40 de este mismo día**, que fijaba salud física como primaria. Esa entrada se deja tal cual, por la regla de historia real.

**Tipo de registro.** Posterior a la exploración, no preregistro. Ya existían los resultados del notebook 11 (sección 11 de `B_enasic_cuidadoras.ipynb`) y del script 21 cuando se tomó. No hay `.git` en la carpeta, así que no se puede comprobar con historial de commits cuándo se fijó el diseño; solo queda el respaldo `_to_delete/backup_pre_modelo11_ampliado_2026-10-13/`.

**Motivo.**
1. Los criterios del 13 de octubre (qué puede cambiar el relevo, qué mide el piloto, tamaño, precisión y equidad) apuntaban a «algún daño». La entrada de las 10:40 los sustituyó por «gravedad y relación con las horas» después de ver los resultados. «Relación con las horas» sale del rendimiento observado, y la «gravedad» no se midió.
2. El seguimiento de la app (entrada del 8 oct, 23:00) pregunta cansancio y malas noches, que son componentes de `DANO_ALGUNO`; no pregunta salud física. El mapeo es aproximado: la ENASIC y la app usan instrumentos distintos.
3. El grupo del problema (H11) del Observatorio se define con `DANO_ALGUNO`, y el indicador de empleo del Estudio de Negocio es laboral, dimensión que salud física no contiene.
4. Precisión (estándar CV de INEGI): ambos elegibles, ALGUNO más preciso (CV de prevalencia 3.3 % contra 7.9 %; en subgrupos, la regla es «moderada» en 1 de 11 grupos con ALGUNO y en 6 de 11 con salud física). Definición: ambos claros en código; texto literal de los ítems sin verificar.
5. Elegir el desenlace donde el modelo luce mejor, después de verlo, es selección por el resultado. El único criterio que favorece a salud física es el del rendimiento del modelo.

**Lo que esto implica reportar.**
- Con `DANO_ALGUNO` el modelo no supera de forma demostrable a la regla de 40 h: +2.2 pp (IC 90 % −4.1 a 8.5); la regla basta. Es un resultado válido.
- Con salud física hay ventaja (+12.7 pp, IC 90 % 2.5 a 22.9), pero depende de «le falta fuerza física»: sin ella, +9.1 pp (−2.6 a 20.9). Se reporta como **sensibilidad exploratoria**, con la advertencia de selección posterior al resultado.
- **Script 21:** todo su contenido sigue siendo **exploratorio, no confirmatorio**, con cualquiera de los dos objetivos. Sus cifras no se citan en el informe ni en la presentación hasta tener revisión de otra persona.
- Se reportan ambos objetivos aunque el resultado sea nulo, y siempre contra la regla de 40 h.

**Qué NO se midió.** `DANO_TRABAJO` no se evaluó como modelo; correrlo ahora abriría otro camino después de ver los resultados.

**Pendiente.**
1. Doble revisión (Daniel o Alondra Danae). Decisión de Omar, **sin confirmación del equipo**.
2. Texto literal de `P6_11_1` y `P6_30_1` en el cuestionario, y si `P6_30`/`P6_31` (bloque 0-17 y 60+ sin discapacidad) atribuyen el daño solo al cuidado de personas mayores; es probable que incluyan menores, por analogía con `P6_26`.
3. Si el equipo prefiere salud física, la entrada de las 10:40 debe completarse: «relación con las horas» es un criterio derivado del rendimiento, y habría que agregar la pregunta de salud física al seguimiento de la app.
4. Actualizar `ML/README.md` y el plan de modelado con este objetivo.

**Estado de revisión.** Sin revisión de otra persona registrada.

## 2026-10-20 (11:15, hora CDMX) — Documentación sincronizada con el contenido real de la carpeta

**Pedido de Omar.** Actualizar los documentos con lo que realmente hay en la carpeta.

**Qué se hizo.** Se listó `Downloads\pp26-2` completo y se reescribieron o completaron los documentos de índice. No se tocó código, datos, resultados ni el Observatorio. Respaldo previo en `_to_delete/backup_pre_sync_docs_2026-10-20/`.
- `README.md`: estado al 20 oct y tabla de carpetas. Se quitó `ERP/` (no existe). Se agregaron `Frontend/observatorio/`, `enut2024_participacion_laboral/`, `animaciones/`, `Claude outputs/`, `_to_delete/`, archivos sueltos de la raíz y el orden de reproducción.
- `Analysis/README.md`: inventario con lo que escribe cada notebook o script; scripts 20 y 21; qué no está en la carpeta (sección 15, scripts sueltos 01–14, plan de modelado v3).
- `ML/README.md`: script 21 y ENUT 2024 en la tabla, objetivo vigente (DEC-OBJ-001), sección «No son modelos de aprendizaje» (scripts 19 y 20). Se corrigió la mención a `Frontend/js/clasificador.js`.
- `Documentos/README.md`: inventario con la versión vigente de cada serie, las superadas y los archivos ajenos.
- `Frontend/README.md`: decía que `clasificador.js` y `matching.js` «siguen en el historial de Git». No hay git; las copias están en `_to_delete/`.
- `ESTADO_SINCRONIZACION.md`: sección nueva con las rutas que cambiaron y el desfase con el Project de claude.ai.

**Hallazgos que quedan abiertos** (ninguno se resolvió en esta entrada).
1. **Trabajo sin entrada en esta bitácora:** el subproyecto `Analysis/enut2024_participacion_laboral/` (15 oct), `Analysis/animaciones/` (15–16 oct), `Observatorio_Cuidado_Guia_Tablero_v1.docx` (10 oct), `Proyecto_Economia_del_Cuidado_Avance1_completo.pdf` (2 oct) y `bitacora_pendiente_2026-10-08_razones_portada.md`, que sigue sin integrarse. Quien los hizo debe registrar qué son, para qué decisión sirven y quién los revisa. Desde aquí no se puede reconstruir eso sin inventarlo.
2. El docstring de `Analysis/21_priorizacion_cuidadoras.py` todavía declara «salud física» como objetivo primario. DEC-OBJ-001 (11:05) lo revirtió.
3. `Observatorio_Cuidado_Documento_Tecnico_v1.docx` (14 oct) es anterior a los scripts 20 y 21, al DW y a DEC-OBJ-001.
4. `Documentos/` contiene un proyecto de C++ de 2015 (`main.cpp`, `actividad 2.exe`, etc.) ajeno al Observatorio.
5. `.gitignore` no cubre `_to_delete/` ni `*.tgz` (`_obs_snapshot.tgz`, 7.9 MB, en la raíz).
6. El Project de claude.ai está desfasado (sus textos son del 1 al 6 oct) y por encima de su límite de conocimiento (2,032,330 de 2,000,000), en parte por la carga de microdatos y catálogos ENASIC del 20 oct a las 10:31. Detalle en `ESTADO_SINCRONIZACION.md`.

**Estado de revisión.** Sin revisión de otra persona.

## 2026-10-20 (11:25, hora CDMX) — Intento de quitar la ENASIC del Project; corrección a la entrada de las 11:15

**Pedido de Omar.** Quitar del Project de claude.ai los microdatos y catálogos ENASIC.

**Qué se pudo hacer.** Se borraron los 2 documentos de texto ENASIC que el Project tenía como «doc» (`metadatos_enasic_2022.txt` de `tcsdempo` y de `thog_unip`). Los CSV de catálogos, los `conjunto_de_datos_*.csv`, los diccionarios, las imágenes ER y `conjunto_de_datos_enasic_2022_csv.zip` son archivos subidos («files»). La herramienta de Claude no puede borrar archivos subidos: hay que quitarlos a mano en claude.ai, dentro del Project, en la ruta `pp26-2/Analysis/datos/enasic/`.

**Corrección a la entrada de las 11:15 (hallazgo 6).** Esa entrada atribuía el exceso de conocimiento del Project «en parte» a la carga ENASIC. Eso no se verificó. Después de borrar los 2 documentos y de subir la bitácora actualizada (192 KB), el contador pasó de 2,032,330 a 2,064,633. Es probable que el contador mida solo los documentos de texto y no los archivos subidos: así lo sugiere que subiera junto con la bitácora. Si es así, quitar la ENASIC no basta para bajar del límite. Lo que sí cuenta son los documentos de texto obsoletos del 1 al 6 oct (`Frontend/vendor/d3.min.js`, `Frontend/observatorio/datos_observatorio.json` e `index.html` viejos, `plantilla.html`, `clasificador.js`, `matching.js` y los scripts 01–14). Borrarlos queda pendiente de decisión.

## 2026-10-20 (11:35, hora CDMX) — Limpieza del Project y de la carpeta

**Pedido de Omar.** Borrar los documentos obsoletos del Project y «lo innecesario» de la carpeta. De la carpeta eligió tres grupos: basura técnica, el proyecto C++ de 2015 y **toda** `_to_delete/`.

**Qué se hizo.**
- Project: 20 documentos borrados (ver `ESTADO_SINCRONIZACION.md`). El conocimiento pasó de 2,064,633 a 1,257,738 de 2,000,000.
- Carpeta: se borraron `_to_delete/` (217 MB), `__pycache__` (3 carpetas) y `Documentos/{main.cpp, main.o, Makefile.win, actividad 2.dev, actividad 2.exe, actividad 2.layout}`. Es irreversible: no pasa por la Papelera.

**Advertencia registrada antes de borrar.** `_to_delete/` contenía los respaldos que esta bitácora cita como evidencia de versiones previas. Entre ellos estaba `backup_pre_modelo11_ampliado_2026-10-13/`, que la entrada DEC-OBJ-001 nombra como el único respaldo de cuándo se fijó el diseño. Omar decidió borrarla igual. Desde ahora, todas las menciones a `_to_delete/…` en esta bitácora y en `Frontend/observatorio/README.md` apuntan a archivos que **ya no existen**. Esas entradas no se editan, por la regla de historia real.

**Consecuencia.** Sin git y sin respaldos, la única evidencia de las versiones anteriores es esta bitácora. Crear el repositorio git del Observatorio pasa a ser más urgente.

## 2026-10-20 (21:45, hora CDMX) — Tarjeta de puntos con «algún daño» (script 22): registro, semilla y limitación de medición

**Pedido de Omar.** «Haz la tarjeta de puntos» (pendiente 2 de la entrada de las 10:40: decidir el modelo candidato).

**Qué se encontró.** La tarjeta ya existía: `Analysis/22_tarjeta_puntos.py` y sus salidas `resultados/22_tarjeta_*.csv` y `figuras/f26_tarjeta_puntos.png` se crearon hoy a las 17:16, **sin entrada en esta bitácora**. Esta entrada la registra. El script ajusta la tarjeta con `ALGUN_DANO` (el `21_tarjeta_puntos.csv` se ajustó con salud física y no es la vigente) en tres variantes: completa, sin «le falta fuerza física» y sin esa ni «requiere apoyo».

**Problemas encontrados y qué se hizo.**
1. **No era reproducible.** Dos corridas diferían hasta 0.27 pp de cobertura por grupo: `liblinear` no tenía `random_state`. Se fijó `random_state=SEMILLA`; dos corridas seguidas ahora dan archivos idénticos. El script 21 tiene el mismo problema y **no se tocó**: su R3 con «algún daño» (+2.39 pp) pasa a +2.13 pp en el 22, dentro del ruido. Respaldo de la versión anterior en `_to_delete/backup_pre_22_semilla_2026-10-20/`.
2. **Limitación de medición (verificada en el diccionario de datos).** Las actividades básicas y las tareas clínicas (`P6_2_*`) solo se preguntan en el bloque de discapacidad. En el bloque de personas mayores el equivalente (`P6_22_*`) solo se pregunta si `P6_21` = 1 (cuidado por enfermedad, lesión o accidente): lo contestan 23 de las 407 cuidadoras de «solo 60+ sin discapacidad». Para las otras 384, tres variables de la tarjeta valen 0 porque **no se preguntó**. Esto explica buena parte de la pérdida de cobertura de ese grupo (de 50.2 % con la regla a 12.9 %–23.5 % con la tarjeta). No se puede corregir recodificando. El notebook 11 ya lo anotaba («solo se puede medir en el bloque de discapacidad»), pero la lectura por grupo del 13 de octubre lo trató como «en parte artefacto».
3. Se agregó la **sección 5**, evaluación solo dentro del bloque de discapacidad (636 cuidadoras, 449 con algún daño), donde las 10 variables se miden para todas. Salida: `resultados/22_tarjeta_bloque_discapacidad.csv`.

**Hallazgos** (nacional, ENASIC 2022, fuera de muestra, validación por UPM 5 × 20, IC 90 % por linealización).
1. Muestra completa, cupo 40.7 %: tarjeta completa +2.1 pp (−3.7 a 8.0); sin fuerza +0.4 pp (−6.2 a 7.1); sin fuerza ni apoyo +1.3 pp (−5.0 a 7.5). **Ninguna supera a la regla de 40 h.**
2. Con el umbral que se usaría en campo (elegido en entrenamiento): completa (≥ 8 puntos) +2.2 pp (−3.4 a 7.7); sin fuerza (≥ 8) −0.9 pp (−7.6 a 5.9); sin fuerza ni apoyo (≥ 7) −0.9 pp (−7.3 a 5.6).
3. Dentro del bloque de discapacidad (cupo 44.8 %, la tasa de la regla en ese bloque): +0.9 pp (−4.3 a 6.0), +2.1 pp (−3.1 a 7.3) y +1.9 pp (−3.5 a 7.4). **Tampoco la supera**, aun midiendo bien todas las variables.
4. Puntos con toda la muestra, variante sin fuerza ni apoyo: ≥ 40 h = 5, ayuda en ≥ 3 actividades básicas = 3 (+1 si ayuda en al menos 1), tareas clínicas = 3, mujer = 2; el resto 0. Son inestables: dentro del bloque de discapacidad cambian (actividades básicas 5, clínicas 4, mujer 3, edad 60+ = 1), y en las 100 particiones, de las variables que suman puntos, solo «≥ 40 h» conserva su puntaje en más del 90 % de los ajustes (99 %); actividades básicas, clínicas y «mujer» lo conservan entre 30 % y 50 % (`22_tarjeta_estabilidad.csv`).
5. Hombres: la tarjeta les quita cobertura en las tres variantes (de 45.8 % a 30.1 %–37.8 %), en parte porque «mujer» suma 2 puntos.

**Qué NO permite afirmar.** Que la tarjeta seleccione mejor que la regla; nada sobre la CDMX; que las cuidadoras de «solo 60+» tengan menos daño (la tarjeta no las ve, no las descarta con evidencia); que priorizar con la tarjeta reduzca el daño.

**Lectura.** La tarjeta es, en la práctica, la regla de 40 h con añadidos que no mejoran la selección y que cambian a quién se deja fuera. Para Herramientas y Técnicas Avanzadas el resultado reportable es que la alternativa simple iguala al modelo, en la muestra completa y en el bloque donde la medición es completa.

**Estado de revisión.** Sin revisión de otra persona.

**Pendiente.**
1. Doble revisión (Daniel o Alondra Danae) del script 22 y de esta entrada.
2. Decidir si se presenta la tarjeta o solo la regla. Si se presenta, decidir sobre la variable «mujer»: priorizar por sexo en un programa necesita justificación jurídica (dictamen de Daniel).
3. Si la app pregunta actividades básicas a todas las cuidadoras, su prioridad (`regla ≥ 40 h + ABVD`) se aplica a un grupo (solo 60+) en el que la ENASIC no midió ABVD: no hay evidencia de cómo se comporta ahí.
4. Revisar si la regla compuesta R2 (script 21) y la sección 11 del notebook B heredan la misma limitación en sus resultados por grupo.



## 2026-10-20 (21:50, hora CDMX) — Segunda limpieza de la carpeta y sincronización del Project

**Pedido de Omar.** Terminar de borrar del Project lo obsoleto y «lo innecesario» de la carpeta. Eligió los cuatro grupos propuestos.

**Qué se hizo.**
- Carpeta (borrado irreversible): `_obs_snapshot.tgz`, `app_matching_relevo_frontend.zip`, `Analysis/__pycache__/` y las versiones superadas `Observatorio_Cuidado_Hallazgos_y_Propuestas.docx`, `_v2`, `_v3`, `_v4`, `.pdf`, `Documento_Integrado_Observatorio_Cuidado.docx`, `_v0.2` y `Estudio_de_Negocio_Programa_Cuidado.docx`. Esto revierte la decisión del 25 sept de conservarlas «por historia»; las versiones vigentes (Hallazgos v5, Integrado v0.3, Estudio de Negocio v0.2) se quedan.
- No se tocó `_to_delete/backup_pre_22_semilla_2026-10-20/`: lo creó a las 21:45 otra sesión que trabaja en el script 22. Tampoco se tocaron los zips del DENUE, que hacen falta para reproducir.
- Project: se borró `_to_delete/_tmp_entrada_bitacora.md`. Se reemplazaron por su versión de la carpeta `Frontend/observatorio/README.md`, `build_datos.py`, `bitacora-decisiones.md`, `ESTADO_SINCRONIZACION.md`, `Analysis/README.md` y `ML/README.md`.

**Pendiente.** Los archivos subidos de la ENASIC (`pp26-2/Analysis/datos/enasic/` y el zip) siguen en el Project: hay que quitarlos a mano en claude.ai. `Documentos/README.md` y `README.md` se ajustaron a este borrado.

## 2026-10-20 (23:10, hora CDMX) — App «Mientras»: priorización de relevos con bolsa de horas (Frontend/)

**Pedido de Omar.** Cambiar la app de `Frontend/` a una plataforma de priorización de relevos vinculada al Sistema Público de Cuidados CDMX («Ciudad que Cuida a Quien Cuida»), resolviendo cinco problemas: autoselección, qué se raciona, que nadie quede fuera, instrumentos y variables del modelo, y riesgos.

**Corrección a la premisa del pedido.** El pedido decía que la app «hoy funciona como matching». No es así desde el 8 oct (entrada de las 23:00): `matching.js` y `clasificador.js` ya se habían eliminado y la asignación era solo por restricciones. Lo que cambió hoy es la priorización (de la regla ≥ 40 h a puntaje, niveles y bolsa), no el matching. Tampoco existía el nombre «Mientras» en la carpeta.

**Decisiones de Omar (esta sesión).** Variante «completa» de la tarjeta del script 22. Zarit solo para seguimiento y chequeos, no en el puntaje. CURP solo para la persona de relevo, no para quien solicita. Nombre y eslogan provisionales a propuesta de Claude: «Mientras · Relevo por horas para quien cuida». Reutilizar los personajes del Observatorio.

**Archivos.** Nuevos: `Frontend/js/config.js`, `Frontend/js/prioridad.js`, `Frontend/tests/prueba_asignacion.js`. Modificados: `Frontend/index.html`, `Frontend/css/app.css`, `Frontend/js/app.js`, `Frontend/js/data.js`, `Frontend/js/relevo.js` (solo encabezado), `Frontend/README.md`. No se crearon copias de versiones anteriores. La clave de `localStorage` pasa a `mientras-v3`.

**Cómo quedó cada problema.**
1. *Autoselección.* Dos vías de entrada: autorregistro y referencia institucional (DIF, centro de salud, escuela, clínica, módulo); la referencia la llena la institución en un formulario corto (institución, cargo de quien refiere, persona presente). `canal_origen` es obligatorio. Seguimiento › Programa muestra los puntajes base por canal (un punto por caso, mediana y cortes de nivel). Los casos de ejemplo están armados para que el autorregistro tenga más puntajes bajos: **es ilustración, no hallazgo.**
2. *Qué se raciona.* `presupuesto_horas_mes` en `config.js` (2,000 h, **ilustrativo**). Texto visible en «Necesito» y en la solicitud: «Mientras es un componente complementario del Sistema Público de Cuidados. Las horas dependen del presupuesto del programa.» El ejemplo usa una bolsa **simulada** de 260 h para 11 casos (control en Ajustes) porque con 2,000 h todos llegan al tope.
3. *Nadie queda fuera.* Mínimo garantizado (`horas_minimas` = 13 h/mes ≈ 3 h/sem), niveles Alta ≥ 13 / Media ≥ 8 / Baja (Media = umbral operativo del script 22; Alta sin respaldo), resto de la bolsa proporcional al puntaje efectivo con tope por hogar (52 h/mes ≈ 12 h/sem), envejecimiento en cola de +0.5 puntos por semana con tope de 4, y canal alterno para Baja (directorio pendiente). Prueba (`node tests/prueba_asignacion.js`, 100 personas, semilla 20261020): (a) nadie recibe menos de 13 h, (b) suma 2,000 ≤ 2,000, (c) envejecimiento máximo 4 = tope. Corrida en la carpeta: todo OK.
4. *Instrumentos y variables.* Entrevista en tres bloques: (1) las variables de la tarjeta con la codificación de la ENASIC 2022 (horas P6_7 + P6_26, cinco actividades básicas P6_2, cuatro tareas clínicas P6_2, «requiere apoyo» P6_9_4 / P6_28_4, «le falta fuerza» P6_9_1 / P6_28_1; SEXO en el registro). No se preguntan las variables con 0 puntos (`disc`, `edad60`; `h80` sale de las horas), por minimización. (2) Estructura tipo Zarit (22 reactivos con marcador `[Reactivo Zarit n — requiere licencia]`, respuesta 0-4, total sin imputación). (3) Índice de Barthel, 10 actividades, 0-100. No hay modelo serializado, así que el puntaje es la tarjeta como regla transparente y la pantalla dice siempre «Puntaje provisional — modelo en validación». La regla ≥ 40 h se muestra al lado como referencia.
5. *Riesgos.* Manipulación: cuatro chequeos (horas ≥ 40 con Barthel ≥ 90 y sin tareas de salud; ≥ 3 actividades básicas con Barthel 100; ≥ 140 h/sem; Zarit ≤ 20 con «falta fuerza» y «requiere apoyo»). Mandan el caso a revisión humana y no cambian el puntaje. Datos sensibles: el consentimiento expreso va antes de la entrevista, con el marcador `[Aviso de privacidad — pendiente revisión legal, Daniel]`; sin CURP, diagnósticos, edad ni domicilio de la familia; se quitaron daño a la salud y al trabajo, parentesco y red de apoyos del registro. Equidad: el resultado explica los 3 factores que más pesaron y tiene el botón «Solicitar revisión», que registra una apelación; el programa la resuelve desde el detalle del caso.

**Verificación.** Prueba de Node en la nube y en la carpeta: todo OK. Flujo completo en Chromium a 420 px con un caso de cada nivel: Alta (20 puntos, 27 h/mes), Media (referencia DIF, 10 puntos, 19 h/mes, Zarit 44) y Baja (1 punto, 14 h/mes, canal alterno y apelación). Además: asignación de relevo a un caso nuevo, panel Programa, KPI, Puedo cuidar y Ajustes. Sin errores de JavaScript ni scroll horizontal. No se probó en un teléfono real ni en Safari.

**Lo que esta entrada no resuelve.**
- La tarjeta no supera a la regla de 40 h (script 22). Repartir horas en proporción al puntaje supone una relación lineal entre puntos y necesidad que nadie validó. Con los mínimos, la diferencia entre niveles es chica (prueba: Alta ≈ 23.5 h/mes, Baja ≈ 16.1).
- «Nadie queda fuera» depende de que la bolsa alcance para los mínimos. Con 1,000 h para 100 personas, 24 quedan en cola (escenario 2 de la prueba).
- «Le falta fuerza» (4 puntos) y «requiere apoyo» (3) son las variables más fáciles de manipular y la variante «completa» las conserva.
- Actividades básicas: la ENASIC no las midió para 384 de 407 cuidadoras de «solo 60+» (entrada de las 21:45). La app las pregunta a todas, así que los pesos se aplican donde no se estimaron.

**Pendiente.**
1. Licencia de Zarit (reactivos y etiquetas de respuesta) y confirmación de la versión validada en México.
2. Aviso de privacidad y ley aplicable (Daniel); dictamen sobre puntuar por sexo (`mujer` = 2).
3. Valores definitivos de `config.js`: bolsa, mínimo, tope, umbral Alta y envejecimiento.
4. Redacción literal de los reactivos de la ENASIC y versión en español del Barthel con sus condiciones de uso.
5. Directorio real del canal alterno por alcaldía.
6. Reemplazar personajes (ver abajo) y convertir los PNG (≈ 1.3 MB cada uno) a WebP.
7. Doble revisión de `prioridad.js`, de la prueba y de esta entrada.

**Personajes: reemplazos sugeridos.** Hoy, por ruta y sin copiar: `logo_personajes.webp` (bienvenida), `agotada.png` (Alta), `cuidadoraSilla.png` (Media y «Puedo cuidar»), `familia.png` (Baja). Problemas: Alta muestra a una cuidadora agotada justo cuando se le da su resultado, y eso refuerza el estigma en lugar de mostrar el relevo. Media usa a la persona de relevo, no a quien cuida. Baja supone que la familia ya apoya, y es justo el caso en que se le manda a buscar redes. Todos los casos muestran a una persona mayor; no aparece discapacidad infantil ni un hombre que cuida. Reemplazos: (1) Alta: la cuidadora se sienta con una taza mientras la persona de relevo acompaña a quien cuida, es decir, el momento de «mientras»; (2) Media: la cuidadora frente a un calendario semanal con horas marcadas; (3) Baja: la cuidadora con un folleto o mapa de servicios cercanos (centro de día, módulo); (4) «Puedo cuidar»: persona de relevo con gafete del programa y mochila, sin silla de ruedas; (5) una variante con un hombre que cuida y otra con una persona cuidada con discapacidad no mayor. Mismo estilo plastilina, fondo transparente, WebP de 720 px.

**Estado de revisión.** Sin revisión de otra persona.

## 2026-10-21 (09:40 a 10:40, hora CDMX) — Documentos del segundo avance: Guía del tablero v2, Documento técnico v2, Guía de la app v1 y Documento maestro v2

**Pedido de Omar.** Actualizar la Guía del tablero, el manual técnico, la guía de la app y un documento maestro para entregarlos en el segundo avance (2.ª revisión, 2–6 nov 2026), en .docx.

**Qué se hizo.** Cuatro documentos nuevos en `Documentos/`; los anteriores no se tocaron.
- `Observatorio_Cuidado_Guia_Tablero_v2.docx` (25 págs.): Observatorio del 20 oct, capturas nuevas a 1440 px, tabla «Qué cambió desde la v1.0» y estado de las 8 inconsistencias de la v1 más 5 nuevas.
- `Observatorio_Cuidado_Documento_Tecnico_v2.docx` (30 págs.): generador `documento_tecnico/build_documento_tecnico_v2.js` (copia del v1 con cambios). Sección nueva sobre `DW/` y estado de los 9 hallazgos técnicos de la v1 más 4 nuevos.
- `Mientras_Guia_App_v1.docx` (20 págs.): primera guía de la app (versión del 20 oct, 23:10). No existía una guía de la app en .docx.
- `Documento_Maestro_Avance2_Observatorio_del_Cuidado_v2.docx` (22 págs.): sustituye al maestro del 25 sept. Primera persona del equipo; resultados con nivel de evidencia y estado de revisión; aportación de cada UCA.
- Generadores, portadas, figuras y capturas en `Documentos/segundo_avance/` (ver su README).

**Cómo se obtuvieron las cifras.** Página del Observatorio abierta en Chromium sin interfaz el 21 oct; `Analysis/resultados/20_*` y `22_*`; `DW/README.md` y `DW/docs/`; esta bitácora. La app se capturó con los casos de `seed()` (simulados). `node tests/prueba_asignacion.js` corrió completo, todo OK. No se volvió a correr el ETL ni ningún notebook.

**Decisiones de redacción.**
1. Las cifras del script 21 y del subproyecto ENUT 2024 no se citan (regla de doble revisión). Las del script 22 sí, marcadas «exploratorio».
2. La app se presenta con la tarjeta de puntos como regla transparente **y** con el resultado de que no supera a la regla de 40 h (decisión pendiente: tarjeta o regla).
3. «Ciudad que Cuida a Quien Cuida» se cita como propuesta de vinculación, no como acuerdo. Datos (5,000 cuidadoras, 18–56 años, hasta $6,000 al año, 39 mdp) de UnoTV, 28 may 2026, consultado el 21 oct.

**Hallazgos al revisar el Observatorio (no se corrigieron).**
1. Método muestra «TBC» en las tres decisiones: hueco visible en un entregable.
2. La fecha sigue en «Actualizado 6 oct 2026».
3. La ficha de «Zonas dentro de cada alcaldía» dice que no hay polígonos de AGEB.
4. El KPI «+12.7 pp si el objetivo es salud física» no está rotulado como sensibilidad exploratoria (DEC-OBJ-001).
5. Dos cifras para «el daño crece con las horas»: +31.0 pp (78 % contra 47 %) y 70.5 % contra 42.6 % (solo «no tuve necesidad»).
6. En la app, con 40 h o más y «sí» a todo se llega a 20 de 20 puntos (efecto techo).

**Estado de revisión.** Sin revisión de otra persona. Los cuatro documentos lo declaran en su control.

**Pendiente.** Doble revisión de los cuatro documentos; decidir sobre el «TBC» de Método antes del 2 de noviembre; integrar al maestro los productos de la UCA de Leyes (Daniel) y la sede del piloto.

## 21 oct 2026 · Observatorio: diccionario en dos vistas, logo nuevo y barra lateral

**Qué cambió.** (1) Pestaña Método, «Diccionario de variables y de la base»: la tabla plana se reemplazó por un interruptor **Linaje / Tabla**. Linaje: diagrama de dependencias entre variables; al tocar una se iluminan las que la construyen y las que alimenta. Tabla: filas que se expanden, con buscador y filtro por grupo. (2) El corazón doble de la barra lateral y el de la frase «El cuidado también es trabajo» se sustituyeron por el logo familiar (`ilustraciones/logo_marca.svg`, versión plana vectorizada de la imagen entregada por Omar; también es el favicon). (3) Se quitó de la barra lateral el texto «Actualizado 6 oct 2026 · datos reales agregados / Pendiente de doble revisión».
**Cifras y definiciones.** Ninguna se escribió a mano en el HTML: salen de `Analysis/matrices/diccionario_observatorio.csv` vía `build_datos.py`. Se agregaron tres columnas a ese CSV (`grupo`, `depende_de`, `advertencia`); `build_datos.py` se detiene si `depende_de` apunta a una variable que no existe. Las advertencias (tope de 98 h, quintil entre hogares con necesidad, respuesta múltiple de SINNEC, FALTA_FUERZA ≈ DANO_SALUD_FISICA) provienen de definiciones ya presentes en el diccionario o en los notebooks; **las redactó Claude y no tienen revisión de otra persona.**
**Motivo de quitar el texto de la barra.** Lo pidió Omar. Efecto: el sitio ya no declara en la barra que está pendiente de doble revisión ni su fecha de actualización (la fecha del 6 oct estaba desactualizada). El estado de revisión sigue en la ficha del modelo (`#src-m2`) y en esta bitácora: sin doble revisión.
**Archivos modificados.** `Analysis/matrices/diccionario_observatorio.csv`, `Frontend/observatorio/{build_datos.py, datos_observatorio.json, js/datos/datos.js, index.html, js/vistas/metodo.js, css/vistas.css, css/layout.css, ilustraciones/logo_marca.svg}`. Respaldo previo en `_to_delete/backup_pre_diccionario_logo_2026-10-21/`.
**Verificado.** Carga sin errores de consola a 1400 y 390 px, sin desborde horizontal; interruptor, selección de variable, filtro, búsqueda y saltos entre vistas probados en Chromium sin interfaz.
**Pendiente.** Revisión de Daniel o Alondra de las cinco advertencias; la app (`Frontend/index.html`) no tiene corazones de marca y no se tocó; los logos 3D del medallón de Inicio no se cambiaron.

## 2026-10-20 (23:50, hora CDMX) — Segmentación de personas cuidadoras con clases latentes (notebook 23)

**Pedido de Omar.** «Haz segmentación de clientes, muy desarrollado», a partir de la lista de usos de ML (segmentación, churn, propensión, etc.) y la pregunta de si va en el Observatorio.

**Para qué decisión.** ¿Hay perfiles de cuidadoras que necesiten algo distinto al relevo por horas (por ejemplo capacitación o una segunda persona)? No es para decidir a quién priorizar: eso ya lo respondieron los scripts 21 y 22 (regla de 40 h).

**Qué se hizo.**
- `Analysis/23_segmentacion_cuidadoras.ipynb`. Tabla TPOB_CUI, universo discapacidad o 60+ (n = 1,043, FAC_CUI, estratos y UPM). Reproduce 1,043 / 40.7 % / 62.2 % (IC 58.77–65.55) / 222 casos.
- Modelo de clases latentes ponderado (EM propio; verosimilitud igual a la de StepMix 3.0, según el encabezado del notebook). Indicadores: horas, cuida menores, cuatro dificultades (fuerza, no coopera, capacitación, requiere apoyo), insatisfacción con la ayuda y motivo para cuidar. El daño **no** entra al modelo: solo valida.
- Reglas fijadas antes de ajustar: indicadores comparables entre bloques (se excluyen las ABVD, ver la entrada de las 21:45), regla de BIC con tamaño mínimo, alternativas simples y validación por UPM.
- Bootstrap de UPM (100 réplicas) y validación cruzada (5 × 20) con tolerancia 1e-6 y 5 arranques por costo de cómputo; el ajuste principal usa 1e-9 y 30 arranques.
- Control agregado después de ver los resultados: comparación dentro de cada bloque × horas (`23_seg_dano_por_bloque_horas.csv`), porque el 82 % de la clase «dificultad» cuida a una persona con discapacidad.
- Salidas: `resultados/23_seg_*.csv` (10 archivos) y `figuras/f27`–`f31`. No se guarda la clase de ninguna persona.

**Hallazgos** (nacional, ENASIC 2022, exploratorio).
1. Solo una división es estable: k = 2 (ARI mediano 0.91). k = 3 tiene un BIC casi igual (+4.4) pero es inestable (ARI 0.65).
2. Clase «Dificultad en la tarea»: 25.7 % (IC 22.1–29.3; ≈ 1.6 M). La definen requiere apoyo (86 %), falta de fuerza (70 %) y necesitaría capacitación (58 %). Sus horas se parecen a las del resto, salvo 80 h o más (17 % contra 9 %).
3. A las mismas horas declara más daño. Con menos de 40 h: algún daño 80 % contra 43 % (+37 pp, IC 29–44) y salud física 41 % contra 10 %. Se sostiene dentro de cada bloque: +26 pp (discapacidad) y +42 pp (solo 60+, n = 43 con dificultad).
4. 13.8 % del universo (IC 11.3–16.2; ≈ 857 mil) tiene dificultad y cuida menos de 40 h: la regla de 40 h no la ve.
5. El algoritmo no le gana a una regla manual («2 o más de 4 dificultades»): diferencias pareadas menores a 1 punto. Lo que aporta información es la dimensión de dificultad, no el modelo.
6. Las clases no separan la búsqueda de servicios, «no tuve necesidad» ni la aceptación de «unas horas».
7. Sin «falta fuerza» ni «requiere apoyo», la clase cambia (ARI 0.30 contra la principal), pero sigue apareciendo una clase de «necesita capacitación» que a igual horas tiene más daño (+21 pp con menos de 40 h, IC 11–32).
8. La clase de dificultad tiene más mujeres (+10.5 pp) y más ingreso Q1–Q2 (+9.4 pp).

**Tensión con los scripts 21 y 22, explicada.** La tarjeta con estas variables no supera a la regla de 40 h en cobertura a un cupo fijo. Esto no contradice el hallazgo 3: con el cupo de 40.7 %, cambiar a cuidadoras de 40 h o más sin dificultad (72 % con daño) por cuidadoras con dificultad y menos de 40 h (80 %) gana poco en cobertura. La segmentación informa **qué ofrecer**, no **a quién priorizar**.

**Qué NO permite afirmar.** Nada sobre la CDMX. Que la dificultad cause el daño: es transversal y ambas se reportan en la misma entrevista (estilo de respuesta posible), y «falta fuerza» se parece a «salud física deteriorada». Que capacitación o una segunda persona funcionen: eso solo lo mide el piloto. Que existan «tipos» de cuidadoras más allá de una división en dos. Que se pueda usar la clase de una persona para negarle un apoyo: la asignación individual es incierta (entropía 0.69).

**Estado de revisión.** Sin revisión de otra persona. No citar las cifras hasta que alguien distinto a quien las produjo revise el notebook.

**Corrección registrada.** El notebook 23 ya existía en la sesión (encabezado, reglas fijadas a priori y código) cuando Omar pidió la segmentación; se ejecutó y completó, no se escribió desde cero. Al ejecutarlo hubo dos cambios: (1) por costo de cómputo, las réplicas usan tolerancia 1e-6 y 5 arranques (está declarado en el notebook); (2) se agregó el control por bloque × horas y se corrigió el acomodo de la figura f30. Los resultados se copiaron a la carpeta el 21 oct.

## 2026-10-21 (10:30, hora CDMX) — Observatorio: tarjeta de segmentación por clases latentes en «¿Quién lo carga?»

**Pedido de Omar.** «Agrégalo a la carpeta y actualiza el Observatorio con esto.»

**Decisión.** Una tarjeta dentro de «¿Quién lo carga?», no una pestaña nueva: el hallazgo se resume en una división en dos y una comparación a igual horas.

**Qué se hizo.**
- Carpeta: `Analysis/23_segmentacion_cuidadoras.ipynb`, `resultados/23_seg_*.csv` (10) y `figuras/f27`–`f31`.
- `build_datos.py`: bloque `seg23` (lee seis `23_seg_*.csv`). Se detiene si cambian los nombres de las clases, si k = 2 deja de ser la solución más estable o si cambia el número de filas esperado. `registros()` se movió arriba para usarlo en este bloque; no cambia su comportamiento.
- `matrices/diccionario_observatorio.csv`: fila del bloque `seg23` con su advertencia.
- `index.html` y `js/vistas/necesidad.js`: tarjeta «A las mismas horas, ¿quién declara más daño?» con selector de desenlace (algún daño, salud física, daño laboral) y de bloque (todas, cuida discapacidad, solo 60+), dos tiles (25.7 % y 13.8 %), perfil de la clase y la nota «informa qué ofrecer, no a quién atender primero». Las celdas con menos de 30 casos se rayan y no se comparan. No la recorta el filtro de la pestaña, y lo dice.
- `css/vistas.css`: estilos `.s23*` al final.
- Respaldo: `_to_delete/backup_pre_seg23_observatorio_2026-10-21/`.

**Verificado.** Al regenerar, `datos_observatorio.json` solo cambia en el bloque `seg23` (comparado contra el respaldo). Probado en Chromium sin interfaz a 1440 y 390 px: sin errores de JavaScript ni desborde horizontal; los selectores cambian la gráfica; «daño laboral» por bloque muestra el aviso de que no se calculó. Cifras de pantalla contra el CSV: 25.7 %, 13.8 %, 80 contra 43, +37 pp (IC 29 a 44).

**Pendiente.**
1. Doble revisión (Daniel o Alondra Danae) del notebook 23, de esta tarjeta y de las dos entradas.
2. Decidir si «Lo que encontramos» (Inicio) suma este hallazgo; no se tocó.
3. Borrar `_to_delete/_tmp_obs_test_2026-10-21.tgz` (copia temporal para la prueba en el navegador).
4. Si el programa ofrece un formato para la clase de dificultad (capacitación o relevo con dos personas), meter esas preguntas al instrumento del piloto.
5. Verificar con el diccionario la codificación de P6.38 (motivo) y P6.39.3 (insatisfacción con la ayuda).

## 2026-10-21 (10:30 a 10:55, hora CDMX) — Backend 0.1.0: API de lectura del DW y servicio de puntaje sin estado (Backend/)

**Pedido de Omar.** «Construyamos el backend».

**Decisión (Omar, esta sesión).** Hasta hoy `Backend/` estaba vacía a propósito por falta de decisión de arquitectura (entradas del 17 sept y del 20 oct, DW). Claude preguntó el alcance antes de escribir código. Omar eligió: (1) API de lectura del DW y (2) servicio de puntaje sin estado; **descartó por ahora** el backend con persistencia de la app Mientras. Stack: FastAPI + SQLite. **Sin confirmación del equipo.**

**Motivo del alcance.** Los dos servicios elegidos no guardan datos personales. Un backend que guarde casos, relevos y apelaciones trataría datos sensibles de cuidadoras y requiere el dictamen de Leyes (Daniel) y la sede del piloto. El servicio de puntaje responde al objetivo de despliegue de modelos de Herramientas y técnicas avanzadas (bienvenida de la UCA, «despliegue y mantenimiento de modelos»).

**Qué se hizo.** `Backend/app/` (FastAPI): `/dw/*` lee `DW/observatorio_dw.sqlite` en modo `ro` (marts 1 a 3, perfil por alcaldía, cobertura, calidad, medidas, metadatos); `/puntaje/*` traduce línea a línea `Frontend/js/prioridad.js` (puntaje, nivel, envejecimiento, regla de 40 h, Barthel, Zarit, chequeos, reparto); `/salud`. Configuración exportada de `Frontend/js/config.js` a `Backend/app/config_programa.json` con su SHA-256 (`node Backend/scripts/exportar_config.js`). `Backend/README.md` reemplaza al README placeholder del 17 sept.

**Reglas en código.** 503 en todo `/dw/*` si `v_violaciones_alcance` tiene filas; sin endpoints de series ni de agregación; NULL sale como `null`; cada respuesta declara la corrida del ETL, el estado de revisión y las advertencias. `/puntaje/*` rechaza campos no previstos (`curp`, `nombre`, `edad`…), folios que no sean minúsculas y dígitos, y responde 503 si `config.js` cambió sin exportarse. `Cache-Control: no-store`; no se guarda nada.

**Verificación.** 26 pruebas (`python -m pytest Backend/tests -q -p no:cacheprovider`) en la nube y en la carpeta: todas pasan. La de paridad compara JS y Python en 600 entrevistas y 81 repartos (semilla 20261021, casos de borde incluidos) con resultados idénticos; una mutación del umbral Alta (`>=` → `>`) la hace fallar. Servidor levantado en la carpeta: `/salud` ok, `/dw/alcaldias` 16 filas, `/docs` 200. No se probó en el Python de Windows (se probó en el Linux de la carpeta, Python 3.10).

**Lo que esta entrada no resuelve.**
- El Observatorio no consume la API: se abre con `file://` y lee `Analysis/`, no el DW. Conectarlo exige aceptar un servidor y verificar que las cifras del DW coinciden con las publicadas (pendiente 2 del DW).
- La app Mientras no la llama: hoy el servicio calcula lo mismo que el JS. Tiene sentido cuando exista un modelo serializado o una sede.
- Hay dos copias de la lógica de puntaje (JS y Python); la prueba de paridad es lo único que las mantiene iguales.
- Sin autenticación: solo para `localhost`.
- El puntaje sigue sin superar a la regla de 40 h (script 22).

**Pendiente.** Doble revisión del backend (quien lo produjo no lo aprueba); confirmación del equipo del alcance; decidir si el Observatorio pasa a leer el DW.

**Estado de revisión.** Sin revisión de otra persona.

## 2026-10-21 (22:00 a 22:30, hora CDMX) — El Observatorio lee del almacén: Analysis/ → ETL → DW → build_datos.py

**Pedido de Omar.** Primero: «conecta el backend con el Observatorio». Luego preguntó qué significa conectar un servidor y para qué comprobar cifras que deberían ser iguales. Claude respondió que servir el Observatorio desde el backend obligaba a tener un servidor encendido sin cambiar ninguna cifra, y propuso quitar la duplicación en lugar de verificarla en cada carga. **Decisión de Omar: ruta única `Analysis/ → ETL → almacén → Observatorio`.** Sin confirmación del equipo.

**Descartado.** Servir el Observatorio desde el backend con un `datos.js` generado y conciliado al vuelo. Se programó en la copia de trabajo de Claude y **no se instaló en la carpeta**. Esa conciliación sí sirvió como evidencia: 339 valores comparados, 0 diferencias; `pct_pob60` coincide solo al redondear a 3 decimales, porque el Observatorio lo tomaba de `indice_por_tipo_servicio.csv` y el DW lo guarda completo desde el CSV P01.

**Qué cambió.** `Frontend/observatorio/build_datos.py` lee del almacén (`DW/observatorio_dw.sqlite`, solo lectura):
- `territorio.alcaldias` (16 campos de `v_mart_perfil_alcaldia`) y `territorio.totales` (sumas de esos valores).
- `relevo.filas` (`v_mart_asequibilidad`, ingreso ENASIC, nacional), además de la tabla `rel` que usan el script 14 y la ficha de KPI.
- Se quedan del archivo `ql_plazas` y `pob65_prec`, porque el DW no los tiene.
- El script se detiene si no hay almacén, si la última corrida falló, si `v_violaciones_alcance` tiene filas, o si alguno de los 7 archivos de `Analysis/` que alimentan esos bloques tiene un SHA-256 distinto del registrado en `etl_archivo`.
- Los textos de «Archivo» citan la corrida del ETL. Bloque nuevo: `territorio.almacen`.

**Nuevo orden para reproducir:** ETL y después `build_datos.py`. Se actualizaron `README.md`, `DW/README.md` (pendiente 2), `Frontend/observatorio/README.md` y `Backend/README.md`.

**Verificación.**
1. Corrida en la carpeta contra la construcción anterior: 0 diferencias en cifras, en el orden de las alcaldías y en el de las columnas; `geo*.js` idénticos. Solo cambian 11 textos de origen y aparece `territorio.almacen`.
2. ETL corrido de nuevo (corrida 6, ok con advertencias: DQ05b y DQ10 siguen abiertas; DQ18 11/11), seguido de `build_datos.py`: mismas cifras.
3. Pruebas negativas sobre una copia temporal: sin almacén, CSV modificado después del ETL y violación de alcance. En los tres casos el script se detiene con el mensaje correcto.
4. Página abierta con `file://` en Chromium sin interfaz a 1400 px, sin errores de consola. Fichas de territorio y relevo revisadas.

**Lo que esta entrada no resuelve.**
- Los bloques de la ENASIC (`clave`, `embudo`, `seg`, `razones`, `carga`…) siguen leyendo `Analysis/` directamente. La ruta única hoy cubre territorio y asequibilidad, no todo el sitio.
- DQ18 ahora compara el DW contra el `datos_observatorio.json` de la construcción **anterior**. Sigue teniendo sentido porque revisa `clave`, que no pasa por el DW.
- El backend sigue sin consumidor.

**Respaldo.** `_to_delete/backup_pre_dw_build_2026-10-21/` (`build_datos.py`, `datos_observatorio.json` y `js/datos/` anteriores). `_to_delete/_tmp_obs_backend_2026-10-21.tgz` (copia temporal para pruebas en la nube) se puede borrar.

**Estado de revisión.** Sin revisión de otra persona.

## 2026-10-22 (hora CDMX) — Observatorio: Método, «Cada modelo responde a una decisión» deja de decir TBC

**Qué pidió Omar.** Actualizar las tres decisiones (¿Dónde?, ¿A quién?, ¿En qué orden?) «con lo que realmente existe».

**Qué se hizo.** `Frontend/observatorio/js/vistas/metodo.js` ahora arma cada panel con la función `contenido()`, que lee `D.tipologia`, `D.modelo` y `D.modelo2`: no hay cifras escritas a mano. Cada panel tiene siete bloques (título, estado, decisión, gráfica, qué no permite afirmar, método plegable, botón a la pestaña). CSS nuevo al final de `css/vistas.css` (clases `mdx-*` y bases de `mdec-*`).
- **¿Dónde?** Tipología de AGEB (notebook D, sección 18). Dice que la propuesta del notebook es el tipo con más personas de 60+ (43.1 %), que el modelo agrega poco sobre el índice CP1 (R² 0.53 contra 0.49), que la CDMX es un gradiente y que cambia con otro algoritmo (Ward 0.53, mezcla gaussiana 0.34).
- **¿A quién?** Focalización (notebook B, sección 11) con el hallazgo vigente: con «algún daño» ningún modelo supera de forma demostrable a la regla de 40 h (+2.2 pp, IC 90 % −4.1 a +8.5). La tarjeta de puntos (script 22) se menciona sin cifras. No se agregó nada del script 21.
- **¿En qué orden?** Aparece como **sin modelo**: solo conteos de personas de 60+ en AGEB con brecha, por alcaldía. Queda sin calcular cómo cambia el orden con el tercil en vez del cuartil.

**Qué NO cambia.** Ninguna cifra existente ni `build_datos.py`. Respaldo en `_to_delete/backup_pre_metodo_decisiones_2026-10-22/`.

**Verificado.** Render en Chromium a 1440 y 390 px, tres paneles, sin errores de JavaScript y sin desbordamiento horizontal. No se probó en Safari ni en teléfono real.

**Pendiente.**
1. Doble revisión del texto por alguien distinto a quien lo hizo.
2. Inconsistencia a resolver: la app de `Frontend/` prioriza con la tarjeta de puntos (provisional, desde el 20 oct 23:10) aunque el script 22 no la distingue de la regla de 40 h.
3. Decisión del equipo sobre «¿en qué orden?» (índice de prioridad o conteos).

### 2026-10-22 (mediodía) — Indicadores: se quitan las franjas de color de las tarjetas
A pedido de Omar («se ve muy de IA»): salieron la franja superior (sólida, rayada y punteada) y el fondo rayado de la tarjeta «desconocido» en `css/vistas.css`. El estado de evidencia sigue en las etiquetas (confirmado, probable, desconocido) y la tarjeta «desconocido» conserva el borde punteado. Respaldo: `_to_delete/backup_pre_metodo_decisiones_2026-10-22/vistas_pre_franjas.css`. Sin cambios de cifras.

### 2026-10-22 (mediodía, después) — Se quitan las barras de color del borde izquierdo
A pedido de Omar: salió el borde izquierdo de color de «Qué no permite afirmar» (`.mdec-no`), del recuadro del modelo en «¿A quién primero?» (`.fr-modelo`) y de las filas del diccionario (`.dic-row`). Respaldo: `_to_delete/backup_pre_metodo_decisiones_2026-10-22/vistas_pre_bordes_izq.css`. Sin cambios de cifras.

### 2026-10-22 (mediodía, 12:10) — Barra lateral: vuelven los corazones
A pedido de Omar se regresó el logo de la barra lateral y el de «El cuidado también es trabajo» a los corazones (SVG en línea de antes del 21 oct) en `index.html` y `css/layout.css`. Se conserva el favicon `logo_marca.svg` y sigue fuera el texto «Actualizado…/Pendiente de doble revisión» (también pedido por Omar el 21 oct). Respaldos: `_to_delete/backup_pre_metodo_decisiones_2026-10-22/index_pre_navbar.html` y `layout_pre_navbar.css`.

### 2026-10-22 (12:30) — Fichas: «Archivo» pasa a «Origen» y deja de mostrar rutas
A pedido de Omar («no me gusta que parezca una ruta de archivo»). `OBS.origen()` en `js/nucleo/util.js` traduce el número del análisis a su nombre (p. ej. `11_modelo_focalizacion_*.csv` → «Análisis del equipo: modelo de focalización»). `dl()` lo aplica a los renglones «Archivo/Archivos» y `js/app/plegables.js` hace lo mismo con las fichas escritas a mano en `index.html`. La ruta original queda en el `title` del renglón (al pasar el cursor). Si no se reconoce ningún número, se muestra el texto original. **Trazabilidad:** la tabla de nombres está escrita a mano en `util.js` (`ORG`); si se agrega un análisis nuevo hay que añadirlo ahí. No se tocaron los datos ni `build_datos.py`. Quedan con ruta, a propósito, la columna «Se calcula en» del diccionario (Método) y la lista de fuentes del inventario. Respaldo: `_to_delete/backup_pre_metodo_decisiones_2026-10-22/util_pre_origen.js` y `plegables_pre_origen.js`.

### 2026-10-23 (10:55) — «Origen» también en Indicadores
Faltaba la tarjeta de Indicadores (`js/vistas/indicadores.js`, inspector y tabla «Lista completa»): ya muestra «Origen: Análisis del equipo: …» con la ruta en el `title`. La columna de la tabla pasó de «Archivo» a «Origen» en `index.html`. Se ajustó el nombre del análisis 05 a «tasas nacionales y dimensionamiento de la CDMX», porque el indicador 01 (39.9 % de hogares, nacional) sale de `05_tasas_y_anclajes.csv` y el nombre anterior sugería un dato de la CDMX. Respaldo: `_to_delete/backup_pre_metodo_decisiones_2026-10-22/indicadores_pre_origen.js`.

### 2026-10-23 — Seis gráficas del Observatorio rehechas con tipos convencionales (pedido de Omar)
Omar consideró que varias gráficas se veían «de IA» y poco habituales. Cambios en `Frontend/observatorio/` (solo presentación; no se tocaron datos ni `build_datos.py`): **«Cómo se reconoce la clase»** (puntos con línea) → barras horizontales agrupadas con IC (`barrasGrupo`, `necesidad.js`); **«¿Contratan más los hogares con más ingreso?»** (líneas) → columnas agrupadas por quintil (`barreras.js`); **«El modelo cambia a quién se selecciona»** (círculos y rombos) → tabla con cobertura, IC y diferencia en pp (`focalizacion.js`); **«Qué asocia el modelo con el daño»** (paletas) → barras ordenadas desde cero; **calibración** → un solo modelo a la vez con selector (`focalizacion-ampliado.js`); **subsidio al relevo** (puntos y línea punteada) → tabla escenario × % de la solicitud (`relevo.js`). **Trazabilidad:** en el gráfico de quintiles los IC 90 % se calculan en el navegador como pct ± 1.645 × pct × CV / 100 (aproximación normal; los puntos de precisión baja se muestran rayados y sin IC, como en el resto del Observatorio). Los coeficientes siguen **sin intervalos**: hay que agregarlos en el script 11 y regenerar `datos_observatorio.json`. Pendiente de doble revisión. Respaldo de los archivos previos: `_respaldo_graficas_2026-10-23/`.

### 2026-10-23 (11:10) — «Origen» dice de qué datos sale, no el nombre del análisis
Omar pidió que el origen no parezca ruta ni nombre técnico y eligió «fuente de datos + cálculo del equipo». `OBS.origen()` (`js/nucleo/util.js`) ahora traduce cada análisis a los datos públicos de los que sale (p. ej. «ENASIC 2022 · cálculo del equipo»; «Censo 2020, DENUE 2026 y Marco Geoestadístico 2025 · cálculo del equipo»). La ruta original sigue en el `title`. **Sin doble revisión:** la tabla `ORG` está escrita a mano a partir de los encabezados de los notebooks A–D y de los scripts 19 y 20; hay que contrastarla con lo que realmente usa cada análisis (los análisis 05 y 06 combinan fuentes y el 02 y el 08 usan CSV cuyo productor no está documentado, por eso dicen «archivos de investigación del proyecto»). Respaldo: `_to_delete/backup_pre_metodo_decisiones_2026-10-22/util_pre_origen2.js`.

### 2026-10-23 (11:00) — Pie de página sin el comando de reproducción
A pedido de Omar se quitó «Reproducir: python Frontend/observatorio/build_datos.py» del pie de `index.html`. El comando sigue documentado en `Frontend/observatorio/README.md`. Respaldo: `_to_delete/backup_pre_metodo_decisiones_2026-10-22/index_pre_footer.html`.

### 2026-10-24 (16:50) — «¿En qué orden?»: de un conteo a una regla de decisión sin pesos (Omar preguntó si hacía falta un modelo)
**Por qué.** La tarjeta daba un orden por un solo conteo (Azcapotzalco 25,358; Iztapalapa 21,789; Cuauhtémoc 16,439). Ese conteo mezcla volumen y concentración, y la pregunta «cómo cambia con el tercil» seguía sin calcular desde el 22 oct. **Se decidió no usar un modelo:** no existe un resultado observado (qué pasó al atender una zona antes que otra), así que no habría con qué validarlo, y un índice con pesos sería una decisión normativa, no un hallazgo. Los modelos del programa curricular ya están cubiertos por los notebooks B, D y el script 22.
**Qué se hizo.** Script nuevo `Analysis/24_prioridad_zonas.py` (lee solo `resultados/18_tipologia_ageb.csv`). Reproduce las banderas del notebook D (151 AGEB con el cuartil, 257 con el tercil; falla si no coinciden) y agrega el quintil. Para cada alcaldía mide el volumen N (personas de 60+ en AGEB con brecha) y la concentración P (N entre las 60+ de la alcaldía) y asigna nivel: 1 doble (entre las K primeras en N y en P), 2 una sola medida, 3 brecha menor, 4 sin brecha. Se corre con 3 cortes × K = 4, 5, 6 (9 combinaciones); «estable» solo si cae en el mismo nivel en las 9. Escribe `resultados/24_prioridad_alcaldia.csv`, `24_prioridad_combinaciones.csv` y `24_brecha_ageb.csv` (257 AGEB con margen sobre el umbral). `build_datos.py` lee los dos archivos agregados y los guarda dentro de `tipologia.prioridad` (sin bloque nuevo; el diccionario y el README de Analysis se actualizaron). `metodo.js`: la tarjeta 3 ahora muestra la regla en una tabla (8 primeras alcaldías) y dice qué no permite afirmar. Respaldo en `_to_delete/backup_pre_prioridad_2026-10-24/`.
**Qué dice.** Arriba en las dos medidas con el cuartil: Azcapotzalco, Cuauhtémoc e Iztacalco. **Solo Azcapotzalco es nivel 1 en las 9 combinaciones** (Cuauhtémoc 8 de 9; Iztacalco 6 de 9). Iztapalapa es nivel 2 «solo volumen» en las 9 (8.3 % de sus 60+ en brecha). Cuajimalpa es «solo concentración» (38.9 %, 7 de 9). Solo 6 de 16 alcaldías quedan en el mismo nivel en las 9 combinaciones; de las 151 AGEB del cuartil, 64 pasan el corte por menos de 10 % (en personas de 60+ o en distancia). Con el tercil Iztapalapa pasa a primer lugar por volumen: el orden exacto no se sostiene, el nivel sí en parte.
**Qué NO resuelve.** (1) Qué decisión informa (abrir servicio, ubicar el piloto o enfocar difusión) y quién decide: **desconocido**; si el piloto de práctica profesional ya fija la sede, el orden pasa a segundo plano. (2) Los cortes y K = 4 a 6 son convenciones. (3) No se cruzó con capacidad ni precio de la oferta (`02_indice_capacidad_residencial.csv` viene con huecos). Se agregó solo como contexto el índice de oferta frente a 60+ (`outputs/oferta_nucleo_vs_pob60_por_alcaldia.csv`) en el CSV, sin entrar a la regla. (4) La distancia es en línea recta. (5) El resto de la página no cambió: solo cambió el bloque `tipologia.prioridad` en `datos_observatorio.json` (comparado contra el respaldo).
**Verificado.** Script corrido sin errores; cifras de la tarjeta anterior reproducidas; render en Chromium a 1440 y 390 px sin desborde horizontal ni errores de JavaScript (las ilustraciones no se cargaron en la prueba porque no se copiaron; no es un fallo de la página).
**Pendiente.** Doble revisión del script y del texto por alguien distinto a quien lo hizo. Decisión del equipo: adoptar esta regla o pedir un índice con pesos. Los archivos `PowerBI/datos/brecha_alcaldia.csv` y los marts del DW siguen con el conteo anterior; no se tocaron.

### 2026-10-24 (17:00) — Mientras: cada rol ve solo lo suyo (selector «Ver como»)
**Por qué.** En la revisión de diseño se vio que la app mezclaba tres usuarios en una sola barra: la pestaña «Necesito» (voz de la cuidadora) mostraba la cola de todos los casos con alias, alcaldía, puntaje y botón «Asignar», que es la vista del operador. Una cuidadora vería a otras familias, lo que contradice el protocolo de protección de datos. Omar pidió resolverlo de la forma más simple posible porque es un piloto que se mostrará rápido.
**Qué se hizo** (`Frontend/index.html`, `css/app.css`, `js/app.js`; se modificaron los archivos vigentes, sin versiones nuevas). Una barra «Ver como: Cuidadora · Relevo · Programa» bajo el encabezado; es solo para la demostración (en un piloto real cada rol entraría con su cuenta). **Cuidadora:** una sola pantalla con «Solicitar relevo» y, al terminar la solicitud, solo su caso (prioridad en texto, horas al mes y por semana, estado); sin barra de pestañas. **Relevo:** una sola pantalla con «Registrarme» y, después, solo su registro (estado, carga y casos). **Programa:** las 4 pestañas de antes, renombradas «Casos» y «Relevos». Los códigos ENASIC (P6_7, etc.) de la entrevista solo se muestran en la vista Programa. Se quitó el aviso de «componente complementario» de la lista del programa (sigue en las vistas de la cuidadora). El caso o registro propio se recuerda en `localStorage` (`mientras-mi-caso`, `mientras-mi-relevo`; rol en `mientras-rol`). No se tocaron la priorización, los datos simulados ni `config.js`.
**Verificado.** Render en Chromium a 390 px: sin errores de JavaScript; el flujo completo de solicitud y el registro de relevo funcionan en cada rol; con el rol Cuidadora, escribir `#casos` en la dirección no abre la cola; el rol y el caso propio se conservan al recargar.
**Pendiente.** Doble revisión. Lo demás de la revisión de diseño sigue sin hacer: bloque Zarit con 12 renglones de marcador, Barthel en menús en vez de chips, selector de sexo solo con íconos de color, contraste bajo del texto tenue (3.3:1) y tamaños de 9.5–11 px, tres estilos de lista. El README de `Frontend/` todavía describe las pestañas anteriores.

### 2026-10-24 (17:05) — Mientras: ajustes chicos de diseño y pantalla de bienvenida
**Por qué.** Pendientes de la revisión de diseño del mismo día y pedido de Omar de una pantalla de carga para la primera vez que se abre la app. Criterio: lo más simple posible, porque es un piloto para mostrar rápido.
**Qué se hizo** (`Frontend/index.html`, `css/app.css`, `js/app.js`; se modificaron los archivos vigentes). (1) **Bienvenida:** la primera vez se ve el logo con una barra de carga (≈1.7 s) y luego «¿Cómo vas a usar Mientras?» con tres opciones (cuido a un familiar · quiero dar relevo · trabajo en el programa), que fijan el rol. Se guarda en `localStorage` (`mientras-intro`) y no vuelve a salir; se repite con `?intro` en la dirección o con «Ver la bienvenida otra vez» en Ajustes. Respeta «reducir movimiento». (2) El logo de la familia con corazón reemplaza el cuadro de color del encabezado. (3) **Zarit:** los 22 marcadores «[Reactivo — requiere licencia]» se cambiaron por una tarjeta «Este bloque todavía no está activo»; el bloque sigue sin afectar el puntaje. (4) **Barthel:** de 10 menús desplegables a chips, como el resto de la entrevista. (5) **Sexo:** los íconos ahora dicen «Mujer» y «Hombre». La nota «variable SEXO de la ENASIC» solo se muestra en la vista Programa. (6) **Resultado:** la cuidadora ve «Prioridad Alta» en color neutro y sin «20 de 20 puntos»; el programa sigue viendo nivel en color y puntos. (7) **Lista de casos:** una sola vista (se quitaron Tarjetas y Mosaico), sin el puntaje repetido, y «0 sem en cola» pasa a «Nueva» en gris. (8) **Contraste y tamaño:** texto tenue de 3.3:1 a 4.8:1, etiquetas de la barra inferior de 3.1:1 a 4.7:1, ámbar de 3.7:1 a 5.3:1; etiquetas de 9.5 px a 10.5–11 px.
**Verificado.** Render en Chromium a 390 px sin errores de JavaScript: bienvenida → elegir rol → solicitud completa con Zarit vacío y Barthel en chips → caso en la cola del programa; la bienvenida no reaparece en la segunda visita y sí se reabre desde Ajustes.
**Pendiente.** Doble revisión.
