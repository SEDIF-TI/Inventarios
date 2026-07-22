import { Autocomplete, TextField, InputAdornment, CircularProgress, Box } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

/**
 * Filtro de texto con autocompletado.
 *
 * Es freeSolo: se puede escribir cualquier cosa (el backend filtra con LIKE parcial) y las
 * sugerencias son solo una ayuda, no una lista cerrada. Llegan del servidor conforme se
 * escribe (ver hooks/useSugerencias).
 *
 * autoHighlight es intencional: resalta la primera sugerencia para que Enter la seleccione
 * en vez de buscar el texto a medias. Escribir "lap" y dar Enter busca "LAPTOP DELL", que
 * es lo que se espera al teclear un prefijo. Si no hay sugerencias, Enter deja lo tecleado.
 *
 * @param opciones sugerencias a mostrar
 * @param cargando si se están pidiendo sugerencias, para dar señal de actividad
 */
export default function FiltroAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  opciones = [],
  cargando = false,
  conIcono = false,
  sx,
}) {
  return (
    <Autocomplete
      freeSolo
      autoHighlight
      options={opciones}
      loading={cargando}
      inputValue={value ?? ''}
      onInputChange={(_, v) => onChange(v ?? '')}
      // Las sugerencias ya vienen filtradas por el servidor: volver a filtrarlas aquí
      // solo las recortaría de más (p. ej. si coinciden por un campo que no se muestra).
      filterOptions={(opts) => opts}
      sx={sx}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            ...(conIcono && {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }),
            // Se conserva el endAdornment original: ahí viven la X de limpiar y la flecha.
            endAdornment: (
              <>
                {cargando && <CircularProgress size={16} sx={{ mr: 1 }} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}
