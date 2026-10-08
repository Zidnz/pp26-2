"""Observatorio del Cuidado · ilustraciones/build_ilustraciones.py
Recorta el fondo de las ilustraciones del embudo de la portada y las guarda
(1) como PNG con transparencia (ilustraciones/<clave>.png) y
(2) en js/graficas/ilustraciones.js como WebP en data URI.
Van en .js porque la página abre con file:// y WebGL no acepta texturas leídas de archivos locales.
Las ilustraciones no son datos ni personas reales.
También recorta el emblema del bloque «Los datos que cuidan» (ilustraciones/logo_cuidado.webp, con borde y canto
integrados; la página lo carga con <img>, que sí funciona con file://).
Uso (desde Frontend/observatorio):  python ilustraciones/build_ilustraciones.py
Requiere: pillow, numpy, scipy."""
import base64, io, pathlib
import numpy as np
from PIL import Image
from scipy import ndimage as nd

AQUI = pathlib.Path(__file__).resolve().parent
JS = AQUI.parent / "js" / "graficas" / "ilustraciones.js"
ALTO = 680                                  # px de alto en la página (≈ 2× el alto en pantalla)
# Cada ilustración: clave en OBS.ILU, archivo original, escena del embudo y reglas de recorte.
#   fondo   "negro" o "claro" (claro por omisión)
#   huecos  puntos (fila, columna) del original dentro de huecos de fondo encerrados por la figura (entre piernas,
#           dentro de un asa). Se dan a mano porque el color no basta: una camisa blanca tiene el mismo gris que el fondo.
#   arriba  (umbral, fracción del alto): fondo más estricto en la parte alta (cabello gris claro que se parece al fondo)
#   piso    (desde, mín, sat): desde esa fracción del alto, la sombra de piso neutra (≥mín, saturación ≤sat) conectada
#           al fondo también es fondo
#   protege cajas (fila0, fila1, col0, col1[, "r"]) donde la sombra de piso no se borra: elipse inscrita (zapatos)
#           o rectángulo con "r" (lavadora, botella)
#   zonas   cajas (fila0, fila1, col0, col1, umbral) con umbral propio de fondo (papeles o trapeador blancos)
ILU = [
    dict(clave="familia", archivo="familia_original.jpg", escena="0 · Cuidan (abuela en sillón con dos familiares)",
         huecos=[(579, 455), (628, 895), (689, 391), (999, 881), (996, 242), (1127, 957)],
         arriba=(247, .72), piso=(.72, 85, 14), protege=[(1035, 1128, 885, 1058), (875, 1058, 1068, 1186)]),
    dict(clave="cuidadoraSilla", archivo="cuidadora_silla_original.png", escena="1 · Discapacidad o 60+", fondo="negro"),
    dict(clave="agotada", archivo="agotada_original.jpg", escena="2 · 40 h o más (cuidadora agotada junto a la abuela)",
         huecos=[(501, 369), (559, 1119), (654, 308), (631, 506), (846, 308), (863, 154), (921, 438), (949, 512), (972, 675), (982, 732)],
         arriba=(247, .45), piso=(.72, 150, 16)),
    dict(clave="dobleJornada", archivo="doble_jornada_original.jpg",
         escena="3 · «No tuve necesidad» (lo dice al teléfono mientras trabaja y hace labores domésticas)",
         huecos=[(420, 508), (561, 573), (793, 687), (895, 556), (905, 281), (949, 747), (900, 469), (902, 365)],
         piso=(.7, 140, 18), protege=[(850, 1000, 930, 1258, "r"), (870, 1012, 1078, 1172, "r")]),
    dict(clave="oficina", archivo="oficina_original.jpg", escena="4 · Con daño, cara frontal (daño al trabajo)",
         huecos=[(461, 602), (670, 180), (989, 913), (990, 750), (1080, 843)],
         piso=(.8, 150, 16), zonas=[(560, 800, 820, 1180, 252)]),
    dict(clave="dolorHogar", archivo="dolor_hogar_original.jpg", escena="4 · Con daño, cara trasera (daño a la salud)",
         huecos=[(623, 763), (840, 557), (945, 900), (942, 1049)],
         piso=(.74, 150, 16), zonas=[(960, 1075, 1070, 1270, 250)]),
]

def recorta(src, fondo="claro", huecos=(), arriba=None, piso=None, protege=(), zonas=()):
    a = np.array(Image.open(src).convert("RGB")).astype(np.float32)
    H, W = a.shape[:2]
    if fondo == "negro":
        # regiones casi negras de ≥60 px (incluye huecos entre rayos); las llantas (10–30) quedan como figura
        cand = a.max(2) <= 7
        lab, n = nd.label(cand)
        tam = nd.sum(cand, lab, range(1, n + 1))
        bg = np.r_[False, tam >= 60][lab]
    else:
        # fondo claro y gris (incluye el cuadriculado de «transparencia»): solo lo conectado con el borde o con un hueco
        umbral = np.full((H, W), 205.0)
        if arriba: umbral[: int(H * arriba[1])] = arriba[0]
        for y0, y1, x0, x1, u in zonas: umbral[y0:y1, x0:x1] = u
        cand = (a.min(2) >= umbral) & (a.max(2) - a.min(2) <= 10)
        cand = nd.binary_closing(np.pad(cand, 2, constant_values=True), iterations=1)[2:-2, 2:-2]
        lab, n = nd.label(cand)
        borde = np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])
        hu = [lab[y, x] for y, x in huecos]
        assert all(hu), f"{src.name}: un punto de hueco no cae en fondo"
        bg = np.isin(lab, np.r_[borde[borde > 0], hu])
        if piso:
            desde, pmin, psat = piso
            som = (a.min(2) >= pmin) & (a.max(2) - a.min(2) <= psat) & (np.arange(H)[:, None] >= int(H * desde))
            yy, xx = np.mgrid[:H, :W]
            for y0, y1, x0, x1, *forma in protege:
                if forma == ["r"]: som[y0:y1, x0:x1] = False
                else:
                    cy, cx, ry, rx = (y0 + y1) / 2, (x0 + x1) / 2, (y1 - y0) / 2, (x1 - x0) / 2
                    som &= ((yy - cy) / ry) ** 2 + ((xx - cx) / rx) ** 2 > 1
            for y0, y1, x0, x1, u in zonas: som[y0:y1, x0:x1] &= a[y0:y1, x0:x1].min(2) >= u
            lp, _ = nd.label(som | bg)
            bg |= np.isin(lp, np.unique(lp[bg])) & som
    fig = nd.binary_opening(~bg, iterations=1)
    lab, n = nd.label(fig)                  # se queda con la pieza principal y las grandes (quita motas sueltas)
    tam = nd.sum(fig, lab, range(1, n + 1))
    # también se quedan las piezas chicas de color vivo: marcas de dolor, gotas de sudor (saturación media > 35)
    satm = nd.mean(a.max(2) - a.min(2), lab, range(1, n + 1))
    fig = np.r_[False, (tam >= max(400, tam.max() * .002)) | ((tam >= 40) & (satm > 35))][lab]
    fig = nd.binary_erosion(fig, iterations=2)          # quita el halo del borde original
    al = np.clip((nd.gaussian_filter(fig.astype(np.float32), 1.0) - .2) / .6, 0, 1)
    out = Image.fromarray(np.dstack([a, al * 255]).astype(np.uint8), "RGBA")
    return out.crop(out.getbbox())

lineas = []
for cfg in ILU:
    cfg = dict(cfg); clave, archivo, escena = cfg.pop("clave"), cfg.pop("archivo"), cfg.pop("escena")
    out = recorta(AQUI / archivo, **cfg)
    out.save(AQUI / (clave + ".png"), optimize=True)
    w = round(out.width * ALTO / out.height)
    buf = io.BytesIO(); out.resize((w, ALTO), Image.LANCZOS).save(buf, "WEBP", quality=88, method=6)
    uri = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()
    lineas.append(f'  {clave}:{{src:"{uri}",w:{w},h:{ALTO}}}, // {escena}')
    print(f"{clave}: {out.size} -> {w}x{ALTO}, {len(buf.getvalue())//1024} KB")
JS.write_text(
    "/* Observatorio del Cuidado · js/graficas/ilustraciones.js\n"
    "   GENERADO por ilustraciones/build_ilustraciones.py; no se edita a mano.\n"
    "   Ilustraciones 2D del embudo de la portada en data URI (WebGL no lee imágenes locales con file://).\n"
    "   Son ilustración: no son datos ni personas reales.\n"
    "   Importa de OBS: —\n"
    "   Exporta a OBS:  ILU */\n"
    "OBS.ILU={\n" + "\n".join(lineas) + "\n};\n", encoding="utf-8")

# Ilustración del bloque «Los datos que cuidan»: el emblema (aro, corazón, reloj y personajes) sin el disco crema de
# fondo, con borde blanco y canto lila integrados (como las figuras del embudo). El crema se quita por componentes:
# el fondo exterior conectado con el borde de la imagen (incluye el interior del aro) y huecos marcados a mano;
# se conservan la carátula del reloj y la taza, que también son crema.
LADO, PADL, BORDE, CANTO = 760, 34, 9, 9
a = np.array(Image.open(AQUI / "logo_cuidado_original.jpg").convert("RGB")).astype(np.float32)
d = np.abs(a - np.array([247, 241, 225])).sum(2)
crema = nd.binary_closing(np.pad(d < 30, 2, constant_values=True), iterations=1)[2:-2, 2:-2]
lab, n = nd.label(crema)
HUECOS = [(557, 1086), (881, 1036), (1042, 839), (715, 1139)]   # junto a la planta, entre la enfermera y la mesita, piso
borde = np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])
bg = np.isin(lab, np.r_[borde[borde > 0], [lab[y, x] for y, x in HUECOS]])
fig = nd.binary_opening(~bg, iterations=1)
l2, m = nd.label(fig); t = nd.sum(fig, l2, range(1, m + 1)); sat = nd.mean(a.max(2) - a.min(2), l2, range(1, m + 1))
fig = np.r_[False, (t >= t.max() * .002) | ((t >= 40) & (sat > 35))][l2]
fig = nd.binary_erosion(fig, iterations=1)
al = np.clip((nd.gaussian_filter(fig.astype(np.float32), 1.0) - .2) / .6, 0, 1)
em = Image.fromarray(np.dstack([a, al * 255]).astype(np.uint8), "RGBA"); em = em.crop(em.getbbox())
em.save(AQUI / "logo_cuidado.png", optimize=True)

def figura_con_borde(em, salida):
    """Agrega borde blanco y canto lila a un recorte RGBA y lo guarda como WebP de LADO px de ancho."""
    w = LADO - 2 * PADL; em = em.resize((w, round(em.height * w / em.width)), Image.LANCZOS)
    Wc, Hc = LADO, em.height + 2 * PADL + CANTO
    alfa = np.zeros((Hc, Wc), np.float32); alfa[PADL:PADL + em.height, PADL:PADL + w] = np.array(em)[..., 3] / 255
    yy, xx = np.mgrid[-BORDE:BORDE + 1, -BORDE:BORDE + 1]
    sil = nd.grey_dilation(alfa, footprint=(xx ** 2 + yy ** 2) <= BORDE ** 2)          # silueta con borde blanco
    lienzo = Image.new("RGBA", (Wc, Hc), (0, 0, 0, 0))
    c0, c1 = np.array([230, 224, 241]), np.array([125, 110, 166])
    for k in range(CANTO, 0, -1):                                                     # canto lila hacia abajo
        col = (c0 + (c1 - c0) * k / CANTO).astype(np.uint8)
        capa = np.zeros((Hc, Wc, 4), np.uint8); capa[..., :3] = col; capa[k:, :, 3] = (sil[:-k] * 255).astype(np.uint8)
        lienzo.alpha_composite(Image.fromarray(capa, "RGBA"))
    capa = np.zeros((Hc, Wc, 4), np.uint8); capa[..., :3] = 255; capa[..., 3] = (sil * 255).astype(np.uint8)
    lienzo.alpha_composite(Image.fromarray(capa, "RGBA"))
    lienzo.alpha_composite(em, (PADL, PADL))
    lienzo = lienzo.crop(lienzo.getbbox())
    lienzo.save(AQUI / salida, "WEBP", quality=90, method=6)
    print(f"{salida}: {lienzo.size}, {(AQUI / salida).stat().st_size//1024} KB")

figura_con_borde(em, "logo_cuidado.webp")          # emblema con aro (comentado en index.html, por si se regresa a él)

# Personajes solos (versión activa desde el 8 oct 2026): el original ya trae transparencia, pero con halos de color
# de baja opacidad en el borde; se toma alfa ≥128, se queda con las piezas grandes y se recorta 2 px del borde.
p = np.array(Image.open(AQUI / "logo_personajes_original.png").convert("RGBA")).astype(np.float32)
fig = p[..., 3] >= 128
l2, m = nd.label(fig); t = nd.sum(fig, l2, range(1, m + 1))
fig = np.r_[False, t >= t.max() * .002][l2]
fig = nd.binary_erosion(nd.binary_opening(fig, iterations=1), iterations=2)
al = np.clip((nd.gaussian_filter(fig.astype(np.float32), 1.0) - .2) / .6, 0, 1)
pe = Image.fromarray(np.dstack([p[..., :3], al * 255]).astype(np.uint8), "RGBA"); pe = pe.crop(pe.getbbox())
pe.save(AQUI / "logo_personajes.png", optimize=True)
figura_con_borde(pe, "logo_personajes.webp")
