import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Divider, 
  Tabs, 
  Tab, 
  Button,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CardMedia,
  IconButton,
  ImageList,
  ImageListItem
} from '@mui/material';
import AppContext from '../context/AppContext';
import { useSnackbar } from 'notistack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import FactoryIcon from '@mui/icons-material/Factory';
import PersonIcon from '@mui/icons-material/Person';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HandymanIcon from '@mui/icons-material/Handyman';
import AddIcon from '@mui/icons-material/Add';
import PhotoIcon from '@mui/icons-material/Photo';
import EditIcon from '@mui/icons-material/Edit';
import PhotoUpload from '../components/PhotoUpload';
import StarIcon from '@mui/icons-material/Star';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PropertyView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, fetchData, modifyData } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [maintenanceDialog, setMaintenanceDialog] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    unit_id: '',
    reported_date: new Date().toISOString().split('T')[0]
  });
  const [photoDialog, setPhotoDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoEditMode, setPhotoEditMode] = useState(false);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    loadProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      // First, fetch all properties to find the one we need
      const allProperties = await fetchData('properties');
      
      if (allProperties && allProperties.length > 0) {
        // Find the property with the matching ID
        const foundProperty = allProperties.find(p => p.id === parseInt(id) || p.id === id);
        
        if (foundProperty) {
          console.log('Found property:', foundProperty);
          setProperty(foundProperty);
          setPhotos(foundProperty.photos || []);
          
          // Load related data
          loadRelatedData(foundProperty);
        } else {
          console.error('Property not found in the list of properties. ID:', id);
          enqueueSnackbar('Property not found', { variant: 'error' });
          navigate('/rentals/properties');
        }
      } else {
        console.error('No properties returned from API');
        enqueueSnackbar('Failed to load properties', { variant: 'error' });
        navigate('/rentals/properties');
      }
    } catch (error) {
      console.error('Error loading property:', error);
      enqueueSnackbar('Error loading property: ' + (error.message || 'Unknown error'), { variant: 'error' });
      navigate('/rentals/properties');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedData = async (propertyData) => {
    try {
      // Get all units for this property's addresses
      if (propertyData.addresses && propertyData.addresses.length > 0) {
        const addressIds = propertyData.addresses.map(addr => addr.id);
        
        try {
          const unitsData = await fetchData('units');
          if (unitsData && Array.isArray(unitsData)) {
            const propertyUnits = unitsData.filter(unit => 
              addressIds.includes(unit.address_id)
            );
            setUnits(propertyUnits);
            
            // Get tenants for these units
            try {
              const tenantsData = await fetchData('tenants');
              if (tenantsData && Array.isArray(tenantsData)) {
                const propertyTenants = tenantsData.filter(tenant => 
                  propertyUnits.some(unit => unit.id === tenant.unit_id)
                );
                setTenants(propertyTenants);
              } else {
                console.log('No tenants data available or invalid format');
                setTenants([]);
              }
            } catch (error) {
              console.error('Error fetching tenants:', error);
              setTenants([]);
            }
          } else {
            console.log('No units data available or invalid format');
            setUnits([]);
          }
        } catch (error) {
          console.error('Error fetching units:', error);
          setUnits([]);
        }
      }
      
      // Set mock maintenance requests for now
      setMaintenanceRequests([
        {
          id: 1,
          title: 'Leaking Faucet',
          description: 'The kitchen faucet is leaking continuously',
          priority: 'medium',
          status: 'open',
          unit_id: units.length > 0 ? units[0].id : '',
          reported_date: '2025-03-01',
          unit_number: units.length > 0 ? units[0].unit_number : 'N/A'
        },
        {
          id: 2,
          title: 'Broken Window',
          description: 'Window in living room is cracked and needs replacement',
          priority: 'high',
          status: 'in_progress',
          unit_id: units.length > 0 ? units[0].id : '',
          reported_date: '2025-03-05',
          unit_number: units.length > 0 ? units[0].unit_number : 'N/A'
        }
      ]);
      
      // Handle property photos
      if (propertyData.photos && Array.isArray(propertyData.photos)) {
        console.log('Property photos:', propertyData.photos);
      } else {
        console.log('No photos available for this property');
      }
    } catch (error) {
      console.error('Error loading related data:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getPropertyTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'commercial':
        return <BusinessIcon fontSize="large" />;
      case 'industrial':
        return <FactoryIcon fontSize="large" />;
      default:
        return <HomeIcon fontSize="large" />;
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
  
  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setPhotoDialog(true);
  };
  
  const handlePhotoDialogClose = () => {
    setPhotoDialog(false);
    setSelectedPhoto(null);
    setPhotoEditMode(false);
  };
  
  const handlePhotosChange = async (updatedPhotos) => {
    try {
      // Update property with new photos
      const updatedProperty = {
        ...property,
        photos: updatedPhotos
      };
      
      const success = await modifyData(
        'PUT',
        `properties/${property.id}`,
        updatedProperty
      );
      
      if (success) {
        setProperty(updatedProperty);
        enqueueSnackbar('Photos updated successfully', { variant: 'success' });
        setPhotoEditMode(false);
      }
    } catch (error) {
      console.error('Error updating photos:', error);
      enqueueSnackbar('Failed to update photos', { variant: 'error' });
    }
  };

  const handleMaintenanceDialogOpen = () => {
    setMaintenanceForm({
      title: '',
      description: '',
      priority: 'medium',
      status: 'open',
      unit_id: units.length > 0 ? units[0].id : '',
      reported_date: new Date().toISOString().split('T')[0]
    });
    setMaintenanceDialog(true);
  };

  const handleMaintenanceDialogClose = () => {
    setMaintenanceDialog(false);
  };

  const handleMaintenanceFormChange = (e) => {
    const { name, value } = e.target;
    setMaintenanceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMaintenanceSubmit = () => {
    // Validate form
    if (!maintenanceForm.title || !maintenanceForm.description || !maintenanceForm.unit_id) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    // Create a new maintenance request
    const newRequest = {
      ...maintenanceForm,
      id: Date.now(), // Temporary ID until backend integration
      unit_number: units.find(unit => unit.id === maintenanceForm.unit_id)?.unit_number
    };

    setMaintenanceRequests(prev => [...prev, newRequest]);
    enqueueSnackbar('Maintenance request created successfully', { variant: 'success' });
    setMaintenanceDialog(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h5">Property not found</Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/rentals/properties')}
            sx={{ mt: 2 }}
          >
            Back to Properties
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/rentals/properties')}
          sx={{ mb: 2 }}
        >
          Back to Properties
        </Button>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getPropertyTypeIcon(property.property_type)}
                <Typography variant="h4" sx={{ ml: 2 }}>
                  {property.name || 'Unnamed Property'}
                </Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Type:</strong> {property.property_type || 'Not specified'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {property.status || 'Not specified'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Value:</strong> {formatCurrency(property.value)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'right' }}>
                <Chip 
                  label={property.status === 'active' ? 'Active' : 'Inactive'} 
                  color={property.status === 'active' ? 'success' : 'default'}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Property ID: {property.id}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="property tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Overview" icon={<HomeIcon />} iconPosition="start" />
            <Tab label="Units" icon={<ApartmentIcon />} iconPosition="start" />
            <Tab label="Tenants" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Financials" icon={<ReceiptIcon />} iconPosition="start" />
            <Tab label="Maintenance" icon={<HandymanIcon />} iconPosition="start" />
            <Tab label="Photos" icon={<PhotoIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Addresses</Typography>
              {property.addresses && property.addresses.length > 0 ? (
                property.addresses.map(address => (
                  <Card key={address.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="body1">
                        {address.street}, {address.city}, {address.state} {address.zip}
                      </Typography>
                      {address.is_primary && (
                        <Chip label="Primary" color="primary" size="small" sx={{ mt: 1 }} />
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No addresses found</Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <Card>
                <CardContent>
                  <Typography variant="body2" gutterBottom>
                    <strong>Total Units:</strong> {units.length}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Occupied Units:</strong> {units.filter(unit => unit.status === 'occupied').length}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Vacant Units:</strong> {units.filter(unit => unit.status === 'vacant').length}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Total Tenants:</strong> {tenants.length}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Maintenance Requests:</strong> {maintenanceRequests.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Units Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Units</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/rentals/units/add', { state: { propertyId: property.id } })}
            >
              Add Unit
            </Button>
          </Box>
          
          {units.length > 0 ? (
            <Grid container spacing={2}>
              {units.map(unit => (
                <Grid item xs={12} sm={6} md={4} key={unit.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 6 } 
                    }}
                    onClick={() => navigate(`/rentals/units/${unit.id}`)}
                  >
                    <CardContent>
                      <Typography variant="h6">Unit #{unit.unit_number}</Typography>
                      <Typography variant="body2" gutterBottom>
                        Rent: {formatCurrency(unit.rent_amount)}
                      </Typography>
                      <Chip 
                        label={unit.status} 
                        color={unit.status === 'occupied' ? 'success' : 'warning'}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary">No units found for this property</Typography>
          )}
        </TabPanel>

        {/* Tenants Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Tenants</Typography>
          
          {tenants.length > 0 ? (
            <Grid container spacing={2}>
              {tenants.map(tenant => (
                <Grid item xs={12} sm={6} md={4} key={tenant.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{tenant.name}</Typography>
                      <Typography variant="body2" gutterBottom>
                        Email: {tenant.email}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Phone: {tenant.phone}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Unit: {units.find(unit => unit.id === tenant.unit_id)?.unit_number || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        Lease: {new Date(tenant.lease_start_date).toLocaleDateString()} - {new Date(tenant.lease_end_date).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary">No tenants found for this property</Typography>
          )}
        </TabPanel>

        {/* Financials Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Financial Summary</Typography>
          
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                <strong>Property Value:</strong> {formatCurrency(property.value)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Monthly Rent Revenue:</strong> {formatCurrency(units.reduce((total, unit) => total + (unit.rent_amount || 0), 0))}
              </Typography>
              <Typography variant="body1">
                <strong>Annual Rent Revenue:</strong> {formatCurrency(units.reduce((total, unit) => total + (unit.rent_amount || 0), 0) * 12)}
              </Typography>
            </CardContent>
          </Card>
          
          <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
          
          <Typography variant="body1" color="text.secondary">No transactions found for this property</Typography>
        </TabPanel>

        {/* Maintenance Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Maintenance Requests</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleMaintenanceDialogOpen}
            >
              Add Request
            </Button>
          </Box>
          
          {maintenanceRequests.length > 0 ? (
            <Grid container spacing={2}>
              {maintenanceRequests.map(request => (
                <Grid item xs={12} sm={6} key={request.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6">{request.title}</Typography>
                        <Chip 
                          label={request.status.replace('_', ' ')} 
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" gutterBottom>
                        Unit: {request.unit_number || 'N/A'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        {request.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Chip 
                          label={request.priority} 
                          color={getPriorityColor(request.priority)}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          Reported: {new Date(request.reported_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary">No maintenance requests found for this property</Typography>
          )}
        </TabPanel>

        {/* Photos Tab */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Photos</Typography>
            <Button 
              variant="contained" 
              startIcon={photoEditMode ? null : <EditIcon />}
              onClick={() => setPhotoEditMode(!photoEditMode)}
            >
              {photoEditMode ? 'Done Editing' : 'Edit Photos'}
            </Button>
          </Box>
          
          {photoEditMode ? (
            <PhotoUpload 
              entityType="property"
              entityId={property.id}
              photos={property.photos || []}
              onPhotosChange={handlePhotosChange}
              maxPhotos={10}
              allowMainPhoto={true}
            />
          ) : (
            property.photos && property.photos.length > 0 ? (
              <Grid container spacing={2}>
                {property.photos.map((photo, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper 
                      elevation={3}
                      sx={{ 
                        position: 'relative',
                        height: 200,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.9 }
                      }}
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <Box
                        component="img"
                        src={photo.url}
                        alt={photo.name || `Photo ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      {photo.is_main && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          Main Photo
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PhotoIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No photos available for this property
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setPhotoEditMode(true)}
                  sx={{ mt: 2 }}
                >
                  Add Photos
                </Button>
              </Box>
            )
          )}
        </TabPanel>
      </Box>

      {/* Maintenance Request Dialog */}
      <Dialog open={maintenanceDialog} onClose={handleMaintenanceDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>New Maintenance Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            fullWidth
            variant="outlined"
            value={maintenanceForm.title}
            onChange={handleMaintenanceFormChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            variant="outlined"
            value={maintenanceForm.description}
            onChange={handleMaintenanceFormChange}
            required
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                margin="dense"
                name="priority"
                label="Priority"
                fullWidth
                variant="outlined"
                value={maintenanceForm.priority}
                onChange={handleMaintenanceFormChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                margin="dense"
                name="unit_id"
                label="Unit"
                fullWidth
                variant="outlined"
                value={maintenanceForm.unit_id}
                onChange={handleMaintenanceFormChange}
                required
              >
                {units.map(unit => (
                  <MenuItem key={unit.id} value={unit.id}>
                    Unit #{unit.unit_number}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMaintenanceDialogClose}>Cancel</Button>
          <Button onClick={handleMaintenanceSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Photo Dialog */}
      <Dialog open={photoDialog} onClose={handlePhotoDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPhoto?.name || 'Property Photo'}
          {selectedPhoto?.is_main && (
            <Chip 
              label="Main Photo" 
              color="primary" 
              size="small" 
              sx={{ ml: 1 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedPhoto && (
            <Box sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src={selectedPhoto.url}
                alt={selectedPhoto.name || 'Property Photo'}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedPhoto.name || 'Unnamed photo'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedPhoto && !selectedPhoto.is_main && (
            <Button 
              onClick={() => {
                // Create updated photos array with this photo as main
                const updatedPhotos = property.photos.map(photo => ({
                  ...photo,
                  is_main: photo.id === selectedPhoto.id
                }));
                
                handlePhotosChange(updatedPhotos);
                handlePhotoDialogClose();
              }}
              startIcon={<StarIcon />}
              color="primary"
            >
              Set as Main Photo
            </Button>
          )}
          <Button 
            onClick={() => {
              // Create updated photos array without this photo
              if (selectedPhoto) {
                const updatedPhotos = property.photos.filter(photo => photo.id !== selectedPhoto.id);
                
                // If we deleted the main photo and have other photos, make the first one main
                if (selectedPhoto.is_main && updatedPhotos.length > 0) {
                  updatedPhotos[0].is_main = true;
                }
                
                handlePhotosChange(updatedPhotos);
              }
              handlePhotoDialogClose();
            }}
            color="error"
          >
            Delete
          </Button>
          <Button onClick={handlePhotoDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PropertyView;
