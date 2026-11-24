SET search_path = redcare, public;
\echo '1) regla de entrada'
SELECT folio, horas_semana, dentro_regla, consentimiento_persona FROM caso_prioridad ORDER BY folio;
\echo '2) agregado para el Observatorio (celdas >= 5)'
SELECT * FROM agregado_alcaldia;
\echo '3) CURP duplicada (debe fallar)'
INSERT INTO persona_relevo (nombre, sexo, alcaldia, curp_huella, curp_ultimos4, documento_id)
SELECT 'Otra', 'M', 'Azcapotzalco', curp_huella, 'RR08', 'INE' FROM persona_relevo LIMIT 1;
\echo '4) alias con teléfono (debe fallar)'
INSERT INTO caso (folio, alias, sexo, alcaldia, canal) VALUES ('C-9', 'Ana 5512345678', 'M', 'Azcapotzalco', 'autorregistro');
\echo '5) referencia en registro aprobado (debe fallar)'
UPDATE persona_relevo SET ref_nombre = 'Juan' WHERE verificacion = 'aprobada';
\echo '6) segunda asignación vigente para el mismo caso (debe fallar)'
INSERT INTO asignacion (caso_id, relevo_id, desde, acepta) SELECT caso_id, relevo_id, current_date, true FROM asignacion LIMIT 1;
\echo '7) borrar la bitácora (debe fallar)'
DELETE FROM acceso_log;
\echo '8) horas imposibles (debe fallar)'
UPDATE entrevista SET horas_semana = 200;
\echo '9) domicilio sin relevo asignado (debe fallar)'
INSERT INTO domicilio (caso_id, texto) SELECT id, 'Calle Simulada 1' FROM caso WHERE folio = 'C-0002';
\echo '10) contacto de emergencia con «recibe» (debe fallar)'
UPDATE contacto SET recibe = ARRAY['horarios'] WHERE tipo = 'emergencia';
\echo '11) cuenta de pago completa (debe fallar)'
UPDATE pago_relevo SET ultimos4 = '0123456789';
\echo '12) cerrar el caso borra domicilio y contactos (debe dar 0 y 0)'
UPDATE caso SET estado = 'cerrado' WHERE folio = 'C-0001';
SELECT (SELECT count(*) FROM domicilio d JOIN caso c ON c.id = d.caso_id WHERE c.folio = 'C-0001') AS domicilios,
       (SELECT count(*) FROM contacto k JOIN caso c ON c.id = k.caso_id WHERE c.folio = 'C-0001') AS contactos;
