## 2026-11-20 (12:50 a 13:30, hora CDMX) — Matriz de tratamiento de datos de RedCare

**Qué se pidió.** Omar preguntó qué le falta a RedCare (legal, operativo, visual) y pidió que se decidiera el siguiente paso y se hiciera. Se eligió la tabla finalidad–dato–base jurídica–riesgo–medida, evidencia 1 de la UCA Leyes para la Protección de Datos.

**Qué se hizo.** `Analysis/matrices/matriz_tratamiento_datos_redcare.csv`: 33 filas (28 datos y 5 transversales), leída del código vigente (`Frontend/js/app.js`, `legal.js`, `config.js`, `prioridad.js`, `data.js`, `index.html`).

**Hallazgos (confirmados en el código):**
1. El consentimiento lo da solo la cuidadora, pero Barthel y las tareas de salud son datos de la **persona cuidada**, que nunca consiente (D11, D20).
2. El contrato decidido el 18 nov no existe: hay tres casillas («contrato», «escrito», «imss») sin partes ni firma (D27).
3. La CURP del relevo se guarda en claro en `localStorage` y sale en «Exportar todo» (D21, T03).
4. Nombre y teléfono de la referencia se guardan sin plazo; la referencia no recibe aviso (D24).
5. `legal.js` sigue diciendo «particulares o sujetos obligados», contra la decisión del 18 nov (T05). El aviso sigue siendo marcador (`config.js`).
6. Un solo consentimiento cubre la entrevista operativa y el cuestionario de evaluación; deberían ir separados (D07, D12).

**Propuestas (no aplicadas en el código):** retirar ABVD (redundante con Barthel), guardar tareas clínicas solo como bandera «requiere enfermería», hash de CURP para duplicados, borrar la referencia tras verificar, no usar la red del hogar con datos reales, umbral de supresión < 5 casos.

**Límites.** Ningún artículo de ley verificado contra el DOF; plazos de conservación propuestos. Sin revisión de otra persona.

**Pendiente.**
1. Daniel: artículos aplicables, proporcionalidad de la carta de antecedentes y quién es patrón en el contrato.
2. Decidir si se aplican las propuestas en `Frontend/`.
3. Copiar esta entrada al final de `Documentos/bitacora-decisiones.md`.

## 2026-11-20 (13:07 a 14:10, hora CDMX) — Minimización aplicada y contratos en RedCare

**Qué pidió Omar.** Aplicar cuatro propuestas de la matriz (retirar actividades básicas, tareas de salud como sí/no, huella de CURP, borrar la referencia al verificar) y redactar el contrato que decidió el 18 nov.

**Qué se hizo (detalle en `Frontend/README.md`, 2026-11-20).**
- Entrevista: sin las 5 actividades básicas; tareas de salud = una pregunta sí/no (`enfermeria`), con orientación a enfermería. Se quitó el chequeo de actividades contra Barthel.
- CURP: `{ huella, ultimos4 }` + `mayorDeEdad`. Duplicados por huella. `js/huella.js` (SHA-256 comparado contra Node).
- Referencia: visible solo en revisión; se borra al aprobar o rechazar.
- Contratos (`js/contrato.js`): convenio de servicio (hogar ↔ operador, paso 8/8 de la solicitud, firma con alias) y contrato individual de trabajo por horas (relevo ↔ operador, firma escribiendo el nombre del registro). Se guarda la huella del texto firmado, no el texto.
- Migración automática de datos guardados antes.

**Decisión tomada por Claude a pedido de Omar («hazlo tú»):** el operador de RedCare es el patrón; el hogar no paga ni es patrón. Alternativa descartada: familia como patrona (carga IMSS y prestaciones al grupo de bajos ingresos).

**Verificación.** `node tests/prueba_privacidad_contrato.js` (25 OK) y `node tests/prueba_asignacion.js` (OK). Flujo en Chrome a 420 px: solicitud completa con firma, registro de relevo con firma, invalidación de la firma al cambiar días, duplicado por huella, borrado de la referencia al aprobar, asignación con los dos contratos, migración de datos viejos; 23 verificaciones OK, sin errores de JavaScript ni scroll horizontal. No se probó en teléfono real ni en Safari.

**Pendiente.**
1. Daniel: dictamen del modelo de partes (subcontratación, capítulo de trabajo del hogar, firma electrónica simple) y artículos.
2. Razón social del operador y contacto de datos (marcadores en `config.js`).
3. Consentimiento propio de la persona cuidada (matriz D20): sigue faltando.
4. Doble revisión de `contrato.js`, `huella.js` y esta entrada.

## 2026-11-20 (13:21 a 14:40, hora CDMX) — Modelo de plataforma (como Uber, DiDi, Rappi) y consentimiento de la persona cuidada

**Qué pidió Omar.** Resolver los dos huecos señalados: el consentimiento de la persona cuidada y el riesgo de subcontratación del modelo «operador como patrón»; basarse en cómo funcionan Uber, DiDi y Rappi.

**Fuente revisada (confirmado en el texto del DOF, vía SIDOF):** LFT, Título Sexto, Cap. IX Bis (arts. 291-A a 291-U), DOF 24-dic-2024. 291-B: los usuarios no son patrones ni responsables solidarios. 291-C: umbral de un salario mínimo mensual neto; abajo, independiente con riesgos de trabajo. 291-E: libre conexión. 291-F: pago por tarea con proporcionales. 291-G/H: contenido del contrato y registro del modelo ante el CFCRL. 291-J: política de gestión algorítmica. Salario mínimo general 2026: $315.04 diarios, $9,582.47 mensuales.

**Qué se hizo.** Contrato de trabajo en plataforma (v `RC-CT-2026-11-20.2`), convenio con el hogar como usuario (`RC-CS-2026-11-20.2`), pago $53.46/h diurna con proporcionales (factor 1.249, aproximación del prototipo), aviso de umbral IMSS por persona, política de asignación como anexo, casilla «aceptó la oferta» en la asignación. Paso nuevo «Persona cuidada» (propio / representante por acreditar / pendiente); sin consentimiento no hay Barthel ni asignación; el programa lo registra desde el detalle.

**Hallazgo que hay que declarar (probable):** con ≤ 12 h por semana el ingreso es ≈ $2,778 al mes y el umbral pide ≈ 180 h; casi todas las personas de relevo quedarían como independientes. Coincide con lo observado en apps: al 31 jul 2026, 247,900 de 1.59 millones superaron el umbral.

**Verificación.** 32 pruebas en Node OK; 34 verificaciones en Chrome a 420 px OK (incluye salto del Barthel, asignación bloqueada sin consentimiento y registro posterior); sin errores de JavaScript ni scroll horizontal.

**Pendiente.**
1. Daniel: si el cuidado en casas cabe en el Cap. IX Bis; piso salarial (profesional del hogar o general); figuras de representación válidas.
2. Que la persona de relevo acepte la oferta desde su propia vista (hoy lo marca el programa).
3. Capturar el Barthel en la primera visita cuando el consentimiento fue posterior.
4. Doble revisión.
