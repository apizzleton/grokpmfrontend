import React, { useContext, useState } from 'react';
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
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AppContext from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import { useSnackbar } from 'notistack';

const RentalsProperties = () => {
  const { state, updateData } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [open, setOpen] = useState(false);
  const [editProperty, setEditProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    property_type: 'residential',
    status: 'active',
    value: '',
    addresses: [{
      street: '',
      city: '',
      state: '',
      zip: '',
      is_primary: true
    }]
  });

  const handleClickOpen = (property = null) => {
    if (property) {
      setEditProperty(property);
      setFormData({
        name: property.name,
        property_type: property.property_type || 'residential',
        status: property.status || 'active',
        value: property.value || '',
        addresses: property.addresses?.length > 0 
          ? property.addresses.map(addr => ({
              id: addr.id,
              street: addr.street,
              city: addr.city,
              state: addr.state,
              zip: addr.zip,
              is_primary: addr.is_primary
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
      if (editProperty) {
        await updateData(`properties/${editProperty.id}`, formData, 'put');
        enqueueSnackbar('Property updated successfully', { variant: 'success' });
      } else {
        await updateData('properties', formData);
        enqueueSnackbar('Property added successfully', { variant: 'success' });
      }
      handleClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to save property', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await updateData(`properties/${id}`, null, 'delete');
      enqueueSnackbar('Property deleted successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to delete property', { variant: 'error' });
    }
  };

  const filteredProperties = (state.properties || [])
    .filter(property => 
      filter === 'all' || property.status === filter
    )
    .sort((a, b) => {
      const aAddress = a.addresses?.find(addr => addr.is_primary)?.street || '';
      const bAddress = b.addresses?.find(addr => addr.is_primary)?.street || '';
      return sortOrder === 'asc'
        ? aAddress.localeCompare(bAddress)
        : bAddress.localeCompare(aAddress);
    });

  if (state.loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Properties</Typography>
        <Typography>Loading properties...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Properties</Typography>
        <Button 
          variant="contained" 
          onClick={() => handleClickOpen()}
          startIcon={<AddIcon />}
        >
          Add Property
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Filter by Status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ mr: 2, width: 200 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
        <Button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          Sort by Address ({sortOrder.toUpperCase()})
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filteredProperties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property.id}>
            <PropertyCard 
              property={property}
              onEdit={handleClickOpen}
              onDelete={handleDelete}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editProperty ? 'Edit Property' : 'Add Property'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="name"
                label="Property Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="value"
                label="Property Value"
                type="number"
                value={formData.value}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                name="property_type"
                label="Property Type"
                value={formData.property_type}
                onChange={handleChange}
              >
                <MenuItem value="residential">Residential</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
                <MenuItem value="industrial">Industrial</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                name="status"
                label="Status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Addresses</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddAddress}
                >
                  Add Address
                </Button>
              </Box>
              <List>
                {formData.addresses.map((address, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      bgcolor: 'background.paper',
                      mb: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <ListItemText>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Street Address"
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
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="State"
                            value={address.state}
                            onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
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
                        sx={{ mr: 1 }}
                      >
                        {address.is_primary ? <StarIcon color="primary" /> : <StarBorderIcon />}
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        onClick={() => handleRemoveAddress(index)}
                        disabled={formData.addresses.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={
              !formData.name ||
              formData.addresses.some(addr => 
                !addr.street || !addr.city || !addr.state || !addr.zip
              )
            }
          >
            {editProperty ? 'Save Changes' : 'Add Property'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RentalsProperties;