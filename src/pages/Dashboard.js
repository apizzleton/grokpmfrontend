import React, { useContext, useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, MenuItem } from '@mui/material'; // Added MenuItem
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import AppContext from '../context/AppContext'; // Import as default
import { useSnackbar } from 'notistack';

const Dashboard = () => {
  const { state, updateData } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    status: 'active',
  });

  const data = [
    { name: 'Properties', value: state.properties.length },
    { name: 'Transactions', value: state.transactions.length },
    { name: 'Accounts', value: state.accounts.length },
  ];

  const handleAddProperty = async () => {
    try {
      const response = await updateData('properties', newProperty);
      enqueueSnackbar('Property added successfully', { variant: 'success' });
      setNewProperty({ name: '', address: '', status: 'active' });
    } catch (error) {
      enqueueSnackbar('Failed to add property', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      <Grid container spacing={3}>
        {data.map((item) => (
          <Grid item xs={12} sm={4} key={item.name}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{item.name}</Typography>
              <Typography variant="h4">{item.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4 }}>
        <BarChart width={600} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#4a90e2" />
        </BarChart>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New Property
        </Typography>
        <TextField
          label="Name"
          value={newProperty.name}
          onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
          sx={{ mr: 2, mt: 2 }}
        />
        <TextField
          label="Address"
          value={newProperty.address}
          onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
          sx={{ mr: 2, mt: 2 }}
        />
        <TextField
          select
          label="Status"
          value={newProperty.status}
          onChange={(e) => setNewProperty({ ...newProperty, status: e.target.value })}
          sx={{ mr: 2, mt: 2, width: 200 }}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
        <Button onClick={handleAddProperty} variant="contained" sx={{ mt: 2 }}>
          Add Property
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;