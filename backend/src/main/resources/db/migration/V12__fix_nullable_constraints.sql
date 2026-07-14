-- P4: El historial de movimientos puede registrarse sin empleado
-- (ej: cuando se da de baja un bien y se desvincula el resguardante)
ALTER TABLE tbl_historial_resguardo
    ALTER COLUMN fk_n_id_empleado DROP NOT NULL;
