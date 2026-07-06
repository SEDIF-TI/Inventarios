ALTER TABLE tbl_historial_resguardo
    ADD COLUMN fk_n_id_usuario INT;

ALTER TABLE tbl_historial_resguardo
    ADD CONSTRAINT fk_historial_usuario
    FOREIGN KEY (fk_n_id_usuario) REFERENCES tbl_usuario(pk_n_id_usuario);
