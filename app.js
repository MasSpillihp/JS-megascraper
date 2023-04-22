const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const sequelize = require("./utils/database");

require("dotenv").config();

const app = express();

//import routes
const fileRoutes = require("./routes/fileRoutes");
const resultRoutes = require("./routes/resultsRoutes");

//set templating engine to ejs
app.set("view engine", "ejs");

//sets the ./public folder for styling
app.use(express.static(path.join(__dirname, "public")));

//sets the body and file parsers
app.use(bodyParser.urlencoded({ extended: false }));

app.use(fileRoutes);
app.use(resultRoutes);

sequelize
  .sync()
  .then(() => {
    console.log("Database connected");
    app.listen(3000);
  })
  .catch((error) => {
    console.log(error);
  });
