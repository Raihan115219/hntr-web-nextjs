import type { Metadata } from "next";
import "./globals.css";
import ThemeTopLoader from "./components/ThemeTopLoader";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "HNTR Next",
  description: "Next.js TypeScript Tailwind migration for HNTR legacy HTML"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: "100%", overflow: "hidden" }}>
      <body 
        style={{ 
          height: "100%", 
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          margin: 0,
          padding: 0
        }}
      >
        <ThemeTopLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
