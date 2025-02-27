import React from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function PropertyCard({ property, onEdit, onDelete }) {
  return (
    <Card sx={{ mb: 2, boxShadow: 1 }}>
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">{property.address}, {property.city}, {property.state} {property.zip}</Typography>
          <Typography variant="body2">{property.units} units - Value: ${property.value} (Owner ID: {property.owner_id || 'N/A'})</Typography>
        </Box>
        <Box>
          <IconButton onClick={() => onEdit(property)} aria-label="edit" sx={{ color: '#3498db' }}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => onDelete(property.id)} aria-label="delete" sx={{ color: '#e74c3c' }}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}

export default PropertyCard;