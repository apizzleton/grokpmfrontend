import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Overview from './pages/Overview';
import RentalsProperties from './pages/RentalsProperties';
import RentalsUnits from './pages/RentalsUnits';
import Accounting from './pages/Accounting';
import PeopleTenants from './pages/PeopleTenants';
import PeopleOwners from './pages/PeopleOwners';
import PeopleBoardMembers from './pages/PeopleBoardMembers';
import Reports from './pages/Reports';
import RentRollReport from './pages/reports/RentRollReport';
import AssociationsProperties from './pages/AssociationsProperties';
import AssociationsAssociations from './pages/AssociationsAssociations';
import PropertyView from './pages/PropertyView';
import UnitDetail from './pages/UnitDetail';
import Leases from './pages/Leases';
import NavBar from './components/NavBar';

// Custom scrollbar styling
const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        *::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 20px;
        }
        *::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.2);
        }
      `,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <NavBar />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
              <Routes>
                <Route path="/overview" element={<Overview />} />
                <Route path="/rentals/properties" element={<RentalsProperties />} />
                <Route path="/rentals/properties/:id" element={<PropertyView />} />
                <Route path="/rentals/units" element={<RentalsUnits />} />
                <Route path="/rentals/units/:id" element={<UnitDetail />} />
                <Route path="/accounting" element={<Accounting />} />
                <Route path="/people/tenants" element={<PeopleTenants />} />
                <Route path="/people/owners" element={<PeopleOwners />} />
                <Route path="/people/board-members" element={<PeopleBoardMembers />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/rent-roll" element={<RentRollReport />} />
                <Route path="/associations/properties" element={<AssociationsProperties />} />
                <Route path="/associations/associations" element={<AssociationsAssociations />} />
                <Route path="/leases" element={<Leases />} />
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="*" element={<Navigate to="/overview" replace />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;