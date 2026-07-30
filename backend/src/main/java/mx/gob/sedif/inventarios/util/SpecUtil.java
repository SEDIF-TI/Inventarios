package mx.gob.sedif.inventarios.util;

public final class SpecUtil {

    private SpecUtil() {}

    /**
     * Escapa los caracteres especiales de LIKE ({@code %} y {@code _}) para que se
     * busquen literalmente y no se interpreten como comodines.
     */
    public static String escapeLike(String input) {
        if (input == null) return null;
        return input.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
