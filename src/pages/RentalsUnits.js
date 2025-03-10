import React, { useContext, useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Grid, 
  Typography, 
  MenuItem,
  CircularProgress,
  IconButton,
  Container,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AppContext from '../context/AppContext';
import UnitCard from '../components/UnitCard';
import { useSnackbar } from 'notistack';
import SearchFilterSort from '../components/SearchFilterSort';
import { useNavigate } from 'react-router-dom';

const RentalsUnits = () => {
  const { state, dispatch, modifyData, fetchData } = useContext(AppContext);
  const { units, properties } = state;
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
  const [formData, setFormData] = useState({ 
    unit_number: '', 
    rent_amount: '', 
    status: 'vacant', 
    address_id: '' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('unit_number');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUnits();
    if (properties.length === 0) {
      loadProperties();
    }
  }, []);

  const loadUnits = async () => {
    setLoading(true);
    try {
      console.log('Loading units...');
      const data = await fetchData('units');
      console.log('Units data received:', data);
      if (data) {
        dispatch({ type: 'SET_DATA', payload: { units: data } });
      }
    } catch (error) {
      console.error('Error loading units:', error);
      enqueueSnackbar('Failed to load units', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      console.log('Loading properties...');
      const data = await fetchData('properties');
      console.log('Properties data received:', data);
      if (data) {
        dispatch({ type: 'SET_DATA', payload: { properties: data } });
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      enqueueSnackbar('Failed to load properties', { variant: 'error' });
    }
  };

  // Get all addresses from all properties
  const allAddresses = properties.reduce((addresses, property) => {
    if (property.addresses && Array.isArray(property.addresses)) {
      const propertyAddresses = property.addresses.map(address => ({
        id: address.id,
        fullAddress: `${property.name} - ${address.street}, ${address.city}, ${address.state} ${address.zip}`,
        propertyId: property.id,
        propertyName: property.name
      }));
      return [...addresses, ...propertyAddresses];
    }
    return addresses;
  }, []);

  const getAddressDetails = (addressId) => {
    console.log('Getting address details for ID:', addressId);
    console.log('All addresses:', allAddresses);
    const address = allAddresses.find(addr => addr.id === addressId);
    return address ? address.fullAddress : 'N/A';
  };

  const getPropertyName = (propertyId) => {
    console.log('Getting property name for ID:', propertyId);
    console.log('Available properties:', properties);
    const property = properties.find(prop => prop.id === propertyId);
    return property ? property.name : 'N/A';
  };

  const handleClickOpen = (unit = null) => {
    setEditUnit(unit);
    if (unit) {
      setFormData({
        unit_number: unit.unit_number || '',
        rent_amount: unit.rent_amount || '',
        status: unit.status || 'vacant',
        address_id: unit.address_id || ''
      });
    } else {
      setFormData({ 
        unit_number: '', 
        rent_amount: '', 
        status: 'vacant', 
        address_id: allAddresses.length > 0 ? allAddresses[0].id : ''
      });
    }
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
      // Validate required fields
      if (!formData.unit_number?.trim()) {
        enqueueSnackbar('Unit number is required', { variant: 'error' });
        return;
      }

      if (!formData.address_id) {
        enqueueSnackbar('Property address is required', { variant: 'error' });
        return;
      }

      const response = await modifyData(
        editUnit ? 'put' : 'post',
        editUnit ? `units/${editUnit.id}` : 'units',
        formData
      );
      
      // Reload units after successful save
      await loadUnits();
      
      handleClose();
      enqueueSnackbar(editUnit ? 'Unit updated successfully' : 'Unit added successfully', { variant: 'success' });
    } catch (error) {
      console.error('Save error:', error);
      enqueueSnackbar(error.message || 'Failed to save unit', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      console.log(`Attempting to delete unit with ID: ${id}`);
      
      // Make the API call first to ensure it succeeds
      await modifyData('delete', `units/${id}`);
      
      // Reload the units from the server instead of filtering locally
      await loadUnits();
      
      enqueueSnackbar('Unit deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Delete error:', error);
      enqueueSnackbar(error.message || 'Failed to delete unit', { variant: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilterLocationChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const filteredUnits = Array.isArray(units) ? units
    .filter(unit => 
      // Text search filter
      (searchTerm === '' || 
       unit.unit_number?.toString().includes(searchTerm) ||
       unit.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       getAddressDetails(unit.address_id).toLowerCase().includes(searchTerm.toLowerCase())) &&
      // Status filter
      (filter === 'all' || unit.status === filter) &&
      // Property filter
      (propertyFilter === 'all' || unit.address_id === propertyFilter)
    )
    .sort((a, b) => {
      if (sortBy === 'unit_number') {
        const aNum = parseInt(a.unit_number) || 0;
        const bNum = parseInt(b.unit_number) || 0;
        return aNum - bNum;
      } else if (sortBy === 'rent_amount') {
        return a.rent_amount - b.rent_amount;
      }
      return 0;
    }) : [];

  return (
    <Container>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">Units</Typography>
        <Button
          variant="contained"
          onClick={() => handleClickOpen()}
          startIcon={<AddIcon />}
        >
          Add Unit
        </Button>
      </Box>

      <SearchFilterSort 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterOptions={[
          { value: 'all', label: 'All Units' },
          { value: 'vacant', label: 'Vacant' },
          { value: 'occupied', label: 'Occupied' }
        ]}
        propertyFilter={propertyFilter}
        onPropertyFilterChange={setPropertyFilter}
        propertyOptions={[
          { value: 'all', label: 'All Properties' },
          ...properties.map(property => ({ value: property.id, label: property.name }))
        ]}
        sortOptions={[
          { value: 'unit_number', label: 'Unit Number' },
          { value: 'rent_amount', label: 'Rent Amount' },
          { value: 'status', label: 'Status' }
        ]}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {filteredUnits.map(unit => (
            <Grid item xs={12} sm={6} md={4} key={unit.id}>
              <UnitCard 
                unit={unit} 
                addressDetails={unit.address_id ? getAddressDetails(unit.address_id) : 'N/A'}
                onDelete={handleDelete}
                onEdit={(unit) => handleClickOpen(unit)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editUnit ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="unit_number"
                label="Unit Number"
                value={formData.unit_number}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="rent_amount"
                label="Rent Amount"
                type="number"
                value={formData.rent_amount}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: <Typography>$</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="status"
                label="Status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="vacant">Vacant</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="address_id"
                label="Property Address"
                value={formData.address_id}
                onChange={handleChange}
                fullWidth
                required
              >
                {allAddresses.map((address) => (
                  <MenuItem key={address.id} value={address.id}>
                    {address.fullAddress}
                  </MenuItem>
                ))}
                {allAddresses.length === 0 && (
                  <MenuItem disabled>
                    No properties available - add a property first
                  </MenuItem>
                )}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.unit_number || !formData.address_id}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RentalsUnits;