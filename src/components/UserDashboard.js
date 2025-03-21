// src/components/UserDashboard.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Modal,
  Backdrop,
  Fade,
  Button,
  Badge,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import HearingIcon from '@mui/icons-material/Hearing';
import Confetti from 'react-confetti';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PaymentsIcon from '@mui/icons-material/Payments';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

// Yardımcı Fonksiyon: Base64 stringi Uint8Array'e çevirir
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [modalDismissed, setModalDismissed] = useState(false);
  const [attendancePercentage, setAttendancePercentage] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.name || '';

  // Duyuru State
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [open, setOpen] = useState(false);
  const [unpaidFeesModalOpen, setUnpaidFeesModalOpen] = useState(false);

  // Konfeti & Animasyon State
  const [showConfetti, setShowConfetti] = useState(false);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'fadingIn' | 'steady' | 'fadingOut'

  // Push Bildirim Modal State
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [pushPermission, setPushPermission] = useState(false);

  // Public VAPID Key
  const PUBLIC_VAPID_KEY = process.env.REACT_APP_PUBLIC_VAPID_KEY;

  // Devam yüzdesini hesapla
  const fetchAttendancePercentage = async () => {
    try {
      const [attendancesRes, eventsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/attendance/${user._id}`),
        fetch(`${process.env.REACT_APP_API_URL}/events`)
      ]);

      const attendances = await attendancesRes.json();
      const events = await eventsRes.json();

      // Prova türündeki ve beklemede olmayan katılımları filtrele
      const provaAttendances = attendances.filter(a => 
        events.some(e => 
          e._id === a.event?._id && 
          e.type === 'Prova'
        ) && 
        a.status !== 'BEKLEMEDE'
      );

      // Gelinen prova sayısı
      const cameCount = provaAttendances.filter(a => a.status === 'GELDI').length;
      
      // Yüzde hesapla
      const percentage = provaAttendances.length > 0
        ? Math.round((cameCount / provaAttendances.length) * 100)
        : 0;

      setAttendancePercentage(percentage);
    } catch (error) {
      console.error('Devam yüzdesi hesaplanırken hata:', error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAttendancePercentage();
    }
  }, []);

  // Yüzde rengini belirle
  const getPercentageColor = (percentage) => {
    if (percentage >= 70) return '#4caf50'; // yeşil
    if (percentage >= 60) return '#ff9800'; // turuncu
    return '#f44336'; // kırmızı
  };

  useEffect(() => {
    const checkUnpaidFees = async () => {
      try {
        // Tarih kontrolü
        const today = new Date();
        const dayOfMonth = today.getDate();
        
        // Sadece ayın 20'si ile 25'i arasında göster
        if (dayOfMonth < 20 || dayOfMonth > 25) {
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/fees/check-unpaid/${user._id}`);
        if (!response.ok) throw new Error('API yanıtı başarılı değil.');

        const data = await response.json();
        if (data.hasUnpaidFees && !modalDismissed) {
          setUnpaidCount(data.unpaidCount);
          setUnpaidFeesModalOpen(true);
        }
      } catch (error) {
        console.error('Aidat borcu kontrol edilirken hata oluştu:', error);
      }
    };

    if (user) checkUnpaidFees();
  }, [user, modalDismissed]); // modalDismissed state'ini dependency array'e ekledik

  // Modal kapatma fonksiyonu
  const handleCloseModal = () => {
    setUnpaidFeesModalOpen(false);
    setModalDismissed(true); // Modalın tekrar açılmasını engelle
  };

  // Duyuruları çek
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements`);
        const data = await response.json();

        const userId = user?._id;
        if (!userId) throw new Error('User ID not found in localStorage');

        // Gizlenmiş duyuruları filtrele
        const visibleAnnouncements = data.filter(
          (announcement) => !announcement.hiddenBy?.includes(userId)
        );
        setAnnouncements(visibleAnnouncements);
      } catch (error) {
        console.error('Duyurular yüklenemedi:', error);
      }
    };

    fetchAnnouncements();
  }, [user?._id]);

  // Okunmamış duyuru sayısı
  const unreadCount = announcements.filter((announcement) => {
    // readBy'daki her ID'yi string'e çevir
    const readByStringArray = announcement.readBy.map((id) => String(id));
    return !readByStringArray.includes(String(user?._id));
  }).length;

  // Duyuru okundu
  const markAsRead = async (id) => {
    const userId = user?._id;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        setAnnouncements((prev) =>
          prev.map((ann) =>
            ann._id === id
              ? { ...ann, readBy: [...ann.readBy, userId] }
              : ann
          )
        );
      }
    } catch (error) {
      console.error('Duyuru okundu olarak işaretlenirken hata:', error);
    }
  };

  // Duyuru gizle
  const hideAnnouncement = async (id) => {
    const userId = user?._id;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${id}/hide`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        // Başarıyla gizlenmiş duyuruyu local state'ten çıkar
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (error) {
      console.error('Duyuru gizlenirken hata:', error);
    }
  };

  // Duyuru modal aç/kapat
  const handleOpen = (announcement) => {
    // Okundu mu kontrolü için yine string dönüşümü
    const readByStringArray = announcement.readBy.map((id) => String(id));
    if (!readByStringArray.includes(String(user?._id))) {
      markAsRead(announcement._id);
    }
    setSelectedAnnouncement(announcement);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAnnouncement(null);
  };

  // Konfeti Gösterme Mantığı
  useEffect(() => {
    if (user?.birthDate) {
      const today = new Date();
      const birthDate = new Date(user.birthDate);
      
      const isBirthday =
        today.getDate() === birthDate.getDate() &&
        today.getMonth() === birthDate.getMonth();

      if (isBirthday) {
        const userId = user._id;
        // Bugünü YYYY-MM-DD formatında string yap
        const todayString = today.toISOString().split('T')[0]; 
        const birthdayKey = `birthdayConfettiShown_${userId}_${todayString}`;

        // 1) localStorage kontrolü
        const alreadyShown = localStorage.getItem(birthdayKey);

        if (!alreadyShown) {
          // Confetti göster
          setShowConfetti(true);
          setPhase('fadingIn');

          // 2) Gördüğünü kaydet
          localStorage.setItem(birthdayKey, 'true');
          
          // Fade in/out veya tıklanarak kapanma mantığını devam ettir
          setTimeout(() => {
            setPhase('steady');
          }, 1000);
        }
      }
    }
  }, [user?.birthDate]);

  // Konfeti Kapanış Tıklaması
  const handleClickClose = () => {
    // fade out
    setPhase('fadingOut');
    setTimeout(() => {
      setShowConfetti(false);
      setPhase('idle');
    }, 1000); // 1sn sonra DOM'dan kaldır
  };

  // Push Bildirim İzni Modali Açma
  useEffect(() => {
    const pushPermissionKey = `pushPermission_${user?._id}`;
    const permissionStatus = localStorage.getItem(pushPermissionKey);

    if (!permissionStatus) {
      setPushModalOpen(true);
    }
  }, [user?._id]);

  // Push Bildirim İzni Alma
  const handlePushPermissionChange = async (event) => {
    const { checked } = event.target;
    setPushPermission(checked);

    if (checked) {
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;

          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            if (!PUBLIC_VAPID_KEY) {
              console.error('PUBLIC_VAPID_KEY tanımlı değil.');
              alert('Sunucu tarafından sağlanan VAPID anahtarı bulunamadı.');
              return;
            }

            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
            });

            // Aboneliği backend'e gönder
            const response = await fetch(`${process.env.REACT_APP_API_URL}/subscribe`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(subscription),
            });

            if (response.ok) {
              //console.log('Push aboneliği başarılı.');
              const pushPermissionKey = `pushPermission_${user?._id}`;
              localStorage.setItem(pushPermissionKey, 'granted');
            } else {
              console.error('Abonelik backend\'e gönderilemedi.');
              alert('Push aboneliği başarısız oldu. Lütfen tekrar deneyin.');
            }
          } else {
            console.error('Push bildirimi izni reddedildi.');
            const pushPermissionKey = `pushPermission_${user?._id}`;
            localStorage.setItem(pushPermissionKey, 'denied');
          }
        }
      } catch (error) {
        console.error('Push aboneliği başarısız:', error);
        alert('Push aboneliği sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } else {
      // Kullanıcı push bildirimlerini reddederse veya iptal ederse
      const pushPermissionKey = `pushPermission_${user?._id}`;
      localStorage.setItem(pushPermissionKey, 'denied');
    }

    setPushModalOpen(false);
  };

  // Aidat sayısı güncelleme event listener'ı
  useEffect(() => {
    const handleUnpaidCountUpdate = (event) => {
      setUnpaidCount(event.detail.count);
    };

    window.addEventListener('updateUnpaidCount', handleUnpaidCountUpdate);
    return () => {
      window.removeEventListener('updateUnpaidCount', handleUnpaidCountUpdate);
    };
  }, []);

  // Dashboard Kartları
  const dashboardItems = [
    {
      title: 'Yoklama',
      path: '/my-attendance',
      icon: <AssignmentTurnedInIcon style={{ fontSize: 50 }} />,
      bgColor: '#f0f8ff',
      content: attendancePercentage !== null && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          mt: 1
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#2c3e50',
              fontWeight: 500,
              fontSize: '0.9rem',
            }}
          >
            Devam:
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: getPercentageColor(attendancePercentage),
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            %{attendancePercentage}
          </Typography>
        </Box>
      )
    },
    {
      title: 'Aidat',
      path: '/my-fees',
      icon: <AccountBalanceIcon style={{ fontSize: 50 }} />,
      bgColor: '#e6ffe6',
      content: (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#2c3e50',
              fontWeight: 500,
              fontSize: '0.9rem',
            }}
          >
            Eksik:
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: unpaidCount === 0 ? '#2c3e50' : '#e74c3c',
              fontWeight: 500,
              fontSize: '0.9rem',
            }}
          >
            {unpaidCount}{' '}
            {unpaidCount === 0 ? '🎉' : 
             unpaidCount === 1 ? '😱' : 
             '🚨'}
          </Typography>
        </Box>
      )
    },
    {
      title: 'Takvim',
      path: '/calendar-view',
      icon: <EventNoteIcon style={{ fontSize: 50 }} />,
      bgColor: '#ffe6e6',
    },
    {
      title: 'Duyurular',
      path: '/announcements',
      icon: <NotificationsIcon style={{ fontSize: 50 }} />,
      bgColor: '#fff8dc',
      content: unreadCount > 0 ? (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#e74c3c',
              fontWeight: 500,
              fontSize: '0.9rem',
            }}
          >
            {unreadCount} Yeni
          </Typography>
        </Box>
      ) : null
    },
    {
      title: 'Oyun',
      path: '/game',
      icon: <MusicNoteIcon style={{ fontSize: 50 }} />,
      bgColor: '#e6f7ff',
    },
    {
      title: 'Oyun 2',
      path: '/game2',
      icon: <HearingIcon style={{ fontSize: 50 }} />,
      bgColor: '#a6a6ff',
    },
  
  {
    title: 'Nota/Midi',
    link: 'https://drive.google.com/drive/folders/1paeqvHKubfoUEwh9v-4zjL64E0eBHf5r?usp=sharing',
    icon: <LibraryMusicIcon style={{ fontSize: 50 }} />,
    bgColor: '#e6e6ff',
  },
    {
      title: 'Müzik Çalar (Beta)',
      path: '/midi-player',
      icon: <PlayCircleIcon style={{ fontSize: 50 }} />,
      bgColor: '#d9f7be',
    },
  ];

  // Roller baz alınarak ek kartlar ekle
  if (user.role === 'Yoklama') {
    dashboardItems.push({
      title: 'Yoklama Yönetimi',
      path: '/attendance-management',
      icon: <AssignmentTurnedInIcon style={{ fontSize: 50 }} />,
      bgColor: '#f0f8ff',
    });
  }

  if (user.role === 'Aidat') {
    dashboardItems.push({
      title: 'Aidat Yönetimi',
      path: '/fee-management',
      icon: <PaymentsIcon style={{ fontSize: 50 }} />,
      bgColor: '#e6ffe6',
    });
  }

  // Public VAPID Key'in Doğruluğunu Kontrol Etme
  useEffect(() => {
    if (PUBLIC_VAPID_KEY) {
      try {
        // VAPID key'i doğru şekilde decode edilebiliyorsa
        urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
      } catch (error) {
        console.error('VAPID Public Key doğru formatta değil:', error);
      }
    } else {
      console.error('PUBLIC_VAPID_KEY tanımlı değil.');
    }
  }, [PUBLIC_VAPID_KEY]);

  // Public VAPID Key'i Loglama (Debug için)
  useEffect(() => {
  }, [PUBLIC_VAPID_KEY]);

  return (
    <Box minHeight="100vh" position="relative">
      {/* Konfeti & Mesaj */}
      {showConfetti && (
        <Box
          onClick={handleClickClose}
          sx={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'auto', // Tıklamayı yakalayabilelim
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'opacity 1s ease-in-out',
            opacity: phase === 'fadingIn' || phase === 'steady' ? 1 : 0,
            cursor: 'pointer',  // Kapanış için tıklandığını belirtmek adına
            zIndex: 9999,
          }}
        >
          <Confetti gravity={0.02} numberOfPieces={250} />

          {/* Mesaj Kutusu */}
          <Box
            sx={{
              position: 'absolute',
              maxWidth: '300px',
              textAlign: 'center',
              color: '#000',
              fontSize: { xs: '18px', md: '24px' },
              textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              p: 2,
              borderRadius: 2,
              whiteSpace: 'pre-line', // Satır atlamaları için
              transform: 'translateY(-5%)' // Biraz yukarı kaydırmak istersen
            }}
          >
            {`Sevgili ${userName},\n
Doğum gününü en içten duygularla tüm kalbimizle kutlarız 💝🎈🎊🎂🥂\n
Aramızda olduğun ve Çokfonik'e değer kattığın için çok mutluyuz😊\n
Sesinle ve gülüşünle Çokfonik'e adeta bir can suyu oldun💧\n
Neşeyle sağlıkla ve müzikle dolu bir yaş dileriz 🎶🎵🎼🥁🥂\n
İyi ki doğdun, iyi ki varsın 🌻💐🌹
`}
          </Box>
        </Box>
      )}

      {/* Aidat Borcu Modal */}
      <Modal
        open={unpaidFeesModalOpen}
        onClose={handleCloseModal}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2,
            borderRadius: 2,
            textAlign: 'center',
            fontSize: '16px', // Genel font büyüklüğü
            width: { xs: '90%', sm: '400px', md: '500px' }, // Responsive genişlik
            maxWidth: '90vw', // Ekran genişliğine göre sınırlama
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontSize: '24px', fontWeight: 'bold' }}>
            ⚠️ Aidat Bildirimi
          </Typography>
          <Typography gutterBottom sx={{ fontSize: '18px' }}>
            Ödenmemiş {unpaidCount} aylık aidatınız var. 😱
          </Typography>
          <Button variant="contained" color="primary" onClick={handleCloseModal}>
            Tamam
          </Button>
        </Box>
      </Modal>

      {/* Push Bildirim İzni Modali */}
      <Modal
        open={pushModalOpen}
        onClose={() => setPushModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={pushModalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              maxWidth: 400,
              width: '90%',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Bildirim İzinleri
            </Typography>
            <Typography variant="body2" gutterBottom>
              Uygulamanızdan güncellemeler ve duyurular almak için push bildirimlerine izin vermek ister misiniz?
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={pushPermission}
                  onChange={handlePushPermissionChange}
                  name="pushPermission"
                  color="primary"
                />
              }
              label="Push bildirimlerine izin veriyorum"
            />
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={() => setPushModalOpen(false)}
                disabled={!pushPermission}
              >
                Onayla
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      <Box 
        sx={{ 
          height: { xs: 'auto', sm: '80vh' },
          overflowY: 'auto',
          p: 3 
        }}
      >
        <Grid container spacing={2}>
          {dashboardItems.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Card
                onClick={() => item.path ? navigate(item.path) : window.open(item.link, '_blank')}
                sx={{
                  backgroundColor: item.bgColor,
                  cursor: 'pointer',
                  height: '60px',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: '100%',
                    p: '12px !important',
                  }}
                >
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    '& > *': { 
                      fontSize: { xs: 24, sm: 28 }
                    },
                    color: 'rgba(0, 0, 0, 0.7)',
                    mr: 2
                  }}>
                    {item.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 500,
                      color: '#2c3e50',
                      flexGrow: 1
                    }}
                  >
                    {item.title}
                  </Typography>
                  {item.content && (
                    <Box sx={{ ml: 'auto', mr: 1 }}>
                      {item.content}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}


        </Grid>

        {/* Duyuru Modal */}
        <Modal
          open={open}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={open}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                maxWidth: 400,
                width: '90%',
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {selectedAnnouncement?.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {selectedAnnouncement?.content}
              </Typography>
              <Box mt={2} display="flex" justifyContent="space-between">
                <Button variant="contained" color="primary" onClick={handleClose}>
                  Kapat
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => hideAnnouncement(selectedAnnouncement._id)}
                >
                  Gizle
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </Box>
    </Box>
  );
};

export default UserDashboard;
