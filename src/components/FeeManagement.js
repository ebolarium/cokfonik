import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  Grid,
  Divider,
  Modal,
  Backdrop,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';

const FeeBox = styled('div')(({ isPaid, isInactive }) => ({
  width: 20,
  height: 20,
  backgroundColor: isInactive ? 'grey' : isPaid ? 'green' : 'red',
  margin: '1px',
  borderRadius: 5,
  cursor: isInactive ? 'default' : 'pointer',
  ':hover': {
    opacity: isInactive ? 1 : 0.8,
  },
}));

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUserFees, setSelectedUserFees] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');

  const fetchFees = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/fees/last-six-months`);
      const data = await response.json();
      console.log('Fetched fees from API:', data);
      if (Array.isArray(data)) {
        // Kullanıcı ID'sine göre grupla - null kontrolü ekle
        const groupedFees = data.reduce((acc, fee) => {
          // userId null değilse işlem yap
          if (fee.userId && fee.userId._id) {
            if (!acc[fee.userId._id]) {
              acc[fee.userId._id] = [];
            }
            acc[fee.userId._id].push(fee);
          } else {
            console.warn('Fee with null or invalid userId found:', fee);
          }
          return acc;
        }, {});
        setFees(data);
        console.log('Grouped fees:', groupedFees);
      } else {
        console.error('Unexpected API response for fees:', data);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
      const data = await response.json();

      if (Array.isArray(data)) {
        // Yalnızca aktif ve rolü "Şef" olmayan kullanıcıları listele
        const activeUsers = data.filter((user) => user.isActive === true && user.role !== 'Şef');
        setUsers(activeUsers);
      } else {
        console.error('Unexpected API response for users:', data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (orderBy === 'name') {
      return order === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (orderBy === 'part') {
      // Part alanı boşsa sıralama yaparken 'Belirtilmemiş' yerine boş string kullan
      const partA = a.part || '';
      const partB = b.part || '';
      return order === 'asc'
        ? partA.localeCompare(partB)
        : partB.localeCompare(partA);
    }
    return 0;
  });

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  useEffect(() => {
    fetchUsers();
    fetchFees();
  }, []);

  const toggleFeeStatus = async (feeId, isPaid) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/fees/${feeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: !isPaid }),
      });
      fetchFees();
    } catch (error) {
      console.error('Error toggling fee status:', error);
    }
  };

  const getLastSixMonths = () => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      return {
        month: date.toLocaleString('tr-TR', { month: 'long' }),
        year: date.getFullYear(),
      };
    }).reverse();
    return months;
  };

  const handleOpenModal = (userId) => {
    const userFees = fees.filter((fee) => fee.userId && fee.userId._id === userId);
    setSelectedUserFees(userFees);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUserFees([]);
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <Box
      sx={{
        p: 4,
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '64px', // BottomNav yüksekliğine göre ayarla
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        Aidat Yönetimi
      </Typography>

      <Grid container spacing={1} sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
        <Grid item xs={6}>
          <Typography
            variant="body1"
            sx={{ cursor: 'pointer' }}
            onClick={() => handleRequestSort('name')}
          >
            İsim
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography
            variant="body1"
            sx={{ cursor: 'pointer' }}
            onClick={() => handleRequestSort('part')}
          >
            Partisyon
          </Typography>
        </Grid>
      </Grid>

      <Box>
        {sortedUsers.map((user) => {
          // userId null kontrolü ekle
          const userFees = fees.filter((fee) => fee.userId && fee.userId._id === user._id);

          return (
    <Box
      key={user._id}
      sx={{
        mb: 1,
        backgroundColor: user.frozen ? 'lightblue' : 'transparent', // Frozen kullanıcılar için açık mavi

      }}
    >              <Grid container spacing={1} alignItems="center">
                <Grid item xs={6}>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: '0.9rem', lineHeight: 1.2, cursor: 'pointer' }}
                    onClick={() => handleOpenModal(user._id)}
                  >
                    {`${user.name} ${user.surname}`}
                  </Typography>
                </Grid>
                <Grid item xs={6} style={{ textAlign: 'right' }}>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: '0.9rem', lineHeight: 1.2 }}
                  >
                    {user.part || 'Belirtilmemiş'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 1, borderColor: 'lightgray' }} />

              <Box display="flex" gap={0.5} flexWrap="nowrap">
              {getLastSixMonths().map((monthYear, index) => {
    const fee = userFees.find(
      (f) => {
        // Null kontrolü ekle
        if (!f || !f.month) {
          return false;
        }
        
        const matches = f.month.toLowerCase() === monthYear.month.toLowerCase() &&
          f.year === monthYear.year;
        
        console.log('Month comparison:', {
          dbMonth: f.month,
          displayMonth: monthYear.month,
          year: f.year,
          displayYear: monthYear.year,
          matches,
          isPaid: f.isPaid
        });
        return matches;
      }
    );
    return (
      <Tooltip title={`${monthYear.month} ${monthYear.year}`} key={index}>
        <FeeBox
          isPaid={fee?.isPaid || false}
          isInactive={!fee}
          onClick={() => fee && toggleFeeStatus(fee._id, fee.isPaid)}
        />
      </Tooltip>
    );
  })}
              </Box>

              <Divider sx={{ my: 1, borderColor: 'lightgray' }} />
            </Box>
          );
        })}
      </Box>

      {/* Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              maxHeight: '80%',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              overflowY: 'auto',
            }}
          >
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" gutterBottom>
              Kullanıcı Aidat Detayları
            </Typography>
            <List>
              {selectedUserFees.map((fee) => (
                <ListItem
                  key={fee._id}
                  sx={{
                    backgroundColor: fee.isPaid ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={`${capitalizeFirstLetter(fee.month)} ${fee.year}`}
                    secondary={fee.isPaid ? 'Ödendi' : 'Ödenmedi'}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default FeeManagement;