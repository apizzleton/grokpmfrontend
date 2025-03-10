import React, { useContext } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import FactoryIcon from '@mui/icons-material/Factory';
import AppContext from '../context/AppContext';

const PropertyCard = ({ property, onEdit, onDelete }) => {
  const { getPropertyAddresses, getUnitsForAddress } = useContext(AppContext);
  const addresses = getPropertyAddresses(property);
  
  const getPropertyTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'commercial':
        return <BusinessIcon />;
      case 'industrial':
        return <FactoryIcon />;
      default:
        return <HomeIcon />;
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card 
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getPropertyTypeIcon(property.property_type)}
          <Typography variant="h6" component="div" sx={{ ml: 1, flexGrow: 1 }}>
            {property.name}
          </Typography>
          <Chip 
            label={property.status}
            color={property.status === 'active' ? 'success' : 'default'}
            size="small"
          />
        </Box>

        <Typography color="text.secondary" gutterBottom>
          Value: {formatCurrency(property.value)}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <List dense>
          {addresses.map((address) => {
            const units = getUnitsForAddress(address.id);
            return (
              <ListItem 
                key={address.id}
                sx={{ 
                  px: 0,
                  py: 0.5,
                  display: 'flex',
                  alignItems: 'flex-start'
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LocationOnIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {address.label}
                      </Typography>
                      {address.isPrimary && (
                        <Tooltip title="Primary Address">
                          <StarIcon fontSize="small" color="primary" />
                        </Tooltip>
                      )}
                    </Box>
                  }
                  secondary={units.length > 0 && `${units.length} unit${units.length === 1 ? '' : 's'}`}
                />
              </ListItem>
            );
          })}
        </List>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
        <IconButton 
          size="small" 
          onClick={() => onEdit(property)}
          color="primary"
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => onDelete(property.id)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default PropertyCard;