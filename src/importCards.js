const vCard = require("vcf");
const fs = require("fs");
const assert = require("assert");
const path = require("path");

const cleanupAddrArray = (formattedAdr) => {
  // return formattedAdr;
  return formattedAdr.flatMap(line => {
    line = line.replace('\\,', ',');
    return line.split('\\n');
  })
}

// Note: very limited address parsing here, this will need to be expanded for more cases
const parseAddressProp = (adrProp) => {
  const fields = adrProp.toJSON();
  const addressArray = fields[3];
  let [poBox, extAddress, street, city, state, zip, country] = addressArray;
  if (!country) {
    country = "USA";
  }

  assert(!poBox, "not sure how to format po box");
  assert(!extAddress, "not sure how to format ext address");
  let formattedAdr;
  if (country === "Norway" || country === "Denmark") {
    formattedAdr = [street, `${zip} ${city}`, country];
  } else if (
    country === "USA" ||
    country === "United States" ||
    country === "United States of America"
  ) {
    formattedAdr = [street, `${city}, ${state} ${zip}`];
  } else if (country === 'Türkiye') {
    formattedAdr = [street, `${zip} ${state}`, `${city} ${country}`];
  } else {
    throw new Error(`Not sure how to format addresses to country ${country}`);
  }
  return cleanupAddrArray(formattedAdr);
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

      const fullAddress = [name, '---', `${name.split(' ')[1]} Family`, ...parseAddressProp(adrItem)]; //`${name}\n${parseAddressProp(adrItem)}`;
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
