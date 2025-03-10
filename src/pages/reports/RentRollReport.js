import React, { useContext, useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../context/AppContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { useSnackbar } from 'notistack';

const RentRollReport = () => {
  const { state, fetchData } = useContext(AppContext);
  const { units, properties } = state;
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportData, setReportData] = useState([]);
  const [totalRent, setTotalRent] = useState(0);
  const [occupancyRate, setOccupancyRate] = useState(0);
  const [reportDate] = useState(new Date().toLocaleDateString());

  // Get all addresses from all properties
  const allAddresses = properties.reduce((addresses, property) => {
    if (property.addresses && Array.isArray(property.addresses)) {
      const propertyAddresses = property.addresses.map(address => ({
        id: address.id,
        fullAddress: `${property.name} - ${address.street}, ${address.city}, ${address.state} ${address.zip}`,
        propertyId: property.id,
        propertyName: property.name
      }));
      return [...addresses, ...propertyAddresses];
    }
    return addresses;
  }, []);

  const getAddressDetails = (addressId) => {
    const address = allAddresses.find(addr => addr.id === addressId);
    return address ? address.fullAddress : 'N/A';
  };

  const getPropertyName = (addressId) => {
    const address = allAddresses.find(addr => addr.id === addressId);
    return address ? address.propertyName : 'N/A';
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (units.length === 0) {
          await fetchData('units');
        }
        if (properties.length === 0) {
          await fetchData('properties');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        enqueueSnackbar('Failed to load report data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Filter units based on property and status filters
    let filteredUnits = [...units];
    
    if (propertyFilter !== 'all') {
      filteredUnits = filteredUnits.filter(unit => unit.address_id === propertyFilter);
    }
    
    if (statusFilter !== 'all') {
      filteredUnits = filteredUnits.filter(unit => unit.status === statusFilter);
    }
    
    // Calculate total rent and occupancy rate
    const totalRentAmount = filteredUnits.reduce((sum, unit) => sum + (Number(unit.rent_amount) || 0), 0);
    const occupiedUnits = filteredUnits.filter(unit => unit.status === 'occupied').length;
    const occupancyPercentage = filteredUnits.length > 0 ? (occupiedUnits / filteredUnits.length) * 100 : 0;
    
    setReportData(filteredUnits);
    setTotalRent(totalRentAmount);
    setOccupancyRate(occupancyPercentage);
  }, [units, propertyFilter, statusFilter]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Property', 'Unit Number', 'Status', 'Rent Amount'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(unit => [
        getPropertyName(unit.address_id),
        unit.unit_number,
        unit.status,
        unit.rent_amount || 0
      ].join(','))
    ].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rent_roll_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container className="print-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/reports')}
          sx={{ display: { xs: 'none', sm: 'flex', print: 'none' } }}
        >
          Back to Reports
        </Button>
        <Typography variant="h4" component="h1" sx={{ flex: 1, textAlign: 'center' }}>
          Rent Roll Report
        </Typography>
        <Box sx={{ display: { xs: 'none', sm: 'flex', print: 'none' } }}>
          <Button 
            startIcon={<PrintIcon />} 
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            Print
          </Button>
          <Button 
            startIcon={<DownloadIcon />} 
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3, display: { print: 'block' } }}>
        <Grid container spacing={2} sx={{ mb: 3, display: { print: 'none' } }}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Property</InputLabel>
              <Select
                value={propertyFilter}
                label="Property"
                onChange={(e) => setPropertyFilter(e.target.value)}
              >
                <MenuItem value="all">All Properties</MenuItem>
                {allAddresses.map((address) => (
                  <MenuItem key={address.id} value={address.id}>
                    {address.fullAddress}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="vacant">Vacant</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Report Date"
              value={reportDate}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Units
                </Typography>
                <Typography variant="h5">
                  {reportData.length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Monthly Rent
                </Typography>
                <Typography variant="h5">
                  ${totalRent.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Occupancy Rate
                </Typography>
                <Typography variant="h5">
                  {occupancyRate.toFixed(1)}%
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Property</strong></TableCell>
                  <TableCell><strong>Unit Number</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Rent Amount</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.length > 0 ? (
                  reportData.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>{getPropertyName(unit.address_id)}</TableCell>
                      <TableCell>{unit.unit_number}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell align="right">${Number(unit.rent_amount || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No units found matching the selected filters.
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={3} align="right"><strong>Total:</strong></TableCell>
                  <TableCell align="right"><strong>${totalRent.toFixed(2)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary', display: { print: 'none' } }}>
        <Typography variant="caption">
          This report was generated on {reportDate} and reflects the current state of units and properties.
        </Typography>
      </Box>
    </Container>
  );
};

export default RentRollReport;
