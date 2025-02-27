import React, { useContext, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem } from '@mui/material';
import { AppContext } from '../context/AppContext';
import Pagination from '@mui/material/Pagination';

const PeopleBoardMembers = () => {
  const { state, dispatch } = useContext(AppContext);
  const { boardMembers, associations, searchQuery } = state;
  const [open, setOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', association_id: '' });
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const safeBoardMembers = Array.isArray(boardMembers) ? [...boardMembers] : [];
  const safeAssociations = Array.isArray(associations) ? [...associations].sort((a, b) => a.name.localeCompare(b.name)) : [];
  console.log('Board Members in PeopleBoardMembers:', safeBoardMembers);
  console.log('Associations for dropdown:', safeAssociations);

  const handleClickOpen = (member = null) => {
    setEditMember(member);
    setFormData(member || { name: '', email: '', phone: '', association_id: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMember(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const method = editMember ? 'PUT' : 'POST';
      const url = `https://grokpm-backend.onrender.com/board-members${editMember ? `/${editMember.id}` : ''}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to save board member');
      const data = await response.json();
      dispatch({ type: 'SET_DATA', payload: { boardMembers: editMember ? safeBoardMembers.map(m => m.id === data.id ? data : m) : [...safeBoardMembers, data] } });
      handleClose();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this board member?')) {
      try {
        const response = await fetch(`https://grokpm-backend.onrender.com/board-members/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete board member');
        dispatch({ type: 'SET_DATA', payload: { boardMembers: safeBoardMembers.filter(m => m.id !== id) } });
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const filteredBoardMembers = safeBoardMembers.filter(member =>
    (member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     member.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedBoardMembers = filteredBoardMembers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <h2>Board Members</h2>
      {safeBoardMembers.length > 0 ? (
        <Grid container spacing={2}>
          {paginatedBoardMembers.map((member, index) => (
            member && member.id ? (
              <Grid item xs={12} sm={6} md={4} key={member.id || `member-${index}`}>
                <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2, borderRadius: 4, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                  <p>Name: {member.name || 'N/A'} - Email: {member.email || 'N/A'}</p>
                  <p>Phone: {member.phone || 'N/A'} - Association: {safeAssociations.find(a => a.id === member.association_id)?.name || 'N/A'}</p>
                  <Box sx={{ mt: 1 }}>
                    <Button sx={{ mr: 1, backgroundColor: '#4a90e2', color: 'white', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen(member)}>Edit</Button>
                    <Button sx={{ backgroundColor: '#e74c3c', color: 'white', '&:hover': { backgroundColor: '#c0392b' } }} onClick={() => handleDelete(member.id)}>Delete</Button>
                  </Box>
                </Box>
              </Grid>
            ) : null
          ))}
        </Grid>
      ) : (
        <p>No board members available.</p>
      )}
      <Pagination count={Math.ceil(filteredBoardMembers.length / itemsPerPage)} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
      <Button variant="contained" sx={{ mt: 2, backgroundColor: '#4a90e2', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen()}>
        Add Board Member
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMember ? 'Edit Board Member' : 'Add Board Member'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="name" label="Name" value={formData.name} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="email" label="Email" value={formData.email} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="phone" label="Phone" value={formData.phone} onChange={handleChange} fullWidth />
          <TextField
            select
            margin="dense"
            name="association_id"
            label="Association"
            value={formData.association_id}
            onChange={handleChange}
            fullWidth
          >
            {safeAssociations.map((assoc) => (
              <MenuItem key={assoc.id} value={assoc.id}>{assoc.name}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: '#757575' }}>Cancel</Button>
          <Button onClick={handleSave} sx={{ backgroundColor: '#4a90e2', color: 'white', '&:hover': { backgroundColor: '#357abd' } }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PeopleBoardMembers;