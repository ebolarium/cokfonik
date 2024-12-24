import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const MyAttendance = () => {
  const [attendances, setAttendances] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')); // Kullanıcı bilgisi

  useEffect(() => {
    if (!user || !user._id) {
      alert('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      window.location.href = '/';
      return;
    }

    const fetchMyAttendance = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/attendance/${user._id}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setAttendances(data);
        } else {
          console.error('API beklenmeyen bir yanıt döndü:', data);
        }
      } catch (error) {
        console.error('Devamsızlık verileri yüklenemedi:', error);
      }
    };

    fetchMyAttendance();
  }, [user]);

  // Geçmiş ve bugünkü tarihler için filtreleme ve sıralama
  const pastAndTodayAttendances = attendances
    .filter((attendance) => {
      const attendanceDate = new Date(attendance.date);
      const today = new Date();
      return (
        attendanceDate <= today &&
        attendance.event?.type === 'Prova' // "Prova" türünü kontrol eder
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // En yakın tarihten en eskiye sıralama

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Katılım Geçmişim</Typography>
      
      {/* Tabloyu kaydırılabilir hale getirmek için Box ekledik */}
      <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              <TableCell>Durum</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(pastAndTodayAttendances) && pastAndTodayAttendances.length > 0 ? (
              pastAndTodayAttendances.map((attendance) => (
                <TableRow key={attendance._id}>
                  <TableCell>{new Date(attendance.date).toLocaleDateString()}</TableCell>
                  <TableCell>{attendance.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2}>Hiç devamsızlık kaydı bulunamadı.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default MyAttendance;
