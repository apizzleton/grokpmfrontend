import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem, Container, Typography } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import OwnerCard from '../components/OwnerCard';
import AddIcon from '@mui/icons-material/Add';
import SearchFilterSort from '../components/SearchFilterSort';

const PeopleOwners = () => {
  const { state, dispatch, fetchData, modifyData } = useApp();
  const { owners, properties } = state;
  const [open, setOpen] = useState(false);
  const [editOwner, setEditOwner] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', property_id: '' });
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const itemsPerPage = 5;

  useEffect(() => {
    loadOwners();
    if (properties.length === 0) {
      loadProperties();
    }
  }, []);

  const loadOwners = async () => {
    const data = await fetchData('owners');
    if (data) {
      dispatch({ type: 'SET_DATA', payload: { owners: data } });
    }
  };

  const loadProperties = async () => {
    const data = await fetchData('properties');
    if (data) {
      dispatch({ type: 'SET_DATA', payload: { properties: data } });
    }
  };

  const safeOwners = Array.isArray(owners) ? [...owners] : [];
  const safeProperties = Array.isArray(properties) ? [...properties].sort((a, b) => {
    const addrA = a.addresses?.find(addr => addr.is_primary)?.street || '';
    const addrB = b.addresses?.find(addr => addr.is_primary)?.street || '';
    return addrA.localeCompare(addrB);
  }) : [];

  const getPropertyAddress = (property) => {
    const primaryAddress = property?.addresses?.find(addr => addr.is_primary);
    return primaryAddress ? `${primaryAddress.street}, ${primaryAddress.city}` : 'N/A';
  };

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
    const method = editOwner ? 'PUT' : 'POST';
    const endpoint = `owners${editOwner ? `/${editOwner.id}` : ''}`;
    const success = await modifyData(method, endpoint, formData);
    if (success) {
      loadOwners();
      handleClose();
    }
  };

  const handleDelete = async (id) => {
    const success = await modifyData('DELETE', `owners/${id}`);
    if (success) {
      loadOwners();
    }
  };

  const filteredOwners = safeOwners.filter(owner =>
    (owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     owner.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedOwners = filteredOwners.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'email') {
      return a.email.localeCompare(b.email);
    } else if (sortBy === 'property') {
      const propertyA = safeProperties.find(p => p.id === a.property_id);
      const propertyB = safeProperties.find(p => p.id === b.property_id);
      return getPropertyAddress(propertyA).localeCompare(getPropertyAddress(propertyB));
    }
  });

  const paginatedOwners = sortedOwners.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <h2>Owners</h2>
      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        filterValue={filter}
        onFilterChange={(e) => setFilter(e.target.value)}
        filterOptions={[
          { value: 'all', label: 'All Owners' },
          { value: 'with_property', label: 'With Property' },
          { value: 'without_property', label: 'Without Property' }
        ]}
        filterLabel="Status"
        sortBy={sortBy}
        onSortChange={(e) => setSortBy(e.target.value)}
        sortOptions={[
          { value: 'name', label: 'Name' },
          { value: 'email', label: 'Email' },
          { value: 'property', label: 'Property' }
        ]}
        sortLabel="Sort By"
        searchPlaceholder="Search owners..."
      />
      {safeOwners.length > 0 ? (
        <Grid container spacing={2}>
          {paginatedOwners.map((owner, index) => (
            owner && owner.id ? (
              <Grid item xs={12} sm={6} md={4} key={owner.id || `owner-${index}`}>
                <OwnerCard
                  owner={owner}
                  propertyAddress={getPropertyAddress(safeProperties.find(p => p.id === owner.property_id))}
                  onDelete={() => handleDelete(owner.id)}
                  onEdit={() => handleClickOpen(owner)}
                />
              </Grid>
            ) : null
          ))}
        </Grid>
      ) : (
        <p>No owners available.</p>
      )}
      <Pagination count={Math.ceil(filteredOwners.length / itemsPerPage)} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
      <Button variant="contained" sx={{ mt: 2, backgroundColor: '#4a90e2', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen()}>
        <AddIcon sx={{ mr: 1 }} /> Add Owner
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
              <MenuItem key={prop.id} value={prop.id}>{getPropertyAddress(prop)}</MenuItem>
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