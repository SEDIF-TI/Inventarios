ALTER TABLE sc_inventario.tbl_usuario ADD COLUMN s_rol_tmp VARCHAR(20);

UPDATE sc_inventario.tbl_usuario
SET s_rol_tmp = CASE n_rol
    WHEN 0 THEN 'ADMIN'
    WHEN 1 THEN 'ANALISTA'
    ELSE 'ADMIN'
END;

ALTER TABLE sc_inventario.tbl_usuario ALTER COLUMN s_rol_tmp SET NOT NULL;

ALTER TABLE sc_inventario.tbl_usuario DROP COLUMN n_rol;

ALTER TABLE sc_inventario.tbl_usuario RENAME COLUMN s_rol_tmp TO n_rol;