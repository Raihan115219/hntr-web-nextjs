"use client";

import NextTopLoader from "nextjs-toploader";
import { useEffect, useState } from "react";

const THEME_COLORS = {
  light: {
    color: "#F2EFEA",
    shadow: "0 0 10px rgba(242,239,234,0.45),0 0 5px rgba(242,239,234,0.35)",
  },
  dark: {
    color: "#A8B5A2",
    shadow: "0 0 10px rgba(168,181,162,0.45),0 0 5px rgba(168,181,162,0.35)",
  },
} as const;

function readIsDark() {
  if (typeof document === "undefined") return true;
  if (document.body.classList.contains("dark")) return true;
  try {
    const saved = localStorage.getItem("hntrTheme");
    if (saved === "light") return false;
    if (saved === "dark") return true;
  } catch {
    // ignore storage errors
  }
  return true;
}

export default function ThemeTopLoader() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(readIsDark());

    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains("dark"));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const theme = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  return (
    <NextTopLoader
      key={isDark ? "dark" : "light"}
      color={theme.color}
      shadow={theme.shadow}
      height={2}
      showSpinner={false}
      crawl
      crawlSpeed={200}
      speed={200}
      easing="ease"
      zIndex={99999}
    />
  );
}
