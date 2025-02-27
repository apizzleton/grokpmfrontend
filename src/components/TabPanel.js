import React from 'react';
import { Box } from '@mui/material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      sx={{ p: 3 }}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

export default TabPanel;