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
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const LeaseCard = ({ lease, unitName, tenantName, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'upcoming':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
          <Typography variant="h6" component="div" noWrap>
            {unitName}
          </Typography>
          <Chip 
            label={lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
            color={getStatusColor(lease.status)}
            size="small"
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography color="text.secondary" noWrap>
            {tenantName}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography color="text.secondary">
            ${Number(lease.rent_amount).toLocaleString()}/month
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {formatDate(lease.start_date)} - {formatDate(lease.end_date)}
          </Typography>
        </Box>
      </CardContent>

      <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Edit Lease">
          <IconButton 
            size="small" 
            onClick={onEdit}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Lease">
          <IconButton 
            size="small" 
            onClick={onDelete}
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
