import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import RentalsProperties from './pages/RentalsProperties';
import Units from './pages/Units';
import Accounting from './pages/Accounting';
import NavBar from './components/NavBar'; // Ensure NavBar is imported

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <NavBar /> {/* Navigation bar remains on all pages */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
            <Routes>
              <Route path="/overview" element={<Dashboard />} /> {/* Dashboard for /overview */}
              <Route path="/rentals/properties" element={<RentalsProperties />} /> {/* Rentals Properties page */}
              <Route path="/rentals/units" element={<Units />} /> {/* Units page */}
              <Route path="/accounting" element={<Accounting />} /> {/* Accounting page */}
              <Route path="/people/tenants" element={<Units />} /> {/* Placeholder for People Tenants (using Units as a temp placeholder) */}
              <Route path="/people/owners" element={<Units />} /> {/* Placeholder for People Owners */}
              <Route path="/people/board-members" element={<Units />} /> {/* Placeholder for People Board Members */}
              <Route path="/reports" element={<Units />} /> {/* Placeholder for Reports */}
              <Route path="/associations/properties" element={<Units />} /> {/* Placeholder for Associations Properties */}
              <Route path="/associations/associations" element={<Units />} /> {/* Placeholder for Associations Associations */}
              <Route path="*" element={<Navigate to="/overview" replace />} /> {/* Default to Overview for unmatched routes */}
            </Routes>
          </Box>
        </Box>
      </Box>
    </Router>
  );
}

export default App;