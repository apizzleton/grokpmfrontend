import React from 'react';
import { Typography, Grid, Paper, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// eslint-disable-next-line no-unused-vars
function Overview({ tenants, properties, units, payments, maintenance, associations, owners, boardMembers, user }) {
  const theme = useTheme();

  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeProperties = Array.isArray(properties) ? properties : [];
  const safeUnits = Array.isArray(units) ? units : [];
  const safePayments = Array.isArray(payments) ? payments : [];
  // eslint-disable-next-line no-unused-vars
  const safeMaintenance = Array.isArray(maintenance) ? maintenance : [];
  const safeAssociations = Array.isArray(associations) ? associations : [];
  const safeOwners = Array.isArray(owners) ? owners : [];
  const safeBoardMembers = Array.isArray(boardMembers) ? boardMembers : [];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, boxShadow: 1, border: `1px solid ${theme.palette.primary.main}` }}>
          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main }}>
            Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: `${theme.palette.primary.light}20`, borderRadius: 2, border: `1px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h6">Properties</Typography>
                <Typography variant="body1">{safeProperties.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: `${theme.palette.primary.light}20`, borderRadius: 2, border: `1px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h6">Tenants</Typography>
                <Typography variant="body1">{safeTenants.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: `${theme.palette.primary.light}20`, borderRadius: 2, border: `1px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h6">Units</Typography>
                <Typography variant="body1">{safeUnits.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: `${theme.palette.primary.light}20`, borderRadius: 2, border: `1px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h6">Payments</Typography>
                <Typography variant="body1">{safePayments.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: `${theme.palette.primary.light}20`, borderRadius: 2, border: `1px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h6">Associations</Typography>
                <Typography variant="body1">{safeAssociations.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: `${theme.palette.primary.light}20`, borderRadius: 2, border: `1px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h6">Owners</Typography>
                <Typography variant="body1">{safeOwners.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: `${theme.palette.primary.light}20`, borderRadius: 2, border: `1px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h6">Board Members</Typography>
                <Typography variant="body1">{safeBoardMembers.length}</Typography>
              </Paper>
            </Grid>
          </Grid>
          <Button variant="contained" color="primary" sx={{ mt: 2 }}>
            Generate Report
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Overview;