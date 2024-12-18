import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Divider,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const Profile = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [user, setUser] = useState({
    name: '',
    surname: '',
    part: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [editField, setEditField] = useState(null);
  const [editedValue, setEditedValue] = useState('');
  const [open, setOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // Dinamik modal mesajı için

  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
  };

  // Backend'den kullanıcı verisini çek
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
          setError('Kullanıcı bilgisi bulunamadı!');
          setLoading(false);
          return;
        }

        // Backend'den kullanıcı bilgisi çek
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/profile?email=${userData.email}`);
        const result = await response.json();

        if (!response.ok) {
          setError(result.message || 'Kullanıcı bilgileri alınamadı!');
          setLoading(false);
          return;
        }

        // State ve localStorage güncelle
        setUser(result);
        setProfilePhoto(result.profilePhoto);
        localStorage.setItem('user', JSON.stringify(result)); // LocalStorage'ı güncelle
      } catch (error) {
        console.error('Kullanıcı verisi alınırken hata:', error);
        setError('Kullanıcı bilgileri alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('profilePhoto', file);

        const userData = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userData._id}/upload-photo`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
          setError(result.message);
          return;
        }

        // Kullanıcı state ve localStorage güncelle
        const updatedUser = { ...userData, profilePhoto: result.photoPath };
        setUser(updatedUser);
        setProfilePhoto(result.photoPath);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Başarı mesajını modal ile göster
        setSuccessMessage('Profil fotoğrafı başarıyla güncellendi!');
        setSuccessModalOpen(true);
      } catch (error) {
        console.error('Fotoğraf yüklenirken hata:', error);
        setError('Fotoğraf yüklenirken bir hata oluştu.');
      }
    }
  };

  const handleOpenEdit = (field) => {
    setEditField(field);
    setEditedValue(user[field]);
    setOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editedValue.trim() === '') {
      setError('Alan boş bırakılamaz.');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [editField]: editedValue }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.message || 'Bilgi güncellenemedi.');
        return;
      }

      // Kullanıcı state ve localStorage güncelle
      const updatedUser = { ...user, [editField]: editedValue };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Başarı mesajını modal ile göster
      setSuccessMessage(`${editField === 'email' ? 'Email' : 'Telefon'} başarıyla güncellendi!`);
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Bilgi güncellenirken hata:', error);
      setError('Bilgi güncellenirken bir hata oluştu.');
    } finally {
      setOpen(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır!');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${userData._id}/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newPassword: passwordData.newPassword,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        setError(result.message);
        return;
      }

      setPasswordData({ newPassword: '', confirmPassword: '' });
      setSuccessMessage('Şifre başarıyla güncellendi!');
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Şifre güncellenirken hata:', error);
      setError('Sunucuya bağlanılamadı.');
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ position: 'relative', cursor: 'pointer' }}>
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
              '&:hover': { backgroundColor: '#115293' },
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
        </Box>
      </Box>

      <Divider />

      {/* İletişim Bilgileri */}
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
            <strong>Email:</strong> {user.email}
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

      {/* Şifre Güncelle */}
      <Box sx={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px' }}>
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
        {error && <Typography color="error">{error}</Typography>}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: '16px' }}
          onClick={handlePasswordUpdate}
        >
          Güncelle
        </Button>
      </Box>

      {/* Genel Başarı Modali */}
      <Dialog open={successModalOpen} onClose={handleSuccessModalClose}>
        <DialogTitle>Güncelleme Başarılı</DialogTitle>
        <DialogContent>
          <Typography>{successMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessModalClose} color="primary">
            Tamam
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            label="Yeni Değer"
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSaveEdit}>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
