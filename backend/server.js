const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const User = require('./models/User'); // Modelin doğru yolu




dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.error(err));


const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const feeRoutes = require('./routes/feeRoutes');
app.use('/api/fees', feeRoutes);
const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', attendanceRoutes);
const eventRoutes = require('./routes/eventRoutes');
app.use('/api/events', eventRoutes);



// Login Route
const bcrypt = require('bcryptjs');

// Login Route


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Şifre kontrolü (düz metin)
    if (password !== user.password) {
      return res.status(401).json({ message: 'Hatalı şifre.' });
    }

    res.status(200).json({
      message: 'Giriş başarılı!',
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login endpoint error:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
});




  



cron.schedule('0 0 1 * *', async () => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
  
    try {
      const users = await User.find();
      const feePromises = users.map(async (user) => {
        const existingFee = await Fee.findOne({ userId: user._id, month, year });
        if (!existingFee) {
          const newFee = new Fee({ userId: user._id, month, year });
          await newFee.save();
        }
      });
      await Promise.all(feePromises);
      console.log('Yeni aidat kayıtları başarıyla oluşturuldu.');
    } catch (error) {
      console.error('Aidat kayıtları oluşturulurken hata:', error.message);
    }
  });




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
