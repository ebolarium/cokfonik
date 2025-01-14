// ManagementDashboard.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress // Spinner bileşenini içe aktar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PaymentsIcon from '@mui/icons-material/Payments';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CampaignIcon from '@mui/icons-material/Campaign';
// Eklenen icon
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const ManagementDashboard = () => {
  const navigate = useNavigate();

  // Mevcut state'ler
  const [totalUsers, setTotalUsers] = useState(0);
  const [frozenUsers, setFrozenUsers] = useState(0);

  // YENİ: Uyarı state'leri ve loading state
  const [overdueFeeCount, setOverdueFeeCount] = useState(0);     // 2 aydır aidat ödemeyen
  const [repeatedAbsCount, setRepeatedAbsCount] = useState(0);   // 4 çalışma üst üste gelmeyen
  const [loadingSummary, setLoadingSummary] = useState(true);    // Yüklenme durumu

  // Dashboard öğeleri (Aynı kalabilir)
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

  // Kullanıcı verisi çek (mevcut)
  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
        if (!response.ok) {
          throw new Error(`API Hatası: ${response.status}`);
        }
        const data = await response.json();
        setTotalUsers(data.length);
        // frozen === true olanları say
        const frozenCount = data.filter((user) => user.frozen === true).length;
        setFrozenUsers(frozenCount);
      } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
      }
    };

    fetchUsersCount();
  }, []);

  // YENİ: 2 aydır aidat ödemeyen ve 4 çalışma üst üste gelmeyen kişi sayısı
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/management/summary`);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json(); 
        // data => { overdueFeeCount, repeatedAbsCount }

        setOverdueFeeCount(data.overdueFeeCount);
        setRepeatedAbsCount(data.repeatedAbsCount);
        setLoadingSummary(false); // Yüklenme tamamlandı
      } catch (error) {
        console.error('Management summary hata:', error);
        setLoadingSummary(false); // Hata olsa bile yüklenme tamamlandı
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
      <Typography variant="h4" gutterBottom>
        Yönetim Paneli
      </Typography>

      {/* Üye ve Donduran sayısını göster (mevcut) */}
      <Typography variant="body1" gutterBottom>
        Üye: {totalUsers} | Donduran: {frozenUsers}
      </Typography>

      {/* YENİ: Tek sarı kart içinde iki satırlık uyarı */}
      <Card sx={{ backgroundColor: '#fffde7', mb: 3 }}> 
        <CardContent>
          {/* 1. Satır: Aidat uyarısı */}
          <Typography
            variant="subtitle1"
            color="text.primary"
            display="flex"
            alignItems="center"
          >
            <WarningAmberIcon sx={{ mr: 1 }} />
            2 aydır aidat ödemeyen {loadingSummary ? <CircularProgress size={20} /> : overdueFeeCount} kişi!
          </Typography>

          {/* 2. Satır: Devamsızlık uyarısı */}
          <Typography
            variant="subtitle1"
            color="text.primary"
            display="flex"
            alignItems="center"
            mt={1}  // Biraz dikey boşluk
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ManagementDashboard;
