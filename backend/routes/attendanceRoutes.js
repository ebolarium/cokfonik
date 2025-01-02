const express = require('express');
const Attendance = require('../models/Attendance');

const router = express.Router();

// Tüm Devamsızlık Kayıtlarını Getir
router.get('/', async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find().populate({
      path: 'userId',
      select: 'name email part',
      match: { _id: { $ne: null } }, // null olmayanları filtrele
    });
    res.json(attendanceRecords.filter(record => record.userId !== null)); // null olmayanları döndür
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Kullanıcıya Özel Devamsızlık Kayıtlarını Getir
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId || userId === 'undefined') {
    return res.status(400).json({ message: 'Geçersiz kullanıcı kimliği.' });
  }

  try {
    const attendanceRecords = await Attendance.find({ userId }).populate({
      path: 'event',
      select: 'type date title',
    });
    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// Yeni Devamsızlık Kaydı Ekle
router.post('/', async (req, res) => {
  const { userId, date, status } = req.body;

  try {
    const newAttendance = new Attendance({ userId, date, status });
    await newAttendance.save();
    res.status(201).json(newAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Devamsızlık Statüsünü Güncelle
router.put('/:id', async (req, res) => {
  try {
    const { status, explanation } = req.body;
    const updateData = { status };
    
    if (status === 'MAZERETLI' && explanation) {
      updateData.explanation = explanation;
    } else if (status !== 'MAZERETLI') {
      updateData.explanation = null; // Diğer durumlarda açıklamayı temizle
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/generate-attendance-for-event', async (req, res) => {
  const { eventId } = req.body;
  try {
    const users = await User.find();
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Etkinlik bulunamadı' });
    }

    const attendanceRecords = users.map((user) => ({
      userId: user._id,
      date: event.date,
      status: 'Gelmedi',
    }));

    await Attendance.insertMany(attendanceRecords);
    res.status(201).json({ message: 'Devamsızlık kayıtları oluşturuldu' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


module.exports = router;
