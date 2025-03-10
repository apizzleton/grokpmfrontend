import React, { useContext } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import AppContext from '../context/AppContext';

const Dashboard = () => {
  const { state } = useContext(AppContext);

  // Calculate statistics
  const totalProperties = state.properties?.length || 0;
  const totalUnits = state.units?.length || 0;
  const totalTenants = state.tenants?.length || 0;
  const totalOwners = state.owners?.length || 0;

  const data = [
    { name: 'Properties', value: totalProperties },
    { name: 'Units', value: totalUnits },
    { name: 'Tenants', value: totalTenants },
    { name: 'Owners', value: totalOwners }
  ];

  // Calculate property statistics
  const activeProperties = state.properties?.filter(p => p.status === 'active').length || 0;
  const inactiveProperties = totalProperties - activeProperties;

  const propertyStatusData = [
    { name: 'Active', value: activeProperties },
    { name: 'Inactive', value: inactiveProperties }
  ];

  if (state.loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Dashboard Overview</Typography>
        <Typography>Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h6" color="primary">Properties</Typography>
            <Typography variant="h4">{totalProperties}</Typography>
            <Typography variant="body2" color="text.secondary">
              {activeProperties} active, {inactiveProperties} inactive
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
            <Typography variant="h6" color="secondary">Units</Typography>
            <Typography variant="h4">{totalUnits}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h6" sx={{ color: '#2e7d32' }}>Tenants</Typography>
            <Typography variant="h4">{totalTenants}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h6" sx={{ color: '#ed6c02' }}>Owners</Typography>
            <Typography variant="h4">{totalOwners}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Property Overview</Typography>
            <BarChart width={600} height={300} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4a90e2" />
            </BarChart>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Property Status</Typography>
            <BarChart width={300} height={300} data={propertyStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;