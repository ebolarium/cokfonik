// ./routes/announcementRoutes.js

const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement'); // Duyuru modeli
const Subscription = require('../models/Subscription'); // Abonelik modeli
const webPush = require('web-push');

// POST /api/announcements - Yeni Duyuru Oluşturma
router.post('/', async (req, res) => {
  const { title, content, userId } = req.body;

  if (!title || !content || !userId) {
    return res.status(400).json({ message: 'Başlık, içerik ve kullanıcı ID\'si gereklidir.' });
  }

  try {
    const newAnnouncement = new Announcement({
      title,
      content,
      createdBy: userId, // Frontend'den gelen userId
    });

    await newAnnouncement.save();

    // Tüm abonelikleri alın
    const subscriptions = await Subscription.find();

    if (subscriptions.length > 0) {
      const payload = JSON.stringify({
        title: newAnnouncement.title,
        body: newAnnouncement.content,
        url: '/', // Bildirim tıklandığında açılacak URL
      });

      // Tüm abonelere bildirim gönder
      const sendNotifications = subscriptions.map(sub => {
        return webPush.sendNotification(sub, payload).catch(error => {
          console.error('Bildirim gönderilemedi:', error);
          // Hata durumunda aboneliği silebilirsiniz (endpoint geçersiz olabilir)
          if (error.statusCode === 410 || error.statusCode === 404) {
            return Subscription.findOneAndDelete({ endpoint: sub.endpoint });
          }
        });
      });

      await Promise.all(sendNotifications);
    }

    res.status(201).json({ message: 'Duyuru başarıyla oluşturuldu.', announcement: newAnnouncement });
  } catch (error) {
    console.error('Duyuru oluşturulurken hata:', error);
    res.status(500).json({ message: 'Duyuru oluşturulamadı.' });
  }
});

// GET /api/announcements - Tüm Duyuruları Getirme
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().populate('createdBy', 'username email');
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Duyurular alınırken hata:', error);
    res.status(500).json({ message: 'Duyurular alınamadı.' });
  }
});

// PATCH /api/announcements/:id/read - Duyuruyu Okundu Olarak İşaretleme
router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Kullanıcı ID\'si gereklidir.' });
  }

  try {
    const announcement = await Announcement.findById(id);
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

// PATCH /api/announcements/:id/hide - Duyuruyu Gizleme
router.patch('/:id/hide', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Kullanıcı ID\'si gereklidir.' });
  }

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

// DELETE /api/announcements/:id - Duyuru Silme
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

module.exports = router;
