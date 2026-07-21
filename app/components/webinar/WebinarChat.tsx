"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import {
  INITIAL_WEBINAR_MESSAGES,
  WEBINAR_CHAT_REPLIES,
  WEBINAR_CHAT_USERS,
  type WebinarMessage,
} from "../../../lib/webinar-data";
import WebinarWalletPanel from "./WebinarWalletPanel";

const REACTIONS = ["🔥", "🚀", "👏", "💡", "📈"];

function formatMessageTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function randomReply() {
  return WEBINAR_CHAT_REPLIES[Math.floor(Math.random() * WEBINAR_CHAT_REPLIES.length)];
}

function randomUser() {
  return WEBINAR_CHAT_USERS[Math.floor(Math.random() * WEBINAR_CHAT_USERS.length)];
}

export default function WebinarChat() {
  const { isConnected, address } = useAccount();
  const [messages, setMessages] = useState<WebinarMessage[]>(INITIAL_WEBINAR_MESSAGES);
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const msgsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const box = msgsRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (Math.random() < 0.5) {
        setMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-${Math.random()}`,
            user: randomUser(),
            text: randomReply(),
            time: formatMessageTime(),
          },
        ]);
      }
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  const appendMessage = (user: string, text: string, me = false) => {
    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random()}`,
        user,
        text,
        time: formatMessageTime(),
        me,
      },
    ]);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const username = isConnected && address ? "masteraccount" : "guest";
    appendMessage(username, text, true);
    setInput("");
    window.setTimeout(() => {
      appendMessage(randomUser(), randomReply(), false);
    }, 900 + Math.random() * 900);
  };

  const react = (emoji: string) => {
    const chat = chatRef.current;
    if (!chat) return;
    const floater = document.createElement("div");
    floater.textContent = emoji;
    floater.style.cssText =
      "position:absolute;right:24px;bottom:96px;font-size:22px;pointer-events:none;z-index:50;transition:transform 1.1s ease,opacity 1.1s ease;";
    chat.appendChild(floater);
    requestAnimationFrame(() => {
      floater.style.transform = "translateY(-120px) scale(1.5)";
      floater.style.opacity = "0";
    });
    window.setTimeout(() => floater.remove(), 1150);
  };

  return (
    <div className="web-chat" ref={chatRef}>
      <WebinarWalletPanel />
      <div className="web-listen-card">
        <div className="web-chat-hdr">
          <div className="web-chat-hl">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M3 9V8a5 5 0 0 1 10 0v1" stroke="currentColor" strokeWidth="1.3" />
              <rect x="1.5" y="9" width="3" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
              <rect x="11.5" y="9" width="3" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            LIVE LISTENING
          </div>
          <span className="web-chat-live" />
        </div>
        <div className="web-msgs" id="webMsgs" ref={msgsRef}>
          {messages.map((message) => (
            <div key={message.id} className={`web-msg${message.me ? " me" : ""}`}>
              <div className="web-msg-head">
                <span className="web-msg-user">{message.user}</span>
                <span className="web-msg-time">{message.time}</span>
              </div>
              <div className="web-bubble">{message.text}</div>
            </div>
          ))}
        </div>
        <div className="web-chat-foot">
          <div className="web-react">
            {REACTIONS.map((emoji) => (
              <button key={emoji} type="button" onClick={() => react(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
          <div className="web-input-row">
            <input
              id="webInput"
              value={input}
              placeholder="Type a message…"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage();
              }}
            />
            <button type="button" className="web-send" onClick={sendMessage} aria-label="Send message">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 8l12-5-5 12-2.5-4.5L2 8z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
