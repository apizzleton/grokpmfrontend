import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem, Pagination, Container, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchFilterSort from '../components/SearchFilterSort';
import AssociationCard from '../components/AssociationCard';

const AssociationsAssociations = () => {
  const { state, dispatch, fetchData, modifyData } = useApp();
  const { associations = [], properties = [] } = state;
  const [open, setOpen] = useState(false);
  const [editAssociation, setEditAssociation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_info: '',
    fee: '',
    due_date: '',
    property_id: ''
  });
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const itemsPerPage = 5;

  useEffect(() => {
    loadAssociations();
    loadProperties();
  }, []);

  const loadAssociations = async () => {
    const data = await fetchData('associations');
    if (data) {
      dispatch({ type: 'SET_DATA', payload: { associations: data } });
    }
  };

  const loadProperties = async () => {
    const data = await fetchData('properties');
    if (data) {
      dispatch({ type: 'SET_DATA', payload: { properties: data } });
    }
  };

  const handleClickOpen = (association = null) => {
    if (association) {
      setFormData({
        name: association.name || '',
        contact_info: association.contact_info || '',
        fee: association.fee || '',
        due_date: association.due_date || '',
        property_id: association.property_id || ''
      });
      setEditAssociation(association);
    } else {
      setFormData({
        name: '',
        contact_info: '',
        fee: '',
        due_date: '',
        property_id: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditAssociation(null);
    setFormData({
      name: '',
      contact_info: '',
      fee: '',
      due_date: '',
      property_id: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    const method = editAssociation ? 'PUT' : 'POST';
    const endpoint = `associations${editAssociation ? `/${editAssociation.id}` : ''}`;
    const success = await modifyData(method, endpoint, formData);
    if (success) {
      loadAssociations();
      handleClose();
    }
  };

  const handleDelete = async (id) => {
    const success = await modifyData('DELETE', `associations/${id}`);
    if (success) {
      loadAssociations();
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setPage(1);
  };

  const filteredAssociations = associations.filter(association =>
    (association.name?.toLowerCase().includes(searchTerm) ||
     association.contact_info?.toLowerCase().includes(searchTerm))
  );

  const sortedAssociations = filteredAssociations.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'fee') {
      return a.fee - b.fee;
    } else {
      return 0;
    }
  });

  const paginatedAssociations = sortedAssociations.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="lg">
      <Typography variant="h2" sx={{ mb: 3 }}>Associations</Typography>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SearchFilterSort
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          filterValue={filter}
          onFilterChange={(e) => setFilter(e.target.value)}
          filterOptions={[
            { value: 'all', label: 'All Associations' },
            { value: 'high_fee', label: 'High Fee (>$500)' },
            { value: 'low_fee', label: 'Low Fee (<=$500)' }
          ]}
          filterLabel="Fee Range"
          sortBy={sortBy}
          onSortChange={(e) => setSortBy(e.target.value)}
          sortOptions={[
            { value: 'name', label: 'Name' },
            { value: 'fee', label: 'Fee Amount' }
          ]}
          sortLabel="Sort By"
          searchPlaceholder="Search associations..."
        />
        <Button
          variant="contained"
          onClick={() => handleClickOpen()}
          startIcon={<AddIcon />}
          sx={{ backgroundColor: '#4a90e2', '&:hover': { backgroundColor: '#357abd' } }}
        >
          Add Association
        </Button>
      </Box>

      {associations.length > 0 ? (
        <Grid container spacing={2}>
          {paginatedAssociations.map((association, index) => (
            association && association.id ? (
              <Grid item xs={12} sm={6} md={4} key={association.id}>
                <AssociationCard
                  association={association}
                  handleEdit={() => handleClickOpen(association)}
                  handleDelete={() => handleDelete(association.id)}
                />
              </Grid>
            ) : null
          ))}
        </Grid>
      ) : (
        <Typography variant="body1">No associations found.</Typography>
      )}

      {filteredAssociations.length > itemsPerPage && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={Math.ceil(filteredAssociations.length / itemsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editAssociation ? 'Edit Association' : 'Add Association'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            name="contact_info"
            label="Contact Information"
            value={formData.contact_info}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            name="fee"
            label="Fee"
            type="number"
            value={formData.fee}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            name="due_date"
            label="Due Date"
            type="date"
            value={formData.due_date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            name="property_id"
            label="Property ID"
            value={formData.property_id}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssociationsAssociations;