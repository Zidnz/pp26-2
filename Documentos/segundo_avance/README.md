# Documentos del segundo avance (21 oct 2026)

Generadores de los `.docx` para la segunda revisión (2 al 6 nov 2026). Mismo formato que el Documento técnico v1 (portada a página completa, Arial, encabezados lila).

| Salida (en `Documentos/`) | Generador | Qué es |
|---|---|---|
| `Observatorio_Cuidado_Guia_Tablero_v2.docx` | `build_guia_tablero_v2.js` | Guía del tablero al 20 oct 2026 (sustituye a la v1 del 9 oct) |
| `Observatorio_Cuidado_Documento_Tecnico_v2.docx` | `../documento_tecnico/build_documento_tecnico_v2.js` | Documento técnico al 20 oct 2026, con el almacén `DW/` |
| `Mientras_Guia_App_v1.docx` | `build_guia_app_v1.js` | Guía de la app «Mientras» (versión del 20 oct, 23:10) |
| `Documento_Maestro_Avance2_Observatorio_del_Cuidado_v2.docx` | `build_maestro_v2.js` | Documento maestro del segundo avance (sustituye al del 25 sept) |

## Cómo regenerar
```bash
npm install docx playwright        # una vez
node portadas.js                   # portadas en fig/
node src/render.js                 # figuras f_*.png desde src/*.html
node build_guia_tablero_v2.js ../Observatorio_Cuidado_Guia_Tablero_v2.docx
node build_guia_app_v1.js ../Mientras_Guia_App_v1.docx
node build_maestro_v2.js ../Documento_Maestro_Avance2_Observatorio_del_Cuidado_v2.docx
cd ../documento_tecnico && node build_documento_tecnico_v2.js ../Observatorio_Cuidado_Documento_Tecnico_v2.docx
```
El índice es un campo de Word: se llena al abrir (Word pide actualizar). Las versiones entregadas ya lo traen lleno con LibreOffice (`actualizar_indice.py`, requiere `soffice --headless --accept=...` corriendo).

## De dónde salen las cifras y capturas
- `fig/obs/`: capturas del Observatorio abierto en Chromium sin interfaz a 1440 px el 21 oct 2026.
- `fig/app/`: capturas de la app a 412 × 900 px con los casos de ejemplo de `seed()` (**datos simulados**).
- Las cifras se copiaron de la página renderizada, de `Analysis/resultados/` (20, 22), de `DW/` y de la bitácora. Ninguna nace en estos documentos.

## Estado
Ninguno de los cuatro documentos tiene doble revisión.
