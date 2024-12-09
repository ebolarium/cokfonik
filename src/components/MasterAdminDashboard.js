import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MasterAdminDashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    { title: 'Kullanıcı Yönetimi', description: 'Kullanıcı ekle, düzenle, sil', path: '/users' },
    { title: 'Aidat Durumu', description: 'Aidat ödemelerini görüntüle', path: '/fee-management' },
    { title: 'Devamsızlık Durumu', description: 'Korist devamsızlıklarını işle', path: '/attendance-management' },
    { title: 'Konser ve Prova Takvimi', description: 'Etkinlik tarihlerini düzenle', path: '/calendar-management' },
  ];

  return (
    <Box p={3} bgcolor="#f5f5f5" minHeight="100vh">
      <Typography variant="h4" gutterBottom>
        Master Admin Paneli
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
              onClick={() => navigate(item.path)} // React Router yönlendirmesi
            >
              <CardContent>
                <Typography variant="h6">{item.title}</Typography>
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

export default MasterAdminDashboard;
