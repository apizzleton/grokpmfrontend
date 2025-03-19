import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import AppContext from '../context/AppContext';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { API_ENDPOINT } from '../config/api';

function Maintenance() {
  const { state, dispatch } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRequest, setCurrentRequest] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    property_id: '',
    unit_id: '',
    reported_by: '',
    assigned_to: '',
    due_date: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [localProperties, setLocalProperties] = useState([]);
  const [localUnits, setLocalUnits] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  // Get properties and units from context or local state
  const properties = state.properties?.length > 0 ? state.properties : localProperties;
  const units = state.units?.length > 0 ? state.units : localUnits;

  // Load properties and units
  useEffect(() => {
    const loadPropertiesAndUnits = async () => {
      setPropertiesLoading(true);
      try {
        // Load properties
        const propertiesResponse = await axios.get(`${API_ENDPOINT}/properties`);
        if (propertiesResponse.data) {
          setLocalProperties(propertiesResponse.data);
          dispatch({ type: 'SET_PROPERTIES', payload: propertiesResponse.data });
        }
        
        // Load units
        const unitsResponse = await axios.get(`${API_ENDPOINT}/units`);
        if (unitsResponse.data) {
          setLocalUnits(unitsResponse.data);
          dispatch({ type: 'SET_DATA', payload: { units: unitsResponse.data } });
        }
      } catch (error) {
        console.error('Error loading properties or units:', error);
        enqueueSnackbar('Failed to load properties or units', { variant: 'error' });
      } finally {
        setPropertiesLoading(false);
      }
    };
    
    loadPropertiesAndUnits();
  }, [dispatch, enqueueSnackbar]);

  // Load maintenance requests
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Direct axios call to avoid context issues
        const response = await axios.get(`${API_ENDPOINT}/maintenance`);
        setMaintenanceRequests(response.data || []);
      } catch (error) {
        console.error('Error loading maintenance data:', error);
        enqueueSnackbar('Maintenance data temporarily unavailable. Using demo data instead.', { 
          variant: 'warning',
          autoHideDuration: 5000
        });
        
        // Use demo data when the API fails
        const demoData = [
          {
            id: 1,
            title: 'Leaking Faucet',
            description: 'Kitchen sink faucet is leaking and needs repair',
            priority: 'medium',
            status: 'open',
            property_id: properties.length > 0 ? properties[0].id : null,
            unit_id: units.length > 0 ? units[0].id : null,
            reported_by: 'John Tenant',
            assigned_to: 'Maintenance Staff',
            due_date: new Date().toISOString().split('T')[0]
          },
          {
            id: 2,
            title: 'Broken Window',
            description: 'Living room window is cracked and needs replacement',
            priority: 'high',
            status: 'in_progress',
            property_id: properties.length > 0 ? properties[0].id : null,
            unit_id: units.length > 0 ? units[0].id : null,
            reported_by: 'Jane Tenant',
            assigned_to: 'Window Specialist',
            due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0]
          }
        ];
        setMaintenanceRequests(demoData);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [enqueueSnackbar, properties, units]);

  useEffect(() => {
    // Filter units based on selected property
    if (currentRequest.property_id) {
      const filtered = units.filter(unit => 
        unit.property_id === currentRequest.property_id
      );
      setFilteredUnits(filtered);
    }
  }, [currentRequest.property_id, units]);

  const handleOpenDialog = (request = null) => {
    if (request) {
      setCurrentRequest({
        ...request,
        due_date: request.due_date ? new Date(request.due_date).toISOString().split('T')[0] : ''
      });
      setEditMode(true);
    } else {
      setCurrentRequest({
        title: '',
        description: '',
        priority: 'medium',
        status: 'open',
        property_id: '',
        unit_id: '',
        reported_by: '',
        assigned_to: '',
        due_date: ''
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRequest(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        // Update existing maintenance request
        const response = await axios.put(`${API_ENDPOINT}/maintenance/${currentRequest.id}`, currentRequest);
        if (response.data) {
          setMaintenanceRequests(prev => 
            prev.map(req => req.id === response.data.id ? response.data : req)
          );
          enqueueSnackbar('Maintenance request updated successfully', { variant: 'success' });
        }
      } else {
        // Create new maintenance request
        try {
          const response = await axios.post(`${API_ENDPOINT}/maintenance`, currentRequest);
          if (response.data) {
            setMaintenanceRequests(prev => [...prev, response.data]);
            enqueueSnackbar('Maintenance request created successfully', { variant: 'success' });
          }
        } catch (error) {
          console.error('Error creating maintenance request:', error);
          // Create a local-only entry with a temporary ID
          const tempId = Date.now(); // Use timestamp as temporary ID
          const newRequest = {
            ...currentRequest,
            id: tempId
          };
          setMaintenanceRequests(prev => [...prev, newRequest]);
          enqueueSnackbar('Backend unavailable. Created request locally.', { variant: 'warning' });
        }
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving maintenance request:', error);
      enqueueSnackbar('Failed to save maintenance request', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      try {
        const response = await axios.delete(`${API_ENDPOINT}/maintenance/${id}`);
        if (response.data && response.data.success) {
          setMaintenanceRequests(prev => prev.filter(req => req.id !== id));
          enqueueSnackbar('Maintenance request deleted successfully', { variant: 'success' });
        }
      } catch (error) {
        console.error('Error deleting maintenance request:', error);
        // Still remove it from the UI even if the backend fails
        setMaintenanceRequests(prev => prev.filter(req => req.id !== id));
        enqueueSnackbar('Backend unavailable. Removed request from UI only.', { variant: 'warning' });
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <PendingIcon color="warning" />;
      case 'in_progress':
        return <BuildIcon color="info" />;
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'cancelled':
        return <CloseIcon color="error" />;
      default:
        return <ErrorIcon color="default" />;
    }
  };

  const getStatusText = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Maintenance Requests
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Request
        </Button>
      </Box>

      {loading || propertiesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reported By</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maintenanceRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No maintenance requests found</TableCell>
                  </TableRow>
                ) : (
                  maintenanceRequests
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((request) => {
                      const property = properties.find(p => p.id === request.property_id);
                      const unit = units.find(u => u.id === request.unit_id);
                      
                      return (
                        <TableRow key={request.id}>
                          <TableCell>{request.title}</TableCell>
                          <TableCell>{property ? property.name : 'Unknown'}</TableCell>
                          <TableCell>{unit ? unit.unit_number : 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} 
                              color={getPriorityColor(request.priority)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getStatusIcon(request.status)}
                              {getStatusText(request.status)}
                            </Box>
                          </TableCell>
                          <TableCell>{request.reported_by}</TableCell>
                          <TableCell>{request.assigned_to || 'Unassigned'}</TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleOpenDialog(request)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDelete(request.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={maintenanceRequests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Maintenance Request' : 'New Maintenance Request'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Title"
                value={currentRequest.title}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={currentRequest.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Property</InputLabel>
                <Select
                  name="property_id"
                  value={currentRequest.property_id}
                  onChange={handleInputChange}
                  label="Property"
                  required
                >
                  {properties.map(property => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  name="unit_id"
                  value={currentRequest.unit_id}
                  onChange={handleInputChange}
                  label="Unit"
                  disabled={!currentRequest.property_id}
                >
                  <MenuItem value="">None</MenuItem>
                  {filteredUnits.map(unit => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.unit_number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={currentRequest.priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={currentRequest.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="reported_by"
                label="Reported By"
                value={currentRequest.reported_by}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="assigned_to"
                label="Assigned To"
                value={currentRequest.assigned_to}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="due_date"
                label="Due Date"
                type="date"
                value={currentRequest.due_date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!currentRequest.title || !currentRequest.property_id}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Maintenance;
