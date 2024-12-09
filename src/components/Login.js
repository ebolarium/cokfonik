import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        // Kullanıcı bilgilerini ve tokeni kaydet
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Rollere göre yönlendirme
        const roleRedirects = {
          'Master Admin': '/master-admin-dashboard',
          'Yönetim Kurulu': '/management-dashboard',
          'Şef': '/conductor-dashboard',
          'Korist': '/user-dashboard',
        };
        const redirectPath = roleRedirects[data.user.role] || '/login';
        window.location.href = redirectPath;
      } else {
        alert(data.message || 'Giriş başarısız!');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('Sunucu hatası oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
      <Typography variant="h4" gutterBottom>
        Giriş Yap
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Şifre"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Box>
        <Button variant="contained" color="primary" type="submit">
          Giriş Yap
        </Button>
      </form>
    </Box>
  );
};

export default Login;
