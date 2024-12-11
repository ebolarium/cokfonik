import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Modal,
  Backdrop,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/system';

const attendanceStatuses = {
  GELDI: 'green',
  GELMEDI: 'red',
  MAZERETLI: 'yellow',
};

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
  const [events, setEvents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUserAttendances, setSelectedUserAttendances] = useState([]);
  const scrollContainerRef = useRef(null);

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

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Etkinlik verileri alınırken hata oluştu:', error);
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
      fetchAttendances();
    } catch (error) {
      console.error('Devamsızlık durumu güncellenirken hata oluştu:', error);
    }
  };

  useEffect(() => {
    fetchAttendances();
    fetchUsers();
    fetchEvents();
  }, []);

  const handleOpenModal = (userId) => {
    const userAttendances = attendances.filter((a) => a.userId?._id === userId);
    setSelectedUserAttendances(userAttendances);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUserAttendances([]);
  };

  const getEventType = (date) => {
    const event = events.find((e) => new Date(e.date).toISOString() === new Date(date).toISOString());
    return event ? event.type : 'Bilinmiyor';
  };

  const renderAttendanceGrid = (userId) => {
    const userAttendances = attendances
      .filter((a) => a.userId?._id === userId && new Date(a.date) < new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sıralamayı en eski solda olacak şekilde değiştirdik
      .slice(0, 10);

    return (
      <Box
        ref={scrollContainerRef}
        display="flex"
        gap={0.5}
        flexWrap="nowrap"
        sx={{
          overflowX: 'auto',
          paddingBottom: '8px',
          '::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {userAttendances.map((attendance) => (
          <Tooltip title={new Date(attendance.date).toLocaleDateString()} key={attendance._id}>
            <AttendanceBox
              status={attendance.status}
              onClick={() => toggleAttendanceStatus(attendance._id, attendance.status)}
            />
          </Tooltip>
        ))}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        p: 2,
        height: '100vh',
        overflowY: 'auto',
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
          {users.map((user) => {
            const userAttendances = attendances.filter((a) => a.userId?._id === user._id);
            const cameCount = userAttendances.filter((a) => a.status === 'GELDI').length;

            return (
              <React.Fragment key={user._id}>
                <TableRow
                  sx={{
                    borderBottom: 'none',
                    height: '40px',
                  }}
                >
                  <TableCell
                    sx={{ fontSize: '0.85rem', verticalAlign: 'middle', padding: '4px 8px', cursor: 'pointer' }}
                    onClick={() => handleOpenModal(user._id)}
                  >
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
                    {renderAttendanceGrid(user._id)}
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

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
              Kullanıcı Etkinlik Detayları
            </Typography>
            <List>
              {selectedUserAttendances.map((attendance) => (
                <ListItem key={attendance._id}>
                  <ListItemText
                    primary={`${new Date(attendance.date).toLocaleDateString()} - ${attendance.status}`}
                    secondary={getEventType(attendance.date) === 'Prova' ? '🎤 Prova' : '🎵 Konser'}
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

export default AttendanceManagement;
