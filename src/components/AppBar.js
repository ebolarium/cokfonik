import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';

const CustomAppBar = ({ userName, viewMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: viewMode === 'korist' ? '#ff5722' : '#283593', // Korist için turuncu, Yönetici için lacivert
        boxShadow: viewMode === 'korist'
          ? '0 4px 15px rgba(255, 87, 34, 0.8)' // Korist için turuncu gölge
          : '0 4px 15px rgba(40, 53, 147, 0.8)', // Yönetici için lacivert gölge
        borderBottom: viewMode === 'korist'
          ? '4px solid #bf360c' // Korist için koyu turuncu çerçeve
          : '4px solid #1a237e', // Yönetici için koyu lacivert çerçeve
        transition: 'all 0.3s ease', // Yumuşak geçiş efekti
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Hoş Geldin, {userName || 'Misafir'}
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
        <MenuItem onClick={() => (window.location.href = '/profile')}>Profil</MenuItem>
        <MenuItem onClick={handleMenuClose}>Ayarlar</MenuItem>
        <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
      </Menu>
    </AppBar>
  );
};

export default CustomAppBar;
