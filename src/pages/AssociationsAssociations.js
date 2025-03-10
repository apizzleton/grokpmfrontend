import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem, Pagination } from '@mui/material';

const AssociationsAssociations = () => {
  const [associations, setAssociations] = useState([]);
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
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 5;

  const { fetchData, modifyData } = useApp();

  useEffect(() => {
    loadAssociations();
  }, []);

  const loadAssociations = async () => {
    const data = await fetchData('associations');
    if (data) {
      setAssociations(data);
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
    setSearchQuery(e.target.value.toLowerCase());
    setPage(1);
  };

  const filteredAssociations = associations.filter(association =>
    (association.name?.toLowerCase().includes(searchQuery) ||
     association.contact_info?.toLowerCase().includes(searchQuery))
  );

  const paginatedAssociations = filteredAssociations.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <h2>Associations</h2>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label="Search Associations"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          onClick={() => handleClickOpen()}
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
                <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2, borderRadius: 4, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                  <p>Name: {association.name || 'N/A'}</p>
                  <p>Contact: {association.contact_info || 'N/A'}</p>
                  <p>Fee: ${association.fee || '0'}</p>
                  <p>Due Date: {new Date(association.due_date).toLocaleDateString()}</p>
                  <Box sx={{ mt: 1 }}>
                    <Button sx={{ mr: 1, backgroundColor: '#4a90e2', color: 'white', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen(association)}>Edit</Button>
                    <Button sx={{ backgroundColor: '#e74c3c', color: 'white', '&:hover': { backgroundColor: '#c0392b' } }} onClick={() => handleDelete(association.id)}>Delete</Button>
                  </Box>
                </Box>
              </Grid>
            ) : null
          ))}
        </Grid>
      ) : (
        <p>No associations found.</p>
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
    </Box>
  );
};

export default AssociationsAssociations;