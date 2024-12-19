import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user'))?._id;
        const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements`);
        const data = await response.json();
        const visibleAnnouncements = data.filter(
          (announcement) => !announcement.hiddenBy?.includes(userId)
        );
        setAnnouncements(visibleAnnouncements);
      } catch (error) {
        console.error('Duyurular yüklenemedi:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  const hideAnnouncement = async (id) => {
    const userId = JSON.parse(localStorage.getItem('user'))?._id;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/announcements/${id}/hide`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setAnnouncements((prev) => prev.filter((announcement) => announcement._id !== id));
      } else {
        console.error('Duyuru gizlenemedi.');
      }
    } catch (error) {
      console.error('Duyuru gizlenirken hata:', error);
    }
  };

  return (
    <Box p={3} bgcolor="#f9f9f9" minHeight="100vh">
      <Typography variant="h4" gutterBottom>Duyurular</Typography>
      {announcements.map((announcement) => (
        <Card key={announcement._id} sx={{ mb: 2, boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold">{announcement.title}</Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>{announcement.content}</Typography>
            <IconButton
              color="error"
              onClick={() => hideAnnouncement(announcement._id)}
              sx={{ float: 'right' }}
            >
              <DeleteIcon />
            </IconButton>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default AnnouncementsPage;
