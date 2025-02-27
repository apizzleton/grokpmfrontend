import React, { useContext, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem } from '@mui/material';
import { AppContext } from '../context/AppContext';
import Pagination from '@mui/material/Pagination';

const AssociationsAssociations = () => {
  const { state, dispatch } = useContext(AppContext);
  const { associations, properties, searchQuery } = state;
  const [open, setOpen] = useState(false);
  const [editAssociation, setEditAssociation] = useState(null);
  const [formData, setFormData] = useState({ name: '', contact_info: '', fee: '', due_date: '', property_id: '' });
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const safeAssociations = Array.isArray(associations) ? [...associations] : [];
  const safeProperties = Array.isArray(properties) ? [...properties].sort((a, b) => a.address.localeCompare(b.address)) : [];
  console.log('Associations in AssociationsAssociations:', safeAssociations);
  console.log('Properties for dropdown:', safeProperties);

  const handleClickOpen = (association = null) => {
    setEditAssociation(association);
    setFormData(association || { name: '', contact_info: '', fee: '', due_date: '', property_id: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditAssociation(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const method = editAssociation ? 'PUT' : 'POST';
      const url = `https://grokpm-backend.onrender.com/associations${editAssociation ? `/${editAssociation.id}` : ''}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to save association');
      const data = await response.json();
      dispatch({ type: 'SET_DATA', payload: { associations: editAssociation ? safeAssociations.map(a => a.id === data.id ? data : a) : [...safeAssociations, data] } });
      handleClose();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this association?')) {
      try {
        const response = await fetch(`https://grokpm-backend.onrender.com/associations/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete association');
        dispatch({ type: 'SET_DATA', payload: { associations: safeAssociations.filter(a => a.id !== id) } });
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const filteredAssociations = safeAssociations.filter(association =>
    (association.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     association.contact_info?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedAssociations = filteredAssociations.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <h2>Associations</h2>
      {safeAssociations.length > 0 ? (
        <Grid container spacing={2}>
          {paginatedAssociations.map((association, index) => (
            association && association.id ? (
              <Grid item xs={12} sm={6} md={4} key={association.id || `association-${index}`}>
                <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2, borderRadius: 4, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                  <p>Name: {association.name || 'N/A'} - Contact: {association.contact_info || 'N/A'}</p>
                  <p>Fee: ${association.fee || 0} (Due Date: {association.due_date || 'N/A'})</p>
                  <Box sx={{ mt: 1 }}>
                    <Button sx={{ mr: 1, backgroundColor: '#4a90e2', color: 'white', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen(association)}>Edit</Button>
                    <Button sx={{ backgroundColor: '#e74c3c', color: 'white', '&:hover': { backgroundColor: '#c0392b' } }} onClick={() => handleDelete(association.id)}>Delete</Button>
                  </Box>
                </Box>
              </Grid>
            ) : null
          ))}
        </Grid>
      ) : (
        <p>No associations available.</p>
      )}
      <Pagination count={Math.ceil(filteredAssociations.length / itemsPerPage)} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
      <Button variant="contained" sx={{ mt: 2, backgroundColor: '#4a90e2', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen()}>
        Add Association
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editAssociation ? 'Edit Association' : 'Add Association'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="name" label="Name" value={formData.name} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="contact_info" label="Contact Info" value={formData.contact_info} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="fee" label="Fee" type="number" value={formData.fee} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="due_date" label="Due Date" value={formData.due_date} onChange={handleChange} fullWidth />
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

export default AssociationsAssociations;