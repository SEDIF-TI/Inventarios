-- 1. Nueva columna de estatus, con default para no romper filas existentes
ALTER TABLE tbl_resguardo
    ADD COLUMN s_estatus_resguardo VARCHAR(20) NOT NULL DEFAULT 'ACTIVO';

-- 2. Quitar el NOT NULL de la FK a empleado, ya que DISPONIBLE implica sin resguardante
ALTER TABLE tbl_resguardo
    ALTER COLUMN fk_n_id_empleado DROP NOT NULL;

-- 3. (opcional pero recomendado) constraint para blindar valores válidos a nivel BD
ALTER TABLE tbl_resguardo
    ADD CONSTRAINT chk_estatus_resguardo
    CHECK (s_estatus_resguardo IN ('ACTIVO', 'BAJA', 'DISPONIBLE'));

-- 4. quitar el default una vez migrados los datos existentes, si prefieres
--    que el valor siempre venga explícito desde la entidad (opcional)
-- ALTER TABLE tbl_resguardo ALTER COLUMN s_estatus_resguardo DROP DEFAULT;