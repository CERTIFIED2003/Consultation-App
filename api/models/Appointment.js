const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
    {
        id: String,
        phone: Number,
        meetLink: String,
        kind: String,
        etag: String,
        status: String,
        htmlLink: String,
        description: String,
        summary: String,
        start: {
            dateTime: String,
            timeZone: String
        },
        end: {
            dateTime: String,
            timeZone: String
        },
        creator: {
            email: String,
            self: Boolean
        },
        organizer: {
            email: String,
            self: Boolean
        },
        attendees: [{
            email: String,
            displayName: String,
            responseStatus: String
        }],
        iCalUID: String,
        sequence: Number,
        created: String,
        updated: String,
        eventType: String,
        reminders: {
            useDefault: Boolean
        },

    }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;