import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Card, CardContent, Typography, Button, CircularProgress, Alert, Box, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [message, setMessage] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get('/api/subscription/plans');
        setPlans(response.data);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setMessage('Failed to load subscription plans.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setMessage('Please select a subscription plan');
      return;
    }
    setSubscribing(true);
    setMessage('');
    try {
      // For demonstration we use a dummy userId
      const response = await axios.post('/api/subscriptions', {
        userId: 1,
        planId: selectedPlan.id
      });
      setMessage(`Subscription successful! Your subscription is now active.`);
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage('Subscription failed. Please try again later.');
    } finally {
      setSubscribing(false);
    }
  };

  const renderFeatures = (plan) => {
    if (!plan.features) return null;
    
    let features;
    try {
      features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
    } catch (e) {
      console.error('Error parsing features:', e);
      return null;
    }
    
    return (
      <List dense>
        {Object.entries(features).map(([key, value]) => (
          <ListItem key={key}>
            <ListItemIcon>
              <CheckIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary={`${key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}`} 
            />
          </ListItem>
        ))}
      </List>
    );
  };

  if (loading) {
    return (
      <Container style={{ marginTop: '2rem', textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Choose Your Subscription Plan
      </Typography>
      {message && <Alert severity={message.startsWith('Subscription successful') ? 'success' : 'error'} style={{ marginBottom: '1rem' }}>{message}</Alert>}
      <Grid container spacing={3} style={{ marginTop: '1rem' }}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={4} key={plan.id}>
            <Card
              variant="outlined"
              style={{ 
                border: selectedPlan && selectedPlan.id === plan.id ? '2px solid #3f51b5' : '1px solid #e0e0e0', 
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setSelectedPlan(plan)}
            >
              <CardContent style={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  ${parseFloat(plan.price).toFixed(2)}<Typography variant="caption" color="textSecondary">/month</Typography>
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {plan.description}
                </Typography>
                <Divider style={{ margin: '1rem 0' }} />
                <Typography variant="subtitle2" gutterBottom>
                  Features:
                </Typography>
                {renderFeatures(plan)}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box mt={4} mb={4} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubscribe}
          disabled={subscribing || !selectedPlan}
        >
          {subscribing ? 'Processing...' : 'Subscribe Now'}
        </Button>
      </Box>
    </Container>
  );
};

export default Subscription;
