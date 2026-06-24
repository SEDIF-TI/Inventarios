CREATE TABLE tbl_usuario (
    pk_n_id_usuario SERIAL PRIMARY KEY,
    s_nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
    s_password VARCHAR(255) NOT NULL,
    n_rol INT NOT NULL,
    b_activo BOOLEAN NOT NULL DEFAULT TRUE
);