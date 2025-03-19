import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import axios from 'axios';
import { API_URL } from '../../config/api';

const GeneralLedgerReport = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState({
    date: new Date(),
    description: '',
    amount: '',
    accountId: '',
    propertyId: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from backend
        const accountsResponse = await axios.get(`${API_URL}/accounts`);
        const accountTypesResponse = await axios.get(`${API_URL}/account-types`);
        const transactionsResponse = await axios.get(`${API_URL}/transactions`);
        const propertiesResponse = await axios.get(`${API_URL}/properties`);
        
        setAccounts(accountsResponse.data || []);
        setAccountTypes(accountTypesResponse.data || []);
        setTransactions(transactionsResponse.data || []);
        setProperties(propertiesResponse.data || []);
      } catch (error) {
        console.error('Error loading general ledger data:', error);
        enqueueSnackbar('Failed to load general ledger data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [enqueueSnackbar]);

  // Transaction Dialog Handlers
  const handleOpenTransactionDialog = (transaction = null) => {
    if (transaction) {
      setCurrentTransaction({
        ...transaction,
        date: new Date(transaction.date)
      });
      setEditMode(true);
    } else {
      setCurrentTransaction({
        date: new Date(),
        description: '',
        amount: '',
        accountId: '',
        propertyId: ''
      });
      setEditMode(false);
    }
    setOpenTransactionDialog(true);
  };

  const handleCloseTransactionDialog = () => {
    setOpenTransactionDialog(false);
  };

  const handleTransactionInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setCurrentTransaction(prev => ({ ...prev, date }));
  };

  const handleTransactionSubmit = async () => {
    try {
      const transactionData = {
        ...currentTransaction,
        amount: parseFloat(currentTransaction.amount)
      };

      if (editMode) {
        // Update existing transaction
        const response = await axios.put(`${API_URL}/transactions/${currentTransaction.id}`, transactionData);
        if (response.data) {
          setTransactions(prev => 
            prev.map(t => t.id === response.data.id ? response.data : t)
          );
          enqueueSnackbar('Transaction updated successfully', { variant: 'success' });
        }
      } else {
        // Create new transaction
        const response = await axios.post(`${API_URL}/transactions`, transactionData);
        if (response.data) {
          setTransactions(prev => [...prev, response.data]);
          enqueueSnackbar('Transaction created successfully', { variant: 'success' });
        }
      }
      handleCloseTransactionDialog();
    } catch (error) {
      console.error('Error saving transaction:', error);
      enqueueSnackbar('Failed to save transaction', { variant: 'error' });
    }
  };

  const handleTransactionDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await axios.delete(`${API_URL}/transactions/${id}`);
        if (response.data.success) {
          setTransactions(prev => prev.filter(t => t.id !== id));
          enqueueSnackbar('Transaction deleted successfully', { variant: 'success' });
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        enqueueSnackbar('Failed to delete transaction', { variant: 'error' });
      }
    }
  };

  // Helper Functions
  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Unknown';
  };

  const getAccountTypeName = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return 'Unknown';
    
    const accountType = accountTypes.find(at => at.id === account.accountTypeId);
    return accountType ? accountType.name : 'Unknown';
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.address : 'Unknown';
  };

  const getAccountTypeColor = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return 'default';
    
    const accountType = accountTypes.find(at => at.id === account.accountTypeId);
    if (!accountType) return 'default';
    
    switch (accountType.name) {
      case 'Income':
        return 'success';
      case 'Expense':
        return 'error';
      case 'Asset':
        return 'primary';
      case 'Liability':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        General Ledger Report
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Transactions</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenTransactionDialog()}
          >
            Add Transaction
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Account Type</TableCell>
                <TableCell>Property</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No transactions found</TableCell>
                </TableRow>
              ) : (
                transactions
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(new Date(transaction.date), 'MM/dd/yyyy')}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{getAccountName(transaction.accountId)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getAccountTypeName(transaction.accountId)} 
                          color={getAccountTypeColor(transaction.accountId)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{getPropertyName(transaction.propertyId)}</TableCell>
                      <TableCell align="right">${parseFloat(transaction.amount).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenTransactionDialog(transaction)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleTransactionDelete(transaction.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Transaction Dialog */}
      <Dialog open={openTransactionDialog} onClose={handleCloseTransactionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={currentTransaction.date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={currentTransaction.description}
                onChange={handleTransactionInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Account</InputLabel>
                <Select
                  name="accountId"
                  value={currentTransaction.accountId}
                  onChange={handleTransactionInputChange}
                  label="Account"
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Property</InputLabel>
                <Select
                  name="propertyId"
                  value={currentTransaction.propertyId}
                  onChange={handleTransactionInputChange}
                  label="Property"
                >
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.address}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="amount"
                label="Amount"
                type="number"
                value={currentTransaction.amount}
                onChange={handleTransactionInputChange}
                fullWidth
                InputProps={{
                  startAdornment: <span>$</span>
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionDialog}>Cancel</Button>
          <Button onClick={handleTransactionSubmit} variant="contained">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GeneralLedgerReport;
