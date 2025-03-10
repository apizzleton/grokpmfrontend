import React, { useContext, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Typography, MenuItem } from '@mui/material';
import AppContext from '../context/AppContext';
import UnitCard from '../components/UnitCard';
import { useSnackbar } from 'notistack';

const RentalsUnits = () => {
  const { state, updateData } = useContext(AppContext);
  const { units, properties, searchQuery } = state;
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
  const [formData, setFormData] = useState({ unit_number: '', rent_amount: '', status: '', property_id: '' });
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');

  const safeUnits = Array.isArray(units) ? [...units] : [];
  const safeProperties = Array.isArray(properties) ? [...properties].sort((a, b) => 
    `${a.address}, ${a.city}, ${a.state}`.localeCompare(`${b.address}, ${b.city}, ${b.state}`)
  ) : [];

  const handleClickOpen = (unit = null) => {
    setEditUnit(unit);
    setFormData(unit || { unit_number: '', rent_amount: '', status: '', property_id: safeProperties[0]?.id || '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditUnit(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await updateData(
        editUnit ? `units/${editUnit.id}` : 'units',
        formData,
        editUnit ? 'put' : 'post'
      );
      handleClose();
      enqueueSnackbar(editUnit ? 'Unit updated successfully' : 'Unit added successfully', { variant: 'success' });
    } catch (err) {
      console.error('Save error:', err);
      enqueueSnackbar('Failed to save unit', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await updateData(`units/${id}`, null, 'delete');
      enqueueSnackbar('Unit deleted successfully', { variant: 'success' });
    } catch (err) {
      console.error('Delete error:', err);
      enqueueSnackbar('Failed to delete unit', { variant: 'error' });
    }
  };

  const getPropertyFullAddress = (propertyId) => {
    const property = safeProperties.find(p => p.id === propertyId);
    return property ? `${property.address}, ${property.city}, ${property.state} ${property.zip}` : 'N/A';
  };

  const filteredUnits = safeUnits
    .filter(unit => 
      (searchQuery === '' || 
       unit.unit_number?.toString().includes(searchQuery) ||
       unit.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       getPropertyFullAddress(unit.property_id).toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filter === 'all' || unit.status === filter)
    )
    .sort((a, b) => {
      const aNum = parseInt(a.unit_number) || 0;
      const bNum = parseInt(b.unit_number) || 0;
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    });

  if (state.loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Units</Typography>
        <Typography>Loading units...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Units
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
          <MenuItem value="occupied">Occupied</MenuItem>
          <MenuItem value="vacant">Vacant</MenuItem>
        </TextField>
        <Button 
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          sx={{ mr: 2 }}
        >
          Sort by Unit Number ({sortOrder})
        </Button>
      </Box>

      {safeUnits.length > 0 ? (
        <Grid container spacing={2}>
          {filteredUnits.map((unit) => (
            unit && unit.id ? (
              <Grid item xs={12} sm={6} md={4} key={unit.id}>
                <UnitCard
                  unit={unit}
                  onEdit={handleClickOpen}
                  onDelete={handleDelete}
                  propertyAddress={getPropertyFullAddress(unit.property_id)}
                />
              </Grid>
            ) : null
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" sx={{ my: 2 }}>No units available.</Typography>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New Unit
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => handleClickOpen()}
          sx={{ mb: 2 }}
        >
          Add Unit
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editUnit ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="unit_number"
            label="Unit Number"
            value={formData.unit_number}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="rent_amount"
            label="Rent Amount"
            type="number"
            value={formData.rent_amount}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            name="status"
            label="Status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="occupied">Occupied</MenuItem>
            <MenuItem value="vacant">Vacant</MenuItem>
          </TextField>
          <TextField
            select
            margin="dense"
            name="property_id"
            label="Property"
            value={formData.property_id}
            onChange={handleChange}
            fullWidth
          >
            {safeProperties.map((prop) => (
              <MenuItem key={prop.id} value={prop.id}>
                {`${prop.address}, ${prop.city}, ${prop.state} ${prop.zip}`}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RentalsUnits;