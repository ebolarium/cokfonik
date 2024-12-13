import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, 
  Dialog, DialogTitle, DialogContent, TextField, TableContainer, Paper 
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material'; // İkonlar için gerekli import


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', part: 'Soprano', role: 'Korist' });
  const [editUser, setEditUser] = useState(null);

  // Kullanıcıları Getir
  const fetchUsers = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
    const data = await response.json();
    setUsers(data);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
      }
    };
  
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        fetchUsers(); 
        setOpen(false); 
        setFormData({ name: '', surname: '', email: '', phone: '', birthDate: '', part: 'Soprano', role: 'Korist', password: '', approved: false, frozen: false });
      } else {
        const errorData = await response.json();
        alert(`Hata: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Kullanıcı ekleme hatası:', error);
      alert('Kullanıcı eklenirken bir hata oluştu.');
    }
  };

  // Kullanıcı Sil
  const handleDeleteUser = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/users/${id}`, {
        method: 'DELETE',
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  // Kullanıcı Düzenle
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/users/${editUser._id}`, {
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
    <Box p={2}>
      <Typography variant="h5" gutterBottom align='center'>Kullanıcı Yönetimi</Typography>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Yeni Kullanıcı Ekle
      </Button>
      <TableContainer component={Paper} sx={{ mt: 1, overflowX: 'auto' }}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell sx={{ padding: '4px 4px',fontWeight: 'bold' }}>İsim</TableCell>
        <TableCell sx={{ padding: '4px 4px',fontWeight: 'bold' }}>Part</TableCell>
        <TableCell sx={{ padding: '4px 4px',fontWeight: 'bold' }}>Rol</TableCell>
        <TableCell sx={{ padding: '4px 4px',fontWeight: 'bold' }}>Durum</TableCell>
        <TableCell sx={{ padding: '4px 4px', textAlign: 'center' }}></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {users.map((user) => (
        <TableRow key={user._id}>
          <TableCell sx={{ padding: '4px 8px' }}>{user.name}</TableCell>
          <TableCell sx={{ padding: '4px 8px' }}>{user.part}</TableCell>
          <TableCell sx={{ padding: '4px 8px' }}>{user.role}</TableCell>
          <TableCell sx={{ padding: '4px 8px' }}>{user.isActive ? 'Aktif' : 'Pasif'}</TableCell>
          <TableCell sx={{ padding: '2px 4px', textAlign: 'center' }}>
            <Button
              onClick={() => handleDeleteUser(user._id)}
              sx={{ minWidth: 0, padding: 0 }}
            >
              <Delete color="error" />
            </Button>
            <Button
              onClick={() => setEditUser(user)}
              sx={{ minWidth: 0, padding: 0, marginLeft: 1 }}
            >
              <Edit color="primary" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>


    {/* Yeni Kullanıcı Modal'ı */}
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Yeni Kullanıcı</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            name="name"
            label="Ad"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.name}
            required
          />

          <TextField
            name="surname"
            label="Soyisim"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.surname}
            required
          />

          <TextField
            name="email"
            label="Email"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.email}
            required
          />

          <TextField
            name="phone"
            label="Telefon"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.phone}
            required
          />

          <TextField
            name="birthDate"
            label="Doğum Tarihi"
            type="date"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.birthDate}
            InputLabelProps={{ shrink: true }}
            required
          />

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

          <TextField
            select
            name="approved"
            label="Onay Durumu"
            fullWidth
            margin="normal"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                approved: e.target.value === 'Onaylı',
              }))
            }
            value={formData.approved ? 'Onaylı' : 'Onaysız'}
            SelectProps={{
              native: true,
            }}
          >
            <option value="Onaylı">Onaylı</option>
            <option value="Onaysız">Onaysız</option>
          </TextField>

          <TextField
            select
            name="frozen"
            label="Dondurma Durumu"
            fullWidth
            margin="normal"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                frozen: e.target.value === 'Dondurulmuş',
              }))
            }
            value={formData.frozen ? 'Dondurulmuş' : 'Aktif'}
            SelectProps={{
              native: true,
            }}
          >
            <option value="Aktif">Aktif</option>
            <option value="Dondurulmuş">Dondurulmuş</option>
          </TextField>

          <TextField
            name="password"
            label="Şifre"
            type="password"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.password}
            required
          />

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Kaydet
          </Button>
        </form>
      </DialogContent>
    </Dialog>


      {/* Kullanıcı Düzenleme Modal'ı */}
      <Dialog open={Boolean(editUser)} onClose={() => setEditUser(null)} fullWidth maxWidth="sm">
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
              label="Soyisim"
              value={editUser?.surname || ''}
              onChange={(e) =>
                setEditUser((prev) => ({ ...prev, surname: e.target.value }))
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
              label="Telefon"
              value={editUser?.phone || ''}
              onChange={(e) =>
                setEditUser((prev) => ({ ...prev, phone: e.target.value }))
              }
              fullWidth
              margin="normal"
            />

            <TextField
              label="Doğum Tarihi"
              type="date"
              value={editUser?.birthDate ? new Date(editUser.birthDate).toISOString().split('T')[0] : ''}
              onChange={(e) =>
                setEditUser((prev) => ({ ...prev, birthDate: e.target.value }))
              }
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              select
              name="part"
              label="Partisyon"
              value={editUser?.part || 'Soprano'}
              onChange={(e) =>
                setEditUser((prev) => ({ ...prev, part: e.target.value }))
              }
              fullWidth
              margin="normal"
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
              value={editUser?.role || 'Korist'}
              onChange={(e) =>
                setEditUser((prev) => ({ ...prev, role: e.target.value }))
              }
              fullWidth
              margin="normal"
              SelectProps={{
                native: true,
              }}
            >
              <option value="Master Admin">Master Admin</option>
              <option value="Yönetim Kurulu">Yönetim Kurulu</option>
              <option value="Korist">Korist</option>
            </TextField>

            <TextField
              select
              name="isActive"
              label="Durum"
              value={editUser?.isActive ? 'Aktif' : 'Pasif'}
              onChange={(e) =>
                setEditUser((prev) => ({
                  ...prev,
                  isActive: e.target.value === 'Aktif',
                }))
              }
              fullWidth
              margin="normal"
              SelectProps={{
                native: true,
              }}
            >
              <option value="Aktif">Aktif</option>
              <option value="Pasif">Pasif</option>
            </TextField>

            <TextField
              select
              name="approved"
              label="Onay Durumu"
              value={editUser?.approved ? 'Onaylı' : 'Onaysız'}
              onChange={(e) =>
                setEditUser((prev) => ({
                  ...prev,
                  approved: e.target.value === 'Onaylı',
                }))
              }
              fullWidth
              margin="normal"
              SelectProps={{
                native: true,
              }}
            >
              <option value="Onaylı">Onaylı</option>
              <option value="Onaysız">Onaysız</option>
            </TextField>

            <TextField
              select
              name="frozen"
              label="Dondurma Durumu"
              value={editUser?.frozen ? 'Dondurulmuş' : 'Aktif'}
              onChange={(e) =>
                setEditUser((prev) => ({
                  ...prev,
                  frozen: e.target.value === 'Dondurulmuş',
                }))
              }
              fullWidth
              margin="normal"
              SelectProps={{
                native: true,
              }}
            >
              <option value="Aktif">Aktif</option>
              <option value="Dondurulmuş">Dondurulmuş</option>
            </TextField>

            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
              Güncelle
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
