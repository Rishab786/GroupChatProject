const express = require("express");
const homePageController = require("../controllers/homePage");
const router = express.Router();

router.get("", homePageController.getHomePage);

module.exports = router;
