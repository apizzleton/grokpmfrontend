import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CircularProgress, Button } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const Accounting = () => {
  const [loading, setLoading] = useState(false);

  // Simple dummy data for demonstration
  const income = 15000;
  const expenses = 8500;

  const chartData = [
    { name: 'Income', value: income },
    { name: 'Expenses', value: expenses },
  ];
  const COLORS = ['#0088FE', '#FF8042'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Accounting
      </Typography>

      {/* Financial Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">Total Income</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>${income.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">Total Expenses</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>${expenses.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary">Net Balance</Typography>
              <Typography variant="h4" sx={{ mt: 1 }} color={income - expenses >= 0 ? 'success.main' : 'error.main'}>
                ${(income - expenses).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      <Paper sx={{ p: 3, mb: 4, height: 400, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>Income vs Expenses</Typography>
        <Box sx={{ flexGrow: 1, width: '100%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData} 
                cx="50%" 
                cy="50%" 
                labelLine={false} 
                outerRadius={80} 
                fill="#8884d8" 
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Coming Soon Message */}
      <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Accounting Features Coming Soon
        </Typography>
        <Typography variant="body1" paragraph>
          We're working on enhancing the accounting module with transaction management, 
          reporting, and more advanced financial tools.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Check back soon for updates!
        </Typography>
      </Paper>
    </Box>
  );
};

export default Accounting;