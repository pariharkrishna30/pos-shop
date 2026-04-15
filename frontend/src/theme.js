import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6366f1',
    },
    background: {
      default: '#eef2ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
    },
  },
  typography: {
    fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(','),
    h1: {
      fontSize: '2.75rem',
      fontWeight: 800,
      letterSpacing: '-0.04em',
      lineHeight: 1.05,
    },
    h2: {
      fontSize: '2.1rem',
      fontWeight: 700,
      lineHeight: 1.1,
    },
    h3: {
      fontSize: '1.6rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.75,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 16,
  },
});

export default theme;
