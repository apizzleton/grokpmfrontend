import React, { useContext, useState } from 'react';
import { Box, TextField, MenuItem, Button, Grid, Typography } from '@mui/material';
import AppContext from '../context/AppContext'; // Import as default
import PropertyCard from '../components/PropertyCard';
import { useSnackbar } from 'notistack';

const RentalsProperties = () => {
  const { state, updateData } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    status: 'active',
  });

  const filteredProperties = state.properties
    .filter((property) => filter === 'all' || property.status === filter)
    .sort((a, b) =>
      sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

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
        Properties
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          select
          label="Filter by Status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ mr: 2, width: 200 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
        <Button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          Sort by Name ({sortOrder})
        </Button>
      </Box>
      <Grid container spacing={2}>
        {filteredProperties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property.id}>
            <PropertyCard property={property} />
          </Grid>
        ))}
      </Grid>
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

export default RentalsProperties;