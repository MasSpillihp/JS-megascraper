const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "cases");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.case + ".csv");
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Please upload a .CSV file"), false); //try and render error page rather than throw error
  }
};

module.exports = { fileFilter, fileStorage };
