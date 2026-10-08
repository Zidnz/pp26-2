# Tabla oferta–demanda — versión 0

Fecha: 14 de septiembre de 2026. Responsable de producción: Omar Gutiérrez.
Revisor: **PENDIENTE** (regla de doble revisión: quien produce no aprueba).

## Qué es esto y qué no es

Esto es la **definición** de la tabla oferta–demanda y el código que la llena.
No contiene ninguna cifra sobre la Ciudad de México. Las cifras no existen
todavía porque las fichas de fuente de los bloques 1 (Censo) y 2 (DENUE) no
están hechas, y publicar números antes de esas fichas contradice las reglas
del proyecto.

Archivos:

| Archivo | Qué es |
|---|---|
| `especificacion_tabla_oferta_demanda.csv` | Un renglón por campo: definición, fuente, cálculo, qué se puede y qué no se puede afirmar con él. |
| `catalogo_scian_cuidado_candidatos.csv` | 16 códigos SCIAN candidatos a delimitar la oferta. Es también el archivo de configuración del script: la columna `incluir_en_v1` decide qué entra. |
| `construir_tabla_oferta_demanda.py` | Script reproducible. Recibe DENUE + Censo, produce la tabla y un JSON de trazabilidad con hash SHA-256 de cada archivo de entrada. |

El script se probó de extremo a extremo con un archivo sintético desechable
que **no se incluye** en este entregable. Corre a nivel alcaldía (16 filas) y a
nivel AGEB, y falla con mensaje explícito si una columna esperada no existe.

## Estado de evidencia

**Confirmado**

- El DENUE publica, por establecimiento: clave CLEE, nombre, razón social,
  clase de actividad, estrato de personal ocupado, domicilio, AGEB, longitud y
  latitud. Fuente: diccionario de datos y documentación de la API del DENUE,
  inegi.org.mx, consultado el 14-sep-2026.
- El DENUE **no publica capacidad instalada**: el estrato de personal ocupado
  es un rango de personas empleadas, no cupos, plazas ni camas.

**Probable**

- Los 16 códigos SCIAN del catálogo corresponden a las descripciones indicadas.
  Verificados contra catálogos SCIAN reproducidos por dependencias públicas
  (14-sep-2026), **no** contra el clasificador oficial del INEGI. Antes de citar
  la tabla, un integrante debe confirmarlos en el buscador SCIAN del INEGI.

**Desconocido**

- Qué versión de SCIAN usa la entrega vigente del DENUE. Existe SCIAN 2018 y
  SCIAN 2023; si el archivo descargado usa una y el catálogo otra, el filtro
  devuelve conteos equivocados sin avisar.
- Qué variables de edad y discapacidad publica el Censo 2020 a nivel AGEB sin
  supresión por confidencialidad. Los nombres por omisión en el script
  (`P_0A2`, `P_3A5`, `P_60YMAS`, `POBTOT`) son una hipótesis a verificar, no un
  dato confirmado.
- Cuánto subregistra el DENUE la oferta pública (Casas de Día del gobierno de
  la CDMX, CENDI, guarderías IMSS subrogadas). Se mide cruzando contra los
  padrones de la CDMX; mientras no se haga, el conteo público es un piso.

## Tres cosas que esta tabla nunca podrá sostener

1. **Cobertura.** Sin cupos no hay denominador de capacidad. Todo lo que se
   puede calcular es densidad de establecimientos por cada 10 mil personas del
   grupo de edad. "Cobertura del 34%" sería una cifra inventada.
2. **Demanda.** La población de 0 a 5 años y de 60 y más es población en edad,
   no necesidad de cuidado. Multiplicarla por una tasa nacional de la ENASIC no
   arregla nada: al ser un factor constante, el orden entre alcaldías no cambia
   y no se agrega información territorial. Parece rigor y no lo es.
3. **Acceso.** El establecimiento está donde se presta el servicio, no donde
   vive quien lo usa. En la CDMX la gente cruza alcaldías todos los días. La
   brecha por alcaldía mide dónde está instalada la infraestructura, no quién
   queda fuera.

Un cuarto punto, sobre el grano: a nivel alcaldía la tabla tiene **16 filas**.
Con 16 observaciones no hay modelado ni inferencia posibles; sirve para probar
que el proceso corre y para comunicar. La unidad analítica real es el AGEB, y
depende de que el Censo publique las variables de demanda a ese nivel con
supresión tolerable. Eso está sin verificar.

## Siguiente paso, en este orden

1. Descargar el DENUE de la entidad 09 y anotar su fecha de corte y versión de
   SCIAN. — bloque 2, 1 día-persona.
2. Confirmar los 16 códigos SCIAN en el clasificador oficial del INEGI y correr
   el script con `--nivel alcaldia`. El resultado esperado del primer intento es
   un error o un conteo raro; eso es información, se registra.
3. Descargar el Censo 2020 por AGEB (entidad 09), abrir su diccionario y
   confirmar los nombres reales de las columnas de edad y discapacidad, y
   cuántas celdas vienen suprimidas. — bloque 1, 1 día-persona.
4. Con el diagnóstico de la corrida, decidir el grano definitivo de la tabla y
   registrar la decisión con fecha y motivo en la bitácora.

## Información que falta y quién la consigue

- Versión de SCIAN del DENUE vigente: quien haga el bloque 2.
- Variables censales disponibles por AGEB: quien haga el bloque 1.
- Padrón de Casas de Día y CENDI de la CDMX, para medir subregistro: quien haga
  el bloque 3 (Sistema de Indicadores / portal Ajolote).
- Nombre del revisor de este entregable: Omar, con el equipo.
