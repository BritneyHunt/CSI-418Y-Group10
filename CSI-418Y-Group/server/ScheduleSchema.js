const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeUser', required: true},
    scheduleType: { type: String, enum: ['Shift', 'Break'], required: true },
    date: { type: Date, required: true },
    startHour: { type: String, enum: ['Opening', 'Noon', 'Closing'], required: true},
    hours: { type: Number, required: false },
    approved: { type: Boolean, required: true }
})

const Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;