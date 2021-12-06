const vCard = require("vcf");
const fs = require("fs");
const assert = require("assert");
const path = require("path");

// Note: very limited address parsing here, this will need to be expanded for more cases
const parseAddressProp = (adrProp) => {
  const fields = adrProp.toJSON();
  const addressArray = fields[3];
  const [poBox, extAddress, street, city, state, zip, country] = addressArray;
  assert(!poBox, "not sure how to format po box");
  assert(!extAddress, "not sure how to format ext address");
  assert(
    country === "Norway" || country === "Denmark",
    "Currently only formats Norwegian and Danish addresses"
  );
  const formattedAdr = [street, `${zip} ${city}`, country];
  return formattedAdr;
};

const importCardsFromFile = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf-8");
  const cards = vCard.parse(raw);

  const addresses = [];

  cards.forEach((card) => {
    const adrProp = card.get("adr");
    const adrArray = Array.isArray(adrProp) ? adrProp : [adrProp];
    const name = card.get("fn").valueOf();

    adrArray.forEach((adrItem) => {
      const fullAddress = [name, ...parseAddressProp(adrItem)]; //`${name}\n${parseAddressProp(adrItem)}`;
      addresses.push(fullAddress);
    });
  });
  return addresses;
};

/**
 * Given a file or dir, will read the vcards from it, and return the addresses in the cards.
 */
const importCardsFromDir = (dirOrFilePath) => {
  const data = fs.statSync(dirOrFilePath);
  if (data.isDirectory()) {
    const files = fs
      .readdirSync(dirOrFilePath)
      .filter((name) => name.endsWith(".vcf"))
      .map((name) => path.join(dirOrFilePath, name));
    const addresses = files.flatMap((file) => importCardsFromFile(file));
    return addresses;
  } else {
    return importCardsFromFile(dirOrFilePath);
  }
};

module.exports = {
  importCardsFromDir,
};
