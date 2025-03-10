import React, { useContext, useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  MenuItem, 
  Button, 
  Grid, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AppContext from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import { useSnackbar } from 'notistack';

const RentalsProperties = () => {
  const { state, dispatch, modifyData, fetchData } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [open, setOpen] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    property_type: 'residential',
    status: 'active',
    value: '',
    owner_id: null,
    addresses: [{
      street: '',
      city: '',
      state: '',
      zip: '',
      is_primary: true
    }]
  });
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    const data = await fetchData('properties');
    if (data) {
      console.log('Available properties:', data);
      dispatch({ type: 'SET_PROPERTIES', payload: data });
    }
  };

  const handleFilterLocationChange = (e) => {
    setFilterLocation(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleClickOpen = (property = null) => {
    if (property) {
      setEditProperty(property);
      setFormData({
        name: property.name || '',
        property_type: property.property_type || 'residential',
        status: property.status || 'active',
        value: property.value || '',
        owner_id: property.owner_id || null,
        addresses: property.addresses && property.addresses.length > 0 
          ? property.addresses.map(addr => ({
              id: addr.id,
              street: addr.street || '',
              city: addr.city || '',
              state: addr.state || '',
              zip: addr.zip || '',
              is_primary: addr.is_primary || false
            }))
          : [{
              street: '',
              city: '',
              state: '',
              zip: '',
              is_primary: true
            }]
      });
    } else {
      setEditProperty(null);
      setFormData({
        name: '',
        property_type: 'residential',
        status: 'active',
        value: '',
        owner_id: null,
        addresses: [{
          street: '',
          city: '',
          state: '',
          zip: '',
          is_primary: true
        }]
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditProperty(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (index, field, value) => {
    setFormData(prev => {
      const newAddresses = [...prev.addresses];
      newAddresses[index] = {
        ...newAddresses[index],
        [field]: value
      };
      return { ...prev, addresses: newAddresses };
    });
  };

  const handleAddAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          street: '',
          city: '',
          state: '',
          zip: '',
          is_primary: false
        }
      ]
    }));
  };

  const handleRemoveAddress = (index) => {
    if (formData.addresses.length === 1) {
      enqueueSnackbar('Property must have at least one address', { variant: 'warning' });
      return;
    }
    setFormData(prev => {
      const newAddresses = prev.addresses.filter((_, i) => i !== index);
      // If removing primary address, make the first address primary
      if (prev.addresses[index].is_primary && newAddresses.length > 0) {
        newAddresses[0].is_primary = true;
      }
      return { ...prev, addresses: newAddresses };
    });
  };

  const handleSetPrimaryAddress = (index) => {
    setFormData(prev => {
      const newAddresses = prev.addresses.map((addr, i) => ({
        ...addr,
        is_primary: i === index
      }));
      return { ...prev, addresses: newAddresses };
    });
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        enqueueSnackbar('Property name is required', { variant: 'error' });
        return;
      }

      // Validate addresses
      const hasValidAddress = formData.addresses.some(addr => 
        addr.street?.trim() && addr.city?.trim() && addr.state?.trim() && addr.zip?.trim()
      );
      if (!hasValidAddress) {
        enqueueSnackbar('At least one complete address is required', { variant: 'error' });
        return;
      }

      // Ensure one primary address
      const primaryAddresses = formData.addresses.filter(addr => addr.is_primary);
      if (primaryAddresses.length !== 1) {
        enqueueSnackbar('Exactly one primary address is required', { variant: 'error' });
        return;
      }

      // Prepare data for submission
      const dataToSubmit = {
        ...formData,
        value: formData.value === '' ? 0 : parseFloat(formData.value),
        owner_id: formData.owner_id || null,
        addresses: formData.addresses.filter(addr => 
          addr.street.trim() !== '' || 
          addr.city.trim() !== '' || 
          addr.state.trim() !== '' || 
          addr.zip.trim() !== ''
        ).map(addr => ({
          ...addr,
          street: addr.street.trim(),
          city: addr.city.trim(),
          state: addr.state.trim(),
          zip: addr.zip.trim()
        }))
      };

      console.log('Submitting property data:', dataToSubmit);

      const success = await modifyData(
        editProperty ? 'PUT' : 'POST',
        `properties${editProperty ? `/${editProperty.id}` : ''}`,
        dataToSubmit
      );

      if (success) {
        enqueueSnackbar(`Property ${editProperty ? 'updated' : 'added'} successfully`, { variant: 'success' });
        handleClose();
        loadProperties();
      }
    } catch (error) {
      console.error('Error saving property:', error);
      enqueueSnackbar(error.message || 'Failed to save property', { variant: 'error' });
    }
  };

  const handleDelete = async (propertyId) => {
    try {
      setIsDeleting(true);
      const success = await modifyData('DELETE', `properties/${propertyId}`);
      
      if (success) {
        dispatch({ type: 'REMOVE_PROPERTY', payload: propertyId });
        enqueueSnackbar('Property deleted successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      enqueueSnackbar(error.message || 'Failed to delete property', { variant: 'error' });
      loadProperties(); // Refresh data if deletion failed
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProperties = state.properties
    .filter(property => 
      !filterLocation || 
      property.addresses.some(addr => 
        addr.city.toLowerCase().includes(filterLocation.toLowerCase()) ||
        addr.street.toLowerCase().includes(filterLocation.toLowerCase()) ||
        addr.state.toLowerCase().includes(filterLocation.toLowerCase()) ||
        addr.zip.toLowerCase().includes(filterLocation.toLowerCase())
      )
    )
    .filter(property => {
      if (filter === 'all') return true;
      return property.status === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return (parseFloat(a.value) || 0) - (parseFloat(b.value) || 0);
        case 'rent':
          return (parseFloat(a.rent) || 0) - (parseFloat(b.rent) || 0);
        case 'name':
          const aName = a.name?.toLowerCase() || '';
          const bName = b.name?.toLowerCase() || '';
          return sortOrder === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
        default:
          return 0;
      }
    });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Properties</Typography>
        <Box>
          <TextField
            select
            label="Filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ mr: 2, minWidth: 120 }}
            size="small"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <TextField
            select
            label="Sort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            sx={{ mr: 2, minWidth: 120 }}
            size="small"
          >
            <MenuItem value="asc">A-Z</MenuItem>
            <MenuItem value="desc">Z-A</MenuItem>
          </TextField>
          <Button
            variant="contained"
            onClick={() => handleClickOpen()}
            startIcon={<AddIcon />}
          >
            Add Property
          </Button>
        </Box>
      </Box>

      <TextField
        label="Filter by location"
        variant="outlined"
        fullWidth
        value={filterLocation}
        onChange={(e) => setFilterLocation(e.target.value)}
        sx={{ mb: 3 }}
      />

      {state.loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredProperties.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No properties found
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleClickOpen()}
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Add Your First Property
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <PropertyCard 
                property={property} 
                onDelete={handleDelete}
                onEdit={handleClickOpen}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editProperty ? 'Edit Property' : 'Add Property'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Property Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="property_type"
                label="Property Type"
                value={formData.property_type}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="residential">Residential</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
                <MenuItem value="industrial">Industrial</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="status"
                label="Status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="value"
                label="Property Value"
                type="number"
                value={formData.value}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Addresses</Typography>
          <List>
            {formData.addresses.map((address, index) => (
              <ListItem key={index} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}>
                <ListItemText>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Street"
                        value={address.street}
                        onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="City"
                        value={address.city}
                        onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="State"
                        value={address.state}
                        onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ZIP Code"
                        value={address.zip}
                        onChange={(e) => handleAddressChange(index, 'zip', e.target.value)}
                        required
                      />
                    </Grid>
                  </Grid>
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={() => handleSetPrimaryAddress(index)}
                    color={address.is_primary ? 'primary' : 'default'}
                  >
                    {address.is_primary ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton
                    onClick={() => handleRemoveAddress(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddAddress}
            sx={{ mt: 1 }}
          >
            Add Address
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RentalsProperties;