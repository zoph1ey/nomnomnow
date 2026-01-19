"use client";

import { useState, useRef, useEffect } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BotMessageSquareIcon, type BotMessageSquareHandle } from "@/components/ui/bot-message-square";
import { RefreshCWIcon, type RefreshCCWIconWIcon } from "@/components/ui/refresh-cw";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DiscoveredPlace {
  name: string;
  address: string;
  placeId: string;
  rating?: number;
  priceLevel?: number;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hey! I'm here to help you figure out what to eat :) \n\n• How are you feeling? (tired, adventurous, craving comfort...)\n• Who's eating? (solo, date, friends, family...)\n• Budget? (cheap eats, moderate, treat yourself)\n• Any dietary needs today?\n\nJust give me whatever details you have and I'll find the perfect spot!",
};

function AssistantMessage({ content }: { content: string }) {
  const iconRef = useRef<BotMessageSquareHandle>(null);

  return (
    <div className="flex justify-start items-end gap-2">
      <BotMessageSquareIcon
        ref={iconRef}
        size={24}
        className="text-purple-500 flex-shrink-0 mb-1"
      />
      <div
        className="max-w-[80%] lg:max-w-[60%] px-4 py-3 rounded-2xl bg-orange-50 border border-orange-100 cursor-default"
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

export default function PickerChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveredPlaces, setDiscoveredPlaces] = useState<DiscoveredPlace[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const refreshIconRef = useRef<RefreshCCWIconWIcon>(null);
  const { latitude, longitude } = useGeolocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);
    setDiscoveredPlaces([]);

    try {
      const apiMessages = newMessages.filter((_, i) => i !== 0);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please log in to use the AI Picker");
        }
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.message }]);

      if (data.discoveredPlaces && data.discoveredPlaces.length > 0) {
        setDiscoveredPlaces(data.discoveredPlaces);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
    setDiscoveredPlaces([]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [discoveredPlaces]);

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)] min-h-[500px] border-orange-100 bg-white/80 py-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
        <span className="font-medium">Chat with AI</span>
        <Button
          onClick={resetChat}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-orange-50 flex items-center gap-1.5"
          onMouseEnter={() => refreshIconRef.current?.startAnimation()}
          onMouseLeave={() => refreshIconRef.current?.stopAnimation()}
        >
          <RefreshCWIcon ref={refreshIconRef} size={16} />
          Start over
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) =>
          message.role === "user" ? (
            <div key={index} className="flex justify-end">
              <div className="max-w-[80%] lg:max-w-[60%] px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ) : (
            <AssistantMessage key={index} content={message.content} />
          )
        )}

        {isLoading && (
          <div className="flex justify-start items-end gap-2">
            <BotMessageSquareIcon size={24} className="text-purple-500 flex-shrink-0 mb-1" />
            <div className="bg-orange-50 border border-orange-100 px-4 py-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-orange-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Discovered Places */}
        {discoveredPlaces.length > 0 && (
          <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
            <p className="text-sm font-medium text-purple-800 flex items-center gap-2">
              <span>📍</span> Open now near you:
            </p>
            <div className="grid gap-3 lg:grid-cols-2">
              {discoveredPlaces.map((place) => (
                <div
                  key={place.placeId}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {place.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {place.address}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-green-600 font-medium">
                        ● Open
                      </span>
                      {place.rating && (
                        <span className="text-xs text-yellow-600">
                          ★ {place.rating.toFixed(1)}
                        </span>
                      )}
                      {place.priceLevel && (
                        <span className="text-xs text-muted-foreground">
                          {"$".repeat(place.priceLevel)}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/place/?q=place_id:${place.placeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:opacity-90 transition-opacity flex-shrink-0"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Search for these in the main page to save them!
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-orange-100 p-4 bg-gradient-to-r from-orange-50/30 to-amber-50/30">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-orange-200 rounded-full bg-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 rounded-full"
          >
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
}
