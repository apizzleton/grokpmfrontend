import React, { useContext } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import { AppContext } from '../context/AppContext';
import Pagination from '@mui/material/Pagination';

const RentalsProperties = () => {
  const { state, dispatch } = useContext(AppContext);
  const { properties, searchQuery } = state;
  const [open, setOpen] = React.useState(false);
  const [editProperty, setEditProperty] = React.useState(null);
  const [formData, setFormData] = React.useState({ address: '', city: '', state: '', zip: '', value: '', owner_id: '' });
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 5;

  const safeProperties = Array.isArray(properties) ? [...properties] : [];
  console.log('Properties in RentalsProperties:', safeProperties);

  const handleClickOpen = (property = null) => {
    setEditProperty(property);
    setFormData(property || { address: '', city: '', state: '', zip: '', value: '', owner_id: '' });
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
      const method = editProperty ? 'PUT' : 'POST';
      const url = `https://grokpm-backend.onrender.com/properties${editProperty ? `/${editProperty.id}` : ''}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to save property');
      const data = await response.json();
      dispatch({ type: 'SET_DATA', payload: { properties: editProperty ? safeProperties.map(p => p.id === data.id ? data : p) : [...safeProperties, data] } });
      handleClose();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const response = await fetch(`https://grokpm-backend.onrender.com/properties/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete property');
        dispatch({ type: 'SET_DATA', payload: { properties: safeProperties.filter(p => p.id !== id) } });
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const filteredProperties = safeProperties.filter(property =>
    (property.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     property.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     property.state?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedProperties = filteredProperties.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <h2>Properties</h2>
      <Grid container spacing={2}>
        {paginatedProperties.map((property, index) => (
          property && property.id ? (
            <Grid item xs={12} sm={6} md={4} key={property.id || `property-${index}`}>
              <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2, borderRadius: 4, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                <p>{property.address || 'No address'}, {property.city || 'No city'}, {property.state || 'No state'} {property.zip || 'No ZIP'}</p>
                <p>Value: ${property.value || 0} (Owner ID: {property.owner_id || 'N/A'})</p>
                <Box sx={{ mt: 1 }}>
                  <Button sx={{ mr: 1, backgroundColor: '#4a90e2', color: 'white', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen(property)}>Edit</Button>
                  <Button sx={{ backgroundColor: '#e74c3c', color: 'white', '&:hover': { backgroundColor: '#c0392b' } }} onClick={() => handleDelete(property.id)}>Delete</Button>
                </Box>
              </Box>
            </Grid>
          ) : null
        ))}
      </Grid>
      <Pagination count={Math.ceil(filteredProperties.length / itemsPerPage)} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
      <Button variant="contained" sx={{ mt: 2, backgroundColor: '#4a90e2', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen()}>
        Add Property
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editProperty ? 'Edit Property' : 'Add Property'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="address" label="Address" value={formData.address} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="city" label="City" value={formData.city} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="state" label="State" value={formData.state} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="zip" label="ZIP" value={formData.zip} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="value" label="Value" type="number" value={formData.value} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="owner_id" label="Owner ID" type="number" value={formData.owner_id} onChange={handleChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: '#757575' }}>Cancel</Button>
          <Button onClick={handleSave} sx={{ backgroundColor: '#4a90e2', color: 'white', '&:hover': { backgroundColor: '#357abd' } }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RentalsProperties;