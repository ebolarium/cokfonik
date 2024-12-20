import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';

const CustomAppBar = ({ userName, viewMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadAnnouncements = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements`);
      const data = await response.json();

      const user = JSON.parse(localStorage.getItem('user'));
      const unreadAnnouncements = data.filter(
        (announcement) => !announcement.readBy.includes(user._id)
      );
      setUnreadCount(unreadAnnouncements.length);
    } catch (error) {
      console.error('Okunmamış duyurular alınamadı:', error);
    }
  };

  useEffect(() => {
    fetchUnreadAnnouncements(); // İlk yükleme sırasında çağırılıyor
  }, []);

  useEffect(() => {
    window.addEventListener('updateUnreadCount', fetchUnreadAnnouncements);
    return () => {
      window.removeEventListener('updateUnreadCount', fetchUnreadAnnouncements);
    };
  }, []);

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
