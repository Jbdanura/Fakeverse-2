"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatEmpty } from "@/components/chat/chat-empty";

interface ChatInterfaceProps {
  baseUrl: string;
}

interface LastMessage {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  sentAt: string;
  senderUsername: string;
  otherUsername: string
}

export function ChatInterface({ baseUrl }: ChatInterfaceProps) {
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [lastMessages, setLastMessages] = useState<LastMessage[]>([]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((open) => !open);
  };

  const handleChatSelect = (chatId: number) => {
    setActiveChat(chatId);
    setIsMobileSidebarOpen(false);
    };

  async function handleStartChat(username: string, message:string) {
   const token = localStorage.getItem("token");
    if (!token) return;
    try {
      if(message.length < 1) {
        alert("Message too short")
        return
      }
      if(message.length > 500) {
        alert("Message too long")
        return
      }
      const res = await fetch(`${baseUrl}/chats/chat`, {
        method: "POST",
        headers: {  
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({username,message})
      });
      if (res.ok) {
        const data = await res.json()
        window.location.reload()
      } else {
        alert("User doesn't exist"); 
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    let isMounted = true

    const loadLastMessages = async () => {
      try {
        const res = await fetch(`${baseUrl}/chats/userChats`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return

        const ids: { id: number }[] = await res.json()

        const fetchLast = async (chatId: number): Promise<LastMessage | null> => {
          const r2 = await fetch(`${baseUrl}/chats/chat/${chatId}/lastMessage`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!r2.ok) return null
          return (await r2.json()) as LastMessage
        }

        const messages = await Promise.all(ids.map((c) => fetchLast(c.id)))
        if (!isMounted) return

        const unique = Array.from(
          new Map(
            messages
              .filter((m): m is LastMessage => !!m)
              .map((m) => [m.chatId, m] as [number, LastMessage])
          ).values()
        )

        unique.sort(
          (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        )

        setLastMessages(unique)
      } catch (err) {
        console.error("Failed to load last messages", err)
      }
    }

    loadLastMessages()
    const interval = setInterval(loadLastMessages, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [baseUrl])

  const selectedLastMessage = lastMessages.find((m) => m.chatId === activeChat);

  return (
    <div className="flex h-full rounded-lg overflow-hidden border bg-background">
      <ChatSidebar
        lastMessages={lastMessages}
        activeChatId={activeChat}
        onSelectChat={handleChatSelect}
        isMobileOpen={isMobileSidebarOpen}
        className="w-full md:w-80 lg:w-96 border-r md:flex"
      />

      <div className="flex-1 flex flex-col">
        {selectedLastMessage ? (
          <ChatMessages
            baseUrl={baseUrl}
            chatId={selectedLastMessage.chatId}
            onOpenSidebar={toggleMobileSidebar}
          />
        ) : (
          <ChatEmpty
            onOpenSidebar={toggleMobileSidebar}
            onStartChat={handleStartChat}
          />
        )}
      </div>
    </div>
  );
}
