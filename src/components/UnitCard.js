import React from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions } from '@mui/material';
import { useSnackbar } from 'notistack';

const UnitCard = ({ unit, onEdit, onDelete, propertyAddress }) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await onDelete(unit.id);
        enqueueSnackbar('Unit deleted successfully', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Failed to delete unit', { variant: 'error' });
      }
    }
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      '&:hover': { boxShadow: 6 }
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          Unit #{unit.unit_number || 'N/A'}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Property: {propertyAddress || 'N/A'}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Rent: ${unit.rent_amount || 0}
        </Typography>
        <Box sx={{ 
          display: 'inline-block', 
          px: 1, 
          py: 0.5, 
          borderRadius: 1,
          bgcolor: unit.status === 'occupied' ? 'success.light' : 'warning.light',
          color: 'white'
        }}>
          {unit.status || 'N/A'}
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={() => onEdit(unit)}
          sx={{ color: 'primary.main' }}
        >
          Edit
        </Button>
        <Button 
          size="small" 
          onClick={handleDelete}
          sx={{ color: 'error.main' }}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default UnitCard;
