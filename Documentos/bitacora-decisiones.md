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
