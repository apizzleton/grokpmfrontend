import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, ListItemText, IconButton, Box } from '@mui/material'; // Added Box
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function TenantCard({ tenant, onEdit, onDelete }) {
  return (
    <Card sx={{ mb: 2, boxShadow: 1 }}>
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to={`/tenant/${tenant.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
          <ListItemText primary={`${tenant.name}`} secondary={`Unit #${tenant.unit_id} - $${tenant.rent}`} />
        </Link>
        <Box>
          <IconButton onClick={() => onEdit(tenant)} aria-label="edit" sx={{ color: '#3498db' }}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => onDelete(tenant.id)} aria-label="delete" sx={{ color: '#e74c3c' }}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TenantCard;