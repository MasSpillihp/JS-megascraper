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
  result: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  result_reason: {
    type: Sequelize.STRING(1000),
    allowNull: true,
  },
});

module.exports = Url;
