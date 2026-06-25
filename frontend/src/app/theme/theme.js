import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main:         '#db2777',
      dark:         '#be185d',
      light:        '#fc90b4',
      contrastText: '#ffffff',
    },
    secondary: {
      main:         '#0f172a',
      contrastText: '#ffffff',
    },
    success: {
      main:  '#16a34a',
      light: '#86efac',
      dark:  '#15803d',
    },
    error: {
      main:  '#dc2626',
      light: '#fca5a5',
      dark:  '#b91c1c',
    },
    warning: {
      main:  '#d97706',
      light: '#fcd34d',
      dark:  '#b45309',
    },
    info: {
      main:  '#0369a1',
      light: '#7dd3fc',
      dark:  '#075985',
    },
    text: {
      primary:   '#0f172a',
      secondary: '#64748b',
    },
    background: {
      default: '#f8fafc',
      paper:   '#ffffff',
    },
    divider: '#e2e8f0',
  },

  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: 16,
    h1: { fontSize: '2.5rem',  fontWeight: 700, lineHeight: 1.2  },
    h2: { fontSize: '2rem',    fontWeight: 700, lineHeight: 1.25 },
    h3: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.25 },
    h4: { fontSize: '1.5rem',  fontWeight: 700, lineHeight: 1.3  },
    h5: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3  },
    h6: { fontSize: '1.125rem',fontWeight: 700, lineHeight: 1.4  },
    subtitle1: { fontWeight: 600, lineHeight: 1.5 },
    subtitle2: { fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: '1rem',      fontWeight: 400, lineHeight: 1.6 },
    body2: { fontSize: '0.875rem',  fontWeight: 400, lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.4 },
    button: { fontWeight: 600, textTransform: 'none' },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'box-shadow 150ms ease',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 18 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 8 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          '&:focus-visible': {
            outline: '2px solid #db2777',
            outlineOffset: '2px',
          },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.01ms !important',
            transitionDuration: '0.01ms !important',
          },
        },
      },
    },
  },
})

theme.brand = {
  rosaLogo:       '#fc90b4',
  rosaOnda:       '#fc6c9c',
  gradiente:      'linear-gradient(135deg, #fc90b4 0%, #fc6c9c 45%, #db2777 100%)',
  gradienteSuave: 'linear-gradient(135deg, #fde7ef 0%, #fbcfe0 100%)',
}

export default theme
