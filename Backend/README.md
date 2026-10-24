# Backend — API del Observatorio y servicio de puntaje de Mientras

Versión 0.1.0 · 21 oct 2026 · **Sin revisión de otra persona.** Decisión de alcance y stack: Omar, 21 oct 2026 (bitácora).

Dos servicios en una app FastAPI. **Ninguno guarda datos.**

| Prefijo | Qué hace | Qué lee |
|---|---|---|
| `/dw/*` | Lectura de los tres data marts y de las vistas de gobierno del DW | `DW/observatorio_dw.sqlite`, abierto en **modo solo lectura** |
| `/puntaje/*` | Puntaje de la tarjeta (script 22), nivel, regla de 40 h, Barthel, Zarit, chequeos y reparto de la bolsa de horas | `app/config_programa.json` (copia exportada de `Frontend/js/config.js`) |
| `/salud` | ¿Existe el DW, viola la regla de alcance, está al día la configuración? | — |

## Cómo correrlo (PowerShell, desde la raíz `pp26-2`)
```powershell
pip install -r Backend\requirements.txt
python -B DW\etl\run_etl.py                       # solo si no existe DW\observatorio_dw.sqlite
python -m uvicorn Backend.app.main:app --port 8001
```
Documentación interactiva (OpenAPI): http://127.0.0.1:8001/docs. Pruebas: `python -m pytest Backend\tests -q -p no:cacheprovider` (la de paridad necesita Node).

Si cambia `Frontend/js/config.js`: `node Backend\scripts\exportar_config.js`. Mientras no se haga, `/puntaje/*` responde **503** (no puntúa con pesos viejos).

Variables de entorno opcionales: `OBS_DW_PATH` (otra ruta del almacén), `OBS_CORS` (orígenes permitidos; por defecto `localhost:8000` y `127.0.0.1:8000`).

## Reglas del proyecto que el código hace cumplir
| Regla | Cómo |
|---|---|
| Una encuesta nacional no sustenta cifras por alcaldía | Si `v_violaciones_alcance` tiene filas, **todo `/dw/*` responde 503**. `/dw/necesidad` solo trae filas nacionales y lo dice en `meta.advertencias` |
| Sin dos periodos no hay tendencia | No hay endpoint de series. Cada respuesta trae `meta.tendencia` (hoy `permite_tendencia = 0` en todas las fuentes) |
| Desconocido no es cero | Los NULL salen como `null`. `/dw/alcaldias/{cve}` lista los campos sin dato |
| Las estimaciones no se suman | No hay endpoints de agregación; la advertencia va en cada respuesta |
| Trazabilidad | Cada fila conserva `fila_origen` y `script_origen`/`fuente_id`; `meta.etl_run` dice de qué corrida sale |
| Ningún dato personal | `/puntaje/*` rechaza (422) cualquier campo no previsto, como `curp`, `nombre` o `edad`. Los folios de `/reparto` solo admiten minúsculas y dígitos (≤ 32): un nombre o una CURP no pasan. Respuestas con `Cache-Control: no-store`; no se registra el cuerpo de las peticiones |
| Doble revisión | `meta.estado_revision` y `estado_revision` lo declaran en cada respuesta (`app/ajustes.py`; se cambia solo cuando la bitácora registre la revisión) |

## Una sola fuente de verdad para el puntaje
`app/prioridad.py` es una traducción línea a línea de `Frontend/js/prioridad.js`, **que sigue siendo la fuente de verdad**. `tests/test_paridad.py` corre los dos con 600 entrevistas y 81 repartos (semilla 20261021, con casos de borde: 39.9/40/80/140/168 h, Barthel y Zarit incompletos o fuera de escala, bolsa insuficiente, exacta y sobrada) y exige resultados idénticos. Una mutación de prueba (cambiar `>=` por `>` en el umbral Alta) la hace fallar. Si se edita `prioridad.js`, hay que editar `prioridad.py` y correr la prueba.

Diferencia deliberada: el JS cuenta cualquier código en `abvd`/`clin`; la API **rechaza** códigos desconocidos o repetidos.

## Endpoints
`GET /dw/metadatos` · `/dw/cobertura/temporal` · `/dw/cobertura/geografica` · `/dw/calidad` · `/dw/medidas` · `/dw/necesidad` · `/dw/territorio` · `/dw/alcaldias` · `/dw/alcaldias/{cve_geo}` · `/dw/asequibilidad` — filtros fijos por endpoint (ver `/docs`), paginación `limite` (≤ 1000) y `desde`.
`GET /puntaje/config` · `GET /puntaje/preguntas` · `POST /puntaje/evaluar` · `POST /puntaje/reparto`.

Ejemplo:
```json
POST /puntaje/evaluar
{"modelo": {"horas": 45, "abvd": ["P6_2_01","P6_2_02","P6_2_04"], "clin": [], "req": true, "fuerza": true, "sexo": "M"},
 "semanas_en_cola": 3}
→ base 17, efectivo 18.5, nivel «alta», regla_40h «dentro», provisional true
```

## Lo que este backend NO hace (y por qué)
- **El Observatorio no lo usa, a propósito.** Desde el 21 oct 2026 el Observatorio lee el almacén **al construirse** (`build_datos.py`), no en el navegador: la página sigue abriéndose con doble clic, sin servidor. Se descartó servirlo desde este backend porque obligaba a tener el servidor encendido sin cambiar ninguna cifra (bitácora del 21 oct, 22:30).
- **La app Mientras no lo llama.** Sigue calculando en el navegador con datos simulados. El servicio existe para cuando haya un modelo serializado o una sede del piloto; hoy calcula lo mismo que el JS.
- **No guarda casos, relevos ni visitas.** Persistir datos de cuidadoras requiere el dictamen de Leyes (Daniel) y la sede del piloto. Los datos del piloto se quedan en la institución.
- **No tiene autenticación.** Está pensado para correr en `localhost`. No se expone a internet sin antes agregarla.
- **No valida el puntaje.** La tarjeta no supera a la regla de 40 h de forma demostrable (script 22); la API devuelve las dos.

## Archivos
`app/main.py` (app y `/salud`) · `app/ajustes.py` (rutas, CORS, estado de revisión) · `app/db.py` (conexión de solo lectura) · `app/rutas_dw.py` · `app/rutas_puntaje.py` · `app/prioridad.py` · `app/config_programa.py` + `config_programa.json` · `scripts/exportar_config.js` · `tests/` (`test_api.py`, `test_paridad.py`, `paridad_js.js`).
