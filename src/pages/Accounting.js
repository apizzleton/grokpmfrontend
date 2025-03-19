import React, { useState, useEffect, useContext } from 'react';
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
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import { 
  DatePicker 
} from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, ComposedChart
} from 'recharts';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AppContext from '../context/AppContext';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import axios from 'axios';
import { API_URL } from '../config/api';

const Accounting = () => {
  const { state } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [mainTabValue, setMainTabValue] = useState(0);
  const [accountTabValue, setAccountTabValue] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [period, setPeriod] = useState('monthly');
  const [chartType, setChartType] = useState('bar');
  const [currentAccount, setCurrentAccount] = useState({
    name: '',
    accountTypeId: ''
  });
  const [currentTransaction, setCurrentTransaction] = useState({
    date: new Date(),
    description: '',
    entries: [
      { id: Date.now(), accountId: '', amount: '', type: 'debit', propertyId: '', unitId: '' },
      { id: Date.now() + 1, accountId: '', amount: '', type: 'credit', propertyId: '', unitId: '' }
    ]
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setPropertiesLoading(true);
        setUnitsLoading(true);
        
        // Fetch data from backend
        const accountsResponse = await axios.get(`${API_URL}/accounts`);
        const accountTypesResponse = await axios.get(`${API_URL}/account-types`);
        const transactionsResponse = await axios.get(`${API_URL}/transactions`);
        const propertiesResponse = await axios.get(`${API_URL}/properties`);
        const unitsResponse = await axios.get(`${API_URL}/units`);
        
        setAccounts(accountsResponse.data || []);
        setAccountTypes(accountTypesResponse.data || []);
        setTransactions(transactionsResponse.data || []);
        setProperties(propertiesResponse.data || []);
        setUnits(unitsResponse.data || []);

        // Log for debugging
        console.log('Properties loaded:', propertiesResponse.data);
        console.log('Units loaded:', unitsResponse.data);
      } catch (error) {
        console.error('Error loading accounting data:', error);
        enqueueSnackbar('Failed to load accounting data', { variant: 'error' });
        
        // Set demo data if API fails
        setProperties([
          { id: 1, name: 'Demo Property 1' },
          { id: 2, name: 'Demo Property 2' }
        ]);
        setUnits([
          { id: 1, unit_number: '101', address_id: 1 },
          { id: 2, unit_number: '102', address_id: 1 }
        ]);
      } finally {
        setLoading(false);
        setPropertiesLoading(false);
        setUnitsLoading(false);
      }
    };
    
    loadData();
  }, [enqueueSnackbar]);

  const handleMainTabChange = (event, newValue) => {
    setMainTabValue(newValue);
  };

  const handleAccountTabChange = (event, newValue) => {
    setAccountTabValue(newValue);
  };

  // Account Dialog Handlers
  const handleOpenAccountDialog = (account = null) => {
    if (account) {
      setCurrentAccount({
        ...account
      });
      setEditMode(true);
    } else {
      setCurrentAccount({
        name: '',
        accountTypeId: ''
      });
      setEditMode(false);
    }
    setOpenAccountDialog(true);
  };

  const handleCloseAccountDialog = () => {
    setOpenAccountDialog(false);
  };

  const handleAccountInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAccount(prev => ({ ...prev, [name]: value }));
  };

  const handleAccountSubmit = async () => {
    try {
      if (editMode) {
        // Update existing account
        const response = await axios.put(`${API_URL}/accounts/${currentAccount.id}`, currentAccount);
        if (response.data) {
          setAccounts(prev => 
            prev.map(acc => acc.id === response.data.id ? response.data : acc)
          );
          enqueueSnackbar('Account updated successfully', { variant: 'success' });
        }
      } else {
        // Create new account
        const response = await axios.post(`${API_URL}/accounts`, currentAccount);
        if (response.data) {
          setAccounts(prev => [...prev, response.data]);
          enqueueSnackbar('Account created successfully', { variant: 'success' });
        }
      }
      handleCloseAccountDialog();
    } catch (error) {
      console.error('Error saving account:', error);
      enqueueSnackbar('Failed to save account', { variant: 'error' });
    }
  };

  const handleAccountDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        const response = await axios.delete(`${API_URL}/accounts/${id}`);
        if (response.data.success) {
          setAccounts(prev => prev.filter(acc => acc.id !== id));
          enqueueSnackbar('Account deleted successfully', { variant: 'success' });
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        enqueueSnackbar('Failed to delete account', { variant: 'error' });
      }
    }
  };

  // Transaction Dialog Handlers
  const handleOpenTransactionDialog = (transaction = null) => {
    if (transaction) {
      // Edit mode - need to convert existing transaction to new format
      // This is a simplified conversion assuming old format
      setCurrentTransaction({
        id: transaction.id,
        date: new Date(transaction.date),
        description: transaction.description,
        entries: [
          {
            id: Date.now(),
            accountId: transaction.accountId,
            amount: transaction.amount,
            type: 'debit',
            propertyId: transaction.propertyId,
            unitId: ''
          },
          {
            id: Date.now() + 1,
            accountId: '', // Will need to be selected by user
            amount: transaction.amount,
            type: 'credit',
            propertyId: transaction.propertyId,
            unitId: ''
          }
        ]
      });
      setEditMode(true);
    } else {
      // Create mode
      setCurrentTransaction({
        date: new Date(),
        description: '',
        entries: [
          { id: Date.now(), accountId: '', amount: '', type: 'debit', propertyId: '', unitId: '' },
          { id: Date.now() + 1, accountId: '', amount: '', type: 'credit', propertyId: '', unitId: '' }
        ]
      });
      setEditMode(false);
    }
    setOpenTransactionDialog(true);
  };

  const handleCloseTransactionDialog = () => {
    setOpenTransactionDialog(false);
    setEditMode(false);
  };

  const handleTransactionInputChange = (e, entryIndex = null) => {
    const { name, value } = e.target;
    
    if (entryIndex !== null) {
      // Update a specific entry in the entries array
      setCurrentTransaction(prev => {
        const updatedEntries = [...prev.entries];
        updatedEntries[entryIndex] = {
          ...updatedEntries[entryIndex],
          [name]: value
        };
        return { ...prev, entries: updatedEntries };
      });
    } else {
      // Update a top-level property
      setCurrentTransaction(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (newDate) => {
    setCurrentTransaction(prev => ({ ...prev, date: newDate }));
  };

  const addTransactionEntry = () => {
    setCurrentTransaction(prev => ({
      ...prev,
      entries: [
        ...prev.entries,
        { id: Date.now(), accountId: '', amount: '', type: 'debit', propertyId: '', unitId: '' }
      ]
    }));
  };

  const removeTransactionEntry = (entryIndex) => {
    setCurrentTransaction(prev => {
      const updatedEntries = prev.entries.filter((_, index) => index !== entryIndex);
      return { ...prev, entries: updatedEntries };
    });
  };

  const handleTransactionSubmit = async () => {
    try {
      // Validate that debits and credits balance
      const totalDebits = currentTransaction.entries
        .filter(entry => entry.type === 'debit')
        .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
      
      const totalCredits = currentTransaction.entries
        .filter(entry => entry.type === 'credit')
        .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
      
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        enqueueSnackbar('Debits and credits must be equal', { variant: 'error' });
        return;
      }

      // For now, we'll create multiple single transactions
      // In a real system, we'd create a transaction group
      for (const entry of currentTransaction.entries) {
        const transactionData = {
          date: format(currentTransaction.date, 'yyyy-MM-dd'),
          description: currentTransaction.description,
          amount: entry.amount,
          accountId: entry.accountId,
          propertyId: entry.propertyId,
          unitId: entry.unitId,
          type: entry.type
        };

        if (editMode && currentTransaction.id) {
          await axios.put(`${API_URL}/transactions/${currentTransaction.id}`, transactionData);
        } else {
          await axios.post(`${API_URL}/transactions`, transactionData);
        }
      }

      // Refresh transactions
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data || []);
      
      handleCloseTransactionDialog();
      enqueueSnackbar(
        editMode ? 'Transaction updated successfully' : 'Transaction created successfully', 
        { variant: 'success' }
      );
    } catch (error) {
      console.error('Error saving transaction:', error);
      enqueueSnackbar('Failed to save transaction', { variant: 'error' });
    }
  };

  const handleTransactionDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await axios.delete(`${API_URL}/transactions/${id}`);
        if (response.status === 204 || (response.data && response.data.success)) {
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
  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const prepareChartData = () => {
    // Filter transactions based on date range
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    // Group transactions by period
    const groupedData = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      let periodKey;
      
      switch(period) {
        case 'daily':
          periodKey = format(date, 'yyyy-MM-dd');
          break;
        case 'weekly':
          // Get the week number
          const weekNum = Math.ceil(date.getDate() / 7);
          periodKey = `${format(date, 'yyyy-MM')} W${weekNum}`;
          break;
        case 'monthly':
          periodKey = format(date, 'yyyy-MM');
          break;
        case 'quarterly':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `${date.getFullYear()} Q${quarter}`;
          break;
        case 'yearly':
          periodKey = date.getFullYear().toString();
          break;
        default:
          periodKey = format(date, 'yyyy-MM-dd');
      }
      
      if (!groupedData[periodKey]) {
        groupedData[periodKey] = { name: periodKey, income: 0, expenses: 0 };
      }
      
      const account = accounts.find(a => a.id === transaction.accountId);
      if (!account) return;
      
      const accountType = accountTypes.find(at => at.id === account.accountTypeId);
      if (!accountType) return;
      
      if (accountType.name === 'Income') {
        groupedData[periodKey].income += parseFloat(transaction.amount);
      } else if (accountType.name === 'Expense') {
        groupedData[periodKey].expenses += parseFloat(transaction.amount);
      }
    });
    
    // Convert to array and sort by period
    return Object.values(groupedData).sort((a, b) => a.name.localeCompare(b.name));
  };
  
  const chartData = prepareChartData();
  const COLORS = ['#4CAF50', '#F44336']; // Green for income, Red for expenses

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
    return property ? property.name : 'Unknown Property';
  };

  const getPropertyAddress = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property || !property.addresses || property.addresses.length === 0) return '';
    
    const primaryAddress = property.addresses.find(a => a.is_primary) || property.addresses[0];
    if (!primaryAddress) return '';
    
    return `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.zip}`;
  };

  const getUnitName = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return '';
    
    return unit.unit_number || `Unit ${unit.id}`;
  };

  const getUnitsForProperty = (propertyId) => {
    if (!propertyId) return [];
    
    const property = properties.find(p => p.id === propertyId);
    if (!property || !property.addresses) return [];
    
    // Collect all units from all addresses of this property
    const propertyUnits = [];
    property.addresses.forEach(address => {
      if (address.units && address.units.length > 0) {
        address.units.forEach(unit => {
          propertyUnits.push({
            ...unit,
            addressInfo: `${address.street}${unit.unit_number ? `, ${unit.unit_number}` : ''}`
          });
        });
      }
    });
    
    return propertyUnits;
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
      case 'Bank':
        return 'info';
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
      <Typography variant="h5" gutterBottom>
        Accounting
      </Typography>

      {/* Chart with Filters */}
      <Paper sx={{ p: 3, mb: 4, height: 500, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>Income vs Expenses</Typography>
        
        {/* Date Range and Period Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={(e) => setPeriod(e.target.value)}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
                onChange={(e) => setChartType(e.target.value)}
              >
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="area">Area Chart</MenuItem>
                <MenuItem value="composed">Composed Chart</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ flexGrow: 1, width: '100%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' && (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="income" name="Income" fill={COLORS[0]} />
                <Bar dataKey="expenses" name="Expenses" fill={COLORS[1]} />
              </BarChart>
            )}
            
            {chartType === 'line' && (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="income" name="Income" stroke={COLORS[0]} strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke={COLORS[1]} strokeWidth={2} />
              </LineChart>
            )}
            
            {chartType === 'area' && (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Area type="monotone" dataKey="income" name="Income" fill={COLORS[0]} stroke={COLORS[0]} fillOpacity={0.6} />
                <Area type="monotone" dataKey="expenses" name="Expenses" fill={COLORS[1]} stroke={COLORS[1]} fillOpacity={0.6} />
              </AreaChart>
            )}
            
            {chartType === 'composed' && (
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="income" name="Income" fill={COLORS[0]} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke={COLORS[1]} strokeWidth={2} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Main Tabs */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Tabs value={mainTabValue} onChange={handleMainTabChange} sx={{ mb: 2 }}>
          <Tab label="Chart of Accounts" />
          <Tab label="Transactions" />
        </Tabs>

        {/* Chart of Accounts Tab */}
        {mainTabValue === 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Chart of Accounts</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenAccountDialog()}
              >
                New Account
              </Button>
            </Box>
            
            <Tabs value={accountTabValue} onChange={handleAccountTabChange} sx={{ mb: 2 }}>
              <Tab label="All Accounts" />
              <Tab label="Assets" />
              <Tab label="Liabilities" />
              <Tab label="Income" />
              <Tab label="Expenses" />
            </Tabs>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Account Name</TableCell>
                    <TableCell>Account Type</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts
                    .filter(account => {
                      if (accountTabValue === 0) return true;
                      const accountType = accountTypes.find(at => at.id === account.accountTypeId);
                      if (!accountType) return false;
                      
                      switch (accountTabValue) {
                        case 1: return accountType.name === 'Asset';
                        case 2: return accountType.name === 'Liability';
                        case 3: return accountType.name === 'Income';
                        case 4: return accountType.name === 'Expense';
                        default: return true;
                      }
                    })
                    .map(account => (
                      <TableRow key={account.id}>
                        <TableCell>{account.id}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{getAccountTypeName(account.id)}</TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenAccountDialog(account)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleAccountDelete(account.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  {accounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No accounts found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Transactions Tab */}
        {mainTabValue === 1 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Transaction List</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenTransactionDialog()}
              >
                New Transaction
              </Button>
            </Box>
            
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
                          onClick={() => handleOpenTransactionDialog(transaction)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleTransactionDelete(transaction.id)}
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
          </>
        )}
      </Paper>

      {/* Account Dialog */}
      <Dialog open={openAccountDialog} onClose={handleCloseAccountDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Account' : 'New Account'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Account Name"
                fullWidth
                value={currentAccount.name}
                onChange={handleAccountInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Account Type</InputLabel>
                <Select
                  name="accountTypeId"
                  value={currentAccount.accountTypeId}
                  onChange={handleAccountInputChange}
                  label="Account Type"
                  required
                >
                  {accountTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAccountDialog}>Cancel</Button>
          <Button 
            onClick={handleAccountSubmit} 
            variant="contained" 
            color="primary"
            disabled={!currentAccount.name || !currentAccount.accountTypeId}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog open={openTransactionDialog} onClose={handleCloseTransactionDialog} maxWidth="md" fullWidth>
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
                onChange={(e) => handleTransactionInputChange(e)}
                required
              />
            </Grid>
            
            {/* Transaction Entries */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Transaction Entries</Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {currentTransaction.entries.map((entry, index) => (
                  <Grid container spacing={2} key={entry.id} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                          name="type"
                          value={entry.type}
                          onChange={(e) => handleTransactionInputChange(e, index)}
                          label="Type"
                          required
                        >
                          <MenuItem value="debit">Debit</MenuItem>
                          <MenuItem value="credit">Credit</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        name="amount"
                        label="Amount"
                        fullWidth
                        size="small"
                        type="number"
                        value={entry.amount}
                        onChange={(e) => handleTransactionInputChange(e, index)}
                        required
                        InputProps={{
                          startAdornment: <span>$</span>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Account</InputLabel>
                        <Select
                          name="accountId"
                          value={entry.accountId}
                          onChange={(e) => handleTransactionInputChange(e, index)}
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
                    <Grid item xs={12} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Property</InputLabel>
                        <Select
                          name="propertyId"
                          value={entry.propertyId}
                          onChange={(e) => handleTransactionInputChange(e, index)}
                          label="Property"
                          required
                        >
                          {properties.map((property) => (
                            <MenuItem key={property.id} value={property.id}>
                              {property.name || 'Unnamed Property'}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Unit (Optional)</InputLabel>
                        <Select
                          name="unitId"
                          value={entry.unitId || ''}
                          onChange={(e) => handleTransactionInputChange(e, index)}
                          label="Unit (Optional)"
                          disabled={!entry.propertyId}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {getUnitsForProperty(entry.propertyId).map((unit) => (
                            <MenuItem key={unit.id} value={unit.id}>
                              {unit.addressInfo}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                      {currentTransaction.entries.length > 2 && (
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => removeTransactionEntry(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                ))}
                
                {/* Summary of debits and credits */}
                <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper' }}>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Total Debits: $
                        {currentTransaction.entries
                          .filter(entry => entry.type === 'debit')
                          .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0)
                          .toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Total Credits: $
                        {currentTransaction.entries
                          .filter(entry => entry.type === 'credit')
                          .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0)
                          .toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={addTransactionEntry}
                  >
                    Add Entry
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionDialog}>Cancel</Button>
          <Button 
            onClick={handleTransactionSubmit} 
            variant="contained" 
            color="primary"
            disabled={
              !currentTransaction.description || 
              currentTransaction.entries.some(entry => !entry.accountId || !entry.amount || !entry.propertyId) ||
              Math.abs(
                currentTransaction.entries
                  .filter(entry => entry.type === 'debit')
                  .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0) -
                currentTransaction.entries
                  .filter(entry => entry.type === 'credit')
                  .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0)
              ) > 0.01
            }
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accounting;