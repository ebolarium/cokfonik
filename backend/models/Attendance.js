const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  status: { type: String, enum: ['Geldi', 'Gelmedi', 'Mazeretli'], default: 'Gelmedi' },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
