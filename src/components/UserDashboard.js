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
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import HearingIcon from '@mui/icons-material/Hearing';
import Confetti from 'react-confetti';

const UserDashboard = () => {
  const navigate = useNavigate();

  // Duyuru State
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Konfeti & Animasyon State
  const [showConfetti, setShowConfetti] = useState(false);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'fadingIn' | 'steady' | 'fadingOut'

  // Kullanıcı bilgisini localStorage'dan al
  const user = JSON.parse(localStorage.getItem('user'));
  // Hoş geldin mesajında kullanmak için
  const userName = user?.name || '';

  // Duyuruları çek
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements`);
        const data = await response.json();

        const userId = user?._id;
        if (!userId) throw new Error('User ID not found in localStorage');

        const visibleAnnouncements = data.filter(
          (announcement) => !announcement.hiddenBy?.includes(userId)
        );

        const unreadAnnouncements = visibleAnnouncements.filter(
          (announcement) => !announcement.readBy.includes(userId)
        );

        setAnnouncements(visibleAnnouncements);
        setUnreadCount(unreadAnnouncements.length);
      } catch (error) {
        console.error('Duyurular yüklenemedi:', error);
      }
    };

    fetchAnnouncements();
  }, [user?._id]);

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
          
          // … fade in/out veya tıklanarak kapanma mantığını devam ettir …
          setTimeout(() => {
            setPhase('steady');
          }, 1000);
        }
      }
    }
  }, [user?.birthDate]);
  

  // Kapanış tıklaması
  const handleClickClose = () => {
    // fade out
    setPhase('fadingOut');
    setTimeout(() => {
      setShowConfetti(false);
      setPhase('idle');
    }, 1000); // 1sn sonra DOM'dan kaldır
  };


  // Duyuru Okundu
  const markAsRead = async (id) => {
    const userId = user?._id;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        const updated = announcements.map((ann) =>
          ann._id === id
            ? { ...ann, readBy: [...ann.readBy, userId] }
            : ann
        );
        setAnnouncements(updated);
        setUnreadCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error('Duyuru okundu olarak işaretlenirken hata:', error);
    }
  };

  // Duyuru Gizle
  const hideAnnouncement = async (id) => {
    const userId = user?._id;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${id}/hide`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (error) {
      console.error('Duyuru gizlenirken hata:', error);
    }
  };

  // Modal Aç/Kapat
  const handleOpen = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOpen(true);
    if (!announcement.readBy.includes(user?._id)) {
      markAsRead(announcement._id);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAnnouncement(null);
  };

  // Dashboard Kartları
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
    {
      title: 'Duyurular',
      path: '/announcements',
      icon: (
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon style={{ fontSize: 50 }} />
        </Badge>
      ),
      bgColor: '#fff8dc',
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
  ];

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
Koromuzun değerli bir üyesi olarak yeni yaşını tüm kalbimizle kutluyoruz!
Dileriz ki bu yıl dileklerinin hepsini sana getirsin, 
sesinle ve gülüşünle hepimizi aydınlattığın gibi 
kendi hayatını da güzelleştirsin.\n
Neşeyle, sağlıkla ve müzikle dolu bir yaş olsun!\n
İyi ki doğdun, iyi ki varsın!\n
🥳🎶❤️
`}
        </Box>
        </Box>
      )}

      <Box p={3}>
        <Grid container spacing={3}>
          {dashboardItems.map((item, index) => (
            <Grid
              item
              xs={6}
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <Card
                style={{
                  width: '85%',
                  aspectRatio: '1/1',
                  backgroundColor: item.bgColor,
                  color: '#333',
                  textAlign: 'center',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onClick={() => {
                  if (item.link) {
                    window.open(item.link, '_blank');
                  } else {
                    navigate(item.path);
                  }
                }}
              >
                <CardContent
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <Box>{item.icon}</Box>
                  <Typography variant="h6" style={{ fontSize: '14px', marginTop: '8px' }}>
                    {item.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Modal (Duyuru) */}
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
              <Button variant="contained" color="primary" fullWidth onClick={handleClose}>
                Kapat
              </Button>
            </Box>
          </Fade>
        </Modal>
      </Box>
    </Box>
  );
};

export default UserDashboard;
