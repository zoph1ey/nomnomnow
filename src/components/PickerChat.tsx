"use client";

import { useState, useRef, useEffect } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";

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

export default function PickerChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveredPlaces, setDiscoveredPlaces] = useState<DiscoveredPlace[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    setDiscoveredPlaces([]); // Clear previous discoveries

    try {
      // Don't include the initial greeting in API calls
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

      // Handle discovered places
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

  // Scroll when discovered places appear
  useEffect(() => {
    scrollToBottom();
  }, [discoveredPlaces]);

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">AI Picker</h2>
        <button
          onClick={resetChat}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Start over
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
          <div className="space-y-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
            <p className="text-sm font-medium text-purple-800">
              Open now near you:
            </p>
            {discoveredPlaces.map((place) => (
              <div
                key={place.placeId}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {place.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
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
                      <span className="text-xs text-gray-500">
                        {"$".repeat(place.priceLevel)}
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${place.placeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 px-3 py-1.5 text-sm bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors flex-shrink-0"
                >
                  View
                </a>
              </div>
            ))}
            <p className="text-xs text-gray-500 text-center mt-2">
              Search for these in the main page to save them!
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
