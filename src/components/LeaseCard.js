import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const LeaseCard = ({ lease, onEdit, onDelete, isDeleting }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'terminated':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      '&:hover': {
        boxShadow: 6,
        transform: 'scale(1.02)',
        transition: 'transform 0.2s ease-in-out'
      }
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            {lease.tenant_name}
          </Typography>
          <Chip 
            label={lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
            color={getStatusColor(lease.status)}
            size="small"
          />
        </Box>
        
        <Typography color="text.secondary" gutterBottom>
          Unit: {lease.Unit?.unit_number}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Property: {lease.Property?.name}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Start Date: {new Date(lease.start_date).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            End Date: {new Date(lease.end_date).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Monthly Rent: ${Number(lease.monthly_rent).toLocaleString()}
          </Typography>
        </Box>

        {lease.notes && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Notes: {lease.notes}
          </Typography>
        )}
      </CardContent>

      <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Edit Lease">
          <IconButton 
            size="small" 
            onClick={() => onEdit(lease)}
            disabled={isDeleting}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Lease">
          <IconButton 
            size="small" 
            onClick={() => onDelete(lease.id)}
            disabled={isDeleting}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default LeaseCard;
