"use client";

import { useState } from "react";

import {
  askStudyAssistantAction,
  resetStudyAssistantAction,
} from "@/actions/assistant";

export default function MiniChat({ skillName, concept = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSend() {
    const cleanMessage = message.trim();

    if (!cleanMessage || loading) {
      return;
    }

    setError("");

    const userMessage = {
      role: "user",
      text: cleanMessage,
    };

    setMessages((current) => [...current, userMessage]);

    setMessage("");
    setLoading(true);

    try {
      const result = await askStudyAssistantAction({
        message: cleanMessage,
        skillName,
        concept,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: result.answer,
        },
      ]);
    } catch (error) {
      console.error("Mini chat failed:", error);

      setError("לא הצלחנו לשלוח את ההודעה");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    await resetStudyAssistantAction({
      skillName,
    });

    setMessages([]);
    setMessage("");
    setError("");
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-4 w-full rounded-xl border border-orange-500/30 bg-orange-500/5 px-4 py-3 font-semibold text-orange-400 transition hover:bg-orange-500/10"
      >
        💬 רוצה להבין יותר?
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-zinc-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-orange-400">💬 AI Mentor</p>

          <p className="text-xs text-zinc-500">{concept || skillName}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-sm text-zinc-500 hover:text-white"
        >
          סגור
        </button>
      </div>

      {messages.length > 0 && (
        <div className="mt-4 space-y-3">
          {messages.map((chatMessage, index) => (
            <div
              key={index}
              className={`rounded-xl p-3 text-sm leading-relaxed ${
                chatMessage.role === "user"
                  ? "mr-8 border border-orange-500/20 bg-orange-500/10 text-orange-100"
                  : "ml-8 border border-white/10 bg-zinc-800 text-zinc-100"
              }`}
            >
              {chatMessage.text}
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {loading && <p className="mt-3 text-sm text-zinc-500">⚡ חושב...</p>}

      <div className="mt-4 flex gap-2">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          maxLength={1000}
          placeholder="שאל משהו על הנושא..."
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-orange-500"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="rounded-xl bg-orange-500 px-4 py-3 font-bold text-black disabled:opacity-40"
        >
          שלח
        </button>
      </div>

      {messages.length > 0 && (
        <button
          type="button"
          onClick={handleReset}
          className="mt-3 text-xs text-zinc-500 hover:text-orange-400"
        >
          התחל שיחה חדשה
        </button>
      )}
    </div>
  );
}
