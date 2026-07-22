import { useState, useEffect } from 'react'
import {
  Box, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, Pagination, Typography, TableSortLabel,
} from '@mui/material'
import ColumnaMenu from './ColumnaMenu'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SKELETON_ROWS = 8

/**
 * Soporta dos modos:
 *
 * - Controlada (server-side): se le pasan `page`, `pageCount` y `onPageChange`. `rows` es
 *   ya la página que devolvió el backend y la tabla no recorta nada.
 * - No controlada: recibe todas las filas y las trocea en cliente. Se mantiene para tablas
 *   pequeñas que no justifican ir al servidor por cada página.
 *
 * `page` es 1-indexado, como espera el componente Pagination de MUI. La conversión al
 * índice 0 del backend la hace cada página.
 */
export default function AppTable({
  columns,
  rows,
  onRowClick,
  rowsPerPage = 15,
  resetKey,
  isLoading = false,
  page: pageControlada,
  pageCount: pageCountControlado,
  onPageChange,
  totalElements,
  orden,
  onOrdenChange,
  onFijarOrden,
  filtrosColumna = {},
  onFiltroColumna,
  mensajeVacio = 'Sin resultados',
}) {
  // Una columna es ordenable si declara `sortKey` y la página pasó el manejador.
  const ordenable = (col) => Boolean(col.sortKey && onOrdenChange)

  // Ojo: hay que exigir col.sortKey. Sin eso, una columna sin ordenar (acciones, checkbox)
  // compara undefined === undefined => true y se intenta leer orden.dir con orden en null.
  const ordenActivo = (col) => Boolean(col.sortKey) && orden?.campo === col.sortKey
  const esControlada = typeof onPageChange === 'function'
  const [pageInterna, setPageInterna] = useState(1)

  useEffect(() => { if (!esControlada) setPageInterna(1) }, [resetKey, esControlada])

  const page      = esControlada ? pageControlada : pageInterna
  const pageCount = esControlada ? pageCountControlado : Math.ceil(rows.length / rowsPerPage)
  const visible   = esControlada ? rows : rows.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const cambiarPagina = esControlada ? onPageChange : setPageInterna
  const total = esControlada ? totalElements : rows.length

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 1800 }}>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  width={col.width}
                  sx={{
                    bgcolor: 'background.default',
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    py: 1.5,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                  sortDirection={ordenActivo(col) ? orden.dir : false}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {ordenable(col) ? (
                      <TableSortLabel
                        active={ordenActivo(col)}
                        direction={ordenActivo(col) ? orden.dir : 'asc'}
                        onClick={() => onOrdenChange(col.sortKey)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}

                    <ColumnaMenu
                      col={col}
                      orden={orden}
                      onFijarOrden={onFijarOrden}
                      valorFiltro={filtrosColumna[col.filterKey] ?? ''}
                      onFiltroChange={onFiltroColumna}
                    />
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={col.key} sx={{ py: 1.5 }}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {mensajeVacio}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row, i) => (
                <TableRow
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background 120ms',
                    '&:hover': {
                      bgcolor: onRowClick ? 'rgba(219,39,119,0.04)' : 'transparent',
                    },
                    '&:last-child td': { border: 0 },
                  }}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      sx={{
                        py: 1.5,
                        overflow: 'hidden',
                        ...(col.render ? {} : {
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 0,
                        }),
                      }}
                    >
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </Box>
      </Box>

      {/* Paginación fija, apoyada justo encima del footer */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '60px',
          left: 0,
          right: 0,
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 1.5,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
          visibility: pageCount <= 1 ? 'hidden' : 'visible',
        }}
      >
        <Pagination
          count={pageCount}
          page={page}
          onChange={(_, v) => cambiarPagina(v)}
          color="primary"
          shape="rounded"
        />
        {total != null && (
          <Typography variant="body2" color="text.secondary">
            {total} {total === 1 ? 'resultado' : 'resultados'}
          </Typography>
        )}
      </Box>
    </>
  )
}
