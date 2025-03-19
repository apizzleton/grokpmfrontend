import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Portfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentPortfolio, setCurrentPortfolio] = useState(null);
  
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioDescription, setNewPortfolioDescription] = useState('');
  const [selectedProperties, setSelectedProperties] = useState([]);
  
  // Fetch portfolios and properties on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all portfolios
        const portfoliosResponse = await axios.get('/api/portfolios');
        setPortfolios(portfoliosResponse.data);
        
        // Fetch all properties
        const propertiesResponse = await axios.get('/api/properties');
        setProperties(propertiesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load portfolios and properties');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle creating a new portfolio
  const handleCreatePortfolio = async () => {
    try {
      if (!newPortfolioName.trim()) {
        setError('Portfolio name is required');
        return;
      }
      
      const response = await axios.post('/api/portfolios', {
        name: newPortfolioName,
        description: newPortfolioDescription,
        user_id: 1, // Default user ID
        property_ids: selectedProperties
      });
      
      setPortfolios([...portfolios, response.data]);
      setSuccess('Portfolio created successfully');
      
      // Reset form
      setNewPortfolioName('');
      setNewPortfolioDescription('');
      setSelectedProperties([]);
      setOpenCreateDialog(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating portfolio:', err);
      setError('Failed to create portfolio');
    }
  };
  
  // Handle updating a portfolio
  const handleUpdatePortfolio = async () => {
    try {
      if (!currentPortfolio || !newPortfolioName.trim()) {
        setError('Portfolio name is required');
        return;
      }
      
      const response = await axios.put(`/api/portfolios/${currentPortfolio.id}`, {
        name: newPortfolioName,
        description: newPortfolioDescription,
        property_ids: selectedProperties
      });
      
      // Update portfolios list
      setPortfolios(portfolios.map(p => 
        p.id === currentPortfolio.id ? response.data : p
      ));
      
      setSuccess('Portfolio updated successfully');
      
      // Reset form
      setNewPortfolioName('');
      setNewPortfolioDescription('');
      setSelectedProperties([]);
      setCurrentPortfolio(null);
      setOpenEditDialog(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating portfolio:', err);
      setError('Failed to update portfolio');
    }
  };
  
  // Handle deleting a portfolio
  const handleDeletePortfolio = async (portfolioId) => {
    try {
      await axios.delete(`/api/portfolios/${portfolioId}`);
      
      // Update portfolios list
      setPortfolios(portfolios.filter(p => p.id !== portfolioId));
      setSuccess('Portfolio deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting portfolio:', err);
      setError('Failed to delete portfolio');
    }
  };
  
  // Open edit dialog with portfolio data
  const handleEditPortfolio = (portfolio) => {
    setCurrentPortfolio(portfolio);
    setNewPortfolioName(portfolio.name);
    setNewPortfolioDescription(portfolio.description || '');
    
    // Set selected properties
    const propertyIds = portfolio.Properties ? 
      portfolio.Properties.map(prop => prop.id) : [];
    setSelectedProperties(propertyIds);
    
    setOpenEditDialog(true);
  };
  
  // Clear form and error messages
  const handleCloseDialogs = () => {
    setNewPortfolioName('');
    setNewPortfolioDescription('');
    setSelectedProperties([]);
    setCurrentPortfolio(null);
    setError('');
    setOpenCreateDialog(false);
    setOpenEditDialog(false);
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Manage Portfolios</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Portfolio
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {portfolios.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No portfolios found. Create your first portfolio to organize your properties.
          </Typography>
        </Paper>
      ) : (
        <List component={Paper} elevation={2}>
          {portfolios.map((portfolio) => (
            <React.Fragment key={portfolio.id}>
              <ListItem>
                <ListItemText
                  primary={portfolio.name}
                  secondary={
                    <Box component="div">
                      <Typography variant="body2" color="textSecondary" component="span">
                        {portfolio.description || 'No description'}
                      </Typography>
                      <Box mt={1} component="div">
                        {portfolio.Properties && portfolio.Properties.length > 0 ? (
                          <Box display="flex" flexWrap="wrap" gap={0.5} component="div">
                            {portfolio.Properties.map(property => (
                              <Chip 
                                key={property.id} 
                                label={property.name} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary" component="span">
                            No properties in this portfolio
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleEditPortfolio(portfolio)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeletePortfolio(portfolio.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
      
      {/* Create Portfolio Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Portfolio</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Portfolio Name"
                fullWidth
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newPortfolioDescription}
                onChange={(e) => setNewPortfolioDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="properties-select-label">Properties</InputLabel>
                <Select
                  labelId="properties-select-label"
                  multiple
                  value={selectedProperties}
                  onChange={(e) => setSelectedProperties(e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }} component="span">
                      {selected.map((value) => {
                        const property = properties.find(p => p.id === value);
                        return (
                          <Chip 
                            key={value} 
                            label={property ? property.name : value} 
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleCreatePortfolio} color="primary" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Portfolio Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Portfolio</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Portfolio Name"
                fullWidth
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newPortfolioDescription}
                onChange={(e) => setNewPortfolioDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="properties-edit-select-label">Properties</InputLabel>
                <Select
                  labelId="properties-edit-select-label"
                  multiple
                  value={selectedProperties}
                  onChange={(e) => setSelectedProperties(e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }} component="span">
                      {selected.map((value) => {
                        const property = properties.find(p => p.id === value);
                        return (
                          <Chip 
                            key={value} 
                            label={property ? property.name : value} 
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleUpdatePortfolio} color="primary" variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Portfolio;
