import fs from "fs";

const content = fs.readFileSync("public/assets/HNTR.art Desktop.html", "utf8");

const SRCS = [
  "nft-bayc.jpg",
  "uploads/dc1c7de19a6db048dd00c584b5023d24.jpg",
  "nft-pudgy.jpg",
  "uploads/images (3)-52693143.jpeg",
  "nft-punk.jpg",
  "uploads/images (2)-b63bb95d.jpeg",
  "nft-bayc3d.jpg",
  "uploads/moonbirds-e1650607833145.png",
  "nft-ape-captain.jpeg",
  "uploads/download-b376d313.png",
  "nft-penguin2.png",
  "uploads/share-logo.png",
  "nft-dog.jpg",
  "uploads/images (1)-83e5b7c1.jpeg",
  "nft-ape-demon.jpeg",
  "uploads/doodle.png",
  "nft-bayc-soldier.jpg",
  "uploads/dooles1.jpeg",
  "nft-ape-crown.jpeg",
];

function getResourceUuid(key) {
  const re = new RegExp(`"id":"${key}","uuid":"([^"]+)"`);
  const m = content.match(re);
  return m?.[1];
}

function extractImage(uuid) {
  const marker = `"${uuid}":{"mime":"`;
  const start = content.indexOf(marker);
  if (start < 0) return null;

  const mimeEnd = content.indexOf('"', start + marker.length);
  const mime = content.slice(start + marker.length, mimeEnd);

  const dataMarker = ',"data":"';
  const dataStart = content.indexOf(dataMarker, mimeEnd);
  if (dataStart < 0) return null;

  const b64Start = dataStart + dataMarker.length;
  const b64End = content.indexOf('"', b64Start);
  if (b64End < 0) return null;

  const data = Buffer.from(content.slice(b64Start, b64End), "base64");
  return { mime, data };
}

fs.mkdirSync("public/assets/collection-banner", { recursive: true });

export const COLLECTION_BANNER_IMAGES = [];

for (const src of SRCS) {
  const key = "r_" + src.replace(/[^a-zA-Z0-9]/g, "_");
  const uuid = getResourceUuid(key);
  if (!uuid) {
    console.error("MISSING uuid for", src);
    continue;
  }

  const img = extractImage(uuid);
  if (!img || img.data.length < 100) {
    console.error("MISSING data for", src, uuid, img?.data.length);
    continue;
  }

  const safeName = src.replace(/[^a-zA-Z0-9._-]/g, "_");
  const publicPath = `/assets/collection-banner/${safeName}`;
  fs.writeFileSync(`public/assets/collection-banner/${safeName}`, img.data);
  COLLECTION_BANNER_IMAGES.push(publicPath);
  console.log("OK", safeName, img.data.length, "bytes");
}

fs.writeFileSync(
  "app/components/collection-banner-images.ts",
  `export const COLLECTION_BANNER_IMAGES = ${JSON.stringify(COLLECTION_BANNER_IMAGES, null, 2)} as const;\n`,
);

console.log("Extracted", COLLECTION_BANNER_IMAGES.length, "images");
