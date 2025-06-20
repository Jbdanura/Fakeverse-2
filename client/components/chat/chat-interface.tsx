"use client"

import { useState,useEffect } from "react"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatEmpty } from "@/components/chat/chat-empty"

interface ChatInterfaceProps {
  baseUrl: string;
}

interface LastMessage {
  id: number
  chatId: number,
  senderId: number,
  content:string,
  sentAt: string,
  senderUsername: string
}

export function ChatInterface({baseUrl} : ChatInterfaceProps) {
  const [activeChat, setActiveChat] = useState<number | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [lastMessages,setLastMessages] = useState<LastMessage[]>([])

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchLast = async (chatId: number): Promise<LastMessage | null> => {
      const res = await fetch(`${baseUrl}/chats/chat/${chatId}/lastMessage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return (await res.json()) as LastMessage;
    };

    (async () => {
      const res = await fetch(`${baseUrl}/chats/userChats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids: { id: number }[] = await res.json();

      const messages = await Promise.all(ids.map((c) => fetchLast(c.id)));

      const uniqueMessages = Array.from(
        new Map(
          messages
            .filter((m): m is LastMessage => !!m)
            .map((m) => [m.chatId, m] as [number, LastMessage])
        ).values()
      );
      uniqueMessages.sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      );
      setLastMessages(uniqueMessages);
    })();
  }, [baseUrl]);


  const handleChatSelect = (ChatId: number) => {
    setActiveChat(ChatId)
    setIsMobileSidebarOpen(false)
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const selectedChatId = lastMessages.find((conv) => conv.chatId === activeChat)?.chatId;

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
        {selectedChatId ? (
          <ChatMessages baseUrl={baseUrl} chatId={selectedChatId} onOpenSidebar={toggleMobileSidebar} />
        ) : (
          <ChatEmpty onOpenSidebar={toggleMobileSidebar} />
        )}
      </div>
    </div>
  )
}

