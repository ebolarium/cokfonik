import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
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

  // Kullanıcının rol bilgisi (appbar rengini belirlemek için)
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user?.role || ''; // Örn: "Master Admin", "Yönetim Kurulu", "Şef", vb.

  return (
    <AppBar
      position="sticky"
      sx={{
        // Rol ve viewMode'a göre appbar rengi
        backgroundColor:
          userRole === 'Şef'
            ? '#9c27b0' // Mor (primary)
            : viewMode === 'korist'
            ? '#ff5722' // Turuncu
            : '#283593', // Lacivert
        // Rol ve viewMode'a göre alt çerçeve rengi
        borderBottom:
          userRole === 'Şef'
            ? '4px solid #4a148c' // Daha koyu mor
            : viewMode === 'korist'
            ? '4px solid #bf360c' // Koyu turuncu
            : '4px solid #1a237e', // Koyu lacivert
        transition: 'all 0.3s ease',
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
