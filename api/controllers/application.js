const { google } = require("googleapis");
const axios = require("axios");
const User = require("../models/User.js");
const Appointment = require("../models/Appointment.js");
const { v4 } = require("uuid");
const mongoose = require("mongoose");
const { addMinutes } = require("../helpers/time.js");

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
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
            timezone,
            startTime
        } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.send("User not found");

        const endTime = addMinutes(startTime);
        console.log(endTime);

        const calendar = google.calendar({
            version: "v3",
            auth: process.env.API_KEY
        });

        const response = await calendar.events.insert({
            auth: oauth2Client,
            calendarId: "primary",
            conferenceDataVersion: 1,
            requestBody: {
                summary: `Appointment with Udemy`,
                description: `Appointment booked by ${name}`,
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
                        requestId: v4(),
                    },
                },
                attendees: [
                    { email: "udemy.awesome@gmail.com" },
                ],
            },
        });

        // organizer: {
        //     displayName: "Shubham Lal",
        //     email: "shubhamlal.new@gmail.com";
        //     id: string,
        //     self: boolean,
        // },

        const appointmentData = {
            _id: new mongoose.Types.ObjectId(),
            creatorId: userId,
            name: name,
            attendee: email,
            timeZone: timezone,
            start: startTime,
            end: endTime,
        };

        const filter = {
            "start": startTime,
            "end": endTime,
        };
        await Appointment.findOneAndUpdate(filter, appointmentData, {
            upsert: true,
            new: true,
        });
        await User.findByIdAndUpdate(userId, {
            $addToSet: { appointments: appointmentData._id },
        });

        res.status(200).send({ response });
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