const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();

    // Aidat aylarımızın string listesi
    const turkishMonths = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    // --------------------------------------------------------
    // 1) İKİ AYDIR AİDAT VERMEME DURUMU
    // --------------------------------------------------------
    const unpaidItems = await Fee.find({ isPaid: false });
    const overdueUsers = new Set();

    for (const item of unpaidItems) {
      const feeMonthIndex = turkishMonths.indexOf(item.month);
      const feeTotal = item.year * 12 + feeMonthIndex;
      const currentTotal = currentYear * 12 + currentMonthIndex;

      if (currentTotal - feeTotal >= 2) {
        overdueUsers.add(item.userId.toString());
      }
    }
    const overdueFeeCount = overdueUsers.size;

    // --------------------------------------------------------
    // 2) SON 4 TARIHTE DEVMASIZLIK KONTROLÜ
    // --------------------------------------------------------
    const allUsers = await User.find({ isActive: true, role: { $ne: 'Şef' }, frozen: false });
    const activeUserIds = allUsers.map(user => user._id.toString());

    // Bugünden önceki son 4 benzersiz tarihe sahip kayıtları al
    const last4DatesAgg = await Attendance.aggregate([
      { 
        $match: { 
          date: { $lt: now } 
        } 
      },
      { 
        $group: { 
          _id: '$date' 
        } 
      },
      { 
        $sort: { _id: -1 } 
      },
      { 
        $limit: 4 
      }
    ]);

    const last4Dates = last4DatesAgg.map(item => item._id);

    const absentUsers = new Set();

    for (const userId of activeUserIds) {
      const userAttendances = await Attendance.find({
        userId,
        date: { $in: last4Dates },
        status: { $in: ["GELMEDI", "gelmedi", "Gelmedi"] }
      }).sort({ date: -1 });

      

      // Eğer kullanıcı son 4 tarihte de gelmediyse ekle
      if (userAttendances.length === 4) {
        absentUsers.add(userId);
      }
    }

    const repeatedAbsCount = absentUsers.size;



    res.json({ overdueFeeCount, repeatedAbsCount });

  } catch (error) {
    console.error('Sunucu hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
