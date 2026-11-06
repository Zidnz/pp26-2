"""Observatorio del Cuidado · ilustraciones/build_personajes_app.py
Personajes de la app «Mientras» (Frontend/index.html). Recorta el fondo de los originales y los guarda como
WebP de 720 px por el lado mayor (ilustraciones/<clave>.webp). La app los carga con <img>, que funciona con file://.
Reutiliza la función recorta() de build_ilustraciones.py (se lee del archivo sin ejecutar el resto de ese script),
así que el recorte es el mismo que el de las figuras del Observatorio: fondo claro o el cuadriculado falso de
«transparencia» conectado con el borde, más los huecos que se marcan a mano.
Las ilustraciones son ilustración generada: no son datos ni personas reales.
Uso (desde Frontend/observatorio):  python ilustraciones/build_personajes_app.py
Requiere: pillow, numpy, scipy."""
import ast, pathlib
import numpy as np
from PIL import Image
from scipy import ndimage as nd

AQUI = pathlib.Path(__file__).resolve().parent
LADO = 720

# Trae recorta() de build_ilustraciones.py sin correr ese script (regenera el embudo del Observatorio).
_src = (AQUI / "build_ilustraciones.py").read_text(encoding="utf-8")
_fn = next(n for n in ast.parse(_src).body if isinstance(n, ast.FunctionDef) and n.name == "recorta")
exec(compile(ast.Module([_fn], []), "build_ilustraciones.py", "exec"), globals())

# clave = archivo .webp que usa la app; uso = pantalla de la app (ver PERSONAJE en Frontend/js/app.js)
PERSONAJES = [
    dict(clave="bienvenida_relevo", archivo="bienvenida_relevo_original.png",
         huecos=[(427, 444), (1107, 329)],   # junto a la cara del relevo; entre sus piernas
         uso="Bienvenida de la solicitud y «Necesito relevo» sin caso: la persona de relevo llega a la puerta"),
    dict(clave="resultado_alta", archivo="resultado_alta_original.png",
         huecos=[(831, 772)],   # bajo la alfombra, junto a la maceta
         uso="Resultado Alta: la cuidadora descansa mientras el relevo acompaña a su familiar"),
    dict(clave="resultado_media", archivo="resultado_media_original.png",
         huecos=[(117, 1373)],   # triángulo bajo el cordón del calendario
         uso="Resultado Media: un hombre que cuida organiza las horas en un calendario"),
    dict(clave="resultado_baja", archivo="resultado_baja_original.png", alfa=True,
         uso="Resultado Baja: relevo con un joven con discapacidad; la cuidadora revisa un folleto"),
    dict(clave="puedo_cuidar", archivo="puedo_cuidar_original.jpg",
         uso="«Puedo cuidar»: la persona de relevo lista para salir a trabajar"),
]

if __name__ == "__main__":
    for cfg in PERSONAJES:
        cfg = dict(cfg); clave, archivo, uso = cfg.pop("clave"), cfg.pop("archivo"), cfg.pop("uso")
        if cfg.pop("alfa", False):       # el original ya trae transparencia real: solo se recorta al contenido
            out = Image.open(AQUI / archivo).convert("RGBA")
            out = out.crop(out.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())
        else:
            out = recorta(AQUI / archivo, **cfg)
        k = LADO / max(out.size)
        out = out.resize((round(out.width * k), round(out.height * k)), Image.LANCZOS)
        out.save(AQUI / (clave + ".webp"), "WEBP", quality=86, method=6)
        print(f"{clave}: {out.size}, {(AQUI / (clave + '.webp')).stat().st_size // 1024} KB · {uso}")
