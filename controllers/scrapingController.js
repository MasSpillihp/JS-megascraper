const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const Url = require("../models/url");

const getLinkStatus = async (results) => {
  let linkStatus;
  if (results["status"] === "live") {
    linkStatus = "live";
  } else {
    linkStatus = "unavailable";
  }

  return linkStatus;
};

// function to update database with scraped data
const updateDatabase = async (url, scrapedData, caseref) => {
  // find the id of the record which matches the url and caseref
  const urlId = await Url.findOne({
    where: {
      url: url,
      caseref: caseref,
    },
    attributes: ["id"],
  });

  console.log(`url: ${url}`); // debug
  console.log(`urlID.id: ${urlId.id}`); // debug

  if (urlId) {
    try {
      await Url.update(
        {
          result_reason: JSON.stringify(scrapedData.result),
          result: JSON.stringify(scrapedData.isLinkLive),
        },
        {
          where: { id: urlId.id },
        }
      );
      console.log("Database updated successfully"); // debug
    } catch (error) {
      console.log(error);
    }
  }
};

// function to scrape the page, returns object with results
const scrapePage = async (page) => {
  const msgTitle = await page.$eval("#msgDialog-title", (e1) => e1.textContent);
  const msgReasons = await page.$$eval("#msgDialog-title ul li", (els) =>
    els.map((el) => el.textContent.trim())
  );

  console.log(`msgTitle: ${msgTitle}`); //debug
  console.log(`msgReasons: ${msgReasons}`); //debug

  let result;
  if (!msgTitle) {
    result = {
      status: "live",
      reason: "n/a",
    };
  } else {
    result = {
      status: msgTitle,
      reasons: msgReasons,
    };
  }
  console.log(result); // debug

  const isLinkLive = await getLinkStatus(result);

  console.log("this is inside scrape page " + isLinkLive);

  return {
    isLinkLive,
    result,
  };
};

// function to save the scraped page as a pdf. Saves to case folder
const savePdf = async (page, url, caseref) => {
  const fileName = `${url.replace(/\//g, "-")}.pdf`; // replaces '/' to '-' for file storage purposes
  const folderPath = path.join(__dirname, "..", "cases", caseref);

  // check if case folder path does not already exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const filePath = path.join(folderPath, fileName);
  const pdf = await page.pdf();
  fs.writeFileSync(filePath, pdf);

  console.log(`PDF saved to ${filePath}`);
};

// main function to scrape url and call helper functions
exports.scrapeUrl = async (req, res, next) => {
  try {
    const url = decodeURIComponent(req.query.url); // ensures that the URl contains all text after # character in mega links
    const caseRef = req.query.caseref;

    // puppeteer lanch browser and goto URL. Waits for network inactivity PLUS 3 second pause
    // before obtaining inner HTML of 'info-container' class. This is the popup box that contains info about the link
    // if it is not live.
    const browser = await puppeteer.launch({ headless: false }); // debugging - set to true when finished
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForTimeout(4000);

    const scrapedData = await scrapePage(page);
    await updateDatabase(url, scrapedData, caseRef);
    await savePdf(page, url, caseRef);

    browser.close();

    return res.send("Page scraped successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
