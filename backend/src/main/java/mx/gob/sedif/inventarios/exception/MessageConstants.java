package mx.gob.sedif.inventarios.exception;

public class MessageConstants {
    // ── Entidades no encontradas ──────────────────────────
    public static final String EMPLEADO_NO_ENCONTRADO = "Empleado no encontrado con id: %s";
    public static final String AREA_NO_ENCONTRADA = "Área no encontrada con id: %s";
    public static final String RESGUARDO_NO_ENCONTRADO = "Resguardo no encontrado con id: %s";
    public static final String RESGUARDOS_NO_EXISTEN = "Uno o más resguardos no existen";
    public static final String USUARIO_NO_ENCONTRADO = "Usuario no encontrado";
    public static final String USUARIO_NO_ENCONTRADO_ID = "Usuario no encontrado con id: %s";
    public static final String USUARIO_NO_ENCONTRADO_TRAS_AUTH = "Usuario no encontrado tras autenticación";

    // ── Duplicate / auth ──────────────────────────────────
    public static final String USUARIO_DUPLICADO = "El nombre de usuario '%s' ya existe";
    public static final String REFRESH_TOKEN_INVALIDO = "Refresh token inválido o expirado. Inicie sesión nuevamente.";
    public static final String CREDENCIALES_INVALIDAS = "Credenciales inválidas";
    public static final String CONTRASENA_OBLIGATORIA = "La contraseña es obligatoria";

    // ── Permisos / roles ──────────────────────────────────
    public static final String ACCESO_DENEGADO = "Acceso denegado";
    public static final String NO_AUTENTICADO = "No autenticado";
    public static final String ROL_NO_PERMITIDO = "No tienes permisos para asignar el rol %s";

    // ── Resguardo ─────────────────────────────────────────
    public static final String BIEN_YA_DADO_BAJA = "El bien ya se encuentra dado de baja";
    public static final String NO_LIBERAR_BIEN_BAJA = "No se puede liberar un bien dado de baja";
    public static final String REASIGNAR_SOLO_ACTIVO = "Solo se puede reasignar un bien que esté activo";
    public static final String ASIGNAR_SOLO_DISPONIBLE = "Solo se puede asignar un bien que esté disponible";
    public static final String SELECCIONAR_AL_MENOS_UN_BIEN = "Debe seleccionar al menos un bien";
    public static final String AREA_OBLIGATORIA = "El área de adscripción es obligatoria";
    public static final String FORMATO_SIN_EMPLEADO = "No se puede generar el formato de bienes sin empleado asignado: %s";
    public static final String MAX_IDS_EXCEDIDO = "No se pueden procesar más de %d bienes por petición (recibidos %d)";

    // ── Histórico ─────────────────────────────────────────
    public static final String ALTA_BIEN_HISTORIAL = "Alta de bien";

    // ── Infra / errores ───────────────────────────────────
    public static final String ERROR_INTEGRIDAD = "Error de integridad de datos";
    public static final String SOLICITUD_MAL_FORMADA = "Solicitud mal formada";
    public static final String METODO_NO_SOPORTADO = "Método HTTP no soportado";
    public static final String RATE_LIMIT_EXCEDIDO = "Demasiados intentos. Intente de nuevo en un minuto.";
    public static final String ERROR_VALIDACION = "Error de validación: %s";
    public static final String CAMPO_ORDEN_INVALIDO = "Campo de ordenamiento inválido: %s";
    public static final String ERROR_INTERNO = "Error interno del servidor";
}
