# 31_verificacion_survey.R — comprobación independiente del notebook 31 con el paquete `survey`.
#
# Por qué existe: el notebook 31 calcula la varianza con linealización de Taylor escrita a mano (numpy/pandas). El INEGI
# publica en «Conociendo la base de datos» (ENASIC 2022, apartado C) el código de referencia en R con `survey`. Este script
# aplica el mismo método (diseño con estratos EST_DIS y conglomerados UPM_DIS, totales ya ponderados, cociente con svyratio)
# a los mismos indicadores y compara contra resultados/31_afectaciones_cuidadoras.csv.
#
# ESTADO: ESCRITO PERO NO EJECUTADO. R no estaba instalado donde se preparó (3 nov 2026). Al correrlo debe terminar con
# «OK: ...». Si falla el `stopifnot`, hay una diferencia real entre el notebook y `survey`: no publicar hasta resolverla.
#
# Uso (desde Analysis/):  Rscript 31_verificacion_survey.R
# Requiere: install.packages("survey")

library(survey)
options(survey.lonely.psu = "remove")   # igual que el notebook: un estrato con una sola UPM no aporta varianza

ruta <- file.path("datos", "enasic", "conjunto_de_datos_tpob_cui_enasic_2022", "conjunto_de_datos",
                  "conjunto_de_datos_tpob_cui_enasic_2022.csv")
cui <- read.csv(ruta, colClasses = "character", check.names = FALSE)
names(cui) <- toupper(names(cui))
cui$W <- as.numeric(cui$FAC_CUI)

es1 <- function(col) cui[[col]] %in% "1"
sii <- function(a, b) as.numeric(es1(a) | es1(b))   # «sí» en cualquiera de los dos bloques (6.11 o 6.30)

Y <- list(cansado = sii("P6_11_3", "P6_30_3"), sueno = sii("P6_11_6", "P6_30_6"), irritado = sii("P6_11_5", "P6_30_5"),
          deprimido = sii("P6_11_4", "P6_30_4"), salud = sii("P6_11_1", "P6_30_1"), terapia = sii("P6_11_2", "P6_30_2"),
          enfermedad = sii("P6_11_7", "P6_30_7"))
Y$salud3 <- pmax(Y$salud, Y$cansado, Y$sueno)

resp <- (cui$P6_11_1 %in% c("1", "2")) | (cui$P6_30_1 %in% c("1", "2"))
UNIV <- list(A = (es1("FILTRO6_1") | es1("FILTRO6_2") | es1("FILTRO6_3") | es1("FILTRO6_6") | es1("FILTRO6_8")) & resp,
             B = (es1("FILTRO6_1") | es1("FILTRO6_6")) & resp)
SEXO <- list(Total = rep(TRUE, nrow(cui)), Mujeres = cui$SEXO == "2", Hombres = cui$SEXO == "1")

diseno <- svydesign(id = ~UPM_DIS, strata = ~EST_DIS, weights = ~1, data = cui)   # como en el código del INEGI

salida <- data.frame()
for (u in names(UNIV)) for (s in names(SEXO)) for (k in names(Y)) {
  dom <- UNIV[[u]] & SEXO[[s]]
  cui$NUM <- cui$W * Y[[k]] * dom       # totales ya ponderados, igual que a1, a2, a3 en el código del INEGI
  cui$DEN <- cui$W * dom
  diseno <- update(diseno, NUM = cui$NUM, DEN = cui$DEN)
  e <- svyratio(~NUM, ~DEN, diseno)
  ci <- confint(e, level = 0.90) * 100
  salida <- rbind(salida, data.frame(universo = u, sexo = s, clave = k, pct_R = as.numeric(coef(e)) * 100,
                                     cv_R = as.numeric(cv(e)) * 100, li90_R = ci[1, 1], ls90_R = ci[1, 2]))
}

py <- read.csv(file.path("resultados", "31_afectaciones_cuidadoras.csv"), fileEncoding = "UTF-8-BOM")
py$universo <- substr(py$universo, 1, 1)
cmp <- merge(py, salida, by = c("universo", "sexo", "clave"))
stopifnot(nrow(cmp) == nrow(py), nrow(cmp) == 48)
cat("Máxima diferencia |pct|:", max(abs(cmp$pct - cmp$pct_R)), "pp\n")
cat("Máxima diferencia |cv| :", max(abs(cmp$cv - cmp$cv_R)), "puntos de CV\n")
stopifnot(max(abs(cmp$pct - cmp$pct_R)) < 0.05, max(abs(cmp$cv - cmp$cv_R)) < 0.5)
write.csv(cmp, file.path("resultados", "31_verificacion_survey_R.csv"), row.names = FALSE, fileEncoding = "UTF-8")
cat("OK: el notebook 31 y el paquete survey coinciden en las 48 filas.\n")
