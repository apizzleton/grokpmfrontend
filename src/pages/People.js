import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Typography, List, TextField, Button, Grid, Paper, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import TenantCard from '../components/TenantCard';
import { useTheme } from '@mui/material/styles'; // Import useTheme for dynamic color access

const People = () => {
  const [tenants, setTenants] = useState([]);
  const [newTenant, setNewTenant] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [user, setUser] = useState({});
  const { fetchData, modifyData } = useApp();
  const theme = useTheme(); // Access theme for dynamic colors

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [tenantsData, propertiesData, unitsData, userData] = await Promise.all([
      fetchData('tenants'),
      fetchData('properties'),
      fetchData('units'),
      fetchData('user')
    ]);

    if (tenantsData) setTenants(tenantsData);
    if (propertiesData) setProperties(propertiesData);
    if (unitsData) setUnits(unitsData);
    if (userData) setUser(userData);
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleTenantInputChange = (e) => {
    setNewTenant({ ...newTenant, [e.target.name]: e.target.value });
  };

  const handleTenantSubmit = async (e) => {
    e.preventDefault();
    const success = await modifyData('POST', 'tenants', newTenant);
    if (success) {
      setTenants([...tenants, newTenant]);
      setNewTenant({});
    }
  };

  const handleDeleteTenant = async (id) => {
    const success = await modifyData('DELETE', `tenants/${id}`);
    if (success) {
      setTenants(tenants.filter(t => t.id !== id));
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, boxShadow: 1, border: `1px solid ${theme.palette.primary.main}` }}> {/* Use theme primary color for border */}
          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main }}> {/* Use theme primary color for heading */}
            People (Tenants)
          </Typography>
          <List>
            {tenants.length > 0 ? (
              tenants.map(tenant => (
                <TenantCard key={tenant.id} tenant={tenant} onEdit={() => {}} onDelete={() => handleDeleteTenant(tenant.id)} />
              ))
            ) : (
              <Typography>No tenants found.</Typography>
            )}
          </List>
          <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ mt: 2 }}>
            Add Tenant
          </Button>
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Add New Tenant</DialogTitle>
            <DialogContent>
              <form onSubmit={(e) => { handleTenantSubmit(e); handleCloseDialog(); }} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
                <TextField
                  name="name"
                  value={newTenant.name}
                  onChange={handleTenantInputChange}
                  placeholder="Tenant Name"
                  required
                  fullWidth
                  variant="outlined"
                />
                <TextField
                  name="unit_id"
                  value={newTenant.unit_id}
                  onChange={handleTenantInputChange}
                  select
                  required
                  fullWidth
                  variant="outlined"
                  label="Select Unit"
                >
                  <MenuItem value="">Select Unit</MenuItem>
                  {units.map(unit => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.unit_number} (Property: {properties.find(p => p.id === unit.property_id)?.address})
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  name="email"
                  value={newTenant.email}
                  onChange={handleTenantInputChange}
                  placeholder="Email"
                  required
                  fullWidth
                  variant="outlined"
                  type="email"
                />
                <TextField
                  name="phone"
                  value={newTenant.phone}
                  onChange={handleTenantInputChange}
                  placeholder="Phone"
                  required
                  fullWidth
                  variant="outlined"
                />
                <TextField
                  name="lease_start_date"
                  value={newTenant.lease_start_date}
                  onChange={handleTenantInputChange}
                  required
                  fullWidth
                  variant="outlined"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  name="lease_end_date"
                  value={newTenant.lease_end_date}
                  onChange={handleTenantInputChange}
                  required
                  fullWidth
                  variant="outlined"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  name="rent"
                  value={newTenant.rent}
                  onChange={handleTenantInputChange}
                  placeholder="Rent Amount"
                  required
                  fullWidth
                  variant="outlined"
                  type="number"
                />
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="secondary">
                Cancel
              </Button>
              <Button onClick={(e) => { handleTenantSubmit(e); handleCloseDialog(); }} color="primary">
                Add
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default People;