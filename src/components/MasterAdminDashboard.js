import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MasterAdminDashboard = () => {
  const navigate = useNavigate();

  // Toplam kullanıcı ve donduran sayısını tutacak state'ler
  const [totalUsers, setTotalUsers] = useState(0);
  const [frozenUsers, setFrozenUsers] = useState(0);

  const dashboardItems = [
    {
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcı ekle, düzenle, sil',
      path: '/users',
    },
    {
      title: 'Aidat Durumu',
      description: 'Aidat ödemelerini görüntüle',
      path: '/fee-management',
    },
    {
      title: 'Devamsızlık Durumu',
      description: 'Korist devamsızlıklarını işle',
      path: '/attendance-management',
    },
    {
      title: 'Konser ve Prova Takvimi',
      description: 'Etkinlik tarihlerini düzenle',
      path: '/calendar-management',
    },
    {
      title: 'Duyuru Yönetimi',
      description: 'Duyuruları oluştur ve yönet',
      path: '/announcement-management',
    },
  ];

  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        setTotalUsers(data.length);
        // Dondurulmuş (frozen: true) kullanıcıları sayıyoruz
        const frozenCount = data.filter((user) => user.frozen === true).length;
        setFrozenUsers(frozenCount);
      } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
      }
    };

    fetchUsersCount();
  }, []);

  return (
    <Box
      p={3}
      bgcolor="#f5f5f5"
      minHeight="100vh"
      sx={{
        marginBottom: '64px', // BottomNav yüksekliğine göre ayarla
        overflow: 'auto',
      }}
    >
      <Typography variant="h5" gutterBottom align="center">
        Admin Panel
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
                <Typography variant="h6">{item.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {item.description}
                </Typography>

                {/* Kullanıcı Yönetimi kartında hem üye hem donduran sayısı gösteriyoruz */}
                {item.title === 'Kullanıcı Yönetimi' && (
                  <>
                    <Typography variant="body2" color="textSecondary">
                      Üye: {totalUsers} |  Donduran: {frozenUsers}
                    </Typography>
                   </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MasterAdminDashboard;
