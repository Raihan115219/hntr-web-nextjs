"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    openSignup?: () => void;
    startSignupFx?: (canvas: HTMLCanvasElement | null) => void;
  }
}

type FxCanvas = HTMLCanvasElement & { __fx?: boolean };

export default function SignupCard() {
  const fxRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = fxRef.current as FxCanvas | null;
    if (!canvas) return;

    const scriptId = "signup-fx-script";
    document.getElementById(scriptId)?.remove();
    delete canvas.__fx;

    const runFx = () => {
      window.startSignupFx?.(canvas);
    };

    if (window.startSignupFx) {
      runFx();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `/assets/js/signup-fx.js?${Date.now()}`;
    script.async = true;
    script.onload = runFx;
    document.body.appendChild(script);

    return () => {
      script.remove();
      if (canvas) delete canvas.__fx;
    };
  }, []);

  return (
    <div
      className="signup-card"
      style={{ cursor: "pointer" }}
      onClick={() => window.openSignup?.()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.openSignup?.();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <img src="/assets/images/signupVr.png" alt="HNTR.art" />
      <canvas ref={fxRef} className="signup-fx" />
      <button
        className="signup-card-btn"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          window.openSignup?.();
        }}
      >
        SIGN UP HERE
      </button>
    </div>
  );
}
