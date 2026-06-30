SELECT setval(
  pg_get_serial_sequence('sc_inventario.tbl_area_adscripcion', 'pk_n_id_area_adscripcion'),
  COALESCE((SELECT MAX(pk_n_id_area_adscripcion) FROM sc_inventario.tbl_area_adscripcion), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('sc_inventario.tbl_empleado', 'pk_n_id_empleado'),
  COALESCE((SELECT MAX(pk_n_id_empleado) FROM sc_inventario.tbl_empleado), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('sc_inventario.tbl_resguardo', 'pk_n_id_bien'),
  COALESCE((SELECT MAX(pk_n_id_bien) FROM sc_inventario.tbl_resguardo), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('sc_inventario.tbl_usuario', 'pk_n_id_usuario'),
  COALESCE((SELECT MAX(pk_n_id_usuario) FROM sc_inventario.tbl_usuario), 0) + 1,
  false
);