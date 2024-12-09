import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';

const CustomAppBar = ({ userName }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" color="default">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Hoş Geldin, {userName || 'Korist Adı'}
        </Typography>
        <IconButton color="inherit">
          <Badge badgeContent={1} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <IconButton edge="end" color="inherit" onClick={handleMenuOpen}>
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>Profil</MenuItem>
        <MenuItem onClick={handleMenuClose}>Ayarlar</MenuItem>
        <MenuItem
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
        >
          Çıkış Yap
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default CustomAppBar;
