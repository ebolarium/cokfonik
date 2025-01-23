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
  TableSortLabel,
  TextField,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { styled } from '@mui/system';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const attendanceStatuses = {
  GELDI: 'green',
  GELMEDI: 'red',
  MAZERETLI: 'yellow',
};

const AttendanceBoxWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  position: 'relative',
  minHeight: '28px',
});

const AttendanceBox = styled('div')(({ status }) => ({
  width: 20,
  height: 20,
  backgroundColor: attendanceStatuses[status] || 'grey',
  margin: '2px 0',
  borderRadius: 5,
  cursor: 'pointer',
  ':hover': {
    opacity: 0.8,
  },
}));

const ExplanationBox = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  position: 'absolute',
  left: '28px',
  zIndex: 1000,
  backgroundColor: 'white',
  padding: '4px',
  borderRadius: '4px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',

});

const AttendanceManagement = () => {
  const [attendances, setAttendances] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUserAttendances, setSelectedUserAttendances] = useState([]);
  const scrollContainerRef = useRef(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [lastCount, setLastCount] = useState('4');
  const [explanations, setExplanations] = useState({}); // { attendanceId: explanation }
  const [visibleExplanations, setVisibleExplanations] = useState({}); // { attendanceId: boolean }

  const fetchAttendances = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/attendance`);
      const data = await response.json();
      setAttendances(data);
    } catch (error) {
      console.error('Devamsızlık verileri alınırken hata oluştu:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`);
      const data = await response.json();
      const activeUsers = data.filter((user) => 
        user.isActive && 
        user.role !== 'Şef' && 
        !user.frozen // frozen olmayanlar
      );
      setUsers(activeUsers);
    } catch (error) {
      console.error('Kullanıcı verileri alınırken hata:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Etkinlik verileri alınırken hata oluştu:', error);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (orderBy === 'name') {
      return order === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (orderBy === 'part') {
      const partA = a.part || '';
      const partB = b.part || '';
      return order === 'asc'
        ? partA.localeCompare(partB)
        : partB.localeCompare(partA);
    }
    return 0;
  });

  const toggleAttendanceStatus = async (attendanceId, currentStatus) => {
    const statuses = ['GELMEDI', 'GELDI', 'MAZERETLI'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    
    const excuse = explanations[attendanceId];
    const updateData = {
      status: nextStatus,
      excuse: nextStatus === 'MAZERETLI' ? excuse : null
    };

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/attendance/${attendanceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (nextStatus !== 'MAZERETLI') {
        setExplanations(prev => {
          const newExplanations = { ...prev };
          delete newExplanations[attendanceId];
          return newExplanations;
        });
        setVisibleExplanations(prev => {
          const newVisible = { ...prev };
          delete newVisible[attendanceId];
          return newVisible;
        });
      }
      
      fetchAttendances();
    } catch (error) {
      console.error('Devamsızlık durumu güncellenirken hata oluştu:', error);
    }
  };

  const handleExplanationSave = async (attendanceId) => {
    const excuse = explanations[attendanceId];
    if (excuse?.trim()) {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/attendance/${attendanceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'MAZERETLI',
            excuse: excuse
          }),
        });
        
        setVisibleExplanations(prev => ({
          ...prev,
          [attendanceId]: false
        }));
        
        fetchAttendances();
      } catch (error) {
        console.error('Mazeret kaydedilirken hata oluştu:', error);
      }
    }
  };

// handleAttendanceClick fonksiyonunu şu şekilde değiştirin
const handleAttendanceClick = (attendance) => {
  // Önce durum döngüsünü her zaman işlet
  toggleAttendanceStatus(attendance._id, attendance.status);
  
  // Eğer yeni durum MAZERETLI olacaksa (yani şu an GELDI ise), açıklama kutusunu göster
  if (attendance.status === 'GELDI') {
    // Bir sonraki durum MAZERETLI olacağı için textbox'ı göster
    setTimeout(() => {
      setVisibleExplanations(prev => ({
        ...prev,
        [attendance._id]: true
      }));
      // Eğer daha önce bir açıklama varsa, state'e yükle
      if (attendance.excuse) {
        setExplanations(prev => ({
          ...prev,
          [attendance._id]: attendance.excuse
        }));
      }
    }, 100); // Küçük bir gecikme ekleyerek state güncellemelerinin sırasını garanti altına alıyoruz
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
    const event = events.find(
      (e) =>
        new Date(e.date).toDateString() === new Date(date).toDateString() &&
        e.type === 'Prova'
    );
    return event ? event.type : 'Bilinmiyor';
  };

  const getAllProvaDates = () => {
    const provaEvents = events.filter((e) => e.type === 'Prova');
    const uniqueDates = [
      ...new Set(
        provaEvents.map((e) =>
          new Date(e.date).toLocaleDateString('en-GB')
        )
      ),
    ];
    uniqueDates.sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/');
      const [dayB, monthB, yearB] = b.split('/');
      const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
      const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
      return dateA - dateB;
    });
    return uniqueDates;
  };

  const [provaDates, setProvaDates] = useState([]);

  useEffect(() => {
    if (events.length > 0) {
      const dates = getAllProvaDates();
      setProvaDates(dates);
    }
  }, [events]);

  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Devamsızlıklar');

      const headerRow = ['İsim', 'Soyisim', 'Partisyon', ...provaDates];
      worksheet.addRow(headerRow);

      const firstRow = worksheet.getRow(1);
      firstRow.font = { bold: true };
      firstRow.alignment = { vertical: 'middle', horizontal: 'center' };

      users.forEach((user) => {
        const row = [user.name, user.surname, user.part || '-'];

        provaDates.forEach((date) => {
          const attendance = attendances.find(
            (a) =>
              a.userId?._id === user._id &&
              new Date(a.date).toLocaleDateString('en-GB') === date &&
              getEventType(a.date) === 'Prova'
          );

          if (attendance) {
            row.push(attendance.status);
          } else {
            row.push('N/A');
          }
        });

        const addedRow = worksheet.addRow(row);

        provaDates.forEach((date, index) => {
          const cell = addedRow.getCell(4 + index);
          const attendance = attendances.find(
            (a) =>
              a.userId?._id === user._id &&
              new Date(a.date).toLocaleDateString('en-GB') === date &&
              getEventType(a.date) === 'Prova'
          );

          if (attendance) {
            if (attendance.status === 'GELDI') {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF00FF00' },
              };
            } else if (attendance.status === 'GELMEDI') {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF0000' },
              };
            } else if (attendance.status === 'MAZERETLI') {
            
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF00' },
              };
            }
          } else {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFCCCCCC' },
            };
          }

          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'Devamsizliklar.xlsx');
    } catch (error) {
      console.error('Excel dosyası oluşturulurken hata oluştu:', error);
      alert('Excel dosyası oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const renderAttendanceGrid = (userId) => {
    let userAttendances = attendances
      .filter(
        (a) =>
          a.userId?._id === userId &&
          new Date(a.date) < new Date() &&
          getEventType(a.date) === 'Prova'
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (lastCount.trim() !== '') {
      const count = parseInt(lastCount, 10);
      if (!isNaN(count) && count > 0) {
        userAttendances = userAttendances.slice(-count);
      }
    }

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
          <Tooltip
            title={new Date(attendance.date).toLocaleDateString()}
            key={attendance._id}
          >
            <AttendanceBoxWrapper>
              <AttendanceBox
                status={attendance.status}
                onClick={() => handleAttendanceClick(attendance)}
              />
              {attendance.status === 'MAZERETLI' && visibleExplanations[attendance._id] && (
                <ExplanationBox>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Mazeret açıklaması..."
                    value={explanations[attendance._id] || ''}
                    onChange={(e) => setExplanations(prev => ({
                      ...prev,
                      [attendance._id]: e.target.value
                    }))}
                    autoFocus
                    sx={{ width: '150px' }}
                  />
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleExplanationSave(attendance._id)}
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setVisibleExplanations(prev => ({
                      ...prev,
                      [attendance._id]: false
                    }))}
                  >
                    <CloseIcon />
                  </IconButton>
                </ExplanationBox>
              )}
            </AttendanceBoxWrapper>
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
        marginTop: '16px',
        marginBottom: '64px',
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        Devamsızlık Yönetimi
      </Typography>

      {/* Export Butonu */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={exportToExcel}>
          Excel'e Aktar
        </Button>
      </Box>

      {/* Son kaç çalışma gösterilsin? */}
      <TextField
        label="Son kaç çalışma"
        variant="outlined"
        size="small"
        value={lastCount}
        onChange={(e) => setLastCount(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Table sx={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', width: '50%' }}>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={orderBy === 'name' ? order : 'asc'}
                onClick={() => handleRequestSort('name')}
              >
                Korist
              </TableSortLabel>
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textAlign: 'right',
                width: '25%',
              }}
            >
              <TableSortLabel
                active={orderBy === 'part'}
                direction={orderBy === 'part' ? order : 'asc'}
                onClick={() => handleRequestSort('part')}
              >
                Part.
              </TableSortLabel>
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
          {sortedUsers.map((user) => {
            // Sadece "Prova" etkinliklerini filtreleyin
            const userAttendances = attendances.filter(
              (a) => a.userId?._id === user._id && getEventType(a.date) === 'Prova'
            );
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
                    sx={{
                      fontSize: '0.85rem',
                      verticalAlign: 'middle',
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleOpenModal(user._id)}
                  >
                    {`${user.name} ${user.surname}`}
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
              {selectedUserAttendances
                .filter((attendance) => getEventType(attendance.date) === 'Prova')
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((attendance) => (
                  <ListItem key={attendance._id}>
                    <ListItemText
                      primary={`${new Date(attendance.date).toLocaleDateString()} - ${attendance.status}`}
                      secondary={
                        attendance.status === 'MAZERETLI'
                          ? `Mazeret: ${attendance.excuse || '-'}`
                          : null
                      }
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