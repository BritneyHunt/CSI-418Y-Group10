const mongoose = require('mongoose');

const employeeUserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    manager: { type: Boolean, required: true }
});



const EmployeeUser = mongoose.model('EmployeeUser', employeeUserSchema);
module.exports = EmployeeUser;

