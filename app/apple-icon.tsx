import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

async function loadLogoSrc() {
  const logoPath = join(process.cwd(), "public/assets/images/logoMark.png");
  const logoData = await readFile(logoPath);
  return `data:image/png;base64,${logoData.toString("base64")}`;
}

export default async function AppleIcon() {
  const logoSrc = await loadLogoSrc();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          borderRadius: 40,
          background: "#0c0c0e",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={96} height={96} alt="" />
      </div>
    ),
    { ...size }
  );
}
