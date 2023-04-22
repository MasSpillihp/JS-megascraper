const express = require("express");
const router = express.Router();

const resultsController = require("../controllers/resultsController");

router.get("/results", resultsController.getResults);

module.exports = router;
