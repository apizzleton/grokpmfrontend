import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem, Pagination, Container, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchFilterSort from '../components/SearchFilterSort';
import BoardMemberCard from '../components/BoardMemberCard';

const PeopleBoardMembers = () => {
  const { state, dispatch, fetchData, modifyData } = useApp();
  const { boardMembers = [], associations = [] } = state;
  const [open, setOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', association_id: '', role: '' });
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const itemsPerPage = 5;

  useEffect(() => {
    loadBoardMembers();
    loadAssociations();
  }, []);

  const loadBoardMembers = async () => {
    const data = await fetchData('board-members');
    if (data) {
      dispatch({ type: 'SET_DATA', payload: { boardMembers: data } });
    }
  };

  const loadAssociations = async () => {
    const data = await fetchData('associations');
    if (data) {
      dispatch({ type: 'SET_DATA', payload: { associations: data } });
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
    setSearchTerm(e.target.value.toLowerCase());
    setPage(1);
  };

  const filteredBoardMembers = boardMembers.filter(member =>
    (member.name?.toLowerCase().includes(searchTerm) ||
     member.email?.toLowerCase().includes(searchTerm))
  );

  const sortedBoardMembers = filteredBoardMembers.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'email') {
      return a.email.localeCompare(b.email);
    } else if (sortBy === 'role') {
      return a.role.localeCompare(b.role);
    }
  });

  const paginatedBoardMembers = sortedBoardMembers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">Board Members</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleClickOpen()}
        >
          Add Board Member
        </Button>
      </Box>

      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        filterValue={filter}
        onFilterChange={(e) => setFilter(e.target.value)}
        filterOptions={[
          { value: 'all', label: 'All Members' },
          { value: 'president', label: 'President' },
          { value: 'treasurer', label: 'Treasurer' },
          { value: 'secretary', label: 'Secretary' }
        ]}
        filterLabel="Role"
        sortBy={sortBy}
        onSortChange={(e) => setSortBy(e.target.value)}
        sortOptions={[
          { value: 'name', label: 'Name' },
          { value: 'email', label: 'Email' },
          { value: 'role', label: 'Role' }
        ]}
        sortLabel="Sort By"
        searchPlaceholder="Search board members..."
      />

      {boardMembers.length > 0 ? (
        <Grid container spacing={2}>
          {paginatedBoardMembers.map((member) => (
            member && member.id ? (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <BoardMemberCard
                  member={member}
                  handleEdit={() => handleClickOpen(member)}
                  handleDelete={() => handleDelete(member.id)}
                />
              </Grid>
            ) : null
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" component="p">
          No board members found.
        </Typography>
      )}

      {sortedBoardMembers.length > itemsPerPage && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={Math.ceil(sortedBoardMembers.length / itemsPerPage)}
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
    </Container>
  );
};

export default PeopleBoardMembers;