const express = require('express');
const Announcement = require('../models/Announcement'); // Duyuru modeli
const router = express.Router();

// Yeni Duyuru Oluştur
router.post('/', async (req, res) => {
  const { title, content, userId } = req.body;

  try {
    const newAnnouncement = new Announcement({
      title,
      content,
      createdBy: userId, // Frontend'den gelen userId
    });

    await newAnnouncement.save();
    res.status(201).json({ message: 'Duyuru başarıyla oluşturuldu.', announcement: newAnnouncement });
  } catch (error) {
    console.error('Duyuru oluşturulurken hata:', error);
    res.status(500).json({ message: 'Duyuru oluşturulamadı.' });
  }
});

// Duyuruları Listele
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().populate('createdBy', 'name surname');
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Duyurular alınırken hata:', error);
    res.status(500).json({ message: 'Duyurular alınamadı.' });
  }
});

// Duyuruyu Okundu Olarak İşaretle
router.patch('/:id/read', async (req, res) => {
  const { id } = req.params; // id doğrudan params'tan alınır
  const { userId } = req.body;

  try {
    const announcement = await Announcement.findById(id); // Burada doğru ObjectId aranır
    if (!announcement) {
      return res.status(404).json({ message: 'Duyuru bulunamadı.' });
    }

    if (!announcement.readBy.includes(userId)) {
      announcement.readBy.push(userId);
      await announcement.save();
    }

    res.status(200).json({ message: 'Duyuru okundu olarak işaretlendi.', announcement });
  } catch (error) {
    console.error('Duyuru okundu olarak işaretlenirken hata:', error);
    res.status(500).json({ message: 'Duyuru işaretlenemedi.' });
  }
});



// Duyuru Sil
router.delete('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Duyuru bulunamadı.' });
    }

    res.status(200).json({ message: 'Duyuru başarıyla silindi.' });
  } catch (error) {
    console.error('Duyuru silinirken hata:', error);
    res.status(500).json({ message: 'Duyuru silinemedi.' });
  }
});



// Duyuruyu Gizle
router.patch('/:id/hide', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Duyuru bulunamadı.' });
    }

    // Kullanıcı zaten gizlememişse ekle
    if (!announcement.hiddenBy.includes(userId)) {
      announcement.hiddenBy.push(userId);
      await announcement.save();
    }

    res.status(200).json({ message: 'Duyuru başarıyla gizlendi.' });
  } catch (error) {
    console.error('Duyuru gizlenirken hata:', error);
    res.status(500).json({ message: 'Duyuru gizlenemedi.' });
  }
});

module.exports = router;
