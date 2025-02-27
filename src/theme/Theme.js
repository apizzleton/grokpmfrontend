import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4a90e2',
    },
    secondary: {
      main: '#757575',
    },
    error: {
      main: '#e74c3c',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      mb: 2,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.3s',
        },
      },
    },
  },
});

export const toggleDarkMode = () => {
  return createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#4a90e2',
      },
      secondary: {
        main: '#757575',
      },
      error: {
        main: '#e74c3c',
      },
      background: {
        default: '#303030',
      },
    },
    typography: {
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
        mb: 2,
        color: '#fff',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            transition: 'box-shadow 0.3s',
          },
        },
      },
    },
  });
};