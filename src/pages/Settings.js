import React from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import Subscription from './Subscription';
import Portfolio from './Portfolio';

const Settings = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      
      <Paper elevation={3} style={{ marginTop: '1rem' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Subscription" />
          <Tab label="Portfolios" />
          <Tab label="Profile" />
          <Tab label="Preferences" />
        </Tabs>
        
        <Box p={3}>
          {tabValue === 0 && <Subscription />}
          {tabValue === 1 && <Portfolio />}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom>Profile Settings</Typography>
              <Typography variant="body1">Profile settings will be implemented in a future update.</Typography>
            </Box>
          )}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h5" gutterBottom>Preferences</Typography>
              <Typography variant="body1">Preference settings will be implemented in a future update.</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;
