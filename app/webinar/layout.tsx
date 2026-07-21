import { pageMetadata } from "../../lib/metadata";
import "./webinar.css";

export const metadata = pageMetadata(
  "Live Webinar",
  "Join the HNTR live webinar — strategy sessions, platform updates, and live community chat."
);

export default function WebinarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
