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
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';

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
  const [uploadLoading, setUploadLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [editField, setEditField] = useState(null);
  const [editedValue, setEditedValue] = useState('');
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || !userData._id) {
          setError('Kullanıcı bilgisi bulunamadı!');
          setLoading(false);
          return;
        }
  
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userData._id}/profile`);
        const result = await response.json();
  
        if (!response.ok) {
          setError(result.message || 'Kullanıcı bilgileri alınamadı!');
          setLoading(false);
          return;
        }

        if (result.profilePhoto && result.profilePhoto.startsWith('undefined/')) {
          result.profilePhoto = `${process.env.REACT_APP_API_URL}/${result.profilePhoto.replace('undefined/', '')}`;
        }
  
        setUser(result);
        setProfilePhoto(result.profilePhoto);
        localStorage.setItem('user', JSON.stringify(result));
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
        setUploadLoading(true);
        const formData = new FormData();
        formData.append('profilePhoto', file);

        const userData = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userData._id}/upload-photo`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Fotoğraf yüklenemedi');
        }

        let photoUrl = result.photoUrl;
        if (photoUrl && photoUrl.startsWith('undefined/')) {
          photoUrl = `${process.env.REACT_APP_API_URL}/${photoUrl.replace('undefined/', '')}`;
        }

        const updatedUser = { ...userData, profilePhoto: photoUrl };
        setUser(updatedUser);
        setProfilePhoto(photoUrl);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setSnackbar({
          open: true,
          message: 'Profil fotoğrafı başarıyla güncellendi!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Fotoğraf yüklenirken hata:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Fotoğraf yüklenirken bir hata oluştu.',
          severity: 'error'
        });
      } finally {
        setUploadLoading(false);
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
      setSnackbar({
        open: true,
        message: 'Alan boş bırakılamaz.',
        severity: 'error'
      });
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
        throw new Error(result.message || 'Bilgi güncellenemedi.');
      }

      const updatedUser = { ...user, [editField]: editedValue };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSnackbar({
        open: true,
        message: `${editField === 'email' ? 'Email' : 'Telefon'} başarıyla güncellendi!`,
        severity: 'success'
      });
      setOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Bilgi güncellenirken bir hata oluştu.',
        severity: 'error'
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Şifreler eşleşmiyor!',
        severity: 'error'
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: 'Şifre en az 6 karakter olmalıdır!',
        severity: 'error'
      });
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
        throw new Error(result.message);
      }

      setPasswordData({ newPassword: '', confirmPassword: '' });
      setSnackbar({
        open: true,
        message: 'Şifre başarıyla güncellendi!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Şifre güncellenirken bir hata oluştu.',
        severity: 'error'
      });
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  return (
    <Box
      sx={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: { xs: 2, md: 4 },
        mt: 4
      }}
    >
      {/* Profil Başlığı */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 3
        }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profilePhoto || '/placeholder-profile.png'}
              alt={`${user.name} ${user.surname}`}
              sx={{
                width: { xs: 100, sm: 120 },
                height: { xs: 100, sm: 120 },
                border: '4px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            {uploadLoading ? (
              <CircularProgress
                size={30}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  padding: '4px'
                }}
              />
            ) : (
              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <CameraAltIcon />
                <input type="file" hidden accept="image/*" onChange={handleProfilePhotoChange} />
              </IconButton>
            )}
          </Box>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
              {user.name} {user.surname}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {user.part || 'Partisyon belirtilmemiş'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* İletişim Bilgileri */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          İletişim Bilgileri
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            borderRadius: 1,
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EmailIcon color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography>{user.email}</Typography>
              </Box>
            </Box>
            <IconButton onClick={() => handleOpenEdit('email')}>
              <EditIcon />
            </IconButton>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            borderRadius: 1,
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PhoneIcon color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">Telefon</Typography>
                <Typography>{user.phone || 'Telefon numarası belirtilmemiş'}</Typography>
              </Box>
            </Box>
            <IconButton onClick={() => handleOpenEdit('phone')}>
              <EditIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Şifre Değiştirme */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon /> Şifre Değiştir
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Yeni Şifre"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Şifreyi Onayla"
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            fullWidth
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={handlePasswordUpdate}
            sx={{ 
              mt: 1,
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            Şifreyi Güncelle
          </Button>
        </Box>
      </Paper>

      {/* Düzenleme Dialog'u */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          {editField === 'email' ? 'Email Güncelle' : 'Telefon Güncelle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={editField === 'email' ? 'Yeni Email' : 'Yeni Telefon'}
            type={editField === 'email' ? 'email' : 'tel'}
            fullWidth
            variant="outlined"
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>İptal</Button>
          <Button onClick={handleSaveEdit} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
