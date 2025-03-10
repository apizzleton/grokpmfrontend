import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Chip
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const UnitCard = ({ unit, onDelete, onEdit, addressDetails }) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await onDelete(unit.id);
      // The success message is handled in the parent component
    } catch (error) {
      console.error('Error deleting unit:', error);
      enqueueSnackbar(error.message || 'Failed to delete unit', { variant: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        '&:hover': { boxShadow: 6 }
      }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                cursor: 'pointer',
                '&:hover': { 
                  color: 'primary.main',
                  textDecoration: 'underline'
                }
              }}
              onClick={() => navigate(`/rentals/units/${unit.id}`)}
            >
              Unit #{unit.unit_number || 'N/A'}
            </Typography>
            <Chip 
              label={unit.status || 'vacant'}
              color={unit.status === 'occupied' ? 'success' : 'warning'}
              size="small"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Property: {addressDetails || 'N/A'}
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            Rent: ${unit.rent_amount || 0}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
          <Button 
            size="small" 
            onClick={() => navigate(`/rentals/units/${unit.id}`)}
            sx={{ color: 'primary.main' }}
          >
            View
          </Button>
          <Button 
            size="small" 
            onClick={() => onEdit(unit)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete Unit #{unit.unit_number}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UnitCard;
