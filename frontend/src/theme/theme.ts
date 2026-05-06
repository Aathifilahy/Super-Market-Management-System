import { createTheme, alpha } from '@mui/material/styles';

const primaryGreen = '#2e7d32'; // Deep green
const secondaryGreen = '#1b5e20';
const neutralGrayBackground = '#f5f7fa';
const neutralGraySurface = '#ffffff';

export const theme = createTheme({
  palette: {
    primary: {
      main: primaryGreen,
      dark: secondaryGreen,
      light: '#60ad5e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#424242',
      dark: '#1b1b1b',
      light: '#6d6d6d',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      dark: '#388e3c',
      light: '#81c784',
    },
    warning: {
      main: '#ff9800',
      dark: '#f57c00',
      light: '#ffb74d',
    },
    error: {
      main: '#f44336',
      dark: '#d32f2f',
      light: '#e57373',
    },
    background: {
      default: neutralGrayBackground,
      paper: neutralGraySurface,
    },
    text: {
      primary: '#1f2937', // Gray 800
      secondary: '#4b5563', // Gray 600
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(145deg, ${primaryGreen} 0%, ${secondaryGreen} 100%)`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          border: '1px solid #f3f4f6',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'box-shadow 0.2s',
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(primaryGreen, 0.2)}`,
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f3f4f6',
          padding: '16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f9fafb',
          color: '#4b5563',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f9fafb',
          },
        },
      },
    },
  },
});
