import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User } from "lucide-react";

// Format AI response with proper styling
function formatAIResponse(text) {
  if (!text) return "";

  // Check for realistic interview dialogue patterns
  const isInterviewDialogue =
    text.includes("?") ||
    text.includes(":") ||
    text.startsWith("Okay") ||
    text.startsWith("Great") ||
    text.startsWith("So");

  if (isInterviewDialogue) {
    return (
      <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere">
        {text.split("\n").map((paragraph, idx) => (
          <p key={idx} className="mb-3 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  // Handle structured responses
  const lines = text.split("\n");
  const isList = lines.filter((l) => l.match(/^\s*(\d+\.|[-*])\s+/)).length > 1;

  if (isList) {
    return (
      <ul className="list-disc pl-6 space-y-2">
        {lines.map((line, i) => {
          if (line.match(/^\s*(\d+\.|[-*])\s+/)) {
            return <li key={i}>{line.replace(/^\s*(\d+\.|[-*])\s+/, "")}</li>;
          }
          return line.trim() ? <p key={i}>{line}</p> : null;
        })}
      </ul>
    );
  }

  // Handle code blocks
  if (text.includes("```")) {
    const parts = text.split("```");
    return (
      <div className="space-y-4">
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            return (
              <pre
                key={index}
                className="bg-gray-800 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-green-400 border border-gray-600"
              >
                <code>{part}</code>
              </pre>
            );
          }
          return part.trim() ? (
            <p key={index} className="whitespace-pre-wrap">
              {part}
            </p>
          ) : null;
        })}
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere">
      {text}
    </div>
  );
}

function ChatAi({ problem }) {
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [
        {
          text: "Hi! I'm your DSA tutor. I'm here to help you understand this problem step by step. What would you like to explore first?",
        },
      ],
    },
  ]);

  // Add problem context when problem changes
  useEffect(() => {
    if (problem) {
      setMessages([
        {
          role: "model",
          parts: [
            {
              text: `Hi! I'm your DSA tutor. I'm here to help you understand "${problem.title}" step by step. What would you like to explore first?`,
            },
          ],
        },
      ]);
    }
  }, [problem]);

  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchModelResponse = async (userMessages) => {
    setLoading(true);
    setIsStreaming(true);

    // Add empty message that will be updated with streaming content
    let messageIndex;
    setMessages((prev) => {
      messageIndex = prev.length;
      return [...prev, { role: "model", parts: [{ text: "" }] }];
    });

    try {
      console.log("Sending chat request with problem:", problem.title);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        credentials: "include",
        body: JSON.stringify({
          messages: userMessages,
          title: problem?.title || "Current Problem",
          description: problem?.description || "Problem description",
          testCases: problem?.visibleTestCases || [],
          startCode: problem?.startCode || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") {
              setLoading(false);
              setIsStreaming(false);
              return;
            }
            if (dataStr === "") continue;

            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[messageIndex] = {
                role: "model",
                parts: [{ text: dataStr }],
              };
              return newMessages;
            });
          } else if (line.startsWith("event: end")) {
            setLoading(false);
            setIsStreaming(false);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);

      // Fallback to regular API call
      try {
        console.log("Falling back to regular API call");
        const response = await axiosClient.post("/ai/chat", {
          messages: userMessages,
          title: problem?.title || "Current Problem",
          description: problem?.description || "Problem description",
          testCases: problem?.visibleTestCases || [],
          startCode: problem?.startCode || [],
        });

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[messageIndex] = {
            role: "model",
            parts: [
              {
                text:
                  response.data.message ||
                  "I received your message but couldn't generate a proper response. Could you try rephrasing?",
              },
            ],
          };
          return newMessages;
        });
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[messageIndex] = {
            role: "model",
            parts: [
              {
                text: "I'm having trouble connecting right now. Please check your internet connection and try again.",
              },
            ],
          };
          return newMessages;
        });
      }
    }
    setLoading(false);
    setIsStreaming(false);
  };

  const onSubmit = async (data) => {
    if (!data.message.trim() || loading) return;

    // Check if problem is available
    if (!problem) {
      setMessages((prev) => [
        ...prev,
        { role: "user", parts: [{ text: data.message }] },
        {
          role: "model",
          parts: [
            {
              text: "I need the problem details to help you properly. Please make sure the problem is loaded first.",
            },
          ],
        },
      ]);
      reset();
      return;
    }

    const userMessage = data.message;
    const newMessages = [
      ...messages,
      { role: "user", parts: [{ text: userMessage }] },
    ];
    setMessages(newMessages);
    reset();

    await fetchModelResponse(newMessages);
  };

  // Show loading state if problem is not loaded
  if (!problem) {
    return (
      <div className="flex flex-col h-full bg-base-100 rounded-xl border border-base-300 shadow-lg">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
            <p className="text-base-content/70">Loading problem details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-base-100 rounded-xl border border-base-300 shadow-lg">
      <div className="flex items-center gap-3 p-4 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="p-2 rounded-full bg-primary/20">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-base-content">DSA Tutor</h3>
          <p className="text-sm text-base-content/70">
            Ask me anything about "{problem.title}"
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "model" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              </div>
            )}

            <div
              className={`max-w-[80%] ${msg.role === "user" ? "order-1" : ""}`}
            >
              <div
                className={`px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-primary text-primary-content rounded-br-sm"
                    : "bg-base-200 text-base-content rounded-bl-sm"
                }`}
              >
                {formatAIResponse(msg.parts[0].text)}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="flex-shrink-0 order-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-content" />
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary animate-pulse" />
              </div>
            </div>
            <div className="max-w-[80%]">
              <div className="px-4 py-3 rounded-2xl bg-base-200 text-base-content rounded-bl-sm">
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  {isStreaming && (
                    <span className="ml-2 text-sm text-base-content/70">
                      Thinking...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-4 border-t border-base-300"
      >
        <div className="flex gap-2">
          <input
            placeholder="Ask for hints, code review, or explanations..."
            className="flex-1 input input-bordered input-sm focus:input-primary"
            {...register("message", { required: true, minLength: 1 })}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm btn-circle"
            disabled={loading}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatAi;
