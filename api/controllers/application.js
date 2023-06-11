const { google } = require("googleapis");
const axios = require("axios");
const User = require("../models/User.js");
const Appointment = require("../models/Appointment.js");
const { v4 } = require("uuid");
const mongoose = require("mongoose");
const { addMinutes } = require("../helpers/time.js");

const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const calendarId = process.env.CALENDAR_ID;

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

const calendar = google.calendar({
    version: "v3",
    auth: process.env.API_KEY
});

const SCOPES = [
    'profile',
    'email',
    'https://www.googleapis.com/auth/calendar',
];

const auth = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    SCOPES
);

exports.apiCall = async (req, res) => {
    res.send({ message: 'Ok api is working 🚀' });
};

exports.auth = async (req, res) => {
    try {
        const scopes = [
            'profile',
            'email',
            'https://www.googleapis.com/auth/calendar',
        ];

        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: scopes
        });

        res.status(200).redirect(url);
    }
    catch (error) {
        console.log(error);
    }
};

exports.createToken = async (req, res) => {
    try {
        const code = req.query.code;
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials({
            refresh_token: tokens.refresh_token
        });

        const googleUser = await axios
            .get(
                `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
                {
                    headers: {
                        Authorization: `Bearer ${tokens.id_token}`,
                    },
                },
            )
            .then(res => {
                return { data: res.data, refresh_token: tokens.refresh_token };
            })
            .catch(error => {
                throw new Error(error.message);
            });
        const { id, email, name } = googleUser.data;
        let user = await User.findOneAndUpdate({ email }, {
            googleId: id,
            refresh_token: googleUser.refresh_token,
            name,
            email,
        },
            { upsert: true, new: true }
        );

        const userJson = JSON.stringify(user);
        const encodedUser = encodeURIComponent(userJson);
        res.redirect(`${process.env.FRONTEND_URL}?user=${encodedUser}`);
    }
    catch (error) {
        console.log(error);
    }
};

exports.createEvent = async (req, res) => {
    try {
        const {
            userId,
            name,
            email,
            phone,
            timezone,
            startTime
        } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.send("User not found");

        const endTime = addMinutes(startTime);

        const buyerResponse = await calendar.events.insert({
            auth: oauth2Client,
            calendarId: "primary",
            conferenceDataVersion: 1,
            requestBody: {
                summary: `Appointment with Dr. Shubham`,
                description: `Appointment booked by ${name} @${email}`,
                start: {
                    dateTime: startTime,
                    timeZone: timezone,
                },
                end: {
                    dateTime: endTime,
                    timeZone: timezone,
                },
                conferenceData: {
                    createRequest: {
                        conferenceSolutionKey: {
                            type: 'hangoutsMeet',
                        },
                        requestId: v4(),
                    },
                },
                attendees: [
                    { email: email }
                ],
                guestsCanSeeOtherGuests: false,
                guestsCanModify: false,
            },
        });
        const meetId = buyerResponse.data.conferenceData.conferenceId;
        const meetLink = `https://meet.google.com/${meetId}`;

        const sellerResponse = await calendar.events.insert({
            auth: auth,
            calendarId: calendarId,
            requestBody: {
                summary: `Appointment with ${name}`,
                description: `Google Meet Link ${meetLink}`,
                start: {
                    dateTime: startTime,
                    timeZone: timezone,
                },
                end: {
                    dateTime: endTime,
                    timeZone: timezone,
                },
            },
        });

        // Adding data to MongoDB
        const appointmentData = {
            _id: new mongoose.Types.ObjectId(),
            phone: phone,
            meetLink: meetLink,
            ...sellerResponse.data
        };
        const filter = {
            "start": startTime,
            "end": endTime,
            organizer: user.name,
        };
        await Appointment.findOneAndUpdate(filter, appointmentData, {
            upsert: true,
            new: true,
        });
        await User.findByIdAndUpdate(userId, {
            $addToSet: { appointments: appointmentData._id },
        });

        res.status(200).send({ buyerResponse });
    }
    catch (error) {
        console.log(error);
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        const userId = req.params.userId;
        let user = await User.findById(userId);
        if (!user) return res.send("User not found");
        let appointmentsData = [];

        const populateUser = await User.findById(userId).populate("appointments");
        appointmentsData = populateUser.appointments.map((meeting) => ({
            timezone: meeting.timeZone,
            start: meeting.start,
            end: meeting.end,
        }));

        res.status(200).send({ appointmentsData });
    }
    catch (error) {
        console.log(error);
    }
};

// organizer: {
//     displayName: "Shubham Lal",
//     email: "shubhamlal.new@gmail.com";
//     id: string,
//     self: boolean,
// },