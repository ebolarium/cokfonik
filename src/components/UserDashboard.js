import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const UserDashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: 'Yoklama',
      path: '/my-attendance',
      icon: <AssignmentTurnedInIcon style={{ fontSize: 50 }} />,
      bgColor: '#f0f8ff',
    },
    {
      title: 'Aidat',
      path: '/my-fees',
      icon: <AccountBalanceIcon style={{ fontSize: 50 }} />,
      bgColor: '#e6ffe6',
    },
    {
      title: 'Takvim',
      path: '/calendar-view',
      icon: <EventNoteIcon style={{ fontSize: 50 }} />,
      bgColor: '#ffe6e6',
    },
  ];

  return (
    <Box minHeight="100vh" bgcolor="#f9f9f9">
      {/* Dashboard İçeriği */}
      <Box p={3}>
        <Grid container spacing={2}>
          {dashboardItems.map((item, index) => (
            <Grid
              item
              xs={6} // Her kutu ekranın %50'sini kaplayacak
              key={index}
              style={{
                display: 'flex',
                justifyContent: index === 2 ? 'flex-start' : 'center', // 3. kutu sola dayalı
                alignItems: 'center',
              }}
            >
              <Card
                style={{
                  width: '90%',
                  aspectRatio: '1/1', // Kare kutular
                  backgroundColor: item.bgColor,
                  color: '#333',
                  textAlign: 'center',
                  borderRadius: 10,
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => navigate(item.path)}
              >
                <CardContent>
                  <Box>{item.icon}</Box>
                  <Typography variant="h6">{item.title}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default UserDashboard;
