"use client";

import { useLayoutEffect } from "react";
import { useRouter } from "nextjs-toploader/app";

export default function LearnPage() {
  const router = useRouter();

  useLayoutEffect(() => {
    document.body.dataset.page = "learn";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  return (
    <>
      <button className="learn-back" type="button" onClick={goBack}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 3.5 5.5 8l4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to platform
      </button>
      <iframe className="learn-frame" title="HNTR Learn" src="/learn/index.html" />
    </>
  );
}
