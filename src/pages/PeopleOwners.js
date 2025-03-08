import React, { useContext, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem } from '@mui/material';
import AppContext from '../context/AppContext';
import Pagination from '@mui/material/Pagination';

const PeopleOwners = () => {
  const { state, dispatch } = useContext(AppContext);
  const { owners, properties, searchQuery } = state;
  const [open, setOpen] = useState(false);
  const [editOwner, setEditOwner] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', property_id: '' });
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const safeOwners = Array.isArray(owners) ? [...owners] : [];
  const safeProperties = Array.isArray(properties) ? [...properties].sort((a, b) => a.address.localeCompare(b.address)) : [];
  console.log('Owners in PeopleOwners:', safeOwners);
  console.log('Properties for dropdown:', safeProperties);

  const handleClickOpen = (owner = null) => {
    setEditOwner(owner);
    setFormData(owner || { name: '', email: '', phone: '', property_id: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditOwner(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const method = editOwner ? 'PUT' : 'POST';
      const url = `https://grokpm-backend.onrender.com/owners${editOwner ? `/${editOwner.id}` : ''}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to save owner');
      const data = await response.json();
      dispatch({ type: 'SET_DATA', payload: { owners: editOwner ? safeOwners.map(o => o.id === data.id ? data : o) : [...safeOwners, data] } });
      handleClose();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this owner?')) {
      try {
        const response = await fetch(`https://grokpm-backend.onrender.com/owners/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete owner');
        dispatch({ type: 'SET_DATA', payload: { owners: safeOwners.filter(o => o.id !== id) } });
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const filteredOwners = safeOwners.filter(owner =>
    (owner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     owner.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedOwners = filteredOwners.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <h2>Owners</h2>
      {safeOwners.length > 0 ? (
        <Grid container spacing={2}>
          {paginatedOwners.map((owner, index) => (
            owner && owner.id ? (
              <Grid item xs={12} sm={6} md={4} key={owner.id || `owner-${index}`}>
                <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2, borderRadius: 4, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                  <p>Name: {owner.name || 'N/A'} - Email: {owner.email || 'N/A'}</p>
                  <p>Phone: {owner.phone || 'N/A'} - Property: {safeProperties.find(p => p.id === owner.property_id)?.address || 'N/A'}</p>
                  <Box sx={{ mt: 1 }}>
                    <Button sx={{ mr: 1, backgroundColor: '#4a90e2', color: 'white', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen(owner)}>Edit</Button>
                    <Button sx={{ backgroundColor: '#e74c3c', color: 'white', '&:hover': { backgroundColor: '#c0392b' } }} onClick={() => handleDelete(owner.id)}>Delete</Button>
                  </Box>
                </Box>
              </Grid>
            ) : null
          ))}
        </Grid>
      ) : (
        <p>No owners available.</p>
      )}
      <Pagination count={Math.ceil(filteredOwners.length / itemsPerPage)} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
      <Button variant="contained" sx={{ mt: 2, backgroundColor: '#4a90e2', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen()}>
        Add Owner
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editOwner ? 'Edit Owner' : 'Add Owner'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="name" label="Name" value={formData.name} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="email" label="Email" value={formData.email} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="phone" label="Phone" value={formData.phone} onChange={handleChange} fullWidth />
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

export default PeopleOwners;