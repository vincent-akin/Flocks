/**
 * Prints (and writes to disk) exactly the same demo-church credentials
 * that `npm run seed:demo-churches` would write into MongoDB - without
 * touching a database at all. Useful for previewing or re-printing the
 * credentials file if it's ever lost, since the dataset is fully
 * deterministic (see scripts/lib/demo-church-dataset.js).
 *
 * Usage:
 *   node scripts/generate-demo-credentials.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { buildDataset, renderCredentialsMarkdown } = require('./lib/demo-church-dataset');

const dataset = buildDataset();
const markdown = renderCredentialsMarkdown(dataset);

const outputDir = path.join(__dirname, 'output');
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, 'DEMO_CHURCH_CREDENTIALS.md');
fs.writeFileSync(outputPath, markdown);

const totalLogins = dataset.reduce(
  (sum, c) => sum + 1 + c.parishes.reduce((s, p) => s + 1 + p.members.length, 0),
  0
);

console.log(`Generated credentials for ${dataset.length} churches, ${totalLogins} total login accounts.`);
console.log(`Written to: ${outputPath}`);
console.log('(No database was touched - this only computes and writes the Markdown file.)');
