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
  width: 20,
  height: 20,
  backgroundColor: attendanceStatuses[status] || 'grey',
  margin: '2px',
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
    try {
      const response = await fetch('http://localhost:5000/api/attendance');
      const data = await response.json();
      setAttendances(data);
    } catch (error) {
      console.error('Devamsızlık verileri alınırken hata oluştu:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Kullanıcı verileri alınırken hata oluştu:', error);
    }
  };

  const toggleAttendanceStatus = async (attendanceId, currentStatus) => {
    const statuses = ['GELMEDI', 'GELDI', 'MAZERETLI'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

    try {
      await fetch(`http://localhost:5000/api/attendance/${attendanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchAttendances(); // Güncellemeden sonra tekrar getir
    } catch (error) {
      console.error('Devamsızlık durumu güncellenirken hata oluştu:', error);
    }
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
    <Box
      sx={{
        p: 2,
        height: '100vh',
        overflowY: 'auto', // Kaydırma çubuğunu etkinleştirir
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        Devamsızlık Yönetimi
      </Typography>
      <Table sx={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: '50%' }}>Korist</TableCell>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textAlign: 'right',
                width: '25%',
              }}
            >
              Part.
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textAlign: 'right',
                width: '25%',
              }}
            >
              Durum
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, index) => {
            const userAttendances = attendances.filter((a) => a.userId?._id === user._id);
            const cameCount = userAttendances.filter((a) => a.status === 'GELDI').length;

            return (
              <React.Fragment key={user._id}>
<TableRow
  sx={{
    borderBottom: 'none',
    height: '40px', // Satır yüksekliğini küçültüyoruz
  }}
>
  <TableCell sx={{ fontSize: '0.85rem', verticalAlign: 'middle', padding: '4px 8px' }}>
    {user.name}
  </TableCell>
  <TableCell sx={{ fontSize: '0.85rem', textAlign: 'right', padding: '4px 8px' }}>
    {user.part || '-'}
  </TableCell>
  <TableCell sx={{ fontSize: '0.85rem', textAlign: 'right', padding: '4px 8px' }}>
    {`${cameCount}/${userAttendances.length}`}
  </TableCell>
</TableRow>
<TableRow>
  <TableCell colSpan={3} sx={{ paddingTop: '2px', paddingBottom: '2px' }}>
    <Box display="flex" gap={1} flexWrap="nowrap">
      {renderAttendanceGrid(user._id)}
    </Box>
  </TableCell>
</TableRow>

                {index < users.length - 1 && <tr style={{ height: '8px' }}></tr>}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default AttendanceManagement;
