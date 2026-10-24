# Observatorio del Cuidado — prueba piloto (actualizado el 7 oct 2026)

Sitio de una sola página con formato de observatorio de datos y navegación en una barra lateral. `index.html` solo tiene la estructura; los estilos viven en `css/` y el código en `js/` (ver «Estructura de archivos»). Usa la paleta y las fuentes del prototipo de `Frontend/` (Archivo, JetBrains Mono). Las escenas 3D del Inicio usan three.js r128 guardado en `vendor/` (licencia MIT), sin CDN, para que la página siga abriendo con doble clic.

**Datos reales agregados. Sin datos simulados ni personales.** Ninguna cifra está escrita a mano: `build_datos.py` lee los archivos de `Analysis/resultados`, `Analysis/outputs` y `Analysis/matrices`, genera `datos_observatorio.json` y los dos scripts de datos de la página (`js/datos/datos.js` y `js/datos/geo.js`). Los límites de las alcaldías vienen de `Frontend/js/cdmx-alcaldias.js` (INEGI, Marco Geoestadístico 2020). Si falta un archivo o una fila esperada, el script se detiene en vez de publicar un hueco.

```bash
python -B DW/etl/run_etl.py                   # 1. desde la raíz: reconstruye el almacén con los resultados de Analysis/
python Frontend/observatorio/build_datos.py   # 2. después del ETL; correr de nuevo después de los notebooks
```

**Desde el 21 oct 2026, una parte de los datos pasa por el almacén:** `Analysis/ → ETL → DW/observatorio_dw.sqlite → build_datos.py → página`. Hoy pasan por ahí `territorio.alcaldias`, `territorio.totales` (sumas de esos valores) y `relevo.filas`. Se quedan del archivo `ql_plazas` y `pob65_prec`, porque el DW no los tiene, y todos los demás bloques. `build_datos.py` se detiene si el almacén no existe, si su última corrida falló, si viola la regla de alcance (`v_violaciones_alcance`) o si algún archivo de `Analysis/` que alimenta esos bloques cambió desde la corrida (compara su SHA-256 con `etl_archivo`). La página **sigue abriéndose con doble clic**: no necesita servidor. Al cambiar la ruta, ninguna cifra cambió (comparación valor por valor contra la construcción anterior); solo los textos de «Archivo», que ahora citan la corrida del ETL, y el bloque nuevo `territorio.almacen`.

## Estructura de archivos
```
observatorio/
├── index.html              estructura de la página (se edita a mano; ya no se genera)
├── build_datos.py          lee Analysis/ y escribe datos_observatorio.json + js/datos/*
├── datos_observatorio.json copia legible de los datos (la página no la lee)
├── vendor/three.min.js     three.js r128 (MIT), solo para las escenas 3D del Inicio
├── ../vendor/svg-maps-mexico/  contornos esquemáticos de las 32 entidades (CC BY 4.0); los lee build_datos.py
├── ilustraciones/          originales y recortes de las figuras 2D del embudo + build_ilustraciones.py
├── css/                    orden de carga: base → layout → componentes → graficas → vistas
│   ├── base.css            tokens (paleta, fuentes), reinicio, utilidades
│   ├── layout.css          barra lateral con pestañas, vistas, cuadrícula, pie
│   ├── componentes.css     tarjetas, fichas plegables, chips, selectores, tablas, acordeones
│   ├── graficas.css        barras con IC, leyendas, texto SVG, mapa
│   └── vistas.css          portada (tres marcos con escena 3D) y barra de filtro/comparador
└── js/                     se cargan en este orden (ver index.html)
    ├── datos/              GENERADOS por build_datos.py: datos.js (var D), geo.js (var GEO, alcaldías), geo-estados.js (var GEO_EST, 32 entidades) y geo-ageb.js (var GEO_AGEB, AGEB urbanas y oferta núcleo)
    ├── nucleo/             obs.js (espacio de nombres OBS), util.js, alias.js, filtro-segmento.js
    ├── graficas/           componentes.js (lolli, dona, waffle, anillos, líneas, rampa) y motor-3d.js
    │                       (escenario 3D con piso que refleja, materiales y personajes)
    ├── vistas/             un archivo por pestaña (inicio, necesidad, barreras, segmentacion,
    │                       relevo, focalizacion, territorio, indicadores, metodo) + inicio-3d (escenas del Inicio)
    │                       + territorio-estados (segunda parte de ¿Dónde?: 32 entidades y zonas por AGEB)
    │                       + territorio-tipologia (tercera parte de ¿Dónde?: tipología de AGEB, modelo 2)
    │                       + inicio-contadores (va después de territorio.js: cuenta alcaldías y gráficas pintadas)
    └── app/                plegables.js (fichas plegables) y pestanas.js (navegación y arranque)
```
Reglas:
- **Scripts clásicos, no módulos ES**: la página se abre con doble clic (`file://`) y el navegador bloquea `import` y `fetch` en ese modo. Por eso los datos van en `.js` y no se leen del `.json`.
- Cada archivo de `js/` es una función autoejecutable que **importa** de `OBS` lo que necesita al inicio y **exporta** lo que otros usan al final; la cabecera de cada archivo lo lista.
- El orden de las etiquetas `<script>` importa: un módulo solo puede usar lo exportado por los que cargan antes. `barreras.js` va antes de `segmentacion.js` porque este llama a `renderRaz` y `renderPref`; el estado del filtro (`F`, `SG`) vive en `nucleo/filtro-segmento.js` para que los dos lo vean.
- `plegables.js` y `pestanas.js` van al final: reacomodan el DOM que pintaron las vistas.
- Para una pestaña nueva: sección en `index.html`, archivo en `js/vistas/`, etiqueta `<script>` antes de `inicio-contadores.js`, y su botón (con ícono SVG) en `.tabs` de la barra lateral.
- `inicio.js` pinta los textos y las tarjetas del Inicio con cifras de `D`; `inicio-3d.js` va después porque engancha las escenas a esas tarjetas. Si no hay `THREE` o WebGL, el bloque oscuro y cada marco reciben la clase `no3d`: se ocultan las escenas y quedan las tarjetas.
- Los objetos 3D de «Lo que encontramos» se dibujan con las mismas cifras de `D` que sus tarjetas (alturas, conteos, arcos e IC). Las figuras de personas son ilustración: no son datos ni personas reales.
- `css/` de esta carpeta es independiente de `Frontend/css/app.css` (el prototipo de la app); solo se copió la paleta.

## Cambio del 7 oct 2026 (21:30): pestaña ¿Cuánto cuesta? con más contenido
- Nueva tarjeta «¿Qué parte del ingreso se lleva?» (`pct_ingreso_mediano`, que ya estaba en los datos) y tres servicios en «¿Cuánto se paga hoy por hora?». `build_datos.py` agrega `horas_sem_mediana` al bloque `pago`. La advertencia «Poder pagar no es querer contratar» ya no va plegada. Detalle y límites en la bitácora; respaldo en `_to_delete/backup_pre_relevo_lleno_2026-10-07/`.

## Cambio del 7 oct 2026 (noche, después): embudo con ilustraciones 2D
- Las cinco escenas de «¿Cuántas personas están en el problema?» pasaron de personajes 3D a ilustraciones 2D tratadas como figuras recortadas con grosor (borde blanco, canto lavanda en capas, sombra proyectada, reflejo en el piso, brillo al girar y giro hacia el cursor). Los accesorios con mensaje (reloj «40 h +», globo «no tuve necesidad», gota, alerta, maletín) siguen en 3D. Decisión del equipo: por ahora 2D; los personajes 3D quedan como respaldo si falta `OBS.ILU`.
- Escena → ilustración (ver cambio posterior abajo): Cuidan → familia; Discapacidad o 60+ → cuidadora con persona mayor en silla de ruedas; 40 h o más → doble jornada (laptop y canasta de limpieza); «No tuve necesidad» → llamada por teléfono; Con daño → cansancio (escoba y mano en la frente).
- `ilustraciones/` guarda los originales (`*_original.*`) y los recortes en PNG; `ilustraciones/build_ilustraciones.py` recorta el fondo y genera `js/graficas/ilustraciones.js` (WebP en data URI, porque WebGL no lee imágenes locales con `file://`). Correr de nuevo si cambia una imagen.
- `motor-3d.js`: los materiales con `userData.ladoFijo` no cambian de lado al dibujar el reflejo (si no, los planos de las figuras 2D no se reflejaban).
- Las ilustraciones no son datos ni personas reales. Copia previa en `_to_delete/backup_pre_ilustracion2d_2026-10-07/`.

- 7 oct 2026 (noche): se cambiaron dos ilustraciones del embudo. «Cuidan»: abuela en sillón con dos familiares (antes, abuelo con bastón). «40 h o más»: mujer que atiende el trabajo (laptop y teléfono) mientras hace labores domésticas (antes, laptop y canasta). `build_ilustraciones.py` ganó opciones para fondos muy blancos y sombras de piso (umbral estricto arriba, sombra de piso conectada al fondo, zonas protegidas). Originales anteriores en `_to_delete/backup_pre_familia_doblejornada_2026-10-07/`.

- 7 oct 2026 (noche, más tarde): «40 h o más» pasó a la cuidadora agotada junto a la abuela, con lista de tareas y reloj (sí muestra a quién se cuida; la de laptop y aspiradora quedó fuera). «Con daño» ahora es una figura de dos caras que da media vuelta cada 5.5 s: al frente, dolor en la oficina (daño al trabajo); atrás, dolor de espalda en casa (daño a la salud). Con «reducir movimiento» se queda en la cara frontal. Salieron el maletín, la gota y la alerta 3D de esa escena: las imágenes traen sus propias marcas de dolor. `build_ilustraciones.py` pasó a una configuración por imagen (huecos, umbral arriba, sombra de piso, zonas protegidas) y conserva las marcas chicas de color vivo. Archivos anteriores en `_to_delete/backup_pre_dano_dos_caras_2026-10-07/`.
- 7 oct 2026 (noche, al final): «No tuve necesidad» usa ahora la mujer que habla por teléfono mientras trabaja y aspira (sale la del teléfono sola). Junto al globo «no tuve necesidad» aparece cada 6 s un estallido rosa animado con «¡Mentiraaa!» (texto en la constante `MENTIRA` de `inicio-3d.js`; con «reducir movimiento» queda fijo). Archivos anteriores en `_to_delete/backup_pre_mentira_2026-10-07/`.
## Cambio del 7 oct 2026 (noche, después): medallón en «Los datos que cuidan»
- Salió el logo 3D del bloque oscuro (código retirado de `inicio-3d.js`; copia en `_to_delete/backup_pre_medallon_2026-10-07/`). En su lugar va la ilustración `ilustraciones/logo_cuidado.webp` (recorte circular de `logo_cuidado_original.jpg`, hecho por `build_ilustraciones.py`) como medallón: canto con grosor, aro crema, halo lila, brillo y giro leve hacia el cursor, flotación lenta y sombra (CSS en `vistas.css`, giro en `inicio.js`). Sin WebGL el medallón se sigue viendo: es una imagen normal.
- La ilustración no es un dato ni representa a personas reales.

- 7 oct 2026 (noche, al cierre): el medallón de «Los datos que cuidan» usa la misma escena en versión estilo plastilina (`logo_cuidado_original.jpg` reemplazado; la versión pintada quedó en `_to_delete/backup_pre_medallon_plastilina_2026-10-07/`). Así combina con las figuras del embudo.

- 7 oct 2026 (noche, al cierre 2): el bloque «Los datos que cuidan» deja el disco crema y muestra el emblema recortado (aro, corazón, reloj y personajes) con borde blanco y canto lila integrados en `logo_cuidado.webp`, como las figuras del embudo; halo, sombra, flotación y giro hacia el cursor siguen en CSS. Versión anterior en `_to_delete/backup_pre_emblema_recortado_2026-10-07/`.

- 8 oct 2026: el bloque «Los datos que cuidan» muestra solo a los personajes (sin aro, corazón ni reloj): `ilustraciones/logo_personajes.webp`, hecho por `build_ilustraciones.py` desde `logo_personajes_original.png` (quita los halos de color del borde). El emblema con aro sigue generándose (`logo_cuidado.webp`) y su `<img>` quedó comentado en `index.html` junto al activo: para regresar a él, se cambia una línea.

- 8 oct 2026: en la pestaña «¿Dónde?» las tarjetas «Valor más alto / más bajo» (`#ext`) muestran la silueta de la alcaldía (con su color del mapa) y una frase corta con la unidad y la advertencia de la capa (conteos pequeños, conteo vs. tasa, alcaldías sin dato). No se agregaron tarjetas nuevas. Código en `js/vistas/territorio.js` (`FR`, `silueta`), estilos en `css/vistas.css` (`.ext`). Las cifras no cambian.

- 8 oct 2026: la pestaña «¿Dónde?» suma dos tarjetas al final. (1) **México · 32 entidades**: mapa de entidades y gráfica «CDMX frente al país» con IC 90 %, con selector de siete indicadores (seis de personas de 60+ de la ENIGH 2022 y la marginación CONAPO 2020); las tarjetas `.ext` de abajo del mapa muestran la entidad más alta, la más baja y la seleccionada, con silueta. (2) **Zonas dentro de cada alcaldía**: cada AGEB urbana como punto (% sin derechohabiencia, color por grado de rezago). Código: `js/vistas/territorio-estados.js` (nuevo); datos: bloques `estados` y `zonas` de `build_datos.py`, que lee `Analysis/resultados/17_*.csv` (notebook A, sección 17) y `13_rezago_ageb_cdmx.csv`; contornos: `js/datos/geo-estados.js`, generado desde `Frontend/vendor/svg-maps-mexico/` (CC BY 4.0). Detalle en `Documentos/bitacora-decisiones.md`.

## Cambio del 9 oct 2026: tipología de AGEB en la pestaña ¿Dónde?
- La pestaña «¿Dónde?» suma una tercera parte con el segundo modelo (notebook D, sección 18): **mapa de las AGEB urbanas** con cuatro capas (tipo de zona, brecha de oferta con los 235 establecimientos núcleo del DENUE, viviendas sin internet y personas de 60+), lista de los cuatro tipos y perfil del tipo elegido frente a los otros tipos y a la CDMX. Clic en una AGEB para ver sus datos; las AGEB de frontera entre dos tipos se señalan.
- Tres gráficas para la decisión del piloto: dónde viven las personas de 60+ por tipo, viviendas sin internet (canal de la app) y personas de 60+ a más de 1 km de la oferta formal. Brechas por alcaldía, apiladas por tipo.
- Tarjeta «¿Qué tan confiable es la tipología?»: silueta contra una referencia sin grupos y estabilidad por k, comparación contra alternativas simples y robustez, con las condiciones en las que no debe usarse.
- Dos indicadores nuevos en Indicadores: viviendas sin internet y personas de 60+ en AGEB con brecha.
- Datos: bloque `tipologia` de `build_datos.py` (lee `Analysis/resultados/18_tipologia_*.csv`) y `js/datos/geo-ageb.js` (nuevo, generado desde `18_tipologia_contornos.geojson` y `18_oferta_nucleo_puntos.csv`). Ahora la página sí tiene polígonos de AGEB (Marco Geoestadístico 2025, simplificados a 15 m).
- Código: `js/vistas/territorio-tipologia.js` (nuevo), `index.html`, `css/graficas.css`. Los colores de los tipos son los de las figuras f11–f14 del notebook.
- Las cifras que ya existían no cambiaron (se comparó `datos_observatorio.json`: solo se agrega `tipologia` y dos indicadores). Verificado en Chromium a 1440 y 390 px, sin errores de JavaScript en las ocho pestañas. **Pendiente de doble revisión.**

## Pestañas
Cada pestaña responde una pregunta. Hay una gráfica principal por tarjeta, una frase de hallazgo y la ficha (fuente y precisión) plegada. La URL guarda la pestaña (`#relevo`, `#territorio`, …).
1. **Inicio**: «Los datos que cuidan» en un bloque oscuro (enfoque, perfiles de la app, cuatro razones con cifras a los lados del logo 3D y los cuatro contadores) y dos marcos con el mismo formato (título grande y párrafo, escena 3D con piso que refleja, tarjetas debajo): «¿Cuántas personas están en el problema?» (embudo en cinco escenas, de 31.7 M de personas cuidadoras al grupo del problema) y «Lo que encontramos» (un hallazgo por pestaña). Cada tarjeta de los marcos lleva a su pestaña. Cambio del 7 oct 2026 (noche): antes eran contadores, embudo en SVG y cuatro tarjetas.
2. **¿Quién lo carga?** (`#necesidad`): filtro de segmentación (script 12); necesidad contra daño por horas; diferencias con IC al 90%; grupo del problema; distribución de horas y perfil del grupo (script 16); horas por sexo.
3. **¿Por qué no se contrata?** (`#barreras`): el mismo filtro; semáforo de hipótesis; razones para no buscar; contratación por quintil; preferencia de lugar; rechazo a residencias; oferta declarada.
4. **¿Cuánto cuesta?** (`#relevo`): costo de paquetes por horas, asequibilidad con selector de fuente del ingreso (scripts 10 y 14), parte del ingreso del hogar mediano (sigue los mismos selectores), pago por hora de cuidadora, trabajo doméstico y enfermería (script 04), la advertencia «poder pagar no es querer contratar» visible y costo del subsidio contra la solicitud de la CDMX (script 06). Marcado "sin prestaciones · jornada diurna".
5. **¿A quién primero?** (`#focalizacion`): regla contra modelos (notebook 11), cobertura por grupo y coeficientes.
6. **¿Dónde?** (`#territorio`): escala de la CDMX (ENIGH directa e inferidas), mapa y dispersión con siete capas, 32 entidades, zonas por AGEB y tipología de AGEB (modelo 2: mapa, decisión del piloto, brechas y validación).
7. **Indicadores**: tarjetas filtrables; la lista completa va plegada.
8. **Método**: todo plegado: fuentes, diccionario de variables y de la base, precisión, lo que no se puede afirmar, compatibilidad, calidad y variables del modelo.

Desde el 7 oct 2026 (noche) el bloque «Los datos que cuidan» del Inicio explica el enfoque elegido con cifras del Observatorio y muestra los dos perfiles de la app («Necesito cuidado», «Puedo cuidar»); antes ni el enfoque ni los perfiles aparecían (ver la bitácora). Las preguntas del piloto siguen fuera: pertenecen al documento de práctica profesional.

## Cambios del 7 oct 2026 (noche): barra lateral e Inicio en 3D
- La cabecera con pestañas pasó a una barra lateral (marca, ocho pestañas con ícono, tarjeta «El cuidado también es trabajo» y la nota de actualización). En pantallas de menos de 960 px vuelve a ser barra superior con las pestañas en una fila deslizable. Teclado: flechas arriba/abajo o izquierda/derecha.
- El Inicio quedó con tres marcos tomados del prototipo 3D (artefacto «Observatorio del Cuidado»): «Los datos que cuidan», «¿Cuántas personas están en el problema?» y «Lo que encontramos», los tres con el mismo formato. Salieron el bloque oscuro con los contadores, el embudo en SVG y las cuatro tarjetas de la derecha. `inicio-contadores.js` se retiró (copia en `_to_delete/backup_pre_inicio3d_2026-10-07/`).
- Corrección de redacción: el 70.5% es «de quienes cuidan 40 h o más **y dicen "no tuve necesidad"**» (así lo calcula `07_enasic_necesidad_vs_norma_estimaciones.csv`). La tarjeta anterior del Inicio y el prototipo 3D omitían esa condición.
- Nuevos: `js/graficas/motor-3d.js`, `js/vistas/inicio-3d.js`, `vendor/three.min.js`. Modificados: `index.html`, `css/layout.css`, `css/vistas.css`, `js/vistas/inicio.js`, `js/app/pestanas.js`. Las cifras no cambian (`js/datos/` no se tocó).
- Verificación: Chromium a 1440, 1280 y 390 px; las 8 pestañas sin errores de JS; clic en pestañas, marca, flechas del teclado y botones «Ver la pestaña»; barra de filtro pegajosa debajo de la barra superior en teléfono. No se probó en un teléfono real ni en Safari.
- Pendiente: doble revisión; decidir si «Los datos que cuidan» y «Lo que encontramos» deben repetir tres cifras (70.5%, 66.2% y 0.9% aparecen en ambos).
- Más tarde el mismo día, a pedido de Omar, «Los datos que cuidan» volvió al diseño del prototipo: bloque oscuro con el logo 3D al centro, las cuatro razones a los lados, los perfiles de la app y los contadores. Regresó `inicio-contadores.js`. El contador de gráficas baja de 20 a 19 porque el embudo en SVG ya no existe. «¿Cuántas personas…?» y «Lo que encontramos» se quedan como marcos.
- Pantallas anchas: desde 1760 px de ancho (o con el navegador a menos de 100% de zoom) el contenido escala completo con `zoom` en `.content` (1.1 a 1.85 según el ancho) y la barra lateral un poco menos, para ocupar cerca del 90% del ancho libre en lugar de dejar márgenes vacíos. Las escenas 3D siguen respondiendo bien al cursor (probado a 2255 y 1920 px). Navegadores sin `zoom` solo ven márgenes más anchos. Reglas en `css/layout.css`.

## Cambios del 7 oct 2026 (reestructura de archivos)
- El CSS y el JS salieron de `plantilla.html` a `css/` (5 archivos) y `js/` (16 módulos). `plantilla.html` desapareció: `index.html` es ahora el archivo fuente y `build_datos.py` solo escribe `js/datos/datos.js` y `js/datos/geo.js`.
- Sin cambios de contenido ni de cifras. Se comprobó contra la versión anterior: mismo DOM, mismos estilos calculados (1280, 800 y 500 px) y mismos resultados en 81 clics sobre los selectores de las ocho pestañas.
- `scripts/parche_comparador_2026-10-07/aplicar_parche_comparador.py` parcheaba `plantilla.html`; ya se había aplicado y no se debe volver a correr.
- Pendiente: `barras()` en `js/graficas/componentes.js` no la llama nadie; se dejó sin tocar.

## Cambios del 6 oct 2026 (tarde)
- Territorio: la primera tarjeta es la medición directa de la ENIGH 2022 (47.1% de los hogares de la CDMX, IC 90% 45.0–49.1, ≈ 1.41 M). La cota inferior del script 05 (1.10 M) se queda a su lado, marcada como inferida.
- Relevo: la tarjeta "% de hogares que podría pagar 6 h/sem" sigue al selector de fuente del ingreso. Por defecto sigue mostrando la ENASIC, porque la decisión de pasar a la ENIGH está pendiente.
- Dispersión del mapa: las etiquetas de las alcaldías ya no se enciman.

## Diccionario
`Analysis/matrices/diccionario_observatorio.csv` documenta las variables derivadas de la ENASIC y cada bloque de `datos_observatorio.json`. `build_datos.py` se detiene si aparece un bloque que no esté en el diccionario.

## Límites
- Los costos (scripts 06, 10 y 14) no incluyen prestaciones y tratan todo como hora diurna: la asequibilidad está sobreestimada hasta que se rehaga el script 10 (ver script 15).
- La ENASIC es nacional; no hay cifras de la CDMX ni tendencias.
- La asequibilidad del script 10 (ENASIC) es una proporción ponderada sin varianza de diseño. La del script 14 (ENIGH) sí tiene IC, pero ninguna mide disposición a pagar. La ENASIC capta cerca de la mitad del ingreso que mide la ENIGH, así que el script 10 subestima la capacidad de pago.
- Las tarjetas de arriba de la pestaña Relevo siguen usando la ENASIC (script 10): cambiar la cifra principal a la ENIGH es decisión del equipo.
- Las capas de rezago y derechohabiencia agregan AGEB a alcaldía; esconden la variación dentro de cada alcaldía (el rango p10–p90 está en la tabla).
- Los paquetes de relevo de 3 a 12 h no tienen todavía cálculo de subsidio (el script 06 cubre 10, 20 y 40 h).
- El modelo se entrenó con datos nacionales; no está validado para la población de una institución.
- La capa de territorio no cumple la regla de compatibilidad oferta–necesidad.
- No sustituye el tablero de la UCA de Inteligencia de Negocios.
- **Pendiente de doble revisión.**

## Segmentación
- Sale de `Analysis/12_enasic_segmentacion_observatorio.ipynb` → `resultados/12_segmentacion_estimaciones.csv` (249 estimaciones con CV, IC al 90% y diferencia contra el resto de la misma dimensión).
- Una dimensión a la vez: los cruces dejan muestras demasiado chicas.
- Si la estimación del segmento tiene precisión baja, la página no la compara ("precisión baja: no se compara").
- La tarjeta «Comparar segmentos» tiene tres vistas: barras divergentes (diferencia contra el resto de la dimensión, con IC al 90%), lollipop ordenado (% del segmento con la banda del total) y tabla de calor. Un clic en un renglón filtra la pestaña; el renglón «Total nacional» quita el filtro. Cambio del 7 oct 2026, ver la bitácora.

## Versiones
`index.html` (con `css/` y `js/`) es la única versión vigente del Observatorio: se modifica en lugar de crear copias. La historia de cambios está en `Documentos/bitacora-decisiones.md`.

## Cambios del 7 oct 2026 (noche): gráficas más comunes
Pictograma con figuras «con daño» para necesidad y daño por horas; barras horizontales en lugar de piruletas y waffle; columnas en lugar de anillos; barras agrupadas en el perfil del grupo; diferencias con IC con el mismo signo («más horas menos menos horas»). Las funciones nuevas están en `js/graficas/componentes.js` (`iconosDano`, `filaFiguras`, `figura`, `barrasH`, `columnas`). `lolli`, `waffle` y `anillos` se quedan sin uso. Detalle en la bitácora.

## Cambios del 7 oct 2026 (21:55): ficha de cada tarjeta como recorrido guiado
La ficha «Lectura, fuente y precisión» de las tarjetas ya no es un plegable: `js/app/coachmark.js` la convierte en un globo de 2 o 3 pasos anclado al botón ⓘ (estilos `.cm-*` en `css/componentes.css`). El `<details class="src">` sigue en el DOM, oculto, y es la fuente de verdad: las vistas lo siguen escribiendo y el globo lo lee al abrirse. Detalle en la bitácora.

## Cambio del 13 oct 2026: modelo de focalización ampliado en ¿A quién primero?
- Bloque nuevo debajo de las gráficas existentes, con selector de objetivo («algún daño» o «salud física deteriorada»):
  - ocho formas de elegir contra la regla de 40 h;
  - cobertura según el cupo;
  - importancia de variables;
  - calibración.
- Tarjeta «¿Qué objetivo conviene?»: tiles, prevalencia por horas, cambio de cobertura por grupo y tabla de criterios.
- Código: `js/vistas/focalizacion-ampliado.js` (va después de `focalizacion.js`). Datos: bloque `modelo2` de `build_datos.py`, que lee `Analysis/resultados/11_modelo_*` y `11_objetivo_*` (notebook B, sección 11, subsecciones 11 a 16) y se detiene si faltan filas. Documentado en `Analysis/matrices/diccionario_observatorio.csv`.
- Probado en Chromium sin interfaz: sin errores de JavaScript, el selector cambia las cuatro gráficas y no hay barra horizontal a 390 px. Respaldo en `_to_delete/backup_pre_modelo11_ampliado_2026-10-13/observatorio/`.
- Pendiente de doble revisión.

## Cambio del 14 oct 2026: tarjeta «Cada modelo responde a una decisión» en Método
- Al inicio de la pestaña Método, visible (no plegada): tres tarjetas, una por decisión. **¿Dónde hacer el piloto?** (tipología de AGEB, notebook D, sección 18), **¿A quién ofrecer primero el relevo?** (focalización, notebook B, sección 11) y **¿En qué orden atender las zonas?** (sin modelo: hoy se responde con conteos descriptivos). Cada tarjeta dice la decisión, el modelo, la alternativa simple, qué mostró la comparación y qué no permite afirmar, y enlaza a su pestaña.
- Las cifras se calculan en `js/vistas/metodo.js` a partir de `D.tipologia` (comparacion, robustez, brecha_total) y `D.modelo2.resumen`. No hay bloques nuevos en `build_datos.py` ni en el diccionario, y no cambió ninguna cifra existente. Los veredictos («no se distingue de la regla», «la ventaja depende de esa variable») salen del signo de los IC al 90 %, no de un texto fijo.
- Estilos `.mdec*` en `css/vistas.css`; contenedor `#modDec` en `index.html`.
- Probado en Chromium sin interfaz a 1440 y 390 px: sin errores de JavaScript ni scroll horizontal, y los botones «Ver la pestaña» funcionan. Respaldo en `_to_delete/backup_pre_tarjeta_modelos_2026-10-14/`.
- Pendiente de doble revisión.

## Cambio del 14 oct 2026: colores de ¿Cuánto cuesta? alineados con el resto del Observatorio
- `js/vistas/relevo.js`: el verde (#23806f) y el ámbar (#a9711a) de las series pasan a la paleta lila del sitio. «Cabe en el tope», la línea de asequibilidad, la tarjeta del 66.2 % y el piso legal van en morado (#77689d). La jornada diurna, mixta y nocturna va de lila claro a azul tinta (#aa95d1, #77689d, #2b3045). El CACEH y la solicitud CDMX van en tinta (#2b3045). El rojo (#c0435a) sigue marcando lo que rebasa el tope o el presupuesto. La leyenda dice «Morado» en lugar de «Verde».
- Sin cambios en cifras ni en `css/`. El verde se queda solo donde significa estado (chip «alta») y el ámbar en la nota «Poder pagar no es querer contratar», que es un componente compartido.
- Probado en Chromium a 1440 px, sin errores de JavaScript. Respaldo en `_to_delete/backup_pre_colores_relevo_2026-10-14/`.

## Cambio del 15 oct 2026: rediseño de «Cada modelo responde a una decisión» (pestaña Método)
- Cada tarjeta pasó de cinco bloques de texto a: ilustración, decisión en una línea, **una gráfica con la cifra clave**, recuadro «No permite afirmar» (siempre visible) y un desplegable «Cómo se hizo» con modelo, alternativa simple, robustez y pendientes.
- Gráficas (todas calculadas desde `D.tipologia` y `D.modelo2`; ninguna cifra escrita a mano): barras de R² en escala 0–1 sin cortar el eje (¿Dónde?); intervalos de confianza 90 % de la diferencia de cobertura contra la regla de 40 h, con marcador de la variante sin «le falta fuerza física» (¿A quién?); cifra de 60+ en AGEB con brecha, con conteo animado (¿En qué orden?).
- Movimiento: entrada escalonada al hacer scroll, barras que crecen y giro suave de la ilustración hacia el cursor. Con `prefers-reduced-motion`, sin `IntersectionObserver` o en pantallas sin hover, todo aparece terminado y sin giro.
- Ilustraciones: `ilustraciones/metodo_piloto|relevo|zonas.webp`, con fondo transparente (recorte del fondo casi blanco del original); originales en `metodo_*_original.png`. No pasan por `build_ilustraciones.py`. No son datos ni personas reales.
- Código: `js/vistas/metodo.js` (bloque de tarjetas) y final de `css/vistas.css` (`.mdec-*`). Copia previa en `_to_delete/backup_pre_mdec_rediseno_2026-10-15/`.
- Pendiente de decisión del equipo: las figuras muestran expresiones de preocupación; confirmar el tono para población vulnerable.
- Texto recortado: se acortó la redacción, no el contenido de los límites. Revisar que «No permite afirmar» siga diciendo lo mismo que antes antes de la doble revisión.

## Cambio del 15 oct 2026 (noche): dos presentaciones de «Cada modelo responde a una decisión»
- Por defecto (`index.html#metodo`) se ve el **selector**: una decisión a la vez, con pestañas (también ← → Inicio Fin), ilustración grande que cambia con transición, gráfica, «No permite afirmar» siempre visible y «Cómo se hizo» plegado. Tema claro del sitio. Las tres decisiones comparten altura para que la página no salte.
- Con `index.html?mdec=juego#metodo` se ve la versión de **tarjetas estilo videojuego** (tema oscuro, misiones, HUD). Es decoración: no hay puntajes ni niveles.
- Las dos usan los mismos textos y gráficas, calculados desde `D.tipologia` y `D.modelo2`. Código: `js/vistas/metodo.js` (`tarjeta`, `selector`) y final de `css/vistas.css`. Respaldos en `_to_delete/backup_pre_mdec_*`.
- Decisión pendiente del equipo: elegir una y borrar la otra, y confirmar el tono de las ilustraciones (expresiones de preocupación).
- 15 oct 2026 (noche, más tarde): tercera presentación, `index.html?mdec=trio#metodo`: tres tarjetas con una piel distinta cada una (radar de rastreo en azul nocturno, alerta de contención en negro y verde ácido, arcade en verde y naranja). Solo estilo visual: sin nombres, logos ni personajes de marcas. Las pieles se asignan en el arreglo `SK` de `js/vistas/metodo.js` y se definen al final de `css/vistas.css` (`.sk-radar`, `.sk-alerta`, `.sk-arcade`). La insignia dice «Decisión 0N», no «Misión».
- 15 oct 2026 (noche, después): en el selector, las tres decisiones comparten filas (`subgrid` en `.mdec-pw`/`.mdec-pn`), así título, estado, gráfica, límites y botón miden y se ubican igual en cada pestaña; las tres ilustraciones comparten recuadro y base. El panel pasó de llamarse `mdec-p` a `mdec-pn` porque `mdec-p` ya era el párrafo introductorio de la sección. Medido en 1850, 1400, 1000 y 390 px de ancho: todas las cajas coinciden.

## Cambio del 15 oct 2026 (noche): pestaña Indicadores dinámica
- **HUD** con el conteo vivo de indicadores a la vista y el conteo por clase de evidencia (confirmado, probable, desconocido; se calcula desde `D.kpis`, no está escrito a mano), que también filtra. Debajo, un **minimapa** de 21 bloques, uno por indicador, coloreado por clase de evidencia (no es un puntaje).
- **Filtros** por dimensión (pestañas con indicador deslizante) y por evidencia; al cambiar, las fichas se reacomodan con animación.
- **Fichas**: anillo solo en los indicadores que son porcentaje (escala 0–100, la única que tiene sentido); personas, establecimientos, pesos por hora y «veces» llevan un ícono, sin barra, porque no tienen una escala comparable. La clase de evidencia manda en el aspecto: confirmado = franja teal sólida, probable = franja ámbar rayada, desconocido = borde punteado y candado.
- **Inspector** (a la derecha; arriba en pantallas angostas) con la ficha completa del indicador elegido: definición, universo, evidencia, precisión y archivo. Se navega con clic, con los botones ‹ › o con Tab + Enter.
- Colores solo del observatorio (`--shell`, `--accent`, `--lav`, `--mint`, `--teal`, `--amber`, `--alert`). Se agregaron dos tintes claros de ámbar y rojo (`--amber-l`, `--alert-l`) solo para que se lean sobre fondo oscuro.
- Con `?ind=clasico` se ve la cuadrícula anterior. Con `prefers-reduced-motion`: sin conteo, sin trazado de anillos y sin reacomodo animado.
- Código: `js/vistas/indicadores.js` y final de `css/vistas.css` (`.ind-*`). Respaldo en `_to_delete/backup_pre_indicadores_2026-10-15/`.

## Cambio del 15 oct 2026 (noche): las cuatro «razones» de la portada pasan a ser tarjetas descriptivas
- Decisión del equipo: en «Los datos que cuidan» (Inicio) las cuatro tarjetas con gráfica se sustituyen por cuatro tarjetas de texto: 01 Qué es, 02 Qué mide y qué no, 03 De dónde sale cada dato, 04 Qué tan firme es. La franja de contadores, el medallón y las gráficas de las demás pestañas no cambian.
- Los conteos de la tarjeta 04 se calculan de `D.inventario` (clasificados por la primera palabra de `estado_evidencia`); el nivel geográfico de la tarjeta 03 sale de las filas F04, F09 y F20 del inventario. Los textos de 01 y 02 son redacción del equipo (pendiente de revisión por quien no los escribió).
- Pendiente de definir por el equipo: la frase «sirve para decidir X» de la tarjeta 01.
- Respaldo de `inicio.js` y `vistas.css` previos: `_to_delete/backup_pre_descripcion_2026-10-15/`. Estilos nuevos al final de `css/vistas.css` (`.rz-desc`, `.rz-lista`, `.rz-src`, `.rz-seg`, `.rz-ley`).

## Cambio del 15 oct 2026 (noche, más tarde): las cuatro tarjetas descriptivas pasan a carrusel
- La ilustración queda a la izquierda y las cuatro tarjetas (mismo diseño y colores) se muestran una por una a la derecha, con flechas ‹ ›, botones numerados (el activo muestra su título), autoavance cada 9 s, teclado (← →) y deslizar en pantallas táctiles. `index.html`: `#reasons-a` y `#reasons-b` se reemplazaron por `#carrusel`.
- El autoavance se detiene al pasar el cursor o enfocar el carrusel, cuando no está a la vista y, de forma definitiva, en cuanto la persona lo usa a mano. Con «reducir movimiento» no avanza solo y no hay transiciones.
- La tarjeta 01 trae accesos a las demás pestañas, leídos de la barra lateral (`.tabs`), no escritos a mano.
- Respaldo previo: `_to_delete/backup_pre_carrusel_2026-10-15/` (index.html, inicio.js, vistas.css). Estilos nuevos al final de `css/vistas.css` (`.carrusel`, `.car-*`).

## Cambio del 20 oct 2026: se quitan las vistas «Videojuego» y «Trío»; las tres decisiones quedan en TBC
- Decisión del equipo: en «Cada modelo responde a una decisión» (pestaña Método) se eliminan las vistas «Videojuego» (`?mdec=juego`) y «Trío» (`?mdec=trio`) y el interruptor «Vista». Queda solo el selector, con sus tres pestañas (¿Dónde?, ¿A quién?, ¿En qué orden?) y sus ilustraciones.
- El contenido de las tres decisiones (estado, descripción, gráfica, «No permite afirmar», «Cómo se hizo» y botón «Ver la pestaña») se sustituye por **TBC**. Se conserva solo el título de cada pregunta. Ya no se renderiza ninguna cifra de `D.tipologia` ni `D.modelo2` en este bloque.
- Código: `js/vistas/metodo.js` (bloque reescrito) y `css/vistas.css` (se borraron los estilos de tarjetas, `.sk-*` e interruptor). Las vistas anteriores y su texto se pueden recuperar de `_to_delete/backup_pre_quitar_vistas_2026-10-20/`.
- Los cambios anteriores de este README sobre las vistas juego/trío y sobre el contenido de las decisiones describen el estado previo y no se reescriben.
- Verificado: sintaxis de `metodo.js` y render simulado en Node (3 pestañas, 3 «TBC», sin restos de las vistas). **No** se probó en un navegador real: el panel del navegador no alcanzó el servidor local. Pendiente: abrir `index.html#metodo` y revisar altura del panel y alineación.

## Cambio del 20 oct 2026: «¿Cuánto cuesta?» se actualiza con el modelo de sostenibilidad (script 20)
- **Qué estaba desactualizado.** Desde el 15 oct existe `resultados/20_sostenibilidad_escenarios.csv`, pero la pestaña no lo leía: decía que los paquetes de 3 a 12 h «todavía no tienen este cálculo» y su tarjeta de subsidio seguía en 20 h y 40 h (script 06, otro producto) con 1,099,461 hogares (cota inferior del script 05) en lugar de los 1,407,522 de la ENIGH 2022.
- `build_datos.py`: bloque nuevo `sostenibilidad` (costo con carga laboral, copago, escala CDMX y financiamiento). Se documenta en `matrices/diccionario_observatorio.csv`. Antes de editar se comprobó que `datos_observatorio.json` y `js/datos/datos.js` se regeneraban idénticos desde los CSV: ninguna otra cifra de la pestaña estaba desfasada.
- Tarjeta «¿Cambia el costo si el relevo es de noche o con carga laboral?»: selector nuevo de carga (sin carga, +IMSS e Infonavit 22 %, +aguinaldo y vacaciones 30.2 %). Por defecto «sin carga», para que coincida con el resto de la pestaña. Las cuatro gráficas de asequibilidad (script 10) **siguen sin carga laboral**.
- Tarjeta de subsidio: ahora muestra el financiamiento anual del relevo de 6 h/semana en la CDMX por escenario de aceptación (5 %, 25 %, cota de 64.1 %) y costo de operación ($0 a $1,000 por hogar-mes), contra la solicitud de 6,747.7 mdp. Aceptación y operación son **ilustrativas**; los hogares elegibles (≈70,557) son una inferencia con tasas nacionales.
- Se conserva `D.subsidio` (script 06) en los datos, pero la pestaña ya no lo dibuja.
- Respaldo previo: `_to_delete/bak_cuesta_2026-10-20/`.
- Verificado: sintaxis, render en Chromium sin errores propios (las únicas fallas de carga fueron las ilustraciones, que no se copiaron a la prueba) y cifras de pantalla contra el CSV (36.2 mdp, 0.5 %, $171 y $0, $2,714 y $3,101). **No** se probó en 390 px. Pendiente: doble revisión.

## Cambio del 21 oct 2026: segmentación por clases latentes en «¿Quién lo carga?»
- Tarjeta nueva «A las mismas horas, ¿quién declara más daño?», después de «¿Cuánto cambia con más horas de cuidado?». Sale del notebook 23 (`Analysis/23_segmentacion_cuidadoras.ipynb`): dos clases estables de cuidadoras, «Dificultad en la tarea» (25.7 %) y «Sin dificultad declarada». Muestra el daño por clase a igual horas, con selector de desenlace y de bloque del cuestionario; dos tiles (tamaño de la clase y 13.8 % con dificultad y menos de 40 h) y el perfil que la define.
- **No la recorta el filtro de la pestaña** (las clases se estimaron con todo el universo) y la tarjeta lo dice. Exploratoria y sin doble revisión: lleva esos chips.
- Datos: bloque `seg23` de `build_datos.py`, que lee `Analysis/resultados/23_seg_*.csv` y se detiene si cambian los nombres de las clases, si k = 2 deja de ser la más estable o si cambia el número de filas. Documentado en `matrices/diccionario_observatorio.csv`.
- Código: `index.html` (tarjeta `.s23`), `js/vistas/necesidad.js` (bloque al final, se redibuja al cambiar el ancho para que el texto no se encoja en teléfono) y final de `css/vistas.css`.
- Verificado en Chromium sin interfaz a 1440 y 390 px, sin errores de JavaScript ni desborde. Respaldo en `_to_delete/backup_pre_seg23_observatorio_2026-10-21/`. **Pendiente de doble revisión.**
