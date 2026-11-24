# Frontend — RedCare: relevo por horas para quien cuida (prototipo móvil)

App en HTML/CSS/JS puro, sin build ni dependencias. Se presenta como app móvil (en escritorio, dentro de un marco de teléfono).

```bash
python -m http.server 8000   # desde Frontend/, o abrir index.html con doble clic
```

**Datos simulados.** Casos, personas de relevo, visitas, incidentes y respuestas semanales vienen de `seed()` en `js/data.js` y se guardan en `localStorage` (clave `mientras-v3`; antes `care-relevo-v2`). No hay backend. Demuestran que el flujo funciona; **no validan la hipótesis ni miden impacto.** Las respuestas semanales de ejemplo se generan sin tendencia a propósito.

## Qué cambió (2026-11-20): minimización de datos y contratos

Sale de `Analysis/matrices/matriz_tratamiento_datos_redcare.csv` (filas D09, D10, D21, D24 y D27).

| Antes | Ahora |
|---|---|
| Entrevista 1/3 preguntaba 5 actividades básicas (P6_2_01…08) | **Retiradas.** Ya no puntuaban y el Barthel mide lo mismo. Se fue también el chequeo «≥ 3 actividades con Barthel 100» |
| Lista de 4 tareas de salud guardada una por una | Una pregunta sí/no. Se guarda solo `enfermeria: true/false`; si es sí, el resultado y el detalle del caso orientan a enfermería |
| CURP del relevo guardada completa en `localStorage` y en «Exportar todo» | Se valida y se descarta. Se guarda `{ huella, ultimos4 }` (SHA-256 con clave, `js/huella.js`) y `mayorDeEdad`. Los duplicados se detectan por huella |
| Nombre y teléfono de la referencia guardados sin plazo | Se muestran al programa mientras el registro está en revisión y se **borran al aprobar o rechazar**; queda `{ estado, fecha }` |
| Casilla «Contrato, IMSS y pago al piso legal» | **Contrato de trabajo** que se lee (resumen de una pantalla + texto plegado) y se firma escribiendo el mismo nombre del registro. Si cambian nombre, días, horario o tareas, la firma deja de valer |
| La solicitud terminaba en «Resultado» | Paso 8/8 **Convenio de servicio**: resumen, texto plegado y firma con el alias. Sin firma no se envía |
| Asignación con casilla «Contrato por escrito» | Se comprueba que el convenio del hogar y el contrato de la persona de relevo estén firmados |

**Modelo de partes: plataforma digital, como Uber, DiDi o Rappi (segunda versión del 20 nov).** El operador de RedCare gestiona la plataforma y es el patrón de las personas de relevo bajo el Capítulo IX Bis de la Ley Federal del Trabajo (arts. 291-A a 291-U, DOF 24-dic-2024). Lo que eso pone en la app:
- **El hogar es usuario** (291-B: usuarios y beneficiarios no son patrones ni responsables solidarios). Firma el convenio de servicio y no paga.
- **La persona de relevo se conecta cuando quiere** y acepta o rechaza cada oferta sin penalización (291-E). La asignación exige ahora la casilla «aceptó la oferta».
- **Pago por visita con proporcionales** (291-F): piso del salario mínimo profesional de trabajo del hogar × 1.249 (descanso 1/6, aguinaldo 15/365, vacaciones 12/365 y prima 25 %) = $53.46/h diurna, $57.03 mixta, $61.10 nocturna. `factorPrest` en Ajustes pasa de 0 a 25 %. El factor es una aproximación del prototipo: la regla oficial la emite la STPS.
- **IMSS según ingreso** (291-C): completo el mes que la persona gane al menos un salario mínimo mensual neto ($9,582.47 en 2026); si no, es independiente y el operador la asegura solo contra riesgos de trabajo mientras trabaja. El contrato le dice a cada persona, con sus horas declaradas, si llega o no.
- **Política de asignación** (291-J): las reglas reales de `relevo.js` en lenguaje llano, como anexo del contrato (`CT.POLITICA`): restricciones, el más cercano gana, empate al de menos carga, sin estrellas ni ranking, rechazar no castiga, incidentes con revisión humana.

Esto reemplaza la primera versión del mismo día (operador como patrón por el régimen general), que chocaba con la prohibición de subcontratación de personal.

**Lo que este modelo NO resuelve (hay que decirlo en la presentación):**
- **Casi nadie llegaría al IMSS completo.** Hacen falta ≈ 180 h de relevo al mes (≈ 42 h por semana). Con el máximo de 12 h por semana de un relevo típico, el ingreso es ≈ $2,778 al mes. Es el mismo problema de Uber y Rappi: al 31 de julio de 2026, solo 247,900 de 1.59 millones de personas beneficiadas superaron el umbral (Xataka, con datos oficiales). RedCare formaliza, pero en su mayoría como independientes.
- **Por dictaminar (Daniel):** si el cuidado en casas cabe en el Cap. IX Bis (el 291-A no lista servicios; habla de actividades que requieren presencia física, y las guías del IMSS hablan de choferes y repartidores); el registro del modelo de contrato ante el Centro Federal de Conciliación y Registro Laboral (291-G); si el piso debe ser el salario mínimo profesional del hogar (se usó, por ser el más alto) o el general; y que el aseguramiento sigue en reglas transitorias del IMSS tras la prueba piloto de 2025.

**Consentimiento de la persona cuidada (paso nuevo, 4/9).** El Barthel y el relevo son sobre ella y ocurren en su casa, así que ya no basta el consentimiento de quien cuida:
- *Está aquí y decide*: ella marca en primera persona que acepta → `otorgado`.
- *No puede expresar su voluntad*: quien cuida elige el tipo de representación (legal o tutela, persona de apoyo, poder notarial) y se compromete a mostrar el documento en la primera visita → `por_acreditar`. No se guarda copia ni el nombre del representante.
- *No está ahora*: no se pregunta el Barthel y el consentimiento se pide en la primera visita → `pendiente`.
- **Sin `otorgado` o `acreditado` no se puede asignar relevo.** El programa lo registra desde el detalle del caso («Registrar consentimiento» o «Acreditar representación»). La cláusula 7 del convenio cambia según la opción. Los casos guardados antes quedan `pendiente`; en el ejemplo, C-0006 tiene representación por acreditar.

**Qué se guarda de cada firma:** tipo, versión (`RC-CS-2026-11-20` / `RC-CT-2026-11-20`), firmante, fecha y hora, método y la huella SHA-256 del texto. No se guarda el texto. Los casos y relevos del ejemplo traen una firma marcada `simulado`. Versiones vigentes: `RC-CS-2026-11-20.2` y `RC-CT-2026-11-20.2`.

**Límites.** La clave de la huella está en el código: en el prototipo cualquiera la ve; en un piloto se calcula en el servidor (HMAC). Los contratos son borradores para la UCA, no están dictaminados. La aceptación de la oferta la marca el programa: falta que la persona de relevo la acepte desde su propia vista. Tras registrar el consentimiento en persona falta capturar el Barthel en la visita (hoy queda vacío).

**Datos guardados antes de este cambio** se migran al abrir la app: se borran `abvd` y `clin`, la CURP en claro se cambia por su huella y se borran las referencias de registros ya resueltos.

**Archivos nuevos:** `js/huella.js`, `js/contrato.js`, `tests/prueba_privacidad_contrato.js` (`node tests/prueba_privacidad_contrato.js`, 32 verificaciones). **Modificados:** `index.html`, `css/redcare.css`, `js/app.js`, `js/config.js`, `js/data.js`, `js/legal.js`, `js/prioridad.js`, `js/relevo.js`.

## Qué cambió (2026-10-24): una vista por rol y bienvenida

- **Bienvenida** la primera vez: logo con barra de carga y «¿Cómo vas a usar RedCare?» (cuidadora · relevo · programa). Se repite con `index.html?intro` o desde Ajustes.
- **Barra «Ver como»** bajo el encabezado (solo para la demostración; en un piloto real cada rol entraría con su cuenta):
  - **Cuidadora:** una pantalla; pide relevo y después ve **solo su caso** (prioridad en texto, horas, estado). No ve otras familias ni códigos ENASIC.
  - **Relevo:** una pantalla; se registra y ve **solo su registro**.
  - **Programa:** las 4 pestañas (Casos, Relevos, Seguimiento, Ajustes) con todo lo descrito abajo.
- Zarit sin marcadores (tarjeta «no activo»), Barthel con chips, sexo con texto, una sola vista de lista y contraste AA. Detalle en la bitácora (24 oct, 17:00 y 17:05).
- Lo que sigue abajo describe la vista **Programa**. Donde dice «tres vistas (lista, tarjetas, mosaico)», hoy solo queda la lista.

## Qué cambió (2026-10-20): Mientras, priorización con bolsa de horas

Nombre y eslogan **provisionales** («Mientras · Relevo por horas para quien cuida»): los propuso Claude a pedido de Omar; se cambian en `js/config.js`. **Reemplazados el 26 oct 2026** por «RedCare · Una red que cuida a quienes cuidan» (ver abajo).

Flujo: **Entrada → Registro → Consentimiento → Entrevista (3 bloques) → Puntaje y nivel → Horas asignadas → Asignación de relevo por el programa.**

| Antes (8 oct) | Ahora (20 oct) |
|---|---|
| La institución canalizaba con 3 preguntas | Dos vías: **autorregistro** o **referencia institucional** (DIF, centro de salud, escuela, clínica, módulo). `canal_origen` obligatorio |
| Prioridad 1/2 por la regla ≥ 40 h | Desde el 2 nov 2026: **regla de entrada de 40 h o más a la semana** (dos niveles: dentro / fuera). La tarjeta de puntos del script 22 se retiró (ver bitácora, 2 nov noche). Las horas efectivas más la espera solo ordenan el reparto de la bolsa. No está probado que la regla sea mejor que un modelo |
| Paquete de 3-12 h elegido al canalizar | **Bolsa mensual** (`presupuesto_horas_mes`): mínimo garantizado a todas y el resto proporcional al puntaje, con tope por hogar. El paquete semanal sale de esas horas |
| Daño a la salud y al trabajo, red de apoyos y parentesco al canalizar | **Minimización**: solo lo que usa el puntaje o la asignación. Sin CURP, diagnósticos, edad ni domicilio de la familia |
| Sin explicación del resultado | Los 3 factores que más pesaron, «Puntaje provisional — modelo en validación» y botón **Solicitar revisión** (apelación) |
| — | **Chequeos de consistencia** (horas contra Barthel, actividades básicas contra Barthel, horas inverosímiles, Zarit contra «falta fuerza» y «requiere apoyo»): mandan a **revisión humana**, no bajan el puntaje |
| — | Nivel Baja: canal alterno (redes de apoyo y servicios públicos; directorio **pendiente**) |
| — | Seguimiento › **Programa**: bolsa, niveles, **puntajes por canal**, revisiones y apelaciones |

**Archivos nuevos:** `js/config.js` (todos los parámetros), `js/prioridad.js` (entrevista, puntaje, niveles, envejecimiento, reparto, Zarit, Barthel, chequeos; funciones puras), `tests/prueba_asignacion.js` (`node tests/prueba_asignacion.js` desde `Frontend/`). **Modificados:** `index.html`, `css/app.css`, `js/app.js`, `js/data.js`, `js/relevo.js` (solo el encabezado).

### Lo que hay que saber antes de presentarlo
- **El puntaje no supera a la regla de 40 h** (script 22: +2.2 pp, IC 90 % −3.4 a 7.7). Repartir horas en proporción a él supone que 10 puntos = el doble de necesidad que 5: nadie lo ha validado.
- **«Nadie queda fuera» depende de la bolsa**, no del código: si `presupuesto_horas_mes` < casos × `horas_minimas`, el mínimo va a los puntajes más altos y el resto espera con su puntaje envejeciendo (escenario 2 de la prueba).
- Con los mínimos garantizados, la diferencia entre niveles es chica (prueba con 100 personas: Alta ≈ 23.5 h/mes, Baja ≈ 16.1).
- Las dos variables que más pesan después de las horas («le falta fuerza», 4; «requiere apoyo», 3) son autodeclaradas con un solo sí: son las más fáciles de manipular. Los chequeos las cruzan con Barthel y Zarit, pero Zarit no tiene reactivos todavía.
- `mujer` = 2 puntos: confirmar con Daniel si un programa público puede puntuar por sexo.
- Los casos del ejemplo están armados para que el panel muestre más puntajes bajos en autorregistro. **Es una ilustración, no un hallazgo.**
- La bolsa del ejemplo es **simulada** (260 h para 11 casos; control en Ajustes). La del archivo (2,000 h) es ilustrativa.

### Personajes
Desde el 26 oct 2026 la app usa personajes propios, en `observatorio/ilustraciones/` (WebP de 720 px, 38–117 KB): `bienvenida_relevo.webp` (bienvenida de la solicitud y «Necesito relevo»), `resultado_alta.webp`, `resultado_media.webp`, `resultado_baja.webp` y `puedo_cuidar.webp` («Puedo cuidar», diálogo de registro y tarjeta de Relevos). Los tres resultados muestran relevo ocurriendo y cambian quién cuida y a quién se cuida, no el ánimo de la cuidadora. Se regeneran con `python ilustraciones/build_personajes_app.py` (desde `Frontend/observatorio`), que reutiliza el recorte de `build_ilustraciones.py`. Son ilustraciones generadas: no son datos ni personas reales. Antes (20–25 oct) se usaban `logo_personajes.webp`, `agotada.png`, `cuidadoraSilla.png` y `familia.png` del Observatorio; esos archivos siguen ahí porque el Observatorio los usa.

## Qué cambió (2026-10-08, opción C)

La app dejó de ser un buscador de cuidadoras ("encontrar a alguien") y ahora opera el **relevo por horas** para cuidadoras familiares de alta intensidad (hallazgo B) en beneficio de la persona cuidada (A).

| Antes | Ahora |
|---|---|
| Petición en texto libre + clasificador de reglas | Canalización por la institución con 3 preguntas: horas, ayuda en actividades básicas, daños |
| Matching por suma ponderada (habilidades, zona, turnos, tarifa) | Solo restricciones; se propone **una** persona, sin catálogo ni calificación |
| Contratación en jornada abierta, tarifa libre ≥ piso | Paquete de 3, 6, 9 o 12 h/sem, horario fijo, lista cerrada de tareas sin tareas clínicas |
| CURP y datos de salud de la familia al publicar | La institución valida identidad fuera de la app; la familia solo da alias |
| Piso = salario mínimo general ÷ 8 | Salario mínimo profesional de trabajo del hogar ÷ 8, 7.5 o 7 según la jornada (como el script 15) |
| Sin seguimiento | Llegada y salida, ausencias, incidentes en ambos sentidos, 2 preguntas semanales y KPI operativos |
| Red del hogar y territorio | **Se quedan**, con el relevo asignado como nodo |

**Se eliminaron** `js/clasificador.js` y `js/matching.js` (pertenecían a la hipótesis de "encontrar cuidadora", descartada el 22 sept). **Corrección del 20 oct 2026:** no hay `.git` en la carpeta, así que no quedan en ningún historial. Las copias que estaban en `../_to_delete/` se borraron el 20 oct 2026: ya no existen.

## Pestañas
1. **Necesito** — (desde el 20 oct) botón «Solicitar relevo» con el flujo de arriba; casos ordenados por puntaje efectivo, con nivel, horas al mes, canal y marcas de revisión. Antes: casos canalizados en tres vistas (lista, tarjetas, mosaico). Cada caso muestra quién cuida a quién (ícono de mujer u hombre), horas, ABVD, alcaldía, paquete, costo al mes y relevo. Al tocarlo se abre el detalle con costo, pagador, historial, fragilidad, tareas y la tasa de la ENASIC.
2. **Puedo cuidar** — personas de relevo con certificación, disponibilidad y cupo. Registro con CURP, identificación, carta de no antecedentes y referencia; pasa a revisión. Sin certificación vigente no recibe asignaciones.
3. **Seguimiento** — *Visitas* del día (llegó, salió, no llegó, canceló); *Caso*: red del hogar (apagar un nodo), dos preguntas semanales e incidentes; *Mapa* por alcaldía; *KPI* marcados SIMULADO con exportación de agregados.
4. **Ajustes** — distancia máxima, factor de prestaciones, parámetros con su fuente, marco legal y datos.

Las confirmaciones usan diálogos propios (no `confirm()`/`prompt()`) y "Exportar" muestra el JSON para copiar, para que también funcione como artefacto.

## Reglas y de dónde salen

| Regla | Valor | Fuente |
|---|---|---|
| Focalización | ≥ 40 h/sem; con ayuda en actividades básicas = Prioridad 1 | Notebook 11: el modelo no supera a la regla de forma demostrable (+2.2 pp, IC 90 % −4.1 a 8.5) |
| Tasas de daño mostradas | 79.6 %, 70.5 %, 54.9 %, 42.6 % | `resultados/07_enasic_necesidad_vs_norma_estimaciones.csv`, bloque `5_danos_entre_sin_necesidad`. Nacionales, entre quienes no buscaron servicios por "no necesitarlos" |
| Casos bajo 40 h | Se registran "fuera de la regla"; la institución puede incluirlos con motivo escrito | Criterio del programa; las excepciones se cuentan en los KPI |
| Salario diario | $342.47 | CONASAMI, DOF 09-dic-2025 (igual que el script 15). **Por verificar vigencia** |
| Tipo de jornada | Diurna 06-20 h; nocturna 20-06 h o ≥ 3.5 h nocturnas; si no, mixta. Máx. 8, 7 y 7.5 h por visita | LFT arts. 60-61, igual que el script 15. **Por verificar con el DOF (Daniel)** |
| Semanas por mes | 4.33 | Mismo supuesto que el script 10 |
| Prestaciones | 0 % por defecto (sin prestaciones); ajustable | **Por definir con Daniel** |
| Cercanía | ≤ 12 km entre centros de alcaldía (ajustable) | Aproximación del prototipo: no se guardan domicilios |
| Asignación | Aprobada, certificada, cerca, disponible esos días y horas, con cupo, cubre las tareas. Gana la más cercana; empate → menor carga | Definición del prototipo |

## KPI operativos (pestaña Indicadores)
Casos canalizados y % dentro de la regla · incluidos por criterio · mediana de días de canalización a asignación · casos en espera · horas entregadas / programadas (28 días) · puntualidad (≤ 10 min) · ausencias · incidentes por 100 h · continuidad a 4 semanas (activo y sin cambio de relevo) · % de respuesta semanal · cansancio promedio · personas certificadas / aprobadas · cupo libre.

El JSON exportado (`operacion_agregados_SIMULADO.json`) trae solo totales: sin folios, alias, alcaldías ni fechas por caso. Es la entrada prevista para una pestaña "Operación" del Observatorio. Con el piloto, los registros por caso se quedan en la institución.

## Protección de datos
- La familia no captura CURP ni nombre completo: la institución valida identidad y legitimación fuera de la app.
- Horas de cuidado, Barthel, la bandera de tareas de salud y el cuestionario «Cómo te sientes» son datos sensibles: la solicitud exige consentimiento expreso. Desde el 20 nov ya no se preguntan actividades básicas.
- La CURP del relevo no se guarda completa (huella) y la referencia se borra al resolver el registro.
- "Exportar todo" (Ajustes) incluye alias y respuestas sobre salud. Con datos reales, ese archivo no sale de la institución.
- Ley aplicable: desde el 18 nov 2026 RedCare se trata como sector privado (Ley Federal de Protección de Datos Personales en Posesión de los Particulares, 2025). Artículos **por verificar con Daniel**.

## Lo que la app no resuelve
- **Quién paga.** La app muestra el costo y lo que le toca a la familia, pero la fuente del subsidio no existe todavía.
- **La oferta.** Si la certificación es el cuello de botella, la app lo hace visible (personas aprobadas sin certificación, casos sin propuesta), no lo resuelve.
- **El efecto.** Las 2 preguntas semanales no son un instrumento validado y no hay grupo de comparación. La escala corta de Zarit es candidata; su validación en México está por confirmar.

## Archivos
`index.html` · `css/app.css` · `js/config.js` (parámetros de priorización) · `js/prioridad.js` (puntaje, niveles, reparto, instrumentos, chequeos) · `js/data.js` (catálogos, datos simulados, almacenamiento) · `js/legal.js` (parámetros legales y requisitos) · `js/huella.js` (SHA-256, huella de CURP) · `js/contrato.js` (convenio y contrato, firma) · `js/relevo.js` (focalización, paquetes, jornada, costo, asignación) · `js/red.js` (red del hogar) · `js/app.js` (interfaz) · `js/cdmx-alcaldias.js` (límites de alcaldías) · `vendor/d3.min.js` (d3 7.9.0) · `tests/prueba_asignacion.js` · `tests/prueba_privacidad_contrato.js`.

**Fuente de los límites:** INEGI, Marco Geoestadístico 2020, publicado en el Portal de Datos Abiertos de la CDMX (https://datos.cdmx.gob.mx/dataset/alcaldias). Simplificados para visualización.

## Qué cambió (2026-10-26, tarde): nombre RedCare

- Nombre «RedCare» y eslogan «Una red que cuida a quienes cuidan» en `js/config.js` (de ahí salen la bienvenida y la línea bajo el título), `index.html` y textos visibles.
- Se quitó la franja superior («RedCare · prototipo · datos simulados» con reloj). La aclaración de datos simulados sigue en la pantalla de bienvenida, en el pie de Seguimiento y en el JSON exportado.
- Las claves de `localStorage` siguen con prefijo `mientras-` (renombrarlas borraría los datos guardados en cada navegador).

## Interfaz (5 nov 2026)
- `css/redcare.css` (identidad visual, mapa claro) y `js/interaccion.js` (lista propia dentro de la hoja, conteo, confeti) se cargan después de `app.css` / `app.js`.
- Se quitó la pestaña KPI de Seguimiento, el filtro y las insignias de «Revisión» en la lista y el banner «SIMULADO»; el aviso de datos simulados queda en la etiqueta de la cabecera y en el pie del panel. La revisión humana y las apelaciones siguen existiendo (texto en el detalle del caso y lista «Por revisar» en Programa).
- Respaldo de la versión anterior: `_to_delete/backup_pre_redcare_ui_2026-11-05/`.

## Qué cambió (2026-11-21)
- Se retira la carta de no antecedentes penales del registro de relevo. La SCJN invalidó exigirla de forma general (AI 38/2022, cuidado infantil; AI 111/2023, conductores de plataformas). La sustituyen verificación de identidad, referencia, entrevista, certificación y primera visita acompañada. Los datos viejos pierden el campo `antecedentesFecha` al cargarse.
- Contrato de trabajo en plataforma: versión `RC-CT-2026-11-21.3` (cláusula 2 sin la carta). Las firmas anteriores piden volver a firmar.
- Aviso de privacidad simplificado en `js/config.js` (antes era un marcador). El aviso integral y el análisis jurídico están en la documentación integral (capítulo 11).
- Pruebas: Node (asignación, privacidad y contratos) y flujo en Chrome 34/34, sin errores de JavaScript.

## Qué cambió (2026-11-24)
- Las ilustraciones pasan a ser marca de agua de un solo color (lavanda sobre fondo claro, blanco tenue sobre el pase oscuro), al estilo del Ángel en los carteles de la CDMX. Versiones en `img/marca_agua/`, generadas desde `observatorio/ilustraciones/`.
- La bienvenida («¿Cómo vas a usar RedCare?») sale siempre al abrir la app.
- «Necesito relevo» y «Puedo cuidar» muestran primero cómo se ve sin registro y abajo un ejemplo con datos simulados (una solicitud y un registro de relevo).
- Se quitó el mapa de Seguimiento y su código (`cdmx-alcaldias.js` ya no se carga).
- Pruebas: Node (asignación, privacidad y contratos) y flujo en Chrome 34/34, sin errores de JavaScript.

## Qué cambió (2026-11-24, tarde)
- Bienvenida como red: el logo al centro y tres nodos conectados (cuido, doy relevo, programa). Tocas tu lugar, se enciende su línea y aparece una ficha con «Entrar».
- Datos FICTICIOS de operación: domicilio (solo con relevo asignado; se borra al cerrar el caso), cuenta de pago de la persona de relevo (banco y últimos 4 dígitos) y contactos opcionales (emergencia y persona autorizada, en «Contactos»).
- Seguimiento semanal: se agrega «¿Pudiste trabajar o estudiar?» (sí, en parte, no).
- Aviso de privacidad simplificado v3, alineado con el aviso integral v3 (`Documentos/Aviso_de_Privacidad_RedCare_v3`). Responsable y correo ficticios.
- Esquema PostgreSQL: 21 tablas (domicilio, contacto, pago_relevo, seguimiento_semanal) con 12 pruebas de restricciones en `Backend/sql/pruebas.sql`.
- Pruebas: Node, flujo en Chrome 34/34 y prueba nueva de domicilio, contactos, pago y empleo 13/13, sin errores de JavaScript.

### 24 nov 2026 (noche) · Pantalla de carga «Pulso»
- Una línea de latido cruza la pantalla, su pico se vuelve el logo y late con ondas lavanda, menta y coral; abajo, una barra con mensajes.
- Completa (≈3.4 s) la primera vez de cada sesión del navegador; después, o con «reducir movimiento», versión corta (≈0.9 s).
- La barra marca el tiempo de la animación, no una descarga real.
