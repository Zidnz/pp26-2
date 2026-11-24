-- RedCare · esquema relacional en PostgreSQL (16)
-- 21 nov 2026; 24 nov 2026: domicilio, contactos, pago y seguimiento semanal (ficticios en el prototipo). Mismo modelo de datos que la app (js/data.js), con la minimización del 20 nov:
-- sin CURP en claro (solo huella con clave), sin actividades básicas, tareas de salud solo sí/no,
-- referencia del relevo borrada al resolver el registro. Datos de ejemplo: simulados.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS redcare;
SET search_path = redcare, public;

CREATE TYPE canal_t       AS ENUM ('autorregistro', 'referencia');
CREATE TYPE sexo_t        AS ENUM ('M', 'H');
CREATE TYPE estado_caso_t AS ENUM ('espera', 'activo', 'pausa', 'cerrado');
CREATE TYPE titular_t     AS ENUM ('cuidadora', 'persona_cuidada');
CREATE TYPE via_cp_t      AS ENUM ('propio', 'representante', 'pendiente');
CREATE TYPE estado_cp_t   AS ENUM ('otorgado', 'por_acreditar', 'acreditado', 'pendiente', 'retirado');
CREATE TYPE verif_t       AS ENUM ('en_revision', 'aprobada', 'rechazada');
CREATE TYPE documento_t   AS ENUM ('convenio_servicio', 'contrato_trabajo');
CREATE TYPE estado_vis_t  AS ENUM ('programada', 'realizada', 'ausencia', 'cancelada');
CREATE TYPE jornada_t     AS ENUM ('diurna', 'mixta', 'nocturna');

CREATE TABLE institucion (
  id      smallserial PRIMARY KEY,
  nombre  text NOT NULL,
  tipo    text NOT NULL CHECK (tipo IN ('DIF', 'Centro de salud', 'Escuela', 'Clínica', 'Módulo del programa', 'Alcaldía'))
);

CREATE TABLE caso (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folio           text UNIQUE NOT NULL,
  alias           text NOT NULL CHECK (alias !~ '[0-9@]'),      -- sin teléfonos ni correos
  sexo            sexo_t NOT NULL,
  alcaldia        text NOT NULL,
  canal           canal_t NOT NULL,
  institucion_id  smallint REFERENCES institucion(id),
  estado          estado_caso_t NOT NULL DEFAULT 'espera',
  creado          timestamptz NOT NULL DEFAULT now(),
  CHECK (canal = 'autorregistro' OR institucion_id IS NOT NULL)
);

CREATE TABLE persona_cuidada (
  caso_id  uuid PRIMARY KEY REFERENCES caso(id) ON DELETE CASCADE,
  alias    text NOT NULL CHECK (alias !~ '[0-9@]'),
  sexo     sexo_t NOT NULL
);

CREATE TABLE entrevista (
  caso_id              uuid PRIMARY KEY REFERENCES caso(id) ON DELETE CASCADE,
  horas_semana         numeric(5,1) NOT NULL CHECK (horas_semana BETWEEN 0 AND 168),
  requiere_enfermeria  boolean NOT NULL,                        -- solo sí/no
  barthel              smallint CHECK (barthel BETWEEN 0 AND 100), -- null si la persona cuidada no ha consentido
  cuestionario_total   smallint CHECK (cuestionario_total BETWEEN 0 AND 48),
  fecha                date NOT NULL DEFAULT current_date
);

CREATE TABLE consentimiento (
  id             bigserial PRIMARY KEY,
  caso_id        uuid NOT NULL REFERENCES caso(id) ON DELETE CASCADE,
  titular        titular_t NOT NULL,
  via            via_cp_t NOT NULL DEFAULT 'propio',
  estado         estado_cp_t NOT NULL,
  version_aviso  text NOT NULL,
  fecha          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (caso_id, titular)
);

CREATE TABLE persona_relevo (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL,
  sexo            sexo_t NOT NULL,
  alcaldia        text NOT NULL,
  curp_huella     char(64) UNIQUE NOT NULL CHECK (curp_huella ~ '^[0-9a-f]{64}$'), -- HMAC-SHA-256; la CURP no se guarda
  curp_ultimos4   char(4) NOT NULL,
  documento_id    text NOT NULL,
  certificada     boolean NOT NULL DEFAULT false,
  verificacion    verif_t NOT NULL DEFAULT 'en_revision',
  entrevista_ok   boolean NOT NULL DEFAULT false,
  ref_nombre      text,
  ref_telefono    text CHECK (ref_telefono ~ '^[0-9]{10}$'),
  ref_estado      text CHECK (ref_estado IN ('verificada', 'descartada')),
  creado          timestamptz NOT NULL DEFAULT now(),
  -- la referencia solo existe mientras el registro está en revisión
  CHECK (verificacion = 'en_revision' OR (ref_nombre IS NULL AND ref_telefono IS NULL))
);

CREATE TABLE disponibilidad (
  relevo_id   uuid NOT NULL REFERENCES persona_relevo(id) ON DELETE CASCADE,
  dia         smallint NOT NULL CHECK (dia BETWEEN 0 AND 6),
  desde       time NOT NULL,
  hasta       time NOT NULL CHECK (hasta > desde),
  PRIMARY KEY (relevo_id, dia)
);

CREATE TABLE tarea (
  id      smallserial PRIMARY KEY,
  nombre  text UNIQUE NOT NULL
);
CREATE TABLE relevo_tarea (
  relevo_id  uuid REFERENCES persona_relevo(id) ON DELETE CASCADE,
  tarea_id   smallint REFERENCES tarea(id),
  PRIMARY KEY (relevo_id, tarea_id)
);
CREATE TABLE caso_tarea (
  caso_id   uuid REFERENCES caso(id) ON DELETE CASCADE,
  tarea_id  smallint REFERENCES tarea(id),
  PRIMARY KEY (caso_id, tarea_id)
);

CREATE TABLE firma (
  id         bigserial PRIMARY KEY,
  documento  documento_t NOT NULL,
  version    text NOT NULL,
  caso_id    uuid REFERENCES caso(id) ON DELETE CASCADE,
  relevo_id  uuid REFERENCES persona_relevo(id) ON DELETE CASCADE,
  firmante   text NOT NULL,
  huella     char(64) NOT NULL CHECK (huella ~ '^[0-9a-f]{64}$'), -- SHA-256 del texto firmado
  fecha      timestamptz NOT NULL DEFAULT now(),
  CHECK ((documento = 'convenio_servicio' AND caso_id IS NOT NULL AND relevo_id IS NULL)
      OR (documento = 'contrato_trabajo' AND relevo_id IS NOT NULL AND caso_id IS NULL))
);

CREATE TABLE asignacion (
  id          bigserial PRIMARY KEY,
  caso_id     uuid NOT NULL REFERENCES caso(id),
  relevo_id   uuid NOT NULL REFERENCES persona_relevo(id),
  desde       date NOT NULL,
  hasta       date,
  motivo_fin  text,
  acepta      boolean NOT NULL,                                 -- la persona de relevo aceptó la oferta
  CHECK (acepta), CHECK (hasta IS NULL OR hasta >= desde)
);
-- un caso tiene a lo más una asignación vigente
CREATE UNIQUE INDEX asignacion_vigente ON asignacion (caso_id) WHERE hasta IS NULL;

CREATE TABLE visita (
  id             bigserial PRIMARY KEY,
  asignacion_id  bigint NOT NULL REFERENCES asignacion(id),
  fecha          date NOT NULL,
  llegada        time,
  salida         time,
  jornada        jornada_t NOT NULL DEFAULT 'diurna',
  estado         estado_vis_t NOT NULL DEFAULT 'programada',
  pago           numeric(9,2) CHECK (pago >= 0),
  CHECK (estado <> 'realizada' OR (llegada IS NOT NULL AND salida > llegada))
);

CREATE TABLE incidente (
  id         bigserial PRIMARY KEY,
  caso_id    uuid NOT NULL REFERENCES caso(id),
  visita_id  bigint REFERENCES visita(id),
  categoria  text NOT NULL CHECK (categoria IN ('ausencia', 'retraso', 'trato', 'seguridad', 'salud', 'otro')),
  reporta    titular_t,
  nota       text,
  fecha      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE bolsa_mes (
  mes            date PRIMARY KEY CHECK (extract(day FROM mes) = 1),
  horas_totales  integer NOT NULL CHECK (horas_totales > 0),
  minimo         smallint NOT NULL DEFAULT 13,
  tope           smallint NOT NULL DEFAULT 52
);
CREATE TABLE horas_caso_mes (
  mes      date REFERENCES bolsa_mes(mes),
  caso_id  uuid REFERENCES caso(id),
  horas    smallint NOT NULL CHECK (horas >= 0),
  PRIMARY KEY (mes, caso_id)
);

-- 24 nov 2026 · Datos que pide la operación (FICTICIOS en el prototipo)
CREATE TYPE contacto_t AS ENUM ('emergencia', 'autorizada');
CREATE TYPE empleo_t   AS ENUM ('si', 'parcial', 'no');

-- Domicilio: solo mientras hay relevo asignado; se borra al cerrar el caso (trigger abajo)
CREATE TABLE domicilio (
  caso_id   uuid PRIMARY KEY REFERENCES caso(id) ON DELETE CASCADE,
  texto     text NOT NULL,
  simulado  boolean NOT NULL DEFAULT true,
  fecha     date NOT NULL DEFAULT current_date
);

-- Contacto de emergencia y personas autorizadas: opcionales, máximo uno de cada tipo
CREATE TABLE contacto (
  id          bigserial PRIMARY KEY,
  caso_id     uuid NOT NULL REFERENCES caso(id) ON DELETE CASCADE,
  tipo        contacto_t NOT NULL,
  nombre      text NOT NULL,
  parentesco  text NOT NULL,
  telefono    text NOT NULL CHECK (telefono ~ '^[0-9]{10}$'),
  recibe      text[] CHECK (tipo = 'autorizada' OR recibe IS NULL),   -- solo la persona autorizada recibe información
  simulado    boolean NOT NULL DEFAULT true,
  UNIQUE (caso_id, tipo)
);

-- Pago a la persona de relevo: solo banco y últimos 4 dígitos (la cuenta completa la guarda el proveedor de pagos)
CREATE TABLE pago_relevo (
  relevo_id  uuid PRIMARY KEY REFERENCES persona_relevo(id) ON DELETE CASCADE,
  banco      text NOT NULL,
  ultimos4   char(4) NOT NULL CHECK (ultimos4 ~ '^[0-9]{4}$'),
  simulado   boolean NOT NULL DEFAULT true
);

-- Seguimiento semanal: cansancio, noches de mal sueño y si pudo trabajar o estudiar
CREATE TABLE seguimiento_semanal (
  caso_id        uuid REFERENCES caso(id) ON DELETE CASCADE,
  semana         date NOT NULL CHECK (extract(isodow FROM semana) = 1),
  cansancio      smallint NOT NULL CHECK (cansancio BETWEEN 0 AND 4),
  malas_noches   smallint NOT NULL CHECK (malas_noches BETWEEN 0 AND 7),
  empleo         empleo_t,
  PRIMARY KEY (caso_id, semana)
);

-- Al cerrar el caso se borran el domicilio y los contactos
CREATE FUNCTION borrar_al_cerrar() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.estado = 'cerrado' AND OLD.estado <> 'cerrado' THEN
    DELETE FROM domicilio WHERE caso_id = NEW.id;
    DELETE FROM contacto  WHERE caso_id = NEW.id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER caso_cerrado AFTER UPDATE OF estado ON caso FOR EACH ROW EXECUTE FUNCTION borrar_al_cerrar();
-- No puede haber domicilio sin una asignación vigente
CREATE FUNCTION domicilio_con_asignacion() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM asignacion a WHERE a.caso_id = NEW.caso_id AND a.hasta IS NULL) THEN
    RAISE EXCEPTION 'el domicilio solo se pide cuando hay relevo asignado';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER domicilio_requiere_asignacion BEFORE INSERT ON domicilio FOR EACH ROW EXECUTE FUNCTION domicilio_con_asignacion();

-- Bitácora de accesos: solo inserción
CREATE TABLE acceso_log (
  id        bigserial PRIMARY KEY,
  usuario   text NOT NULL DEFAULT current_user,
  accion    text NOT NULL,
  tabla     text NOT NULL,
  registro  text,
  fecha     timestamptz NOT NULL DEFAULT now()
);
CREATE FUNCTION no_modificar() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'acceso_log es de solo inserción'; END $$;
CREATE TRIGGER acceso_log_inmutable BEFORE UPDATE OR DELETE ON acceso_log FOR EACH ROW EXECUTE FUNCTION no_modificar();

-- Regla de entrada (≥ 40 h a la semana) como vista, igual que la app
CREATE VIEW caso_prioridad AS
SELECT c.id, c.folio, c.alcaldia, e.horas_semana,
       (e.horas_semana >= 40) AS dentro_regla,
       e.requiere_enfermeria,
       EXISTS (SELECT 1 FROM consentimiento k WHERE k.caso_id = c.id AND k.titular = 'persona_cuidada'
               AND k.estado IN ('otorgado', 'acreditado')) AS consentimiento_persona
FROM caso c JOIN entrevista e ON e.caso_id = c.id;

-- Roles
DO $$ BEGIN CREATE ROLE redcare_programa NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE redcare_observatorio NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
GRANT USAGE ON SCHEMA redcare TO redcare_programa, redcare_observatorio;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA redcare TO redcare_programa;
GRANT INSERT ON acceso_log TO redcare_programa;
REVOKE UPDATE, DELETE ON acceso_log FROM redcare_programa;
-- El Observatorio solo ve agregados
CREATE VIEW agregado_alcaldia AS
SELECT alcaldia, count(*) AS casos, count(*) FILTER (WHERE dentro_regla) AS dentro_regla
FROM caso_prioridad GROUP BY alcaldia HAVING count(*) >= 5;   -- celdas < 5 no se publican
GRANT SELECT ON agregado_alcaldia TO redcare_observatorio;
