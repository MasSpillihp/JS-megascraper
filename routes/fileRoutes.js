const express = require("express");
const router = express.Router();
const multer = require("multer");

const { fileStorage, fileFilter } = require("../utils/multer");
const urlController = require("../controllers/urlController");

//set the multer file types and storage location from utils
const upload = multer({ storage: fileStorage, fileFilter: fileFilter });

// routes
router.get("/", urlController.getIndex);
router.post("/upload-file", upload.single("file"), urlController.uploadFile);

module.exports = router;
