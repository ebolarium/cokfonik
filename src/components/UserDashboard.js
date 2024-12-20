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
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic'; // Yeni ikon

const UserDashboard = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements`);
        const data = await response.json();

        const userId = JSON.parse(localStorage.getItem('user'))?._id;
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
  }, []);

  const markAsRead = async (id) => {
    const userId = JSON.parse(localStorage.getItem('user'))?._id;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const updatedAnnouncements = announcements.map((announcement) =>
          announcement._id === id
            ? { ...announcement, readBy: [...announcement.readBy, userId] }
            : announcement
        );
        setAnnouncements(updatedAnnouncements);
        setUnreadCount((prev) => prev - 1);
      } else {
        console.error('Duyuru okundu olarak işaretlenemedi.');
      }
    } catch (error) {
      console.error('Duyuru okundu olarak işaretlenirken hata:', error);
    }
  };

  const hideAnnouncement = async (id) => {
    const userId = JSON.parse(localStorage.getItem('user'))?._id;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${id}/hide`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setAnnouncements((prev) => prev.filter((announcement) => announcement._id !== id));
      } else {
        console.error('Duyuru gizlenemedi.');
      }
    } catch (error) {
      console.error('Duyuru gizlenirken hata:', error);
    }
  };

  const handleOpen = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOpen(true);
    if (!announcement.readBy.includes(JSON.parse(localStorage.getItem('user'))._id)) {
      markAsRead(announcement._id);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAnnouncement(null);
  };

  const dashboardItems = [
    { title: 'Yoklama', path: '/my-attendance', icon: <AssignmentTurnedInIcon style={{ fontSize: 50 }} />, bgColor: '#f0f8ff' },
    { title: 'Aidat', path: '/my-fees', icon: <AccountBalanceIcon style={{ fontSize: 50 }} />, bgColor: '#e6ffe6' },
    { title: 'Takvim', path: '/calendar-view', icon: <EventNoteIcon style={{ fontSize: 50 }} />, bgColor: '#ffe6e6' },
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
      title: 'Nota/Midi',
      link: 'https://drive.google.com/drive/folders/1paeqvHKubfoUEwh9v-4zjL64E0eBHf5r?usp=sharing',
      icon: <LibraryMusicIcon style={{ fontSize: 50 }} />,
      bgColor: '#e6e6ff', // Yeni kart rengi
    },
  ];

  return (
    <Box minHeight="100vh" bgcolor="#f9f9f9">
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
                }}              >
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

        {/* Modal */}
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
