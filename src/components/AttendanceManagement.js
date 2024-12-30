// AttendanceManagement.js
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
import { styled } from '@mui/system';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');

  // Bu state kaç çalışmayı göstereceğimizi tutuyor
  const [lastCount, setLastCount] = useState('4');

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

      // ‘isActive: false’ olan kullanıcıları filtrele
      const activeUsers = data.filter((user) => user.isActive && user.role !== 'Şef');
      setUsers(activeUsers);
    } catch (error) {
      console.error('Kullanıcı verileri alınırken hata:', error);
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

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events`);
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
      await fetch(`${process.env.REACT_APP_API_URL}/attendance/${attendanceId}`, {
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
    const event = events.find(
      (e) =>
        new Date(e.date).toDateString() === new Date(date).toDateString() &&
        e.type === 'Prova'
    );
    return event ? event.type : 'Bilinmiyor';
  };

  // Helper Fonksiyon: Tüm Prova Tarihlerini Al ve Sırala
  const getAllProvaDates = () => {
    const provaEvents = events.filter((e) => e.type === 'Prova');
    const uniqueDates = [
      ...new Set(
        provaEvents.map((e) =>
          new Date(e.date).toLocaleDateString('en-GB') // DD/MM/YYYY formatında
        )
      ),
    ];
    // Tarihleri sıralayın
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

  // Export Fonksiyonu: Yatay Tablo Yapısına Uygun
  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Devamsızlıklar');

      // Başlık Satırını Oluştur
      const headerRow = ['İsim', 'Soyisim', 'Partisyon', ...provaDates];
      worksheet.addRow(headerRow);

      // Başlık Satırını Stil Ver
      const firstRow = worksheet.getRow(1);
      firstRow.font = { bold: true };
      firstRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Her Kullanıcı için Satır Ekle
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
            row.push('N/A'); // Devamsızlık kaydı yoksa 'N/A' olarak ekle
          }
        });

        const addedRow = worksheet.addRow(row);

        // Tarih Sütunlarını Renklendir
        provaDates.forEach((date, index) => {
          const cell = addedRow.getCell(4 + index); // İlk üç sütun İsim, Soyisim, Partisyon
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
                fgColor: { argb: 'FF00FF00' }, // Yeşil
              };
            } else if (attendance.status === 'GELMEDI') {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF0000' }, // Kırmızı
              };
            } else if (attendance.status === 'MAZERETLI') {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF00' }, // Sarı
              };
            }
          } else {
            // 'N/A' hücreleri gri renkle işaretleyebilirsiniz
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFCCCCCC' }, // Açık Gri
            };
          }

          // Hücreyi Ortala
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      });

      // Excel Dosyasını Oluştur ve İndir
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'Devamsizliklar.xlsx');
    } catch (error) {
      console.error('Excel dosyası oluşturulurken hata oluştu:', error);
      alert('Excel dosyası oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const renderAttendanceGrid = (userId) => {
    // Önce bu kullanıcıya ait, geçmiş tarihli ve "Prova" türünde olanları çekiyoruz
    let userAttendances = attendances
      .filter(
        (a) =>
          a.userId?._id === userId &&
          new Date(a.date) < new Date() &&
          getEventType(a.date) === 'Prova'
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Eğer son kaç çalışma gösterilsin alanı boş değilse, userAttendances'ın son X tanesini alıyoruz
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
            <AttendanceBox
              status={attendance.status}
              onClick={() =>
                toggleAttendanceStatus(attendance._id, attendance.status)
              }
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
                .map((attendance) => (
                  <ListItem key={attendance._id}>
                    <ListItemText
                      primary={`${new Date(attendance.date).toLocaleDateString()} - ${
                        attendance.status
                      }`}
                      secondary="🎤 Prova"
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