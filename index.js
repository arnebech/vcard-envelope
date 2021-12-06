const fs = require("fs");
const docopt = require("docopt");
const { importCardsFromDir } = require("./src/importCards");
const { createPrints } = require("./src/createPrints");

const doc = `
Usage:
  christmas import-cards <dir> <json-output>
  christmas create-prints <json-input> <pdf-output> [--template <template-name>]

  Create envelopes from vcards. Steps:
  1. Import vcards and export JSON file
  2. Make any address edit to JSON file for proper naming (e.g. The XZY family instead of one name)
  3. Import JSON and template and export PDFs of the envelopes that can be printed

  Options:
    --template <template-name>
      Which template to use [default: template.sample.html]
`;

const values = docopt.docopt(doc, { version: "0.1" });

if (values["import-cards"]) {
  const dir = values["<dir>"];
  console.log(`Reading cards from ${dir}.`);
  const addresses = importCardsFromDir(dir);
  const output = values["<json-output>"];
  console.log(
    `Writing JSON to ${output}. Please verify/edit before moving to next step.`
  );
  fs.writeFileSync(output, JSON.stringify(addresses, null, "  "));
} else if (values["create-prints"]) {
  const inputFile = values["<json-input>"];
  const outputFile = values["<pdf-output>"];
  const templateName = values["--template"];
  console.log(`Reading addresses from ${inputFile}.`);
  console.log(`Using template: templates/${templateName}`);
  const addresses = JSON.parse(fs.readFileSync(inputFile));
  createPrints(addresses, outputFile, templateName)
    .then(() => {
      console.log(`Wrote PDF cards to ${outputFile}`);
    })
    .catch((err) => {
      console.log("ERROR!");
      console.log(err);
      process.exitCode = 1;
    });
}
