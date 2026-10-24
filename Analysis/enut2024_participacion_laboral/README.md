# Cuidados y participación laboral de las mujeres en México (ENUT 2024)

> **Estado en el PP 26-2:** confirmado que el código corre de principio a fin con los microdatos de la ENUT 2024. Las cifras están **pendientes de doble revisión**. Según las reglas del repositorio, no se citan en el informe ni en la presentación hasta que alguien distinto a quien hizo el análisis lo revise. Todavía no está registrado en `Documentos/bitacora-decisiones.md` ni en `ML/README.md`.

**Pregunta:** entre mujeres de 25 a 54 años, ¿qué características del hogar se asocian con estar fuera del mercado laboral?

**Para qué sirve:** decidir a qué hogares debería dirigirse un programa de cuidados. Es el componente de modelado del *Observatorio de Datos para la Economía del Cuidado* (proyecto integrador, UNRC).

## Hallazgos

| | Sin menores de 6 años | 1 menor | 2 o más |
|---|---|---|---|
| Mujeres 25–54 fuera del mercado laboral | 30.9% | 43.4% | 49.2% |

*ENUT 2024, estimaciones ponderadas con diseño muestral. Los intervalos de confianza al 95% están en el notebook 02.*

- Tener al menos un niño o niña de 0 a 5 años en el hogar se asocia con **momios 1.6 veces mayores** de estar fuera del mercado laboral, controlando por edad, escolaridad, rol en el hogar y tamaño de localidad.
- El número de adultos mayores y de personas que requieren cuidados **no** muestra una asociación distinguible de cero en este modelo.
- **Robusta:** la razón de momios se mantiene entre 1.55 y 1.81 al cambiar la definición del resultado, la población analizada y el uso de pesos.
- **Heterogeneidad no confirmada:** la brecha parece variar por escolaridad, pero la interacción no es significativa (p ≈ 0.12). No hay evidencia suficiente para focalizar el programa por nivel educativo.
- **Modelo bien calibrado** (AUC 0.73). Es un modelo explicativo, no predictivo.
- **Ignorar el diseño muestral subestima los errores estándar entre 27% y 44%.** En esta especificación no cambia qué variables resultan significativas, pero el modelo ingenuo es sistemáticamente demasiado optimista.

## Decisiones metodológicas

- **Las horas de cuidado no entran como variable explicativa.** Hay causalidad inversa: quien no tiene empleo remunerado tiene más tiempo para cuidar. Se usa la *demanda* de cuidados del hogar (composición por edades, personas que requieren cuidados).
- **Asistencia a guardería excluida del modelo** por la misma razón: puede ser consecuencia de que la madre trabaje.
- **Llaves corruptas en los datos oficiales.** Las llaves de persona del CSV de INEGI vienen parcialmente en notación científica (`1.00006E+11`). Se reconstruyeron como `llavehog + n_ren` y se verificó que son únicas.
- **Estimación por dominio.** El diseño se declara sobre toda la muestra y se restringe con `subset()`, no filtrando los datos antes.
- **Asociación, no causalidad.** Ningún resultado debe leerse como "tener hijos causa X".

## Estructura

```
├── scripts/descargar_enut.py            Descarga y descomprime los datos abiertos del INEGI
├── notebooks/
│   ├── 01_preparacion_y_modelo_ingenuo.ipynb   Python: limpieza, 8 gráficas, modelo, interacción, calibración, robustez
│   └── 02_modelo_diseno_muestral.qmd           R: survey::svyglm con estratos, UPM y pesos
├── data/raw/          (no versionado) microdatos ENUT 2024
├── data/processed/    (no versionado) base analítica generada por 01
└── reports/           tabla comparativa de errores estándar
```

## Cómo reproducir

```bash
pip install -r requirements.txt
python scripts/descargar_enut.py
jupyter lab notebooks/01_preparacion_y_modelo_ingenuo.ipynb   # ejecutar completo
```

En R (4.x):

```r
install.packages("survey")
quarto::quarto_render("notebooks/02_modelo_diseno_muestral.qmd")  # o abrirlo en RStudio y dar Render
```

## Próximos pasos

1. Replicar el modelo con la ENOE para verificar si la conclusión se sostiene con otra encuesta.
2. Comparar ENUT y ENOE: dónde coinciden, dónde no y por qué.

## Fuente

INEGI. *Encuesta Nacional sobre Uso del Tiempo (ENUT) 2024*. Datos abiertos. Levantamiento: 7 de octubre a 29 de noviembre de 2024.
