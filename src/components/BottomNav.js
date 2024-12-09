import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EventNoteIcon from '@mui/icons-material/EventNote';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Ana Sayfa', icon: <HomeIcon />, path: '/user-dashboard' },
    { label: 'Yoklama', icon: <AssignmentTurnedInIcon />, path: '/my-attendance' },
    { label: 'Aidat', icon: <AccountBalanceIcon />, path: '/my-fees' },
    { label: 'Takvim', icon: <EventNoteIcon />, path: '/calendar-view' },
  ];

  return (
    <BottomNavigation
      value={navItems.findIndex((item) => item.path === location.pathname)} // Aktif yolu belirle
      onChange={(event, newValue) => navigate(navItems[newValue].path)}
      showLabels={false}
      style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        zIndex: 1000,
        backgroundColor: '#fff',
        boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {navItems.map((item, index) => (
        <BottomNavigationAction
          key={index}
          label={item.label}
          icon={item.icon}
          value={index}
          style={{
            color: location.pathname === item.path ? '#1976d2' : '#666',
          }}
        />
      ))}
    </BottomNavigation>
  );
};

export default BottomNav;
