import type { Metadata } from "next";
import "./learn.css";

export const metadata: Metadata = {
  title: "HNTR.art — Learn",
};

export default function LearnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
