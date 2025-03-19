import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
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
  CircularProgress,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AppContext from '../context/AppContext';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import axios from 'axios';
import { API_ENDPOINT } from '../config/api';

const Transactions = () => {
  const { state, fetchData, modifyData } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [localProperties, setLocalProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState({
    date: new Date(),
    description: '',
    amount: '',
    accountId: '',
    propertyId: ''
  });

  // Get properties from context or local state
  const availableProperties = state.properties?.length > 0 ? state.properties : localProperties;

  // Load properties directly using axios
  useEffect(() => {
    const loadProperties = async () => {
      setPropertiesLoading(true);
      try {
        const response = await axios.get(`${API_ENDPOINT}/properties`);
        if (response.data) {
          setLocalProperties(response.data);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        enqueueSnackbar('Failed to load properties', { variant: 'error' });
      } finally {
        setPropertiesLoading(false);
      }
    };
    
    loadProperties();
  }, [enqueueSnackbar]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch transactions, accounts, account types, and properties
        const transactionsData = await fetchData('transactions');
        const accountsData = await fetchData('accounts');
        const accountTypesData = await fetchData('account-types');
        const propertiesData = await fetchData('properties');
        
        setTransactions(transactionsData || []);
        setAccounts(accountsData || []);
        setAccountTypes(accountTypesData || []);
        setProperties(propertiesData || []);
      } catch (error) {
        console.error('Error loading transaction data:', error);
        enqueueSnackbar('Failed to load transaction data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchData, enqueueSnackbar]);

  const handleOpenDialog = (transaction = null) => {
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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setCurrentTransaction(prev => ({ ...prev, date }));
  };

  const handleSubmit = async () => {
    try {
      const transactionData = {
        ...currentTransaction,
        amount: parseFloat(currentTransaction.amount)
      };

      if (editMode) {
        // Update existing transaction
        const updatedTransaction = await modifyData('put', `transactions/${currentTransaction.id}`, transactionData);
        if (updatedTransaction) {
          setTransactions(prev => 
            prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
          );
          enqueueSnackbar('Transaction updated successfully', { variant: 'success' });
        }
      } else {
        // Create new transaction
        const newTransaction = await modifyData('post', 'transactions', transactionData);
        if (newTransaction) {
          setTransactions(prev => [...prev, newTransaction]);
          enqueueSnackbar('Transaction created successfully', { variant: 'success' });
        }
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving transaction:', error);
      enqueueSnackbar('Failed to save transaction', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const success = await modifyData('delete', `transactions/${id}`);
        if (success) {
          setTransactions(prev => prev.filter(t => t.id !== id));
          enqueueSnackbar('Transaction deleted successfully', { variant: 'success' });
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        enqueueSnackbar('Failed to delete transaction', { variant: 'error' });
      }
    }
  };

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
    const property = availableProperties.find(p => p.id === propertyId);
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Transaction List</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Transaction
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Account Type</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(new Date(transaction.date), 'MM/dd/yyyy')}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>${parseFloat(transaction.amount).toFixed(2)}</TableCell>
                    <TableCell>{getAccountName(transaction.accountId)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getAccountTypeName(transaction.accountId)} 
                        color={getAccountTypeColor(transaction.accountId)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getPropertyName(transaction.propertyId)}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleOpenDialog(transaction)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No transactions found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Transaction' : 'New Transaction'}
        </DialogTitle>
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
                fullWidth
                value={currentTransaction.description}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="amount"
                label="Amount"
                fullWidth
                type="number"
                value={currentTransaction.amount}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: <span>$</span>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Account</InputLabel>
                <Select
                  name="accountId"
                  value={currentTransaction.accountId}
                  onChange={handleInputChange}
                  label="Account"
                  required
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.name} ({getAccountTypeName(account.id)})
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
                  onChange={handleInputChange}
                  label="Property"
                  required
                >
                  {availableProperties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.address}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={
              !currentTransaction.description || 
              !currentTransaction.amount || 
              !currentTransaction.accountId || 
              !currentTransaction.propertyId
            }
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions;
