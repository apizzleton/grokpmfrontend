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
  CircularProgress
} from '@mui/material';
import { useSnackbar } from 'notistack';

const UnitCard = ({ unit, onEdit, onDelete, propertyAddress }) => {
  const { enqueueSnackbar } = useSnackbar();
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
