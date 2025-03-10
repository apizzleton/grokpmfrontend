import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import TenantCard from '../components/TenantCard';
import { Grid, Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchFilterSort from '../components/SearchFilterSort';

const PeopleTenants = () => {
  const { state, dispatch, fetchData, modifyData } = useApp();
  const { tenants = [], units = [] } = state;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadTenants();
    loadUnits();
  }, []);

  const loadTenants = async () => {
    const data = await fetchData('tenants');
    if (data) {
      dispatch({ type: 'SET_DATA', payload: { tenants: data } });
    }
  };

  const loadUnits = async () => {
    const data = await fetchData('units');
    if (data) {
      dispatch({ type: 'SET_DATA', payload: { units: data } });
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
      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        filterValue={filter}
        onFilterChange={(e) => setFilter(e.target.value)}
        filterOptions={[
          { value: 'all', label: 'All Tenants' },
          { value: 'active', label: 'Active Leases' },
          { value: 'inactive', label: 'Inactive Leases' }
        ]}
        filterLabel="Status"
        sortBy={sortBy}
        onSortChange={(e) => setSortBy(e.target.value)}
        sortOptions={[
          { value: 'name', label: 'Name' },
          { value: 'lease_start_date', label: 'Lease Start Date' },
          { value: 'lease_end_date', label: 'Lease End Date' }
        ]}
        sortLabel="Sort By"
        searchPlaceholder="Search tenants..."
      />
      <Grid container spacing={3}>
        {tenants
          .filter((tenant) => {
            if (filter === 'all') return true;
            if (filter === 'active') return tenant.lease_end_date > new Date();
            if (filter === 'inactive') return tenant.lease_end_date <= new Date();
            return false;
          })
          .filter((tenant) => {
            return (
              tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              tenant.phone.toLowerCase().includes(searchTerm.toLowerCase())
            );
          })
          .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'lease_start_date') return new Date(a.lease_start_date) - new Date(b.lease_start_date);
            if (sortBy === 'lease_end_date') return new Date(a.lease_end_date) - new Date(b.lease_end_date);
            return 0;
          })
          .map((tenant) => (
            <Grid item xs={12} sm={6} md={4} key={tenant.id}>
              <TenantCard tenant={tenant} onDelete={handleDelete} onEdit={handleClickOpen} />
            </Grid>
          ))}
      </Grid>
      <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleClickOpen()}>
        <AddIcon />
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