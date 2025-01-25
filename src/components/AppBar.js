import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const CustomAppBar = ({ userName, viewMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [attendancePercentage, setAttendancePercentage] = useState(null);
  
  // user değişkenini en başta tanımlayalım
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user?.role || ''; // Örn: "Master Admin", "Yönetim Kurulu", "Şef", vb.

  const fetchUnreadAnnouncements = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements`);
      const data = await response.json();

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

  // Devam yüzdesini hesapla
  const fetchAttendancePercentage = async () => {
    try {
      const [attendancesRes, eventsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/attendance/${user._id}`),
        fetch(`${process.env.REACT_APP_API_URL}/events`)
      ]);

      const attendances = await attendancesRes.json();
      const events = await eventsRes.json();

      // Prova türündeki ve beklemede olmayan katılımları filtrele
      const provaAttendances = attendances.filter(a => 
        events.some(e => 
          e._id === a.event?._id && 
          e.type === 'Prova'
        ) && 
        a.status !== 'BEKLEMEDE'
      );

      // Gelinen prova sayısı
      const cameCount = provaAttendances.filter(a => a.status === 'GELDI').length;
      
      // Yüzde hesapla
      const percentage = provaAttendances.length > 0
        ? Math.round((cameCount / provaAttendances.length) * 100)
        : 0;

      setAttendancePercentage(percentage);
    } catch (error) {
      console.error('Devam yüzdesi hesaplanırken hata:', error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAttendancePercentage();
    }
  }, []);

  // Yüzde rengini belirle
  const getPercentageColor = (percentage) => {
    if (percentage >= 70) return '#4caf50'; // yeşil
    if (percentage >= 60) return '#ff9800'; // turuncu
    return '#f44336'; // kırmızı
  };

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
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">
            Hoş Geldin, {userName || 'Misafir'}
          </Typography>
          {attendancePercentage !== null && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              backgroundColor: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#000',
                  fontWeight: 'medium'
                }}
              >
                Devam:
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: getPercentageColor(attendancePercentage),
                  fontWeight: 'bold'
                }}
              >
                %{attendancePercentage}
              </Typography>
            </Box>
          )}
        </Box>
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
