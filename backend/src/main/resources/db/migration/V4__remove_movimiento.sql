-- 1. Quitar la FK
ALTER TABLE sc_inventario.tbl_historial_resguardo 
DROP CONSTRAINT idmovimiento;

-- 2. Quitar la columna
ALTER TABLE sc_inventario.tbl_historial_resguardo 
DROP COLUMN fk_n_id_movimiento;

-- 3. Borrar la tabla
DROP TABLE sc_inventario.tbl_movimiento;