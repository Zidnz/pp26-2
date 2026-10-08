#!/usr/bin/env python3
"""Reemplaza la gráfica "Comparar segmentos" del Observatorio (punto + IC por renglón)
por tres vistas: barras divergentes, lollipop ordenado y tabla de calor.

Uso (desde la raíz del repositorio):
    python aplicar_parche_comparador.py                      # parchea plantilla.html e index.html
    python aplicar_parche_comparador.py ruta/a/otro.html ... # o los archivos que indiques

Cada ancla debe aparecer exactamente una vez; si no, el script se detiene sin escribir nada
(no deja archivos a medias). Respeta saltos de línea CRLF. Es idempotente: si el archivo ya
tiene el parche, avisa y no lo vuelve a aplicar.
Después de parchear la plantilla, regenerar con:  python Frontend/observatorio/build_datos.py
"""
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
NUEVO = (AQUI / "comparador_nuevo.js").read_text(encoding="utf-8")
if not NUEVO.endswith("\n"):
    NUEVO += "\n"

DEFECTO = [
    "Frontend/observatorio/plantilla.html",
    "Frontend/observatorio/index.html",
]

INI = "  function comparador(el,k){"
FIN = "  var CMP={nec:"

CMPK_VIEJO = "  var cmpK={nec:'dano',bar:'pref_casa'};"
CMPK_NUEVO = (CMPK_VIEJO + "\n"
              "  var CMPV={nec:'div',bar:'div'};\n"
              "  function cmpDraw(t){comparador('#ch-cmp-'+t,cmpK[t],CMPV[t])}")

SEL_VIEJO = "    seg('#cmpSel-'+t,'k',function(k){cmpK[t]=k;comparador('#ch-cmp-'+t,k)});"
SEL_NUEVO = ("    seg('#cmpSel-'+t,'k',function(k){cmpK[t]=k;cmpDraw(t)});\n"
             "    seg('#cmpView-'+t,'v',function(v){CMPV[t]=v;cmpDraw(t)});")

REF_VIEJO = "comparador('#ch-cmp-nec',cmpK.nec);comparador('#ch-cmp-bar',cmpK.bar);"
REF_NUEVO = "cmpDraw('nec');cmpDraw('bar');"


def vista(t):
    return ('<div class="seg" id="cmpView-%s" aria-label="Vista">'
            '<button data-v="div" aria-pressed="true">Barras divergentes</button>'
            '<button data-v="lol" aria-pressed="false">Lollipop ordenado</button>'
            '<button data-v="tab" aria-pressed="false">Tabla de calor</button></div>' % t)


HTML = []
for t in ("nec", "bar"):
    viejo = '<div class="ctrls cmp-sel"><div class="seg" id="cmpSel-%s"></div></div>' % t
    nuevo = ('<div class="ctrls cmp-sel"><div class="seg" id="cmpSel-%s"></div>%s</div>' % (t, vista(t)))
    HTML.append((viejo, nuevo))

TXT = ("Elige la vista. Cada renglón es un segmento; las barras y la tabla miden la diferencia contra el resto "
       "de su misma dimensión, no contra el total. Haz clic en un renglón para filtrar la pestaña.")
HTML.append(('<p class="find">Cada punto es un segmento; la línea vertical es el total nacional. '
             'Haz clic en un renglón para filtrar la pestaña. Los puntos huecos tienen precisión baja.</p>',
             '<p class="find">' + TXT + ' Los renglones con precisión baja no se comparan.</p>'))
HTML.append(('<p class="find">Cada punto es un segmento; la línea vertical es el total nacional. '
             'Haz clic en un renglón para filtrar la pestaña.</p>',
             '<p class="find">' + TXT + ' Los renglones con precisión baja no se comparan.</p>'))


def una_vez(txt, ancla, nombre):
    n = txt.count(ancla)
    if n != 1:
        raise SystemExit("ANCLA '%s': se esperaba 1 coincidencia y hay %d. No se escribió nada." % (nombre, n))


def parchear(txt):
    if "function cmpDraw(" in txt:
        return None
    for ancla, nombre in ((INI, "inicio de comparador"), (FIN, "var CMP"), (CMPK_VIEJO, "cmpK"),
                          (SEL_VIEJO, "selector de indicador"), (REF_VIEJO, "refreshSeg")):
        una_vez(txt, ancla, nombre)
    for viejo, _ in HTML:
        una_vez(txt, viejo, viejo[:60] + "…")
    i, j = txt.index(INI), txt.index(FIN)
    if j < i:
        raise SystemExit("Orden inesperado de anclas (var CMP antes de comparador).")
    txt = txt[:i] + NUEVO + txt[j:]
    txt = txt.replace(CMPK_VIEJO, CMPK_NUEVO).replace(SEL_VIEJO, SEL_NUEVO).replace(REF_VIEJO, REF_NUEVO)
    for viejo, nuevo in HTML:
        txt = txt.replace(viejo, nuevo)
    return txt


def main(rutas):
    salidas = []
    for ruta in rutas:
        p = Path(ruta)
        crudo = p.read_bytes().decode("utf-8")
        crlf = "\r\n" in crudo
        nuevo = parchear(crudo.replace("\r\n", "\n"))
        if nuevo is None:
            print("= %s: ya tiene el parche, sin cambios" % p)
            continue
        salidas.append((p, nuevo.replace("\n", "\r\n") if crlf else nuevo))
    for p, nuevo in salidas:  # se escribe solo si todos pasaron las anclas
        p.write_bytes(nuevo.encode("utf-8"))
        print("✓ %s parcheado" % p)


if __name__ == "__main__":
    main(sys.argv[1:] or DEFECTO)
