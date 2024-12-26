// MyAttendance.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { green, red, yellow, blue } from '@mui/material/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import PieChartIcon from '@mui/icons-material/PieChart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const MyAttendance = () => {
  const [attendances, setAttendances] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')); // Kullanıcı bilgisi
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!user || !user._id) {
      alert('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      window.location.href = '/';
      return;
    }

    const fetchMyAttendance = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/attendance/${user._id}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setAttendances(data);
        } else {
          console.error('API beklenmeyen bir yanıt döndü:', data);
        }
      } catch (error) {
        console.error('Devamsızlık verileri yüklenemedi:', error);
      }
    };

    fetchMyAttendance();
  }, [user]);

  // Geçmiş ve bugünkü tarihler için filtreleme ve sıralama
  const pastAndTodayAttendances = attendances
    .filter((attendance) => {
      const attendanceDate = new Date(attendance.date);
      const today = new Date();
      return (
        attendanceDate <= today &&
        attendance.event?.type === 'Prova' // "Prova" türünü kontrol eder
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // En yakın tarihten en eskiye sıralama

  // Infografik Verilerini Hesaplama
  const totalWorkdays = attendances.filter((a) => a.event?.type === 'Prova').length;
  const daysAttended = attendances.filter((a) => a.status === 'GELDI' && a.event?.type === 'Prova').length;
  const daysMissed = attendances.filter((a) => a.status === 'GELMEDI' && a.event?.type === 'Prova').length;
  const daysExcused = attendances.filter((a) => a.status === 'MAZERETLI' && a.event?.type === 'Prova').length;
  const absencePercentage = totalWorkdays > 0 ? ((daysMissed / totalWorkdays) * 100).toFixed(2) : '0';

  // Grafik Verisi
  const pieData = [
    { name: 'Geldi', value: daysAttended },
    { name: 'Gelmedi', value: daysMissed },
    { name: 'Mazeretli', value: daysExcused },
  ];

  const COLORS = [green[500], red[500], yellow[700]];

  return (
    <Box p={2} sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh',  marginBottom: '50px' }}    >
      <Typography variant={isSmallScreen ? "h5" : "h4"} gutterBottom align="center" color="primary">
        📅 Katılım Geçmişim
      </Typography>

      {/* Kartlar Bölümü */}
      <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
        {/* Katıldın Kartı */}
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: blue[50],
              textAlign: 'center',
              padding: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <CardContent>
              <Avatar sx={{ bgcolor: blue[500], margin: '0 auto', mb: 1, width: 40, height: 40 }}>
                <CheckCircleIcon fontSize="small" />
              </Avatar>
              <Typography variant="subtitle2">Katıldın</Typography>
              <Typography variant="h6" color="textPrimary">
                {daysAttended} / {totalWorkdays}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Eksik Günler Kartı */}
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: red[50],
              textAlign: 'center',
              padding: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <CardContent>
              <Avatar sx={{ bgcolor: red[500], margin: '0 auto', mb: 1, width: 40, height: 40 }}>
                <CancelIcon fontSize="small" />
              </Avatar>
              <Typography variant="subtitle2">Eksik Günler</Typography>
              <Typography variant="h6" color="textPrimary">
                {daysMissed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Mazeretli Günler Kartı */}
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: yellow[50],
              textAlign: 'center',
              padding: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <CardContent>
              <Avatar sx={{ bgcolor: yellow[700], margin: '0 auto', mb: 1, width: 40, height: 40 }}>
                <EmojiObjectsIcon fontSize="small" />
              </Avatar>
              <Typography variant="subtitle2">Mazeretli</Typography>
              <Typography variant="h6" color="textPrimary">
                {daysExcused}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Devamsızlık Yüzdesi Kartı */}
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              backgroundColor: '#e0f7fa',
              textAlign: 'center',
              padding: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            <CardContent>
              <Avatar sx={{ bgcolor: '#00bcd4', margin: '0 auto', mb: 1, width: 40, height: 40 }}>
                <PieChartIcon fontSize="small" />
              </Avatar>
              <Typography variant="subtitle2">Devamsızlık %</Typography>
              <Typography variant="h6" color="textPrimary">
                {absencePercentage}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grafik Bölümü */}
      <Box mt={4} sx={{ height: 250 }}>
        <Typography variant="h6" gutterBottom align="center">
          📊 Devam Durumunuz
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={isSmallScreen ? 60 : 80}
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Devamsızlık Tablosu */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom align="center">
          📋 Detaylı Devamsızlık Kayıtları
        </Typography>
        <Box sx={{ maxHeight: '40vh', overflowY: 'auto', mt: 2 }}>
          <Grid container spacing={1} justifyContent="center">
            {pastAndTodayAttendances.length > 0 ? (
              pastAndTodayAttendances.map((attendance) => (
                <Grid item xs={12} sm={6} md={4} key={attendance._id}>
                  <Card
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 1,
                      backgroundColor:
                        attendance.status === 'GELDI'
                          ? green[50]
                          : attendance.status === 'GELMEDI'
                          ? red[50]
                          : attendance.status === 'MAZERETLI'
                          ? yellow[50]
                          : 'grey.100',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor:
                          attendance.status === 'GELDI'
                            ? green[500]
                            : attendance.status === 'GELMEDI'
                            ? red[500]
                            : attendance.status === 'MAZERETLI'
                            ? yellow[700]
                            : 'grey',
                        marginRight: 1,
                        width: 30,
                        height: 30,
                      }}
                    >
                      {attendance.status === 'GELDI' ? (
                        <CheckCircleIcon fontSize="small" />
                      ) : attendance.status === 'GELMEDI' ? (
                        <CancelIcon fontSize="small" />
                      ) : attendance.status === 'MAZERETLI' ? (
                        <EmojiObjectsIcon fontSize="small" />
                      ) : (
                        <PieChartIcon fontSize="small" />
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {new Date(attendance.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {attendance.status}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography variant="body2" align="center" color="textSecondary">
                Hiç devamsızlık kaydı bulunamadı.
              </Typography>
            )}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default MyAttendance;
