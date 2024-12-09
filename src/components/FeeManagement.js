import React, { useEffect, useState } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { styled } from '@mui/system';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchFees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/fees/last-six-months');
      const data = await response.json();

      if (Array.isArray(data)) {
        setFees(data);
      } else {
        console.error('Beklenmeyen API yanıtı:', data);
      }
    } catch (error) {
      console.error('Aidatlar yüklenirken hata:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Beklenmeyen API yanıtı:', data);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
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
      console.error('Aidat durumu güncellenemedi:', error);
    }
  };

  const getLastSixMonths = () => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }).reverse();
  };

  const FeeBox = styled('div')(({ isPaid, isInactive }) => ({
    width: 30,
    height: 30,
    backgroundColor: isInactive ? 'grey' : isPaid ? 'green' : 'red',
    margin: '0 5px',
    borderRadius: 5,
    cursor: isInactive ? 'default' : 'pointer',
    ':hover': {
      opacity: isInactive ? 1 : 0.8,
    },
  }));

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Aidat Yönetimi</Typography>
      <Box>
        {users.map((user) => {
          const userFees = fees.filter((fee) => fee.userId._id === user._id);

          return (
            <Box key={user._id} display="flex" alignItems="center" mb={2}>
              <Typography variant="body1" style={{ width: '200px' }}>
                {user.name} ({user.part})
              </Typography>
              <Box display="flex" style={{ gap: '5px' }}>
                {getLastSixMonths().map((monthYear, index) => {
                  const fee = userFees.find(
                    (f) => `${f.month} ${f.year}` === monthYear
                  );
                  return (
                    <Tooltip title={monthYear} key={index}>
                      <FeeBox
                        isPaid={fee?.isPaid || false}
                        isInactive={!fee}
                        onClick={() => fee && toggleFeeStatus(fee._id, fee.isPaid)}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default FeeManagement;
