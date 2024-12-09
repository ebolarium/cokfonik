import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', part: 'Soprano', role: 'Korist' });
  const [editUser, setEditUser] = useState(null);

  // Kullanıcıları Getir
  const fetchUsers = async () => {
    const response = await fetch('http://localhost:5000/api/users');
    const data = await response.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Form Verisini Güncelle
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Kullanıcı Ekle
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      fetchUsers();
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Kullanıcı Sil
  const handleDeleteUser = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
      });
      fetchUsers(); // Silme işleminden sonra kullanıcıları tekrar getir
    } catch (error) {
      console.error(error);
    }
  };

  // Kullanıcı Düzenle
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:5000/api/users/${editUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser),
      });
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Kullanıcı Yönetimi</Typography>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Yeni Kullanıcı Ekle
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ad</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Partisyon</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Durum</TableCell>
            <TableCell>Aksiyon</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.part}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.isActive ? 'Aktif' : 'Pasif'}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteUser(user._id)}
                >
                  Sil
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setEditUser(user)}
                >
                  Düzenle
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Yeni Kullanıcı Modal'ı */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Yeni Kullanıcı</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField name="name" label="Ad" fullWidth margin="normal" onChange={handleChange} required />
            <TextField name="email" label="Email" fullWidth margin="normal" onChange={handleChange} required />
            <TextField name="password" label="Şifre" type="password" fullWidth margin="normal" onChange={handleChange} required />
            <TextField
              select
              name="part"
              label="Partisyon"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={formData.part}
              SelectProps={{
                native: true,
              }}
            >
              <option value="Soprano">Soprano</option>
              <option value="Alto">Alto</option>
              <option value="Tenor">Tenor</option>
              <option value="Bas">Bas</option>
            </TextField>
            <TextField
              select
              name="role"
              label="Rol"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={formData.role}
              SelectProps={{
                native: true,
              }}
            >
              <option value="Master Admin">Master Admin</option>
              <option value="Yönetim Kurulu">Yönetim Kurulu</option>
              <option value="Korist">Korist</option>
            </TextField>
            <Button type="submit" variant="contained" color="primary">
              Kaydet
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Kullanıcı Düzenleme Modal'ı */}
      <Dialog open={Boolean(editUser)} onClose={() => setEditUser(null)}>
        <DialogTitle>Kullanıcı Düzenle</DialogTitle>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <TextField
              label="Ad"
              value={editUser?.name || ''}
              onChange={(e) =>
                setEditUser((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              value={editUser?.email || ''}
              onChange={(e) =>
                setEditUser((prev) => ({ ...prev, email: e.target.value }))
              }
              fullWidth
              margin="normal"
            />
            <TextField
              select
              name="part"
              label="Partisyon"
              fullWidth
              margin="normal"
              onChange={(e) =>
                setEditUser((prev) => ({ ...prev, part: e.target.value }))
              }
              value={editUser?.part || 'Soprano'}
              SelectProps={{
                native: true,
              }}
            >
              <option value="Soprano">Soprano</option>
              <option value="Alto">Alto</option>
              <option value="Tenor">Tenor</option>
              <option value="Bas">Bas</option>
            </TextField>
            <TextField
              select
              name="role"
              label="Rol"
              fullWidth
              margin="normal"
              onChange={(e) =>
                setEditUser((prev) => ({ ...prev, role: e.target.value }))
              }
              value={editUser?.role || 'Korist'}
              SelectProps={{
                native: true,
              }}
            >
              <option value="Master Admin">Master Admin</option>
              <option value="Yönetim Kurulu">Yönetim Kurulu</option>
              <option value="Korist">Korist</option>
            </TextField>
            <Button type="submit" variant="contained" color="primary">
              Güncelle
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
