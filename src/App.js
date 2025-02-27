import React, { useEffect, useReducer } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import NavBar from './components/NavBar';
import RentalsProperties from './pages/RentalsProperties';
import RentalsUnits from './pages/RentalsUnits';
import PeopleTenants from './pages/PeopleTenants';
import PeopleOwners from './pages/PeopleOwners';
import PeopleBoardMembers from './pages/PeopleBoardMembers';
import Accounting from './pages/Accounting';
import Reports from './pages/Reports';
import AssociationsProperties from './pages/AssociationsProperties';
import AssociationsAssociations from './pages/AssociationsAssociations';
import TenantPage from './pages/TenantPage';
import { AppContext } from './context/AppContext';
import { theme } from './theme/Theme';

const initialState = {
  tenants: [],
  properties: [],
  units: [],
  payments: [],
  maintenance: [],
  associations: [],
  owners: [],
  boardMembers: [],
  searchQuery: '',
  filter: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_DATA':
      console.log('Setting data:', action.payload);
      return { ...state, ...action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { properties, units, tenants, payments, maintenance, associations, owners, boardMembers } = state;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Starting fetch...');
      const endpoints = ['tenants', 'properties', 'units', 'payments', 'maintenance', 'associations', 'owners', 'board-members'];
      const responses = await Promise.all(endpoints.map(endpoint => fetch(`https://grokpm-backend.onrender.com/${endpoint}`)));
      console.log('Responses received:', responses.map(res => ({ url: res.url, status: res.status })));
      const data = await Promise.all(responses.map(res => {
        if (!res.ok) throw new Error(`Fetch failed for ${res.url}: ${res.status}`);
        return res.json();
      }));
      console.log('Fetched data:', data);
      dispatch({ type: 'SET_DATA', payload: {
        tenants: data[0] || [],
        properties: data[1] || [],
        units: data[2] || [],
        payments: data[3] || [],
        maintenance: data[4] || [],
        associations: data[5] || [],
        owners: data[6] || [],
        boardMembers: data[7] || [],
      } });
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  if (!properties.length && !tenants.length && !units.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <Router>
            <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
              <NavBar />
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/rentals/properties" replace />} />
                    <Route path="/rentals/properties" element={<RentalsProperties />} />
                    <Route path="/rentals/units" element={<RentalsUnits />} />
                    <Route path="/people/tenants" element={<PeopleTenants />} />
                    <Route path="/people/owners" element={<PeopleOwners />} />
                    <Route path="/people/board-members" element={<PeopleBoardMembers />} />
                    <Route path="/accounting" element={<Accounting />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/associations/properties" element={<AssociationsProperties />} />
                    <Route path="/associations/associations" element={<AssociationsAssociations />} />
                    <Route path="/tenant/:id" element={<TenantPage />} />
                    <Route path="*" element={<Navigate to="/rentals/properties" />} />
                  </Routes>
                </Box>
              </Box>
            </Box>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </AppContext.Provider>
  );
}

export default App;