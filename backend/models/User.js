const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Master Admin', 'Yönetim Kurulu', 'Şef', 'Korist'], default: 'Korist' },
  isActive: { type: Boolean, default: true },
  part: { type: String, enum: ['Soprano', 'Alto', 'Tenor', 'Bas'], default: 'Soprano' }, // Yeni partisyon alanı
});

module.exports = mongoose.model('User', UserSchema);
