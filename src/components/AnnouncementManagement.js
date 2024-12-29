// src/components/AnnouncementManagement.js

import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, IconButton, Modal, Fade } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const PUBLIC_VAPID_KEY = 'BAIdhbD-cr8SiVsNTz5t2htyJGdUL-5mlVLBUOR_zcJiKqTWFDTslPVHr5d38nnvC3_DYfalgoyAUm8HvxwsffA'; // Oluşturduğunuz gerçek Public Key'i buraya ekleyin

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

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);

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
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      console.error('Kullanıcı bilgisi bulunamadı.');
      alert('Kullanıcı bilgisi bulunamadı.');
      return;
    }
    const userId = user._id;
  
    if (!title.trim() || !content.trim()) {
      alert('Başlık ve içerik boş bırakılamaz.');
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, userId }), // 'createdBy' yerine 'userId' kullanıldı
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Duyuru oluşturuldu:", data);
        setTitle('');
        setContent('');
        setModalOpen(true);
        fetchAnnouncements();
      } else {
        const errorData = await response.json();
        console.error("Duyuru oluşturulamadı:", errorData);
        alert(`Duyuru oluşturulamadı: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Duyuru oluşturulurken hata:", error);
      alert('Duyuru oluşturulurken bir hata oluştu.');
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

    // Push aboneliği
    const subscribeUser = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;

          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.error('Push bildirimi izni reddedildi.');
            return;
          }

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
          });

          setSubscription(subscription);

          // Aboneliği backend'e gönder
          const response = await fetch(`${process.env.REACT_APP_API_URL}/subscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
          });

          if (!response.ok) {
            console.error('Abonelik backend\'e gönderilemedi.');
          }
        } catch (error) {
          console.error('Push aboneliği başarısız:', error);
        }
      }
    };

    subscribeUser();
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
