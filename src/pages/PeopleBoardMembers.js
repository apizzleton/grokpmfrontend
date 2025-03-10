import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem, Pagination } from '@mui/material';

const PeopleBoardMembers = () => {
  const { fetchData, modifyData } = useApp();
  const [boardMembers, setBoardMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', association_id: '', role: '' });
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    loadBoardMembers();
  }, []);

  const loadBoardMembers = async () => {
    const data = await fetchData('board-members');
    if (data) {
      setBoardMembers(data);
    }
  };

  const handleClickOpen = (member = null) => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        association_id: member.association_id || '',
        role: member.role || ''
      });
      setEditMember(member);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        association_id: '',
        role: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMember(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      association_id: '',
      role: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    const method = editMember ? 'PUT' : 'POST';
    const endpoint = `board-members${editMember ? `/${editMember.id}` : ''}`;
    const success = await modifyData(method, endpoint, formData);
    if (success) {
      loadBoardMembers();
      handleClose();
    }
  };

  const handleDelete = async (id) => {
    const success = await modifyData('DELETE', `board-members/${id}`);
    if (success) {
      loadBoardMembers();
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
    setPage(1);
  };

  const filteredBoardMembers = boardMembers.filter(member =>
    (member.name?.toLowerCase().includes(searchQuery) ||
     member.email?.toLowerCase().includes(searchQuery))
  );

  const paginatedBoardMembers = filteredBoardMembers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <h2>Board Members</h2>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label="Search Board Members"
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
          Add Board Member
        </Button>
      </Box>

      {boardMembers.length > 0 ? (
        <Grid container spacing={2}>
          {paginatedBoardMembers.map((member) => (
            member && member.id ? (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2, borderRadius: 4, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                  <p>Name: {member.name || 'N/A'}</p>
                  <p>Email: {member.email || 'N/A'}</p>
                  <p>Phone: {member.phone || 'N/A'}</p>
                  <p>Role: {member.role || 'N/A'}</p>
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
        <p>No board members found.</p>
      )}

      {filteredBoardMembers.length > itemsPerPage && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={Math.ceil(filteredBoardMembers.length / itemsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMember ? 'Edit Board Member' : 'Add Board Member'}</DialogTitle>
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
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            name="association_id"
            label="Association ID"
            value={formData.association_id}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            name="role"
            label="Role"
            value={formData.role}
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

export default PeopleBoardMembers;