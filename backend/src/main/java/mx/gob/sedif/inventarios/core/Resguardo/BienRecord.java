package mx.gob.sedif.inventarios.core.Resguardo;

import mx.gob.sedif.inventarios.util.enums.Estado;

public record BienRecord(
    String noInventario,
    String descripcionBien,
    Estado estadoBien,
    String marca,
    String modelo,
    String noSerie,
    String materialColor
) {
    public static BienRecord from(ResguardoRecord r) {
        String materialColor = String.join(", ",
            r.materialBien() != null ? r.materialBien() : "",
            r.colorBien() != null ? r.colorBien() : ""
        );

        return new BienRecord(
            r.noInventarioBien(),
            r.descripcionBien(),
            r.estadoBien(),
            r.marcaBien(),
            r.modeloBien(),
            r.noSerieBien(),
            materialColor
        );
    }
}