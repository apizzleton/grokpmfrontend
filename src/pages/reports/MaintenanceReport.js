import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import AppContext from '../../context/AppContext';
import { useSnackbar } from 'notistack';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS = {
  open: '#0088FE',
  in_progress: '#FFBB28',
  completed: '#00C49F',
  cancelled: '#FF8042'
};

const PRIORITY_COLORS = {
  low: '#00C49F',
  medium: '#FFBB28',
  high: '#FF0000'
};

function MaintenanceReport() {
  const { state, fetchData } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Get properties from context
  const properties = state.properties || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch maintenance data from backend
        const data = await fetchData('maintenance');
        setMaintenanceData(data || []);
        setFilteredData(data || []);
      } catch (error) {
        console.error('Error loading maintenance data:', error);
        enqueueSnackbar('Failed to load maintenance data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchData, enqueueSnackbar]);

  useEffect(() => {
    // Apply filters whenever the selected property or date range changes
    filterData();
  }, [selectedProperty, dateRange, maintenanceData]);

  const filterData = () => {
    let filtered = [...maintenanceData];
    
    // Filter by property
    if (selectedProperty !== 'all') {
      filtered = filtered.filter(item => item.property_id === parseInt(selectedProperty));
    }
    
    // Filter by date range
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate);
      filtered = filtered.filter(item => new Date(item.createdAt) >= startDate);
    }
    
    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
      filtered = filtered.filter(item => new Date(item.createdAt) <= endDate);
    }
    
    setFilteredData(filtered);
  };

  const handlePropertyChange = (event) => {
    setSelectedProperty(event.target.value);
  };

  const handleDateChange = (event) => {
    setDateRange({
      ...dateRange,
      [event.target.name]: event.target.value
    });
  };

  // Calculate key metrics
  const calculateMetrics = () => {
    const total = filteredData.length;
    const open = filteredData.filter(item => item.status === 'open').length;
    const inProgress = filteredData.filter(item => item.status === 'in_progress').length;
    const completed = filteredData.filter(item => item.status === 'completed').length;
    const cancelled = filteredData.filter(item => item.status === 'cancelled').length;
    const highPriority = filteredData.filter(item => item.priority === 'high').length;
    
    const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
    const avgResponseTime = calculateAverageResponseTime();
    
    return {
      total,
      open,
      inProgress,
      completed,
      cancelled,
      highPriority,
      completionRate,
      avgResponseTime
    };
  };

  // Calculate average response time (days between creation and completion)
  const calculateAverageResponseTime = () => {
    const completedRequests = filteredData.filter(item => item.status === 'completed');
    
    if (completedRequests.length === 0) return 'N/A';
    
    const totalDays = completedRequests.reduce((sum, item) => {
      const createdDate = new Date(item.createdAt);
      const updatedDate = new Date(item.updatedAt);
      const diffTime = Math.abs(updatedDate - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    return (totalDays / completedRequests.length).toFixed(1) + ' days';
  };

  // Prepare data for status distribution chart
  const getStatusDistribution = () => {
    const statusCounts = {
      'Open': filteredData.filter(item => item.status === 'open').length,
      'In Progress': filteredData.filter(item => item.status === 'in_progress').length,
      'Completed': filteredData.filter(item => item.status === 'completed').length,
      'Cancelled': filteredData.filter(item => item.status === 'cancelled').length
    };
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  // Prepare data for priority distribution chart
  const getPriorityDistribution = () => {
    const priorityCounts = {
      'Low': filteredData.filter(item => item.priority === 'low').length,
      'Medium': filteredData.filter(item => item.priority === 'medium').length,
      'High': filteredData.filter(item => item.priority === 'high').length
    };
    
    return Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));
  };

  // Prepare data for monthly trend chart
  const getMonthlyTrends = () => {
    // Get range of months from date range
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const months = [];
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Count requests by month
    return months.map(month => {
      const monthName = month.toLocaleString('default', { month: 'short', year: '2-digit' });
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const created = filteredData.filter(item => {
        const date = new Date(item.createdAt);
        return date >= monthStart && date <= monthEnd;
      }).length;
      
      const completed = filteredData.filter(item => {
        if (item.status !== 'completed') return false;
        const date = new Date(item.updatedAt);
        return date >= monthStart && date <= monthEnd;
      }).length;
      
      return {
        name: monthName,
        'Created': created,
        'Completed': completed
      };
    });
  };

  const metrics = calculateMetrics();
  const statusData = getStatusDistribution();
  const priorityData = getPriorityDistribution();
  const monthlyData = getMonthlyTrends();

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Maintenance Report
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Property</InputLabel>
              <Select
                value={selectedProperty}
                onChange={handlePropertyChange}
                label="Property"
              >
                <MenuItem value="all">All Properties</MenuItem>
                {properties.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Start Date"
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="End Date"
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              variant="contained" 
              onClick={filterData}
              fullWidth
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary">Total Requests</Typography>
                  <Typography variant="h4">{metrics.total}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {metrics.open} open, {metrics.inProgress} in progress
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary">Completion Rate</Typography>
                  <Typography variant="h4">{metrics.completionRate}%</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {metrics.completed} completed requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary">High Priority</Typography>
                  <Typography variant="h4">{metrics.highPriority}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {((metrics.highPriority / metrics.total) * 100 || 0).toFixed(1)}% of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary">Avg. Response Time</Typography>
                  <Typography variant="h4">{metrics.avgResponseTime}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    From creation to completion
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Charts */}
          <Grid container spacing={3}>
            {/* Status Distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Status Distribution</Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Priority Distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Priority Distribution</Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={priorityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Count">
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Monthly Trends */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Monthly Trends</Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Created" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Completed" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}

export default MaintenanceReport;
