"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Edit, Search, Settings } from "lucide-react"

interface Conversation {
  id: number
  user: {
    id: number
    name: string
    username: string
    avatar: string
    isOnline: boolean
  }
  lastMessage: {
    text: string
    timestamp: string
    isRead: boolean
    isOwn: boolean
  }
  unreadCount: number
}

interface ChatSidebarProps {
  conversations: Conversation[]
  activeConversationId: number | null
  onSelectConversation: (id: number) => void
  isMobileOpen: boolean
  className?: string
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  isMobileOpen,
  className,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Edit className="h-5 w-5" />
            <span className="sr-only">New message</span>
          </Button>
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              className={cn(
                "w-full flex items-start gap-3 p-4 hover:bg-accent transition-colors text-left",
                activeConversationId === conversation.id && "bg-accent",
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                  <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {conversation.user.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium truncate">{conversation.user.name}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {conversation.lastMessage.timestamp}
                  </span>
                </div>

                <div className="flex justify-between items-start mt-1">
                  <span
                    className={cn(
                      "text-sm truncate",
                      conversation.lastMessage.isRead ? "text-muted-foreground" : "font-medium",
                    )}
                  >
                    {conversation.lastMessage.isOwn && "You: "}
                    {conversation.lastMessage.text}
                  </span>

                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 flex-shrink-0 rounded-full bg-primary w-5 h-5 flex items-center justify-center text-[10px] font-medium text-primary-foreground">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

