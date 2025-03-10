import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const BoardMemberCard = ({ member, handleEdit, handleDelete }) => {
  // Function to determine role color
  const getRoleColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'president':
        return 'primary';
      case 'treasurer':
        return 'success';
      case 'secretary':
        return 'info';
      default:
        return 'default';
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
          {member.name || 'No Name'}
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Chip 
            label={member.role || 'Member'} 
            size="small" 
            color={getRoleColor(member.role)}
            sx={{ mr: 1 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Email:</strong> {member.email || 'No Email'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Phone:</strong> {member.phone || 'No Phone'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Association ID:</strong> {member.association_id || 'Not Assigned'}
        </Typography>
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

export default BoardMemberCard;
