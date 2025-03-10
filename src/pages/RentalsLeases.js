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
  MenuItem, 
  Container, 
  Typography, 
  Pagination,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchFilterSort from '../components/SearchFilterSort';
import LeaseCard from '../components/LeaseCard';

const RentalsLeases = () => {
  const { state, dispatch, fetchData, modifyData } = useApp();
  const { leases = [], units = [], tenants = [], properties = [] } = state;
  const [open, setOpen] = useState(false);
  const [editLease, setEditLease] = useState(null);
  const [formData, setFormData] = useState({
    unit_id: '',
    tenant_id: '',
    rent_amount: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('start_date');
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    loadLeases();
    loadUnits();
    loadTenants();
    loadProperties();
  }, []);

  const loadLeases = async () => {
    setLoading(true);
    const data = await fetchData('leases');
    if (data) {
      dispatch({ type: 'SET_DATA', payload: { leases: data } });
    }
    setLoading(false);
  };

  const loadUnits = async () => {
    const data = await fetchData('units');
    if (data) {
      dispatch({ type: 'SET_DATA', payload: { units: data } });
    }
  };

  const loadTenants = async () => {
    const data = await fetchData('tenants');
    if (data) {
      dispatch({ type: 'SET_DATA', payload: { tenants: data } });
    }
  };

  const loadProperties = async () => {
    const data = await fetchData('properties');
    if (data) {
      dispatch({ type: 'SET_DATA', payload: { properties: data } });
    }
  };

  const handleClickOpen = (lease = null) => {
    if (lease) {
      setFormData({
        unit_id: lease.unit_id || '',
        tenant_id: lease.tenant_id || '',
        rent_amount: lease.rent_amount || '',
        start_date: lease.start_date ? lease.start_date.substring(0, 10) : '',
        end_date: lease.end_date ? lease.end_date.substring(0, 10) : '',
        status: lease.status || 'active'
      });
      setEditLease(lease);
    } else {
      setFormData({
        unit_id: '',
        tenant_id: '',
        rent_amount: '',
        start_date: '',
        end_date: '',
        status: 'active'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditLease(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      const method = editLease ? 'PUT' : 'POST';
      const endpoint = `leases${editLease ? `/${editLease.id}` : ''}`;
      const success = await modifyData(method, endpoint, formData);
      if (success) {
        loadLeases();
        handleClose();
      }
    } catch (error) {
      console.error('Error saving lease:', error);
    }
  };

  const handleDelete = async (id) => {
    const success = await modifyData('DELETE', `leases/${id}`);
    if (success) {
      loadLeases();
    }
  };

  const getUnitName = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return 'Unknown Unit';
    
    // Find the property associated with this unit by property_id
    const property = properties.find(p => p.id === unit.property_id);
    
    // Use property name if found, otherwise show property ID to help with debugging
    const propertyName = property ? property.name : `Property ID: ${unit.property_id || 'None'}`;
    
    return `${unit.unit_number} (${propertyName})`;
  };

  const getTenantName = (tenantId) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : 'Unknown Tenant';
  };

  const filteredLeases = leases.filter(lease => {
    // Search filter
    const searchMatch = 
      getUnitName(lease.unit_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTenantName(lease.tenant_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    if (filter === 'all') return searchMatch;
    if (filter === 'active') return searchMatch && lease.status === 'active';
    if (filter === 'expired') return searchMatch && lease.status === 'expired';
    if (filter === 'upcoming') {
      const startDate = new Date(lease.start_date);
      const now = new Date();
      return searchMatch && startDate > now;
    }
    
    return searchMatch;
  });

  const sortedLeases = [...filteredLeases].sort((a, b) => {
    if (sortBy === 'start_date') {
      return new Date(b.start_date) - new Date(a.start_date);
    }
    if (sortBy === 'end_date') {
      return new Date(b.end_date) - new Date(a.end_date);
    }
    if (sortBy === 'rent_amount') {
      return parseFloat(b.rent_amount) - parseFloat(a.rent_amount);
    }
    return 0;
  });

  const paginatedLeases = sortedLeases.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">Leases</Typography>
        <Button
          variant="contained"
          onClick={() => handleClickOpen()}
          startIcon={<AddIcon />}
        >
          Add Lease
        </Button>
      </Box>

      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        filterValue={filter}
        onFilterChange={(e) => setFilter(e.target.value)}
        filterOptions={[
          { value: 'all', label: 'All Leases' },
          { value: 'active', label: 'Active' },
          { value: 'expired', label: 'Expired' },
          { value: 'upcoming', label: 'Upcoming' }
        ]}
        filterLabel="Status"
        sortBy={sortBy}
        onSortChange={(e) => setSortBy(e.target.value)}
        sortOptions={[
          { value: 'start_date', label: 'Start Date' },
          { value: 'end_date', label: 'End Date' },
          { value: 'rent_amount', label: 'Rent Amount' }
        ]}
        sortLabel="Sort By"
        searchPlaceholder="Search leases..."
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredLeases.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No leases found
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleClickOpen()}
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Add Your First Lease
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {paginatedLeases.map((lease) => (
            <Grid item xs={12} sm={6} md={4} key={lease.id}>
              <LeaseCard 
                lease={lease}
                unitName={getUnitName(lease.unit_id)}
                tenantName={getTenantName(lease.tenant_id)}
                onEdit={() => handleClickOpen(lease)}
                onDelete={() => handleDelete(lease.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {filteredLeases.length > itemsPerPage && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={Math.ceil(filteredLeases.length / itemsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editLease ? 'Edit Lease' : 'Add Lease'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                name="unit_id"
                label="Unit"
                value={formData.unit_id}
                onChange={handleChange}
                fullWidth
                required
              >
                {units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {getUnitName(unit.id)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                name="tenant_id"
                label="Tenant"
                value={formData.tenant_id}
                onChange={handleChange}
                fullWidth
                required
              >
                {tenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="rent_amount"
                label="Monthly Rent Amount"
                type="number"
                value={formData.rent_amount}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="start_date"
                label="Start Date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="end_date"
                label="End Date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                name="status"
                label="Status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RentalsLeases;
