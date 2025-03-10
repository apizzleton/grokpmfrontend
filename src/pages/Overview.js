import React, { useContext } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AppContext from '../context/AppContext';

const Overview = () => {
  const { state } = useContext(AppContext);
  const { properties, units, tenants, owners } = state;

  const safeProperties = Array.isArray(properties) ? properties : [];
  const safeUnits = Array.isArray(units) ? units : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeOwners = Array.isArray(owners) ? owners : [];

  const activeProperties = safeProperties.filter(p => p.status === 'active').length;
  const inactiveProperties = safeProperties.length - activeProperties;

  const overviewData = [
    { name: 'Properties', value: safeProperties.length },
    { name: 'Units', value: safeUnits.length },
    { name: 'Tenants', value: safeTenants.length },
    { name: 'Owners', value: safeOwners.length }
  ];

  const propertyStatusData = [
    { name: 'Active', value: activeProperties },
    { name: 'Inactive', value: inactiveProperties }
  ];

  const COLORS = ['#4a90e2', '#82ca9d', '#8884d8', '#ffc658'];
  const STATUS_COLORS = ['#4CAF50', '#f44336'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Overview Dashboard</Typography>
      
      <Grid container spacing={3}>
        {overviewData.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={item.name}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{item.name}</Typography>
              <Typography variant="h4" color="primary">{item.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Property Overview</Typography>
            <ResponsiveContainer>
              <BarChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4a90e2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Property Status</Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={propertyStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {propertyStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;