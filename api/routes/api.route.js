const router = require('express').Router();
const {
  apiCall, auth, createToken, createEvent, getAllEvents
} = require("../controllers/application.js");

router.get('/', apiCall);
router.get("/v1/auth", auth);
router.get("/v1/create-token", createToken);
router.post("/v1/create-appointment", createEvent);
router.get("/v1/user/:userId", getAllEvents);

module.exports = router;