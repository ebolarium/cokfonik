import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Modal,
  Backdrop,
  Fade,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user'))?._id;
        const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements`);
        const data = await response.json();
        const visibleAnnouncements = data.filter(
          (announcement) => !announcement.hiddenBy?.includes(userId)
        );
        setAnnouncements(visibleAnnouncements);
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
        setAnnouncements((prev) =>
          prev.map((announcement) =>
            announcement._id === id
              ? { ...announcement, readBy: [...announcement.readBy, userId] }
              : announcement
          )
        );
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
    markAsRead(announcement._id);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAnnouncement(null);
  };

  return (
    <Box p={3} bgcolor="#f9f9f9" minHeight="100vh">
      <Typography variant="h4" gutterBottom>Duyurular</Typography>
      {announcements.map((announcement) => (
        <Card
          key={announcement._id}
          sx={{
            mb: 2,
            boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
            backgroundColor: announcement.readBy.includes(
              JSON.parse(localStorage.getItem('user'))._id
            )
              ? '#f0f0f0'
              : '#ffffff',
          }}
          onClick={() => handleOpen(announcement)}
        >
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold">
              {announcement.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {announcement.content}
            </Typography>
            <IconButton
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                hideAnnouncement(announcement._id);
              }}
              sx={{ float: 'right' }}
            >
              <DeleteIcon />
            </IconButton>
          </CardContent>
        </Card>
      ))}

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
  );
};

export default AnnouncementsPage;
