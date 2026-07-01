package mx.gob.sedif.inventarios.core.Resguardo;

import java.time.format.TextStyle;
import java.util.Locale;

public record EtiquetaRecord(
    String codigoAreaAdscripcion,
    String areaAdscripcion,
    String descripcionBien,
    String marcaBien,
    String noSerieBien,
    String empleado,
    String noInventarioBien,
    String mesAnioAsignacion
) {

    public static EtiquetaRecord from(ResguardoRecord r) {
        String mesAnio = null;
        if (r.fechaAsignacionBien() != null) {
            String mes = r.fechaAsignacionBien()
                .getMonth()
                .getDisplayName(TextStyle.FULL, new Locale("es", "MX"))
                .toUpperCase(new Locale("es", "MX"));
            mesAnio = mes + " " + r.fechaAsignacionBien().getYear();
        }

        return new EtiquetaRecord(
            r.codigoAreaAdscripcion(),
            r.areaAdscripcion(),
            r.descripcionBien(),
            r.marcaBien(),
            r.noSerieBien(),
            r.empleado(),
            r.noInventarioBien(),
            mesAnio
        );
    }
}