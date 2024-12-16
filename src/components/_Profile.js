import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Avatar, Modal } from '@mui/material';

const Profile = () => {
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setFormData({
        name: storedUser.name || '',
        surname: storedUser.surname || '',
        email: storedUser.email || '',
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleSave = async () => {
    const updatedData = Object.keys(formData).reduce((acc, key) => {
      if (formData[key] !== '') { // Sadece dolu alanları ekler
        acc[key] = formData[key];
      }
      return acc;
    }, {});
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
  
      const updatedUser = await response.json();
      if (response.ok) {
        setUser(updatedUser);
        setModalMessage('Profil başarıyla güncellendi!');
        setModalOpen(true);
      } else {
        setModalMessage('Profil güncellenirken hata oluştu!');
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setModalMessage('Sunucu hatası oluştu. Lütfen tekrar deneyin.');
      setModalOpen(true);
    }
  };
  

  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setModalMessage('Yeni şifreler eşleşmiyor!');
      setModalOpen(true);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user._id}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      });
      if (response.ok) {
        setModalMessage('Şifre başarıyla güncellendi!');
        setModalOpen(true);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const errorMessage = await response.json();
        setModalMessage(errorMessage.message || 'Şifre güncellenirken hata oluştu!');
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setModalMessage('Sunucu hatası oluştu. Lütfen tekrar deneyin.');
      setModalOpen(true);
    }
  };

  const handlePhotoUpload = async () => {
    if (!profilePhoto) {
      setModalMessage('Lütfen bir fotoğraf seçin!');
      setModalOpen(true);
      return;
    }
  
    const formData = new FormData();
    formData.append('profilePhoto', profilePhoto);
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user._id}/upload-photo`, {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setModalMessage('Profil fotoğrafı başarıyla yüklendi!');
        setUser((prev) => ({ ...prev, profilePhoto: data.photoPath }));
        setModalOpen(true);
      } else {
        setModalMessage(data.message || 'Fotoğraf yüklenirken hata oluştu!');
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      setModalMessage('Sunucu hatası oluştu. Lütfen tekrar deneyin.');
      setModalOpen(true);
    }
  };
  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Profil Bilgilerim</Typography>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxWidth: '400px',
          margin: '0 auto',
        }}
      >
        {/* Profil Bilgileri */}
        <TextField
          label="Ad"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Soyad"
          name="surname"
          value={formData.surname}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleSave}>
          Kaydet
        </Button>

        {/* Şifre Güncelleme */}
        <Typography variant="h6">Şifre Güncelle</Typography>
        <TextField
          label="Mevcut Şifre"
          name="currentPassword"
          type="password"
          value={passwordData.currentPassword}
          onChange={handlePasswordChange}
          fullWidth
        />
        <TextField
          label="Yeni Şifre"
          name="newPassword"
          type="password"
          value={passwordData.newPassword}
          onChange={handlePasswordChange}
          fullWidth
        />
        <TextField
          label="Yeni Şifre (Tekrar)"
          name="confirmPassword"
          type="password"
          value={passwordData.confirmPassword}
          onChange={handlePasswordChange}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handlePasswordSave}>
          Şifreyi Güncelle
        </Button>

        {/* Profil Fotoğrafı Yükleme */}
        <Typography variant="h6">Profil Fotoğrafı</Typography>
        <Box display="flex" alignItems="center" gap={2}>
        <Avatar
  src={
    profilePhoto
      ? URL.createObjectURL(profilePhoto) // Yeni seçilen fotoğrafı göster
      : user.profilePhoto // Daha önce yüklenen fotoğraf
      ? `${process.env.REACT_APP_API_URL}${user.profilePhoto}` // Sunucudaki fotoğraf
      : null // Henüz bir fotoğraf yoksa varsayılan (placeholder)
  }
  sx={{ width: 64, height: 64 }}
/>          <Button variant="outlined" component="label">
            Fotoğraf Yükle
            <input type="file" hidden onChange={handleProfilePhotoChange} />
          </Button>
        </Box>
        <Button variant="contained" color="primary" onClick={handlePhotoUpload}>
          Fotoğrafı Kaydet
        </Button>

        <Button variant="outlined" color="secondary" onClick={() => window.history.back()}>
          Geri Dön
        </Button>
      </Box>

      {/* Bilgi Modalı */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Bilgi
          </Typography>
          <Typography variant="body1">{modalMessage}</Typography>
          <Button variant="contained" color="primary" onClick={handleModalClose} sx={{ mt: 2 }}>
            Kapat
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Profile;
