const express = require("express");
const router = express.Router();

const resultsController = require("../controllers/resultsController");
const scrapeController = require("../controllers/scrapingController");

// routes
router.get("/results", resultsController.getResults);

router.get("/scrape", scrapeController.scrapeUrl);

module.exports = router;
