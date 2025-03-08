import React, { useContext, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem } from '@mui/material';
import AppContext from '../context/AppContext';
import Pagination from '@mui/material/Pagination';

const PeopleTenants = () => {
  const { state, dispatch } = useContext(AppContext);
  const { tenants, units, searchQuery } = state;
  const [open, setOpen] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', unit_id: '', lease_start_date: '', lease_end_date: '' });
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const safeTenants = Array.isArray(tenants) ? [...tenants] : [];
  const safeUnits = Array.isArray(units) ? [...units].sort((a, b) => (a.unit_number || '').toString().localeCompare((b.unit_number || '').toString())) : [];
  console.log('Tenants in PeopleTenants:', safeTenants);
  console.log('Units for dropdown:', safeUnits);

  const handleClickOpen = (tenant = null) => {
    setEditTenant(tenant);
    setFormData(tenant || { name: '', email: '', phone: '', unit_id: '', lease_start_date: '', lease_end_date: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTenant(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const method = editTenant ? 'PUT' : 'POST';
      const url = `https://grokpm-backend.onrender.com/tenants${editTenant ? `/${editTenant.id}` : ''}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to save tenant');
      const data = await response.json();
      dispatch({ type: 'SET_DATA', payload: { tenants: editTenant ? safeTenants.map(t => t.id === data.id ? data : t) : [...safeTenants, data] } });
      handleClose();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        const response = await fetch(`https://grokpm-backend.onrender.com/tenants/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete tenant');
        dispatch({ type: 'SET_DATA', payload: { tenants: safeTenants.filter(t => t.id !== id) } });
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const filteredTenants = safeTenants.filter(tenant =>
    (tenant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedTenants = filteredTenants.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <h2>Tenants</h2>
      {safeTenants.length > 0 ? (
        <Grid container spacing={2}>
          {paginatedTenants.map((tenant, index) => (
            tenant && tenant.id ? (
              <Grid item xs={12} sm={6} md={4} key={tenant.id || `tenant-${index}`}>
                <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2, borderRadius: 4, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                  <p>Name: {tenant.name || 'N/A'} - Email: {tenant.email || 'N/A'}</p>
                  <p>Phone: {tenant.phone || 'N/A'} - Unit: {safeUnits.find(u => u.id === tenant.unit_id)?.unit_number || 'N/A'}</p>
                  <Box sx={{ mt: 1 }}>
                    <Button sx={{ mr: 1, backgroundColor: '#4a90e2', color: 'white', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen(tenant)}>Edit</Button>
                    <Button sx={{ backgroundColor: '#e74c3c', color: 'white', '&:hover': { backgroundColor: '#c0392b' } }} onClick={() => handleDelete(tenant.id)}>Delete</Button>
                  </Box>
                </Box>
              </Grid>
            ) : null
          ))}
        </Grid>
      ) : (
        <p>No tenants available.</p>
      )}
      <Pagination count={Math.ceil(filteredTenants.length / itemsPerPage)} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
      <Button variant="contained" sx={{ mt: 2, backgroundColor: '#4a90e2', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen()}>
        Add Tenant
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editTenant ? 'Edit Tenant' : 'Add Tenant'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="name" label="Name" value={formData.name} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="email" label="Email" value={formData.email} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="phone" label="Phone" value={formData.phone} onChange={handleChange} fullWidth />
          <TextField
            select
            margin="dense"
            name="unit_id"
            label="Unit"
            value={formData.unit_id}
            onChange={handleChange}
            fullWidth
          >
            {safeUnits.map((unit) => (
              <MenuItem key={unit.id} value={unit.id}>{`Unit #${unit.unit_number || 'N/A'}`}</MenuItem>
            ))}
          </TextField>
          <TextField margin="dense" name="lease_start_date" label="Lease Start Date" value={formData.lease_start_date} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="lease_end_date" label="Lease End Date" value={formData.lease_end_date} onChange={handleChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: '#757575' }}>Cancel</Button>
          <Button onClick={handleSave} sx={{ backgroundColor: '#4a90e2', color: 'white', '&:hover': { backgroundColor: '#357abd' } }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PeopleTenants;