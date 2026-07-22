import { Autocomplete, TextField, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

/**
 * Filtro de texto con autocompletado.
 *
 * Es freeSolo: puedes escribir lo que sea (el backend filtra con LIKE parcial), y las
 * sugerencias son solo una ayuda. Se muestran únicamente cuando ya escribiste algo,
 * para no desplegar un catálogo entero al enfocar el campo.
 *
 * @param opciones lista de strings de donde salen las sugerencias
 */
export default function FiltroAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  opciones = [],
  conIcono = false,
  sx,
}) {
  return (
    <Autocomplete
      freeSolo
      options={opciones}
      inputValue={value ?? ''}
      onInputChange={(_, v) => onChange(v ?? '')}
      filterOptions={(opts, { inputValue }) => {
        const texto = inputValue.trim().toUpperCase()
        if (!texto) return []
        return opts.filter((o) => o?.toUpperCase().includes(texto)).slice(0, 8)
      }}
      noOptionsText="Sin sugerencias"
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
          }}
        />
      )}
    />
  )
}
