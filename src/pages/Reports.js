import React, { useContext } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { AppContext } from '../context/AppContext';
import { PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Reports = () => {
  const { state } = useContext(AppContext);
  const { properties, units, tenants, payments } = state;

  const safeProperties = Array.isArray(properties) ? [...properties] : [];
  const safeUnits = Array.isArray(units) ? [...units] : [];
  const safeTenants = Array.isArray(tenants) ? [...tenants] : [];
  const safePayments = Array.isArray(payments) ? [...payments] : [];

  const chartData = [
    { name: 'Properties', value: safeProperties.length },
    { name: 'Units', value: safeUnits.length },
    { name: 'Tenants', value: safeTenants.length },
    { name: 'Payments', value: safePayments.length },
  ];

  console.log('Reports data:', { properties: safeProperties, units: safeUnits, tenants: safeTenants, payments: safePayments });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Reports</Typography>
      <Box sx={{ mb: 4 }}>
        <PieChart width={400} height={400}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
        </PieChart>
      </Box>
      <Button variant="contained" sx={{ mt: 2, backgroundColor: '#4a90e2', '&:hover': { backgroundColor: '#357abd' } }}>
        Generate Detailed Report
      </Button>
    </Box>
  );
};

export default Reports;