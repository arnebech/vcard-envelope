const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const templateDir = path.resolve(__dirname, "..", "templates");
const generateHtmlPath = path.join(templateDir, "output.generated.html");

const createHtml = (addresses, templateName) => {
  const template = fs.readFileSync(
    path.join(templateDir, templateName),
    "utf-8"
  );
  const re = /<!--START-->([\s\S]*)<!--END-->/;
  const block = template.match(re);
  const cardHtml = block[1];
  const cards = addresses.map((addr) => {
    addr = addr.slice(2);
    addr = addr.join("\n");
    addr = addr.replace(/\n/g, "<br>");
    return cardHtml.replace("{{address}}", addr);
  });
  const outputHtml = template.replace(re, cards.join("\n"));
  fs.writeFileSync(generateHtmlPath, outputHtml);
};

/** Given addresses, create html template, render it as PDFs that are saved to disk */
const createPrints = async (addresses, outputfile, templateName) => {
  createHtml(addresses, templateName);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`file:${generateHtmlPath}`);
  await page.pdf({ path: outputfile, preferCSSPageSize: true });

  await browser.close();
};

module.exports = { createPrints };
