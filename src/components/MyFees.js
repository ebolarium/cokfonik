import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const MyFees = () => {
  const [fees, setFees] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')); // Kullanıcı bilgisi

  useEffect(() => {
    if (!user || !user._id) {
      alert('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      window.location.href = '/';
      return;
    }

    const fetchMyFees = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/fees/${user._id}`); // Kullanıcıya özel endpoint
        const data = await response.json();
        setFees(data);
      } catch (error) {
        console.error('Aidat verileri yüklenemedi:', error);
      }
    };

    fetchMyFees();
  }, [user]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Aidat Durumu</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ay/Yıl</TableCell>
            <TableCell>Durum</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fees.map((fee) => (
            <TableRow key={fee._id}>
              <TableCell>{`${fee.month} ${fee.year}`}</TableCell>
              <TableCell>{fee.isPaid ? 'Ödendi' : 'Ödenmedi'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default MyFees;
