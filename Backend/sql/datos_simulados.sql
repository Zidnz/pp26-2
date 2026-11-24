SET search_path = redcare, public;
INSERT INTO institucion (nombre, tipo) VALUES ('Alcaldía Azcapotzalco · Tú cuidas, Azcapo te cuida', 'Alcaldía'), ('DIF', 'DIF');
INSERT INTO tarea (nombre) VALUES ('Acompañamiento y supervisión'), ('Apoyo para comer'), ('Apoyo en higiene personal'), ('Apoyo para moverse en casa'), ('Recordatorio de medicamentos (sin administrarlos)');
INSERT INTO caso (folio, alias, sexo, alcaldia, canal, institucion_id) VALUES
 ('C-0001', 'Lupita', 'M', 'Azcapotzalco', 'referencia', 1),
 ('C-0002', 'Rosa',   'M', 'Azcapotzalco', 'autorregistro', NULL),
 ('C-0003', 'Beto',   'H', 'Azcapotzalco', 'referencia', 1),
 ('C-0004', 'Marta',  'M', 'Azcapotzalco', 'autorregistro', NULL),
 ('C-0005', 'Juana',  'M', 'Azcapotzalco', 'referencia', 2);
INSERT INTO persona_cuidada SELECT id, 'Doña ' || alias, 'M' FROM caso;
INSERT INTO entrevista (caso_id, horas_semana, requiere_enfermeria, barthel, cuestionario_total)
SELECT id, h, e, b, z FROM caso JOIN (VALUES ('C-0001',60,true,35,30),('C-0002',20,false,85,12),('C-0003',45,false,50,22),('C-0004',72,false,20,38),('C-0005',41,true,40,25)) v(f,h,e,b,z) ON v.f = caso.folio;
INSERT INTO consentimiento (caso_id, titular, estado, version_aviso) SELECT id, 'cuidadora', 'otorgado', '2026-11-21' FROM caso;
INSERT INTO consentimiento (caso_id, titular, estado, version_aviso) SELECT id, 'persona_cuidada', 'otorgado', '2026-11-21' FROM caso;
INSERT INTO persona_relevo (nombre, sexo, alcaldia, curp_huella, curp_ultimos4, documento_id, certificada, verificacion, entrevista_ok, ref_estado)
VALUES ('Karla Vázquez', 'M', 'Azcapotzalco', encode(hmac('VAKK950312MDFLRR08', 'clave-del-servidor', 'sha256'), 'hex'), 'RR08', 'INE vigente', true, 'aprobada', true, 'verificada');
INSERT INTO firma (documento, version, relevo_id, firmante, huella)
SELECT 'contrato_trabajo', 'RC-CT-2026-11-21.3', id, nombre, encode(digest('texto del contrato', 'sha256'), 'hex') FROM persona_relevo;
INSERT INTO asignacion (caso_id, relevo_id, desde, acepta)
SELECT c.id, r.id, current_date, true FROM caso c, persona_relevo r WHERE c.folio = 'C-0001';
INSERT INTO visita (asignacion_id, fecha, llegada, salida, estado, pago)
SELECT id, current_date, '09:00', '12:00', 'realizada', 3 * 53.46 FROM asignacion;
INSERT INTO acceso_log (accion, tabla, registro) VALUES ('asignar', 'asignacion', '1');
-- 24 nov 2026: datos FICTICIOS de operación
INSERT INTO domicilio (caso_id, texto) SELECT caso_id, 'Calle Simulada 12, Colonia de Ejemplo, Azcapotzalco' FROM asignacion WHERE hasta IS NULL;
INSERT INTO contacto (caso_id, tipo, nombre, parentesco, telefono) SELECT id, 'emergencia', 'Contacto Ficticio Uno', 'Hermana', '5500000001' FROM caso WHERE folio = 'C-0001';
INSERT INTO contacto (caso_id, tipo, nombre, parentesco, telefono, recibe) SELECT id, 'autorizada', 'Contacto Ficticio Dos', 'Hijo', '5500000002', ARRAY['horarios','incidentes'] FROM caso WHERE folio = 'C-0001';
INSERT INTO pago_relevo (relevo_id, banco, ultimos4) SELECT id, 'Banco Ficticio', '4821' FROM persona_relevo;
INSERT INTO seguimiento_semanal (caso_id, semana, cansancio, malas_noches, empleo)
SELECT id, date_trunc('week', current_date)::date, 3, 4, 'parcial' FROM caso WHERE folio = 'C-0001';
