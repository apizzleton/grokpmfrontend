import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import Leases from '../components/Leases';

function UnitDetail() {
  const [tabValue, setTabValue] = useState(0);
  const { id: unitId } = useParams();

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
      {tabValue === 0 && <Typography>Unit Information</Typography>}
      {tabValue === 1 && <Leases unitId={unitId} />}
      {tabValue === 2 && <Typography>Unit Transactions</Typography>}
      {tabValue === 3 && <Typography>Unit Maintenance</Typography>}
      {tabValue === 4 && <Typography>Unit Reports</Typography>}
    </Box>
  );
}

export default UnitDetail;
