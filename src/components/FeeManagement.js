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

  const fetchFees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/fees/last-six-months');
      const data = await response.json();
      if (Array.isArray(data)) {
        setFees(data);
      } else {
        console.error('Unexpected API response for fees:', data);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Unexpected API response for users:', data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchFees();
  }, []);

  const toggleFeeStatus = async (feeId, isPaid) => {
    try {
      await fetch(`http://localhost:5000/api/fees/${feeId}`, {
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
        month: date.toLocaleString('tr-TR', { month: 'long' }).toLowerCase(),
        year: date.getFullYear(),
      };
    }).reverse();
    return months;
  };

  const handleOpenModal = (userId) => {
    const userFees = fees.filter((fee) => fee.userId?._id === userId);
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
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        Aidat Yönetimi
      </Typography>

      <Box>
        {users.map((user) => {
          const userFees = fees.filter((fee) => fee.userId?._id === user._id);

          return (
            <Box key={user._id} sx={{ mb: 1 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={6}>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: '0.9rem', lineHeight: 1.2, cursor: 'pointer' }}
                    onClick={() => handleOpenModal(user._id)}
                  >
                    {user.name}
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
                    (f) =>
                      f.month.toLowerCase() === monthYear.month &&
                      f.year === monthYear.year
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
