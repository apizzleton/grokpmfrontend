import React from 'react';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';

const TenantPage = ({ tenants }) => {
  // Ensure tenants is an array, default to empty array if undefined or null
  const safeTenants = Array.isArray(tenants) ? [...tenants] : [];
  const { id } = useParams();

  // Find tenant by ID
  const tenant = safeTenants.find(t => t.id === parseInt(id));

  // Log tenant for debugging
  console.log('Tenant in TenantPage:', tenant);

  return (
    <Box sx={{ p: 3 }}>
      <h2>Tenant Details</h2>
      {tenant ? (
        <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: 4, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
          <p>Name: {tenant.name || 'N/A'} - Email: {tenant.email || 'N/A'}</p>
          <p>Phone: {tenant.phone || 'N/A'} - Unit ID: {tenant.unit_id || 'N/A'}</p>
          <p>Lease: {tenant.lease_start_date || 'N/A'} to {tenant.lease_end_date || 'N/A'}</p>
        </Box>
      ) : (
        <p>Tenant not found.</p>
      )}
    </Box>
  );
};

export default TenantPage;