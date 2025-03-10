import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import LeaseCard from './LeaseCard';
import { useSnackbar } from 'notistack';

function Leases({ propertyId, unitId }) {
  const { fetchData, modifyData } = useApp();
  const { enqueueSnackbar } = useSnackbar();
  const [leases, setLeases] = useState([]);
  const [open, setOpen] = useState(false);
  const [editLease, setEditLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [formData, setFormData] = useState({
    tenant_name: '',
    start_date: null,
    end_date: null,
    monthly_rent: '',
    security_deposit: '',
    status: 'active',
    unit_id: unitId || '',
    property_id: propertyId || '',
    notes: ''
  });

  useEffect(() => {
    loadLeases();
  }, [propertyId, unitId]);

  const loadLeases = async () => {
    try {
      let endpoint = 'leases';
      if (propertyId) endpoint += `?propertyId=${propertyId}`;
      if (unitId) endpoint += `?unitId=${unitId}`;
      
      const data = await fetchData(endpoint);
      if (data) {
        setLeases(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leases:', error);
      enqueueSnackbar('Failed to fetch leases', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleClickOpen = (lease = null) => {
    setEditLease(lease);
    if (lease) {
      setFormData({
        tenant_name: lease.tenant_name || '',
        start_date: new Date(lease.start_date) || null,
        end_date: new Date(lease.end_date) || null,
        monthly_rent: lease.monthly_rent || '',
        security_deposit: lease.security_deposit || '',
        status: lease.status || 'active',
        unit_id: lease.unit_id || unitId || '',
        property_id: lease.property_id || propertyId || '',
        notes: lease.notes || ''
      });
    } else {
      setFormData({
        tenant_name: '',
        start_date: null,
        end_date: null,
        monthly_rent: '',
        security_deposit: '',
        status: 'active',
        unit_id: unitId || '',
        property_id: propertyId || '',
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditLease(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSave = async () => {
    try {
      if (!formData.tenant_name?.trim()) {
        enqueueSnackbar('Tenant name is required', { variant: 'error' });
        return;
      }

      if (!formData.start_date || !formData.end_date) {
        enqueueSnackbar('Start and end dates are required', { variant: 'error' });
        return;
      }

      if (!formData.monthly_rent) {
        enqueueSnackbar('Monthly rent is required', { variant: 'error' });
        return;
      }

      if (!formData.unit_id) {
        enqueueSnackbar('Unit selection is required', { variant: 'error' });
        return;
      }

      const method = editLease ? 'PUT' : 'POST';
      const endpoint = `leases${editLease ? `/${editLease.id}` : ''}`;
      const success = await modifyData(method, endpoint, formData);
      
      if (success) {
        handleClose();
        loadLeases();
        enqueueSnackbar(
          editLease ? 'Lease updated successfully' : 'Lease added successfully',
          { variant: 'success' }
        );
      }
    } catch (error) {
      console.error('Save error:', error);
      enqueueSnackbar(error.message || 'Failed to save lease', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      const success = await modifyData('DELETE', `leases/${id}`);
      
      if (success) {
        setLeases(prev => prev.filter(lease => lease.id !== id));
        enqueueSnackbar('Lease deleted successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      enqueueSnackbar(error.message || 'Failed to delete lease', { variant: 'error' });
      loadLeases(); // Refresh data if deletion failed
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredLeases = leases
    .filter(lease => {
      const matchesStatus = filter === 'all' || lease.status === filter;
      const matchesLocation = !filterLocation || 
        lease.Unit?.unit_number?.toLowerCase().includes(filterLocation.toLowerCase()) ||
        lease.Property?.name?.toLowerCase().includes(filterLocation.toLowerCase());
      return matchesStatus && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.start_date) - new Date(a.start_date);
      } else if (sortBy === 'rent') {
        return b.monthly_rent - a.monthly_rent;
      }
      return 0;
    });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Leases</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleClickOpen()}
          disabled={isDeleting}
        >
          Add Lease
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Filter by Status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ mr: 2, minWidth: 150 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="expired">Expired</MenuItem>
          <MenuItem value="terminated">Terminated</MenuItem>
        </TextField>

        <TextField
          label="Filter by Location"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          sx={{ mr: 2, minWidth: 150 }}
        />

        <TextField
          select
          label="Sort by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="date">Date</MenuItem>
          <MenuItem value="rent">Rent</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={3}>
        {filteredLeases.map((lease) => (
          <Grid item xs={12} sm={6} md={4} key={lease.id}>
            <LeaseCard
              lease={lease}
              onEdit={() => handleClickOpen(lease)}
              onDelete={() => handleDelete(lease.id)}
              disabled={isDeleting}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editLease ? 'Edit Lease' : 'Add Lease'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="tenant_name"
            label="Tenant Name"
            value={formData.tenant_name}
            onChange={handleChange}
            fullWidth
            required
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={formData.start_date}
              onChange={(date) => handleDateChange('start_date', date)}
              renderInput={(params) => <TextField {...params} margin="dense" fullWidth required />}
            />
            <DatePicker
              label="End Date"
              value={formData.end_date}
              onChange={(date) => handleDateChange('end_date', date)}
              renderInput={(params) => <TextField {...params} margin="dense" fullWidth required />}
            />
          </LocalizationProvider>

          <TextField
            margin="dense"
            name="monthly_rent"
            label="Monthly Rent"
            type="number"
            value={formData.monthly_rent}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            margin="dense"
            name="security_deposit"
            label="Security Deposit"
            type="number"
            value={formData.security_deposit}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            margin="dense"
            name="status"
            label="Status"
            select
            value={formData.status}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
            <MenuItem value="terminated">Terminated</MenuItem>
          </TextField>

          <TextField
            margin="dense"
            name="notes"
            label="Notes"
            multiline
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Leases;
