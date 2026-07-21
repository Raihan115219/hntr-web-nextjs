"use client";

import WebinarActionBar from "./WebinarActionBar";
import WebinarChat from "./WebinarChat";
import WebinarHeader from "./WebinarHeader";
import WebinarMeta from "./WebinarMeta";
import WebinarNewsletter from "./WebinarNewsletter";
import WebinarPlayer from "./WebinarPlayer";

export default function WebinarContent() {
  return (
    <>
      <div className="feed" id="feed-webinar">
        <div className="web-scroll">
          <div className="web-main" id="webinar-main">
            <WebinarHeader />
            <WebinarPlayer />
            <WebinarActionBar />
            <WebinarMeta />
            <WebinarNewsletter />
          </div>
        </div>
      </div>
      <WebinarChat />
    </>
  );
}
