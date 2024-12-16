import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const BottomNav = ({ role, viewMode, onSwitchView }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Korist Nav Öğeleri
  const userNavItems = [
    { label: null, icon: <HomeIcon />, path: '/user-dashboard' },
    { label: null, icon: <AssignmentTurnedInIcon />, path: '/my-attendance' },
    { label: null, icon: <AccountBalanceIcon />, path: '/my-fees' },
    { label: null, icon: <EventNoteIcon />, path: '/calendar-view' },
  ];

  // Yönetim Görünümü Nav Öğeleri
  const managementNavItems = [
    { label: null, icon: <HomeIcon />, path: '/management-dashboard' },
    { label: null, icon: <AssignmentTurnedInIcon />, path: '/attendance-management' },
    { label: null, icon: <AccountBalanceIcon />, path: '/fee-management' },
    { label: null, icon: <EventNoteIcon />, path: '/calendar-management' },
  ];

  // Master Admin Görünümü Nav Öğeleri
  const adminNavItems = [
    { label: null, icon: <HomeIcon />, path: '/master-admin-dashboard' },
    { label: null, icon: <AssignmentTurnedInIcon />, path: '/attendance-management' },
    { label: null, icon: <AccountBalanceIcon />, path: '/fee-management' },
    { label: null, icon: <EventNoteIcon />, path: '/calendar-management' },
  ];

  // Aktif navItems
  const navItems =
    role === 'Master Admin'
      ? viewMode === 'korist'
        ? [...userNavItems.slice(0, 2), { label: null, icon: (
            <AdminPanelSettingsIcon
              sx={{ color: '#ffffff' }} // Beyaz switch rengi
            />
          ), action: onSwitchView }, ...userNavItems.slice(2)]
        : [...adminNavItems.slice(0, 2), { label: null, icon: (
            <AdminPanelSettingsIcon
              sx={{ color: '#000000' }} // Siyah switch rengi
            />
          ), action: onSwitchView }, ...adminNavItems.slice(2)]
      : role === 'Yönetim Kurulu'
      ? viewMode === 'korist'
        ? [...userNavItems.slice(0, 2), { label: null, icon: (
            <AdminPanelSettingsIcon
              sx={{ color: '#ffffff' }}
            />
          ), action: onSwitchView }, ...userNavItems.slice(2)]
        : [...managementNavItems.slice(0, 2), { label: null, icon: (
            <AdminPanelSettingsIcon
              sx={{ color: '#000000' }}
            />
          ), action: onSwitchView }, ...managementNavItems.slice(2)]
      : userNavItems;

  // Geçerli rota indeksini hesapla
  const currentValue = navItems.findIndex((item) => item.path === location.pathname);

  return (
    <BottomNavigation
  value={currentValue >= 0 ? currentValue : -1}
  onChange={(event, newValue) => {
    const selectedItem = navItems[newValue];
    if (selectedItem.action) {
      selectedItem.action(); // Switch için özel işlem
    } else if (selectedItem.path) {
      navigate(selectedItem.path);
    }
  }}
  sx={{
    position: 'fixed', // Sabit konumda tutar
    bottom: 0, // Sayfanın altına sabitler
    width: '100vw', // Ekranın genişliğine %100 oturur
    zIndex: 1000, // Diğer içeriklerin üstünde görünmesini sağlar
    backgroundColor: viewMode === 'korist' ? '#ff5722' : '#283593', // Renk ayarı
    color: '#ffffff', // Yazı ve ikon rengi
    borderTop: viewMode === 'korist' ? '4px solid #bf360c' : '4px solid #1a237e', // Çerçeve
    height: { xs: '56px', sm: '64px' }, // Yükseklik
    transition: 'all 0.3s ease', // Geçiş animasyonu
    boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.1)', // Hafif gölge
  }}
>
  {navItems.map((item, index) => (
    <BottomNavigationAction
      key={index}
      icon={item.icon}
      value={index}
      sx={{
        color: location.pathname === item.path
          ? viewMode === 'korist' ? '#ffffff' : '#000000' // Aktif ikon rengi
          : '#cccccc', // Pasif ikon rengi
          marginX: '0px', // Butonlar arasında yatay boşluk

      }}
    />
  ))}
</BottomNavigation>

  );
};

export default BottomNav;
