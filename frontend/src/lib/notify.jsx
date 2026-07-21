import { useState, useEffect } from 'react'
import { Alert, AlertTitle, Box, CircularProgress } from '@mui/material'

/**
 * Notificaciones basadas en MUI Alert, con una API imperativa tipo toast que se
 * puede llamar desde cualquier parte (incluso fuera de React, p. ej. axios).
 *
 * Uso:
 *   notify.success('Guardado')
 *   notify.error({ title: 'Error', description: 'No se pudo guardar' })
 *   notify.promise(peticion, { loading, success, error })
 *
 * Cada mensaje puede ser un string o un objeto { title, description }.
 */

let idSeq = 0
const subscribers = new Set()
let items = []

const DURACION      = 4000
const DURACION_ERR  = 5000

function emit() {
  const snapshot = [...items]
  subscribers.forEach((fn) => fn(snapshot))
}

function add(item) {
  const id = ++idSeq
  items = [...items, { id, ...item }]
  emit()
  return id
}

function update(id, patch) {
  items = items.map((it) => (it.id === id ? { ...it, ...patch } : it))
  emit()
}

function remove(id) {
  items = items.filter((it) => it.id !== id)
  emit()
}

function scheduleHide(id, ms) {
  if (ms) setTimeout(() => remove(id), ms)
}

function normalize(msg) {
  if (msg == null) return {}
  if (typeof msg === 'string') return { title: msg }
  return { title: msg.title, description: msg.description }
}

function show(severity, msg, { duration } = {}) {
  const ms = duration ?? (severity === 'error' ? DURACION_ERR : DURACION)
  const id = add({ severity, ...normalize(msg) })
  scheduleHide(id, ms)
  return id
}

export const notify = {
  success: (msg, opts) => show('success', msg, opts),
  error:   (msg, opts) => show('error',   msg, opts),
  info:    (msg, opts) => show('info',    msg, opts),
  warning: (msg, opts) => show('warning', msg, opts),

  /**
   * Muestra un aviso "cargando" mientras se resuelve la promesa y lo reemplaza
   * por el resultado (success/error). Cada estado acepta objeto o función(val).
   */
  promise(promise, { loading, success, error } = {}) {
    const id = add({ severity: 'info', loading: true, ...normalize(loading) })

    Promise.resolve(promise).then(
      (val) => {
        const res = typeof success === 'function' ? success(val) : success
        update(id, { severity: 'success', loading: false, ...normalize(res) })
        scheduleHide(id, DURACION)
      },
      (err) => {
        const res = typeof error === 'function' ? error(err) : error
        update(id, { severity: 'error', loading: false, ...normalize(res) })
        scheduleHide(id, DURACION_ERR)
      },
    )

    return promise
  },
}

/** Host que renderiza las alertas. Se monta una sola vez en la raíz de la app. */
export function Notifier() {
  const [list, setList] = useState([])

  useEffect(() => {
    subscribers.add(setList)
    return () => subscribers.delete(setList)
  }, [])

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1500,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        width: 'auto',
        maxWidth: 'min(90vw, 460px)',
        pointerEvents: 'none',
      }}
    >
      {list.map((it) => (
        <Alert
          key={it.id}
          severity={it.severity}
          variant="filled"
          icon={it.loading ? <CircularProgress size={18} color="inherit" /> : undefined}
          onClose={it.loading ? undefined : () => remove(it.id)}
          sx={{ boxShadow: 4, pointerEvents: 'auto', alignItems: 'center' }}
        >
          {it.title && (
            <AlertTitle sx={{ m: 0, fontWeight: 700 }}>{it.title}</AlertTitle>
          )}
          {it.description}
        </Alert>
      ))}
    </Box>
  )
}
