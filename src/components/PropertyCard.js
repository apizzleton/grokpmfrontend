import React, { useContext } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import FactoryIcon from '@mui/icons-material/Factory';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSnackbar } from 'notistack';
import AppContext from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const PropertyCard = ({ property, onDelete, onEdit }) => {
  const { getUnitsForAddress } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const addresses = property.addresses || [];
  const navigate = useNavigate();
  
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

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDelete(property.id);
      enqueueSnackbar('Property deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting property:', error);
      enqueueSnackbar(error.message || 'Failed to delete property', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card 
        elevation={3}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '&:hover': { boxShadow: 6 }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getPropertyTypeIcon(property.property_type)}
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                ml: 1, 
                flexGrow: 1,
                cursor: 'pointer',
                '&:hover': { 
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
              onClick={() => navigate(`/rentals/properties/${property.id}`)}
            >
              {property.name || 'Unnamed Property'}
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
              const units = address.units || [];
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
                          {address.street}, {address.city}, {address.state} {address.zip}
                        </Typography>
                        {address.is_primary && (
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
          <Button 
            size="small" 
            onClick={() => navigate(`/rentals/properties/${property.id}`)}
            sx={{ color: 'primary.main' }}
          >
            View
          </Button>
          <Button 
            size="small" 
            onClick={() => onEdit(property)}
            sx={{ color: 'primary.main' }}
          >
            Edit
          </Button>
          <Button 
            size="small" 
            onClick={handleDeleteClick}
            sx={{ color: 'error.main' }}
          >
            Delete
          </Button>
        </CardActions>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Property</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{property.name}"? This will also delete all associated addresses and units. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PropertyCard;