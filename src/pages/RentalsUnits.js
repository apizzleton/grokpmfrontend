import React, { useContext, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem } from '@mui/material';
import { AppContext } from '../context/AppContext';
import Pagination from '@mui/material/Pagination';

const RentalsUnits = () => {
  const { state, dispatch } = useContext(AppContext);
  const { units, properties, searchQuery } = state;
  const [open, setOpen] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
  const [formData, setFormData] = useState({ unit_number: '', rent_amount: '', status: '', property_id: '' });
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const safeUnits = Array.isArray(units) ? [...units] : [];
  const safeProperties = Array.isArray(properties) ? [...properties].sort((a, b) => a.address.localeCompare(b.address)) : [];
  console.log('Units in RentalsUnits:', safeUnits);
  console.log('Properties for dropdown:', safeProperties);

  const handleClickOpen = (unit = null) => {
    setEditUnit(unit);
    setFormData(unit || { unit_number: '', rent_amount: '', status: '', property_id: '' });
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
      const method = editUnit ? 'PUT' : 'POST';
      const url = `https://grokpm-backend.onrender.com/units${editUnit ? `/${editUnit.id}` : ''}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to save unit');
      const data = await response.json();
      dispatch({ type: 'SET_DATA', payload: { units: editUnit ? safeUnits.map(u => u.id === data.id ? data : u) : [...safeUnits, data] } });
      handleClose();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        const response = await fetch(`https://grokpm-backend.onrender.com/units/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete unit');
        dispatch({ type: 'SET_DATA', payload: { units: safeUnits.filter(u => u.id !== id) } });
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const filteredUnits = safeUnits.filter(unit =>
    (unit.unit_number?.toString().includes(searchQuery) ||
     unit.status?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedUnits = filteredUnits.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <h2>Units</h2>
      {safeUnits.length > 0 ? (
        <Grid container spacing={2}>
          {paginatedUnits.map((unit, index) => (
            unit && unit.id ? (
              <Grid item xs={12} sm={6} md={4} key={unit.id || `unit-${index}`}>
                <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2, borderRadius: 4, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                  <p>Unit #{unit.unit_number || 'N/A'} - Rent: ${unit.rent_amount || 0}</p>
                  <p>Status: {unit.status || 'N/A'} - Property: {safeProperties.find(p => p.id === unit.property_id)?.address || 'N/A'}</p>
                  <Box sx={{ mt: 1 }}>
                    <Button sx={{ mr: 1, backgroundColor: '#4a90e2', color: 'white', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen(unit)}>Edit</Button>
                    <Button sx={{ backgroundColor: '#e74c3c', color: 'white', '&:hover': { backgroundColor: '#c0392b' } }} onClick={() => handleDelete(unit.id)}>Delete</Button>
                  </Box>
                </Box>
              </Grid>
            ) : null
          ))}
        </Grid>
      ) : (
        <p>No units available.</p>
      )}
      <Pagination count={Math.ceil(filteredUnits.length / itemsPerPage)} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
      <Button variant="contained" sx={{ mt: 2, backgroundColor: '#4a90e2', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen()}>
        Add Unit
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editUnit ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="unit_number" label="Unit Number" value={formData.unit_number} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="rent_amount" label="Rent Amount" type="number" value={formData.rent_amount} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="status" label="Status" value={formData.status} onChange={handleChange} fullWidth />
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
              <MenuItem key={prop.id} value={prop.id}>{prop.address}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: '#757575' }}>Cancel</Button>
          <Button onClick={handleSave} sx={{ backgroundColor: '#4a90e2', color: 'white', '&:hover': { backgroundColor: '#357abd' } }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RentalsUnits;