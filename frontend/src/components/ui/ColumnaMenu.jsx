import { useState, useEffect } from 'react'
import {
  IconButton, Popover, Box, MenuList, MenuItem, ListItemIcon, ListItemText,
  Divider, TextField, Button, Typography,
} from '@mui/material'
import FilterListIcon    from '@mui/icons-material/FilterList'
import ArrowUpwardIcon   from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ClearIcon         from '@mui/icons-material/Clear'

/**
 * Menú de columna estilo Excel: ordenar y filtrar esa columna desde su encabezado.
 *
 * La columna declara qué ofrece:
 *   sortKey        -> habilita ordenar (propiedad de la ENTIDAD del backend)
 *   filterKey      -> habilita filtrar (nombre del query param del backend)
 *   filterTipo     -> 'texto' (por defecto) u 'opciones'
 *   filterOpciones -> [{ value, label }] cuando filterTipo es 'opciones'
 *
 * El filtro de texto se aplica con el botón o con Enter, no en cada tecla: cada cambio
 * dispara una petición al servidor y filtrar letra por letra la inundaría.
 */
export default function ColumnaMenu({
  col,
  orden,
  onFijarOrden,
  valorFiltro = '',
  onFiltroChange,
}) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [borrador, setBorrador] = useState(valorFiltro)

  // Si el filtro se limpia desde fuera (botón "Limpiar"), el borrador tiene que seguirlo.
  useEffect(() => { setBorrador(valorFiltro) }, [valorFiltro, anchorEl])

  const abierto     = Boolean(anchorEl)
  const puedeOrdenar = Boolean(col.sortKey && onFijarOrden)
  const puedeFiltrar = Boolean(col.filterKey && onFiltroChange)
  const tipo         = col.filterTipo ?? 'texto'

  const ordenActivo  = Boolean(col.sortKey) && orden?.campo === col.sortKey
  const filtroActivo = Boolean(valorFiltro)

  const cerrar = () => setAnchorEl(null)

  // Se fija la dirección pedida. Elegir la que ya está activa quita el orden, para poder
  // volver al que trae el backend por defecto.
  const ordenar = (dir) => {
    onFijarOrden(col.sortKey, ordenActivo && orden.dir === dir ? null : dir)
    cerrar()
  }

  const aplicar = () => { onFiltroChange(col.filterKey, borrador.trim()); cerrar() }
  const quitar  = () => { onFiltroChange(col.filterKey, ''); setBorrador(''); cerrar() }

  if (!puedeOrdenar && !puedeFiltrar) return null

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget) }}
        sx={{
          ml: 0.25,
          p: 0.25,
          color: filtroActivo || ordenActivo ? 'primary.main' : 'text.disabled',
          '&:hover': { color: 'primary.main' },
        }}
      >
        <FilterListIcon sx={{ fontSize: 16 }} />
      </IconButton>

      <Popover
        open={abierto}
        anchorEl={anchorEl}
        onClose={cerrar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 0.5, minWidth: 210, borderRadius: 2 } } }}
      >
        {puedeOrdenar && (
          <MenuList dense sx={{ py: 0.5 }}>
            <MenuItem selected={ordenActivo && orden.dir === 'asc'} onClick={() => ordenar('asc')}>
              <ListItemIcon><ArrowUpwardIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Ordenar A → Z</ListItemText>
            </MenuItem>
            <MenuItem selected={ordenActivo && orden.dir === 'desc'} onClick={() => ordenar('desc')}>
              <ListItemIcon><ArrowDownwardIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Ordenar Z → A</ListItemText>
            </MenuItem>
          </MenuList>
        )}

        {puedeOrdenar && puedeFiltrar && <Divider />}

        {puedeFiltrar && tipo === 'opciones' && (
          <MenuList dense sx={{ py: 0.5 }}>
            <MenuItem
              selected={!valorFiltro}
              onClick={() => { onFiltroChange(col.filterKey, ''); cerrar() }}
            >
              <ListItemText>Todos</ListItemText>
            </MenuItem>
            {(col.filterOpciones ?? []).map((op) => (
              <MenuItem
                key={op.value}
                selected={String(valorFiltro) === String(op.value)}
                onClick={() => { onFiltroChange(col.filterKey, op.value); cerrar() }}
              >
                <ListItemText>{op.label}</ListItemText>
              </MenuItem>
            ))}
          </MenuList>
        )}

        {puedeFiltrar && tipo === 'texto' && (
          <Box sx={{ p: 1.5, pt: puedeOrdenar ? 1.5 : 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
              Filtrar por {col.label.toLowerCase()}
            </Typography>
            <TextField
              autoFocus
              size="small"
              fullWidth
              placeholder="Contiene..."
              value={borrador}
              onChange={(e) => setBorrador(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') aplicar()
                e.stopPropagation()   // si no, MenuList se roba las teclas para navegar
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
              <Button size="small" variant="contained" fullWidth onClick={aplicar}>
                Aplicar
              </Button>
              {filtroActivo && (
                <Button size="small" variant="text" onClick={quitar} startIcon={<ClearIcon />}>
                  Quitar
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Popover>
    </>
  )
}
