import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal, Backdrop, Fade, TextField, Button, Select, MenuItem } from '@mui/material';

const CalendarManagement = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'Prova',
    location: '',
    details: '',
  });

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      const data = await response.json();
      setEvents(data.map(event => ({
        id: event._id,
        title: event.title,
        date: new Date(event.date),
        type: event.type,
        location: event.location,
        details: event.details,
      })));
    } catch (error) {
      console.error('Etkinlikler yüklenemedi:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSaveEvent = async () => {
    const method = selectedEvent ? 'PUT' : 'POST';
    const endpoint = selectedEvent
      ? `http://localhost:5000/api/events/${selectedEvent.id}`
      : 'http://localhost:5000/api/events';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sunucu Hatası:', errorText);
        throw new Error(`Sunucu yanıtı: ${response.status} - ${errorText}`);
      }

      await fetchEvents();
      handleCloseModal();
    } catch (error) {
      console.error('Hata:', error.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
      fetchEvents();
      handleCloseModal();
    } catch (error) {
      console.error('Etkinlik silinemedi:', error);
    }
  };

  const formatDateToInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOpenModal = (event = null, date = null) => {
    setSelectedEvent(event);

    const initialDate = event
      ? formatDateToInput(event.date)
      : date
      ? formatDateToInput(date)
      : '';

    setFormData({
      title: event?.title || '',
      date: initialDate,
      type: event?.type || 'Prova',
      location: event?.location || '',
      details: event?.details || '',
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setOpenModal(false);
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const generateCalendarDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = [];
    const totalDays = daysInMonth(year, month);

    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, month, day);
      const event = events.find(e => e.date.toDateString() === currentDate.toDateString());

      days.push({
        date: currentDate,
        hasEvent: !!event,
        event,
      });
    }

    return { days, month, year };
  };

  const { days, month, year } = generateCalendarDays();

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];

  return (
    <Box minHeight="100vh" bgcolor="#f9f9f9" p={3}>
      <Typography variant="h4" gutterBottom>Takvim Yönetimi</Typography>
      <Typography
        variant="h5"
        sx={{ textAlign: 'center', marginBottom: '20px', color: '#333', fontWeight: 'bold' }}
      >
        {monthNames[month]} {year}
      </Typography>
      <Box
        sx={{
          border: '2px solid #ddd',
          borderRadius: '8px',
          padding: '10px',
          maxWidth: '350px',
          margin: '0 auto',
        }}
      >
        <Box
          display="grid"
          gridTemplateColumns="repeat(7, 1fr)"
          gap={1}
          style={{ marginTop: '15px' }}
        >
          {['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map((day, index) => (
            <Typography
              key={index}
              variant="body2"
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '0.85rem',
              }}
            >
              {day}
            </Typography>
          ))}
          {days.map((day, index) => (
            <Box
              key={index}
              onClick={() => handleOpenModal(day.event, day.date)}
              style={{
                backgroundColor: day.event
                  ? day.event.type === 'Konser'
                    ? '#ffe6e6'
                    : '#e6ffe6'
                  : '#f9f9f9',
                color: day.hasEvent ? '#000' : '#ccc',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '8px',
                textAlign: 'center',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              {day.date.getDate()}
            </Box>
          ))}
        </Box>
      </Box>

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
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              padding: '20px',
              width: '400px',
            }}
          >
            <Typography variant="h6" gutterBottom>
              {selectedEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}
            </Typography>
            <TextField
              label="Başlık"
              fullWidth
              margin="normal"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="Tarih"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Select
              fullWidth
              margin="normal"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="Prova">Prova</MenuItem>
              <MenuItem value="Konser">Konser</MenuItem>
            </Select>
            <TextField
              label="Yer"
              fullWidth
              margin="normal"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <TextField
              label="Detaylar"
              fullWidth
              margin="normal"
              multiline
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />
            <Box mt={2} display="flex" justifyContent="space-between">
              {selectedEvent && (
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                >
                  Sil
                </Button>
              )}
              <Button color="primary" variant="contained" onClick={handleSaveEvent}>
                Kaydet
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default CalendarManagement;
