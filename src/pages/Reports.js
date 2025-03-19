import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BarChartIcon from '@mui/icons-material/BarChart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

function Reports() {
  const navigate = useNavigate();

  const reportCards = [
    {
      title: 'Rent Roll',
      description: 'View a comprehensive rent roll report for all properties and units.',
      icon: <ReceiptLongIcon fontSize="large" color="primary" />,
      path: '/reports/rent-roll'
    },
    {
      title: 'General Ledger',
      description: 'View and manage all financial transactions across your properties.',
      icon: <AccountBalanceIcon fontSize="large" color="primary" />,
      path: '/reports/general-ledger',
      disabled: false
    },
    {
      title: 'Financial Summary',
      description: 'View financial summaries and trends across all properties.',
      icon: <MonetizationOnIcon fontSize="large" color="primary" />,
      path: '/reports',
      disabled: true
    },
    {
      title: 'Occupancy Report',
      description: 'View occupancy rates and vacancy statistics.',
      icon: <BarChartIcon fontSize="large" color="primary" />,
      path: '/reports',
      disabled: true
    },
    {
      title: 'Maintenance Report',
      description: 'View maintenance request statistics and trends.',
      icon: <AssessmentIcon fontSize="large" color="primary" />,
      path: '/reports/maintenance',
      disabled: false
    }
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Typography variant="body1" paragraph>
        Access and generate various reports for your properties and units.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {reportCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                opacity: card.disabled ? 0.7 : 1,
                '&:hover': { boxShadow: card.disabled ? 1 : 6 }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom align="center">
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
                {card.disabled && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    Coming soon
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  onClick={() => navigate(card.path)}
                  disabled={card.disabled}
                  fullWidth
                >
                  View Report
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Reports;