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
        position: 'fixed',
        bottom: 0,
        width: '100%',
        zIndex: 1000,
        backgroundColor: viewMode === 'korist'
          ? '#ff5722' // Korist görünümü için turuncu
          : '#283593', // Admin görünümü için lacivert
        color: '#ffffff',
        boxShadow: viewMode === 'korist'
          ? '0 -4px 15px rgba(255, 87, 34, 0.8)' // Turuncu gölge
          : '0 -4px 15px rgba(40, 53, 147, 0.8)', // Lacivert gölge
        borderTop: viewMode === 'korist'
          ? '4px solid #bf360c' // Korist görünümü için koyu turuncu çerçeve
          : '4px solid #1a237e', // Admin görünümü için koyu lacivert çerçeve
        transition: 'all 0.3s ease', // Geçiş animasyonu
      }}
    >
      {navItems.map((item, index) => (
        <BottomNavigationAction
          key={index}
          icon={item.icon}
          value={index}
          sx={{
            color: location.pathname === item.path
              ? viewMode === 'korist'
                ? '#ffffff' // Aktif ikon rengi (korist modu)
                : '#000000' // Aktif ikon rengi (admin modu)
              : '#cccccc', // Pasif ikon rengi
          }}
        />
      ))}
    </BottomNavigation>
  );
};

export default BottomNav;
