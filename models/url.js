const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Url = sequelize.define("url", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  caseref: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  url: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Url;
