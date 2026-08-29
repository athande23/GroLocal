"use client";

import type { FormEvent, ChangeEvent } from "react";
import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatResponse = {
  reply?: string;
  error?: string;
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the GroLocal assistant! Ask me anything about gardening, plants, or recipes.",
    },
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    setInput("");
    setLoading(true);

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

        const responseText = await response.text();

        let data: ChatResponse;

        try {
        data = JSON.parse(responseText);
        } catch {
        throw new Error(
            `Server returned an invalid response (${response.status}).`
        );
        }

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content:
            data.reply || "I couldn't generate a response.",
        },
      ]);
    } catch (error: unknown) {
      console.error("Chatbot error:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't answer that right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    setInput(event.target.value);
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 z-[2000] flex h-[500px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-2xl">
          <div className="flex items-center justify-between bg-green px-4 py-3 text-white">
            <div>
              <h2 className="font-semibold">
                GroLocal Assistant 🌱
              </h2>

              <p className="text-xs opacity-80">
                Ask about plants, gardening or recipes
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xl leading-none opacity-80 hover:opacity-100"
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-green text-white"
                      : "bg-fill text-ink"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-fill px-3 py-2 text-sm text-graphite">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-line p-3"
          >
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask something..."
              disabled={loading}
              className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-green"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-green px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-[2000] flex items-center gap-2 rounded-full bg-green px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          🌱 Ask GroLocal
        </button>
      )}
    </>
  );
}