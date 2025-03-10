import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const OwnerCard = ({ owner, propertyAddress, onEdit, onDelete }) => {
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      '&:hover': { 
        boxShadow: 6,
        transform: 'translateY(-5px)'
      }
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {owner.name || 'No Name'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Email:</strong> {owner.email || 'No Email'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Phone:</strong> {owner.phone || 'No Phone'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Property:</strong> {propertyAddress || 'No Property'}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          startIcon={<EditIcon />} 
          onClick={() => onEdit(owner)}
          sx={{ color: 'primary.main' }}
        >
          Edit
        </Button>
        <Button 
          size="small" 
          startIcon={<DeleteIcon />} 
          onClick={() => onDelete(owner.id)}
          sx={{ color: 'error.main' }}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default OwnerCard;
