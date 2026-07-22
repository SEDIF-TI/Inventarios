import { useState, useEffect } from 'react'
import { Autocomplete, TextField } from '@mui/material'

/**
 * Select de catálogo (Área, Empleado, etc.) con autocompletado por texto.
 *
 * A diferencia de dejarle el texto del campo a MUI (estado interno, no controlado), aquí
 * lo controla este componente explícitamente. MUI decide por su cuenta, con varios
 * efectos internos, cuándo resetear ese texto —dependen de la identidad de props como
 * getOptionLabel—, lo que da un comportamiento difícil de predecir cuando el padre se
 * re-renderiza mientras se escribe. Controlándolo nosotros, el texto solo cambia cuando
 * el usuario escribe o cuando el valor seleccionado cambia desde fuera.
 *
 * También corrige un bug real de <Autocomplete> "a secas": si tenías un valor
 * seleccionado y borrabas el texto a mano (sin usar la "X"), la selección se quedaba
 * pegada aunque el cuadro se viera vacío —el filtro real seguía aplicando la opción
 * vieja sin que se notara en pantalla—. Aquí, vaciar el texto también limpia la
 * selección, y al salir del campo con texto que no corresponde a ninguna opción el
 * texto vuelve a reflejar lo que de verdad está seleccionado.
 */
export default function CatalogoAutocomplete({
  label,
  placeholder,
  options,
  getLabel,
  filterFn,
  value,
  onChange,
  sx,
}) {
  const [inputValue, setInputValue] = useState(value ? getLabel(value) : '')

  useEffect(() => {
    setInputValue(value ? getLabel(value) : '')
  }, [value, getLabel])

  return (
    <Autocomplete
      autoHighlight
      options={options}
      value={value ?? null}
      onChange={(_, v) => onChange(v)}
      inputValue={inputValue}
      onInputChange={(_, v) => {
        setInputValue(v)
        if (v === '' && value != null) onChange(null)
      }}
      onClose={(_, reason) => {
        if (reason === 'blur' || reason === 'escape') {
          setInputValue(value ? getLabel(value) : '')
        }
      }}
      getOptionLabel={getLabel}
      filterOptions={filterFn}
      isOptionEqualToValue={(a, b) => a?.id === b?.id}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder} />
      )}
      noOptionsText="Sin resultados"
      sx={sx}
    />
  )
}
