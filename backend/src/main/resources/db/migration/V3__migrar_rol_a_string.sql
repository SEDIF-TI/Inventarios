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

INSERT INTO tbl_usuario (
    s_nombre_usuario,
    s_password,
    n_rol,
    b_activo
)
VALUES (
    'Marlen',
    '$2a$10$gI32PXBEXXvEyxxCZWIzCeEKO8G8mj4c8al3aAwvG.H8f5UQH0bnC',
    'ADMIN',
    TRUE
);