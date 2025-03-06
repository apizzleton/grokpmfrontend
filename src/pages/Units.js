import React, { useContext, useState } from 'react';
import { Box, Typography, TextField, Button, Grid, MenuItem } from '@mui/material';
import AppContext from '../context/AppContext';
import { useSnackbar } from 'notistack';

const Units = () => {
  const { state, updateData } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const [newUnit, setNewUnit] = useState({
    propertyId: '',
    unitNumber: '',
    rentAmount: '',
    status: 'vacant',
  });

  const units = state.properties.flatMap(property =>
    property.units ? property.units.map(unit => ({ ...unit, propertyName: property.name })) : []
  );

  const handleAddUnit = async () => {
    try {
      const response = await updateData('units', newUnit);
      enqueueSnackbar('Unit added successfully', { variant: 'success' });
      setNewUnit({ propertyId: '', unitNumber: '', rentAmount: '', status: 'vacant' });
    } catch (error) {
      enqueueSnackbar('Failed to add unit', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Units
      </Typography>
      <Grid container spacing={2}>
        {units.map((unit) => (
          <Grid item xs={12} sm={6} md={4} key={unit.id}>
            <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
              <Typography variant="h6">{unit.unitNumber}</Typography>
              <Typography variant="body1">Property: {unit.propertyName}</Typography>
              <Typography variant="body1">Rent: ${unit.rentAmount}</Typography>
              <Typography variant="body1">Status: {unit.status}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New Unit
        </Typography>
        <TextField
          select
          label="Property"
          value={newUnit.propertyId}
          onChange={(e) => setNewUnit({ ...newUnit, propertyId: e.target.value })}
          sx={{ mr: 2, mt: 2, width: 200 }}
        >
          {state.properties.map((prop) => (
            <MenuItem key={prop.id} value={prop.id}>
              {prop.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Unit Number"
          value={newUnit.unitNumber}
          onChange={(e) => setNewUnit({ ...newUnit, unitNumber: e.target.value })}
          sx={{ mr: 2, mt: 2 }}
        />
        <TextField
          label="Rent Amount"
          value={newUnit.rentAmount}
          onChange={(e) => setNewUnit({ ...newUnit, rentAmount: e.target.value })}
          type="number"
          sx={{ mr: 2, mt: 2 }}
        />
        <TextField
          select
          label="Status"
          value={newUnit.status}
          onChange={(e) => setNewUnit({ ...newUnit, status: e.target.value })}
          sx={{ mr: 2, mt: 2, width: 200 }}
        >
          <MenuItem value="occupied">Occupied</MenuItem>
          <MenuItem value="vacant">Vacant</MenuItem>
        </TextField>
        <Button onClick={handleAddUnit} variant="contained" sx={{ mt: 2 }}>
          Add Unit
        </Button>
      </Box>
    </Box>
  );
};

export default Units;