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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupsIcon from "@mui/icons-material/Groups";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import ArticleIcon from '@mui/icons-material/Article';
import AppContext from "../context/AppContext";

const NavBar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { setSearchQuery } = useContext(AppContext);

  const toggleDrawer = () => setIsOpen(!isOpen);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const menuItems = [
    { text: "Overview", path: "/overview", icon: <HomeIcon /> },
    { text: "Properties", path: "/rentals/properties", icon: <ApartmentIcon /> },
    { text: "Units", path: "/rentals/units", icon: <BusinessIcon /> },
    { text: "Tenants", path: "/people/tenants", icon: <PeopleIcon /> },
    { text: "Owners", path: "/people/owners", icon: <PersonIcon /> },
    { text: "Board Members", path: "/people/board-members", icon: <GroupsIcon /> },
    { text: "Accounting", path: "/accounting", icon: <AccountBalanceIcon /> },
    { text: "Reports", path: "/reports", icon: <AssessmentIcon /> },
    { text: "Associations", path: "/associations/associations", icon: <ApartmentIcon /> },
    { text: "Leases", path: "/leases", icon: <ArticleIcon /> },
  ];

  const NavContent = () => (
    <Box sx={{ 
      p: 2, 
      width: "100%", 
      boxSizing: "border-box", 
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "auto" 
    }}>
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
      <List component="nav" sx={{ width: "100%", flexGrow: 1, overflow: "auto" }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={Link}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={location.pathname === item.path ? "active" : ""}
            sx={{ 
              padding: "16px 20px", 
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              "&.active": { backgroundColor: "#34495e" }
            }}
          >
            {item.icon && <Box sx={{ mr: 2 }}>{item.icon}</Box>}
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

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
          zIndex: 1300,
          background: "linear-gradient(45deg, #3498db, #2c3e50)",
          color: "#ecf0f1",
          "&:hover": { background: "linear-gradient(45deg, #2980b9, #2c3e50)" },
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
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
            background: "linear-gradient(45deg, #3498db, #2c3e50)",
            color: "#ecf0f1",
            borderRight: "none",
            borderRadius: "0 8px 8px 0",
            boxShadow: "4px 0 10px rgba(0, 0, 0, 0.1)",
            height: "100%",
            overflow: "hidden" // Prevent outer scrolling
          },
        }}
      >
        <NavContent />
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
            width: 280,
            boxSizing: "border-box",
            background: "linear-gradient(45deg, #3498db, #2c3e50)",
            color: "#ecf0f1",
            borderRight: "none",
            boxShadow: "4px 0 10px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <NavContent />
      </Drawer>
    </>
  );
};

export default NavBar;