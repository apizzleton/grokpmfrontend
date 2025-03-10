import React from 'react';
import { Card, CardContent, Typography, Button, CardActions, Box } from '@mui/material';
import { useSnackbar } from 'notistack';

const PropertyCard = ({ property, onEdit, onDelete }) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await onDelete(property.id);
        enqueueSnackbar('Property deleted successfully', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Failed to delete property', { variant: 'error' });
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
          {property.name || 'Unnamed Property'}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {property.address}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {property.city}, {property.state} {property.zip}
        </Typography>
        <Box sx={{ 
          display: 'inline-block', 
          px: 1, 
          py: 0.5, 
          borderRadius: 1,
          bgcolor: property.status === 'active' ? 'success.light' : 'warning.light',
          color: 'white'
        }}>
          {property.status}
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={() => onEdit(property)}
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

export default PropertyCard;