import React from 'react';
import { Box, TextField, MenuItem, InputAdornment, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/**
 * Reusable component for search, filter, and sort functionality
 * @param {Object} props Component props
 * @param {string} props.searchTerm Current search term
 * @param {Function} props.onSearchChange Search term change handler
 * @param {string} props.filterValue Current filter value
 * @param {Function} props.onFilterChange Filter change handler
 * @param {Array} props.filterOptions Array of filter options [{value, label}]
 * @param {string} props.filterLabel Label for filter dropdown
 * @param {string} props.sortBy Current sort value
 * @param {Function} props.onSortChange Sort change handler
 * @param {Array} props.sortOptions Array of sort options [{value, label}]
 * @param {string} props.sortLabel Label for sort dropdown
 * @param {string} props.searchPlaceholder Placeholder for search field
 * @param {string} props.propertyFilterValue Current property filter value
 * @param {Function} props.onPropertyFilterChange Property filter change handler
 * @param {Array} props.propertyFilterOptions Array of property filter options [{value, label}]
 * @param {string} props.propertyFilterLabel Label for property filter dropdown
 */
const SearchFilterSort = ({
  searchTerm,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = 'Filter By',
  sortBy,
  onSortChange,
  sortOptions,
  sortLabel = 'Sort By',
  searchPlaceholder = 'Search...',
  propertyFilterValue,
  onPropertyFilterChange,
  propertyFilterOptions,
  propertyFilterLabel = 'Property'
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={onSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        {filterOptions && (
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label={filterLabel}
              value={filterValue}
              onChange={onFilterChange}
              variant="outlined"
            >
              {filterOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}
        
        {propertyFilterOptions && (
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label={propertyFilterLabel}
              value={propertyFilterValue}
              onChange={onPropertyFilterChange}
              variant="outlined"
            >
              {propertyFilterOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}
        
        {sortOptions && (
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label={sortLabel}
              value={sortBy}
              onChange={onSortChange}
              variant="outlined"
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SearchFilterSort;
