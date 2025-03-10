import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import Leases from '../components/Leases';

function PropertyDetail() {
  const [tabValue, setTabValue] = useState(0);
  const { id: propertyId } = useParams();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label='Info' />
        <Tab label='Leases' />
        <Tab label='Transactions' />
        <Tab label='Maintenance' />
        <Tab label='Reports' />
      </Tabs>
      {tabValue === 0 && <Typography>Property Information</Typography>}
      {tabValue === 1 && <Leases propertyId={propertyId} />}
      {tabValue === 2 && <Typography>Transactions History</Typography>}
      {tabValue === 3 && <Typography>Maintenance Records</Typography>}
      {tabValue === 4 && <Typography>Financial Reports</Typography>}
    </Box>
  );
}

export default PropertyDetail;
