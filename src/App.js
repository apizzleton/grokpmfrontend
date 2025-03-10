import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Overview from './pages/Overview';
import RentalsProperties from './pages/RentalsProperties';
import RentalsUnits from './pages/RentalsUnits';
import Accounting from './pages/Accounting';
import PeopleTenants from './pages/PeopleTenants';
import PeopleOwners from './pages/PeopleOwners';
import PeopleBoardMembers from './pages/PeopleBoardMembers';
import Reports from './pages/Reports';
import AssociationsProperties from './pages/AssociationsProperties';
import AssociationsAssociations from './pages/AssociationsAssociations';
import NavBar from './components/NavBar';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <NavBar />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
            <Routes>
              <Route path="/overview" element={<Overview />} />
              <Route path="/rentals/properties" element={<RentalsProperties />} />
              <Route path="/rentals/units" element={<RentalsUnits />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/people/tenants" element={<PeopleTenants />} />
              <Route path="/people/owners" element={<PeopleOwners />} />
              <Route path="/people/board-members" element={<PeopleBoardMembers />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/associations/properties" element={<AssociationsProperties />} />
              <Route path="/associations/associations" element={<AssociationsAssociations />} />
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Router>
  );
}

export default App;