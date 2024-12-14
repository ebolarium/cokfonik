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
        ? [...userNavItems.slice(0, 2), { label: null, icon: <AdminPanelSettingsIcon />, action: onSwitchView }, ...userNavItems.slice(2)]
        : [...adminNavItems.slice(0, 2), { label: null, icon: <AdminPanelSettingsIcon />, action: onSwitchView }, ...adminNavItems.slice(2)]
      : role === 'Yönetim Kurulu'
      ? viewMode === 'korist'
        ? [...userNavItems.slice(0, 2), { label: null, icon: <AdminPanelSettingsIcon />, action: onSwitchView }, ...userNavItems.slice(2)]
        : [...managementNavItems.slice(0, 2), { label: null, icon: <AdminPanelSettingsIcon />, action: onSwitchView }, ...managementNavItems.slice(2)]
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
  showLabels={false}
  sx={{
    position: 'fixed', // Sabit konumda tutar
    bottom: 0, // Sayfanın altına sabitler
    width: '100%', // Ekranın genişliğine %100 oturur
    zIndex: 1000, // Diğer içeriklerin üstünde görünmesini sağlar
    backgroundColor: '#fff', // Arkaplan rengi
    boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.1)', // Hafif bir gölge ekler
    paddingX: { xs: 1, sm: 2 }, // Küçük ve büyük ekranlarda yan boşluklar
    height: { xs: '56px', sm: '64px' }, // Navbar yüksekliği cihaz ekranına göre değişir
  }}
>
      {navItems.map((item, index) => (
        <BottomNavigationAction
          key={index}
          icon={item.icon}
          value={index}
          style={{
            color: location.pathname === item.path ? '#1976d2' : '#666',
            minWidth: 'auto', // Eylem butonlarının genişliğini içeriğe göre ayarlar

          }}
        />
      ))}
    </BottomNavigation>
  );
};

export default BottomNav;
