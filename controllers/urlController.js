const multer = require("multer");
const upload = multer({ dest: "cases/" });
const csv = require("csv-parser");
const fs = require("fs");
const Url = require("../models/url");

// loads index page for user to upload csv file
exports.getIndex = (req, res) => {
  res.render("index");
};

// deals with the uploaded csv file
exports.uploadFile = (req, res) => {
  const results = [];
  const caseref = req.body.case;

  fs.createReadStream(req.file.path, { encoding: "utf-8" })
    .pipe(csv({ headers: ["url"] }))
    .on("data", (data) => {
      results.push(data.url);
    })
    .on("end", () => {
      // Create a new Url record for each url in the CSV
      const urlRecords = results.map((url) => ({ caseref, url }));
      Url.bulkCreate(urlRecords)
        .then(() => {
          res.redirect("/results");
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Error adding urls to the database");
        });
    });
};
