import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Container
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useApp } from '../context/AppContext';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const Overview = () => {
  const { state } = useApp();
  const { properties, units, tenants, owners, leases } = state;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Ensure arrays are valid
  const safeProperties = Array.isArray(properties) ? properties : [];
  const safeUnits = Array.isArray(units) ? units : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeOwners = Array.isArray(owners) ? owners : [];
  const safeLeases = Array.isArray(leases) ? leases : [];

  // Dummy data for financial insights
  const monthlyIncomeData = [
    { month: 'Jan', income: 42000 },
    { month: 'Feb', income: 45000 },
    { month: 'Mar', income: 48000 },
    { month: 'Apr', income: 51000 },
    { month: 'May', income: 53000 },
    { month: 'Jun', income: 56000 },
    { month: 'Jul', income: 58000 },
    { month: 'Aug', income: 61000 },
    { month: 'Sep', income: 63000 },
    { month: 'Oct', income: 65000 },
    { month: 'Nov', income: 68000 },
    { month: 'Dec', income: 70000 },
  ];

  // Dummy data for expense breakdown
  const expenseData = [
    { name: 'Maintenance', value: 25000 },
    { name: 'Utilities', value: 15000 },
    { name: 'Insurance', value: 10000 },
    { name: 'Property Tax', value: 20000 },
    { name: 'Management', value: 12000 },
  ];

  // Dummy data for occupancy rate
  const occupancyData = [
    { month: 'Jan', rate: 88 },
    { month: 'Feb', rate: 90 },
    { month: 'Mar', rate: 92 },
    { month: 'Apr', rate: 91 },
    { month: 'May', rate: 93 },
    { month: 'Jun', rate: 95 },
    { month: 'Jul', rate: 96 },
    { month: 'Aug', rate: 97 },
    { month: 'Sep', rate: 96 },
    { month: 'Oct', rate: 95 },
    { month: 'Nov', rate: 94 },
    { month: 'Dec', rate: 93 },
  ];

  // Dummy data for leases expiring soon
  const expiringLeases = [
    { id: 1, unit: '101A', property: 'Sunset Apartments', tenant: 'John Smith', expiry: '2025-04-15' },
    { id: 2, unit: '205B', property: 'Oceanview Condos', tenant: 'Sarah Johnson', expiry: '2025-04-22' },
    { id: 3, unit: '310C', property: 'Mountain Residences', tenant: 'Michael Brown', expiry: '2025-05-01' },
    { id: 4, unit: '402D', property: 'Downtown Lofts', tenant: 'Emily Davis', expiry: '2025-05-10' },
  ];

  // Dummy data for recent maintenance requests
  const maintenanceRequests = [
    { id: 1, unit: '103A', property: 'Sunset Apartments', issue: 'Leaking faucet', status: 'pending', date: '2025-03-08' },
    { id: 2, unit: '207B', property: 'Oceanview Condos', issue: 'HVAC not working', status: 'in progress', date: '2025-03-09' },
    { id: 3, unit: '315C', property: 'Mountain Residences', issue: 'Broken window', status: 'pending', date: '2025-03-10' },
  ];

  // Colors for charts
  const COLORS = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
    chart1: '#4a90e2',
    chart2: '#82ca9d',
    chart3: '#8884d8',
    chart4: '#ffc658',
    chart5: '#ff8042',
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate days until expiry
  const getDaysUntil = (dateString) => {
    const today = new Date();
    const expiryDate = new Date(dateString);
    const diffTime = Math.abs(expiryDate - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>Dashboard</Typography>
        
        {/* Summary Cards */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: 'primary.light' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoneyIcon color="primary" />
                  <Typography variant="subtitle2" color="primary.dark" sx={{ ml: 1 }}>Monthly Income</Typography>
                </Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(monthlyIncomeData[monthlyIncomeData.length - 1].income)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
                  <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                    +3.2% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: 'success.light' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HomeIcon color="success" />
                  <Typography variant="subtitle2" color="success.dark" sx={{ ml: 1 }}>Occupancy Rate</Typography>
                </Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {occupancyData[occupancyData.length - 1].rate}%
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
                  <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                    +1.5% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: 'warning.light' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EventIcon color="warning" />
                  <Typography variant="subtitle2" color="warning.dark" sx={{ ml: 1 }}>Expiring Leases</Typography>
                </Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {expiringLeases.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  in the next 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ height: '100%', bgcolor: 'error.light' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BuildIcon color="error" />
                  <Typography variant="subtitle2" color="error.dark" sx={{ ml: 1 }}>Maintenance</Typography>
                </Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {maintenanceRequests.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  open requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Charts */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Monthly Income Chart */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Monthly Income</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyIncomeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="income" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Expense Breakdown */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Expense Breakdown</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Leases and Maintenance */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Expiring Leases */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Leases Expiring Soon</Typography>
                <List>
                  {expiringLeases.map((lease) => (
                    <React.Fragment key={lease.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: COLORS.warning }}>
                            <EventIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1">{lease.unit} - {lease.property}</Typography>
                              <Chip 
                                label={`${getDaysUntil(lease.expiry)} days`} 
                                size="small" 
                                color={getDaysUntil(lease.expiry) < 15 ? "error" : "warning"} 
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {lease.tenant}
                              </Typography>
                              {` — Expires on ${formatDate(lease.expiry)}`}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Maintenance Requests */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Maintenance Requests</Typography>
                <List>
                  {maintenanceRequests.map((request) => (
                    <React.Fragment key={request.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: request.status === 'pending' ? COLORS.error : COLORS.warning }}>
                            <BuildIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1">{request.unit} - {request.property}</Typography>
                              <Chip 
                                label={request.status} 
                                size="small" 
                                color={request.status === 'pending' ? "error" : "warning"} 
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {request.issue}
                              </Typography>
                              {` — Reported on ${formatDate(request.date)}`}
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Occupancy Rate Trend */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Occupancy Rate Trend</Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={occupancyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[80, 100]} tickFormatter={(value) => `${value}%`} />
                      <RechartsTooltip formatter={(value) => `${value}%`} />
                      <Line type="monotone" dataKey="rate" stroke={COLORS.success} strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Overview;