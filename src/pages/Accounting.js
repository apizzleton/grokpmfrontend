import React, { useContext, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem } from '@mui/material';
import { AppContext } from '../context/AppContext';
import Pagination from '@mui/material/Pagination';

const Accounting = () => {
  const { state, dispatch } = useContext(AppContext);
  const { payments, tenants, searchQuery } = state;
  const [open, setOpen] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [formData, setFormData] = useState({ amount: '', payment_date: '', status: '', tenant_id: '' });
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const safePayments = Array.isArray(payments) ? [...payments] : [];
  const safeTenants = Array.isArray(tenants) ? [...tenants].sort((a, b) => a.name.localeCompare(b.name)) : [];
  console.log('Payments in Accounting:', safePayments);
  console.log('Tenants for dropdown:', safeTenants);

  const handleClickOpen = (payment = null) => {
    setEditPayment(payment);
    setFormData(payment || { amount: '', payment_date: '', status: '', tenant_id: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditPayment(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const method = editPayment ? 'PUT' : 'POST';
      const url = `https://grokpm-backend.onrender.com/payments${editPayment ? `/${editPayment.id}` : ''}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to save payment');
      const data = await response.json();
      dispatch({ type: 'SET_DATA', payload: { payments: editPayment ? safePayments.map(p => p.id === data.id ? data : p) : [...safePayments, data] } });
      handleClose();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        const response = await fetch(`https://grokpm-backend.onrender.com/payments/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete payment');
        dispatch({ type: 'SET_DATA', payload: { payments: safePayments.filter(p => p.id !== id) } });
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const filteredPayments = safePayments.filter(payment =>
    (payment.amount?.toString().includes(searchQuery) ||
     payment.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     payment.payment_date?.includes(searchQuery))
  );

  const paginatedPayments = filteredPayments.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <h2>Accounting</h2>
      {safePayments.length > 0 ? (
        <Grid container spacing={2}>
          {paginatedPayments.map((payment, index) => (
            payment && payment.id ? (
              <Grid item xs={12} sm={6} md={4} key={payment.id || `payment-${index}`}>
                <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2, borderRadius: 4, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                  <p>Amount: ${payment.amount || 0} - Date: {payment.payment_date || 'N/A'}</p>
                  <p>Status: {payment.status || 'N/A'} - Tenant: {safeTenants.find(t => t.id === payment.tenant_id)?.name || 'N/A'}</p>
                  <Box sx={{ mt: 1 }}>
                    <Button sx={{ mr: 1, backgroundColor: '#4a90e2', color: 'white', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen(payment)}>Edit</Button>
                    <Button sx={{ backgroundColor: '#e74c3c', color: 'white', '&:hover': { backgroundColor: '#c0392b' } }} onClick={() => handleDelete(payment.id)}>Delete</Button>
                  </Box>
                </Box>
              </Grid>
            ) : null
          ))}
        </Grid>
      ) : (
        <p>No payments available.</p>
      )}
      <Pagination count={Math.ceil(filteredPayments.length / itemsPerPage)} page={page} onChange={(e, value) => setPage(value)} sx={{ mt: 2 }} />
      <Button variant="contained" sx={{ mt: 2, backgroundColor: '#4a90e2', '&:hover': { backgroundColor: '#357abd' } }} onClick={() => handleClickOpen()}>
        Add Payment
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editPayment ? 'Edit Payment' : 'Add Payment'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="amount" label="Amount" type="number" value={formData.amount} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="payment_date" label="Payment Date" value={formData.payment_date} onChange={handleChange} fullWidth />
          <TextField margin="dense" name="status" label="Status" value={formData.status} onChange={handleChange} fullWidth />
          <TextField
            select
            margin="dense"
            name="tenant_id"
            label="Tenant"
            value={formData.tenant_id}
            onChange={handleChange}
            fullWidth
          >
            {safeTenants.map((tenant) => (
              <MenuItem key={tenant.id} value={tenant.id}>{tenant.name}</MenuItem>
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

export default Accounting;