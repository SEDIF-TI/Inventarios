import { useState, useEffect } from 'react'
import {
  Box, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, Pagination, Typography,
} from '@mui/material'

export default function AppTable({ columns, rows, onRowClick, rowsPerPage = 15, resetKey }) {
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [resetKey])

  const pageCount = Math.ceil(rows.length / rowsPerPage)
  const visible   = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 1700 }}>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Table>
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
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Sin resultados
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
                    <TableCell key={col.key} sx={{ py: 1.5 }}>
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

      {/* Paginación fija al fondo de la ventana */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'center',
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
          onChange={(_, v) => setPage(v)}
          color="primary"
          shape="rounded"
        />
      </Box>
    </>
  )
}
