"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, Info, Paperclip, Phone, Send, Smile, Video } from "lucide-react"
import Link from "next/link"


interface Message {
  chatId: number,
  id: number,
  content: string,
  sentAt: string,
  senderId: number,
  senderUsername: string
}

interface ChatMessagesProps {
  baseUrl: string,
  chatId: number,
  onOpenSidebar: () => void
}

export function ChatMessages({ baseUrl, chatId, onOpenSidebar }: ChatMessagesProps) {
  const [messageText, setMessageText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${baseUrl}/chats/chat/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load messages");
        return res.json();
      })
      .then((msgs: Message[]) => {
        setMessages(msgs);
        setTimeout(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop =
              scrollAreaRef.current.scrollHeight;
          }
        }, 0);
      })
      .catch(console.error);
  }, [baseUrl, chatId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [])
  const currentUser = localStorage.getItem("username");

  const handleSendMessage = async () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    // send to server
    const res = await fetch(`${baseUrl}/chats/chat/${chatId}/newMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messageContent: trimmed }),
    });
    if (!res.ok) {
      console.error("Failed to send message");
      return;
    }

    const raw: Omit<Message, "senderUsername"> = await res.json();

    const newMsg: Message = {
      ...raw,
      senderUsername: currentUser || "Unknown",
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessageText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

   return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenSidebar}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => {
            const sender = msg.senderUsername ?? "Unknown";
            const isOwn = sender === localStorage.getItem("username");
            const initial = sender.charAt(0).toUpperCase();
            const avatarUrl = msg.senderUsername
              ? `${baseUrl}/avatars/${msg.senderUsername}.png`
              : "/placeholder.svg";

            return (
              <div
                key={msg.id}
                className={`flex items-end ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {!isOwn && (
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={avatarUrl} alt={sender} />
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className="text-xs text-right mt-1">
                    {new Date(msg.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {isOwn && (
                  <Avatar className="h-8 w-8 ml-2">
                    <AvatarImage src={avatarUrl} alt={sender} />
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

