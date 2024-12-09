import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Typography, Dialog, DialogTitle, DialogContent, TextField, Button, Select, MenuItem } from '@mui/material';

const CalendarManagement = () => {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'Prova',
    location: '',
    details: '',
  });

  // Etkinlikleri Getir
  const fetchEvents = async () => {
    const response = await fetch('http://localhost:5000/api/events');
    const data = await response.json();
    setEvents(data.map(event => ({
      id: event._id,
      title: event.title,
      date: event.date,
      backgroundColor: event.type === 'Prova' ? '#ffc107' : '#007bff', // Farklı renkler
    })));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Yeni Etkinlik Ekle
  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      fetchEvents();
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Takvim Yönetimi</Typography>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Yeni Etkinlik Ekle
      </Button>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        editable={true}
        eventClick={(info) => alert(`Etkinlik: ${info.event.title}`)}
      />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Yeni Etkinlik</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddEvent}>
            <TextField
              label="Başlık"
              name="title"
              fullWidth
              margin="normal"
              required
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="Tarih"
              type="date"
              name="date"
              fullWidth
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Select
              label="Tür"
              name="type"
              fullWidth
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              margin="normal"
            >
              <MenuItem value="Prova">Prova</MenuItem>
              <MenuItem value="Konser">Konser</MenuItem>
            </Select>
            <TextField
              label="Yer"
              name="location"
              fullWidth
              margin="normal"
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <TextField
              label="Detaylar"
              name="details"
              fullWidth
              margin="normal"
              multiline
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />
            <Button type="submit" variant="contained" color="primary">
              Kaydet
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CalendarManagement;
