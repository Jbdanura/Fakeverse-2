"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Edit, Search, Settings } from "lucide-react"

interface LastMessage {
  id: number
  chatId: number,
  senderId: number,
  content:string,
  sentAt: string,
  senderUsername:string
}

interface ChatSidebarProps {
  lastMessages: LastMessage[]
  activeConversationId: number | null
  onSelectChat: (id: number) => void
  isMobileOpen: boolean
  className?: string
}

export function ChatSidebar({
  lastMessages,
  activeConversationId,
  onSelectChat,
  isMobileOpen,
  className,
}: ChatSidebarProps) {

  const cloudName = "dchytnqhl";
  
  return (
    <div
      className={cn(
        "flex flex-col bg-background",
        isMobileOpen ? "fixed inset-0 z-50 md:relative" : "hidden md:flex",
        className,
      )}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">Messages</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y">
          {lastMessages.map((conversation) => (
            <button
              key={conversation.chatId}
              className={cn(
                "w-full flex items-start gap-3 p-4 hover:bg-accent transition-colors text-left",
                activeConversationId === conversation.id && "bg-accent",
              )}
              onClick={() => onSelectChat(conversation.chatId)}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage key={`https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${conversation.senderUsername}.png`} src={`https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${conversation.senderUsername}.png`} alt={conversation.senderUsername} />
                  <AvatarFallback>{conversation.senderUsername.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium truncate">{conversation.senderUsername}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {conversation.sentAt.slice(0,10)}
                  </span>
                </div>

                <div className="flex justify-between items-start mt-1">
                  <span
                    className={cn(
                      "text-sm truncate",
                    )}
                  >
                    {conversation.senderUsername == localStorage.getItem("username") && "You: "}
                    {conversation.content.slice(0,10)} {conversation.content.length > 10 && "..."}
                  </span>

                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

