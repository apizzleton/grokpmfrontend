import { Container, Typography, Pagination, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Grid, Box, Select, FormControl, InputLabel, InputAdornment } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import SearchIcon from '@mui/icons-material/Search';

const AssociationsProperties = () => {
  const [properties, setProperties] = useState([]);
  const [open, setOpen] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [formData, setFormData] = useState({ address: '', city: '', state: '', zip: '', value: '', owner_id: '' });
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('address');
  const itemsPerPage = 5;
  const { fetchData, modifyData } = useApp();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    const data = await fetchData('properties');
    if (data) {
      setProperties(data);
    }
  };

  const handleDelete = async (id) => {
    const success = await modifyData('DELETE', `properties/${id}`);
    if (success) {
      loadProperties();
    }
  };

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
      const url = `properties${editProperty ? `/${editProperty.id}` : ''}`;
      const success = await modifyData(method, url, formData);
      if (success) {
        loadProperties();
        handleClose();
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const filteredProperties = properties
    .filter(property => {
      const searchLower = searchTerm.toLowerCase();
      return (
        property.address?.toLowerCase().includes(searchLower) ||
        property.city?.toLowerCase().includes(searchLower) ||
        property.state?.toLowerCase().includes(searchLower) ||
        property.zip?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return (parseFloat(a.value) || 0) - (parseFloat(b.value) || 0);
        case 'city':
          return (a.city || '').localeCompare(b.city || '');
        case 'state':
          return (a.state || '').localeCompare(b.state || '');
        case 'address':
        default:
          return (a.address || '').localeCompare(b.address || '');
      }
    });

  const paginatedProperties = filteredProperties.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Properties
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
          >
            <MenuItem value="address">Address</MenuItem>
            <MenuItem value="city">City</MenuItem>
            <MenuItem value="state">State</MenuItem>
            <MenuItem value="value">Value</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => handleClickOpen()}>
          Add Property
        </Button>
      </Box>

      <Grid container spacing={3}>
        {paginatedProperties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property.id}>
            <PropertyCard property={property} onDelete={handleDelete} onEdit={handleClickOpen} />
          </Grid>
        ))}
      </Grid>
      <Pagination count={Math.ceil(filteredProperties.length / itemsPerPage)} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editProperty ? 'Edit Property' : 'Add Property'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="address" label="Address" value={formData.address} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="city" label="City" value={formData.city} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="state" label="State" value={formData.state} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="zip" label="ZIP" value={formData.zip} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="value" label="Value" type="number" value={formData.value} onChange={handleChange} fullWidth />
          <TextField
            select
            margin="dense"
            name="owner_id"
            label="Owner"
            value={formData.owner_id}
            onChange={handleChange}
            fullWidth
          >
            {properties
              .map(prop => ({ id: prop.owner_id, name: `${prop.owner_id}` })) // Assuming owner_id maps to an owner name or ID
              .filter((item, idx, self) => self.findIndex(t => t.id === item.id) === idx) // Unique owners
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(owner => (
                <MenuItem key={owner.id} value={owner.id}>{owner.name}</MenuItem>
              ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssociationsProperties;