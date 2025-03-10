import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';

const AssociationCard = ({ association, handleEdit, handleDelete }) => {
  // Format the due date
  const formatDueDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

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
          {association.name || 'Unnamed Association'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Contact:</strong> {association.contact_info || 'No contact information'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="body2" color="text.secondary">
            <strong>Fee:</strong> ${association.fee || '0'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EventIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary">
            <strong>Due Date:</strong> {formatDueDate(association.due_date)}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          startIcon={<EditIcon />} 
          onClick={handleEdit}
          sx={{ color: 'primary.main' }}
        >
          Edit
        </Button>
        <Button 
          size="small" 
          startIcon={<DeleteIcon />} 
          onClick={handleDelete}
          sx={{ color: 'error.main' }}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default AssociationCard;
