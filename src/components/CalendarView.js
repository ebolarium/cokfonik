import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Modal, Backdrop, Fade, List, ListItem, ListItemText } from '@mui/material';

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // Modal için seçilen etkinlik
  const [open, setOpen] = useState(false); // Modal durumu

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/events`);
        const data = await response.json();
        setEvents(
          data.map((event) => ({
            title: event.title,
            description: event.details, // Detaylar için doğru alan
            date: new Date(event.date),
            type: event.type, // Etkinlik tipi
          }))
        );
      } catch (error) {
        console.error('Etkinlikler yüklenemedi:', error);
      }
    };

    fetchEvents();
  }, []);

  const daysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendarDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = [];
    const totalDays = daysInMonth(year, month);

    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, month, day);
      const event = events.find(
        (event) => event.date.toDateString() === currentDate.toDateString()
      );

      days.push({
        date: currentDate,
        hasEvent: !!event,
        event: event,
      });
    }

    return days;
  };

  const handleDayClick = (day) => {
    if (day.hasEvent) {
      setSelectedEvent(day.event);
      setOpen(true);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  const days = generateCalendarDays();
  const upcomingEvents = events
    .filter((event) => event.date > new Date())
    .slice(0, 4); // Sonraki 4 etkinliği al

  return (
    <Box minHeight="100vh" bgcolor="#f9f9f9" p={3}>
      {/* Takvim Kartı */}
      <Card style={{ padding: '15px', marginBottom: '10px', textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Takvim
        </Typography>
        <Box
          display="grid"
          gridTemplateColumns="repeat(7, 1fr)"
          gap={1}
          style={{ marginTop: '15px' }}
        >
          {/* Haftanın günleri */}
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
          {/* Günler */}
          {days.map((day, index) => (
            <Box
              key={index}
              onClick={() => handleDayClick(day)}
              style={{
                backgroundColor: day.hasEvent
                  ? day.event.type === 'Konser'
                    ? '#ffe6e6' // Konser için kırmızımsı renk
                    : '#e6ffe6' // Diğer etkinlikler için yeşilimsi renk
                  : '#f9f9f9',
                color: day.hasEvent ? '#000' : '#ccc',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '8px',
                textAlign: 'center',
                fontSize: '0.9rem',
                cursor: day.hasEvent ? 'pointer' : 'default',
              }}
            >
              {day.date.getDate()}
            </Box>
          ))}
        </Box>
      </Card>

      {/* Sonraki 4 Etkinlik */}
      <Card style={{ padding: '15px', textAlign: 'center' }}>
  <Typography variant="h6" gutterBottom>
    Sonraki Etkinlikler
  </Typography>
  <List dense>
    {upcomingEvents.map((event, index) => (
      <ListItem
        key={index}
        button
        onClick={() => handleEventClick(event)}
        sx={{
          padding: '4px 8px', // Varsayılan padding azaltıldı
          marginBottom: '0', // Alt boşluk tamamen kaldırıldı
          lineHeight: 1.2, // Satır yüksekliği azaltıldı
          '&.MuiListItem-root': {
            minHeight: 'unset', // Varsayılan minimum yükseklik kaldırıldı
          },
        }}
        className="custom-list-item"
      >
        <ListItemText
          primary={event.title}
          secondary={`Tarih: ${event.date.toLocaleDateString('tr-TR')}`}
          primaryTypographyProps={{
            style: { fontSize: '0.9rem', lineHeight: 1.2 }, // Yazı boyutu küçültüldü
          }}
          secondaryTypographyProps={{
            style: { fontSize: '0.8rem', color: '#666', lineHeight: 1.2 }, // Alt yazı boyutu ve satır yüksekliği
          }}
          className="custom-list-item-text"
        />
      </ListItem>
    ))}
    {upcomingEvents.length === 0 && (
      <Typography variant="body2" color="textSecondary">
        Yaklaşan etkinlik bulunmamaktadır.
      </Typography>
    )}
  </List>
</Card>



      {/* Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
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
              width: '300px',
            }}
          >
            {selectedEvent ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {selectedEvent.title}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedEvent.description || 'Detay yok'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tarih: {selectedEvent.date.toLocaleDateString('tr-TR')}
                </Typography>
              </>
            ) : (
              <Typography>Detay bulunamadı.</Typography>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default CalendarView;
