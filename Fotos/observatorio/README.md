# Imágenes que usa el Observatorio

Copia (no movimiento) de las imágenes finales que usa `Frontend/observatorio/`. Copiado el 15 oct 2026.
Las fuentes y los originales siguen en `Frontend/observatorio/ilustraciones/` (ahí vive `build_ilustraciones.py`, que las genera).

- `logo_personajes.webp`: medallón activo de «Los datos que cuidan» (`index.html`).
- `logo_cuidado.webp`: emblema con aro; su `<img>` está comentado en `index.html`.
- `familia.png`, `cuidadoraSilla.png`, `agotada.png`, `dobleJornada.png`, `dolorHogar.png`, `oficina.png`: figuras del embudo de la portada (se incrustan como data URI en `js/graficas/ilustraciones.js`).

Son ilustraciones: no son datos ni personas reales. Si cambia alguna en `ilustraciones/`, esta copia no se actualiza sola.
