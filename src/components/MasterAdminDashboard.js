import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// İkonları içe aktarın
import PeopleIcon from '@mui/icons-material/People';
import PaymentsIcon from '@mui/icons-material/Payments';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CampaignIcon from '@mui/icons-material/Campaign';

const MasterAdminDashboard = () => {
  const navigate = useNavigate();

  const [totalUsers, setTotalUsers] = useState(0);
  const [frozenUsers, setFrozenUsers] = useState(0);
  const [overdueFeeCount, setOverdueFeeCount] = useState(0);
  const [repeatedAbsCount, setRepeatedAbsCount] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const dashboardItems = [
    {
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcı ekle, düzenle, sil',
      path: '/users',
      icon: <PeopleIcon fontSize="large" />
    },
    {
      title: 'Aidat Durumu',
      description: 'Aidat ödemelerini görüntüle',
      path: '/fee-management',
      icon: <PaymentsIcon fontSize="large" />
    },
    {
      title: 'Devamsızlık Durumu',
      description: 'Korist devamsızlıklarını işle',
      path: '/attendance-management',
      icon: <PersonOffIcon fontSize="large" />
    },
    {
      title: 'Konser ve Prova Takvimi',
      description: 'Etkinlik tarihlerini düzenle',
      path: '/calendar-management',
      icon: <CalendarMonthIcon fontSize="large" />
    },
    {
      title: 'Duyuru Yönetimi',
      description: 'Duyuruları oluştur ve yönet',
      path: '/announcement-management',
      icon: <CampaignIcon fontSize="large" />
    },
  ];

  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        setTotalUsers(data.length);
        const frozenCount = data.filter(user => user.frozen === true).length;
        setFrozenUsers(frozenCount);
      } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
      }
    };
    fetchUsersCount();
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/management/summary`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        setOverdueFeeCount(data.overdueFeeCount);
        setRepeatedAbsCount(data.repeatedAbsCount);
        setLoadingSummary(false);
      } catch (error) {
        console.error('MasterAdmin summary error:', error);
        setLoadingSummary(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <Box
      p={3}
      bgcolor="#f5f5f5"
      minHeight="100vh"
      sx={{
        marginBottom: '64px',
        overflow: 'auto',
      }}
    >
      <Typography variant="h5" gutterBottom align="center">
        Admin Panel
      </Typography>

      <Card sx={{ backgroundColor: '#fffde7', mb: 3 }}> 
        <CardContent>
          <Typography
            variant="subtitle1"
            color="text.primary"
            display="flex"
            alignItems="center"
          >
            <WarningAmberIcon sx={{ mr: 1 }} />
            2 aydır aidat ödemeyen {loadingSummary ? <CircularProgress size={20} /> : overdueFeeCount} kişi!
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.primary"
            display="flex"
            alignItems="center"
            mt={1}
          >
            <WarningAmberIcon sx={{ mr: 1 }} />
            4 çalışma üst üste gelmeyen {loadingSummary ? <CircularProgress size={20} /> : repeatedAbsCount} kişi!
          </Typography>
        </CardContent>
      </Card>

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
                {item.title === 'Kullanıcı Yönetimi' && (
                  <Typography variant="body2" color="textSecondary" mt={1}>
                    Üye: {totalUsers} | Donduran: {frozenUsers}
                  </Typography>
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
