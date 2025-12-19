import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import WelcomeMessage from "./WelcomeMessage";
import Header from "./Header";
import { ScrollArea } from "@/components/ui/scroll-area";

const ChatContainer = () => {
  const { messages, isLoading, sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full">
      <Header />

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 lg:p-6" ref={scrollRef}>
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                role={message.role}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <TypingIndicator />
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 lg:p-6">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;