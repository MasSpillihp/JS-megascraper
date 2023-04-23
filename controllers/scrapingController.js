const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const Url = require("../models/url");

// function to update database with scraped data
const updateDatabase = async (url, data) => {
  const urlId = await Url.findOne({
    where: { url: url },
    attributes: ["id"],
  });

  console.log(`url: ${url}`); // debug - correct shows the url https://mega.nz/folder/wRxUTaAQ#WHqnFMOh2Hep88J4NnI60A
  console.log(`urlID.id: ${urlId.id}`); // debug

  if (urlId) {
    try {
      await Url.update(
        { result_reason: JSON.stringify(data) },
        {
          where: { id: urlId.id },
        }
      );
      console.log("Database updated successfull"); // debug
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

  const result = {
    title: msgTitle,
    reaons: msgReasons,
  };
  console.log(result); // debug - working so far
  return result;
};

// function to save the scraped page as a pdf. Saves to case folder
const savePdf = async (page, url) => {
  const fileName = `${url.replace(/\//g, "-")}.pdf`; // replaces '/' to '-' for file storage purposes
  const filePath = path.join(__dirname, "..", "cases", fileName);
  const pdf = await page.pdf();
  fs.writeFileSync(filePath, pdf);

  console.log(`PDF saved to ${filePath}`);
};

// main function to scrape url and call helper functions
exports.scrapeUrl = async (req, res, next) => {
  try {
    const url = decodeURIComponent(req.query.url); // ensures that the URl contains all text after # character in mega links

    // puppeteer lanch browser and goto URL. Waits for network inactivity PLUS 3 second pause
    // before obtaining inner HTML of 'info-container' class. This is the popup box that contains info about the link
    // if it is not live.
    const browser = await puppeteer.launch({ headless: false }); // debugging - set to true when finished
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForTimeout(3000);

    const data = await scrapePage(page); // working. obtains data and returns
    await updateDatabase(url, data);
    await savePdf(page, url);

    browser.close();
    console.log("made it this far"); // debug

    return res.send("Page scraped successfully");
  } catch (error) {
    console.log(error);
  }
};
