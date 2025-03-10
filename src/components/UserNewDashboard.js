import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  Avatar, 
  Divider, 
  CircularProgress, 
  Badge,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CalendarMonth as CalendarIcon,
  MusicNote as MusicIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Payment as PaymentIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Özel stil bileşenleri
const DashboardCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
  borderRadius: 16,
  overflow: 'hidden'
}));

const CardHeader = styled(Box)(({ theme, color = 'primary.main' }) => ({
  backgroundColor: theme.palette[color.split('.')[0]][color.split('.')[1] || 'main'],
  color: '#fff',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#e74c3c',
    color: 'white',
  },
}));

const ExpandButton = styled(IconButton)(({ theme, expanded }) => ({
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const UserNewDashboard = ({ fetchUnreadAnnouncements }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [attendancePercentage, setAttendancePercentage] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unpaidFees, setUnpaidFees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [birthdayUsers, setBirthdayUsers] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    events: true,
    birthdays: false
  });

  // Kullanıcı bilgilerini al
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
  }, []);

  // Yoklama yüzdesini getir
  const fetchAttendancePercentage = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?._id;
      if (!userId) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/attendance/percentage/${userId}`);
      const data = await response.json();
      setAttendancePercentage(data.percentage);
    } catch (error) {
      console.error('Yoklama yüzdesi alınamadı:', error);
    }
  };

  // Yaklaşan etkinlikleri getir
  const fetchUpcomingEvents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events/upcoming`);
      const data = await response.json();
      setUpcomingEvents(data.slice(0, 3)); // Sadece ilk 3 etkinliği göster
    } catch (error) {
      console.error('Etkinlikler alınamadı:', error);
    }
  };

  // Doğum günü olan kullanıcıları getir
  const fetchBirthdayUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
      const users = await response.json();
      
      // Bugünün tarihini al
      const today = new Date();
      
      // Bugün doğum günü olan kullanıcıları filtrele
      const birthdayPeople = users.filter(user => {
        if (!user.birthDate) return false;
        
        const birthDate = new Date(user.birthDate);
        return birthDate.getDate() === today.getDate() && 
               birthDate.getMonth() === today.getMonth();
      });
      
      setBirthdayUsers(birthdayPeople);
    } catch (error) {
      console.error('Doğum günleri alınamadı:', error);
    }
  };

  // Ödenmemiş aidat sayısını getir
  const checkUnpaidFees = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?._id;
      if (!userId) return;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/fees/check-unpaid/${userId}`);
      const data = await response.json();
      setUnpaidFees(data.unpaidCount || 0);
    } catch (error) {
      console.error('Ödenmemiş aidat bilgisi alınamadı:', error);
    }
  };

  // Okunmamış duyuru sayısını getir
  const getUnreadCount = async () => {
    if (fetchUnreadAnnouncements) {
      const count = await fetchUnreadAnnouncements();
      setUnreadCount(count);
    }
  };

  // Tüm verileri yükle
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAttendancePercentage(),
        fetchUpcomingEvents(),
        checkUnpaidFees(),
        getUnreadCount(),
        fetchBirthdayUsers()
      ]);
      setLoading(false);
    };

    loadAllData();
  }, [fetchUnreadAnnouncements]);

  // Bölüm genişletme/daraltma işlevi
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Yoklama yüzdesi rengi
  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return 'success.main';
    if (percentage >= 60) return 'warning.main';
    return 'error.main';
  };

  // Tarih formatı
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Saat formatı
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, pb: { xs: '72px', sm: '80px' } }}>
      {/* Üst Kısım - Kullanıcı Bilgileri */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            src={user?.profilePhoto} 
            alt={user?.name}
            sx={{ width: 80, height: 80, mr: 2, border: '3px solid white' }}
          />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Merhaba, {user?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.part || 'Parti Belirtilmemiş'}
            </Typography>
            <Chip 
              label={`Yoklama: ${attendancePercentage !== null ? `%${attendancePercentage}` : 'Hesaplanıyor...'}`}
              sx={{ 
                mt: 1, 
                bgcolor: attendancePercentage !== null ? getPercentageColor(attendancePercentage) : 'grey.400',
                color: 'white'
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Ana Kartlar */}
      <Grid container spacing={3} mb={4}>
        {/* Aidat Kartı */}
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard onClick={() => navigate('/my-fees')}>
            <CardHeader color="primary.main">
              <Typography variant="h6" fontWeight="bold">Aidat</Typography>
              <PaymentIcon />
            </CardHeader>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              {unpaidFees > 0 ? (
                <>
                  <Typography variant="h4" color="error.main" fontWeight="bold">
                    {unpaidFees}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Ödenmemiş Aidat
                  </Typography>
                </>
              ) : (
                <>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" align="center">
                    Tüm aidatlar ödenmiş
                  </Typography>
                </>
              )}
            </CardContent>
          </DashboardCard>
        </Grid>

        {/* Yoklama Kartı */}
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard onClick={() => navigate('/my-attendance')}>
            <CardHeader color="success.main">
              <Typography variant="h6" fontWeight="bold">Yoklama</Typography>
              <CheckCircleIcon />
            </CardHeader>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              {attendancePercentage !== null ? (
                <>
                  <Box position="relative" display="inline-flex" mb={1}>
                    <CircularProgress 
                      variant="determinate" 
                      value={attendancePercentage} 
                      size={60}
                      sx={{ color: getPercentageColor(attendancePercentage) }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" fontWeight="bold">
                        %{attendancePercentage}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Katılım Oranı
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  Yoklama bilgisi yükleniyor...
                </Typography>
              )}
            </CardContent>
          </DashboardCard>
        </Grid>

        {/* Duyurular Kartı */}
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard onClick={() => navigate('/announcements')}>
            <CardHeader color="warning.main">
              <Typography variant="h6" fontWeight="bold">Duyurular</Typography>
              <StyledBadge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </StyledBadge>
            </CardHeader>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              {unreadCount > 0 ? (
                <>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {unreadCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Okunmamış Duyuru
                  </Typography>
                </>
              ) : (
                <>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" align="center">
                    Tüm duyurular okundu
                  </Typography>
                </>
              )}
            </CardContent>
          </DashboardCard>
        </Grid>

        {/* Müzik Kartı */}
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard onClick={() => navigate('/midi-player')}>
            <CardHeader color="info.main">
              <Typography variant="h6" fontWeight="bold">Müzik</Typography>
              <MusicIcon />
            </CardHeader>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <MusicIcon sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                Parçaları Dinle
              </Typography>
            </CardContent>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* Yaklaşan Etkinlikler */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          onClick={() => toggleSection('events')}
          sx={{ cursor: 'pointer' }}
        >
          <Box display="flex" alignItems="center">
            <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Yaklaşan Etkinlikler</Typography>
          </Box>
          <ExpandButton expanded={expandedSections.events}>
            {expandedSections.events ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ExpandButton>
        </Box>
        
        <Collapse in={expandedSections.events}>
          <Divider sx={{ my: 1 }} />
          
          {upcomingEvents.length > 0 ? (
            <List sx={{ width: '100%' }}>
              {upcomingEvents.map((event) => (
                <ListItem key={event._id} alignItems="flex-start" sx={{ px: 1 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: event.type === 'Prova' ? 'primary.main' : 'secondary.main' }}>
                      {event.type === 'Prova' ? 'P' : 'K'}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {formatDate(event.date)} - {formatTime(event.date)}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.secondary">
                          {event.location}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box p={2} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                Yaklaşan etkinlik bulunmuyor.
              </Typography>
            </Box>
          )}
          
          <Box display="flex" justifyContent="center" mt={1}>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<CalendarIcon />}
              onClick={() => navigate('/calendar-view')}
              size="small"
            >
              Tüm Takvimi Görüntüle
            </Button>
          </Box>
        </Collapse>
      </Paper>

      {/* Doğum Günleri */}
      {birthdayUsers.length > 0 && (
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            onClick={() => toggleSection('birthdays')}
            sx={{ cursor: 'pointer' }}
          >
            <Box display="flex" alignItems="center">
              <CelebrationIcon sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="h6">Bugün Doğum Günü Olanlar</Typography>
            </Box>
            <ExpandButton expanded={expandedSections.birthdays}>
              {expandedSections.birthdays ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ExpandButton>
          </Box>
          
          <Collapse in={expandedSections.birthdays}>
            <Divider sx={{ my: 1 }} />
            
            <List sx={{ width: '100%' }}>
              {birthdayUsers.map((birthdayUser) => (
                <ListItem key={birthdayUser._id} alignItems="flex-start" sx={{ px: 1 }}>
                  <ListItemIcon>
                    <Avatar src={birthdayUser.profilePhoto}>
                      {birthdayUser.name.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={`${birthdayUser.name} ${birthdayUser.surname}`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary">
                          {birthdayUser.part || 'Parti belirtilmemiş'}
                        </Typography>
                      </>
                    }
                  />
                  <Chip 
                    label="Doğum Günü" 
                    color="secondary" 
                    size="small" 
                    icon={<CelebrationIcon />} 
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Paper>
      )}

      {/* Hızlı Erişim Butonları */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} sm={3}>
          <Button 
            fullWidth 
            variant="outlined" 
            startIcon={<PersonIcon />}
            onClick={() => navigate('/profile')}
            sx={{ borderRadius: 2, py: 1 }}
          >
            Profilim
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button 
            fullWidth 
            variant="outlined" 
            startIcon={<CalendarIcon />}
            onClick={() => navigate('/calendar-view')}
            sx={{ borderRadius: 2, py: 1 }}
          >
            Takvim
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button 
            fullWidth 
            variant="outlined" 
            startIcon={<MusicIcon />}
            onClick={() => navigate('/midi-player')}
            sx={{ borderRadius: 2, py: 1 }}
          >
            Müzik
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button 
            fullWidth 
            variant="outlined" 
            startIcon={<NotificationsIcon />}
            onClick={() => navigate('/announcements')}
            sx={{ borderRadius: 2, py: 1 }}
          >
            Duyurular
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserNewDashboard; 