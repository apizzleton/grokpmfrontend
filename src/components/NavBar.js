import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, List, ListItemButton, ListItemText, IconButton, TextField, Box, Collapse } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { AppContext } from '../context/AppContext';

const NavBar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const { dispatch } = useContext(AppContext);

  const toggleDrawer = () => setIsOpen(!isOpen);

  const toggleSubMenu = (menu) => {
    setOpenSubMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleSearch = (event) => {
    dispatch({ type: 'SET_SEARCH', payload: event.target.value });
  };

  const menuItems = [
    {
      text: 'Rentals',
      path: '/rentals/properties',
      subItems: [
        { text: 'Properties', path: '/rentals/properties' },
        { text: 'Units', path: '/rentals/units' },
      ],
    },
    {
      text: 'People',
      path: '/people/tenants',
      subItems: [
        { text: 'Tenants', path: '/people/tenants' },
        { text: 'Owners', path: '/people/owners' },
        { text: 'Board Members', path: '/people/board-members' },
      ],
    },
    { text: 'Accounting', path: '/accounting' },
    { text: 'Reports', path: '/reports' },
    {
      text: 'Associations',
      path: '/associations/properties',
      subItems: [
        { text: 'Properties', path: '/associations/properties' },
        { text: 'Associations', path: '/associations/associations' },
      ],
    },
  ];

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={toggleDrawer}
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          top: 10,
          left: 10,
          zIndex: 1201,
          backgroundColor: '#4a90e2',
          color: 'white',
          '&:hover': { backgroundColor: '#357abd' },
        }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
            backgroundColor: '#4a90e2',
            color: 'white',
            position: 'fixed',
            zIndex: 1200,
          },
        }}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            onChange={handleSearch}
            sx={{ mb: 2, backgroundColor: 'white', borderRadius: 1 }}
          />
          <List>
            {menuItems.map((item) => (
              <div key={item.text}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => {
                    if (item.subItems) toggleSubMenu(item.text);
                    else toggleDrawer();
                  }}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                >
                  <ListItemText primary={item.text} />
                  {item.subItems && (openSubMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
                {item.subItems && (
                  <Collapse in={openSubMenus[item.text] || false} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <ListItemButton
                          key={subItem.text}
                          component={Link}
                          to={subItem.path}
                          onClick={toggleDrawer}
                          sx={{ pl: 4, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                        >
                          <ListItemText primary={subItem.text} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </div>
            ))}
          </List>
        </Box>
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          width: 250,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
            backgroundColor: '#4a90e2',
            color: 'white',
            position: 'relative',
            zIndex: 1000,
          },
        }}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            onChange={handleSearch}
            sx={{ mb: 2, backgroundColor: 'white', borderRadius: 1 }}
          />
          <List>
            {menuItems.map((item) => (
              <div key={item.text}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{ '&.active, &:hover': { backgroundColor: '#357abd' } }}
                  className={location.pathname.startsWith(item.path) ? 'active' : ''}
                  onClick={() => item.subItems && toggleSubMenu(item.text)}
                >
                  <ListItemText primary={item.text} />
                  {item.subItems && (openSubMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
                {item.subItems && (
                  <Collapse in={openSubMenus[item.text] || false} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <ListItemButton
                          key={subItem.text}
                          component={Link}
                          to={subItem.path}
                          sx={{ pl: 4, '&.active, &:hover': { backgroundColor: '#357abd' } }}
                          className={location.pathname === subItem.path ? 'active' : ''}
                        >
                          <ListItemText primary={subItem.text} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </div>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default NavBar;