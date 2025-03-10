import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import TenantCard from '../components/TenantCard';
import { Grid, Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

const PeopleTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [open, setOpen] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    unit_id: '',
    lease_start_date: '',
    lease_end_date: '',
    rent: ''
  });

  const { fetchData, modifyData } = useApp();

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    const data = await fetchData('tenants');
    if (data) {
      setTenants(data);
    }
  };

  const handleClickOpen = (tenant = null) => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        unit_id: tenant.unit_id || '',
        lease_start_date: tenant.lease_start_date || '',
        lease_end_date: tenant.lease_end_date || '',
        rent: tenant.rent || ''
      });
      setEditTenant(tenant);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        unit_id: '',
        lease_start_date: '',
        lease_end_date: '',
        rent: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTenant(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      unit_id: '',
      lease_start_date: '',
      lease_end_date: '',
      rent: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    const method = editTenant ? 'PUT' : 'POST';
    const endpoint = `tenants${editTenant ? `/${editTenant.id}` : ''}`;
    const success = await modifyData(method, endpoint, formData);
    if (success) {
      loadTenants();
      handleClose();
    }
  };

  const handleDelete = async (id) => {
    const success = await modifyData('DELETE', `tenants/${id}`);
    if (success) {
      loadTenants();
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Tenants
      </Typography>
      <Grid container spacing={3}>
        {tenants.map((tenant) => (
          <Grid item xs={12} sm={6} md={4} key={tenant.id}>
            <TenantCard tenant={tenant} onDelete={handleDelete} onEdit={handleClickOpen} />
          </Grid>
        ))}
      </Grid>
      <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleClickOpen()}>
        Add Tenant
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editTenant ? 'Edit Tenant' : 'Add Tenant'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            name="unit_id"
            label="Unit ID"
            value={formData.unit_id}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            name="lease_start_date"
            label="Lease Start Date"
            type="date"
            value={formData.lease_start_date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            name="lease_end_date"
            label="Lease End Date"
            type="date"
            value={formData.lease_end_date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            name="rent"
            label="Rent"
            type="number"
            value={formData.rent}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PeopleTenants;