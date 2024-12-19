import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, IconButton, Modal, Fade } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [modalOpen, setModalOpen] = useState(false); // Modal durumu

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements`);
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Duyurular yüklenemedi:', error);
    }
  };

  const handleCreateAnnouncement = async () => {
    const userId = JSON.parse(localStorage.getItem('user'))._id;
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, userId }),
      });
  
      if (response.ok) {
        console.log("Duyuru oluşturuldu:", await response.json());
        setTitle(''); // Formu temizle
        setContent(''); // Formu temizle
        setModalOpen(true); // Modalı aç
        fetchAnnouncements(); // Duyuruları yeniden yükle
      } else {
        console.error("Duyuru oluşturulamadı.");
      }
    } catch (error) {
      console.error("Duyuru oluşturulurken hata:", error);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAnnouncements();
      } else {
        console.error('Duyuru silinemedi.');
      }
    } catch (error) {
      console.error('Duyuru silinirken hata:', error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <Box p={3} bgcolor="#f9f9f9" minHeight="100vh">
      <Typography variant="h4" gutterBottom>Duyuru Yönetimi</Typography>
      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        <TextField
          label="Başlık"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />
        <TextField
          label="İçerik"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          multiline
          rows={4}
        />
        <Button variant="contained" color="primary" onClick={handleCreateAnnouncement}>
          Duyuru Oluştur
        </Button>
      </Box>
      <Typography variant="h6" gutterBottom>Mevcut Duyurular</Typography>
      {announcements.map((announcement) => (
        <Card key={announcement._id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold">{announcement.title}</Typography>
            <Typography variant="body2">{announcement.content}</Typography>
            <IconButton
              color="error"
              onClick={() => handleDeleteAnnouncement(announcement._id)}
            >
              <DeleteIcon />
            </IconButton>
          </CardContent>
        </Card>
      ))}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
      >
        <Fade in={modalOpen}>
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
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>Duyuru Kaydedildi!</Typography>
            <Button variant="contained" color="primary" onClick={handleCloseModal}>
              Tamam
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default AnnouncementManagement;
