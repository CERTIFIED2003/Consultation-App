const router = require('express').Router();
const {
  apiCall, auth, createToken, createEvent, getAllEvents
} = require("../controllers/application.js");

router.get('/', apiCall);
router.get("/auth", auth);
router.get("/create-token", createToken);
router.post("/create-appointment", createEvent);
router.get("/user/:userId", getAllEvents);

module.exports = router;