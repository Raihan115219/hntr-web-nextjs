"use client";

import { useEffect, useRef, useState } from "react";
import { WEBINAR_LANGUAGES, type WebinarLanguage } from "../../../lib/webinar-data";

function CheckIcon() {
  return (
    <svg className="wv-lang-check" width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8.4l3.3 3.3L13 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface WebinarLanguageSelectorProps {
  selectedCode?: string;
  onSelect?: (language: WebinarLanguage) => void;
}

export default function WebinarLanguageSelector({
  selectedCode = "en",
  onSelect,
}: WebinarLanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState(selectedCode);
  const rootRef = useRef<HTMLDivElement>(null);

  const current =
    WEBINAR_LANGUAGES.find((lang) => lang.code === currentCode) ?? WEBINAR_LANGUAGES[0];

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const pickLanguage = (code: string) => {
    const picked = WEBINAR_LANGUAGES.find((lang) => lang.code === code);
    if (!picked) return;
    setCurrentCode(code);
    setOpen(false);
    onSelect?.(picked);
  };

  return (
    <div className={`wv-lang${open ? " open" : ""}`} id="wvLang" ref={rootRef}>
      <span className="wv-lang-label">Select your language</span>
      <button
        type="button"
        className="wv-lang-btn"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        <span className="wv-lang-flag" id="wvLangFlag">
          {current.flag}
        </span>
        <span className="wv-lang-lbl">
          Presentation in <b id="wvLangName">{current.name}</b>
        </span>
        <svg className="wv-lang-chev" width="11" height="11" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="wv-lang-menu" id="wvLangMenu">
        {WEBINAR_LANGUAGES.map((language) => (
          <div
            key={language.code}
            className={`wv-lang-opt${language.code === currentCode ? " sel" : ""}`}
            onClick={() => pickLanguage(language.code)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                pickLanguage(language.code);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="wv-lang-flag">{language.flag}</span>
            <span className="wv-lang-oname">{language.name}</span>
            <span className="wv-lang-native">{language.native}</span>
            {language.code === currentCode ? <CheckIcon /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
