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

  // Geçmiş ve bugünkü tarihler için filtreleme
  const pastAndTodayAttendances = attendances.filter((attendance) => {
    const attendanceDate = new Date(attendance.date);
    const today = new Date();
    return attendanceDate <= today; // Yalnızca bugüne kadar olan tarihleri göster
  });

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Katılım Geçmişim</Typography>
      <Table>
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
  );
};

export default MyAttendance;
