import React, { useState } from 'react';
import { Box, Typography, Avatar, Button, Divider, IconButton, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const Profile = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [user, setUser] = useState({
    name: 'Ad',
    surname: 'Soyad',
    part: 'Soprano',
    absenteeism: 2,
    missingFees: 2,
    email: 'example@example.com',
    phone: '0555 555 55 55',
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [editField, setEditField] = useState(null); // Düzenlenen alan
  const [editedValue, setEditedValue] = useState(''); // Düzenleme için yeni değer
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false); // Dialog açık mı?

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(URL.createObjectURL(file));
    }
  };

  const handleOpenEdit = (field) => {
    setEditField(field); // Düzenlenen alanı belirle
    setEditedValue(user[field]); // Şu anki değeri inputa koy
    setOpen(true); // Dialog'u aç
  };

  const handleSaveEdit = () => {
    if (editedValue.trim() === '') {
      alert('Alan boş bırakılamaz.');
      return;
    }
    setUser({ ...user, [editField]: editedValue }); // Değeri kaydet
    setOpen(false); // Dialog'u kapat
  };

  const handleCloseDialog = () => {
    setOpen(false); // Dialog'u kapat
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handlePasswordUpdate = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır!');
      return;
    }
    setError('');
    alert('Şifre başarıyla güncellendi!');
    setPasswordData({ newPassword: '', confirmPassword: '' });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        maxWidth: '400px',
        margin: '0 auto',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Profil Kartı */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          <Avatar
            src={profilePhoto || '/placeholder-profile.png'}
            alt="Profil Fotoğrafı"
            sx={{
              width: '64px',
              height: '64px',
              border: '2px solid #1976d2',
            }}
          />
          <Button
            component="label"
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#1976d2',
              color: '#fff',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              minWidth: 0,
              padding: 0,
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                backgroundColor: '#115293',
              },
            }}
          >
            +
            <input type="file" hidden accept="image/*" onChange={handleProfilePhotoChange} />
          </Button>
        </Box>

        <Box sx={{ marginLeft: '16px' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {user.name} {user.surname}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Partisyon: {user.part}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', marginTop: '4px' }}>
            Devamsızlık: {user.absenteeism} gün
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', marginTop: '4px' }}>
            Eksik Aidat: {user.missingFees} ay
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* İletişim Bilgileri Kartı */}
      <Box
        sx={{
          padding: '16px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
          İletişim Bilgileri
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Typography variant="body2" sx={{ color: '#666', flexGrow: 1 }}>
            <strong>E-posta:</strong> {user.email}
          </Typography>
          <IconButton size="small" onClick={() => handleOpenEdit('email')}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#666', flexGrow: 1 }}>
            <strong>Telefon:</strong> {user.phone}
          </Typography>
          <IconButton size="small" onClick={() => handleOpenEdit('phone')}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      {/* Şifre Güncelleme Kartı */}
      <Box
        sx={{
          padding: '16px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Şifre Güncelle
        </Typography>
        <TextField
          label="Yeni Şifre"
          name="newPassword"
          type="password"
          value={passwordData.newPassword}
          onChange={handlePasswordChange}
          fullWidth
          margin="dense"
          size="small"
        />
        <TextField
          label="Şifreyi Onayla"
          name="confirmPassword"
          type="password"
          value={passwordData.confirmPassword}
          onChange={handlePasswordChange}
          fullWidth
          margin="dense"
          size="small"
        />
        {error && (
          <Typography variant="body2" color="error" sx={{ marginTop: '8px' }}>
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: '16px', padding: '8px 0', fontSize: '14px' }}
          onClick={handlePasswordUpdate}
        >
          Güncelle
        </Button>
      </Box>

      {/* Düzenleme Dialog'u */}
      <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editField === 'email' ? 'E-posta Düzenle' : 'Telefon Düzenle'}</DialogTitle>
        <DialogContent>
          <TextField
            label={editField === 'email' ? 'Yeni E-posta' : 'Yeni Telefon'}
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            İptal
          </Button>
          <Button onClick={handleSaveEdit} color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
