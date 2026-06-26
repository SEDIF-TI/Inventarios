SELECT setval(
  pg_get_serial_sequence('sc_inventario.tbl_empleado', 'pk_n_id_empleado'),
  (SELECT MAX(pk_n_id_empleado) FROM sc_inventario.tbl_empleado)
);