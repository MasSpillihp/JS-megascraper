const Url = require("../models/url");

// loads the results page which will default to show all urls for the last searched case ref
exports.getResults = async (req, res, next) => {
  try {
    // find the highest id
    const lastId = await Url.findOne({
      order: [["id", "DESC"]],
      attributes: ["caseref"],
    });

    // find the associated case ref
    const lastCase = lastId.caseref;

    // find all urls from this case ref
    const urls = await Url.findAll({
      where: { caseref: lastCase },
      attributes: ["url"],
    });

    res.render("results", {
      urls: urls,
      caseref: lastCase,
    });
  } catch (error) {
    console.log(error);
  }
};
