import React, { useEffect, useState } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { styled } from '@mui/system';

const FeeBox = styled('div')(({ isPaid, isInactive }) => ({
  width: 30,
  height: 30,
  backgroundColor: isInactive ? 'grey' : isPaid ? 'green' : 'red',
  margin: '2px',
  borderRadius: 5,
  cursor: isInactive ? 'default' : 'pointer',
  border: '1px solid black',
  ':hover': {
    opacity: isInactive ? 1 : 0.8,
  },
}));

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
        month: date.toLocaleString('tr-TR', { month: 'long' }).toLowerCase(), // Normalize month to lowercase
        year: date.getFullYear(),
      };
    }).reverse();
    return months;
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Aidat Yönetimi</Typography>
      <Box>
        {users.map((user) => {
          const userFees = fees.filter((fee) => fee.userId?._id === user._id);

          return (
            <Box key={user._id} mb={3}>
              <Typography variant="body1" style={{ marginBottom: '8px' }}>
                {user.name} ({user.part || 'Belirtilmemiş'})
              </Typography>
              <Box display="flex" gap={1} flexWrap="nowrap">
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
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default FeeManagement;
