import React, { useState } from 'react';
import { Box, Typography, TextField, MenuItem } from '@mui/material';

function Leases() {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('startDate');

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Leases
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="Filter"
          value={filter}
          onChange={handleFilterChange}
          size="small"
        />
        <TextField
          select
          label="Sort By"
          value={sortBy}
          onChange={handleSortChange}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="startDate">Start Date</MenuItem>
          <MenuItem value="endDate">End Date</MenuItem>
          <MenuItem value="rent">Rent Amount</MenuItem>
        </TextField>
      </Box>
      {/* Lease list will go here */}
    </Box>
  );
}

export default Leases;
