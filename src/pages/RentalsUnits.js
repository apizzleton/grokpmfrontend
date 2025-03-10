import React, { useContext, useState } from 'react';
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
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AppContext from '../context/AppContext';
import UnitCard from '../components/UnitCard';
import { useSnackbar } from 'notistack';

const RentalsUnits = () => {
  const { state, updateData, setState, refreshData } = useContext(AppContext);
  const { units, properties, searchQuery } = state;
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
  const [formData, setFormData] = useState({ 
    unit_number: '', 
    rent_amount: '', 
    status: 'vacant', 
    address_id: '' 
  });
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState('rent');

  // Get all addresses from all properties
  const allAddresses = properties.reduce((addresses, property) => {
    if (property.addresses && Array.isArray(property.addresses)) {
      return [...addresses, ...property.addresses.map(addr => ({
        ...addr,
        propertyName: property.name,
        fullAddress: `${property.name} - ${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`
      }))];
    }
    return addresses;
  }, []);

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

      const response = await updateData(
        editUnit ? `units/${editUnit.id}` : 'units',
        formData,
        editUnit ? 'put' : 'post'
      );
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
      
      // Manually update the UI first for better UX
      const updatedUnits = units.filter(u => u.id !== id);
      setState(prev => ({
        ...prev,
        units: updatedUnits
      }));
      
      await updateData(`units/${id}`, null, 'delete');
      enqueueSnackbar('Unit deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Delete error:', error);
      enqueueSnackbar(error.message || 'Failed to delete unit', { variant: 'error' });
      
      // Refresh data to restore the UI if deletion failed
      refreshData();
    } finally {
      setIsDeleting(false);
    }
  };

  const getAddressDetails = (addressId) => {
    const address = allAddresses.find(addr => addr.id === addressId);
    return address ? address.fullAddress : 'N/A';
  };

  const handleFilterLocationChange = (e) => {
    setFilterLocation(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const filteredUnits = Array.isArray(units) ? units
    .filter(unit => 
      (searchQuery === '' || 
       unit.unit_number?.toString().includes(searchQuery) ||
       unit.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       getAddressDetails(unit.address_id).toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filter === 'all' || unit.status === filter) &&
      (!filterLocation || 
       getAddressDetails(unit.address_id).toLowerCase().includes(filterLocation.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'rent') {
        return a.rent_amount - b.rent_amount;
      } else if (sortBy === 'unit') {
        const aNum = parseInt(a.unit_number) || 0;
        const bNum = parseInt(b.unit_number) || 0;
        return aNum - bNum;
      }
      return 0;
    }) : [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Units</Typography>
        <Box>
          <TextField
            select
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ mr: 2, minWidth: 120 }}
          >
            <MenuItem value="all">All Units</MenuItem>
            <MenuItem value="occupied">Occupied</MenuItem>
            <MenuItem value="vacant">Vacant</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            sx={{ mr: 2, minWidth: 120 }}
          >
            <MenuItem value="asc">Unit # (Low-High)</MenuItem>
            <MenuItem value="desc">Unit # (High-Low)</MenuItem>
          </TextField>
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <TextField
              label="Filter by Location"
              value={filterLocation}
              onChange={handleFilterLocationChange}
              size="small"
            />
            <TextField
              select
              label="Sort By"
              value={sortBy}
              onChange={handleSortChange}
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="rent">Rent Amount</MenuItem>
              <MenuItem value="unit">Unit Number</MenuItem>
            </TextField>
          </Box>
          <Button
            variant="contained"
            onClick={() => handleClickOpen()}
            startIcon={<AddIcon />}
          >
            Add Unit
          </Button>
        </Box>
      </Box>

      {state.loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredUnits.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No units found
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleClickOpen()}
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Add Your First Unit
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredUnits.map((unit) => (
            unit && unit.id ? (
              <Grid item xs={12} sm={6} md={4} key={unit.id}>
                <UnitCard
                  unit={unit}
                  onEdit={handleClickOpen}
                  onDelete={handleDelete}
                  propertyAddress={getAddressDetails(unit.address_id)}
                />
              </Grid>
            ) : null
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
    </Box>
  );
};

export default RentalsUnits;