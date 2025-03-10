import React, { useContext, useState } from 'react';
import { Box, TextField, MenuItem, Button, Grid, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AppContext from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import { useSnackbar } from 'notistack';

const RentalsProperties = () => {
  const { state, updateData } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [open, setOpen] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    status: 'active',
  });

  const handleClickOpen = (property = null) => {
    setEditProperty(property);
    setFormData(property || {
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      status: 'active',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditProperty(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateData(
        editProperty ? `properties/${editProperty.id}` : 'properties',
        formData,
        editProperty ? 'put' : 'post'
      );
      handleClose();
      enqueueSnackbar(editProperty ? 'Property updated successfully' : 'Property added successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to save property', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await updateData(`properties/${id}`, null, 'delete');
      enqueueSnackbar('Property deleted successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to delete property', { variant: 'error' });
    }
  };

  const filteredProperties = (state.properties || [])
    .filter((property) => 
      filter === 'all' || property.status === filter
    )
    .sort((a, b) =>
      sortOrder === 'asc'
        ? `${a.address}, ${a.city}, ${a.state}`.localeCompare(`${b.address}, ${b.city}, ${b.state}`)
        : `${b.address}, ${b.city}, ${b.state}`.localeCompare(`${a.address}, ${a.city}, ${a.state}`)
    );

  if (state.loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Properties</Typography>
        <Typography>Loading properties...</Typography>
      </Box>
    );
  }

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
          Sort by Address ({sortOrder})
        </Button>
      </Box>
      <Grid container spacing={2}>
        {filteredProperties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property.id}>
            <PropertyCard 
              property={property}
              onEdit={handleClickOpen}
              onDelete={handleDelete}
            />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New Property
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => handleClickOpen()}
          sx={{ mb: 2 }}
        >
          Add Property
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editProperty ? 'Edit Property' : 'Add Property'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Property Name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address"
                label="Street Address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="city"
                label="City"
                value={formData.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="state"
                label="State"
                value={formData.state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="zip"
                label="ZIP Code"
                value={formData.zip}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                name="status"
                label="Status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.name || !formData.address || !formData.city || !formData.state || !formData.zip}
          >
            {editProperty ? 'Save Changes' : 'Add Property'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RentalsProperties;