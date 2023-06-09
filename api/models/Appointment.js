const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
    {
        id: String,
        creatorId: String,
        name: String,
        attendee: String,
        timeZone: String,
        start: String,
        end: String,
    },
    {
        timestamps: true,
    }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;