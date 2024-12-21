import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PaymentsIcon from '@mui/icons-material/Payments';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CampaignIcon from '@mui/icons-material/Campaign';

const ManagementDashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: 'Aidat Durumu',
      description: 'Aidat ödemelerini ekle/görüntüle',
      path: '/fee-management',
      icon: <PaymentsIcon />,
    },
    {
      title: 'Devamsızlık Durumu',
      description: 'Korist devamsızlıklarını işle',
      path: '/attendance-management',
      icon: <PersonOffIcon />,
    },
    {
      title: 'Konser ve Prova Takvimi',
      description: 'Etkinlik tarihlerini gir',
      path: '/calendar-management',
      icon: <CalendarMonthIcon />,
    },
    {
      title: 'Duyuru Yönetimi',
      description: 'Duyuruları oluştur ve yönet',
      path: '/announcement-management',
      icon: <CampaignIcon />,
    },
  ];

  return (
    <Box p={3} bgcolor="#f5f5f5" minHeight="100vh"
    sx={{
      marginBottom: '64px', // BottomNav yüksekliğine göre ayarla
      overflow: 'auto' // Gerekirse kaydırma
    }}
    >
      <Typography variant="h4" gutterBottom>
        Yönetim Paneli
      </Typography>
      <Grid container spacing={3}>
        {dashboardItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #ccc',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
              }}
              onClick={() => navigate(item.path)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  {item.icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {item.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ManagementDashboard;
