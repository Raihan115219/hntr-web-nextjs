import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

async function loadLogoSrc() {
  const logoPath = join(process.cwd(), "public/assets/images/logoMark.png");
  const logoData = await readFile(logoPath);
  return `data:image/png;base64,${logoData.toString("base64")}`;
}

export default async function Icon() {
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
          borderRadius: 8,
          background: "#0c0c0e",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={17} height={17} alt="" />
      </div>
    ),
    { ...size }
  );
}
