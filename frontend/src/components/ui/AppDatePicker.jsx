import { useState } from 'react'
import {
  Box, Typography, IconButton, Popover, Paper,
  TextField, InputAdornment,
} from '@mui/material'
import ChevronLeftIcon   from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon  from '@mui/icons-material/ChevronRight'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CloseIcon         from '@mui/icons-material/Close'

const DIAS  = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

function parseDate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

function toValue(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatDisplay(str) {
  if (!str) return ''
  const p = parseDate(str)
  return `${String(p.day).padStart(2, '0')} ${MESES[p.month].slice(0, 3)} ${p.year}`
}

export default function AppDatePicker({ label, value, onChange, sx }) {
  const [anchor, setAnchor] = useState(null)
  const open   = Boolean(anchor)
  const parsed = parseDate(value)
  const today  = new Date()

  const [view, setView] = useState({
    year:  today.getFullYear(),
    month: today.getMonth(),
  })

  const handleOpen = (e) => {
    setView(parsed
      ? { year: parsed.year, month: parsed.month }
      : { year: today.getFullYear(), month: today.getMonth() }
    )
    setAnchor(e.currentTarget)
  }

  const prevMonth = () => setView(v => {
    const m = v.month - 1
    return m < 0 ? { year: v.year - 1, month: 11 } : { ...v, month: m }
  })

  const nextMonth = () => setView(v => {
    const m = v.month + 1
    return m > 11 ? { year: v.year + 1, month: 0 } : { ...v, month: m }
  })

  const selectDay = (day) => {
    onChange(toValue(view.year, view.month, day))
    setAnchor(null)
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange('')
  }

  const firstDay    = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const isSelected = (day) =>
    day && parsed &&
    parsed.year === view.year &&
    parsed.month === view.month &&
    parsed.day === day

  const isToday = (day) =>
    day &&
    today.getFullYear() === view.year &&
    today.getMonth() === view.month &&
    today.getDate() === day

  return (
    <>
      <TextField
        label={label}
        value={formatDisplay(value)}
        onClick={handleOpen}
        slotProps={{
          inputLabel: { shrink: Boolean(value) || open },
          input: {
            readOnly: true,
            sx: { cursor: 'pointer' },
            endAdornment: (
              <InputAdornment position="end">
                {value
                  ? <IconButton size="small" onClick={clear} edge="end"><CloseIcon fontSize="small" /></IconButton>
                  : <CalendarMonthIcon fontSize="small" sx={{ color: 'text.secondary', pointerEvents: 'none' }} />
                }
              </InputAdornment>
            ),
          },
        }}
        sx={sx}
      />

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ sx: { borderRadius: 3, mt: 0.5, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}
      >
        <Paper elevation={0} sx={{ p: 2, width: 280 }}>

          {/* Navegación mes */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <IconButton size="small" onClick={prevMonth}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography fontWeight={700} fontSize="0.9rem">
              {MESES[view.month]} {view.year}
            </Typography>
            <IconButton size="small" onClick={nextMonth}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Encabezado días */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
            {DIAS.map(d => (
              <Box key={d} sx={{ textAlign: 'center', py: 0.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} fontSize="0.7rem">
                  {d}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Días */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, i) => (
              <Box
                key={i}
                onClick={() => day && selectDay(day)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  aspectRatio: '1',
                  borderRadius: '50%',
                  cursor: day ? 'pointer' : 'default',
                  bgcolor: isSelected(day) ? '#db2777' : 'transparent',
                  color: isSelected(day)
                    ? '#fff'
                    : isToday(day)
                    ? '#db2777'
                    : day
                    ? 'text.primary'
                    : 'transparent',
                  fontWeight: isSelected(day) || isToday(day) ? 700 : 400,
                  fontSize: '0.8rem',
                  outline: isToday(day) && !isSelected(day) ? '1.5px solid #db2777' : 'none',
                  outlineOffset: '-1.5px',
                  transition: 'background 120ms, color 120ms',
                  userSelect: 'none',
                  '&:hover': day && !isSelected(day) ? {
                    bgcolor: 'rgba(219,39,119,0.1)',
                    color: '#db2777',
                  } : {},
                }}
              >
                {day ?? ''}
              </Box>
            ))}
          </Box>

        </Paper>
      </Popover>
    </>
  )
}
