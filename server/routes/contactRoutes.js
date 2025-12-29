const express = require("express");
const router = express.Router();
const { submitContact } = require("../controllers/contactController");

// When someone sends a POST request to '/', run the submitContact function
router.post("/", submitContact);

module.exports = router;
