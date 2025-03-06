import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  TextField,
  Box,
  Collapse,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AppContext from "../context/AppContext";

const NavBar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const { setSearchQuery } = useContext(AppContext);

  const toggleDrawer = () => setIsOpen(!isOpen);
  const toggleSubMenu = (menu) => {
    setOpenSubMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const menuItems = [
    { text: "Overview", path: "/overview", icon: <HomeIcon /> },
    {
      text: "Rentals",
      path: "/rentals",
      icon: <ApartmentIcon />,
      subItems: [
        { text: "Properties", path: "/rentals/properties" },
        { text: "Units", path: "/rentals/units" },
      ],
    },
    {
      text: "People",
      path: "/people",
      icon: <PeopleIcon />,
      subItems: [
        { text: "Tenants", path: "/people/tenants" },
        { text: "Owners", path: "/people/owners" },
        { text: "Board Members", path: "/people/board-members" },
      ],
    },
    { text: "Accounting", path: "/accounting", icon: <AccountBalanceIcon /> },
    { text: "Reports", path: "/reports", icon: <AssessmentIcon /> },
    {
      text: "Associations",
      path: "/associations",
      icon: <ApartmentIcon />,
      subItems: [
        { text: "Properties", path: "/associations/properties" },
        { text: "Associations", path: "/associations/associations" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile hamburger icon */}
      <IconButton
        edge="start"
        color="inherit"
        onClick={toggleDrawer}
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 1300, // Increased z-index to be above drawer
          backgroundColor: "#2c3e50",
          color: "#ecf0f1",
          "&:hover": { backgroundColor: "#34495e" },
          borderRadius: 2,
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        variant="temporary"
        open={isOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
            backgroundColor: "#2c3e50",
            color: "#ecf0f1",
            borderRight: "none",
            borderRadius: "0 8px 8px 0",
            boxShadow: "4px 0 10px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <Box sx={{ p: 2, width: "100%", boxSizing: "border-box", overflow: "hidden" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            onChange={handleSearch}
            InputProps={{ 
              startAdornment: <SearchIcon sx={{ color: "#2c3e50" }} />,
              sx: { borderRadius: 4 }
            }}
            sx={{ 
              mb: 2, 
              backgroundColor: "#ecf0f1", 
              borderRadius: 4,
              maxWidth: "100%",
              "& .MuiOutlinedInput-root": {
                width: "100%",
                maxWidth: "100%"
              }
            }}
          />
          <List component="nav" sx={{ width: "100%" }}>
            {menuItems.map((item) => (
              <div key={item.text}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={() => {
                    if (item.subItems) {
                      toggleSubMenu(item.text);
                    } else {
                      setIsOpen(false); // Close drawer when clicking on a non-submenu item
                    }
                  }}
                  className={location.pathname.startsWith(item.path) ? "active" : ""}
                  sx={{ 
                    padding: "16px 20px", 
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                    "&.active": { backgroundColor: "#34495e" }
                  }}
                >
                  {item.icon && <Box sx={{ mr: 2 }}>{item.icon}</Box>}
                  <ListItemText primary={item.text} />
                  {item.subItems && (openSubMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
                {item.subItems && (
                  <Collapse in={openSubMenus[item.text]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <ListItemButton
                          key={subItem.text}
                          component={Link}
                          to={subItem.path}
                          onClick={() => setIsOpen(false)} // Close drawer when clicking on submenu item
                          sx={{ 
                            pl: 6, 
                            padding: "14px 20px", 
                            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                            "&.active": { backgroundColor: "#34495e" }
                          }}
                          className={location.pathname === subItem.path ? "active" : ""}
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

      {/* Desktop sidebar */}
      <Drawer
        variant="permanent"
        anchor="left"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width: 280,
          flexShrink: 0,
          position: "relative",
          zIndex: 1000,
          "& .MuiDrawer-paper": {
            position: "relative",
            width: 280,
            boxSizing: "border-box",
            backgroundColor: "#2c3e50",
            color: "#ecf0f1",
            borderRight: "none",
            borderRadius: "0 8px 8px 0",
            boxShadow: "4px 0 10px rgba(0, 0, 0, 0.1)",
            height: "100%",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ p: 3, width: "100%", boxSizing: "border-box", overflow: "hidden" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            onChange={handleSearch}
            InputProps={{ 
              startAdornment: <SearchIcon sx={{ color: "#2c3e50" }} />,
              sx: { borderRadius: 4 }
            }}
            sx={{ 
              mb: 2, 
              backgroundColor: "#ecf0f1", 
              borderRadius: 4,
              maxWidth: "100%",
              "& .MuiOutlinedInput-root": {
                width: "100%",
                maxWidth: "100%"
              }
            }}
          />
          <List component="nav" sx={{ width: "100%" }}>
            {menuItems.map((item) => (
              <div key={item.text}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  className={location.pathname.startsWith(item.path) ? "active" : ""}
                  onClick={() => item.subItems && toggleSubMenu(item.text)}
                  sx={{ 
                    padding: "16px 20px", 
                    "&.active": { backgroundColor: "#34495e" },
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" } 
                  }}
                >
                  {item.icon && <Box sx={{ mr: 2 }}>{item.icon}</Box>}
                  <ListItemText primary={item.text} />
                  {item.subItems && (openSubMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
                {item.subItems && (
                  <Collapse in={openSubMenus[item.text]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => (
                        <ListItemButton
                          key={subItem.text}
                          component={Link}
                          to={subItem.path}
                          sx={{ 
                            pl: 6, 
                            padding: "14px 20px", 
                            "&.active": { backgroundColor: "#34495e" },
                            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" } 
                          }}
                          className={location.pathname === subItem.path ? "active" : ""}
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