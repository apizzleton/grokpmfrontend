import React, { useContext, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, MenuItem, Button } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import AppContext from '../context/AppContext';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const Accounting = () => {
  const { state, updateData } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    date: '',
    description: '',
    accountId: '',
    transactionTypeId: '',
    propertyId: '',
  });

  // Check if transactions are loaded; if not, show a loading message
  if (!state.transactions) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Accounting
        </Typography>
        <Typography>Loading transactions...</Typography>
      </Box>
    );
  }

  const income = state.transactions
    .filter((t) => t.transactionType && t.transactionType.name === 'Income')
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const expenses = state.transactions
    .filter((t) => t.transactionType && t.transactionType.name === 'Expense')
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  const chartData = [
    { name: 'Income', value: income },
    { name: 'Expenses', value: expenses },
  ];
  const COLORS = ['#0088FE', '#FF8042'];

  const handleAddTransaction = async () => {
    try {
      const response = await updateData('transactions', {
        ...newTransaction,
        date: new Date(newTransaction.date).toISOString().split('T')[0],
      });
      enqueueSnackbar('Transaction added successfully', { variant: 'success' });
      setNewTransaction({ amount: '', date: '', description: '', accountId: '', transactionTypeId: '', propertyId: '' });
    } catch (error) {
      enqueueSnackbar('Failed to add transaction', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Accounting
      </Typography>

      {/* Chart */}
      <PieChart width={400} height={400}>
        <Pie data={chartData} cx={200} cy={200} labelLine={false} outerRadius={80} dataKey="value">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>

      {/* Transaction Form */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add New Transaction
        </Typography>
        <TextField
          label="Amount"
          value={newTransaction.amount}
          onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
          type="number"
          sx={{ mr: 2, mt: 2 }}
        />
        <TextField
          label="Date"
          type="date"
          value={newTransaction.date}
          onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
          sx={{ mr: 2, mt: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Description"
          value={newTransaction.description}
          onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
          sx={{ mr: 2, mt: 2 }}
        />
        <TextField
          select
          label="Account"
          value={newTransaction.accountId}
          onChange={(e) => setNewTransaction({ ...newTransaction, accountId: e.target.value })}
          sx={{ mr: 2, mt: 2, width: 200 }}
        >
          {state.accounts.map((acc) => (
            <MenuItem key={acc.id} value={acc.id}>
              {acc.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Transaction Type"
          value={newTransaction.transactionTypeId}
          onChange={(e) => setNewTransaction({ ...newTransaction, transactionTypeId: e.target.value })}
          sx={{ mr: 2, mt: 2, width: 200 }}
        >
          {state.transactionTypes.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Property"
          value={newTransaction.propertyId}
          onChange={(e) => setNewTransaction({ ...newTransaction, propertyId: e.target.value })}
          sx={{ mr: 2, mt: 2, width: 200 }}
        >
          {state.properties.map((prop) => (
            <MenuItem key={prop.id} value={prop.id}>
              {prop.name}
            </MenuItem>
          ))}
        </TextField>
        <Button onClick={handleAddTransaction} variant="contained" sx={{ mt: 2 }}>
          Add Transaction
        </Button>
      </Box>

      {/* Transactions Table with Inline Editing */}
      <Table sx={{ mt: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Account</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Property</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {state.transactions.map((t) => (
            <TransactionRow key={t.id} transaction={t} updateData={updateData} enqueueSnackbar={enqueueSnackbar} />
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

const TransactionRow = ({ transaction, updateData, enqueueSnackbar }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState({
    amount: transaction.amount,
    date: new Date(transaction.date).toISOString().split('T')[0],
    description: transaction.description,
    accountId: transaction.accountId,
    transactionTypeId: transaction.transactionTypeId,
    propertyId: transaction.propertyId,
  });

  const handleSave = async () => {
    try {
      await updateData(`transactions/${transaction.id}`, editedTransaction, 'put');
      enqueueSnackbar('Transaction updated successfully', { variant: 'success' });
      setIsEditing(false);
    } catch (error) {
      enqueueSnackbar('Failed to update transaction', { variant: 'error' });
    }
  };

  if (isEditing) {
    return (
      <TableRow>
        <TableCell>
          <TextField
            value={editedTransaction.amount}
            onChange={(e) => setEditedTransaction({ ...editedTransaction, amount: e.target.value })}
            type="number"
          />
        </TableCell>
        <TableCell>
          <TextField
            value={editedTransaction.date}
            onChange={(e) => setEditedTransaction({ ...editedTransaction, date: e.target.value })}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </TableCell>
        <TableCell>
          <TextField
            value={editedTransaction.description}
            onChange={(e) => setEditedTransaction({ ...editedTransaction, description: e.target.value })}
          />
        </TableCell>
        <TableCell>
          <TextField
            select
            value={editedTransaction.accountId}
            onChange={(e) => setEditedTransaction({ ...editedTransaction, accountId: e.target.value })}
          >
            {/* Ideally, fetch accounts from context; leaving as placeholder for now */}
            {/* You may need to pass state.accounts as a prop or access via context */}
          </TextField>
        </TableCell>
        <TableCell>
          <TextField
            select
            value={editedTransaction.transactionTypeId}
            onChange={(e) => setEditedTransaction({ ...editedTransaction, transactionTypeId: e.target.value })}
          >
            {/* Ideally, fetch transactionTypes from context; leaving as placeholder */}
          </TextField>
        </TableCell>
        <TableCell>
          <TextField
            select
            value={editedTransaction.propertyId}
            onChange={(e) => setEditedTransaction({ ...editedTransaction, propertyId: e.target.value })}
          >
            {/* Ideally, fetch properties from context; leaving as placeholder */}
          </TextField>
        </TableCell>
        <TableCell>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
          <Button onClick={() => setIsEditing(false)} variant="outlined" color="secondary" sx={{ ml: 1 }}>
            Cancel
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>{transaction.amount}</TableCell>
      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
      <TableCell>{transaction.description}</TableCell>
      <TableCell>{transaction.account ? transaction.account.name : 'N/A'}</TableCell>
      <TableCell>{transaction.transactionType ? transaction.transactionType.name : 'N/A'}</TableCell>
      <TableCell>{transaction.property ? transaction.property.name : 'N/A'}</TableCell>
      <TableCell>
        <Button onClick={() => setIsEditing(true)} variant="outlined" color="primary">
          Edit
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default Accounting;