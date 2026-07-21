import fs from "fs";

const content = fs.readFileSync("public/assets/HNTR.art Desktop.html", "utf8");
const pi = content.indexOf("panel-pools");
const start = content.indexOf('<div class=\\"pools-hero\\">', pi);
const end = content.indexOf("<!-- PAGE ACTIONS -->", start);
let html = content.slice(start, end);
html = html
  .replace(/<\\u002F/gi, "</")
  .replace(/<\u002F/g, "</")
  .replace(/\\n/g, "\n")
  .replace(/\\"/g, '"');
html = html.replace(/<script[\s\S]*?<\/script>\s*/i, "");
html = html.replace(/^<div class="pools-hero">\s*/i, "").replace(/\s*<\/div>\s*$/i, "");

fs.writeFileSync("public/assets/pools-banner-inner.html", html);

const escaped = html
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");
fs.writeFileSync(
  "app/components/pools-banner-markup.ts",
  `export const POOLS_BANNER_INNER = \`${escaped}\`;\n`,
);

console.log("written", html.length, "chars to public/assets/pools-banner-inner.html");
