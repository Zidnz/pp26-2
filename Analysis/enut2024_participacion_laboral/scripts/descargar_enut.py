"""Descarga y descomprime los datos abiertos de la ENUT 2024 (INEGI).

Uso (desde la raíz del repo):
    python scripts/descargar_enut.py

Deja los CSV en data/raw/enut_2024/. Los microdatos no se suben al repo.
"""
from pathlib import Path
import urllib.request
import zipfile

URL = ("https://www.inegi.org.mx/contenidos/programas/enut/2024/"
       "datosabiertos/conjunto_de_datos_enut_2024_csv.zip")

RAIZ = Path(__file__).resolve().parents[1]
DESTINO = RAIZ / "data" / "raw" / "enut_2024"
ZIP = RAIZ / "data" / "raw" / "conjunto_de_datos_enut_2024_csv.zip"


def main() -> None:
    DESTINO.mkdir(parents=True, exist_ok=True)
    if not ZIP.exists():
        print(f"Descargando {URL} ...")
        urllib.request.urlretrieve(URL, ZIP)
    else:
        print("El zip ya existe, no se vuelve a descargar.")

    with zipfile.ZipFile(ZIP) as z:
        z.extractall(DESTINO)

    tablas = sorted(p.name for p in DESTINO.glob("conjunto_de_datos_tr_*"))
    print(f"Tablas extraídas en {DESTINO}:")
    for t in tablas:
        print("  -", t)


if __name__ == "__main__":
    main()
