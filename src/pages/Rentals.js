import React from 'react';
import { Typography, Grid, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// eslint-disable-next-line no-unused-vars
function Rentals({ tenants, properties, units, user }) {
  const theme = useTheme();

  // eslint-disable-next-line no-unused-vars
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeProperties = Array.isArray(properties) ? properties : [];
  const safeUnits = Array.isArray(units) ? units : [];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, boxShadow: 1, border: `1px solid ${theme.palette.primary.main}` }}>
          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main }}>
            Rentals
          </Typography>
          <Typography>Rentals content to be implemented.</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Rentals;