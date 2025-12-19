import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user and load history
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadChatHistory(user.id);
      }
    };
    loadUser();
  }, []);

  const loadChatHistory = async (uid: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: true })
      .limit(50);

    if (data) {
      setMessages(
        data.map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as "user" | "assistant",
          timestamp: new Date(msg.created_at),
        }))
      );
    }
  };

  const saveMessage = async (content: string, role: "user" | "assistant") => {
    if (!userId) return;
    await supabase.from("chat_messages").insert({
      user_id: userId,
      content,
      role,
    });
  };

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Save user message
    saveMessage(content, "user");

    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment.");
          throw new Error("Rate limit exceeded");
        }
        if (response.status === 402) {
          toast.error("Credits depleted. Please add funds to continue.");
          throw new Error("Payment required");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantMessageId = crypto.randomUUID();

      // Create initial assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          content: "",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              assistantContent += deltaContent;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            // Incomplete JSON, wait for more data
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Handle any remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              assistantContent += deltaContent;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            /* ignore */
          }
        }
      }

      // Save assistant response
      if (assistantContent) {
        saveMessage(assistantContent, "assistant");
      }
    } catch (error) {
      console.error("Chat error:", error);
      if (!assistantContent) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        );
        // Remove the empty assistant message if there was an error
        setMessages((prev) => prev.filter((m) => m.role !== "assistant" || m.content));
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, userId]);

  const clearChat = useCallback(async () => {
    if (userId) {
      await supabase.from("chat_messages").delete().eq("user_id", userId);
    }
    setMessages([]);
  }, [userId]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
};