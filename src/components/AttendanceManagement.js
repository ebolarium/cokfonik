import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import { styled } from '@mui/system';

const attendanceStatuses = {
  GELDI: 'green',
  GELMEDI: 'red',
  MAZERETLI: 'yellow',
};

// Stil tanımlamaları
const AttendanceBox = styled('div')(({ status }) => ({
  width: 25,
  height: 25,
  backgroundColor: attendanceStatuses[status] || 'grey',
  margin: '0 auto',
  borderRadius: 5,
  cursor: 'pointer',
  ':hover': {
    opacity: 0.8,
  },
}));

const AttendanceManagement = () => {
  const [attendances, setAttendances] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchAttendances();
    fetchUsers();
  }, []);

  const fetchAttendances = async () => {
    const response = await fetch('http://localhost:5000/api/attendance');
    const data = await response.json();
    setAttendances(data);
  };

  const fetchUsers = async () => {
    const response = await fetch('http://localhost:5000/api/users');
    const data = await response.json();
    setUsers(data);
  };

  const toggleAttendanceStatus = async (attendanceId, currentStatus) => {
    const statuses = ['GELMEDI', 'GELDI', 'MAZERETLI'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

    await fetch(`http://localhost:5000/api/attendance/${attendanceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    fetchAttendances(); // Güncellemeden sonra tekrar getir
  };

  const renderAttendanceGrid = (userId) => {
    const userAttendances = attendances.filter((a) => a.userId?._id === userId);

    return userAttendances.map((attendance) => (
      <Tooltip title={new Date(attendance.date).toLocaleDateString()} key={attendance._id}>
        <AttendanceBox
          status={attendance.status}
          onClick={() => toggleAttendanceStatus(attendance._id, attendance.status)}
        />
      </Tooltip>
    ));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Devamsızlık Yönetimi</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Korist</TableCell>
            <TableCell>Partisyon</TableCell>
            <TableCell>Toplam (Geldi/Prova)</TableCell>
            <TableCell>Provalar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => {
            const userAttendances = attendances.filter((a) => a.userId?._id === user._id);
            const cameCount = userAttendances.filter((a) => a.status === 'GELDI').length;

            return (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.part || 'Belirtilmemiş'}</TableCell> {/* Partisyon bilgisi */}
                <TableCell>{`${cameCount}/${userAttendances.length}`}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>{renderAttendanceGrid(user._id)}</Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default AttendanceManagement;
